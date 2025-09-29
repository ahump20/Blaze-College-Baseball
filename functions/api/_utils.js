const DEFAULT_CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
};

export const corsHeaders = {
  ...DEFAULT_CORS_HEADERS,
  'Content-Type': 'application/json',
};

export const ok = (data, init = {}) =>
  new Response(JSON.stringify(data), {
    status: init.status ?? 200,
    headers: {
      ...corsHeaders,
      ...(init.headers || {}),
    },
  });

export const err = (error, status = 500, init = {}) => {
  const message =
    error instanceof Error && error.message ? error.message : 'Internal Server Error';

  return new Response(
    JSON.stringify({
      error: message,
    }),
    {
      status,
      headers: {
        ...corsHeaders,
        ...(init.headers || {}),
      },
    },
  );
};

const getCacheBinding = (env) => {
  if (!env || typeof env !== 'object') {
    return null;
  }

  const candidates = ['CACHE', 'KV', 'kv', 'cache'];
  for (const key of candidates) {
    const binding = env[key];
    if (binding && typeof binding.get === 'function' && typeof binding.put === 'function') {
      return binding;
    }
  }

  return null;
};

export const cache = async (env, key, fetcher, ttl = 300) => {
  const store = getCacheBinding(env);
  if (!store || typeof fetcher !== 'function') {
    return fetcher();
  }

  const now = Date.now();
  try {
    const cached = await store.get(key);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.expires && parsed.expires > now) {
        return parsed.data;
      }
    }
  } catch (error) {
    console.warn(`Cache read miss for key ${key}:`, error);
  }

  const fresh = await fetcher();

  try {
    await store.put(
      key,
      JSON.stringify({
        data: fresh,
        expires: now + ttl * 1000,
      }),
      { expirationTtl: ttl },
    );
  } catch (error) {
    console.warn(`Cache write failed for key ${key}:`, error);
  }

  return fresh;
};

export const preflight = () => new Response(null, { headers: corsHeaders });

export const createTimeoutSignal = (timeoutMs = 8000) => {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(timeoutMs);
  }

  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs).unref?.();
  return controller.signal;
};
