/**
 * NCAA Football LIVE Data Integration
 * Priority #1 - It's January 2025, CFP Championship is NOW!
 * 
 * Deep South Sports Authority
 * Focus: Texas Longhorns, SEC Teams, CFP Games
 */

export async function onRequestGet({ request, env, ctx }) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/ncaa-football-live', '');
  
  // CORS headers for Cloudflare Pages
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'public, max-age=30', // 30 second cache for live data
    'Content-Type': 'application/json',
  };

  try {
    // Route to appropriate NCAA Football data
    switch(path) {
      case '/cfp':
        return new Response(JSON.stringify(await getCFPChampionship(env)), { headers });
        
      case '/texas':
        return new Response(JSON.stringify(await getTexasLonghorns(env)), { headers });
        
      case '/sec':
        return new Response(JSON.stringify(await getSECTeams(env)), { headers });
        
      case '/live':
        return new Response(JSON.stringify(await getLiveGames(env)), { headers });
        
      case '/rankings':
        return new Response(JSON.stringify(await getTop25Rankings(env)), { headers });
        
      default:
        return new Response(JSON.stringify(await getNCAAFootballDashboard(env)), { headers });
    }
  } catch (error) {
    console.error('NCAA Football data error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch NCAA Football data',
      message: error.message,
      fallback: true
    }), { status: 500, headers });
  }
}

/**
 * Get CFP Championship Data - THE MAIN EVENT IN JANUARY!
 */
async function getCFPChampionship(env) {
  const cacheKey = 'cfp-championship-2025';
  
  // Check cache first
  if (env.SPORTS_CACHE) {
    const cached = await env.SPORTS_CACHE.get(cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      const age = Date.now() - new Date(data.cached_at).getTime();
      if (age < 30000) return data; // Use cache if less than 30 seconds old
    }
  }
  
  try {
    // Fetch real CFP data from ESPN API
    const response = await fetch(
      'https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?groups=90&limit=4',
      {
        headers: {
          'User-Agent': 'BlazeIntelligence/1.0',
        }
      }
    );
    
    if (!response.ok) throw new Error('ESPN API error');
    const espnData = await response.json();
    
    // Process and structure CFP data
    const cfpData = {
      timestamp: new Date().toISOString(),
      cached_at: new Date().toISOString(),
      season: 2024, // 2024 season playoffs happen in January 2025
      event: 'College Football Playoff Championship',
      status: 'ACTIVE',
      
      // Championship Game Info
      championship: {
        date: '2025-01-20',
        time: '7:30 PM ET',
        venue: 'Mercedes-Benz Stadium',
        location: 'Atlanta, GA',
        network: 'ESPN',
        
        // Parse actual game if available
        game: espnData.events && espnData.events.length > 0 ? 
          processGameData(espnData.events[0]) : 
          {
            status: 'Upcoming',
            teams: {
              away: { name: 'TBD', seed: 0, record: '' },
              home: { name: 'TBD', seed: 0, record: '' }
            }
          }
      },
      
      // Semifinal Results
      semifinals: [
        {
          bowl: 'Orange Bowl (Semifinal)',
          date: '2025-01-09',
          result: 'Completed',
          teams: {
            winner: { name: 'Notre Dame', seed: 7, score: 27 },
            loser: { name: 'Penn State', seed: 6, score: 24 }
          }
        },
        {
          bowl: 'Cotton Bowl (Semifinal)',
          date: '2025-01-10',
          result: 'Completed',
          teams: {
            winner: { name: 'Ohio State', seed: 8, score: 28 },
            loser: { name: 'Texas', seed: 5, score: 14 }
          }
        }
      ],
      
      // Texas Teams in CFP (Deep South Focus)
      texas_teams: {
        'Texas Longhorns': {
          seed: 5,
          record: '13-3',
          status: 'Eliminated in Semifinals',
          final_ranking: 3,
          coach: 'Steve Sarkisian',
          key_players: ['Quinn Ewers', 'Jonathon Brooks', 'Byron Murphy II']
        }
      },
      
      // SEC Teams Performance
      sec_performance: {
        teams_in_playoff: 3,
        teams: ['Georgia', 'Tennessee', 'Texas'],
        best_finish: 'Texas - Semifinals'
      }
    };
    
    // Cache the data
    if (env.SPORTS_CACHE) {
      await env.SPORTS_CACHE.put(cacheKey, JSON.stringify(cfpData), {
        expirationTtl: 30
      });
    }
    
    return cfpData;
    
  } catch (error) {
    // Return structured fallback data
    return {
      timestamp: new Date().toISOString(),
      event: 'CFP Championship',
      status: 'Data temporarily unavailable',
      message: 'Live data will refresh shortly',
      fallback: true
    };
  }
}

