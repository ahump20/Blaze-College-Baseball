// context7-enhanced/src/tools/cache.ts
import { z } from "zod";

export const CacheStatsInput = z.object({
  scope: z.enum(["docs", "context"]).optional()
});
export const CacheStatsOutput = z.object({
  scope: z.string(),
  mem: z.object({ size: z.number().int(), hits: z.number().int(), misses: z.number().int() }),
  redis: z.object({ hits: z.number().int(), misses: z.number().int() }).optional(),
  p95HitMs: z.number().optional()
});

export const InvalidateCacheInput = z.object({
  key: z.string().optional(),
  pattern: z.string().optional()
}).refine((value) => !!(value.key || value.pattern), { message: "Provide key or pattern." });

export const InvalidateCacheOutput = z.object({
  ok: z.boolean(),
  removed: z.number().int().optional()
});

export const tools = {
  "cache-stats": {
    inputSchema: CacheStatsInput,
    outputSchema: CacheStatsOutput
  },
  "invalidate-cache": {
    inputSchema: InvalidateCacheInput,
    outputSchema: InvalidateCacheOutput
  }
};
