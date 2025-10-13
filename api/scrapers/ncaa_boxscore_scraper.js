import fetch from 'node-fetch';
import { load } from 'cheerio';
import { setTimeout as delay } from 'node:timers/promises';

export class NCAABOXScoreScraper {
    constructor(options = {}, deps = {}) {
        this.userAgent = options.userAgent ?? 'BlazeSportsIntel/1.0 (+https://blazesportsintel.com)';
        this.maxRetries = options.maxRetries ?? 3;
        this.retryDelayMs = options.retryDelayMs ?? 1500;
        this.baseUrl = options.baseUrl ?? 'https://stats.ncaa.org';
        const logger = deps.logger ?? {};
        this.logger = {
            debug: typeof logger.debug === 'function' ? logger.debug.bind(logger) : () => {},
            warn: typeof logger.warn === 'function' ? logger.warn.bind(logger) : console.warn,
            error: typeof logger.error === 'function' ? logger.error.bind(logger) : console.error
        };
        this.robotsCache = null;
    }

    async scrapeBoxscore(gameUrl, options = {}) {
        await this.ensureRobotsCompliance(gameUrl, options.signal);
        return this.retry(async (attempt) => {
            this.logger.debug?.('Scraping NCAA boxscore', { gameUrl, attempt });
            const html = await this.fetchHtml(gameUrl, options.signal);
            return this.parseBoxscore(html, gameUrl);
        }, options.signal);
    }

    async fetchHtml(url, signal) {
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

    parseBoxscore(html, url) {
        const $ = load(html);
        const gameId = this.extractGameId(url, $);
        const status =
            $('meta[property="og:description"]').attr('content')?.trim() ||
            $('[data-game-status]').attr('data-game-status')?.trim() ||
            $('.game-status, .GameInfo__Status').first().text().trim() ||
            $('title').text().trim() ||
            'Status unavailable';
        const teams = [];
        const linescore = [];
        const candidateTables = $('table').filter((_, table) => {
            const header = $(table)
                .find('thead th, tbody tr')
                .first()
                .text()
                .toLowerCase();
            return header.includes('r') && header.includes('h');
        });
        const linescoreTable = candidateTables.first();
        if (linescoreTable.length > 0) {
            linescoreTable.find('tbody tr').each((_, row) => {
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

    extractGameId(url, $) {
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

    toNumber(value) {
        if (!value) {
            return null;
        }
        const parsed = Number(String(value).replace(/[^0-9.-]/g, ''));
        return Number.isFinite(parsed) ? parsed : null;
    }

    async ensureRobotsCompliance(url, signal) {
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

    async getRobotsDirectives(signal) {
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

    async retry(fn, signal) {
        let attempt = 0;
        let lastError;
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
