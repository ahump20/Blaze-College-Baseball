import { getGameBoxscore } from '../../../lib/db/collegeBaseballRepository';
import { getUpstashRedis } from '../../../lib/cache/upstash';
import { monitoringClient } from '../../../observability/metrics';

interface RequestContext {
  request: Request;
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

function cacheKey(gameId: string) {
  return `college-baseball:boxscore:${gameId}`;
}

export async function onRequest(context: RequestContext): Promise<Response> {
  const { request } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  const url = new URL(request.url);
  const gameId = url.searchParams.get('gameId');

  if (!gameId) {
    return new Response(JSON.stringify({ success: false, error: 'Missing required parameter: gameId' }), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
    });
  }

  const redis = getUpstashRedis();
  const key = cacheKey(gameId);
  const start = Date.now();

  try {
    if (redis) {
      const cached = await redis.get(key);
      if (cached) {
        await monitoringClient.emitMetric({ name: 'api.boxscore.latency_ms', value: Date.now() - start, tags: { cached: 'true' } });
        return new Response(JSON.stringify({ success: true, data: cached, cached: true }), {
          status: 200,
          headers: {
            ...corsHeaders(),
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=30, stale-while-revalidate=30'
          }
        });
      }
    }

    const boxscore = await getGameBoxscore(gameId);

    if (!boxscore) {
      return new Response(JSON.stringify({ success: false, error: 'Game not found' }), {
        status: 404,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      });
    }

    const ttl = boxscore.game.status === 'FINAL' ? 3600 : 60;

    if (redis) {
      await redis.set(key, boxscore, { ex: ttl });
    }

    await monitoringClient.emitMetric({ name: 'api.boxscore.latency_ms', value: Date.now() - start, tags: { cached: 'false' } });

    return new Response(JSON.stringify({ success: true, data: boxscore, cached: false }), {
      status: 200,
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${ttl}, stale-while-revalidate=${Math.floor(ttl / 2)}`
      }
    });
  } catch (error: any) {
    await monitoringClient.emitMetric({ name: 'api.boxscore.error', value: 1 });
    monitoringClient.log({ message: 'boxscore endpoint failed', level: 'error', context: { error: error.message } });

    return new Response(JSON.stringify({ success: false, error: 'Failed to load box score', message: error.message }), {
      status: 500,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
    });
  }
}
