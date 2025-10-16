export type GameStatus =
  | 'live'
  | 'final'
  | 'scheduled'
  | 'delayed'
  | 'postponed'
  | 'suspended'
  | 'pre_game'
  | 'in_progress'
  | 'completed'
  | 'canceled';

export interface TeamRecord {
  wins: number;
  losses: number;
  ties?: number;
}

export interface GameTeam {
  id?: string;
  name?: string;
  shortName?: string;
  score?: number;
  record?: TeamRecord;
}

export interface GameSituation {
  outs: number;
  runners: string;
}

export interface PitcherInfo {
  name: string;
  pitches: number;
  era: number | string;
}

export interface BatterInfo {
  name: string;
  avg: number | string;
}

export interface InningInfo {
  half: string;
  number: number;
}

export interface LiveGame {
  id: string;
  status: GameStatus;
  inning?: InningInfo;
  scheduledTime?: string;
  venue?: string;
  situation?: GameSituation;
  awayTeam: GameTeam;
  homeTeam: GameTeam;
  currentPitcher?: PitcherInfo;
  currentBatter?: BatterInfo;
  date?: string;
}

export interface BattingLine {
  playerId: string;
  playerName: string;
  position: string;
  atBats: number;
  runs: number;
  hits: number;
  rbi: number;
  walks: number;
  strikeouts: number;
  avg: number | string | null;
}

export interface PitchingLine {
  playerId: string;
  playerName: string;
  decision?: string;
  innings: number | string;
  hits: number;
  runs: number;
  earnedRuns: number;
  walks: number;
  strikeouts: number;
  pitches: number;
  era: number | string | null;
}

export interface TeamIdentity {
  id: string;
  name: string;
  shortName: string;
}

export interface BoxScoreTeam {
  team: TeamIdentity;
  lineScore?: Array<number | null>;
  score: number;
  hits: number;
  errors: number;
  batting: BattingLine[];
  pitching: PitchingLine[];
}

export interface BoxScoreResponse {
  awayTeam: BoxScoreTeam;
  homeTeam: BoxScoreTeam;
  lastUpdate?: string;
}

export interface StandingsRecord {
  wins: number;
  losses: number;
  ties?: number;
}

export interface StandingsTeamInfo {
  id: string;
  name: string;
  shortName?: string;
}

export interface StandingsEntry {
  team: StandingsTeamInfo;
  rank?: number;
  conferenceRecord: StandingsRecord;
  overallRecord: StandingsRecord;
  rpi?: number;
  streakType?: 'W' | 'L' | string;
  streakCount?: number;
}

export interface StatLeader {
  name: string;
  team: string;
  avg?: string;
  hr?: number;
  era?: string;
  k?: number;
}

export interface StandingsLeaders {
  batting: StatLeader[];
  homeruns: StatLeader[];
  era: StatLeader[];
  strikeouts: StatLeader[];
}

export interface StandingsData {
  teams: StandingsEntry[];
  leaders: StandingsLeaders;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
