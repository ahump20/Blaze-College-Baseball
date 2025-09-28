/**
 * NCAA League-wide Standings API
 * Returns college football rankings and teams
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
    const data = await fetchNCAAStandings();
    return new Response(JSON.stringify(data), {
      headers: corsHeaders,
      status: 200
    });
  } catch (error) {
    console.error('NCAA Standings API Error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch NCAA standings',
      message: error.message
    }), {
      headers: corsHeaders,
      status: 500
    });
  }
}

async function fetchNCAAStandings() {
  const baseUrl = 'https://site.api.espn.com/apis/site/v2/sports/football/college-football';

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.espn.com/',
    'Origin': 'https://www.espn.com'
  };

  try {
    // Fetch college football rankings
    const rankingsResponse = await fetch(`${baseUrl}/rankings`, { headers });
    if (!rankingsResponse.ok) {
      throw new Error(`ESPN rankings API returned ${rankingsResponse.status}`);
    }
    const rankingsData = await rankingsResponse.json();

    // Fetch teams
    const teamsResponse = await fetch(`${baseUrl}/teams`, { headers });
    if (!teamsResponse.ok) {
      throw new Error(`ESPN teams API returned ${teamsResponse.status}`);
    }
    const teamsData = await teamsResponse.json();

    return {
      success: true,
      rankings: rankingsData.rankings || [],
      teams: teamsData.sports?.[0]?.leagues?.[0]?.teams || [],
      dataSource: 'ESPN College Football API (Real-time)',
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`NCAA Standings API Error: ${error.message}`);
  }
}