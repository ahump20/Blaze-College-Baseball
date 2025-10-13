import net from 'node:net';
import { EventEmitter } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';
import { XMLParser } from 'fast-xml-parser';

export interface NCAALiveStatsClientOptions {
    host?: string;
    port?: number;
    reconnect?: {
        minDelayMs?: number;
        maxDelayMs?: number;
        backoffFactor?: number;
    };
}

export interface LiveStatsEvent<T = unknown> {
    type: string;
    payload: T;
    raw: string;
    receivedAt: string;
}

export interface StreamOptions {
    signal?: AbortSignal;
    heartbeatIntervalMs?: number;
}

export class NCAALiveStatsClient extends EventEmitter {
    private readonly host: string;
    private readonly port: number;
    private readonly reconnectConfig: Required<NCAALiveStatsClientOptions['reconnect']>;
    private readonly logger: { debug: (...args: unknown[]) => void; warn: (...args: unknown[]) => void; error: (...args: unknown[]) => void };
    private readonly defaultHeartbeatInterval: number;
    private socket: net.Socket | null = null;
    private buffer = '';
    private isClosing = false;
    private reconnectAttempts = 0;
    private readonly parser: XMLParser;
    private readonly eventQueue: LiveStatsEvent[] = [];
    private readonly waiters: ((value: LiveStatsEvent | null) => void)[] = [];

    constructor(options: NCAALiveStatsClientOptions = {}, deps: { logger?: Partial<NCAALiveStatsClient['logger']> } = {}) {
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
        this.defaultHeartbeatInterval = Number(process.env.LIVESTATS_HEARTBEAT_INTERVAL ?? 30000);

        this.logger = {
            debug: deps.logger?.debug?.bind(deps.logger) ?? (() => {}),
            warn: deps.logger?.warn?.bind(deps.logger) ?? console.warn,
            error: deps.logger?.error?.bind(deps.logger) ?? console.error
        };
    }

    async *streamGame(gameId: string, options: StreamOptions = {}): AsyncGenerator<LiveStatsEvent> {
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

    async close(): Promise<void> {
        this.isClosing = true;
        if (this.socket) {
            await new Promise<void>((resolve) => {
                this.socket?.end(() => resolve());
                setTimeout(resolve, 250);
            });
        }
        this.socket = null;
        this.buffer = '';
    }

    private async ensureConnection(): Promise<void> {
        if (this.socket && !this.socket.destroyed) {
            return;
        }

        await new Promise<void>((resolve, reject) => {
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
                socket.destroy(error as Error);
                reject(error);
            });
            socket.on('close', () => this.handleDisconnect());
        });
    }

    private subscribe(gameId: string) {
        if (!this.socket) {
            throw new Error('Socket not initialized');
        }

        const payload = JSON.stringify({ action: 'subscribe', gameId });
        this.socket.write(`${payload}\n`);
    }

    private startHeartbeat(interval: number) {
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

    private async nextEvent(signal?: AbortSignal): Promise<LiveStatsEvent | null> {
        if (this.eventQueue.length > 0) {
            return this.eventQueue.shift() ?? null;
        }

        if (signal?.aborted) {
            return null;
        }

        return new Promise<LiveStatsEvent | null>((resolve, reject) => {
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

    private onData(chunk: Buffer | string) {
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

    private processMessage(rawMessage: string) {
        try {
            const event = this.parsePayload(rawMessage);
            const parsedEvent: LiveStatsEvent = {
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

    private parsePayload(rawMessage: string): { type: string; payload: unknown } {
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

    private pushEvent(event: LiveStatsEvent) {
        if (this.waiters.length > 0) {
            const next = this.waiters.shift();
            next?.(event);
        } else {
            this.eventQueue.push(event);
        }
        this.emit('event', event);
    }

    private async handleDisconnect() {
        if (this.isClosing) {
            return;
        }

        this.socket = null;
        this.logger.warn?.('NCAA LiveStats feed disconnected; attempting to reconnect');
        await this.reconnectWithBackoff();
    }

    private async reconnectWithBackoff() {
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
