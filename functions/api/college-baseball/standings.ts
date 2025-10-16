import { listStandings } from '../../../lib/db/collegeBaseballRepository';
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

function buildKey(conference?: string | null, season?: number | null) {
  return `college-baseball:standings:${conference ?? 'all'}:${season ?? 'current'}`;
}

export async function onRequest(context: RequestContext): Promise<Response> {
  const { request } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  const url = new URL(request.url);
  const conference = url.searchParams.get('conference');
  const seasonParam = url.searchParams.get('season');
  const season = seasonParam ? Number(seasonParam) : undefined;

  const redis = getUpstashRedis();
  const key = buildKey(conference, season ?? null);
  const start = Date.now();

  try {
    if (redis) {
      const cached = await redis.get(key);
      if (cached) {
        await monitoringClient.emitMetric({ name: 'api.standings.latency_ms', value: Date.now() - start, tags: { cached: 'true' } });
        return new Response(JSON.stringify({ success: true, data: cached, cached: true }), {
          status: 200,
          headers: {
            ...corsHeaders(),
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=120, stale-while-revalidate=60'
          }
        });
      }
    }

    const standings = await listStandings({ conference: conference ?? undefined, season });

    if (redis) {
      await redis.set(key, standings, { ex: 600 });
    }

    await monitoringClient.emitMetric({ name: 'api.standings.latency_ms', value: Date.now() - start, tags: { cached: 'false' } });

    return new Response(JSON.stringify({ success: true, data: standings, cached: false }), {
      status: 200,
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=600, stale-while-revalidate=300'
      }
    });
  } catch (error: any) {
    await monitoringClient.emitMetric({ name: 'api.standings.error', value: 1 });
    monitoringClient.log({ message: 'standings endpoint failed', level: 'error', context: { error: error.message } });

    return new Response(JSON.stringify({ success: false, error: 'Failed to load standings', message: error.message }), {
      status: 500,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
    });
  }
}
