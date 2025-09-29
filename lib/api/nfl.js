import { apiCache, cacheMetrics } from '../utils/cache.js';
import { ApiError, ErrorCode, ErrorHandler, CircuitBreaker, DEFAULT_FALLBACKS } from '../utils/errors.js';
const DEFAULT_TEAM_ID = '10'; // Tennessee Titans
const CACHE_TTL = 30000; // 30 seconds for NFL data
const nflCircuitBreaker = new CircuitBreaker();
function resolveDefaultApiBase() {
    if (typeof window !== 'undefined' && window.location) {
        return window.location.hostname === 'localhost'
            ? 'http://localhost:3000/api'
            : 'https://blazesportsintel.com/api';
    }
    return 'https://blazesportsintel.com/api';
}
function buildUrl(base, path, query = {}) {
    const url = new URL(path, base.endsWith('/') ? base : `${base}/`);
    Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            url.searchParams.set(key, value);
        }
    });
    return url.toString();
}
async function handleResponse(response) {
    if (!response.ok) {
        const body = await response.text();
        // Handle specific HTTP status codes
        if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After');
            throw new ApiError(ErrorCode.RATE_LIMITED, 'Rate limit exceeded', response.status, retryAfter ? parseInt(retryAfter) * 1000 : undefined);
        }
        else if (response.status >= 500) {
            throw new ApiError(ErrorCode.API_UNAVAILABLE, `NFL API unavailable (${response.status})`, response.status);
        }
        else if (response.status === 404) {
            throw new ApiError(ErrorCode.INVALID_RESPONSE, 'Requested NFL data not found', response.status);
        }
        else {
            throw new ApiError(ErrorCode.INVALID_RESPONSE, `NFL API request failed with ${response.status}: ${body}`, response.status);
        }
    }
    try {
        return (await response.json());
    }
    catch (error) {
        throw new ApiError(ErrorCode.INVALID_RESPONSE, 'Failed to parse NFL API response', response.status);
    }
}
export async function getNflTeam(teamId = DEFAULT_TEAM_ID, apiBase = resolveDefaultApiBase(), fetcher = fetch) {
    const url = buildUrl(apiBase, 'nfl', { teamId });
    const cacheKey = `nfl-team-${teamId}`;
    // Check cache first
    const cached = apiCache.get(cacheKey);
    if (cached !== null) {
        cacheMetrics.recordHit();
        console.log(`[Cache HIT] NFL team ${teamId}`);
        return cached;
    }
    cacheMetrics.recordMiss();
    console.log(`[Cache MISS] NFL team ${teamId}`);
    // Use circuit breaker and error handler
    return ErrorHandler.handleWithFallback(async () => {
        return nflCircuitBreaker.execute(async () => {
            const response = await fetcher(url, { method: 'GET' });
            const data = await handleResponse(response);
            // Cache successful response
            apiCache.set(cacheKey, data, CACHE_TTL);
            return data;
        });
    }, () => {
        // Try to get stale cached data as fallback
        const staleCached = apiCache.get(cacheKey);
        return staleCached || DEFAULT_FALLBACKS.NFL.team;
    }, {
        retries: 3,
        retryDelay: 1000,
        onError: (error) => {
            ErrorHandler.logError(error, {
                operation: 'getNflTeam',
                sport: 'NFL',
                teamId,
                url,
            });
        },
    });
}
export async function getNflStandings(apiBase = resolveDefaultApiBase(), fetcher = fetch) {
    const url = buildUrl(apiBase, 'nfl-standings');
    const cacheKey = 'nfl-standings';
    // Check cache first
    const cached = apiCache.get(cacheKey);
    if (cached !== null) {
        cacheMetrics.recordHit();
        console.log('[Cache HIT] NFL standings');
        return cached;
    }
    cacheMetrics.recordMiss();
    console.log('[Cache MISS] NFL standings');
    // Use circuit breaker and error handler
    return ErrorHandler.handleWithFallback(async () => {
        return nflCircuitBreaker.execute(async () => {
            const response = await fetcher(url, { method: 'GET' });
            const data = await handleResponse(response);
            // Cache successful response
            apiCache.set(cacheKey, data, CACHE_TTL);
            return data;
        });
    }, () => {
        // Try to get stale cached data as fallback
        const staleCached = apiCache.get(cacheKey);
        return staleCached || DEFAULT_FALLBACKS.NFL.standings;
    }, {
        retries: 3,
        retryDelay: 1000,
        onError: (error) => {
            ErrorHandler.logError(error, {
                operation: 'getNflStandings',
                sport: 'NFL',
                url,
            });
        },
    });
}
//# sourceMappingURL=nfl.js.map