import fetch from 'node-fetch';
import { setTimeout as delay } from 'node:timers/promises';

export class DiamondKastClient {
    constructor(options = {}, deps = {}) {
        this.baseUrl = options.baseUrl ?? process.env.DIAMONDKAST_BASE_URL ?? 'https://api.diamondkast.com';
        this.credentials = {
            username: options.username ?? process.env.DIAMONDKAST_USERNAME ?? '',
            password: options.password ?? process.env.DIAMONDKAST_PASSWORD ?? ''
        };
        this.defaultPollInterval = options.pollIntervalMs ?? 5000;
        const rateLimitPerMinute = options.rateLimitPerMinute ?? Number(process.env.DIAMONDKAST_RATE_LIMIT ?? '60');
        this.minIntervalMs = Math.ceil(60000 / Math.max(rateLimitPerMinute, 1));
        const logger = deps.logger ?? {};
        this.logger = {
            debug: typeof logger.debug === 'function' ? logger.debug.bind(logger) : () => {},
            warn: typeof logger.warn === 'function' ? logger.warn.bind(logger) : console.warn,
            error: typeof logger.error === 'function' ? logger.error.bind(logger) : console.error
        };
        this.sessionCookie = null;
        this.lastRequestAt = 0;
    }

    async *streamAtBats(gameId, options = {}) {
        const seen = new Set();
        const pollInterval = options.pollIntervalMs ?? this.defaultPollInterval;
        const { signal } = options;
        while (!signal?.aborted) {
            try {
                const response = await this.fetchJson(`/games/${gameId}/at-bats`, { method: 'GET' }, signal);
                const atBats = Array.isArray(response?.atBats) ? response.atBats : [];
                for (const rawAtBat of atBats) {
                    const normalized = this.mapAtBat(rawAtBat ?? {});
                    if (!normalized) {
                        continue;
                    }
                    if (seen.has(normalized.id)) {
                        continue;
                    }
                    seen.add(normalized.id);
                    yield normalized;
                }
            } catch (error) {
                if (signal?.aborted) {
                    break;
                }
                this.logger.warn?.('DiamondKast polling failed, retrying', error, { gameId });
            }
            await delay(pollInterval, undefined, { signal }).catch(() => undefined);
        }
    }

    async authenticate() {
        if (this.sessionCookie) {
            return;
        }
        const credentials = new URLSearchParams({
            username: this.credentials.username,
            password: this.credentials.password
        });
        const response = await fetch(`${this.baseUrl}/sessions`, {
            method: 'POST',
            body: credentials,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        if (!response.ok) {
            throw new Error(`DiamondKast authentication failed with status ${response.status}`);
        }
        const setCookie = response.headers.get('set-cookie');
        if (!setCookie) {
            throw new Error('DiamondKast authentication did not return a session cookie');
        }
        const session = setCookie.split(';')[0];
        this.sessionCookie = session;
        this.logger.debug?.('DiamondKast session established');
    }

    async fetchJson(path, init = {}, signal) {
        await this.authenticate();
        await this.enforceRateLimit();
        const response = await fetch(`${this.baseUrl}${path}`, {
            ...init,
            headers: {
                Accept: 'application/json',
                ...(init.headers ?? {}),
                Cookie: this.sessionCookie ?? ''
            },
            signal
        });
        if (response.status === 401) {
            this.logger.warn?.('DiamondKast session expired; re-authenticating');
            this.sessionCookie = null;
            await this.authenticate();
            return this.fetchJson(path, init, signal);
        }
        if (!response.ok) {
            throw new Error(`DiamondKast request failed with status ${response.status}`);
        }
        this.lastRequestAt = Date.now();
        return response.json();
    }

    async enforceRateLimit() {
        const now = Date.now();
        const elapsed = now - this.lastRequestAt;
        if (elapsed < this.minIntervalMs) {
            const waitMs = this.minIntervalMs - elapsed;
            await delay(waitMs).catch(() => undefined);
        }
    }

    mapAtBat(raw) {
        if (!raw) {
            return null;
        }
        const id = String(raw.id ?? raw.atBatId ?? raw.sequence ?? Math.random().toString(36).slice(2));
        const batter = raw.batter ?? raw.hitter ?? {};
        const pitcher = raw.pitcher ?? {};
        const count = raw.count ?? {};
        const result = raw.result ?? {};
        const metrics = raw.metrics ?? raw.pitch ?? {};
        return {
            id,
            batter: {
                name: String(batter.name ?? batter.fullName ?? 'Unknown Batter'),
                id: batter.id ? String(batter.id) : undefined,
                handedness: batter.handedness ? String(batter.handedness) : undefined
            },
            pitcher: {
                name: String(pitcher.name ?? pitcher.fullName ?? 'Unknown Pitcher'),
                id: pitcher.id ? String(pitcher.id) : undefined,
                handedness: pitcher.handedness ? String(pitcher.handedness) : undefined
            },
            result: {
                description: String(result.description ?? result.text ?? raw.description ?? 'At-bat in progress'),
                outcome: result.outcome ? String(result.outcome) : undefined,
                rbi: typeof result.rbi === 'number' ? result.rbi : undefined
            },
            count: {
                balls: Number(count.balls ?? 0),
                strikes: Number(count.strikes ?? 0),
                outs: Number(count.outs ?? raw.outs ?? 0)
            },
            runners: Array.isArray(raw.runners)
                ? raw.runners.map((runner) => ({
                      base: String(runner.base ?? runner.endingBase ?? 'unknown'),
                      playerId: runner.playerId ? String(runner.playerId) : undefined,
                      result: runner.result ? String(runner.result) : undefined
                  }))
                : undefined,
            pitchMetrics: {
                velocity: typeof metrics.velocity === 'number' ? metrics.velocity : undefined,
                spinRate: typeof metrics.spinRate === 'number' ? metrics.spinRate : undefined,
                pitchType: metrics.pitchType ? String(metrics.pitchType) : undefined
            },
            updatedAt: new Date(String(raw.updatedAt ?? raw.timestamp ?? Date.now())).toISOString(),
            raw
        };
    }
}

export default DiamondKastClient;
