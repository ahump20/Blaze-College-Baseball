import { z } from "zod";
export declare const CacheStatsInput: z.ZodObject<{
    scope: z.ZodOptional<z.ZodEnum<["docs", "context"]>>;
}, "strip", z.ZodTypeAny, {
    scope?: "docs" | "context" | undefined;
}, {
    scope?: "docs" | "context" | undefined;
}>;
export declare const CacheStatsOutput: z.ZodObject<{
    scope: z.ZodString;
    mem: z.ZodObject<{
        size: z.ZodNumber;
        hits: z.ZodNumber;
        misses: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        size: number;
        hits: number;
        misses: number;
    }, {
        size: number;
        hits: number;
        misses: number;
    }>;
    redis: z.ZodOptional<z.ZodObject<{
        hits: z.ZodNumber;
        misses: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        hits: number;
        misses: number;
    }, {
        hits: number;
        misses: number;
    }>>;
    p95HitMs: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    scope: string;
    mem: {
        size: number;
        hits: number;
        misses: number;
    };
    redis?: {
        hits: number;
        misses: number;
    } | undefined;
    p95HitMs?: number | undefined;
}, {
    scope: string;
    mem: {
        size: number;
        hits: number;
        misses: number;
    };
    redis?: {
        hits: number;
        misses: number;
    } | undefined;
    p95HitMs?: number | undefined;
}>;
export declare const InvalidateCacheInput: z.ZodEffects<z.ZodObject<{
    key: z.ZodOptional<z.ZodString>;
    pattern: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    key?: string | undefined;
    pattern?: string | undefined;
}, {
    key?: string | undefined;
    pattern?: string | undefined;
}>, {
    key?: string | undefined;
    pattern?: string | undefined;
}, {
    key?: string | undefined;
    pattern?: string | undefined;
}>;
export declare const InvalidateCacheOutput: z.ZodObject<{
    ok: z.ZodBoolean;
    removed: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    ok: boolean;
    removed?: number | undefined;
}, {
    ok: boolean;
    removed?: number | undefined;
}>;
export declare const tools: {
    "cache-stats": {
        inputSchema: z.ZodObject<{
            scope: z.ZodOptional<z.ZodEnum<["docs", "context"]>>;
        }, "strip", z.ZodTypeAny, {
            scope?: "docs" | "context" | undefined;
        }, {
            scope?: "docs" | "context" | undefined;
        }>;
        outputSchema: z.ZodObject<{
            scope: z.ZodString;
            mem: z.ZodObject<{
                size: z.ZodNumber;
                hits: z.ZodNumber;
                misses: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                size: number;
                hits: number;
                misses: number;
            }, {
                size: number;
                hits: number;
                misses: number;
            }>;
            redis: z.ZodOptional<z.ZodObject<{
                hits: z.ZodNumber;
                misses: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                hits: number;
                misses: number;
            }, {
                hits: number;
                misses: number;
            }>>;
            p95HitMs: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            scope: string;
            mem: {
                size: number;
                hits: number;
                misses: number;
            };
            redis?: {
                hits: number;
                misses: number;
            } | undefined;
            p95HitMs?: number | undefined;
        }, {
            scope: string;
            mem: {
                size: number;
                hits: number;
                misses: number;
            };
            redis?: {
                hits: number;
                misses: number;
            } | undefined;
            p95HitMs?: number | undefined;
        }>;
    };
    "invalidate-cache": {
        inputSchema: z.ZodEffects<z.ZodObject<{
            key: z.ZodOptional<z.ZodString>;
            pattern: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            key?: string | undefined;
            pattern?: string | undefined;
        }, {
            key?: string | undefined;
            pattern?: string | undefined;
        }>, {
            key?: string | undefined;
            pattern?: string | undefined;
        }, {
            key?: string | undefined;
            pattern?: string | undefined;
        }>;
        outputSchema: z.ZodObject<{
            ok: z.ZodBoolean;
            removed: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            ok: boolean;
            removed?: number | undefined;
        }, {
            ok: boolean;
            removed?: number | undefined;
        }>;
    };
};
//# sourceMappingURL=cache.d.ts.map