/**
 * Blaze Sports Intel - MLB Analytics API
 * MLB Stats API Integration for Real-time Baseball Data
 */

export interface Env {
  SPORTS_CACHE?: KVNamespace;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const route = (params.route as string[]) || [];

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=300, s-maxage=600'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  try {
    // Teams endpoint
    if (route[0] === 'teams') {
      const teamId = route[1] || url.searchParams.get('teamId');

      if (!teamId) {
        const cacheKey = 'mlb:teams:all';
        let teams = null;

        if (env.SPORTS_CACHE) {
          const cached = await env.SPORTS_CACHE.get(cacheKey, 'json');
          if (cached) teams = cached;
        }

        if (!teams) {
          const mlbResponse = await fetch(
            'https://statsapi.mlb.com/api/v1/teams?sportId=1',
            {
              headers: {
                'User-Agent': 'BlazeSportsIntel/1.0',
                'Accept': 'application/json'
              }
            }
          );

          if (!mlbResponse.ok) {
            throw new Error('MLB Stats API returned non-OK status');
          }

          const mlbData = await mlbResponse.json();

          teams = {
            timestamp: new Date().toISOString(),
            teams: mlbData.teams.map((t: any) => ({
              id: t.id,
              name: t.name,
              teamName: t.teamName,
              abbreviation: t.abbreviation,
              locationName: t.locationName,
              division: t.division?.name,
              league: t.league?.name,
              venue: t.venue?.name
            })),
            meta: {
              dataSource: 'MLB Stats API',
              lastUpdated: new Date().toISOString()
            }
          };

          if (env.SPORTS_CACHE) {
            await env.SPORTS_CACHE.put(cacheKey, JSON.stringify(teams), {
              expirationTtl: 3600
            });
          }
        }

        return new Response(JSON.stringify(teams, null, 2), {
          status: 200,
          headers
        });
      } else {
        const cacheKey = `mlb:team:${teamId}:full`;
        let teamData = null;

        if (env.SPORTS_CACHE) {
          const cached = await env.SPORTS_CACHE.get(cacheKey, 'json');
          if (cached) teamData = cached;
        }

        if (!teamData) {
          const [teamInfo, roster, stats] = await Promise.all([
            fetch(`https://statsapi.mlb.com/api/v1/teams/${teamId}`, {
              headers: { 'User-Agent': 'BlazeSportsIntel/1.0', 'Accept': 'application/json' }
            }).then(r => r.json()),
            fetch(`https://statsapi.mlb.com/api/v1/teams/${teamId}/roster`, {
              headers: { 'User-Agent': 'BlazeSportsIntel/1.0', 'Accept': 'application/json' }
            }).then(r => r.json()).catch(() => null),
            fetch(`https://statsapi.mlb.com/api/v1/teams/${teamId}/stats?season=2024`, {
              headers: { 'User-Agent': 'BlazeSportsIntel/1.0', 'Accept': 'application/json' }
            }).then(r => r.json()).catch(() => null)
          ]);

          const team = teamInfo.teams?.[0];

          teamData = {
            timestamp: new Date().toISOString(),
            team: {
              id: team?.id,
              name: team?.name,
              abbreviation: team?.abbreviation,
              teamName: team?.teamName,
              locationName: team?.locationName,
              division: team?.division,
              league: team?.league,
              venue: team?.venue,
              record: team?.record
            },
            roster: roster?.roster?.map((p: any) => ({
              id: p.person.id,
              name: p.person.fullName,
              jerseyNumber: p.jerseyNumber,
              position: p.position?.abbreviation,
              status: p.status?.description
            })) || [],
            statistics: stats?.stats || [],
            meta: {
              dataSource: 'MLB Stats API',
              lastUpdated: new Date().toISOString(),
              season: '2024'
            }
          };

          if (env.SPORTS_CACHE) {
            await env.SPORTS_CACHE.put(cacheKey, JSON.stringify(teamData), {
              expirationTtl: 300
            });
          }
        }

        return new Response(JSON.stringify(teamData, null, 2), {
          status: 200,
          headers
        });
      }
    }

