export type CacheKeyParts = Record<string, string | number | boolean | null | undefined>;

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const cacheStore = new Map<string, CacheEntry<unknown>>();

export function createCacheKey(namespace: string, parts: CacheKeyParts): string {
  const suffix = Object.entries(parts)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, value]) => `${key}:${String(value)}`)
    .join('|');
  return suffix ? `${namespace}::${suffix}` : namespace;
}

export async function getCachedOrHydrate<T>(
  key: string,
  ttlSeconds: number,
  compute: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const cached = cacheStore.get(key) as CacheEntry<T> | undefined;
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const value = await compute();
  cacheStore.set(key, {
    value,
    expiresAt: now + ttlSeconds * 1000,
  });
  return value;
}

export function invalidateCacheKey(key: string) {
  cacheStore.delete(key);
}

export function clearCache() {
  cacheStore.clear();
}
