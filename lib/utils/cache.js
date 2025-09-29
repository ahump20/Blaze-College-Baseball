export class MemoryCache {
    cache = new Map();
    DEFAULT_TTL = 30000; // 30 seconds
    /**
     * Get cached data if available and not expired
     */
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        }
        if (Date.now() > entry.expires) {
            this.cache.delete(key);
            return null;
        }
        return entry.data;
    }
    /**
     * Set data in cache with optional TTL
     */
    set(key, data, ttl) {
        const ttlMs = ttl || this.DEFAULT_TTL;
        const now = Date.now();
        this.cache.set(key, {
            data,
            timestamp: now,
            expires: now + ttlMs,
        });
    }
    /**
     * Clear specific key or all cache
     */
    clear(key) {
        if (key) {
            this.cache.delete(key);
        }
        else {
            this.cache.clear();
        }
    }
    /**
     * Get cache statistics
     */
    getStats() {
        const keys = Array.from(this.cache.keys());
        return {
            size: this.cache.size,
            keys,
        };
    }
    /**
     * Prune expired entries
     */
    prune() {
        const now = Date.now();
        let pruned = 0;
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expires) {
                this.cache.delete(key);
                pruned++;
            }
        }
        return pruned;
    }
}
// Singleton instance for application-wide caching
export const apiCache = new MemoryCache();
/**
 * Wrapper for fetch with caching
 */
export async function fetchWithCache(url, options) {
    const cacheKey = `${options?.method || 'GET'}:${url}`;
    // Check cache first
    const cached = apiCache.get(cacheKey);
    if (cached !== null) {
        console.log(`[Cache HIT] ${cacheKey}`);
        return cached;
    }
    console.log(`[Cache MISS] ${cacheKey}`);
    // Fetch from network
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Cache successful responses
    apiCache.set(cacheKey, data, options?.ttl);
    return data;
}
class MetricsCollector {
    hits = 0;
    misses = 0;
    pruned = 0;
    recordHit() {
        this.hits++;
    }
    recordMiss() {
        this.misses++;
    }
    recordPrune(count) {
        this.pruned += count;
    }
    getMetrics() {
        const total = this.hits + this.misses;
        const hitRate = total > 0 ? this.hits / total : 0;
        return {
            hits: this.hits,
            misses: this.misses,
            hitRate,
            size: apiCache.getStats().size,
            pruned: this.pruned,
        };
    }
    reset() {
        this.hits = 0;
        this.misses = 0;
        this.pruned = 0;
    }
}
export const cacheMetrics = new MetricsCollector();
// Prune expired entries every minute
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const pruned = apiCache.prune();
        if (pruned > 0) {
            cacheMetrics.recordPrune(pruned);
            console.log(`[Cache] Pruned ${pruned} expired entries`);
        }
    }, 60000);
}
//# sourceMappingURL=cache.js.map