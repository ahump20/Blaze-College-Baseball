export type GameStatus = 'scheduled' | 'in-progress' | 'final';

export interface GameTeam {
  id: string;
  name: string;
  shortName: string;
  record: string;
  runs: number | null;
  hits: number | null;
  errors: number | null;
  ranking?: number;
  logo?: string;
}

export interface GameLinkSet {
  boxScore: string;
  liveGameCenter?: string;
}

export interface GameSummary {
  id: string;
  conference: string;
  venue: string;
  startTime: string;
  status: GameStatus;
  inningStatus: string;
  leverageIndex: number;
  leverageTier: 'moderate' | 'high' | 'critical' | 'low';
  leverageNote: string;
  broadcast: string;
  situation: string;
  teams: {
    home: GameTeam;
    away: GameTeam;
  };
  links: GameLinkSet;
}

export interface GamesResponse {
  games: GameSummary[];
  meta: {
    lastUpdated: string;
    nextUpdateSeconds: number;
  };
}

export interface StandingsRecord {
  wins: number;
  losses: number;
}

export interface StandingsRow {
  id: string;
  name: string;
  shortName: string;
  conferenceRecord: StandingsRecord;
  overallRecord: StandingsRecord;
  rpi: number;
  runDifferential: number;
  streak: string;
  lastTen: StandingsRecord;
  homeRecord: StandingsRecord;
  roadRecord: StandingsRecord;
}

export interface StandingsResponse {
  conference: string;
  season: string;
  teams: StandingsRow[];
  meta: {
    lastUpdated: string;
  };
}

export const mockGames: GameSummary[] = [
  {
    id: '2025-04-05-lsu-at-arkansas',
    conference: 'sec',
    venue: 'Baum-Walker Stadium — Fayetteville, AR',
    startTime: '2025-04-05T19:00:00Z',
    status: 'in-progress',
    inningStatus: 'Top 7 • 1 Out',
    leverageIndex: 5.9,
    leverageTier: 'critical',
    leverageNote: 'Winning run at the plate after a bullpen change',
    broadcast: 'SEC Network',
    situation: 'Runners on 1st & 3rd • LSU leads season series 2-1',
    teams: {
      away: {
        id: 'lsu',
        name: 'LSU Tigers',
        shortName: 'LSU',
        record: '27-8 (9-4 SEC)',
        runs: 6,
        hits: 9,
        errors: 0,
        ranking: 4
      },
      home: {
        id: 'arkansas',
        name: 'Arkansas Razorbacks',
        shortName: 'Arkansas',
        record: '25-9 (8-5 SEC)',
        runs: 5,
        hits: 7,
        errors: 1,
        ranking: 6
      }
    },
    links: {
      boxScore: '/baseball/ncaab/games/2025-04-05-lsu-at-arkansas/box',
      liveGameCenter: '/baseball/ncaab/games/2025-04-05-lsu-at-arkansas'
    }
  },
  {
    id: '2025-04-05-clemson-at-wake-forest',
    conference: 'acc',
    venue: 'David F. Couch Ballpark — Winston-Salem, NC',
    startTime: '2025-04-05T22:00:00Z',
    status: 'scheduled',
    inningStatus: 'First pitch 6:00 PM ET',
    leverageIndex: 2.1,
    leverageTier: 'moderate',
    leverageNote: 'Series rubber match determines ACC Atlantic lead',
    broadcast: 'ACC Network Extra',
    situation: 'Projected pitching matchup: Caden Grice vs. Rhett Lowder',
    teams: {
      away: {
        id: 'clemson',
        name: 'Clemson Tigers',
        shortName: 'Clemson',
        record: '23-10 (8-6 ACC)',
        runs: null,
        hits: null,
        errors: null,
        ranking: 11
      },
      home: {
        id: 'wake-forest',
        name: 'Wake Forest Demon Deacons',
        shortName: 'Wake Forest',
        record: '24-9 (9-5 ACC)',
        runs: null,
        hits: null,
        errors: null,
        ranking: 8
      }
    },
    links: {
      boxScore: '/baseball/ncaab/games/2025-04-05-clemson-at-wake-forest/box'
    }
  },
  {
    id: '2025-04-04-texas-at-oklahoma-state',
    conference: 'big-12',
    venue: "O'Brate Stadium — Stillwater, OK",
    startTime: '2025-04-04T23:30:00Z',
    status: 'final',
    inningStatus: 'Final • 10 Innings',
    leverageIndex: 4.3,
    leverageTier: 'high',
    leverageNote: 'Walk-off single in extras closed it out',
    broadcast: 'ESPN+',
    situation: 'OSU wins series 2-0',
    teams: {
      away: {
        id: 'texas',
        name: 'Texas Longhorns',
        shortName: 'Texas',
        record: '21-12 (7-7 Big 12)',
        runs: 3,
        hits: 8,
        errors: 1,
        ranking: 18
      },
      home: {
        id: 'oklahoma-state',
        name: 'Oklahoma State Cowboys',
        shortName: 'Oklahoma State',
        record: '24-9 (10-3 Big 12)',
        runs: 4,
        hits: 10,
        errors: 0,
        ranking: 9
      }
    },
    links: {
      boxScore: '/baseball/ncaab/games/2025-04-04-texas-at-oklahoma-state/box',
      liveGameCenter: '/baseball/ncaab/games/2025-04-04-texas-at-oklahoma-state'
    }
  }
];

