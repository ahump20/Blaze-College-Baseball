export declare const mcpTools: {
    "cache-stats": {
        inputSchema: import("zod").ZodObject<{
            scope: import("zod").ZodOptional<import("zod").ZodEnum<["docs", "context"]>>;
        }, "strip", import("zod").ZodTypeAny, {
            scope?: "docs" | "context" | undefined;
        }, {
            scope?: "docs" | "context" | undefined;
        }>;
        outputSchema: import("zod").ZodObject<{
            scope: import("zod").ZodString;
            mem: import("zod").ZodObject<{
                size: import("zod").ZodNumber;
                hits: import("zod").ZodNumber;
                misses: import("zod").ZodNumber;
            }, "strip", import("zod").ZodTypeAny, {
                size: number;
                hits: number;
                misses: number;
            }, {
                size: number;
                hits: number;
                misses: number;
            }>;
            redis: import("zod").ZodOptional<import("zod").ZodObject<{
                hits: import("zod").ZodNumber;
                misses: import("zod").ZodNumber;
            }, "strip", import("zod").ZodTypeAny, {
                hits: number;
                misses: number;
            }, {
                hits: number;
                misses: number;
            }>>;
            p95HitMs: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, "strip", import("zod").ZodTypeAny, {
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
        inputSchema: import("zod").ZodEffects<import("zod").ZodObject<{
            key: import("zod").ZodOptional<import("zod").ZodString>;
            pattern: import("zod").ZodOptional<import("zod").ZodString>;
        }, "strip", import("zod").ZodTypeAny, {
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
        outputSchema: import("zod").ZodObject<{
            ok: import("zod").ZodBoolean;
            removed: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, "strip", import("zod").ZodTypeAny, {
            ok: boolean;
            removed?: number | undefined;
        }, {
            ok: boolean;
            removed?: number | undefined;
        }>;
    };
    "sports-context": {
        inputSchema: import("zod").ZodObject<{
            sport: import("zod").ZodEnum<["baseball", "football", "basketball", "track"]>;
            league: import("zod").ZodOptional<import("zod").ZodString>;
            team: import("zod").ZodOptional<import("zod").ZodString>;
            player: import("zod").ZodOptional<import("zod").ZodString>;
            timeframe: import("zod").ZodOptional<import("zod").ZodString>;
            maxTokens: import("zod").ZodDefault<import("zod").ZodNumber>;
        }, "strip", import("zod").ZodTypeAny, {
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
        outputSchema: import("zod").ZodObject<{
            supplement: import("zod").ZodObject<{
                type: import("zod").ZodLiteral<"context">;
                ts: import("zod").ZodString;
                ttlSeconds: import("zod").ZodNumber;
                ordering: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodString, "many">>;
                body: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
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
            cache: import("zod").ZodOptional<import("zod").ZodObject<{
                tier: import("zod").ZodEnum<["mem", "redis", "source"]>;
                hit: import("zod").ZodBoolean;
                ageMs: import("zod").ZodOptional<import("zod").ZodNumber>;
            }, "strip", import("zod").ZodTypeAny, {
                tier: "source" | "mem" | "redis";
                hit: boolean;
                ageMs?: number | undefined;
            }, {
                tier: "source" | "mem" | "redis";
                hit: boolean;
                ageMs?: number | undefined;
            }>>;
        }, "strip", import("zod").ZodTypeAny, {
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
        inputSchema: import("zod").ZodObject<{
            context7CompatibleLibraryID: import("zod").ZodString;
            topic: import("zod").ZodString;
            supplement: import("zod").ZodObject<{
                type: import("zod").ZodLiteral<"context">;
                ts: import("zod").ZodString;
                ttlSeconds: import("zod").ZodNumber;
                ordering: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodString, "many">>;
                body: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
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
        }, "strip", import("zod").ZodTypeAny, {
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
        outputSchema: import("zod").ZodObject<{
            merged: import("zod").ZodObject<{
                docs: import("zod").ZodString;
                supplement: import("zod").ZodObject<{
                    type: import("zod").ZodLiteral<"context">;
                    ts: import("zod").ZodString;
                    ttlSeconds: import("zod").ZodNumber;
                    ordering: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodString, "many">>;
                    body: import("zod").ZodString;
                }, "strip", import("zod").ZodTypeAny, {
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
            }, "strip", import("zod").ZodTypeAny, {
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
        }, "strip", import("zod").ZodTypeAny, {
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
    "resolve-library-id": {
        inputSchema: import("zod").ZodObject<{
            libraryName: import("zod").ZodString;
        }, "strip", import("zod").ZodTypeAny, {
            libraryName: string;
        }, {
            libraryName: string;
        }>;
        outputSchema: import("zod").ZodObject<{
            id: import("zod").ZodString;
            name: import("zod").ZodString;
            source: import("zod").ZodOptional<import("zod").ZodEnum<["official", "mirror", "community"]>>;
        }, "strip", import("zod").ZodTypeAny, {
            name: string;
            id: string;
            source?: "official" | "mirror" | "community" | undefined;
        }, {
            name: string;
            id: string;
            source?: "official" | "mirror" | "community" | undefined;
        }>;
    };
    "get-library-docs": {
        inputSchema: import("zod").ZodObject<{
            context7CompatibleLibraryID: import("zod").ZodString;
            topic: import("zod").ZodString;
            tokens: import("zod").ZodDefault<import("zod").ZodNumber>;
        }, "strip", import("zod").ZodTypeAny, {
            context7CompatibleLibraryID: string;
            topic: string;
            tokens: number;
        }, {
            context7CompatibleLibraryID: string;
            topic: string;
            tokens?: number | undefined;
        }>;
        outputSchema: import("zod").ZodObject<{
            docs: import("zod").ZodString;
            meta: import("zod").ZodObject<{
                libraryID: import("zod").ZodString;
                topic: import("zod").ZodString;
                version: import("zod").ZodOptional<import("zod").ZodString>;
                sourceURL: import("zod").ZodOptional<import("zod").ZodString>;
            }, "strip", import("zod").ZodTypeAny, {
                topic: string;
                libraryID: string;
                version?: string | undefined;
                sourceURL?: string | undefined;
            }, {
                topic: string;
                libraryID: string;
                version?: string | undefined;
                sourceURL?: string | undefined;
            }>;
        }, "strip", import("zod").ZodTypeAny, {
            docs: string;
            meta: {
                topic: string;
                libraryID: string;
                version?: string | undefined;
                sourceURL?: string | undefined;
            };
        }, {
            docs: string;
            meta: {
                topic: string;
                libraryID: string;
                version?: string | undefined;
                sourceURL?: string | undefined;
            };
        }>;
    };
};
//# sourceMappingURL=index.d.ts.map