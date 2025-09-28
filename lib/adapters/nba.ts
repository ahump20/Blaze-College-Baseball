/**
 * NBA Data Adapter - Maps API responses to view models
 * CRITICAL: Returns EXACT same shape as existing code expects
 * NO changes to property names or structure
 */

import { getNbaTeam, getNbaStandings, getNbaLiveGames } from "../api/nba";

// View model that matches EXACTLY what the current UI expects
export interface NbaCardViewModel {
  teamName: string;
  division: string;
  venue: string;
  offensiveRating: number | null;
  defensiveRating: number | null;
  netRating: number | null;
  projectedWins: number | null;
  playoffProbability: string | null;
  dataSource: string;
  lastUpdated: string;
}

export async function getNbaCardVM(teamId = "29"): Promise<NbaCardViewModel> {
  const data = await getNbaTeam(teamId);

  // Map to exact shape the UI expects - DO NOT CHANGE property names
  return {
    teamName: data.team?.name ?? "Memphis Grizzlies",
    division: data.team?.division?.name ?? "Southwest",
    venue: data.team?.venue?.name ?? "FedExForum",
    offensiveRating: data.analytics?.offensive?.rating ?? null,
    defensiveRating: data.analytics?.defensive?.rating ?? null,
    netRating: data.analytics?.netRating ?? null,
    projectedWins: data.analytics?.projections?.wins ?? null,
    playoffProbability: data.analytics?.projections?.playoffProbability ?? null,
    dataSource: data.analytics?.dataSource ?? "NBA Stats API",
    lastUpdated: data.analytics?.lastUpdated ?? new Date().toISOString()
  };
}

export interface NbaStandingsViewModel {
  eastern: {
    atlantic: Array<{
      teamName: string;
      wins: number;
      losses: number;
      winPercentage: string;
      gamesBehind: string;
      homeRecord: string;
      awayRecord: string;
      last10: string;
      streak: string;
    }>;
    central: Array<{
      teamName: string;
      wins: number;
      losses: number;
      winPercentage: string;
      gamesBehind: string;
      homeRecord: string;
      awayRecord: string;
      last10: string;
      streak: string;
    }>;
    southeast: Array<{
      teamName: string;
      wins: number;
      losses: number;
      winPercentage: string;
      gamesBehind: string;
      homeRecord: string;
      awayRecord: string;
      last10: string;
      streak: string;
    }>;
  };
  western: {
    northwest: Array<{
      teamName: string;
      wins: number;
      losses: number;
      winPercentage: string;
      gamesBehind: string;
      homeRecord: string;
      awayRecord: string;
      last10: string;
      streak: string;
    }>;
    pacific: Array<{
      teamName: string;
      wins: number;
      losses: number;
      winPercentage: string;
      gamesBehind: string;
      homeRecord: string;
      awayRecord: string;
      last10: string;
      streak: string;
    }>;
    southwest: Array<{
      teamName: string;
      wins: number;
      losses: number;
      winPercentage: string;
      gamesBehind: string;
      homeRecord: string;
      awayRecord: string;
      last10: string;
      streak: string;
    }>;
  };
}

export async function getNbaStandingsVM(): Promise<NbaStandingsViewModel> {
  const data = await getNbaStandings();

  // Extract and format standings for UI consumption
  const formatDivision = (divisionData: any) => {
    if (!divisionData || !Array.isArray(divisionData)) return [];

    return divisionData.map((team: any) => ({
      teamName: team.team?.name ?? "Unknown",
      wins: team.wins ?? 0,
      losses: team.losses ?? 0,
      winPercentage: team.winningPercentage ?? ".000",
      gamesBehind: team.gamesBehind ?? "-",
      homeRecord: team.homeRecord ?? "0-0",
      awayRecord: team.awayRecord ?? "0-0",
      last10: team.last10 ?? "0-0",
      streak: team.streak?.streakCode ?? "-"
    }));
  };

  return {
    eastern: {
      atlantic: formatDivision(data.eastern?.atlantic),
      central: formatDivision(data.eastern?.central),
      southeast: formatDivision(data.eastern?.southeast)
    },
    western: {
      northwest: formatDivision(data.western?.northwest),
      pacific: formatDivision(data.western?.pacific),
      southwest: formatDivision(data.western?.southwest)
    }
  };
}

export interface NbaLiveGameViewModel {
  awayTeam: string;
  homeTeam: string;
  awayScore: number;
  homeScore: number;
  quarter: string;
  timeRemaining: string;
  shotClock: string;
  status: string;
}

export async function getNbaLiveGamesVM(): Promise<NbaLiveGameViewModel[]> {
  const data = await getNbaLiveGames();

  if (!data.games || !Array.isArray(data.games)) {
    return [];
  }

  return data.games.map((game: any) => ({
    awayTeam: game.teams?.away?.team?.name ?? "Away",
    homeTeam: game.teams?.home?.team?.name ?? "Home",
    awayScore: game.teams?.away?.score ?? 0,
    homeScore: game.teams?.home?.score ?? 0,
    quarter: game.status?.period ?? "1st",
    timeRemaining: game.status?.displayClock ?? "12:00",
    shotClock: game.status?.shotClock ?? "",
    status: game.status?.detailedState ?? "Scheduled"
  }));
}