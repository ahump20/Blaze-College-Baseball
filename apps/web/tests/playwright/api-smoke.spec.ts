import { expect, test } from '@playwright/test';
import { NextRequest } from 'next/server';

import { clearCache } from '@/lib/cache';
import { resetPrismaClient, setPrismaClient } from '@/lib/db';

const baseMockPrisma = () => ({
  game: {
    findMany: async () => [],
    findUnique: async () => null,
  },
  team: {
    findMany: async () => [],
  },
  player: {
    findMany: async () => [],
  },
  conference: {
    findMany: async () => [],
  },
  ranking: {
    findMany: async () => [],
  },
  stripeEvent: {
    findUnique: async () => null,
    create: async () => ({}),
  },
});

test.beforeEach(() => {
  clearCache();
});

test.afterEach(() => {
  resetPrismaClient();
});

test('games endpoint responds with schedule payload', async () => {
  const now = new Date('2024-04-01T18:00:00Z');
  const mockPrisma = baseMockPrisma();
  mockPrisma.game.findMany = async () => [
    {
      id: 'game_42',
      sport: 'baseball',
      status: 'scheduled',
      startsAt: now,
      venue: 'Hawkins Field',
      conference: null,
      homeTeam: {
        id: 'team_vandy',
        name: 'Vanderbilt Commodores',
        slug: 'vanderbilt',
        sport: 'baseball',
        record: '18-3',
        logoUrl: null,
        conferenceId: null,
        createdAt: now,
        updatedAt: now,
      },
      awayTeam: {
        id: 'team_ole_miss',
        name: 'Ole Miss Rebels',
        slug: 'ole-miss',
        sport: 'baseball',
        record: '14-7',
        logoUrl: null,
        conferenceId: null,
        createdAt: now,
        updatedAt: now,
      },
    },
  ];
  setPrismaClient(mockPrisma as any);

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const gamesModule = require('../../app/api/v1/games/route');
  const response = await gamesModule.GET(
    new NextRequest('http://localhost/api/v1/games?date=2024-04-01'),
  );

  expect(response.status).toBe(200);
  const body = await response.json();
  expect(body.meta.count).toBe(1);
  expect(body.data[0].homeTeam.slug).toBe('vanderbilt');
});

test('teams endpoint enforces sport scoping', async () => {
  const mockPrisma = baseMockPrisma();
  mockPrisma.team.findMany = async () => [
    {
      id: 'team_wake',
      name: 'Wake Forest Demon Deacons',
      slug: 'wake-forest',
      sport: 'baseball',
      record: '16-4',
      logoUrl: null,
      conferenceId: 'conf_acc',
      createdAt: new Date(),
      updatedAt: new Date(),
      conference: {
        id: 'conf_acc',
        name: 'ACC',
        slug: 'acc',
        sport: 'baseball',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
  ];
  setPrismaClient(mockPrisma as any);

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const teamsModule = require('../../app/api/v1/teams/route');
  const response = await teamsModule.GET(
    new NextRequest('http://localhost/api/v1/teams?sport=baseball'),
  );

  expect(response.status).toBe(200);
  const body = await response.json();
  expect(body.data[0].conference.slug).toBe('acc');
});
