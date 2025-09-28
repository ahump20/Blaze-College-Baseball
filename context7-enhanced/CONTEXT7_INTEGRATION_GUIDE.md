# Context7 Integration Guide (Claude Code)

## Prerequisites
- Node.js 20+
- Jest configured for TypeScript (`ts-jest` or `esbuild-jest`)
- MCP server scaffold for Blaze Sports Intel

## Setup Steps
1. Copy `context7.json` to the repo root so Claude Code inherits Blaze guardrails.
2. Publish `/llms.txt` at the site root for public LLM guidance.
3. Import `mcpTools` from `context7-enhanced/src/index.ts` and register with your MCP server:
   ```ts
   import { mcpTools } from "./context7-enhanced/src";

   export const tools = {
     ...mcpTools
   };
   ```
4. Resolve and fetch docs before coding:
   ```ts
   const recharts = await mcpCall("resolve-library-id", { libraryName: "Recharts" });
   const rechartsDocs = await mcpCall("get-library-docs", {
     context7CompatibleLibraryID: recharts.id,
     topic: "ResponsiveContainer + LineChart + Tooltip",
     tokens: 2500
   });
   ```
5. Merge supplemental sports insights without polluting docs:
   ```ts
   const supplement = await mcpCall("sports-context", { sport: "baseball", timeframe: "live", maxTokens: 300 });
   await mcpCall("inject-sports-context", {
     context7CompatibleLibraryID: recharts.id,
     topic: "ResponsiveContainer + LineChart + Tooltip",
     supplement: supplement.supplement
   });
   ```
6. Gate cache controls behind `NODE_ENV !== "production"` and expose via audited endpoints only.

## Testing
Run the contract suite to ensure deterministic docs and bounded supplements:
```bash
npm test -- context7-enhanced/__tests__/contracts/context7.docs.spec.ts
```

## Deployment Notes
- Honor Blaze guardrails: America/Chicago time, sports order Baseball → Football → Basketball → Track & Field.
- Deploy via Cloudflare Pages with extensionless URLs; manage secrets via Cloudflare env vars.
- Pin library versions: Three.js r128, GSAP 3.12.2, Chart.js 4.4.0, React 18 UMD, Recharts UMD.
