/**
 * MLB League-wide Standings API
 * Returns all MLB teams and standings data
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
    const data = await fetchMLBStandings();
    return new Response(JSON.stringify(data), {
      headers: corsHeaders,
      status: 200
    });
  } catch (error) {
    console.error('MLB Standings API Error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch MLB standings',
      message: error.message
    }), {
      headers: corsHeaders,
      status: 500
    });
  }
}

async function fetchMLBStandings() {
  const baseUrl = 'https://statsapi.mlb.com/api/v1';

  try {
    // Fetch all MLB teams
    const teamsResponse = await fetch(`${baseUrl}/teams?leagueIds=104,103&season=2024`);
    const teamsData = await teamsResponse.json();

    // Fetch league standings
    const standingsResponse = await fetch(`${baseUrl}/standings?leagueId=104,103&season=2024`);
    const standingsData = await standingsResponse.json();

    return {
      success: true,
      teams: teamsData.teams || [],
      standings: standingsData.records || [],
      dataSource: 'MLB Stats API (Real-time)',
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`MLB Standings API Error: ${error.message}`);
  }
}