/**
 * NFL League-wide Standings API
 * Returns standings for all NFL teams
 */

export async function onRequest({ request }) {
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

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.espn.com/',
    'Origin': 'https://www.espn.com'
  };

  try {
    const baseUrl = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/standings';

    const response = await fetch(baseUrl, { headers });
    if (!response.ok) {
      throw new Error(`ESPN standings API returned ${response.status}`);
    }

    const data = await response.json();

    // Format standings by conference and division
    const standings = {
      afc: data.children?.find(c => c.name === 'American Football Conference') || {},
      nfc: data.children?.find(c => c.name === 'National Football Conference') || {},
      lastUpdated: new Date().toISOString()
    };

    return new Response(JSON.stringify(standings), {
      headers: corsHeaders,
      status: 200
    });
  } catch (error) {
    console.error('NFL Standings Error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch NFL standings',
      message: error.message
    }), {
      headers: corsHeaders,
      status: 500
    });
  }
}