const sharedStandings: StandingsRow[] = [
  {
    id: 'lsu',
    name: 'LSU Tigers',
    shortName: 'LSU',
    conferenceRecord: { wins: 9, losses: 4 },
    overallRecord: { wins: 27, losses: 8 },
    rpi: 0.648,
    runDifferential: 72,
    streak: 'W4',
    lastTen: { wins: 8, losses: 2 },
    homeRecord: { wins: 18, losses: 2 },
    roadRecord: { wins: 9, losses: 6 }
  },
  {
    id: 'arkansas',
    name: 'Arkansas Razorbacks',
    shortName: 'Arkansas',
    conferenceRecord: { wins: 8, losses: 5 },
    overallRecord: { wins: 25, losses: 9 },
    rpi: 0.622,
    runDifferential: 58,
    streak: 'L1',
    lastTen: { wins: 6, losses: 4 },
    homeRecord: { wins: 17, losses: 4 },
    roadRecord: { wins: 8, losses: 5 }
  },
  {
    id: 'texas-am',
    name: 'Texas A&M Aggies',
    shortName: 'Texas A&M',
    conferenceRecord: { wins: 7, losses: 6 },
    overallRecord: { wins: 23, losses: 11 },
    rpi: 0.601,
    runDifferential: 44,
    streak: 'W2',
    lastTen: { wins: 5, losses: 5 },
    homeRecord: { wins: 15, losses: 5 },
    roadRecord: { wins: 8, losses: 6 }
  }
];

export const standingsByConference: Record<string, StandingsResponse> = {
  sec: {
    conference: 'SEC',
    season: '2025',
    teams: sharedStandings,
    meta: {
      lastUpdated: '2025-04-05T18:55:00Z'
    }
  },
  acc: {
    conference: 'ACC',
    season: '2025',
    teams: [
      {
        id: 'wake-forest',
        name: 'Wake Forest Demon Deacons',
        shortName: 'Wake Forest',
        conferenceRecord: { wins: 9, losses: 5 },
        overallRecord: { wins: 24, losses: 9 },
        rpi: 0.637,
        runDifferential: 61,
        streak: 'W3',
        lastTen: { wins: 7, losses: 3 },
        homeRecord: { wins: 16, losses: 3 },
        roadRecord: { wins: 8, losses: 6 }
      },
      {
        id: 'clemson',
        name: 'Clemson Tigers',
        shortName: 'Clemson',
        conferenceRecord: { wins: 8, losses: 6 },
        overallRecord: { wins: 23, losses: 10 },
        rpi: 0.618,
        runDifferential: 49,
        streak: 'L1',
        lastTen: { wins: 6, losses: 4 },
        homeRecord: { wins: 15, losses: 4 },
        roadRecord: { wins: 8, losses: 6 }
      },
      {
        id: 'nc-state',
        name: 'NC State Wolfpack',
        shortName: 'NC State',
        conferenceRecord: { wins: 7, losses: 7 },
        overallRecord: { wins: 21, losses: 12 },
        rpi: 0.588,
        runDifferential: 26,
        streak: 'W1',
        lastTen: { wins: 5, losses: 5 },
        homeRecord: { wins: 14, losses: 5 },
        roadRecord: { wins: 7, losses: 7 }
      }
    ],
    meta: {
      lastUpdated: '2025-04-05T18:40:00Z'
    }
  },
  'big-12': {
    conference: 'Big 12',
    season: '2025',
    teams: [
      {
        id: 'oklahoma-state',
        name: 'Oklahoma State Cowboys',
        shortName: 'Oklahoma State',
        conferenceRecord: { wins: 10, losses: 3 },
        overallRecord: { wins: 24, losses: 9 },
        rpi: 0.642,
        runDifferential: 67,
        streak: 'W5',
        lastTen: { wins: 8, losses: 2 },
        homeRecord: { wins: 16, losses: 2 },
        roadRecord: { wins: 8, losses: 7 }
      },
      {
        id: 'texas',
        name: 'Texas Longhorns',
        shortName: 'Texas',
        conferenceRecord: { wins: 7, losses: 7 },
        overallRecord: { wins: 21, losses: 12 },
        rpi: 0.609,
        runDifferential: 35,
        streak: 'L2',
        lastTen: { wins: 4, losses: 6 },
        homeRecord: { wins: 13, losses: 4 },
        roadRecord: { wins: 8, losses: 8 }
      },
      {
        id: 'texas-tech',
        name: 'Texas Tech Red Raiders',
        shortName: 'Texas Tech',
        conferenceRecord: { wins: 6, losses: 8 },
        overallRecord: { wins: 20, losses: 14 },
        rpi: 0.571,
        runDifferential: 18,
        streak: 'W1',
        lastTen: { wins: 5, losses: 5 },
        homeRecord: { wins: 14, losses: 6 },
        roadRecord: { wins: 6, losses: 8 }
      }
    ],
    meta: {
      lastUpdated: '2025-04-05T17:55:00Z'
    }
  }
};

export function buildGamesResponse(): GamesResponse {
  return {
    games: mockGames,
    meta: {
      lastUpdated: new Date().toISOString(),
      nextUpdateSeconds: 30
    }
  };
}

export function getStandings(conference: string): StandingsResponse | undefined {
  const normalized = conference.toLowerCase();
  return standingsByConference[normalized];
}