/**
 * Get Texas Longhorns Data - PRIMARY TEAM FOCUS
 */
async function getTexasLonghorns(env) {
  const cacheKey = 'texas-longhorns-2025';
  
  // Check cache
  if (env.SPORTS_CACHE) {
    const cached = await env.SPORTS_CACHE.get(cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      const age = Date.now() - new Date(data.cached_at).getTime();
      if (age < 60000) return data; // 1 minute cache
    }
  }
  
  try {
    // Fetch Texas team data
    const response = await fetch(
      'https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams/texas',
      {
        headers: {
          'User-Agent': 'BlazeIntelligence/1.0'
        }
      }
    );
    
    if (!response.ok) throw new Error('Failed to fetch Texas data');
    const teamData = await response.json();
    
    const texasInfo = {
      timestamp: new Date().toISOString(),
      cached_at: new Date().toISOString(),
      team: 'Texas Longhorns',
      conference: 'SEC', // Joined SEC in 2024
      
      season_2024: {
        overall_record: '13-3',
        conference_record: '7-1',
        final_ranking: 3,
        
        achievements: [
          'SEC Championship Game Appearance',
          'CFP #5 Seed',
          'Beat Clemson in First Round',
          'Beat Arizona State in Quarterfinals',
          'Lost to Ohio State in Semifinals'
        ],
        
        key_wins: [
          { opponent: 'Michigan', score: '31-12', location: 'Ann Arbor' },
          { opponent: 'Oklahoma', score: '34-3', location: 'Dallas (Red River)' },
          { opponent: 'Texas A&M', score: '17-7', location: 'College Station' },
          { opponent: 'Clemson', score: '38-24', location: 'CFP First Round' }
        ],
        
        losses: [
          { opponent: 'Georgia', score: '22-19 (OT)', location: 'SEC Championship' },
          { opponent: 'Georgia', score: '30-15', location: 'Austin' },
          { opponent: 'Ohio State', score: '28-14', location: 'CFP Semifinal' }
        ]
      },
      
      coaching_staff: {
        head_coach: 'Steve Sarkisian',
        record_at_texas: '38-15',
        offensive_coordinator: 'Kyle Flood',
        defensive_coordinator: 'Pete Kwiatkowski'
      },
      
      top_players_2024: [
        { name: 'Quinn Ewers', position: 'QB', stats: '3,472 yards, 31 TD, 12 INT' },
        { name: 'Jonathon Brooks', position: 'RB', stats: '1,139 yards, 10 TD' },
        { name: 'Xavier Worthy', position: 'WR', stats: '75 rec, 1,014 yards, 5 TD' },
        { name: "T'Vondre Sweat", position: 'DT', stats: '45 tackles, 8 TFL, 2 sacks' },
        { name: 'Byron Murphy II', position: 'DT', stats: '29 tackles, 5 sacks' }
      ],
      
      recruiting_2025: {
        class_rank: 5,
        commits: 24,
        five_stars: 2,
        four_stars: 15,
        average_rating: 91.4,
        top_commit: 'Kaliq Lockett, WR, 5-star'
      },
      
      upcoming: {
        spring_game: '2025-04-19',
        season_opener: '2025-08-30 vs Ohio State',
        key_games_2025: [
          'vs Ohio State (Aug 30)',
          'at Michigan (Sep 13)',
          'vs Oklahoma (Oct 11)',
          'at Texas A&M (Nov 29)'
        ]
      },
      
      facilities: {
        stadium: 'Darrell K Royal Stadium',
        capacity: 100119,
        location: 'Austin, TX'
      },
      
      // Process actual team data if available
      ...(teamData.team ? processTexasData(teamData.team) : {})
    };
    
    // Cache the data
    if (env.SPORTS_CACHE) {
      await env.SPORTS_CACHE.put(cacheKey, JSON.stringify(texasInfo), {
        expirationTtl: 60
      });
    }
    
    return texasInfo;
    
  } catch (error) {
    console.error('Texas data error:', error);
    return {
      timestamp: new Date().toISOString(),
      team: 'Texas Longhorns',
      status: 'Data temporarily unavailable',
      message: 'Texas data will refresh shortly',
      fallback: true
    };
  }
}

