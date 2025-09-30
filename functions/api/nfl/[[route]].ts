/**
 * Blaze Sports Intel - NFL Analytics API
 * ESPN API Integration for Real-time NFL Data
 */

export interface Env {
  SPORTS_CACHE?: KVNamespace;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const route = (params.route as string[]) || [];

  // CORS headers
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
        // Return all teams
        const cacheKey = 'nfl:teams:all';
        let teams = null;

        // Try to get from cache
        if (env.SPORTS_CACHE) {
          const cached = await env.SPORTS_CACHE.get(cacheKey, 'json');
          if (cached) teams = cached;
        }

        if (!teams) {
          // Fetch from ESPN API
          const espnResponse = await fetch(
            'https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams',
            {
              headers: {
                'User-Agent': 'BlazeSportsIntel/1.0',
                'Accept': 'application/json'
              }
            }
          );

          if (!espnResponse.ok) {
            throw new Error('ESPN API returned non-OK status');
          }

          const espnData = await espnResponse.json();

          teams = {
            timestamp: new Date().toISOString(),
            teams: espnData.sports[0].leagues[0].teams.map((t: any) => ({
              id: t.team.id,
              name: t.team.displayName,
              abbreviation: t.team.abbreviation,
              location: t.team.location,
              color: t.team.color,
              logos: t.team.logos,
              links: t.team.links
            })),
            meta: {
              dataSource: 'ESPN NFL API',
              lastUpdated: new Date().toISOString()
            }
          };

          // Cache for 1 hour
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
        // Return specific team with full stats
        const cacheKey = `nfl:team:${teamId}:full`;
        let teamData = null;

        if (env.SPORTS_CACHE) {
          const cached = await env.SPORTS_CACHE.get(cacheKey, 'json');
          if (cached) teamData = cached;
        }

        if (!teamData) {
          // Fetch team details from ESPN
          const [teamInfo, roster, schedule, stats] = await Promise.all([
            fetch(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${teamId}`, {
              headers: {
                'User-Agent': 'BlazeSportsIntel/1.0',
                'Accept': 'application/json'
              }
            }).then(r => r.json()),
            fetch(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${teamId}/roster`, {
              headers: {
                'User-Agent': 'BlazeSportsIntel/1.0',
                'Accept': 'application/json'
              }
            }).then(r => r.json()).catch(() => null),
            fetch(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${teamId}/schedule`, {
              headers: {
                'User-Agent': 'BlazeSportsIntel/1.0',
                'Accept': 'application/json'
              }
            }).then(r => r.json()).catch(() => null),
            fetch(`https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/2024/types/2/teams/${teamId}/statistics`, {
              headers: {
                'User-Agent': 'BlazeSportsIntel/1.0',
                'Accept': 'application/json'
              }
            }).then(r => r.json()).catch(() => null)
          ]);

          const record = teamInfo.team?.record?.items?.[0] || {};
          const recordStats = record.stats || [];

          teamData = {
            timestamp: new Date().toISOString(),
            team: {
              id: teamInfo.team?.id,
              name: teamInfo.team?.displayName,
              abbreviation: teamInfo.team?.abbreviation,
              location: teamInfo.team?.location,
              color: teamInfo.team?.color,
              alternateColor: teamInfo.team?.alternateColor,
              logos: teamInfo.team?.logos,
              venue: teamInfo.team?.venue,
              record: {
                overall: record.summary || '0-0',
                wins: recordStats.find((s: any) => s.name === 'wins')?.value || 0,
                losses: recordStats.find((s: any) => s.name === 'losses')?.value || 0,
                winPercent: recordStats.find((s: any) => s.name === 'winPercent')?.value || 0,
                home: recordStats.find((s: any) => s.name === 'home')?.displayValue || '0-0',
                away: recordStats.find((s: any) => s.name === 'road')?.displayValue || '0-0',
                pointsFor: recordStats.find((s: any) => s.name === 'pointsFor')?.value || 0,
                pointsAgainst: recordStats.find((s: any) => s.name === 'pointsAgainst')?.value || 0,
                differential: recordStats.find((s: any) => s.name === 'pointDifferential')?.value || 0,
                streak: recordStats.find((s: any) => s.name === 'streak')?.displayValue || '-'
              }
            },
            roster: roster?.athletes?.map((a: any) => ({
              id: a.id,
              name: a.fullName,
              jersey: a.jersey,
              position: a.position?.abbreviation,
              height: a.displayHeight,
              weight: a.displayWeight,
              experience: a.experience?.displayValue,
              college: a.college?.name
            })) || [],
            schedule: schedule?.events?.map((e: any) => ({
              id: e.id,
              date: e.date,
              name: e.name,
              week: e.week?.number,
              seasonType: e.seasonType?.name,
              venue: e.competitions?.[0]?.venue,
              opponent: e.competitions?.[0]?.competitors?.find((c: any) => c.id !== teamId),
              result: {
                completed: e.status?.type?.completed,
                score: e.competitions?.[0]?.score,
                winner: e.competitions?.[0]?.winner
              },
              broadcast: e.competitions?.[0]?.broadcasts?.[0]
            })) || [],
            statistics: stats?.splits?.categories || [],
            meta: {
              dataSource: 'ESPN NFL API',
              lastUpdated: new Date().toISOString(),
              season: '2024'
            }
          };

          // Cache for 5 minutes
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
      const week = url.searchParams.get('week') || 'current';
      const cacheKey = `nfl:scoreboard:${week}`;
      let scoreboard = null;

      if (env.SPORTS_CACHE) {
        const cached = await env.SPORTS_CACHE.get(cacheKey, 'json');
        if (cached) scoreboard = cached;
      }

      if (!scoreboard) {
        const espnUrl = week === 'current'
          ? 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard'
          : `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?week=${week}`;

        const espnResponse = await fetch(espnUrl, {
          headers: {
            'User-Agent': 'BlazeSportsIntel/1.0',
            'Accept': 'application/json'
          }
        });

        if (!espnResponse.ok) {
          throw new Error('ESPN API returned non-OK status');
        }

        const espnData = await espnResponse.json();

        scoreboard = {
          timestamp: new Date().toISOString(),
          season: espnData.season,
          week: espnData.week,
          games: espnData.events?.map((event: any) => ({
            id: event.id,
            name: event.name,
            shortName: event.shortName,
            date: event.date,
            status: {
              type: event.status?.type?.name,
              detail: event.status?.type?.detail,
              completed: event.status?.type?.completed,
              period: event.status?.period,
              clock: event.status?.displayClock
            },
            teams: event.competitions?.[0]?.competitors?.map((team: any) => ({
              id: team.id,
              team: team.team,
              homeAway: team.homeAway,
              score: team.score,
              winner: team.winner,
              records: team.records,
              leaders: team.leaders
            })),
            odds: event.competitions?.[0]?.odds?.[0],
            broadcast: event.competitions?.[0]?.broadcasts?.[0],
            venue: event.competitions?.[0]?.venue,
            weather: event.weather
          })) || [],
          meta: {
            dataSource: 'ESPN NFL API',
            lastUpdated: new Date().toISOString()
          }
        };

        // Cache for 30 seconds for live games, 5 minutes for completed
        const allCompleted = scoreboard.games.every((g: any) => g.status.completed);
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
      const cacheKey = 'nfl:standings';
      let standings = null;

      if (env.SPORTS_CACHE) {
        const cached = await env.SPORTS_CACHE.get(cacheKey, 'json');
        if (cached) standings = cached;
      }

      if (!standings) {
        const espnResponse = await fetch(
          'https://cdn.espn.com/core/nfl/standings?xhr=1',
          {
            headers: {
              'User-Agent': 'BlazeSportsIntel/1.0',
              'Accept': 'application/json'
            }
          }
        );

        if (!espnResponse.ok) {
          throw new Error('ESPN API returned non-OK status');
        }

        const espnData = await espnResponse.json();

        standings = {
          timestamp: new Date().toISOString(),
          season: espnData.season,
          conferences: espnData.children?.map((conf: any) => ({
            name: conf.name,
            abbreviation: conf.abbreviation,
            divisions: conf.children?.map((div: any) => ({
              name: div.name,
              teams: div.standings?.entries?.map((entry: any) => ({
                team: {
                  id: entry.team?.id,
                  name: entry.team?.displayName,
                  abbreviation: entry.team?.abbreviation,
                  logo: entry.team?.logos?.[0]?.href
                },
                stats: entry.stats?.reduce((acc: any, stat: any) => {
                  acc[stat.name] = {
                    value: stat.value,
                    displayValue: stat.displayValue
                  };
                  return acc;
                }, {})
              }))
            }))
          })),
          meta: {
            dataSource: 'ESPN NFL API',
            lastUpdated: new Date().toISOString()
          }
        };

        // Cache for 5 minutes
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

    // Default 404
    return new Response(JSON.stringify({
      error: 'Not found',
      availableEndpoints: [
        '/api/nfl/teams - Get all NFL teams',
        '/api/nfl/teams/{teamId} - Get specific team with full stats',
        '/api/nfl/scoreboard - Get current week scores',
        '/api/nfl/scoreboard?week={week} - Get specific week scores',
        '/api/nfl/standings - Get league standings'
      ]
    }), {
      status: 404,
      headers
    });

  } catch (error: any) {
    console.error('NFL API error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers
    });
  }
};