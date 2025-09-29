/**
 * NCAA Data Adapter - Maps API responses to view models
 * CRITICAL: Returns EXACT same shape as existing code expects
 * NO changes to property names or structure
 */

import { getNcaaTeam, getNcaaStandings, getNcaaLiveGames } from "../api/ncaa";

// View model that matches EXACTLY what the current UI expects
export interface NcaaCardViewModel {
  teamName: string;
  conference: string;
  venue: string;
  record: string;
  conferenceRecord: string;
  apRanking: number | null;
  coachesRanking: number | null;
  cfpRanking: number | null;
  bowlProjection: string | null;
  strengthOfSchedule: number | null;
  dataSource: string;
  lastUpdated: string;
}

export async function getNcaaCardVM(teamId = "251"): Promise<NcaaCardViewModel> {
  const data = await getNcaaTeam(teamId);

  // Map to exact shape the UI expects - DO NOT CHANGE property names
  return {
    teamName: data.team?.name ?? "Texas Longhorns",
    conference: data.team?.conference?.name ?? "Big 12",
    venue: data.team?.venue?.name ?? "Darrell K Royal Stadium",
    record: data.record?.overall ?? "0-0",
    conferenceRecord: data.record?.conference ?? "0-0",
    apRanking: data.rankings?.ap ?? null,
    coachesRanking: data.rankings?.coaches ?? null,
    cfpRanking: data.rankings?.cfp ?? null,
    bowlProjection: data.projections?.bowl ?? null,
    strengthOfSchedule: data.analytics?.sos ?? null,
    dataSource: data.analytics?.dataSource ?? "NCAA Stats API",
    lastUpdated: data.analytics?.lastUpdated ?? new Date().toISOString()
  };
}

export interface NcaaStandingsViewModel {
  football: {
    sec: Array<{
      teamName: string;
      overallRecord: string;
      conferenceRecord: string;
      apRanking: number | null;
      cfpRanking: number | null;
    }>;
    big12: Array<{
      teamName: string;
      overallRecord: string;
      conferenceRecord: string;
      apRanking: number | null;
      cfpRanking: number | null;
    }>;
    big10: Array<{
      teamName: string;
      overallRecord: string;
      conferenceRecord: string;
      apRanking: number | null;
      cfpRanking: number | null;
    }>;
    acc: Array<{
      teamName: string;
      overallRecord: string;
      conferenceRecord: string;
      apRanking: number | null;
      cfpRanking: number | null;
    }>;
    pac12: Array<{
      teamName: string;
      overallRecord: string;
      conferenceRecord: string;
      apRanking: number | null;
      cfpRanking: number | null;
    }>;
  };
  basketball: {
    big12: Array<{
      teamName: string;
      overallRecord: string;
      conferenceRecord: string;
      apRanking: number | null;
      netRanking: number | null;
      kenpomRating: number | null;
    }>;
    sec: Array<{
      teamName: string;
      overallRecord: string;
      conferenceRecord: string;
      apRanking: number | null;
      netRanking: number | null;
      kenpomRating: number | null;
    }>;
    big10: Array<{
      teamName: string;
      overallRecord: string;
      conferenceRecord: string;
      apRanking: number | null;
      netRanking: number | null;
      kenpomRating: number | null;
    }>;
    acc: Array<{
      teamName: string;
      overallRecord: string;
      conferenceRecord: string;
      apRanking: number | null;
      netRanking: number | null;
      kenpomRating: number | null;
    }>;
    bigeast: Array<{
      teamName: string;
      overallRecord: string;
      conferenceRecord: string;
      apRanking: number | null;
      netRanking: number | null;
      kenpomRating: number | null;
    }>;
  };
}

export async function getNcaaStandingsVM(): Promise<NcaaStandingsViewModel> {
  const data = await getNcaaStandings();

  // Extract and format football standings
  const formatFootballConference = (conferenceData: any) => {
    if (!conferenceData || !Array.isArray(conferenceData)) return [];

    return conferenceData.map((team: any) => ({
      teamName: team.team?.name ?? "Unknown",
      overallRecord: team.overallRecord ?? "0-0",
      conferenceRecord: team.conferenceRecord ?? "0-0",
      apRanking: team.rankings?.ap ?? null,
      cfpRanking: team.rankings?.cfp ?? null
    }));
  };

  // Extract and format basketball standings
  const formatBasketballConference = (conferenceData: any) => {
    if (!conferenceData || !Array.isArray(conferenceData)) return [];

    return conferenceData.map((team: any) => ({
      teamName: team.team?.name ?? "Unknown",
      overallRecord: team.overallRecord ?? "0-0",
      conferenceRecord: team.conferenceRecord ?? "0-0",
      apRanking: team.rankings?.ap ?? null,
      netRanking: team.rankings?.net ?? null,
      kenpomRating: team.ratings?.kenpom ?? null
    }));
  };

  return {
    football: {
      sec: formatFootballConference(data.football?.sec),
      big12: formatFootballConference(data.football?.big12),
      big10: formatFootballConference(data.football?.big10),
      acc: formatFootballConference(data.football?.acc),
      pac12: formatFootballConference(data.football?.pac12)
    },
    basketball: {
      big12: formatBasketballConference(data.basketball?.big12),
      sec: formatBasketballConference(data.basketball?.sec),
      big10: formatBasketballConference(data.basketball?.big10),
      acc: formatBasketballConference(data.basketball?.acc),
      bigeast: formatBasketballConference(data.basketball?.bigeast)
    }
  };
}

export interface NcaaLiveGameViewModel {
  sport: string;
  awayTeam: string;
  homeTeam: string;
  awayScore: number;
  homeScore: number;
  period: string;
  timeRemaining: string;
  down: string | null;
  distance: number | null;
  fieldPosition: string | null;
  status: string;
}

export async function getNcaaLiveGamesVM(): Promise<NcaaLiveGameViewModel[]> {
  const data = await getNcaaLiveGames();

  if (!data.games || !Array.isArray(data.games)) {
    return [];
  }

  return data.games.map((game: any) => ({
    sport: game.sport ?? "football",
    awayTeam: game.teams?.away?.team?.name ?? "Away",
    homeTeam: game.teams?.home?.team?.name ?? "Home",
    awayScore: game.teams?.away?.score ?? 0,
    homeScore: game.teams?.home?.score ?? 0,
    period: game.status?.period ?? "1st",
    timeRemaining: game.status?.displayClock ?? "15:00",
    down: game.situation?.down ?? null,
    distance: game.situation?.distance ?? null,
    fieldPosition: game.situation?.yardLine ?? null,
    status: game.status?.detailedState ?? "Scheduled"
  }));
}