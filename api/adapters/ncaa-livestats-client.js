import net from 'node:net';
import { EventEmitter } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';
import { XMLParser } from 'fast-xml-parser';

export class NCAALiveStatsClient extends EventEmitter {
    constructor(options = {}, deps = {}) {
        super();
        this.host = options.host ?? process.env.LIVESTATS_HOST ?? '127.0.0.1';
        this.port = options.port ?? Number(process.env.LIVESTATS_PORT ?? '7677');
        this.parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '',
            trimValues: true,
            parseTagValue: true
        });
        this.reconnectConfig = {
            minDelayMs: options.reconnect?.minDelayMs ?? 1000,
            maxDelayMs: options.reconnect?.maxDelayMs ?? 30000,
            backoffFactor: options.reconnect?.backoffFactor ?? 2
        };
        const logger = deps.logger ?? {};
        this.logger = {
            debug: typeof logger.debug === 'function' ? logger.debug.bind(logger) : () => {},
            warn: typeof logger.warn === 'function' ? logger.warn.bind(logger) : console.warn,
            error: typeof logger.error === 'function' ? logger.error.bind(logger) : console.error
        };
        this.socket = null;
        this.buffer = '';
        this.isClosing = false;
        this.reconnectAttempts = 0;
        this.eventQueue = [];
        this.waiters = [];
        this.defaultHeartbeatInterval = Number(process.env.LIVESTATS_HEARTBEAT_INTERVAL ?? 30000);
    }

    async *streamGame(gameId, options = {}) {
        const { signal, heartbeatIntervalMs = this.defaultHeartbeatInterval } = options;
        await this.ensureConnection();
        this.subscribe(gameId);
        const heartbeat = heartbeatIntervalMs > 0 ? this.startHeartbeat(heartbeatIntervalMs) : null;
        try {
            while (!signal?.aborted) {
                const event = await this.nextEvent(signal);
                if (!event) {
                    if (signal?.aborted) {
                        break;
                    }
                    continue;
                }
                yield event;
            }
        } finally {
            if (heartbeat) {
                heartbeat.abort();
            }
        }
    }

    async close() {
        this.isClosing = true;
        if (this.socket) {
            await new Promise((resolve) => {
                this.socket?.end(() => resolve());
                setTimeout(resolve, 250);
            });
        }
        this.socket = null;
        this.buffer = '';
    }

    async ensureConnection() {
        if (this.socket && !this.socket.destroyed) {
            return;
        }
        await new Promise((resolve, reject) => {
            const socket = net.createConnection({ host: this.host, port: this.port }, () => {
                this.logger.debug?.('Connected to NCAA LiveStats feed', { host: this.host, port: this.port });
                this.reconnectAttempts = 0;
                this.socket = socket;
                resolve();
            });
            socket.setKeepAlive(true);
            socket.setEncoding('utf8');
            socket.on('data', (chunk) => this.onData(chunk));
            socket.on('error', (error) => {
                this.logger.error?.('NCAA LiveStats socket error', error);
                socket.destroy(error);
                reject(error);
            });
            socket.on('close', () => this.handleDisconnect());
        });
    }

    subscribe(gameId) {
        if (!this.socket) {
            throw new Error('Socket not initialized');
        }
        const payload = JSON.stringify({ action: 'subscribe', gameId });
        this.socket.write(`${payload}\n`);
    }

    startHeartbeat(interval) {
        const controller = new AbortController();
        const loop = async () => {
            while (!controller.signal.aborted && this.socket && !this.socket.destroyed) {
                await delay(interval, undefined, { signal: controller.signal }).catch(() => undefined);
                if (controller.signal.aborted || !this.socket || this.socket.destroyed) {
                    return;
                }
                try {
                    this.socket.write('\n');
                } catch (error) {
                    this.logger.warn?.('Failed to send heartbeat to NCAA LiveStats feed', error);
                }
            }
        };
        loop();
        return controller;
    }

    async nextEvent(signal) {
        if (this.eventQueue.length > 0) {
            return this.eventQueue.shift() ?? null;
        }
        if (signal?.aborted) {
            return null;
        }
        return new Promise((resolve) => {
            const onAbort = () => {
                signal?.removeEventListener('abort', onAbort);
                resolve(null);
            };
            if (signal) {
                signal.addEventListener('abort', onAbort);
            }
            this.waiters.push((value) => {
                signal?.removeEventListener('abort', onAbort);
                if (value) {
                    resolve(value);
                } else if (signal?.aborted) {
                    resolve(null);
                } else {
                    resolve(null);
                }
            });
        });
    }

    onData(chunk) {
        const data = typeof chunk === 'string' ? chunk : chunk.toString('utf8');
        this.buffer += data;
        let newlineIndex = this.buffer.indexOf('\n');
        while (newlineIndex !== -1) {
            const rawMessage = this.buffer.slice(0, newlineIndex).trim();
            this.buffer = this.buffer.slice(newlineIndex + 1);
            if (rawMessage.length > 0) {
                this.processMessage(rawMessage);
            }
            newlineIndex = this.buffer.indexOf('\n');
        }
    }

    processMessage(rawMessage) {
        try {
            const event = this.parsePayload(rawMessage);
            const parsedEvent = {
                type: event.type,
                payload: event.payload,
                raw: rawMessage,
                receivedAt: new Date().toISOString()
            };
            this.pushEvent(parsedEvent);
        } catch (error) {
            this.logger.warn?.('Failed to parse NCAA LiveStats payload', error, { rawMessage });
        }
    }

    parsePayload(rawMessage) {
        if (!rawMessage) {
            throw new Error('Empty payload');
        }
        const trimmed = rawMessage.trim();
        if (trimmed.startsWith('<')) {
            const parsed = this.parser.parse(trimmed);
            const type = Object.keys(parsed)[0] ?? 'xml';
            return { type, payload: parsed[type] ?? parsed };
        }
        try {
            const parsed = JSON.parse(trimmed);
            return { type: parsed.type ?? 'json', payload: parsed };
        } catch (jsonError) {
            throw new Error(`Unsupported payload format: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`);
        }
    }

    pushEvent(event) {
        if (this.waiters.length > 0) {
            const next = this.waiters.shift();
            next?.(event);
        } else {
            this.eventQueue.push(event);
        }
        this.emit('event', event);
    }

    async handleDisconnect() {
        if (this.isClosing) {
            return;
        }
        this.socket = null;
        this.logger.warn?.('NCAA LiveStats feed disconnected; attempting to reconnect');
        await this.reconnectWithBackoff();
    }

    async reconnectWithBackoff() {
        while (!this.isClosing) {
            const delayMs = Math.min(
                this.reconnectConfig.minDelayMs * Math.pow(this.reconnectConfig.backoffFactor, this.reconnectAttempts),
                this.reconnectConfig.maxDelayMs
            );
            await delay(delayMs).catch(() => undefined);
            try {
                await this.ensureConnection();
                return;
            } catch (error) {
                this.reconnectAttempts += 1;
                this.logger.warn?.('Reconnect attempt failed for NCAA LiveStats feed', error, { attempt: this.reconnectAttempts });
            }
        }
    }
}

export default NCAALiveStatsClient;
