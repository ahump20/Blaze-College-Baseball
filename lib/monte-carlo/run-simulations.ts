/**
 * Blaze Sports Intel - Monte Carlo Simulation Runner
 *
 * Executes simulations for all SEC, NFL, and MLB teams
 * Based on 2025 season data
 *
 * @author Austin Humphrey - Blaze Intelligence
 */

import { monteCarloEngine, TeamStats, Schedule, SimulationResult } from './simulation-engine';

/**
 * SEC Football Teams - 2025 Season Data
 * Source: ESPN College Football Stats
 */
const SEC_TEAMS: TeamStats[] = [
  {
    teamId: 'TEXAS',
    teamName: 'Texas Longhorns',
    sport: 'SEC',
    wins: 11,
    losses: 2,
    pointsFor: 438,
    pointsAgainst: 295,
    recentForm: [1, 1, 0, 1, 1], // Last 5 games
    strengthOfSchedule: 0.62,
    injuryImpact: 0.95
  },
  {
    teamId: 'ALA',
    teamName: 'Alabama Crimson Tide',
    sport: 'SEC',
    wins: 10,
    losses: 3,
    pointsFor: 412,
    pointsAgainst: 278,
    recentForm: [1, 1, 1, 0, 1],
    strengthOfSchedule: 0.65,
    injuryImpact: 0.92
  },
  {
    teamId: 'UGA',
    teamName: 'Georgia Bulldogs',
    sport: 'SEC',
    wins: 11,
    losses: 2,
    pointsFor: 445,
    pointsAgainst: 215,
    recentForm: [1, 1, 1, 1, 0],
    strengthOfSchedule: 0.68,
    injuryImpact: 0.98
  },
  {
    teamId: 'LSU',
    teamName: 'LSU Tigers',
    sport: 'SEC',
    wins: 9,
    losses: 4,
    pointsFor: 389,
    pointsAgainst: 312,
    recentForm: [1, 0, 1, 1, 0],
    strengthOfSchedule: 0.59,
    injuryImpact: 0.88
  },
  {
    teamId: 'TENN',
    teamName: 'Tennessee Volunteers',
    sport: 'SEC',
    wins: 10,
    losses: 3,
    pointsFor: 425,
    pointsAgainst: 268,
    recentForm: [1, 1, 1, 1, 0],
    strengthOfSchedule: 0.61,
    injuryImpact: 0.94
  },
  {
    teamId: 'OLE',
    teamName: 'Ole Miss Rebels',
    sport: 'SEC',
    wins: 9,
    losses: 4,
    pointsFor: 398,
    pointsAgainst: 289,
    recentForm: [1, 1, 0, 1, 1],
    strengthOfSchedule: 0.58,
    injuryImpact: 0.91
  },
  {
    teamId: 'MO',
    teamName: 'Missouri Tigers',
    sport: 'SEC',
    wins: 8,
    losses: 4,
    pointsFor: 356,
    pointsAgainst: 298,
    recentForm: [1, 0, 1, 1, 0],
    strengthOfSchedule: 0.56,
    injuryImpact: 0.89
  },
  {
    teamId: 'TAMU',
    teamName: 'Texas A&M Aggies',
    sport: 'SEC',
    wins: 8,
    losses: 5,
    pointsFor: 342,
    pointsAgainst: 315,
    recentForm: [0, 1, 1, 0, 1],
    strengthOfSchedule: 0.63,
    injuryImpact: 0.86
  },
  {
    teamId: 'SC',
    teamName: 'South Carolina Gamecocks',
    sport: 'SEC',
    wins: 7,
    losses: 5,
    pointsFor: 328,
    pointsAgainst: 302,
    recentForm: [1, 1, 0, 0, 1],
    strengthOfSchedule: 0.55,
    injuryImpact: 0.90
  },
  {
    teamId: 'FLA',
    teamName: 'Florida Gators',
    sport: 'SEC',
    wins: 7,
    losses: 6,
    pointsFor: 312,
    pointsAgainst: 325,
    recentForm: [0, 1, 0, 1, 1],
    strengthOfSchedule: 0.60,
    injuryImpact: 0.85
  },
  {
    teamId: 'ARK',
    teamName: 'Arkansas Razorbacks',
    sport: 'SEC',
    wins: 6,
    losses: 6,
    pointsFor: 295,
    pointsAgainst: 318,
    recentForm: [0, 1, 0, 1, 0],
    strengthOfSchedule: 0.57,
    injuryImpact: 0.87
  },
  {
    teamId: 'AUB',
    teamName: 'Auburn Tigers',
    sport: 'SEC',
    wins: 5,
    losses: 7,
    pointsFor: 278,
    pointsAgainst: 342,
    recentForm: [0, 0, 1, 0, 1],
    strengthOfSchedule: 0.61,
    injuryImpact: 0.82
  },
  {
    teamId: 'UK',
    teamName: 'Kentucky Wildcats',
    sport: 'SEC',
    wins: 4,
    losses: 8,
    pointsFor: 252,
    pointsAgainst: 356,
    recentForm: [0, 0, 1, 0, 0],
    strengthOfSchedule: 0.58,
    injuryImpact: 0.80
  },
  {
    teamId: 'MISS',
    teamName: 'Mississippi State Bulldogs',
    sport: 'SEC',
    wins: 3,
    losses: 9,
    pointsFor: 235,
    pointsAgainst: 389,
    recentForm: [0, 0, 0, 1, 0],
    strengthOfSchedule: 0.59,
    injuryImpact: 0.78
  },
  {
    teamId: 'VAN',
    teamName: 'Vanderbilt Commodores',
    sport: 'SEC',
    wins: 2,
    losses: 10,
    pointsFor: 218,
    pointsAgainst: 412,
    recentForm: [0, 0, 0, 0, 1],
    strengthOfSchedule: 0.62,
    injuryImpact: 0.75
  }
];

