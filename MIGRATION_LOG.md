# MIGRATION_LOG

## Purpose
- Document archival, decommissioning, and salvage actions tied to the BlazeSportsIntel pivot so teams have a single source of truth during the migration effort.
- Provide forward-looking traceability so any change to legacy assets or reclaimed components can be evaluated for compliance with the Diamond Insights architecture.

## Definitions
- **Archive** – Relocating assets out of the active code path into `BSI-archive/` (or other cold storage) while preserving them for historical reference.
- **Decommission** – Permanently removing legacy code, configs, or infrastructure artifacts that no longer align with the mobile-first college baseball platform.
- **Salvage** – Consolidating or refactoring reusable components so they fit the modern stack (Next.js 15, React 19, Tailwind) without dragging along legacy debt.

## Entries
| Date | Category | Summary | Assets / Notes | Source |
| --- | --- | --- | --- | --- |
| 2025-10-13 | Security | Rotated the live SportsDataIO Pages secret after removing the hard-coded key from deployment docs; invalidated previous key (`…df33`) in Cloudflare and synced the replacement via `API_KEYS_MASTER.js` + `npm run mcp:sync`. | Cloudflare Pages secret `SPORTSDATA_API_KEY`; `API_KEYS_MASTER.js` | Cloudflare Pages audit log 2025-10-13 |
| 2025-10-13 | Archive | Confirmed that legacy demos, redundant deploy scripts, and old configs were relocated into the structured `BSI-archive/` tree to keep the active workspace clean for the pivot. | 14 demo HTML files → `BSI-archive/demo-visualizations/`; 5 deploy scripts → `BSI-archive/deprecated-deploys/`; 4 configs → `BSI-archive/old-configs/`. | BLAZE-REALITY-ENFORCER-REPORT.md (lines 524-543) |
| 2025-09-30 | Decommission | Removed conflicting NCAA API handlers and repaired season extraction logic to stop 1970 data bleed-through in current integrations. | Deleted `functions/api/ncaa.js` and `functions/api/sports-data-real-ncaa.js`; updated `functions/api/ncaa/teams.js` season handling. | BLAZE-REALITY-ENFORCER-REPORT.md (lines 524-530) |
| 2025-09-30 | Salvage | Established the single `deploy.sh` script and codified the blaze-reality-enforcer agent so future deployments follow one hardened path instead of divergent scripts. | `deploy.sh` retained as canonical deployment script; auxiliary agent configuration stored under `~/.claude/agents/`. | BLAZE-REALITY-ENFORCER-ACTIVATED.md (lines 5-10) |

| 2025-10-13 | Decommission | Removed the Vite/React 18 SPA shell in favor of a Next.js 15 App Router foundation with Tailwind tokens. | Deleted `src/`, `vite.config.js`, legacy CSS, and replaced npm scripts with Next equivalents. | BlazeSportsIntel engineering pivot Phase 1 |
| 2025-10-13 | Salvage | Rebuilt the live scoreboard, box score, and standings experiences as TypeScript App Router routes with shared mobile layout and dark-mode Tailwind styling. | New files under `app/baseball/ncaab/*`, `styles/theme.ts`, Tailwind config. | BlazeSportsIntel engineering pivot Phase 1 |