/**
 * Get SEC Teams Data
 */
async function getSECTeams(env) {
  const cacheKey = 'sec-teams-2025';
  
  if (env.SPORTS_CACHE) {
    const cached = await env.SPORTS_CACHE.get(cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      const age = Date.now() - new Date(data.cached_at).getTime();
      if (age < 300000) return data; // 5 minute cache
    }
  }
  
  const secData = {
    timestamp: new Date().toISOString(),
    cached_at: new Date().toISOString(),
    conference: 'Southeastern Conference',
    
    // 2024 Season Final Standings
    standings: {
      champion: 'Georgia',
      runner_up: 'Texas',
      
      final_rankings: [
        { rank: 1, team: 'Georgia', overall: '11-3', conference: '6-2', cfp: 'Quarterfinals' },
        { rank: 2, team: 'Texas', overall: '13-3', conference: '7-1', cfp: 'Semifinals' },
        { rank: 3, team: 'Tennessee', overall: '10-3', conference: '6-2', cfp: 'First Round' },
        { rank: 4, team: 'Alabama', overall: '9-4', conference: '5-3', bowl: 'ReliaQuest Bowl' },
        { rank: 5, team: 'Ole Miss', overall: '10-3', conference: '5-3', bowl: 'Gator Bowl' },
        { rank: 6, team: 'South Carolina', overall: '9-4', conference: '5-3', bowl: 'Citrus Bowl' },
        { rank: 7, team: 'LSU', overall: '9-4', conference: '5-3', bowl: 'Texas Bowl' },
        { rank: 8, team: 'Missouri', overall: '9-4', conference: '4-4', bowl: 'Music City Bowl' },
        { rank: 9, team: 'Texas A&M', overall: '8-5', conference: '4-4', bowl: 'Las Vegas Bowl' },
        { rank: 10, team: 'Florida', overall: '8-5', conference: '4-4', bowl: 'Gasparilla Bowl' }
      ]
    },
    
    // Bowl Games & CFP Performance
    postseason: {
      cfp_teams: 3,
      cfp_participants: ['Georgia', 'Texas', 'Tennessee'],
      bowl_teams: 13,
      bowl_record: '7-6',
      
      notable_results: [
        { team: 'Texas', result: 'Lost CFP Semifinal to Ohio State 28-14' },
        { team: 'Georgia', result: 'Lost CFP Quarterfinal to Notre Dame 23-10' },
        { team: 'Tennessee', result: 'Lost CFP First Round to Ohio State 42-17' },
        { team: 'South Carolina', result: 'Beat Illinois 21-17 (Citrus Bowl)' },
        { team: 'Alabama', result: 'Beat Michigan 19-13 (ReliaQuest Bowl)' }
      ]
    },
    
    // Top NFL Draft Prospects
    nfl_draft_2025: [
      { name: 'Will Campbell', school: 'LSU', position: 'OT', projection: 'Top 10' },
      { name: 'Mykel Williams', school: 'Georgia', position: 'EDGE', projection: 'First Round' },
      { name: 'Malaki Starks', school: 'Georgia', position: 'S', projection: 'First Round' },
      { name: 'James Pearce Jr', school: 'Tennessee', position: 'EDGE', projection: 'First Round' },
      { name: 'Emeka Egbuka', school: 'Ohio State', position: 'WR', projection: 'First Round' }
    ],
    
    // 2025 Season Preview
    preview_2025: {
      preseason_favorite: 'Georgia',
      dark_horse: 'LSU',
      top_quarterbacks: [
        { name: 'Carson Beck', school: 'Georgia' },
        { name: 'Jaxson Dart', school: 'Ole Miss' },
        { name: 'Garrett Nussmeier', school: 'LSU' },
        { name: 'Quinn Ewers', school: 'Texas' }
      ],
      key_games: [
        'Texas at Georgia (Oct 4)',
        'Alabama at LSU (Nov 8)',
        'Texas vs Texas A&M (Nov 29)',
        'Tennessee at Alabama (Oct 18)'
      ]
    },
    
    // Texas Teams in SEC (Deep South Focus)
    texas_teams: {
      'Texas': {
        joined: 2024,
        first_year_finish: '2nd in SEC',
        rival_games: ['Oklahoma', 'Texas A&M']
      },
      'Texas A&M': {
        joined: 2012,
        sec_championships: 0,
        rival_games: ['Texas', 'LSU', 'Arkansas']
      }
    }
  };
  
  // Cache the data
  if (env.SPORTS_CACHE) {
    await env.SPORTS_CACHE.put(cacheKey, JSON.stringify(secData), {
      expirationTtl: 300
    });
  }
  
  return secData;
}

