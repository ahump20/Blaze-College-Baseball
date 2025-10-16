export interface GameTeam {
  id: string;
  name: string;
  abbreviation?: string;
  record?: string;
  score: number;
  rank?: number;
  logo?: string;
}

export type GameStatus = 'scheduled' | 'live' | 'final' | 'delayed' | 'postponed';

export interface LiveGame {
  id: string;
  conference?: string;
  startTime: string;
  venue?: string;
  status: GameStatus;
  inning?: number;
  inningHalf?: 'Top' | 'Middle' | 'Bottom';
  outs?: number;
  balls?: number;
  strikes?: number;
  leverageIndex?: number;
  lastPlay?: string;
  broadcast?: string;
  boxScorePath?: string;
  away: GameTeam;
  home: GameTeam;
}

export interface GamesResponse {
  games: LiveGame[];
  lastUpdated: string;
}

export interface RecordSummary {
  wins: number;
  losses: number;
  pct?: number;
  ties?: number;
}

export interface StandingsRow {
  teamId: string;
  team: string;
  shortName?: string;
  conference: RecordSummary;
  overall: RecordSummary;
  lastTen?: RecordSummary;
  streak?: string;
  runDifferential?: number;
  leverageRating?: number;
}

export interface StandingsResponse {
  conference: string;
  displayName: string;
  lastUpdated: string;
  rows: StandingsRow[];
}
