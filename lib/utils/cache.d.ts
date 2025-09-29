export interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expires: number;
}
export declare class MemoryCache {
    private cache;
    private readonly DEFAULT_TTL;
    /**
     * Get cached data if available and not expired
     */
    get<T>(key: string): T | null;
    /**
     * Set data in cache with optional TTL
     */
    set<T>(key: string, data: T, ttl?: number): void;
    /**
     * Clear specific key or all cache
     */
    clear(key?: string): void;
    /**
     * Get cache statistics
     */
    getStats(): {
        size: number;
        keys: string[];
    };
    /**
     * Prune expired entries
     */
    prune(): number;
}
export declare const apiCache: MemoryCache;
/**
 * Wrapper for fetch with caching
 */
export declare function fetchWithCache<T>(url: string, options?: RequestInit & {
    ttl?: number;
}): Promise<T>;
/**
 * Cache metrics for monitoring
 */
export interface CacheMetrics {
    hits: number;
    misses: number;
    hitRate: number;
    size: number;
    pruned: number;
}
declare class MetricsCollector {
    private hits;
    private misses;
    private pruned;
    recordHit(): void;
    recordMiss(): void;
    recordPrune(count: number): void;
    getMetrics(): CacheMetrics;
    reset(): void;
}
export declare const cacheMetrics: MetricsCollector;
export {};
//# sourceMappingURL=cache.d.ts.map