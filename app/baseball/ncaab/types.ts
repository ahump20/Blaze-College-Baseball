export type GameStatus = 'live' | 'final' | 'scheduled';

export interface TeamRecord {
  wins: number;
  losses: number;
}

export interface TeamDetails {
  id?: string;
  name?: string;
  shortName?: string;
  score?: number;
  record?: TeamRecord;
}

export interface GameSituation {
  outs?: number;
  runners?: string;
}

export interface PitcherInfo {
  name: string;
  pitches?: number;
  era?: number;
}

export interface BatterInfo {
  name: string;
  avg?: number;
}

export interface GameSummary {
  id: string;
  status: GameStatus;
  inning?: {
    number?: number;
    half?: string;
  };
  scheduledTime?: string;
  venue?: string;
  awayTeam: TeamDetails;
  homeTeam: TeamDetails;
  currentPitcher?: PitcherInfo;
  currentBatter?: BatterInfo;
  situation?: GameSituation;
}

export interface LineScoreEntry {
  inningScores?: number[];
  score: number;
  hits?: number;
  errors?: number;
}

export interface BattingStatLine {
  playerId: string;
  playerName: string;
  position?: string;
  atBats: number;
  runs: number;
  hits: number;
  rbi: number;
  walks: number;
  strikeouts: number;
  avg: number;
}

export interface PitchingStatLine {
  playerId: string;
  playerName: string;
  innings: string;
  hits: number;
  runs: number;
  earnedRuns: number;
  walks: number;
  strikeouts: number;
  pitches: number;
  era: number;
  decision?: string;
}

export interface BoxScoreTeam {
  team: {
    id?: string;
    name: string;
    shortName: string;
  };
  lineScore?: number[];
  score: number;
  hits?: number;
  errors?: number;
  batting: BattingStatLine[];
  pitching: PitchingStatLine[];
}

export interface BoxScorePayload {
  lastUpdate?: string;
  awayTeam: BoxScoreTeam;
  homeTeam: BoxScoreTeam;
}

export interface StandingRecord {
  wins: number;
  losses: number;
}

export interface StandingTeam {
  rank?: number;
  team: {
    id: string;
    name: string;
  };
  conferenceRecord: StandingRecord;
  overallRecord: StandingRecord;
  rpi?: number;
  streakType?: 'W' | 'L';
  streakCount?: number;
}

export interface StatLeader {
  name: string;
  team: string;
  avg?: string;
  hr?: string;
  era?: string;
  k?: string;
}

export interface StandingsPayload {
  teams: StandingTeam[];
  leaders?: {
    batting: StatLeader[];
    homeruns: StatLeader[];
    era: StatLeader[];
    strikeouts: StatLeader[];
  };
}
