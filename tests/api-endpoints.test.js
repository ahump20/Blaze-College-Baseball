import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import worker from '../index.js';

function createKVNamespace() {
  const store = new Map();
  return {
    async get(key, type) {
      const value = store.get(key);
      if (value === undefined) {
        return null;
      }
      if (type === 'json') {
        try {
          return JSON.parse(value);
        } catch (error) {
          throw new Error(`Failed to parse cached JSON for key ${key}: ${error.message}`);
        }
      }
      return value;
    },
    async put(key, value) {
      store.set(key, value);
    },
    async delete(key) {
      store.delete(key);
    },
  };
}

const SAMPLE_LIVE_GAMES = {
  games: [
    {
      id: 'highlightly-game-1',
      status: 'in_progress',
      start_time: '2025-03-15T19:00:00Z',
      venue: { name: 'Alex Box Stadium' },
      inning: { number: 5, half: 'top' },
      situation: { outs: 2, runnersOn: 'Runners on 1st & 2nd' },
      teams: {
        away: {
          id: 'texas',
          name: 'Texas',
          abbreviation: 'TEX',
          conference: 'BIG12',
          overallRecord: { wins: 12, losses: 3 },
          conferenceRecord: { wins: 3, losses: 1 },
          score: 4,
        },
        home: {
          id: 'lsu',
          name: 'LSU',
          abbreviation: 'LSU',
          conference: 'SEC',
          overallRecord: { wins: 15, losses: 2 },
          conferenceRecord: { wins: 4, losses: 0 },
          score: 6,
        },
      },
      pitching: {
        current: { name: 'Javen Coleman', number: 17, pitchCount: 82, era: '3.24' },
      },
      batting: {
        current: { name: 'Max Belyeu', number: 5, avg: '.342' },
      },
    },
    {
      id: 'highlightly-game-2',
      status: 'final',
      start_time: '2025-03-15T17:00:00Z',
      venue: 'Dudy Noble Field',
      teams: {
        away: {
          id: 'arkansas',
          name: 'Arkansas',
          abbreviation: 'ARK',
          conference: 'SEC',
          overallRecord: { wins: 14, losses: 4 },
          conferenceRecord: { wins: 2, losses: 2 },
          score: 3,
        },
        home: {
          id: 'mississippi-state',
          name: 'Mississippi State',
          abbreviation: 'MSU',
          conference: 'SEC',
          overallRecord: { wins: 11, losses: 5 },
          conferenceRecord: { wins: 2, losses: 2 },
          score: 5,
        },
      },
    },
  ],
};

const SAMPLE_STANDINGS = {
  conference: 'SEC',
  teams: [
    {
      id: 'lsu',
      name: 'LSU',
      conference: { wins: 4, losses: 0 },
      overall: { wins: 15, losses: 2 },
      home: { wins: 8, losses: 1 },
      away: { wins: 5, losses: 1 },
      rpi: { rank: 2, value: 0.6845 },
      streak: 'W8',
    },
    {
      id: 'arkansas',
      name: 'Arkansas',
      conference: { wins: 2, losses: 2 },
      overall: { wins: 14, losses: 4 },
      home: { wins: 9, losses: 1 },
      away: { wins: 3, losses: 3 },
      rpi: { rank: 7, value: 0.6345 },
      streak: 'L1',
    },
  ],
};

const SAMPLE_ACC_STANDINGS = {
  conference: 'ACC',
  teams: [
    {
      id: 'clemson',
      name: 'Clemson',
      conference: { wins: 3, losses: 1 },
      overall: { wins: 13, losses: 3 },
      home: { wins: 9, losses: 1 },
      away: { wins: 3, losses: 2 },
      rpi: { rank: 4, value: 0.661 },
      streak: 'W4',
    },
    {
      id: 'duke',
      name: 'Duke',
      conference: { wins: 2, losses: 2 },
      overall: { wins: 11, losses: 5 },
      home: { wins: 6, losses: 2 },
      away: { wins: 4, losses: 3 },
      rpi: { rank: 12, value: 0.6012 },
      streak: 'L1',
    },
  ],
};

function createMockFetch() {
  const routes = new Map([
    [
      'https://highlightly.example.com/v1/college-baseball/games/live',
      () => new Response(JSON.stringify(SAMPLE_LIVE_GAMES), { status: 200 }),
    ],
    [
      'https://highlightly.example.com/v1/college-baseball/standings/SEC',
      () => new Response(JSON.stringify(SAMPLE_STANDINGS), { status: 200 }),
    ],
    [
      'https://highlightly.example.com/v1/college-baseball/standings/ACC',
      () => new Response(JSON.stringify(SAMPLE_ACC_STANDINGS), { status: 200 }),
    ],
  ]);

  return vi.fn(async (input, init) => {
    const url = typeof input === 'string' ? input : input.url;
    const handler = routes.get(url);
    if (!handler) {
      throw new Error(`Unexpected fetch call for ${url}`);
    }
    return handler(init);
  });
}

describe('Cloudflare Worker API integration', () => {
  let env;
  let fetchMock;
  let originalFetch;

  beforeEach(() => {
    env = {
      KV: createKVNamespace(),
      HIGHLIGHTLY_API_BASE_URL: 'https://highlightly.example.com',
      HIGHLIGHTLY_API_KEY: 'test-key',
      NCAA_API_BASE_URL: 'https://ncaa.example.com',
    };

    fetchMock = createMockFetch();
    originalFetch = global.fetch;
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    if (originalFetch) {
      global.fetch = originalFetch;
    } else {
      delete global.fetch;
    }
    vi.restoreAllMocks();
  });

  it('returns normalized live games from Highlightly', async () => {
    const request = new Request('https://worker.example.com/api/games/live');
    const response = await worker.fetch(request, env, {});
    const payload = await response.json();

    expect(Array.isArray(payload.games)).toBe(true);
    expect(payload.games.length).toBe(2);
    expect(payload.games[0].homeTeam.conference).toBe('SEC');
    expect(payload.games[0].awayTeam.conference).toBe('BIG12');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://highlightly.example.com/v1/college-baseball/games/live',
      expect.objectContaining({ headers: expect.any(Headers) })
    );
  });

  it('caches live games responses with sub-minute TTL', async () => {
    const request = new Request('https://worker.example.com/api/games/live');
    await worker.fetch(request, env, {});
    await worker.fetch(request, env, {});

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const cached = await env.KV.get('ncaa:games:live', 'json');
    expect(Array.isArray(cached)).toBe(true);
  });

  it('returns standings for multiple conferences', async () => {
    const secRequest = new Request('https://worker.example.com/api/standings/SEC');
    const accRequest = new Request('https://worker.example.com/api/standings/ACC');

    const secResponse = await worker.fetch(secRequest, env, {});
    const accResponse = await worker.fetch(accRequest, env, {});

    const secPayload = await secResponse.json();
    const accPayload = await accResponse.json();

    expect(secPayload.conference).toBe('SEC');
    expect(secPayload.teams.some((team) => team.name === 'LSU')).toBe(true);
    expect(accPayload.conference).toBe('ACC');
    expect(accPayload.teams.some((team) => team.name === 'Clemson')).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://highlightly.example.com/v1/college-baseball/standings/SEC',
      expect.objectContaining({ headers: expect.any(Headers) })
    );
    expect(fetchMock).toHaveBeenCalledWith(
      'https://highlightly.example.com/v1/college-baseball/standings/ACC',
      expect.objectContaining({ headers: expect.any(Headers) })
    );
  });
});
