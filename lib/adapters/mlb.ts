/**
 * MLB Data Adapter - Maps API responses to view models
 * CRITICAL: Returns EXACT same shape as existing code expects
 * NO changes to property names or structure
 */

import { getMlbTeam, getMlbStandings, getMlbLiveGames } from "../api/mlb";

// View model that matches EXACTLY what the current UI expects
export interface MlbCardViewModel {
  teamName: string;
  division: string;
  venue: string;
  expectedWins: number | null;
  winPercentage: string | null;
  runsScored: number | null;
  runsAllowed: number | null;
  dataSource: string;
  lastUpdated: string;
}

export async function getMlbCardVM(teamId = "138"): Promise<MlbCardViewModel> {
  const data = await getMlbTeam(teamId);

  // Map to exact shape the UI expects - DO NOT CHANGE property names
  return {
    teamName: data.team?.name ?? "St. Louis Cardinals",
    division: data.team?.division?.name ?? "NL Central",
    venue: data.team?.venue?.name ?? "Busch Stadium",
    expectedWins: data.analytics?.pythagorean?.expectedWins ?? null,
    winPercentage: data.analytics?.pythagorean?.winPercentage ?? null,
    runsScored: data.analytics?.pythagorean?.runsScored ?? null,
    runsAllowed: data.analytics?.pythagorean?.runsAllowed ?? null,
    dataSource: data.analytics?.dataSource ?? "MLB Stats API",
    lastUpdated: data.analytics?.lastUpdated ?? new Date().toISOString()
  };
}

export interface MlbStandingsViewModel {
  americanLeague: Array<{
    teamName: string;
    wins: number;
    losses: number;
    gamesBehind: string;
    winPercentage: string;
  }>;
  nationalLeague: Array<{
    teamName: string;
    wins: number;
    losses: number;
    gamesBehind: string;
    winPercentage: string;
  }>;
}

export async function getMlbStandingsVM(): Promise<MlbStandingsViewModel> {
  const data = await getMlbStandings();

  // Extract and format standings for UI consumption
  const formatDivision = (records: any[]) => {
    if (!records || !records.length) return [];

    return records.flatMap(division =>
      (division.teamRecords || []).map((team: any) => ({
        teamName: team.team?.name ?? "Unknown",
        wins: team.wins ?? 0,
        losses: team.losses ?? 0,
        gamesBehind: team.gamesBack ?? "-",
        winPercentage: team.winningPercentage ?? ".000"
      }))
    );
  };

  return {
    americanLeague: formatDivision(data.americanLeague),
    nationalLeague: formatDivision(data.nationalLeague)
  };
}

export interface MlbLiveGameViewModel {
  awayTeam: string;
  homeTeam: string;
  awayScore: number;
  homeScore: number;
  inning: string;
  status: string;
}

export async function getMlbLiveGamesVM(): Promise<MlbLiveGameViewModel[]> {
  const data = await getMlbLiveGames();

  if (!data.games || !Array.isArray(data.games)) {
    return [];
  }

  return data.games.map((game: any) => ({
    awayTeam: game.teams?.away?.team?.name ?? "Away",
    homeTeam: game.teams?.home?.team?.name ?? "Home",
    awayScore: game.teams?.away?.score ?? 0,
    homeScore: game.teams?.home?.score ?? 0,
    inning: game.linescore?.currentInningOrdinal ?? "1st",
    status: game.status?.detailedState ?? "Scheduled"
  }));
}