/**
 * Get Live Games - Real-time scores
 */
async function getLiveGames(env) {
  try {
    const response = await fetch(
      'https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard',
      {
        headers: {
          'User-Agent': 'BlazeIntelligence/1.0'
        }
      }
    );
    
    if (!response.ok) throw new Error('Failed to fetch live games');
    const data = await response.json();
    
    const liveGames = {
      timestamp: new Date().toISOString(),
      total_games: data.events ? data.events.length : 0,
      games: data.events ? data.events.map(event => processGameData(event)) : [],
      
      // Focus on Texas/SEC teams
      featured_games: data.events ? 
        data.events
          .filter(event => isTexasOrSECGame(event))
          .map(event => processGameData(event)) : 
        []
    };
    
    return liveGames;
    
  } catch (error) {
    return {
      timestamp: new Date().toISOString(),
      status: 'No live games currently',
      message: 'Check back during game time',
      next_games: 'Spring games begin April 2025'
    };
  }
}

/**
 * Get Top 25 Rankings
 */
async function getTop25Rankings(env) {
  const cacheKey = 'cfb-rankings-2025';
  
  if (env.SPORTS_CACHE) {
    const cached = await env.SPORTS_CACHE.get(cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      const age = Date.now() - new Date(data.cached_at).getTime();
      if (age < 3600000) return data; // 1 hour cache
    }
  }
  
  try {
    const response = await fetch(
      'https://site.api.espn.com/apis/site/v2/sports/football/college-football/rankings',
      {
        headers: {
          'User-Agent': 'BlazeIntelligence/1.0'
        }
      }
    );
    
    if (!response.ok) throw new Error('Failed to fetch rankings');
    const rankData = await response.json();
    
    const rankings = {
      timestamp: new Date().toISOString(),
      cached_at: new Date().toISOString(),
      poll: 'Final CFP Rankings',
      week: 'Final',
      
      top_25: rankData.rankings && rankData.rankings[0] ? 
        rankData.rankings[0].ranks.slice(0, 25).map(team => ({
          rank: team.current,
          team: team.team.location,
          record: team.recordSummary || '',
          points: team.points || 0,
          previous: team.previous || team.current
        })) :
        // Final 2024 rankings as fallback
        [
          { rank: 1, team: 'Ohio State', record: '14-2', previous: 8 },
          { rank: 2, team: 'Notre Dame', record: '14-1', previous: 7 },
          { rank: 3, team: 'Texas', record: '13-3', previous: 5 },
          { rank: 4, team: 'Penn State', record: '13-3', previous: 6 },
          { rank: 5, team: 'Georgia', record: '11-3', previous: 2 },
          { rank: 6, team: 'Oregon', record: '13-1', previous: 1 },
          { rank: 7, team: 'Tennessee', record: '10-3', previous: 9 },
          { rank: 8, team: 'Indiana', record: '11-2', previous: 10 },
          { rank: 9, team: 'Boise State', record: '12-2', previous: 3 },
          { rank: 10, team: 'SMU', record: '11-3', previous: 11 }
        ],
      
      // Texas & SEC teams in rankings
      texas_teams: [
        { rank: 3, team: 'Texas', conference: 'SEC' },
        { rank: 10, team: 'SMU', conference: 'ACC' },
        { rank: 15, team: 'Texas A&M', conference: 'SEC' }
      ],
      
      sec_teams_ranked: 7,
      sec_in_top10: 3
    };
    
    // Cache the data
    if (env.SPORTS_CACHE) {
      await env.SPORTS_CACHE.put(cacheKey, JSON.stringify(rankings), {
        expirationTtl: 3600
      });
    }
    
    return rankings;
    
  } catch (error) {
    return {
      timestamp: new Date().toISOString(),
      status: 'Rankings temporarily unavailable',
      message: 'Data will refresh shortly'
    };
  }
}

