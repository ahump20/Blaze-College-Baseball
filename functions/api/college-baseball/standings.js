/**
 * College Baseball Standings API Endpoint
 * Returns conference standings for NCAA Division I baseball
 */

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const conference = url.searchParams.get('conference') || 'SEC';
  const season = url.searchParams.get('season') || new Date().getFullYear();

  try {
    // TODO: Integrate with NCAA Statistics API
    // For now, return mock data structure
    const standings = {
      conference: conference,
      season: parseInt(season),
      updated: new Date().toISOString(),
      teams: [
        {
          rank: 1,
          team_id: 'lsu',
          school_name: 'LSU',
          conference_wins: 0,
          conference_losses: 0,
          conference_pct: 0.000,
          overall_wins: 0,
          overall_losses: 0,
          overall_pct: 0.000,
          streak: 'N/A',
          home_record: '0-0',
          away_record: '0-0',
          neutral_record: '0-0'
        },
        {
          rank: 2,
          team_id: 'tennessee',
          school_name: 'Tennessee',
          conference_wins: 0,
          conference_losses: 0,
          conference_pct: 0.000,
          overall_wins: 0,
          overall_losses: 0,
          overall_pct: 0.000,
          streak: 'N/A',
          home_record: '0-0',
          away_record: '0-0',
          neutral_record: '0-0'
        },
        {
          rank: 3,
          team_id: 'arkansas',
          school_name: 'Arkansas',
          conference_wins: 0,
          conference_losses: 0,
          conference_pct: 0.000,
          overall_wins: 0,
          overall_losses: 0,
          overall_pct: 0.000,
          streak: 'N/A',
          home_record: '0-0',
          away_record: '0-0',
          neutral_record: '0-0'
        }
      ],
      notes: [
        'Season begins February 2026',
        'Conference play starts in March',
        'Data will be updated every 15 minutes during season'
      ]
    };

    return new Response(JSON.stringify(standings), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=900', // 15 minutes
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
