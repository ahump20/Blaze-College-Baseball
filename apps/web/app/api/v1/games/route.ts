import { NextResponse } from 'next/server';
import type { GamesResponse } from '@/app/baseball/ncaab/types';

const sampleGames: GamesResponse = {
  lastUpdated: new Date().toISOString(),
  games: [
    {
      id: 'lsu-florida-2025-03-14',
      conference: 'SEC',
      startTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      venue: 'Alex Box Stadium — Baton Rouge, LA',
      status: 'live',
      inning: 6,
      inningHalf: 'Top',
      outs: 1,
      balls: 1,
      strikes: 1,
      leverageIndex: 3.6,
      lastPlay: 'Crews doubles to left, two runners score',
      broadcast: 'SEC Network+',
      boxScorePath: '/baseball/ncaab/games/lsu-florida-2025-03-14',
      away: {
        id: 'uf',
        name: 'Florida Gators',
        record: '17-6',
        score: 4,
        rank: 7,
      },
      home: {
        id: 'lsu',
        name: 'LSU Tigers',
        record: '19-4',
        score: 5,
        rank: 2,
      },
    },
    {
      id: 'stanford-oregonstate-2025-03-14',
      conference: 'Pac-12',
      startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      venue: 'Sunken Diamond — Stanford, CA',
      status: 'scheduled',
      leverageIndex: 1.1,
      broadcast: 'Pac-12 Bay Area',
      boxScorePath: '/baseball/ncaab/games/stanford-oregonstate-2025-03-14',
      away: {
        id: 'osu',
        name: 'Oregon State Beavers',
        record: '15-5',
        rank: 10,
      },
      home: {
        id: 'stan',
        name: 'Stanford Cardinal',
        record: '13-7',
        rank: 14,
      },
    },
    {
      id: 'texas-tech-oklahoma-2025-03-13',
      conference: 'Big 12',
      startTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      venue: 'Rip Griffin Park — Lubbock, TX',
      status: 'final',
      leverageIndex: 2.4,
      lastPlay: 'Jett hits walk-off single to right',
      broadcast: 'ESPN+',
      boxScorePath: '/baseball/ncaab/games/texas-tech-oklahoma-2025-03-13',
      away: {
        id: 'ou',
        name: 'Oklahoma Sooners',
        record: '16-8',
        score: 7,
      },
      home: {
        id: 'ttu',
        name: 'Texas Tech Red Raiders',
        record: '18-5',
        score: 8,
      },
    },
  ],
};

export async function GET() {
  return NextResponse.json(sampleGames);
}
