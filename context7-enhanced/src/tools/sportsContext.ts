// context7-enhanced/src/tools/sportsContext.ts
import { z } from "zod";

export const SportsContextInput = z.object({
  sport: z.enum(["baseball","football","basketball","track"]),
  league: z.string().optional(),        // e.g., "MLB", "NFL", "NCAA", "HS-TX"
  team: z.string().optional(),          // canonical name e.g., "Cardinals", "Titans"
  player: z.string().optional(),
  timeframe: z.string().optional(),     // e.g., "live", "24h", "2024-season"
  maxTokens: z.number().int().min(100).max(800).default(300)
});

export const SportsContextOutput = z.object({
  supplement: z.object({
    type: z.literal("context"),
    ts: z.string(),                      // ISO timestamp
    ttlSeconds: z.number().int().min(5).max(604800), // 15s live..7d hist
    ordering: z.array(z.string()).default(["baseball","football","basketball","track"]),
    body: z.string()                     // small, bounded text (no authoritative docs)
  }),
  cache: z.object({
    tier: z.enum(["mem","redis","source"]),
    hit: z.boolean(),
    ageMs: z.number().int().optional()
  }).optional()
});

export const InjectSportsContextInput = z.object({
  context7CompatibleLibraryID: z.string().min(2),
  topic: z.string().min(2),
  supplement: SportsContextOutput.shape.supplement // must be bounded
});
export const InjectSportsContextOutput = z.object({
  merged: z.object({
    docs: z.string(),       // original docs (unchanged)
    supplement: SportsContextOutput.shape.supplement
  })
});

export const tools = {
  "sports-context": {
    inputSchema: SportsContextInput,
    outputSchema: SportsContextOutput
  },
  "inject-sports-context": {
    inputSchema: InjectSportsContextInput,
    outputSchema: InjectSportsContextOutput
  }
};