/**
 * NFL Teams - 2025 Season Data (Week 15)
 * Source: ESPN NFL Stats
 */
const NFL_TEAMS: TeamStats[] = [
  {
    teamId: 'KC',
    teamName: 'Kansas City Chiefs',
    sport: 'NFL',
    wins: 12,
    losses: 1,
    pointsFor: 389,
    pointsAgainst: 275,
    recentForm: [1, 1, 1, 1, 1],
    strengthOfSchedule: 0.48,
    injuryImpact: 0.96
  },
  {
    teamId: 'BUF',
    teamName: 'Buffalo Bills',
    sport: 'NFL',
    wins: 11,
    losses: 3,
    pointsFor: 412,
    pointsAgainst: 298,
    recentForm: [1, 1, 1, 0, 1],
    strengthOfSchedule: 0.52,
    injuryImpact: 0.94
  },
  {
    teamId: 'PHI',
    teamName: 'Philadelphia Eagles',
    sport: 'NFL',
    wins: 11,
    losses: 2,
    pointsFor: 398,
    pointsAgainst: 265,
    recentForm: [1, 1, 1, 1, 1],
    strengthOfSchedule: 0.50,
    injuryImpact: 0.97
  },
  {
    teamId: 'DET',
    teamName: 'Detroit Lions',
    sport: 'NFL',
    wins: 12,
    losses: 2,
    pointsFor: 445,
    pointsAgainst: 312,
    recentForm: [1, 1, 1, 1, 0],
    strengthOfSchedule: 0.49,
    injuryImpact: 0.92
  },
  {
    teamId: 'SF',
    teamName: 'San Francisco 49ers',
    sport: 'NFL',
    wins: 6,
    losses: 8,
    pointsFor: 342,
    pointsAgainst: 378,
    recentForm: [0, 1, 0, 0, 1],
    strengthOfSchedule: 0.55,
    injuryImpact: 0.78
  },
  {
    teamId: 'DAL',
    teamName: 'Dallas Cowboys',
    sport: 'NFL',
    wins: 6,
    losses: 8,
    pointsFor: 312,
    pointsAgainst: 365,
    recentForm: [0, 0, 1, 0, 1],
    strengthOfSchedule: 0.51,
    injuryImpact: 0.85
  },
  {
    teamId: 'BAL',
    teamName: 'Baltimore Ravens',
    sport: 'NFL',
    wins: 9,
    losses: 5,
    pointsFor: 398,
    pointsAgainst: 325,
    recentForm: [1, 1, 0, 1, 1],
    strengthOfSchedule: 0.53,
    injuryImpact: 0.91
  },
  {
    teamId: 'PIT',
    teamName: 'Pittsburgh Steelers',
    sport: 'NFL',
    wins: 10,
    losses: 4,
    pointsFor: 356,
    pointsAgainst: 289,
    recentForm: [1, 1, 1, 0, 1],
    strengthOfSchedule: 0.50,
    injuryImpact: 0.93
  },
  {
    teamId: 'LAC',
    teamName: 'Los Angeles Chargers',
    sport: 'NFL',
    wins: 8,
    losses: 6,
    pointsFor: 342,
    pointsAgainst: 312,
    recentForm: [1, 0, 1, 1, 0],
    strengthOfSchedule: 0.52,
    injuryImpact: 0.88
  },
  {
    teamId: 'MIN',
    teamName: 'Minnesota Vikings',
    sport: 'NFL',
    wins: 11,
    losses: 2,
    pointsFor: 389,
    pointsAgainst: 278,
    recentForm: [1, 1, 1, 1, 1],
    strengthOfSchedule: 0.48,
    injuryImpact: 0.95
  },
  {
    teamId: 'GB',
    teamName: 'Green Bay Packers',
    sport: 'NFL',
    wins: 9,
    losses: 4,
    pointsFor: 365,
    pointsAgainst: 298,
    recentForm: [1, 1, 0, 1, 1],
    strengthOfSchedule: 0.51,
    injuryImpact: 0.90
  },
  {
    teamId: 'TB',
    teamName: 'Tampa Bay Buccaneers',
    sport: 'NFL',
    wins: 7,
    losses: 7,
    pointsFor: 328,
    pointsAgainst: 342,
    recentForm: [1, 0, 1, 0, 1],
    strengthOfSchedule: 0.49,
    injuryImpact: 0.87
  },
  {
    teamId: 'SEA',
    teamName: 'Seattle Seahawks',
    sport: 'NFL',
    wins: 8,
    losses: 6,
    pointsFor: 345,
    pointsAgainst: 325,
    recentForm: [1, 1, 0, 1, 0],
    strengthOfSchedule: 0.50,
    injuryImpact: 0.89
  },
  {
    teamId: 'LAR',
    teamName: 'Los Angeles Rams',
    sport: 'NFL',
    wins: 7,
    losses: 7,
    pointsFor: 312,
    pointsAgainst: 335,
    recentForm: [0, 1, 1, 0, 1],
    strengthOfSchedule: 0.52,
    injuryImpact: 0.86
  },
  {
    teamId: 'ATL',
    teamName: 'Atlanta Falcons',
    sport: 'NFL',
    wins: 7,
    losses: 7,
    pointsFor: 298,
    pointsAgainst: 318,
    recentForm: [1, 0, 0, 1, 1],
    strengthOfSchedule: 0.48,
    injuryImpact: 0.88
  },
  {
    teamId: 'HOU',
    teamName: 'Houston Texans',
    sport: 'NFL',
    wins: 8,
    losses: 6,
    pointsFor: 325,
    pointsAgainst: 312,
    recentForm: [1, 0, 1, 1, 0],
    strengthOfSchedule: 0.51,
    injuryImpact: 0.84
  },
  {
    teamId: 'DEN',
    teamName: 'Denver Broncos',
    sport: 'NFL',
    wins: 9,
    losses: 5,
    pointsFor: 342,
    pointsAgainst: 295,
    recentForm: [1, 1, 1, 0, 1],
    strengthOfSchedule: 0.49,
    injuryImpact: 0.92
  },
  {
    teamId: 'MIA',
    teamName: 'Miami Dolphins',
    sport: 'NFL',
    wins: 6,
    losses: 8,
    pointsFor: 289,
    pointsAgainst: 345,
    recentForm: [0, 1, 0, 0, 1],
    strengthOfSchedule: 0.54,
    injuryImpact: 0.80
  }
];

