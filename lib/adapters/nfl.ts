/**
 * NFL Data Adapter - Maps API responses to view models
 * CRITICAL: Returns EXACT same shape as existing code expects
 * NO changes to property names or structure
 */

import { getNflTeam, getNflStandings, getNflLiveGames } from "../api/nfl";

// View model that matches EXACTLY what the current UI expects
export interface NflCardViewModel {
  teamName: string;
  division: string;
  venue: string;
  offenseRating: number | null;
  defenseRating: number | null;
  projectedWins: number | null;
  playoffProbability: string | null;
  dataSource: string;
  lastUpdated: string;
}

export async function getNflCardVM(teamId = "10"): Promise<NflCardViewModel> {
  const data = await getNflTeam(teamId);

  // Map to exact shape the UI expects - DO NOT CHANGE property names
  return {
    teamName: data.team?.name ?? "Tennessee Titans",
    division: data.team?.division?.name ?? "AFC South",
    venue: data.team?.venue?.name ?? "Nissan Stadium",
    offenseRating: data.analytics?.offensive?.rating ?? null,
    defenseRating: data.analytics?.defensive?.rating ?? null,
    projectedWins: data.analytics?.projections?.wins ?? null,
    playoffProbability: data.analytics?.projections?.playoffProbability ?? null,
    dataSource: data.analytics?.dataSource ?? "NFL Stats API",
    lastUpdated: data.analytics?.lastUpdated ?? new Date().toISOString()
  };
}

export interface NflStandingsViewModel {
  afc: {
    east: Array<{
      teamName: string;
      wins: number;
      losses: number;
      ties: number;
      winPercentage: string;
      pointsFor: number;
      pointsAgainst: number;
    }>;
    north: Array<{
      teamName: string;
      wins: number;
      losses: number;
      ties: number;
      winPercentage: string;
      pointsFor: number;
      pointsAgainst: number;
    }>;
    south: Array<{
      teamName: string;
      wins: number;
      losses: number;
      ties: number;
      winPercentage: string;
      pointsFor: number;
      pointsAgainst: number;
    }>;
    west: Array<{
      teamName: string;
      wins: number;
      losses: number;
      ties: number;
      winPercentage: string;
      pointsFor: number;
      pointsAgainst: number;
    }>;
  };
  nfc: {
    east: Array<{
      teamName: string;
      wins: number;
      losses: number;
      ties: number;
      winPercentage: string;
      pointsFor: number;
      pointsAgainst: number;
    }>;
    north: Array<{
      teamName: string;
      wins: number;
      losses: number;
      ties: number;
      winPercentage: string;
      pointsFor: number;
      pointsAgainst: number;
    }>;
    south: Array<{
      teamName: string;
      wins: number;
      losses: number;
      ties: number;
      winPercentage: string;
      pointsFor: number;
      pointsAgainst: number;
    }>;
    west: Array<{
      teamName: string;
      wins: number;
      losses: number;
      ties: number;
      winPercentage: string;
      pointsFor: number;
      pointsAgainst: number;
    }>;
  };
}

export async function getNflStandingsVM(): Promise<NflStandingsViewModel> {
  const data = await getNflStandings();

  // Extract and format standings for UI consumption
  const formatDivision = (divisionData: any) => {
    if (!divisionData || !Array.isArray(divisionData)) return [];

    return divisionData.map((team: any) => ({
      teamName: team.team?.name ?? "Unknown",
      wins: team.wins ?? 0,
      losses: team.losses ?? 0,
      ties: team.ties ?? 0,
      winPercentage: team.winningPercentage ?? ".000",
      pointsFor: team.pointsFor ?? 0,
      pointsAgainst: team.pointsAgainst ?? 0
    }));
  };

  return {
    afc: {
      east: formatDivision(data.afc?.east),
      north: formatDivision(data.afc?.north),
      south: formatDivision(data.afc?.south),
      west: formatDivision(data.afc?.west)
    },
    nfc: {
      east: formatDivision(data.nfc?.east),
      north: formatDivision(data.nfc?.north),
      south: formatDivision(data.nfc?.south),
      west: formatDivision(data.nfc?.west)
    }
  };
}

export interface NflLiveGameViewModel {
  awayTeam: string;
  homeTeam: string;
  awayScore: number;
  homeScore: number;
  quarter: string;
  timeRemaining: string;
  possession: string;
  status: string;
}

export async function getNflLiveGamesVM(): Promise<NflLiveGameViewModel[]> {
  const data = await getNflLiveGames();

  if (!data.games || !Array.isArray(data.games)) {
    return [];
  }

  return data.games.map((game: any) => ({
    awayTeam: game.teams?.away?.team?.name ?? "Away",
    homeTeam: game.teams?.home?.team?.name ?? "Home",
    awayScore: game.teams?.away?.score ?? 0,
    homeScore: game.teams?.home?.score ?? 0,
    quarter: game.status?.period ?? "1st",
    timeRemaining: game.status?.displayClock ?? "15:00",
    possession: game.possession?.team?.abbreviation ?? "",
    status: game.status?.detailedState ?? "Scheduled"
  }));
}