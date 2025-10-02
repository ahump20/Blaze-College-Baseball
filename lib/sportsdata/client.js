/**
 * SportsDataIO API Client
 * Handles authentication, retry logic, error handling, and caching
 */

const API_BASE = 'https://api.sportsdata.io/v3';
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

/**
 * Exponential backoff with jitter
 */
function getBackoffDelay(retryCount) {
    const baseDelay = INITIAL_BACKOFF_MS * Math.pow(2, retryCount);
    const jitter = Math.random() * 0.3 * baseDelay; // 30% jitter
    return Math.min(baseDelay + jitter, 30000); // Max 30 seconds
}

/**
 * Make API request with retry logic
 */
async function fetchWithRetry(url, options = {}, retryCount = 0) {
    const startTime = Date.now();

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'BlazeSportsIntel/1.0',
                ...options.headers
            }
        });

        const duration = Date.now() - startTime;

        // Success
        if (response.ok) {
            const data = await response.json();
            return {
                success: true,
                data,
                duration,
                retries: retryCount
            };
        }

        // Rate limit - retry after delay
        if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After');
            const delay = retryAfter ? parseInt(retryAfter) * 1000 : getBackoffDelay(retryCount);

            if (retryCount < MAX_RETRIES) {
                console.warn(`Rate limited. Retrying after ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return fetchWithRetry(url, options, retryCount + 1);
            }
        }

        // Server errors (5xx) - retry
        if (response.status >= 500 && retryCount < MAX_RETRIES) {
            const delay = getBackoffDelay(retryCount);
            console.warn(`Server error ${response.status}. Retrying after ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry(url, options, retryCount + 1);
        }

        // Client errors (4xx) - don't retry
        const errorText = await response.text();
        return {
            success: false,
            error: `HTTP ${response.status}: ${errorText}`,
            status: response.status,
            duration,
            retries: retryCount
        };

    } catch (error) {
        const duration = Date.now() - startTime;

        // Network errors - retry
        if (retryCount < MAX_RETRIES) {
            const delay = getBackoffDelay(retryCount);
            console.warn(`Network error: ${error.message}. Retrying after ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry(url, options, retryCount + 1);
        }

        return {
            success: false,
            error: error.message,
            duration,
            retries: retryCount
        };
    }
}

/**
 * Build API URL with authentication
 */
function buildUrl(sport, endpoint, params = {}) {
    const sportPath = sport.toLowerCase();
    const url = new URL(`${API_BASE}/${sportPath}${endpoint}`);

    // Add all params
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            url.searchParams.set(key, value);
        }
    });

    return url.toString();
}

/**
 * Main API client class
 */
export class SportsDataIOClient {
    constructor(apiKey, env) {
        this.apiKey = apiKey;
        this.env = env; // Cloudflare env (for KV, D1)
    }

    /**
     * Check cache first, then fetch from API
     */
    async fetchWithCache(cacheKey, fetcher, ttlSeconds = 300) {
        // Try cache first
        if (this.env.CACHE) {
            const cached = await this.env.CACHE.get(cacheKey, 'json');
            if (cached && cached.expires > Date.now()) {
                console.log(`Cache HIT: ${cacheKey}`);
                return {
                    success: true,
                    data: cached.data,
                    cached: true,
                    cacheAge: Math.floor((Date.now() - cached.created) / 1000)
                };
            }
        }

        console.log(`Cache MISS: ${cacheKey}`);

        // Fetch from API
        const result = await fetcher();

        // Cache successful results
        if (result.success && this.env.CACHE) {
            const cacheData = {
                data: result.data,
                created: Date.now(),
                expires: Date.now() + (ttlSeconds * 1000)
            };
            await this.env.CACHE.put(cacheKey, JSON.stringify(cacheData), {
                expirationTtl: ttlSeconds
            });
        }

        return result;
    }

    /**
     * Generic GET request
     */
    async get(sport, endpoint, params = {}, cacheTTL = 300) {
        const url = buildUrl(sport, endpoint, { ...params, key: this.apiKey });
        const cacheKey = `sportsdata:${sport}:${endpoint}:${JSON.stringify(params)}`;

        return this.fetchWithCache(
            cacheKey,
            () => fetchWithRetry(url),
            cacheTTL
        );
    }

    // ===========================================
    // NFL ENDPOINTS
    // ===========================================

    async getNFLStandings(season) {
        return this.get('nfl', `/scores/json/Standings/${season}`, {}, 300);
    }

    async getNFLTeams() {
        return this.get('nfl', '/scores/json/Teams', {}, 86400); // 24 hours
    }

    async getNFLPlayers(teamId = null) {
        const endpoint = teamId
            ? `/scores/json/Players/${teamId}`
            : '/scores/json/Players';
        return this.get('nfl', endpoint, {}, 3600);
    }

    async getNFLDepthCharts() {
        return this.get('nfl', '/scores/json/DepthCharts', {}, 1800);
    }

    async getNFLTeamSeasonStats(season) {
        return this.get('nfl', `/stats/json/TeamSeasonStats/${season}`, {}, 300);
    }

    async getNFLPlayerSeasonStats(season) {
        return this.get('nfl', `/stats/json/PlayerSeasonStats/${season}`, {}, 300);
    }

    async getNFLTeamGameStats(season, week) {
        return this.get('nfl', `/stats/json/TeamGameStats/${season}/${week}`, {}, 180);
    }

    async getNFLPlayerGameStats(season, week) {
        return this.get('nfl', `/stats/json/PlayerGameStatsByWeek/${season}/${week}`, {}, 180);
    }

    async getNFLGames(season) {
        return this.get('nfl', `/scores/json/Games/${season}`, {}, 300);
    }

    // ===========================================
    // MLB ENDPOINTS
    // ===========================================

    async getMLBStandings(season) {
        return this.get('mlb', `/scores/json/Standings/${season}`, {}, 300);
    }

    async getMLBTeams() {
        return this.get('mlb', '/scores/json/Teams', {}, 86400);
    }

    async getMLBPlayers(teamId = null) {
        const endpoint = teamId
            ? `/scores/json/Players/${teamId}`
            : '/scores/json/Players';
        return this.get('mlb', endpoint, {}, 3600);
    }

    async getMLBDepthCharts() {
        return this.get('mlb', '/scores/json/DepthCharts', {}, 1800);
    }

    async getMLBTeamSeasonStats(season) {
        return this.get('mlb', `/stats/json/TeamSeasonStats/${season}`, {}, 300);
    }

    async getMLBPlayerSeasonStats(season) {
        return this.get('mlb', `/stats/json/PlayerSeasonStats/${season}`, {}, 300);
    }

    async getMLBTeamGameStatsByDate(date) {
        return this.get('mlb', `/stats/json/TeamGameStatsByDate/${date}`, {}, 180);
    }

    async getMLBPlayerGameStatsByDate(date) {
        return this.get('mlb', `/stats/json/PlayerGameStatsByDate/${date}`, {}, 180);
    }

    async getMLBGames(season) {
        return this.get('mlb', `/scores/json/Games/${season}`, {}, 300);
    }

    // ===========================================
    // CFB (College Football) ENDPOINTS
    // ===========================================

    async getCFBTeams() {
        return this.get('cfb', '/scores/json/Teams', {}, 86400);
    }

    async getCFBStandings(season) {
        return this.get('cfb', `/scores/json/Standings/${season}`, {}, 300);
    }

    async getCFBTeamSeasonStats(season) {
        return this.get('cfb', `/stats/json/TeamSeasonStats/${season}`, {}, 300);
    }

    async getCFBPlayerSeasonStats(season) {
        return this.get('cfb', `/stats/json/PlayerSeasonStats/${season}`, {}, 300);
    }

    async getCFBTeamGameStats(season, week) {
        return this.get('cfb', `/stats/json/TeamGameStats/${season}/${week}`, {}, 180);
    }

    async getCFBPlayerGameStats(season, week) {
        return this.get('cfb', `/stats/json/PlayerGameStatsByWeek/${season}/${week}`, {}, 180);
    }

    async getCFBDepthCharts() {
        return this.get('cfb', '/scores/json/DepthCharts', {}, 1800);
    }

    async getCFBGames(season) {
        return this.get('cfb', `/scores/json/Games/${season}`, {}, 300);
    }

    // ===========================================
    // CBB (College Basketball) ENDPOINTS
    // ===========================================

    async getCBBTeams() {
        return this.get('cbb', '/scores/json/Teams', {}, 86400);
    }

    async getCBBStandings(season) {
        return this.get('cbb', `/scores/json/Standings/${season}`, {}, 300);
    }

    async getCBBRankings(season) {
        return this.get('cbb', `/scores/json/Rankings/${season}`, {}, 3600);
    }

    async getCBBTeamSeasonStats(season) {
        return this.get('cbb', `/stats/json/TeamSeasonStats/${season}`, {}, 300);
    }

    async getCBBPlayerSeasonStats(season) {
        return this.get('cbb', `/stats/json/PlayerSeasonStats/${season}`, {}, 300);
    }

    async getCBBTeamGameStatsByDate(date) {
        return this.get('cbb', `/stats/json/TeamGameStatsByDate/${date}`, {}, 180);
    }

    async getCBBPlayerGameStatsByDate(date) {
        return this.get('cbb', `/stats/json/PlayerGameStatsByDate/${date}`, {}, 180);
    }

    async getCBBDepthCharts() {
        return this.get('cbb', '/scores/json/DepthCharts', {}, 1800);
    }

    async getCBBGames(season) {
        return this.get('cbb', `/scores/json/Games/${season}`, {}, 300);
    }

    // ===========================================
    // UTILITY METHODS
    // ===========================================

    /**
     * Filter results for SEC teams only
     */
    filterSECTeams(data) {
        if (!Array.isArray(data)) return data;
        return data.filter(item =>
            item.Conference === 'SEC' ||
            item.conference === 'SEC' ||
            item.Team?.Conference === 'SEC'
        );
    }

    /**
     * Log API sync to D1 database
     */
    async logSync(sport, endpoint, season, status, recordsUpdated = 0, errorMessage = null, duration = 0, retries = 0) {
        if (!this.env.DB) return;

        try {
            await this.env.DB.prepare(`
                INSERT INTO api_sync_log
                (sport, endpoint, season, status, records_updated, error_message, retry_count, duration_ms)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                sport,
                endpoint,
                season,
                status,
                recordsUpdated,
                errorMessage,
                retries,
                duration
            ).run();
        } catch (err) {
            console.error('Failed to log API sync:', err);
        }
    }
}
