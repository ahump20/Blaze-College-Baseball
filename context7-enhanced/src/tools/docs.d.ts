import { z } from "zod";
export declare const ResolveLibraryIdInput: z.ZodObject<{
    libraryName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    libraryName: string;
}, {
    libraryName: string;
}>;
export declare const ResolveLibraryIdOutput: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    source: z.ZodOptional<z.ZodEnum<["official", "mirror", "community"]>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    source?: "official" | "mirror" | "community" | undefined;
}, {
    name: string;
    id: string;
    source?: "official" | "mirror" | "community" | undefined;
}>;
export declare const GetLibraryDocsInput: z.ZodObject<{
    context7CompatibleLibraryID: z.ZodString;
    topic: z.ZodString;
    tokens: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    context7CompatibleLibraryID: string;
    topic: string;
    tokens: number;
}, {
    context7CompatibleLibraryID: string;
    topic: string;
    tokens?: number | undefined;
}>;
export declare const GetLibraryDocsOutput: z.ZodObject<{
    docs: z.ZodString;
    meta: z.ZodObject<{
        libraryID: z.ZodString;
        topic: z.ZodString;
        version: z.ZodOptional<z.ZodString>;
        sourceURL: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
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
}, "strip", z.ZodTypeAny, {
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
export declare const tools: {
    "resolve-library-id": {
        inputSchema: z.ZodObject<{
            libraryName: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            libraryName: string;
        }, {
            libraryName: string;
        }>;
        outputSchema: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            source: z.ZodOptional<z.ZodEnum<["official", "mirror", "community"]>>;
        }, "strip", z.ZodTypeAny, {
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
        inputSchema: z.ZodObject<{
            context7CompatibleLibraryID: z.ZodString;
            topic: z.ZodString;
            tokens: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            context7CompatibleLibraryID: string;
            topic: string;
            tokens: number;
        }, {
            context7CompatibleLibraryID: string;
            topic: string;
            tokens?: number | undefined;
        }>;
        outputSchema: z.ZodObject<{
            docs: z.ZodString;
            meta: z.ZodObject<{
                libraryID: z.ZodString;
                topic: z.ZodString;
                version: z.ZodOptional<z.ZodString>;
                sourceURL: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
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
        }, "strip", z.ZodTypeAny, {
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
//# sourceMappingURL=docs.d.ts.map