import fetch from 'node-fetch';
import { load, type CheerioAPI } from 'cheerio';
import { setTimeout as delay } from 'node:timers/promises';

export interface NCAABOXScoreScraperOptions {
    userAgent?: string;
    maxRetries?: number;
    retryDelayMs?: number;
    baseUrl?: string;
}

export interface ScrapeOptions {
    signal?: AbortSignal;
}

export interface BoxscoreTeamLine {
    name: string;
    runs: number | null;
    hits: number | null;
    errors: number | null;
}

export interface BoxscoreResult {
    gameId: string | null;
    status: string;
    teams: BoxscoreTeamLine[];
    linescore?: Array<{ inning: string; home: number | null; away: number | null }>;
    lastUpdated: string;
    source: string;
}

export class NCAABOXScoreScraper {
    private readonly userAgent: string;
    private readonly maxRetries: number;
    private readonly retryDelayMs: number;
    private readonly baseUrl: string;
    private robotsCache: { fetchedAt: number; directives: string[] } | null = null;
    private readonly logger: { debug: (...args: unknown[]) => void; warn: (...args: unknown[]) => void; error: (...args: unknown[]) => void };

    constructor(options: NCAABOXScoreScraperOptions = {}, deps: { logger?: Partial<NCAABOXScoreScraper['logger']> } = {}) {
        this.userAgent = options.userAgent ?? 'BlazeSportsIntel/1.0 (+https://blazesportsintel.com)';
        this.maxRetries = options.maxRetries ?? 3;
        this.retryDelayMs = options.retryDelayMs ?? 1500;
        this.baseUrl = options.baseUrl ?? 'https://stats.ncaa.org';
        this.logger = {
            debug: deps.logger?.debug?.bind(deps.logger) ?? (() => {}),
            warn: deps.logger?.warn?.bind(deps.logger) ?? console.warn,
            error: deps.logger?.error?.bind(deps.logger) ?? console.error
        };
    }

    async scrapeBoxscore(gameUrl: string, options: ScrapeOptions = {}): Promise<BoxscoreResult> {
        await this.ensureRobotsCompliance(gameUrl, options.signal);

        return this.retry(async (attempt) => {
            this.logger.debug?.('Scraping NCAA boxscore', { gameUrl, attempt });
            const html = await this.fetchHtml(gameUrl, options.signal);
            return this.parseBoxscore(html, gameUrl);
        }, options.signal);
    }

    private async fetchHtml(url: string, signal?: AbortSignal): Promise<string> {
        const response = await fetch(url, {
            headers: {
                'User-Agent': this.userAgent,
                Accept: 'text/html,application/xhtml+xml'
            },
            signal
        });

        if (!response.ok) {
            throw new Error(`Failed to load boxscore HTML: ${response.status}`);
        }

        return response.text();
    }

    private parseBoxscore(html: string, url: string): BoxscoreResult {
        const $ = load(html);
        const gameId = this.extractGameId(url, $);
        const status =
            $('meta[property="og:description"]').attr('content')?.trim() ||
            $('[data-game-status]').attr('data-game-status')?.trim() ||
            $('.game-status, .GameInfo__Status').first().text().trim() ||
            $('title').text().trim() ||
            'Status unavailable';

        const teams: BoxscoreTeamLine[] = [];
        const linescore: Array<{ inning: string; home: number | null; away: number | null }> = [];

        const candidateTables = $('table').filter((_, table) => {
            const header = $(table)
                .find('thead th, tbody tr').first()
                .text()
                .toLowerCase();
            return header.includes('r') && header.includes('h');
        });

        const linescoreTable = candidateTables.first();
        if (linescoreTable.length > 0) {
            linescoreTable.find('tbody tr').each((index, row) => {
                const cells = $(row).find('td, th');
                if (cells.length < 4) {
                    return;
                }
                const name = $(cells[0]).text().trim();
                const runs = this.toNumber($(cells[cells.length - 3]).text());
                const hits = this.toNumber($(cells[cells.length - 2]).text());
                const errors = this.toNumber($(cells[cells.length - 1]).text());
                teams.push({ name, runs, hits, errors });
            });

            const headerCells = linescoreTable.find('thead th').slice(1, -3);
            headerCells.each((index, headerCell) => {
                const inning = $(headerCell).text().trim();
                const awayRow = linescoreTable.find('tbody tr').eq(0).find('td, th').slice(1);
                const homeRow = linescoreTable.find('tbody tr').eq(1).find('td, th').slice(1);
                const awayValue = this.toNumber($(awayRow[index]).text());
                const homeValue = this.toNumber($(homeRow[index]).text());
                linescore.push({ inning, away: awayValue, home: homeValue });
            });
        }

        if (teams.length === 0) {
            $('.team, .TeamScore__Team').each((_, element) => {
                const name = $(element).find('.name, .TeamScore__Name').text().trim();
                const runs = this.toNumber(
                    $(element)
                        .find('.score, .TeamScore__Score')
                        .first()
                        .text()
                );
                if (name) {
                    teams.push({ name, runs, hits: null, errors: null });
                }
            });
        }

        return {
            gameId,
            status,
            teams,
            linescore: linescore.length > 0 ? linescore : undefined,
            lastUpdated: new Date().toISOString(),
            source: url
        };
    }