    // Scoreboard endpoint
    if (route[0] === 'scoreboard') {
      const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
      const cacheKey = `mlb:scoreboard:${date}`;
      let scoreboard = null;

      if (env.SPORTS_CACHE) {
        const cached = await env.SPORTS_CACHE.get(cacheKey, 'json');
        if (cached) scoreboard = cached;
      }

      if (!scoreboard) {
        const mlbResponse = await fetch(
          `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${date}`,
          {
            headers: {
              'User-Agent': 'BlazeSportsIntel/1.0',
              'Accept': 'application/json'
            }
          }
        );

        if (!mlbResponse.ok) {
          throw new Error('MLB Stats API returned non-OK status');
        }

        const mlbData = await mlbResponse.json();

        scoreboard = {
          timestamp: new Date().toISOString(),
          date: date,
          games: mlbData.dates?.[0]?.games?.map((game: any) => ({
            id: game.gamePk,
            gameDate: game.gameDate,
            status: game.status,
            teams: {
              away: {
                team: game.teams.away.team,
                score: game.teams.away.score,
                isWinner: game.teams.away.isWinner,
                leagueRecord: game.teams.away.leagueRecord
              },
              home: {
                team: game.teams.home.team,
                score: game.teams.home.score,
                isWinner: game.teams.home.isWinner,
                leagueRecord: game.teams.home.leagueRecord
              }
            },
            venue: game.venue,
            seriesDescription: game.seriesDescription
          })) || [],
          meta: {
            dataSource: 'MLB Stats API',
            lastUpdated: new Date().toISOString()
          }
        };

        const allCompleted = scoreboard.games.every((g: any) => g.status.abstractGameState === 'Final');
        const ttl = allCompleted ? 300 : 30;

        if (env.SPORTS_CACHE) {
          await env.SPORTS_CACHE.put(cacheKey, JSON.stringify(scoreboard), {
            expirationTtl: ttl
          });
        }
      }

      return new Response(JSON.stringify(scoreboard, null, 2), {
        status: 200,
        headers
      });
    }

    // Standings endpoint
    if (route[0] === 'standings') {
      const cacheKey = 'mlb:standings';
      let standings = null;

      if (env.SPORTS_CACHE) {
        const cached = await env.SPORTS_CACHE.get(cacheKey, 'json');
        if (cached) standings = cached;
      }

      if (!standings) {
        const mlbResponse = await fetch(
          'https://statsapi.mlb.com/api/v1/standings?leagueId=103,104',
          {
            headers: {
              'User-Agent': 'BlazeSportsIntel/1.0',
              'Accept': 'application/json'
            }
          }
        );

        if (!mlbResponse.ok) {
          throw new Error('MLB Stats API returned non-OK status');
        }

        const mlbData = await mlbResponse.json();

        standings = {
          timestamp: new Date().toISOString(),
          records: mlbData.records?.map((div: any) => ({
            division: div.division,
            league: div.league,
            standingsType: div.standingsType,
            teams: div.teamRecords?.map((team: any) => ({
              team: team.team,
              wins: team.wins,
              losses: team.losses,
              winningPercentage: team.leagueRecord.pct,
              gamesBack: team.gamesBack,
              wildCardGamesBack: team.wildCardGamesBack,
              streak: team.streak,
              runsScored: team.runsScored,
              runsAllowed: team.runsAllowed
            }))
          })),
          meta: {
            dataSource: 'MLB Stats API',
            lastUpdated: new Date().toISOString()
          }
        };

        if (env.SPORTS_CACHE) {
          await env.SPORTS_CACHE.put(cacheKey, JSON.stringify(standings), {
            expirationTtl: 300
          });
        }
      }

      return new Response(JSON.stringify(standings, null, 2), {
        status: 200,
        headers
      });
    }

    return new Response(JSON.stringify({
      error: 'Not found',
      availableEndpoints: [
        '/api/mlb/teams',
        '/api/mlb/teams/{teamId}',
        '/api/mlb/scoreboard?date=YYYY-MM-DD',
        '/api/mlb/standings'
      ]
    }), {
      status: 404,
      headers
    });

  } catch (error: any) {
    console.error('MLB API error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers
    });
  }
};