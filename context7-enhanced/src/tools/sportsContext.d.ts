import { z } from "zod";
export declare const SportsContextInput: z.ZodObject<{
    sport: z.ZodEnum<["baseball", "football", "basketball", "track"]>;
    league: z.ZodOptional<z.ZodString>;
    team: z.ZodOptional<z.ZodString>;
    player: z.ZodOptional<z.ZodString>;
    timeframe: z.ZodOptional<z.ZodString>;
    maxTokens: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    sport: "baseball" | "football" | "basketball" | "track";
    maxTokens: number;
    league?: string | undefined;
    team?: string | undefined;
    player?: string | undefined;
    timeframe?: string | undefined;
}, {
    sport: "baseball" | "football" | "basketball" | "track";
    league?: string | undefined;
    team?: string | undefined;
    player?: string | undefined;
    timeframe?: string | undefined;
    maxTokens?: number | undefined;
}>;
export declare const SportsContextOutput: z.ZodObject<{
    supplement: z.ZodObject<{
        type: z.ZodLiteral<"context">;
        ts: z.ZodString;
        ttlSeconds: z.ZodNumber;
        ordering: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        body: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "context";
        ts: string;
        ttlSeconds: number;
        ordering: string[];
        body: string;
    }, {
        type: "context";
        ts: string;
        ttlSeconds: number;
        body: string;
        ordering?: string[] | undefined;
    }>;
    cache: z.ZodOptional<z.ZodObject<{
        tier: z.ZodEnum<["mem", "redis", "source"]>;
        hit: z.ZodBoolean;
        ageMs: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        tier: "source" | "mem" | "redis";
        hit: boolean;
        ageMs?: number | undefined;
    }, {
        tier: "source" | "mem" | "redis";
        hit: boolean;
        ageMs?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    supplement: {
        type: "context";
        ts: string;
        ttlSeconds: number;
        ordering: string[];
        body: string;
    };
    cache?: {
        tier: "source" | "mem" | "redis";
        hit: boolean;
        ageMs?: number | undefined;
    } | undefined;
}, {
    supplement: {
        type: "context";
        ts: string;
        ttlSeconds: number;
        body: string;
        ordering?: string[] | undefined;
    };
    cache?: {
        tier: "source" | "mem" | "redis";
        hit: boolean;
        ageMs?: number | undefined;
    } | undefined;
}>;
export declare const InjectSportsContextInput: z.ZodObject<{
    context7CompatibleLibraryID: z.ZodString;
    topic: z.ZodString;
    supplement: z.ZodObject<{
        type: z.ZodLiteral<"context">;
        ts: z.ZodString;
        ttlSeconds: z.ZodNumber;
        ordering: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        body: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "context";
        ts: string;
        ttlSeconds: number;
        ordering: string[];
        body: string;
    }, {
        type: "context";
        ts: string;
        ttlSeconds: number;
        body: string;
        ordering?: string[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    context7CompatibleLibraryID: string;
    topic: string;
    supplement: {
        type: "context";
        ts: string;
        ttlSeconds: number;
        ordering: string[];
        body: string;
    };
}, {
    context7CompatibleLibraryID: string;
    topic: string;
    supplement: {
        type: "context";
        ts: string;
        ttlSeconds: number;
        body: string;
        ordering?: string[] | undefined;
    };
}>;
export declare const InjectSportsContextOutput: z.ZodObject<{
    merged: z.ZodObject<{
        docs: z.ZodString;
        supplement: z.ZodObject<{
            type: z.ZodLiteral<"context">;
            ts: z.ZodString;
            ttlSeconds: z.ZodNumber;
            ordering: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            body: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "context";
            ts: string;
            ttlSeconds: number;
            ordering: string[];
            body: string;
        }, {
            type: "context";
            ts: string;
            ttlSeconds: number;
            body: string;
            ordering?: string[] | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        docs: string;
        supplement: {
            type: "context";
            ts: string;
            ttlSeconds: number;
            ordering: string[];
            body: string;
        };
    }, {
        docs: string;
        supplement: {
            type: "context";
            ts: string;
            ttlSeconds: number;
            body: string;
            ordering?: string[] | undefined;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    merged: {
        docs: string;
        supplement: {
            type: "context";
            ts: string;
            ttlSeconds: number;
            ordering: string[];
            body: string;
        };
    };
}, {
    merged: {
        docs: string;
        supplement: {
            type: "context";
            ts: string;
            ttlSeconds: number;
            body: string;
            ordering?: string[] | undefined;
        };
    };
}>;
export declare const tools: {
    "sports-context": {
        inputSchema: z.ZodObject<{
            sport: z.ZodEnum<["baseball", "football", "basketball", "track"]>;
            league: z.ZodOptional<z.ZodString>;
            team: z.ZodOptional<z.ZodString>;
            player: z.ZodOptional<z.ZodString>;
            timeframe: z.ZodOptional<z.ZodString>;
            maxTokens: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            sport: "baseball" | "football" | "basketball" | "track";
            maxTokens: number;
            league?: string | undefined;
            team?: string | undefined;
            player?: string | undefined;
            timeframe?: string | undefined;
        }, {
            sport: "baseball" | "football" | "basketball" | "track";
            league?: string | undefined;
            team?: string | undefined;
            player?: string | undefined;
            timeframe?: string | undefined;
            maxTokens?: number | undefined;
        }>;
        outputSchema: z.ZodObject<{
            supplement: z.ZodObject<{
                type: z.ZodLiteral<"context">;
                ts: z.ZodString;
                ttlSeconds: z.ZodNumber;
                ordering: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                body: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: "context";
                ts: string;
                ttlSeconds: number;
                ordering: string[];
                body: string;
            }, {
                type: "context";
                ts: string;
                ttlSeconds: number;
                body: string;
                ordering?: string[] | undefined;
            }>;
            cache: z.ZodOptional<z.ZodObject<{
                tier: z.ZodEnum<["mem", "redis", "source"]>;
                hit: z.ZodBoolean;
                ageMs: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                tier: "source" | "mem" | "redis";
                hit: boolean;
                ageMs?: number | undefined;
            }, {
                tier: "source" | "mem" | "redis";
                hit: boolean;
                ageMs?: number | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            supplement: {
                type: "context";
                ts: string;
                ttlSeconds: number;
                ordering: string[];
                body: string;
            };
            cache?: {
                tier: "source" | "mem" | "redis";
                hit: boolean;
                ageMs?: number | undefined;
            } | undefined;
        }, {
            supplement: {
                type: "context";
                ts: string;
                ttlSeconds: number;
                body: string;
                ordering?: string[] | undefined;
            };
            cache?: {
                tier: "source" | "mem" | "redis";
                hit: boolean;
                ageMs?: number | undefined;
            } | undefined;
        }>;
    };
    "inject-sports-context": {
        inputSchema: z.ZodObject<{
            context7CompatibleLibraryID: z.ZodString;
            topic: z.ZodString;
            supplement: z.ZodObject<{
                type: z.ZodLiteral<"context">;
                ts: z.ZodString;
                ttlSeconds: z.ZodNumber;
                ordering: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                body: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: "context";
                ts: string;
                ttlSeconds: number;
                ordering: string[];
                body: string;
            }, {
                type: "context";
                ts: string;
                ttlSeconds: number;
                body: string;
                ordering?: string[] | undefined;
            }>;
        }, "strip", z.ZodTypeAny, {
            context7CompatibleLibraryID: string;
            topic: string;
            supplement: {
                type: "context";
                ts: string;
                ttlSeconds: number;
                ordering: string[];
                body: string;
            };
        }, {
            context7CompatibleLibraryID: string;
            topic: string;
            supplement: {
                type: "context";
                ts: string;
                ttlSeconds: number;
                body: string;
                ordering?: string[] | undefined;
            };
        }>;
        outputSchema: z.ZodObject<{
            merged: z.ZodObject<{
                docs: z.ZodString;
                supplement: z.ZodObject<{
                    type: z.ZodLiteral<"context">;
                    ts: z.ZodString;
                    ttlSeconds: z.ZodNumber;
                    ordering: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                    body: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    type: "context";
                    ts: string;
                    ttlSeconds: number;
                    ordering: string[];
                    body: string;
                }, {
                    type: "context";
                    ts: string;
                    ttlSeconds: number;
                    body: string;
                    ordering?: string[] | undefined;
                }>;
            }, "strip", z.ZodTypeAny, {
                docs: string;
                supplement: {
                    type: "context";
                    ts: string;
                    ttlSeconds: number;
                    ordering: string[];
                    body: string;
                };
            }, {
                docs: string;
                supplement: {
                    type: "context";
                    ts: string;
                    ttlSeconds: number;
                    body: string;
                    ordering?: string[] | undefined;
                };
            }>;
        }, "strip", z.ZodTypeAny, {
            merged: {
                docs: string;
                supplement: {
                    type: "context";
                    ts: string;
                    ttlSeconds: number;
                    ordering: string[];
                    body: string;
                };
            };
        }, {
            merged: {
                docs: string;
                supplement: {
                    type: "context";
                    ts: string;
                    ttlSeconds: number;
                    body: string;
                    ordering?: string[] | undefined;
                };
            };
        }>;
    };
};
//# sourceMappingURL=sportsContext.d.ts.map