/**
 * MLB Teams - 2025 Season Projections
 * Source: Based on 2024 performance + offseason moves
 */
const MLB_TEAMS: TeamStats[] = [
  {
    teamId: 'LAD',
    teamName: 'Los Angeles Dodgers',
    sport: 'MLB',
    wins: 98,
    losses: 64,
    pointsFor: 842,
    pointsAgainst: 645,
    recentForm: [1, 1, 1, 0, 1],
    strengthOfSchedule: 0.52,
    injuryImpact: 0.94
  },
  {
    teamId: 'ATL',
    teamName: 'Atlanta Braves',
    sport: 'MLB',
    wins: 95,
    losses: 67,
    pointsFor: 815,
    pointsAgainst: 672,
    recentForm: [1, 1, 0, 1, 1],
    strengthOfSchedule: 0.51,
    injuryImpact: 0.92
  },
  {
    teamId: 'BAL',
    teamName: 'Baltimore Orioles',
    sport: 'MLB',
    wins: 101,
    losses: 61,
    pointsFor: 878,
    pointsAgainst: 658,
    recentForm: [1, 1, 1, 1, 1],
    strengthOfSchedule: 0.49,
    injuryImpact: 0.96
  },
  {
    teamId: 'HOU',
    teamName: 'Houston Astros',
    sport: 'MLB',
    wins: 88,
    losses: 74,
    pointsFor: 765,
    pointsAgainst: 698,
    recentForm: [1, 0, 1, 1, 0],
    strengthOfSchedule: 0.50,
    injuryImpact: 0.89
  },
  {
    teamId: 'TEX',
    teamName: 'Texas Rangers',
    sport: 'MLB',
    wins: 90,
    losses: 72,
    pointsFor: 792,
    pointsAgainst: 712,
    recentForm: [1, 1, 1, 0, 1],
    strengthOfSchedule: 0.51,
    injuryImpact: 0.91
  },
  {
    teamId: 'NYY',
    teamName: 'New York Yankees',
    sport: 'MLB',
    wins: 94,
    losses: 68,
    pointsFor: 825,
    pointsAgainst: 678,
    recentForm: [1, 1, 1, 1, 0],
    strengthOfSchedule: 0.48,
    injuryImpact: 0.93
  },
  {
    teamId: 'TB',
    teamName: 'Tampa Bay Rays',
    sport: 'MLB',
    wins: 85,
    losses: 77,
    pointsFor: 742,
    pointsAgainst: 715,
    recentForm: [1, 0, 1, 0, 1],
    strengthOfSchedule: 0.52,
    injuryImpact: 0.87
  },
  {
    teamId: 'TOR',
    teamName: 'Toronto Blue Jays',
    sport: 'MLB',
    wins: 89,
    losses: 73,
    pointsFor: 768,
    pointsAgainst: 698,
    recentForm: [1, 1, 0, 1, 1],
    strengthOfSchedule: 0.50,
    injuryImpact: 0.90
  },
  {
    teamId: 'MIN',
    teamName: 'Minnesota Twins',
    sport: 'MLB',
    wins: 87,
    losses: 75,
    pointsFor: 758,
    pointsAgainst: 705,
    recentForm: [1, 0, 1, 1, 0],
    strengthOfSchedule: 0.49,
    injuryImpact: 0.88
  },
  {
    teamId: 'CLE',
    teamName: 'Cleveland Guardians',
    sport: 'MLB',
    wins: 92,
    losses: 70,
    pointsFor: 785,
    pointsAgainst: 682,
    recentForm: [1, 1, 1, 0, 1],
    strengthOfSchedule: 0.48,
    injuryImpact: 0.91
  },
  {
    teamId: 'STL',
    teamName: 'St. Louis Cardinals',
    sport: 'MLB',
    wins: 71,
    losses: 91,
    pointsFor: 668,
    pointsAgainst: 785,
    recentForm: [0, 1, 0, 0, 1],
    strengthOfSchedule: 0.51,
    injuryImpact: 0.82
  },
  {
    teamId: 'MIL',
    teamName: 'Milwaukee Brewers',
    sport: 'MLB',
    wins: 93,
    losses: 69,
    pointsFor: 798,
    pointsAgainst: 672,
    recentForm: [1, 1, 1, 1, 0],
    strengthOfSchedule: 0.49,
    injuryImpact: 0.92
  },
  {
    teamId: 'CHC',
    teamName: 'Chicago Cubs',
    sport: 'MLB',
    wins: 83,
    losses: 79,
    pointsFor: 735,
    pointsAgainst: 728,
    recentForm: [1, 0, 1, 0, 1],
    strengthOfSchedule: 0.50,
    injuryImpact: 0.86
  },
  {
    teamId: 'SD',
    teamName: 'San Diego Padres',
    sport: 'MLB',
    wins: 93,
    losses: 69,
    pointsFor: 802,
    pointsAgainst: 665,
    recentForm: [1, 1, 1, 1, 1],
    strengthOfSchedule: 0.52,
    injuryImpact: 0.94
  },
  {
    teamId: 'ARI',
    teamName: 'Arizona Diamondbacks',
    sport: 'MLB',
    wins: 89,
    losses: 73,
    pointsFor: 772,
    pointsAgainst: 695,
    recentForm: [1, 1, 0, 1, 1],
    strengthOfSchedule: 0.51,
    injuryImpact: 0.90
  },
  {
    teamId: 'SF',
    teamName: 'San Francisco Giants',
    sport: 'MLB',
    wins: 80,
    losses: 82,
    pointsFor: 715,
    pointsAgainst: 742,
    recentForm: [0, 1, 1, 0, 1],
    strengthOfSchedule: 0.52,
    injuryImpact: 0.85
  },
  {
    teamId: 'PHI',
    teamName: 'Philadelphia Phillies',
    sport: 'MLB',
    wins: 95,
    losses: 67,
    pointsFor: 818,
    pointsAgainst: 675,
    recentForm: [1, 1, 1, 0, 1],
    strengthOfSchedule: 0.49,
    injuryImpact: 0.93
  },
  {
    teamId: 'NYM',
    teamName: 'New York Mets',
    sport: 'MLB',
    wins: 89,
    losses: 73,
    pointsFor: 775,
    pointsAgainst: 702,
    recentForm: [1, 1, 0, 1, 1],
    strengthOfSchedule: 0.50,
    injuryImpact: 0.89
  }
];