    private extractGameId(url: string, $: CheerioAPI): string | null {
        const urlMatch = url.match(/game_id=(\d+)/i) ?? url.match(/games\/(\d+)/i);
        if (urlMatch) {
            return urlMatch[1];
        }

        const script = $('script').filter((_, element) => $(element).html()?.includes('gameId')).first().html();
        const scriptMatch = script?.match(/gameId\s*[:=]\s*"?(\d+)"?/i);
        if (scriptMatch) {
            return scriptMatch[1];
        }

        return null;
    }

    private toNumber(value: string | undefined): number | null {
        if (!value) {
            return null;
        }
        const parsed = Number(value.replace(/[^0-9.-]/g, ''));
        return Number.isFinite(parsed) ? parsed : null;
    }

    private async ensureRobotsCompliance(url: string, signal?: AbortSignal): Promise<void> {
        const directives = await this.getRobotsDirectives(signal);
        const path = new URL(url, this.baseUrl).pathname;

        const disallowed = directives.some((directive) => {
            if (!directive.startsWith('disallow:')) {
                return false;
            }
            const rule = directive.replace('disallow:', '').trim();
            return rule && path.startsWith(rule);
        });

        if (disallowed) {
            throw new Error(`Scraping disallowed by robots.txt for path ${path}`);
        }
    }

    private async getRobotsDirectives(signal?: AbortSignal): Promise<string[]> {
        const cacheDurationMs = 6 * 60 * 60 * 1000;
        if (this.robotsCache && Date.now() - this.robotsCache.fetchedAt < cacheDurationMs) {
            return this.robotsCache.directives;
        }

        const response = await fetch(`${this.baseUrl}/robots.txt`, { signal });
        if (!response.ok) {
            this.logger.warn?.('Failed to load robots.txt; assuming default allow');
            this.robotsCache = { fetchedAt: Date.now(), directives: [] };
            return this.robotsCache.directives;
        }

        const text = await response.text();
        const directives = text
            .split('\n')
            .map((line) => line.trim().toLowerCase())
            .filter(Boolean);

        this.robotsCache = { fetchedAt: Date.now(), directives };
        return directives;
    }

    private async retry<T>(fn: (attempt: number) => Promise<T>, signal?: AbortSignal): Promise<T> {
        let attempt = 0;
        let lastError: unknown;

        while (attempt < this.maxRetries && !signal?.aborted) {
            attempt += 1;
            try {
                return await fn(attempt);
            } catch (error) {
                lastError = error;
                this.logger.warn?.('NCAA boxscore scrape attempt failed', error, { attempt });
                if (attempt >= this.maxRetries) {
                    break;
                }
                await delay(this.retryDelayMs * attempt, undefined, { signal }).catch(() => undefined);
            }
        }

        throw lastError instanceof Error ? lastError : new Error('Boxscore scrape failed');
    }
}

export default NCAABOXScoreScraper;
