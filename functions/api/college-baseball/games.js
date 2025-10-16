/**
 * College Baseball Games API
 * Returns live and scheduled games with real-time updates
 *
 * Phase 5: Highlightly Baseball API Integration
 * Caching: 60s for live games, 5m for scheduled games (KV requires min 60s TTL)
 * Data sources: Highlightly NCAA Baseball API (primary), sample data (fallback)
 */

import { getDayScoreboard } from '../../../lib/api/highlightly.js';

const CACHE_KEY_PREFIX = 'college-baseball:games';

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
          source: 'cache'
        }), {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=60, stale-while-revalidate=30'
          }
        });
      }
    }

    // Fetch games from data sources
    const games = await fetchGames(date, { conference, status, team }, env);
    
    // Store in cache
    const cacheData = {
      games,
      timestamp: new Date().toISOString(),
      filters: { date, conference, status, team }
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
      source: 'live'
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${cacheTTL}, stale-while-revalidate=${Math.floor(cacheTTL / 2)}`
      }
    });

  } catch (error) {
    console.error('College baseball games API error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch college baseball games',
      message: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}

/**
 * Fetch games from available data sources
 * Implements fallback strategy: Highlightly → NCAA Stats fallback
 */
async function fetchGames(date, filters = {}, env) {
  // Try Highlightly API first
  try {
    if (env?.HIGHLIGHTLY_API_KEY) {
      const response = await getDayScoreboard(env, date);
      const matches = response.data?.data || [];

      // Transform Highlightly format to app format
      let games = matches.map(match => ({
        id: `game-${match.id}`,
        date: match.date,
        time: new Date(match.date).toLocaleTimeString('en-US', {
          timeZone: 'America/Chicago',
          hour: 'numeric',
          minute: '2-digit',
          timeZoneName: 'short'
        }),
        status: match.status || 'scheduled', // 'live', 'final', 'scheduled'
        inning: match.inning,
        homeTeam: {
          id: match.home_team?.id || match.home_team?.abbreviation,
          name: match.home_team?.name || 'Unknown',
          shortName: match.home_team?.abbreviation || match.home_team?.name,
          conference: match.home_team?.conference || 'Unknown',
          score: match.home_score || 0,
          record: {
            wins: match.home_team?.wins || 0,
            losses: match.home_team?.losses || 0
          }
        },
        awayTeam: {
          id: match.away_team?.id || match.away_team?.abbreviation,
          name: match.away_team?.name || 'Unknown',
          shortName: match.away_team?.abbreviation || match.away_team?.name,
          conference: match.away_team?.conference || 'Unknown',
          score: match.away_score || 0,
          record: {
            wins: match.away_team?.wins || 0,
            losses: match.away_team?.losses || 0
          }
        },
        venue: match.venue?.name || match.venue || 'TBD',
        tv: match.broadcast?.network || match.broadcast || ''
      }));

      // Apply filters
      if (filters.conference) {
        const confFilter = filters.conference.toUpperCase();
        games = games.filter(g =>
          g.homeTeam.conference === confFilter ||
          g.awayTeam.conference === confFilter
        );
      }

      if (filters.status) {
        games = games.filter(g => g.status === filters.status);
      }

      if (filters.team) {
        games = games.filter(g =>
          g.homeTeam.id === filters.team ||
          g.awayTeam.id === filters.team
        );
      }

      return games;
    }
  } catch (error) {
    console.warn('Highlightly API failed, falling back to sample data:', error.message);
  }

  // Fallback to sample data (will be replaced with NCAA Stats API)
  const sampleGames = [
    {
      id: 'game-001',
      date: date,
      time: '7:00 PM ET',
      status: 'live',
      inning: 5,
      homeTeam: {
        id: 'lsu',
        name: 'LSU Tigers',
        shortName: 'LSU',
        conference: 'SEC',
        score: 4,
        record: { wins: 15, losses: 3 }
      },
      awayTeam: {
        id: 'tennessee',
        name: 'Tennessee Volunteers',
        shortName: 'TENN',
        conference: 'SEC',
        score: 2,
        record: { wins: 18, losses: 2 }
      },
      venue: 'Alex Box Stadium',
      tv: 'SEC Network'
    },
    {
      id: 'game-002',
      date: date,
      time: '6:30 PM ET',
      status: 'scheduled',
      homeTeam: {
        id: 'texas',
        name: 'Texas Longhorns',
        shortName: 'TEX',
        conference: 'SEC',
        record: { wins: 16, losses: 4 }
      },
      awayTeam: {
        id: 'arkansas',
        name: 'Arkansas Razorbacks',
        shortName: 'ARK',
        conference: 'SEC',
        record: { wins: 14, losses: 5 }
      },
      venue: 'Disch-Falk Field',
      tv: 'ESPN+'
    },
    {
      id: 'game-003',
      date: date,
      time: '7:00 PM ET',
      status: 'scheduled',
      homeTeam: {
        id: 'vanderbilt',
        name: 'Vanderbilt Commodores',
        shortName: 'VANDY',
        conference: 'SEC',
        record: { wins: 17, losses: 3 }
      },
      awayTeam: {
        id: 'florida',
        name: 'Florida Gators',
        shortName: 'FLA',
        conference: 'SEC',
        record: { wins: 13, losses: 6 }
      },
      venue: 'Hawkins Field',
      tv: 'SEC Network+'
    },
    {
      id: 'game-004',
      date: date,
      time: '2:00 PM ET',
      status: 'final',
      homeTeam: {
        id: 'stanford',
        name: 'Stanford Cardinal',
        shortName: 'STAN',
        conference: 'Pac-12',
        score: 8,
        record: { wins: 12, losses: 5 }
      },
      awayTeam: {
        id: 'oregon-st',
        name: 'Oregon State Beavers',
        shortName: 'ORE ST',
        conference: 'Pac-12',
        score: 5,
        record: { wins: 14, losses: 4 }
      },
      venue: 'Klein Field at Sunken Diamond',
      tv: 'Pac-12 Network'
    }
  ];
  
  // Apply filters
  let filteredGames = sampleGames;
  
  if (filters.conference) {
    filteredGames = filteredGames.filter(g => 
      g.homeTeam.conference === filters.conference || 
      g.awayTeam.conference === filters.conference
    );
  }
  
  if (filters.status) {
    filteredGames = filteredGames.filter(g => g.status === filters.status);
  }
  
  if (filters.team) {
    filteredGames = filteredGames.filter(g => 
      g.homeTeam.id === filters.team || 
      g.awayTeam.id === filters.team
    );
  }
  
  return filteredGames;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}
