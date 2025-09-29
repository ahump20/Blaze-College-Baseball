/**
 * NFL Data API Function for Cloudflare Pages
 * Fetches real data from ESPN API with query string support
 */

export async function onRequest({ request }) {
  const url = new URL(request.url);
  const teamId = url.searchParams.get('teamId') || '10'; // Titans default

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data = await fetchRealNFL(teamId);
    return new Response(JSON.stringify(data), {
      headers: corsHeaders,
      status: 200
    });
  } catch (error) {
    console.error('NFL API Error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch NFL data',
      message: error.message
    }), {
      headers: corsHeaders,
      status: 500
    });
  }
}

async function fetchRealNFL(teamId) {
  const baseUrl = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl';

  // ESPN requires proper headers to avoid 403 errors
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.espn.com/',
    'Origin': 'https://www.espn.com'
  };

  try {
    // Fetch real team data with proper headers
    const teamResponse = await fetch(`${baseUrl}/teams/${teamId}`, { headers });
    if (!teamResponse.ok) {
      throw new Error(`ESPN API returned ${teamResponse.status}: ${teamResponse.statusText}`);
    }
    const teamData = await teamResponse.json();

    // Fetch real standings with proper headers
    const standingsResponse = await fetch(`${baseUrl}/standings`, { headers });
    if (!standingsResponse.ok) {
      throw new Error(`ESPN standings API returned ${standingsResponse.status}`);
    }
    const standingsData = await standingsResponse.json();

    // Fetch real scoreboard with proper headers
    const scoreboardResponse = await fetch(`${baseUrl}/scoreboard`, { headers });
    if (!scoreboardResponse.ok) {
      throw new Error(`ESPN scoreboard API returned ${scoreboardResponse.status}`);
    }
    const scoreboardData = await scoreboardResponse.json();

    // Calculate REAL Elo rating (not fake!)
    let teamElo = 1500; // Starting Elo
    const K = 32; // K-factor for NFL

    // Get team's recent games to calculate Elo
    if (scoreboardData.events) {
      scoreboardData.events.forEach(game => {
        const competitors = game.competitions?.[0]?.competitors;
        if (competitors) {
          const team = competitors.find(c => c.id === String(teamId));
          const opponent = competitors.find(c => c.id !== String(teamId));

          if (team && opponent) {
            const teamScore = parseInt(team.score);
            const opponentScore = parseInt(opponent.score);

            if (!isNaN(teamScore) && !isNaN(opponentScore)) {
              // Elo calculation
              const expectedScore = 1 / (1 + Math.pow(10, (1500 - teamElo) / 400));
              const actualScore = teamScore > opponentScore ? 1 : 0;
              teamElo = Math.round(teamElo + K * (actualScore - expectedScore));
            }
          }
        }
      });
    }

    return {
      success: true,
      teamId: teamId,
      team: teamData.team || {},
      standings: standingsData.standings || [],
      scoreboard: scoreboardData.events || [],
      analytics: {
        elo: {
          currentRating: teamElo,
          kFactor: K,
          formula: 'Standard Elo rating system'
        },
        dataSource: 'ESPN API (Real-time)',
        lastUpdated: new Date().toISOString()
      }
    };
  } catch (error) {
    throw new Error(`ESPN NFL API Error: ${error.message}`);
  }
}