# Context7 Enhanced Toolkit for Blaze Sports Intel

This package wires Blaze Sports Intel's Claude Code workflows to Context7 with deterministic documentation, bounded sports context, and cache controls.

## Contents
- `src/tools/docs.ts` – Zod-typed wrappers for `resolve-library-id` and `get-library-docs`.
- `src/tools/sportsContext.ts` – Supplemental baseball/football/basketball/track context with merge helper.
- `src/tools/cache.ts` – Cache inspection and invalidation helpers (gate behind `NODE_ENV !== "production"`).
- `src/index.ts` – Aggregated `mcpTools` export for your MCP server.
- `__tests__/contracts/context7.docs.spec.ts` – Contracts to enforce deterministic docs and bounded supplements.

## Usage
1. Import `mcpTools` into your MCP server bootstrap and register the tools with Claude Code.
2. Always call `resolve-library-id` then `get-library-docs` before referencing a library.
3. Inject live context with `sports-context` → `inject-sports-context` only after fetching official docs.
4. Keep cache tooling disabled in production unless routed through audited endpoints.

Run the Jest contract tests before each release:
```bash
npm test -- context7-enhanced/__tests__/contracts/context7.docs.spec.ts
```
