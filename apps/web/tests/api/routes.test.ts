import Stripe from 'stripe';
import { NextRequest } from 'next/server';

import { clearCache } from '@/lib/cache';
import { resetPrismaClient, setPrismaClient } from '@/lib/db';

const stripeApiVersion: Stripe.StripeConfig['apiVersion'] = '2024-06-20';

function buildMockPrisma() {
  return {
    game: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    team: {
      findMany: jest.fn(),
    },
    player: {
      findMany: jest.fn(),
    },
    conference: {
      findMany: jest.fn(),
    },
    ranking: {
      findMany: jest.fn(),
    },
    stripeEvent: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };
}

describe('API route smoke tests', () => {
  beforeEach(() => {
    clearCache();
  });

  afterEach(() => {
    resetPrismaClient();
  });

  test('games listing requires date parameter', async () => {
    const mockPrisma = buildMockPrisma();
    setPrismaClient(mockPrisma as any);
    const { GET } = await import('@/app/api/v1/games/route');

    const response = await GET(new NextRequest('http://localhost/api/v1/games?sport=baseball'));

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('date');
  });

  test('games listing returns formatted payload', async () => {
    const mockPrisma = buildMockPrisma();
    const now = new Date('2024-03-01T18:00:00Z');
    mockPrisma.game.findMany.mockResolvedValue([
      {
        id: 'game_1',
        sport: 'baseball',
        status: 'scheduled',
        startsAt: now,
        venue: 'Alex Box Stadium',
        conference: {
          id: 'conf_1',
          name: 'SEC',
          slug: 'sec',
          sport: 'baseball',
          createdAt: now,
          updatedAt: now,
        },
        homeTeam: {
          id: 'team_lsu',
          name: 'LSU Tigers',
          slug: 'lsu',
          sport: 'baseball',
          record: '10-2',
          logoUrl: null,
          conferenceId: 'conf_1',
          createdAt: now,
          updatedAt: now,
        },
        awayTeam: {
          id: 'team_florida',
          name: 'Florida Gators',
          slug: 'florida',
          sport: 'baseball',
          record: '9-3',
          logoUrl: null,
          conferenceId: 'conf_1',
          createdAt: now,
          updatedAt: now,
        },
      },
    ]);
    setPrismaClient(mockPrisma as any);

    const { GET } = await import('@/app/api/v1/games/route');
    const response = await GET(
      new NextRequest('http://localhost/api/v1/games?date=2024-03-01&sport=baseball'),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data).toHaveLength(1);
    expect(payload.meta.count).toBe(1);
    expect(payload.data[0]).toMatchObject({
      id: 'game_1',
      homeTeam: {
        id: 'team_lsu',
      },
      awayTeam: {
        id: 'team_florida',
      },
    });
  });

  test('players endpoint enforces teamId', async () => {
    const mockPrisma = buildMockPrisma();
    setPrismaClient(mockPrisma as any);
    const { GET } = await import('@/app/api/v1/players/route');

    const response = await GET(new NextRequest('http://localhost/api/v1/players'));

    expect(response.status).toBe(400);
  });

  test('stripe webhook enforces idempotency', async () => {
    const mockPrisma = buildMockPrisma();
    mockPrisma.stripeEvent.findUnique.mockResolvedValueOnce(null);
    mockPrisma.stripeEvent.create.mockResolvedValue({
      eventId: 'evt_1',
      type: 'checkout.session.completed',
      payload: {},
      processed: new Date(),
      id: 'id_1',
    });
    mockPrisma.stripeEvent.findUnique.mockResolvedValueOnce({
      eventId: 'evt_1',
      type: 'checkout.session.completed',
      payload: {},
      processed: new Date(),
      id: 'id_1',
    });
    setPrismaClient(mockPrisma as any);

    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';

    const payload = JSON.stringify({
      id: 'evt_1',
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_test' } },
    });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: stripeApiVersion,
    });
    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: process.env.STRIPE_WEBHOOK_SECRET,
    });

    const { POST } = await import('@/app/api/v1/stripe/webhook/route');

    const firstResponse = await POST(
      new NextRequest('http://localhost/api/v1/stripe/webhook', {
        method: 'POST',
        headers: new Headers({
          'stripe-signature': signature,
          'content-type': 'application/json',
        }),
        body: payload,
      }),
    );

    expect(firstResponse.status).toBe(200);
    const firstBody = await firstResponse.json();
    expect(firstBody.idempotent).toBe(false);
    expect(mockPrisma.stripeEvent.create).toHaveBeenCalledTimes(1);

    const secondResponse = await POST(
      new NextRequest('http://localhost/api/v1/stripe/webhook', {
        method: 'POST',
        headers: new Headers({
          'stripe-signature': signature,
          'content-type': 'application/json',
        }),
        body: payload,
      }),
    );

    expect(secondResponse.status).toBe(200);
    const secondBody = await secondResponse.json();
    expect(secondBody.idempotent).toBe(true);
  });
});
