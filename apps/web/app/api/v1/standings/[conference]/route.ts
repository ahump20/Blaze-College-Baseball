import { NextResponse } from 'next/server';
import type { StandingsResponse } from '@/app/baseball/ncaab/types';

const standingsByConference: Record<string, StandingsResponse> = {
  sec: {
    conference: 'sec',
    displayName: 'SEC',
    lastUpdated: new Date().toISOString(),
    rows: [
      {
        teamId: 'lsu',
        team: 'LSU Tigers',
        shortName: 'Baton Rouge',
        conference: { wins: 5, losses: 1, pct: 0.833 },
        overall: { wins: 19, losses: 4, pct: 0.826 },
        lastTen: { wins: 8, losses: 2 },
        streak: 'W3',
        runDifferential: 45,
        leverageRating: 3.25,
      },
      {
        teamId: 'arkansas',
        team: 'Arkansas Razorbacks',
        shortName: 'Fayetteville',
        conference: { wins: 4, losses: 2, pct: 0.667 },
        overall: { wins: 18, losses: 5, pct: 0.783 },
        lastTen: { wins: 7, losses: 3 },
        streak: 'L1',
        runDifferential: 32,
        leverageRating: 2.91,
      },
      {
        teamId: 'florida',
        team: 'Florida Gators',
        shortName: 'Gainesville',
        conference: { wins: 4, losses: 2, pct: 0.667 },
        overall: { wins: 17, losses: 6, pct: 0.739 },
        lastTen: { wins: 6, losses: 4 },
        streak: 'W2',
        runDifferential: 24,
        leverageRating: 2.18,
      },
    ],
  },
  acc: {
    conference: 'acc',
    displayName: 'ACC',
    lastUpdated: new Date().toISOString(),
    rows: [
      {
        teamId: 'wake',
        team: 'Wake Forest Demon Deacons',
        shortName: 'Winston-Salem',
        conference: { wins: 6, losses: 0, pct: 1 },
        overall: { wins: 20, losses: 2, pct: 0.909 },
        lastTen: { wins: 9, losses: 1 },
        streak: 'W8',
        runDifferential: 58,
        leverageRating: 3.61,
      },
      {
        teamId: 'clemson',
        team: 'Clemson Tigers',
        shortName: 'Upstate',
        conference: { wins: 5, losses: 1, pct: 0.833 },
        overall: { wins: 18, losses: 4, pct: 0.818 },
        lastTen: { wins: 7, losses: 3 },
        streak: 'W1',
        runDifferential: 31,
        leverageRating: 2.75,
      },
      {
        teamId: 'miami',
        team: 'Miami Hurricanes',
        shortName: 'Coral Gables',
        conference: { wins: 4, losses: 2, pct: 0.667 },
        overall: { wins: 15, losses: 7, pct: 0.682 },
        lastTen: { wins: 6, losses: 4 },
        streak: 'L1',
        runDifferential: 12,
        leverageRating: 1.98,
      },
    ],
  },
  big12: {
    conference: 'big12',
    displayName: 'Big 12',
    lastUpdated: new Date().toISOString(),
    rows: [
      {
        teamId: 'texastech',
        team: 'Texas Tech Red Raiders',
        shortName: 'Lubbock',
        conference: { wins: 5, losses: 1, pct: 0.833 },
        overall: { wins: 18, losses: 5, pct: 0.783 },
        lastTen: { wins: 8, losses: 2 },
        streak: 'W5',
        runDifferential: 40,
        leverageRating: 3.01,
      },
      {
        teamId: 'okstate',
        team: 'Oklahoma State Cowboys',
        shortName: 'Stillwater',
        conference: { wins: 4, losses: 2, pct: 0.667 },
        overall: { wins: 17, losses: 6, pct: 0.739 },
        lastTen: { wins: 6, losses: 4 },
        streak: 'W1',
        runDifferential: 22,
        leverageRating: 2.17,
      },
      {
        teamId: 'ucf',
        team: 'UCF Knights',
        shortName: 'Orlando',
        conference: { wins: 3, losses: 3, pct: 0.5 },
        overall: { wins: 14, losses: 8, pct: 0.636 },
        lastTen: { wins: 5, losses: 5 },
        streak: 'L2',
        runDifferential: -4,
        leverageRating: 1.31,
      },
    ],
  },
  pac12: {
    conference: 'pac12',
    displayName: 'Pac-12',
    lastUpdated: new Date().toISOString(),
    rows: [
      {
        teamId: 'oregonstate',
        team: 'Oregon State Beavers',
        shortName: 'Corvallis',
        conference: { wins: 4, losses: 1, pct: 0.8 },
        overall: { wins: 15, losses: 5, pct: 0.75 },
        lastTen: { wins: 7, losses: 3 },
        streak: 'W3',
        runDifferential: 26,
        leverageRating: 2.42,
      },
      {
        teamId: 'arizona',
        team: 'Arizona Wildcats',
        shortName: 'Tucson',
        conference: { wins: 4, losses: 2, pct: 0.667 },
        overall: { wins: 16, losses: 6, pct: 0.727 },
        lastTen: { wins: 6, losses: 4 },
        streak: 'L1',
        runDifferential: 14,
        leverageRating: 1.87,
      },
      {
        teamId: 'stanford',
        team: 'Stanford Cardinal',
        shortName: 'Stanford',
        conference: { wins: 3, losses: 3, pct: 0.5 },
        overall: { wins: 13, losses: 7, pct: 0.65 },
        lastTen: { wins: 5, losses: 5 },
        streak: 'W2',
        runDifferential: 6,
        leverageRating: 1.72,
      },
    ],
  },
};

export async function GET(_: Request, context: { params: { conference: string } }) {
  const key = context.params.conference?.toLowerCase();
  const payload = standingsByConference[key];

  if (!payload) {
    return NextResponse.json({ message: 'Conference not found' }, { status: 404 });
  }

  return NextResponse.json(payload);
}
