/**
 * Highlightly College Baseball API Client
 *
 * Integration with Highlightly's MLB/NCAA Baseball API for college baseball data.
 * Filters all responses to NCAA-only to avoid MLB data contamination.
 *
 * @module lib/api/highlightly
 * @see https://baseball.highlightly.net
 * @see https://rapidapi.com/highlightly
 */
// Timezone configuration
const TZ_DEFAULT = 'America/Chicago'; // San Antonio timezone
/**
 * Build query string from object
 */
function qs(params) {
    if (!params)
        return '';
    const entries = Object.entries(params)
        .filter(([_, v]) => v !== undefined && v !== null)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
    return entries.length > 0 ? '?' + entries.join('&') : '';
}
/**
 * Get current date in YYYY-MM-DD format (America/Chicago timezone)
 */
function today() {
    const now = new Date();
    // Convert to America/Chicago timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: TZ_DEFAULT,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    const parts = formatter.formatToParts(now);
    const year = parts.find(p => p.type === 'year')?.value || '';
    const month = parts.find(p => p.type === 'month')?.value || '';
    const day = parts.find(p => p.type === 'day')?.value || '';
    return `${year}-${month}-${day}`;
}
/**
 * Core fetch wrapper for Highlightly API
 *
 * @param env - Cloudflare environment with secrets
 * @param opts - Fetch options with path and query parameters
 * @returns API response with rate limit metadata
 * @throws Error if API returns non-2xx status
 */
export async function hlFetch(env, { path, search, init }) {
    const API_KEY = env?.HIGHLIGHTLY_API_KEY || '';
    const BASE = env?.HIGHLIGHTLY_BASE_URL || 'https://baseball.highlightly.net';
    const RAPID_HOST = env?.HIGHLIGHTLY_HOST || '';
    const url = `${BASE}${path}${qs(search)}`;
    const headers = {
        'x-rapidapi-key': API_KEY,
    };
    // Only add x-rapidapi-host if using RapidAPI proxy
    if (RAPID_HOST) {
        headers['x-rapidapi-host'] = RAPID_HOST;
    }
    try {
        const res = await fetch(url, {
            ...init,
            headers: {
                ...headers,
                ...(init?.headers || {}),
            },
        });
        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(`Highlightly ${res.status}: ${text || res.statusText}`);
        }
        // Extract rate limit headers
        const remaining = Number(res.headers.get('x-ratelimit-requests-remaining') || '');
        const limit = Number(res.headers.get('x-ratelimit-requests-limit') || '');
        const data = (await res.json());
        return {
            data,
            remaining: Number.isFinite(remaining) ? remaining : undefined,
            limit: Number.isFinite(limit) ? limit : undefined,
        };
    }
    catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Highlightly API request failed');
    }
}
/**
 * Scoreboard: Get NCAA baseball games for a specific date
 *
 * @param env - Cloudflare environment with secrets
 * @param date - Date in YYYY-MM-DD format (defaults to today)
 * @returns Scoreboard with games, pagination, and plan info
 *
 * @example
 * const scoreboard = await getDayScoreboard(env, '2025-02-15');
 * console.log(`Found ${scoreboard.data.data.length} NCAA games`);
 */
export async function getDayScoreboard(env, date) {
    return hlFetch(env, {
        path: '/matches',
        search: {
            league: 'NCAA', // NCAA-only filter
            date: date || today(),
            timezone: TZ_DEFAULT,
            limit: 100,
            offset: 0,
        },
    });
}
/**
 * Match Details: Get complete game data for a specific match
 *
 * @param env - Cloudflare environment with secrets
 * @param matchId - Highlightly match ID
 * @returns Full match details including box score, lineups, play-by-play
 *
 * @example
 * const match = await getMatchDetail(env, 12345);
 * console.log(`${match.data.home_team.name} vs ${match.data.away_team.name}`);
 */
export async function getMatchDetail(env, matchId) {
    return hlFetch(env, {
        path: `/matches/${matchId}`,
    });
}
/**
 * Lineups: Get batting orders and defensive positions for a match
 *
 * @param env - Cloudflare environment with secrets
 * @param matchId - Highlightly match ID
 * @returns Home and away lineups with positions
 *
 * @example
 * const lineups = await getLineups(env, 12345);
 * console.log(`Home lineup: ${lineups.data.home.length} players`);
 */
export async function getLineups(env, matchId) {
    return hlFetch(env, {
        path: `/lineups/${matchId}`,
    });
}
/**
 * Standings: Get NCAA baseball conference standings
 *
 * @param env - Cloudflare environment with secrets
 * @param year - Season year (defaults to current year)
 * @returns Conference standings with win-loss records
 *
 * @example
 * const standings = await getStandings(env, 2025);
 * console.log(`Loaded standings for ${standings.data.data.length} conferences`);
 */
