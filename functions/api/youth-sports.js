// YOUTH FOOTBALL/BASEBALL - PRIORITY #5
export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const sport = url.searchParams.get('sport') || 'all';

  const data = {
    football: {
      texas_hs: {
        season: "2024-2025",
        championships: {
          "6A-DI": {
            champion: "North Crowley",
            runnerUp: "Duncanville",
            date: "2024-12-21"
          },
          "6A-DII": {
            champion: "Vandegrift",
            runnerUp: "DeSoto",
            date: "2024-12-20"
          }
        },
        topPrograms: [
          "Duncanville",
          "North Crowley",
          "DeSoto",
          "Southlake Carroll",
          "Westlake",
          "Allen"
        ],
        recruiting: {
          topProspects: [
            "Michael Fasusi - OT - Texas commit",
            "Dakorien Moore - WR - Oregon commit",
            "Jonah Williams - OLB - Texas A&M commit"
          ]
        },
        dataSource: "UIL Texas / MaxPreps"
      }
    },
    baseball: {
      perfect_game: {
        upcoming: [
          {
            tournament: "PG 17u World Series",
            location: "Fort Myers, FL",
            dates: "July 2025",
            teams: 144
          },
          {
            tournament: "PG National Championship",
            location: "Hoover, AL",
            dates: "June 2025",
            teams: 64
          }
        ],
        topProspects2025: [
          "Ethan Holliday - SS - Stillwater HS, OK",
          "Cameron Caminiti - LHP - Saguaro HS, AZ",
          "Blake Larsen - SS - IMG Academy, FL"
        ],
        texasTeams: [
          "Dallas Tigers",
          "Houston Banditos",
          "Texas Twelve",
          "Marucci Elite Texas"
        ],
        dataSource: "Perfect Game USA"
      }
    }
  };

  try {
    const response = {
      football: data.football,
      baseball: data.baseball,
      currentSeason: {
        football: "Playoffs complete, recruiting season active",
        baseball: "Showcase season, spring tournaments starting March"
      },
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=3600' // 1 hour cache
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Youth sports data unavailable',
      demo: true
    }), { status: 503 });
  }
}