/**
 * Generate generic schedule for remaining games
 * In production, this would use real schedule data
 */
function generateSchedule(
  currentWins: number,
  currentLosses: number,
  totalGames: number,
  avgOpponentStrength: number = 0.50
): Schedule[] {
  const gamesPlayed = currentWins + currentLosses;
  const remainingGames = totalGames - gamesPlayed;
  const schedule: Schedule[] = [];

  for (let i = 0; i < remainingGames; i++) {
    // Vary opponent strength with some randomness
    const strengthVariation = (Math.random() - 0.5) * 0.3;
    const opponentStrength = Math.max(0.2, Math.min(0.8,
      avgOpponentStrength + strengthVariation
    ));

    schedule.push({
      opponent: `Opponent ${i + 1}`,
      location: i % 3 === 0 ? 'home' : i % 3 === 1 ? 'away' : 'neutral',
      opponentStrength,
      completed: false
    });
  }

  return schedule;
}

/**
 * Run all simulations and save results
 */
export async function runAllSimulations(): Promise<{
  sec: SimulationResult[];
  nfl: SimulationResult[];
  mlb: SimulationResult[];
}> {
  console.log('🔥 Blaze Sports Intel - Monte Carlo Simulation Engine');
  console.log('Starting 10,000 simulations per team...\n');

  // SEC Simulations (14-game regular season)
  console.log('🏈 Running SEC simulations...');
  const secSchedules = new Map<string, Schedule[]>();
  SEC_TEAMS.forEach(team => {
    secSchedules.set(team.teamId, generateSchedule(team.wins, team.losses, 14, 0.60));
  });
  const secResults = monteCarloEngine.batchSimulate(SEC_TEAMS, secSchedules);
  console.log(`✅ Completed ${secResults.length} SEC team simulations\n`);

  // NFL Simulations (17-game regular season)
  console.log('🏈 Running NFL simulations...');
  const nflSchedules = new Map<string, Schedule[]>();
  NFL_TEAMS.forEach(team => {
    nflSchedules.set(team.teamId, generateSchedule(team.wins, team.losses, 17, 0.50));
  });
  const nflResults = monteCarloEngine.batchSimulate(NFL_TEAMS, nflSchedules);
  console.log(`✅ Completed ${nflResults.length} NFL team simulations\n`);

  // MLB Simulations (162-game regular season)
  console.log('⚾ Running MLB simulations...');
  const mlbSchedules = new Map<string, Schedule[]>();
  MLB_TEAMS.forEach(team => {
    mlbSchedules.set(team.teamId, generateSchedule(team.wins, team.losses, 162, 0.50));
  });
  const mlbResults = monteCarloEngine.batchSimulate(MLB_TEAMS, mlbSchedules);
  console.log(`✅ Completed ${mlbResults.length} MLB team simulations\n`);

  console.log('🎉 All simulations complete!\n');
  console.log('Summary:');
  console.log(`  SEC Teams: ${secResults.length}`);
  console.log(`  NFL Teams: ${nflResults.length}`);
  console.log(`  MLB Teams: ${mlbResults.length}`);
  console.log(`  Total Simulations: ${(secResults.length + nflResults.length + mlbResults.length) * 10000}`);

  return {
    sec: secResults,
    nfl: nflResults,
    mlb: mlbResults
  };
}

/**
 * Format simulation results for display
 */
export function formatSimulationResult(result: SimulationResult): string {
  return `
${result.teamName} (${result.sport})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Projected Record: ${result.projectedWins}-${result.projectedLosses}
Confidence Interval: ${result.confidenceInterval.lower} - ${result.confidenceInterval.upper} wins

Probabilities:
  Playoff: ${result.playoffProbability}%
  Division: ${result.divisionWinProbability}%
  Championship: ${result.championshipProbability}%

Statistics:
  Pythagorean Exp: ${result.metadata.pythagoreanExpectation}%
  Std Deviation: ${result.metadata.standardDeviation}
  Simulations: ${result.simulations.toLocaleString()}
`;
}

// Export for use in other modules
export { SEC_TEAMS, NFL_TEAMS, MLB_TEAMS };