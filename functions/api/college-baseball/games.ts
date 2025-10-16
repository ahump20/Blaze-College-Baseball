import { listGames, type LiveGameSummary } from '../../../lib/db/collegeBaseballRepository';
import { LiveGameCache, type CacheableGame } from '../../../lib/cache/liveGameCache';
import { monitoringClient } from '../../../observability/metrics';

interface RequestContext {
  request: Request;
  env: Record<string, unknown>;
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

function buildCacheKey(date: string, conference?: string | null, status?: string | null, team?: string | null) {
  return `college-baseball:games:${date}:${conference ?? 'all'}:${status ?? 'all'}:${team ?? 'all'}`;
}

function toCacheableGames(games: LiveGameSummary[]): CacheableGame[] {
  return games.map((game) => ({
    id: game.id,
    status: game.status,
    startTime: game.startTime,
    homeTeam: { slug: game.homeTeam.slug, score: game.homeTeam.score },
    awayTeam: { slug: game.awayTeam.slug, score: game.awayTeam.score },
    updatedAt: new Date().toISOString()
  }));
}

function deriveTtl(games: LiveGameSummary[]): number {
  return games.some((game) => game.status === 'LIVE') ? 60 : 300;
}

export async function onRequest(context: RequestContext): Promise<Response> {
  const { request } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  const url = new URL(request.url);
  const date = url.searchParams.get('date') ?? new Date().toISOString().split('T')[0];
  const conference = url.searchParams.get('conference');
  const status = url.searchParams.get('status');
  const team = url.searchParams.get('team');

  const cacheKey = buildCacheKey(date, conference, status, team);
  const cache = new LiveGameCache();

  const start = Date.now();

  try {
    const cached = await cache.read(cacheKey);
    if (cached) {
      await monitoringClient.emitMetric({
        name: 'api.games.latency_ms',
        value: Date.now() - start,
        tags: { cached: 'true', conference: conference ?? 'all' }
      });
      monitoringClient.log({ message: 'games cache hit', context: { cacheKey } });
      return new Response(
        JSON.stringify({ success: true, data: cached.games, cached: true, cacheTime: cached.generatedAt }),
        {
          status: 200,
          headers: {
            ...corsHeaders(),
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=30, stale-while-revalidate=30'
          }
        }
      );
    }

    const games = await listGames({ date, conference: conference ?? undefined, status: status ?? undefined, team: team ?? undefined });
    const ttl = deriveTtl(games);

    await cache.write(cacheKey, toCacheableGames(games), ttl);

    const duration = Date.now() - start;
    await monitoringClient.emitMetric({
      name: 'api.games.latency_ms',
      value: duration,
      tags: { cached: 'false', conference: conference ?? 'all' }
    });

    return new Response(JSON.stringify({ success: true, data: games, cached: false, timestamp: new Date().toISOString() }), {
      status: 200,
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${ttl}, stale-while-revalidate=${Math.floor(ttl / 2)}`
      }
    });
  } catch (error: any) {
    await monitoringClient.emitMetric({
      name: 'api.games.error',
      value: 1,
      tags: { conference: conference ?? 'all' }
    });

    monitoringClient.log({ message: 'games endpoint failed', level: 'error', context: { error: error.message } });

    return new Response(
      JSON.stringify({ success: false, error: 'Failed to fetch games', message: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders(),
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
