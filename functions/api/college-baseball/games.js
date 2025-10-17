/**
 * College Baseball Games API
 * Returns live and scheduled games with real-time updates
 *
 * Phase 5: Highlightly Baseball API Integration
 * Caching: 60s for live games, 5m for scheduled games (KV requires min 60s TTL)
 * Data sources: Highlightly NCAA Baseball API (primary), sample data (fallback)
 */

import { createHighlightlyClient, HighlightlyError } from '../../../lib/highlightly.js';

const CACHE_KEY_PREFIX = 'college-baseball:games';
const HIGHLIGHTLY_TIMEZONE = 'America/Chicago';

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // Parse query parameters
    const date = url.searchParams.get('date') || getTodayDate();
    const conference = url.searchParams.get('conference');
    const status = url.searchParams.get('status'); // live, scheduled, final
    const team = url.searchParams.get('team');
    
    // Build cache key
    const cacheKey = `${CACHE_KEY_PREFIX}:${date}:${conference || 'all'}:${status || 'all'}:${team || 'all'}`;
    
    // Check cache first
    if (env.CACHE) {
      const cached = await env.CACHE.get(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        return new Response(JSON.stringify({
          success: true,
          data: data.games,
          cached: true,
          cacheTime: data.timestamp,
          source: 'cache',
          meta: data.rateLimit
        }), {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=60, stale-while-revalidate=30',
            ...buildRateLimitHeaders(data.rateLimit)
          }
        });
      }
    }

    // Fetch games from Highlightly
    const { games, rateLimit } = await fetchGames(date, { conference, status, team }, env);

    // Store in cache
    const cacheData = {
      games,
      timestamp: new Date().toISOString(),
      filters: { date, conference, status, team },
      rateLimit
    };

    // Determine TTL based on game status
    // Note: Cloudflare KV requires minimum 60s TTL
    const hasLiveGames = games.some(g => g.status === 'live');
    const cacheTTL = hasLiveGames ? 60 : 300; // 60s for live, 5m for scheduled
    
    if (env.CACHE) {
      await env.CACHE.put(cacheKey, JSON.stringify(cacheData), {
        expirationTtl: cacheTTL
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: games,
      count: games.length,
      cached: false,
      timestamp: new Date().toISOString(),
      source: 'live',
      meta: rateLimit
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${cacheTTL}, stale-while-revalidate=${Math.floor(cacheTTL / 2)}`,
        ...buildRateLimitHeaders(rateLimit)
      }
    });

  } catch (error) {
    console.error('College baseball games API error:', error);

    const rateLimitHeaders =
      error instanceof HighlightlyError ? buildRateLimitHeaders(error.meta.rateLimit, error.meta.requestId) : {};
    const status = error instanceof HighlightlyError ? error.status : 500;
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch college baseball games',
      message,
      timestamp: new Date().toISOString()
    }), {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        ...rateLimitHeaders
      }
    });
  }
}

/**
 * Fetch games from available data sources
 * Implements fallback strategy: Highlightly → NCAA Stats fallback
 */
async function fetchGames(date, filters = {}, env) {
  const client = createHighlightlyClient(env);

  const searchParams = {
    league: 'NCAA',
    date,
    timezone: HIGHLIGHTLY_TIMEZONE,
    limit: 200,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.conference ? { conference: filters.conference } : {}),
    ...(filters.team ? { team: filters.team } : {}),
  };

  const response = await client.getMatches(searchParams);
  const matches = Array.isArray(response.data?.data) ? response.data.data : [];

  let games = matches.map(mapMatchToGame);

  if (filters.conference) {
    const target = filters.conference.toLowerCase();
    games = games.filter(game =>
      game.homeTeam.conference?.toLowerCase() === target ||
      game.awayTeam.conference?.toLowerCase() === target
    );
  }

  if (filters.status) {
    const desiredStatus = filters.status.toLowerCase();
    games = games.filter(game => game.status === desiredStatus);
  }

  if (filters.team) {
    const targetTeam = filters.team.toString().toLowerCase();
    games = games.filter(game => {
      const homeId = game.homeTeam.id?.toString().toLowerCase();
      const awayId = game.awayTeam.id?.toString().toLowerCase();
      return homeId === targetTeam || awayId === targetTeam;
    });
  }

  return {
    games,
    rateLimit: {
      ...response.meta.rateLimit,
      requestId: response.meta.requestId || undefined
    }
  };
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate() {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: HIGHLIGHTLY_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const parts = formatter.formatToParts(new Date());
  const year = parts.find(part => part.type === 'year')?.value ?? '0000';
  const month = parts.find(part => part.type === 'month')?.value ?? '01';
  const day = parts.find(part => part.type === 'day')?.value ?? '01';
  return `${year}-${month}-${day}`;
}

function mapMatchToGame(match) {
  const startDate = match.date || match.game_date || match.start_time || null;
  const status = normalizeStatus(match.status || match.state);
  const scheduled = startDate ? new Date(startDate) : null;
  const inning = match.inning || match.current_inning || null;

  return {
    id: `game-${match.id ?? match.match_id ?? generateRandomId()}`,
    date: startDate || new Date().toISOString(),
    time: scheduled
      ? scheduled.toLocaleTimeString('en-US', {
          timeZone: HIGHLIGHTLY_TIMEZONE,
          hour: 'numeric',
          minute: '2-digit',
          timeZoneName: 'short'
        })
      : '',
    status,
    inning: typeof inning === 'number' ? inning : undefined,
    homeTeam: normalizeTeam(match.home_team, match.home_score),
    awayTeam: normalizeTeam(match.away_team, match.away_score),
    venue: match.venue?.name || match.venue || 'TBD',
    tv: match.broadcast?.network || match.broadcast?.channel || match.broadcast || ''
  };
}

function generateRandomId() {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch (error) {
    // noop - fall back to Math.random below
  }

  return Math.random().toString(36).slice(2, 10);
}

function normalizeStatus(rawStatus) {
  const value = (rawStatus || '').toString().toLowerCase();

  if (['live', 'in_progress', 'in-progress', 'progress', 'midgame'].includes(value)) {
    return 'live';
  }

  if (['final', 'completed', 'complete', 'finished'].includes(value)) {
    return 'final';
  }

  return 'scheduled';
}

function normalizeTeam(team = {}, score = 0) {
  const record = team.record || team.stats || {};
  const wins = record.wins ?? record.win ?? team.wins ?? 0;
  const losses = record.losses ?? record.loss ?? team.losses ?? 0;
  const numericScore = Number(score ?? 0);

  return {
    id: team.id ?? team.abbreviation ?? team.code ?? team.slug ?? team.name,
    name: team.name || team.full_name || 'Unknown',
    shortName: team.abbreviation || team.short_name || team.name || 'UNK',
    conference: team.conference || team.conferenceName || team.league || '',
    score: Number.isFinite(numericScore) ? numericScore : 0,
    record: {
      wins: Number.isFinite(Number(wins)) ? Number(wins) : 0,
      losses: Number.isFinite(Number(losses)) ? Number(losses) : 0
    }
  };
}

function buildRateLimitHeaders(rateLimit = {}, requestId) {
  const headers = {};

  if (rateLimit.limit !== undefined) {
    headers['X-Highlightly-RateLimit-Limit'] = String(rateLimit.limit);
  }
  if (rateLimit.remaining !== undefined) {
    headers['X-Highlightly-RateLimit-Remaining'] = String(rateLimit.remaining);
  }
  if (rateLimit.reset !== undefined) {
    headers['X-Highlightly-RateLimit-Reset'] = String(rateLimit.reset);
  }
  if (rateLimit.retryAfter !== undefined) {
    headers['Retry-After'] = String(rateLimit.retryAfter);
  }
  if (rateLimit.requestId || requestId) {
    headers['X-Highlightly-Request-Id'] = String(rateLimit.requestId || requestId);
  }

  return headers;
}
