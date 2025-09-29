/**
 * NBA League-wide Standings API
 * Returns all NBA teams and standings data
 */

export async function onRequest({ request }) {
  // CORS headers for API access
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
    const data = await fetchNBAStandings();
    return new Response(JSON.stringify(data), {
      headers: corsHeaders,
      status: 200
    });
  } catch (error) {
    console.error('NBA Standings API Error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch NBA standings',
      message: error.message
    }), {
      headers: corsHeaders,
      status: 500
    });
  }
}

async function fetchNBAStandings() {
  const baseUrl = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba';

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.espn.com/',
    'Origin': 'https://www.espn.com'
  };

  try {
    // Fetch all NBA teams
    const teamsResponse = await fetch(`${baseUrl}/teams`, { headers });
    if (!teamsResponse.ok) {
      throw new Error(`ESPN teams API returned ${teamsResponse.status}`);
    }
    const teamsData = await teamsResponse.json();

    // Fetch NBA standings
    const standingsResponse = await fetch(`${baseUrl}/standings`, { headers });
    if (!standingsResponse.ok) {
      throw new Error(`ESPN standings API returned ${standingsResponse.status}`);
    }
    const standingsData = await standingsResponse.json();

    return {
      success: true,
      teams: teamsData.sports?.[0]?.leagues?.[0]?.teams || [],
      standings: standingsData.standings || [],
      dataSource: 'ESPN NBA API (Real-time)',
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`NBA Standings API Error: ${error.message}`);
  }
}