export async function getStandings(env, year) {
    return hlFetch(env, {
        path: '/standings',
        search: {
            leagueName: 'NCAA', // NCAA-only filter
            year,
        },
    });
}
/**
 * Highlights: Get video highlight clips for NCAA games
 *
 * @param env - Cloudflare environment with secrets
 * @param date - Date in YYYY-MM-DD format (defaults to today)
 * @returns Highlight clips with thumbnails and descriptions
 *
 * @example
 * const highlights = await getHighlights(env, '2025-02-15');
 * console.log(`Found ${highlights.data.data.length} highlight clips`);
 */
export async function getHighlights(env, date) {
    return hlFetch(env, {
        path: '/highlights',
        search: {
            leagueName: 'NCAA', // NCAA-only filter
            date: date || today(),
            timezone: TZ_DEFAULT,
            limit: 40,
        },
    });
}
/**
 * Team Statistics: Get aggregated stats for a specific team
 *
 * @param env - Cloudflare environment with secrets
 * @param teamId - Highlightly team ID
 * @param fromDate - Start date for stats aggregation (YYYY-MM-DD)
 * @returns Team batting, pitching, and fielding statistics
 *
 * @example
 * const stats = await getTeamStats(env, 251, '2025-02-01'); // Texas Longhorns
 * console.log(`Batting avg: ${stats.data.batting.avg}`);
 */
export async function getTeamStats(env, teamId, fromDate) {
    return hlFetch(env, {
        path: `/teams/statistics/${teamId}`,
        search: {
            fromDate,
            timezone: TZ_DEFAULT,
        },
    });
}
/**
 * Teams Search: Find NCAA baseball teams by name or abbreviation
 *
 * RapidAPI Note: The API returns all teams without accepting query parameters.
 * We filter for NCAA teams and apply search/limit client-side.
 *
 * @param env - Cloudflare environment with secrets
 * @param search - Search query (team name or abbreviation) - applied client-side
 * @param limit - Maximum teams to return (default: 100) - applied client-side
 * @returns Teams matching search criteria (NCAA only)
 *
 * @example
 * const teams = await getTeams(env, 'Texas', 10);
 * console.log(`Found ${teams.data.length} teams matching "Texas"`);
 */
export async function getTeams(env, search, limit = 100) {
    const response = await hlFetch(env, {
        path: '/teams',
        // RapidAPI endpoint doesn't accept query parameters
    });
    // The API returns an array directly, not wrapped in {data: [...]}
    let teams = response.data;
    // Filter for NCAA teams only (exclude MLB)
    teams = teams.filter((team) => team.league === 'NCAA');
    // Apply search filter if provided
    if (search) {
        const searchLower = search.toLowerCase();
        teams = teams.filter((team) => team.displayName?.toLowerCase().includes(searchLower) ||
            team.name?.toLowerCase().includes(searchLower) ||
            team.abbreviation?.toLowerCase().includes(searchLower));
    }
    // Apply limit
    teams = teams.slice(0, limit);
    // Return in expected format with wrapper object
    return {
        data: teams,
        remaining: response.remaining,
        limit: response.limit,
    };
}
/**
 * Last Five Games: Get recent game history for a team
 *
 * @param env - Cloudflare environment with secrets
 * @param teamId - Highlightly team ID
 * @returns Last 5 games with results and opponent info
 *
 * @example
 * const recent = await getLastFiveGames(env, 251); // Texas Longhorns
 * console.log(`Recent form: ${recent.data.map(g => g.result).join(', ')}`);
 */
export async function getLastFiveGames(env, teamId) {
    return hlFetch(env, {
        path: '/last-five-games',
        search: {
            teamId,
        },
    });
}
/**
 * Head-to-Head: Get historical matchup data between two teams
 *
 * @param env - Cloudflare environment with secrets
 * @param team1Id - First team's Highlightly ID
 * @param team2Id - Second team's Highlightly ID
 * @returns Historical matchup results and statistics
 *
 * @example
 * const h2h = await getHeadToHead(env, 251, 252); // Texas vs Oklahoma
 * console.log(`All-time series: ${h2h.data.team1_wins}-${h2h.data.team2_wins}`);
 */
export async function getHeadToHead(env, team1Id, team2Id) {
    return hlFetch(env, {
        path: '/head-2-head',
        search: {
            teamIdOne: team1Id,
            teamIdTwo: team2Id,
        },
    });
}
