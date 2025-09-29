/**
 * REAL NCAA Data API Function for Cloudflare Pages
 * Handles teamId via query string parameter
 */

export async function onRequest({ request }) {
  const url = new URL(request.url);
  const teamId = url.searchParams.get('teamId') || '251'; // Texas Longhorns default

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
    const data = await fetchRealNCAA(teamId);
    return new Response(JSON.stringify(data), {
      headers: corsHeaders,
      status: 200
    });
  } catch (error) {
    console.error('NCAA API Error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch NCAA data',
      message: error.message
    }), {
      headers: corsHeaders,
      status: 500
    });
  }
}

/**
 * REAL NCAA Data from ESPN API
 */
async function fetchRealNCAA(teamId) {
  const baseUrl = 'https://site.api.espn.com/apis/site/v2/sports/football/college-football';

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.espn.com/',
    'Origin': 'https://www.espn.com'
  };

  try {
    // Fetch team data
    const teamResponse = await fetch(`${baseUrl}/teams/${teamId}`, { headers });
    if (!teamResponse.ok) {
      throw new Error(`ESPN NCAA API returned ${teamResponse.status}`);
    }
    const teamData = await teamResponse.json();

    // Rankings
    const rankingsResponse = await fetch(`${baseUrl}/rankings`, { headers });
    if (!rankingsResponse.ok) {
      throw new Error(`ESPN rankings API returned ${rankingsResponse.status}`);
    }
    const rankingsData = await rankingsResponse.json();

    return {
      success: true,
      team: teamData.team || {},
      rankings: rankingsData.rankings || [],
      dataSource: 'ESPN College Football API (Real-time)',
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`NCAA API Error: ${error.message}`);
  }
}