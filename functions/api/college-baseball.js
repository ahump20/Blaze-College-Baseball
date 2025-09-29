// COLLEGE BASEBALL - PRIORITY #6
export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const conference = url.searchParams.get('conference') || 'sec';
  const team = url.searchParams.get('team') || 'texas';

  const data = {
    season: {
      status: "OFF-SEASON",
      openingDay: "2025-02-14",
      collegeWorldSeries: "2025-06-14 to 2025-06-24",
      venue: "Charles Schwab Field, Omaha"
    },
    teams: {
      texas: {
        name: "Texas Longhorns",
        conference: "SEC",
        lastSeason: {
          record: "37-24",
          conference: "14-16 Big 12",
          postseason: "Regional"
        },
        coach: "David Pierce",
        venue: "UFCU Disch-Falk Field",
        capacity: 9500,
        titles: {
          cws: 6,
          lastCWS: 2005,
          conference: 80
        }
      },
      texasAM: {
        name: "Texas A&M Aggies",
        conference: "SEC",
        lastSeason: {
          record: "53-14",
          conference: "20-10 SEC",
          postseason: "CWS Finals Runner-up"
        },
        coach: "Jim Schlossnagle",
        venue: "Blue Bell Park",
        capacity: 7100
      }
    },
    sec: {
      preseasonRankings: [
        "1. LSU Tigers",
        "2. Tennessee Volunteers",
        "3. Texas A&M Aggies",
        "4. Arkansas Razorbacks",
        "5. Vanderbilt Commodores",
        "6. Texas Longhorns",
        "7. Florida Gators",
        "8. South Carolina Gamecocks"
      ],
      lastChampion: "Tennessee",
      tournamentDates: "May 21-26, 2025",
      tournamentVenue: "Hoover, AL"
    },
    recruiting: {
      topTexasRecruits2025: [
        "Tyce Nichols - RHP - Barbers Hill HS",
        "Luke Belyeu - OF - Prosper HS",
        "Kaleb Stoglin - C - Friendswood HS"
      ],
      perfectGameRankings: {
        texas: 8,
        texasAM: 3,
        rice: 25,
        houston: 31
      }
    },
    dataSource: "D1Baseball / NCAA"
  };

  try {
    const response = {
      ...data,
      message: "College Baseball season starts February 14, 2025",
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=86400' // 24 hour cache in off-season
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'College Baseball data unavailable',
      season: data.season,
      demo: true
    }), { status: 503 });
  }
}