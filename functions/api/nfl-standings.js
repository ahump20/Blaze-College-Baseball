/**
 * NFL League-wide Standings API
 * Returns all NFL teams and standings data
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
    const data = await fetchNFLStandings();
    return new Response(JSON.stringify(data), {
      headers: corsHeaders,
      status: 200
    });
  } catch (error) {
    console.error('NFL Standings API Error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch NFL standings',
      message: error.message
    }), {
      headers: corsHeaders,
      status: 500
    });
  }
}

async function fetchNFLStandings() {
  const baseUrl = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl';

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.espn.com/',
    'Origin': 'https://www.espn.com'
  };

  try {
    // Fetch all NFL teams
    const teamsResponse = await fetch(`${baseUrl}/teams`, { headers });
    if (!teamsResponse.ok) {
      throw new Error(`ESPN teams API returned ${teamsResponse.status}`);
    }
    const teamsData = await teamsResponse.json();

    // Fetch NFL standings
    const standingsResponse = await fetch(`${baseUrl}/standings`, { headers });
    if (!standingsResponse.ok) {
      throw new Error(`ESPN standings API returned ${standingsResponse.status}`);
    }
    const standingsData = await standingsResponse.json();

    return {
      success: true,
      teams: teamsData.sports?.[0]?.leagues?.[0]?.teams || [],
      standings: standingsData.standings || [],
      dataSource: 'ESPN NFL API (Real-time)',
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`NFL Standings API Error: ${error.message}`);
  }
}