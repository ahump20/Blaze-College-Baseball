// context7-enhanced/src/tools/docs.ts
import { z } from "zod";
export const ResolveLibraryIdInput = z.object({
    libraryName: z.string().min(2)
});
export const ResolveLibraryIdOutput = z.object({
    id: z.string(), // e.g., "/mrdoob/three.js"
    name: z.string(),
    source: z.enum(["official", "mirror", "community"]).optional()
});
export const GetLibraryDocsInput = z.object({
    context7CompatibleLibraryID: z.string().min(2),
    topic: z.string().min(2),
    tokens: z.number().int().min(500).max(5000).default(3000)
});
export const GetLibraryDocsOutput = z.object({
    docs: z.string(), // authoritative snippet (deterministic)
    meta: z.object({
        libraryID: z.string(),
        topic: z.string(),
        version: z.string().optional(), // resolved if known
        sourceURL: z.string().url().optional()
    })
});
// Tool descriptors (for MCP server registration)
export const tools = {
    "resolve-library-id": {
        inputSchema: ResolveLibraryIdInput,
        outputSchema: ResolveLibraryIdOutput
    },
    "get-library-docs": {
        inputSchema: GetLibraryDocsInput,
        outputSchema: GetLibraryDocsOutput
    }
};
//# sourceMappingURL=docs.js.map