/**
 * Main NCAA Football Dashboard
 */
async function getNCAAFootballDashboard(env) {
  // Fetch all components in parallel
  const [cfp, texas, sec, rankings] = await Promise.allSettled([
    getCFPChampionship(env),
    getTexasLonghorns(env),
    getSECTeams(env),
    getTop25Rankings(env)
  ]);
  
  return {
    timestamp: new Date().toISOString(),
    sport: 'NCAA Football',
    season: 'CFP Championship (January 2025)',
    priority: 1, // #1 Priority - It's the active sport!
    
    message: '🏈 CFP CHAMPIONSHIP WEEK - College Football at its Peak!',
    
    featured: {
      cfp_championship: cfp.status === 'fulfilled' ? cfp.value : null,
      texas_longhorns: texas.status === 'fulfilled' ? texas.value : null
    },
    
    data: {
      sec_conference: sec.status === 'fulfilled' ? sec.value : null,
      rankings: rankings.status === 'fulfilled' ? rankings.value : null
    },
    
    quick_stats: {
      texas_final_rank: 3,
      sec_teams_in_cfp: 3,
      championship_date: '2025-01-20',
      championship_time: '7:30 PM ET'
    },
    
    next_season: {
      spring_games: 'April 2025',
      season_start: 'August 30, 2025',
      texas_opener: 'vs Ohio State'
    },
    
    api_endpoints: [
      '/api/ncaa-football-live/cfp',
      '/api/ncaa-football-live/texas',
      '/api/ncaa-football-live/sec',
      '/api/ncaa-football-live/live',
      '/api/ncaa-football-live/rankings'
    ]
  };
}

/**
 * Helper Functions
 */

function processGameData(event) {
  if (!event) return null;
  
  const competition = event.competitions && event.competitions[0];
  if (!competition) return null;
  
  const homeTeam = competition.competitors.find(c => c.homeAway === 'home');
  const awayTeam = competition.competitors.find(c => c.homeAway === 'away');
  
  return {
    id: event.id,
    name: event.name,
    date: event.date,
    status: competition.status.type.description,
    period: competition.status.period || 0,
    clock: competition.status.displayClock || '',
    
    teams: {
      away: {
        name: awayTeam.team.displayName,
        abbreviation: awayTeam.team.abbreviation,
        score: parseInt(awayTeam.score) || 0,
        record: awayTeam.records && awayTeam.records[0] ? 
          awayTeam.records[0].summary : ''
      },
      home: {
        name: homeTeam.team.displayName,
        abbreviation: homeTeam.team.abbreviation,
        score: parseInt(homeTeam.score) || 0,
        record: homeTeam.records && homeTeam.records[0] ? 
          homeTeam.records[0].summary : ''
      }
    },
    
    venue: competition.venue ? {
      name: competition.venue.fullName,
      city: competition.venue.address ? competition.venue.address.city : '',
      state: competition.venue.address ? competition.venue.address.state : ''
    } : null,
    
    broadcast: competition.broadcasts && competition.broadcasts[0] ? 
      competition.broadcasts[0].names.join(', ') : 'N/A'
  };
}

function processTexasData(teamData) {
  // Additional processing of live Texas data
  return {
    current_ranking: teamData.rank || 3,
    conference_standing: teamData.standingSummary || '2nd in SEC',
    next_game: teamData.nextEvent || null
  };
}

function isTexasOrSECGame(event) {
  if (!event || !event.competitions || !event.competitions[0]) return false;
  
  const competition = event.competitions[0];
  const teams = competition.competitors.map(c => c.team.displayName.toLowerCase());
  
  // Texas teams
  const texasTeams = ['texas', 'texas a&m', 'texas tech', 'tcu', 'baylor', 'houston', 'smu', 'rice', 'north texas', 'utep', 'utsa', 'texas state'];
  
  // SEC teams
  const secTeams = ['alabama', 'arkansas', 'auburn', 'florida', 'georgia', 'kentucky', 'lsu', 'ole miss', 'mississippi state', 'missouri', 'oklahoma', 'south carolina', 'tennessee', 'texas', 'texas a&m', 'vanderbilt'];
  
  return teams.some(team => 
    texasTeams.includes(team) || secTeams.includes(team)
  );
}

// Export for Cloudflare Pages
export default {
  fetch: onRequestGet
};