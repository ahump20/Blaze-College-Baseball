/**
 * REAL MLB Data API Function for Cloudflare Pages
 * Handles teamId via query string parameter
 */

export async function onRequest({ request }) {
  const url = new URL(request.url);
  const teamId = url.searchParams.get('teamId') || '138'; // Cardinals default

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
    const data = await fetchRealMLB(teamId);
    return new Response(JSON.stringify(data), {
      headers: corsHeaders,
      status: 200
    });
  } catch (error) {
    console.error('MLB API Error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch MLB data',
      message: error.message
    }), {
      headers: corsHeaders,
      status: 500
    });
  }
}

/**
 * REAL MLB Data from MLB Stats API
 * Free, public API - no authentication required
 */
async function fetchRealMLB(teamId) {
  const baseUrl = 'https://statsapi.mlb.com/api/v1';

  try {
    // Fetch real team data
    const teamResponse = await fetch(`${baseUrl}/teams/${teamId}`);
    const teamData = await teamResponse.json();

    // Fetch real standings
    const standingsResponse = await fetch(`${baseUrl}/standings?leagueId=104&season=2024`);
    const standingsData = await standingsResponse.json();

    // Fetch real roster
    const rosterResponse = await fetch(`${baseUrl}/teams/${teamId}/roster`);
    const rosterData = await rosterResponse.json();

    // Calculate REAL Pythagorean expectation (not hardcoded!)
    // Need separate calls for hitting and pitching stats
    const hittingResponse = await fetch(`${baseUrl}/teams/${teamId}/stats?stats=season&group=hitting&season=2024`);
    const hittingData = await hittingResponse.json();

    const pitchingResponse = await fetch(`${baseUrl}/teams/${teamId}/stats?stats=season&group=pitching&season=2024`);
    const pitchingData = await pitchingResponse.json();

    // Extract runs scored and allowed from real data - NO FALLBACKS!
    let runsScored, runsAllowed;

    if (hittingData.stats?.[0]?.splits?.[0]?.stat?.runs) {
      runsScored = hittingData.stats[0].splits[0].stat.runs;
    }

    if (pitchingData.stats?.[0]?.splits?.[0]?.stat?.runs) {
      runsAllowed = pitchingData.stats[0].splits[0].stat.runs;
    }

    // NO FALLBACKS - if we don't have real data, we fail
    if (!runsScored || !runsAllowed) {
      throw new Error('Unable to fetch runs data from MLB Stats API - no fallbacks allowed');
    }

    // REAL Pythagorean calculation using Bill James formula
    const exponent = 1.83; // Bill James exponent for MLB
    const pythagoreanWins = Math.round(
      162 * (Math.pow(runsScored, exponent) /
      (Math.pow(runsScored, exponent) + Math.pow(runsAllowed, exponent)))
    );

    return {
      success: true,
      team: teamData.teams?.[0] || {},
      standings: standingsData.records?.[0]?.teamRecords || [],
      roster: rosterData.roster || [],
      analytics: {
        pythagorean: {
          expectedWins: pythagoreanWins,
          winPercentage: (pythagoreanWins / 162).toFixed(3),
          runsScored: runsScored,
          runsAllowed: runsAllowed,
          formula: 'Bill James Pythagorean Expectation (Exponent: 1.83)'
        },
        dataSource: 'MLB Stats API (Real-time)',
        lastUpdated: new Date().toISOString()
      }
    };
  } catch (error) {
    throw new Error(`MLB API Error: ${error.message}`);
  }
}