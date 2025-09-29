// NCAA FOOTBALL - PRIORITY #1 - REAL ESPN DATA
export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const teamId = url.searchParams.get('teamId') || '251'; // 251 = Texas Longhorns

  // Demo fallback data (clearly labeled)
  const demoData = {
    team: {
      id: 251,
      displayName: "Texas Longhorns",
      abbreviation: "TEX",
      color: "BF5700",
      alternateColor: "333F48"
    },
    record: "DEMO: 13-3",
    conference: "SEC",
    cfp: "DEMO DATA",
    coach: "Steve Sarkisian",
    venue: "Darrell K Royal Stadium",
    dataSource: "DEMO MODE - ESPN API Not Connected",
    demo: true,
    demoWarning: "⚠️ DEMO DATA - Not Live"
  };

  try {
    // Attempt to fetch REAL data from ESPN API
    const espnTeamUrl = `https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams/${teamId}`;
    const espnStandingsUrl = 'https://site.api.espn.com/apis/v2/sports/football/college-football/standings';

    // Fetch team data and standings in parallel
    const [teamResponse, standingsResponse] = await Promise.allSettled([
      fetch(espnTeamUrl),
      fetch(espnStandingsUrl)
    ]);

    // Process team data
    let teamData = demoData;
    let isLiveData = false;

    if (teamResponse.status === 'fulfilled' && teamResponse.value.ok) {
      const espnData = await teamResponse.value.json();

      if (espnData.team) {
        teamData = {
          team: {
            id: espnData.team.id,
            displayName: espnData.team.displayName,
            abbreviation: espnData.team.abbreviation,
            color: espnData.team.color,
            alternateColor: espnData.team.alternateColor || "FFFFFF",
            logos: espnData.team.logos
          },
          location: espnData.team.location,
          nickname: espnData.team.nickname,
          record: espnData.team.record?.items?.[0]?.summary || "Season not started",
          conference: espnData.team.groups?.parent?.name || "Independent",
          venue: espnData.team.franchise?.venue?.fullName || "N/A",
          coach: espnData.team.coaches?.[0]?.name || "N/A",
          dataSource: "ESPN College Football API (LIVE)",
          demo: false,
          isLiveData: true
        };
        isLiveData = true;
      }
    }

    // Process standings for Top 25
    let top25 = [];
    if (standingsResponse.status === 'fulfilled' && standingsResponse.value.ok) {
      const standingsData = await standingsResponse.value.json();

      // Extract Top 25 from standings if available
      if (standingsData.children) {
        const allTeams = [];
        standingsData.children.forEach(conference => {
          if (conference.standings?.entries) {
            conference.standings.entries.forEach(entry => {
              if (entry.stats) {
                const rankStat = entry.stats.find(s => s.name === 'rank');
                if (rankStat && rankStat.value <= 25) {
                  allTeams.push({
                    rank: rankStat.value,
                    team: entry.team.displayName,
                    record: entry.stats.find(s => s.name === 'overall')?.displayValue || 'N/A',
                    conference: conference.name
                  });
                }
              }
            });
          }
        });

        // Sort by rank and take top 10 for display
        top25 = allTeams
          .sort((a, b) => a.rank - b.rank)
          .slice(0, 10);
      }
    }

    return new Response(JSON.stringify({
      ...teamData,
      top25: top25.length > 0 ? top25 : null,
      timestamp: new Date().toISOString(),
      season: "2024-2025",
      activeSport: true,
      isLiveData: isLiveData
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=60', // 1 minute cache for live data
        'X-Data-Source': isLiveData ? 'ESPN-Live' : 'Demo-Fallback'
      }
    });

  } catch (error) {
    console.error('NCAA Football API Error:', error);

    // Return demo data with clear warning
    return new Response(JSON.stringify({
      ...demoData,
      error: error.message,
      timestamp: new Date().toISOString(),
      demoWarning: "⚠️ DEMO MODE - ESPN API Connection Failed"
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Data-Source': 'Demo-Error-Fallback'
      },
      status: 200 // Return 200 with demo data instead of 503
    });
  }
}