# BlazeSportsIntel Information Architecture

BlazeSportsIntel is pivoting to a mobile-first, data-driven, dark-mode platform for NCAA Division I baseball coverage. This document seeds the canonical sitemap for Phase 0 archival checks and Phase 1 foundation work. Use it as the single source of truth when running `scripts/route-map.ts`.

## Route Tree Overview

The tree below captures every critical user-facing route required for the MVP foundation. Indentation conveys hierarchy (two spaces per level).

- /baseball/ncaab — Home
  - /baseball/ncaab/scoreboard — Live Scoreboard
  - /baseball/ncaab/games — Game Index
    - /baseball/ncaab/games/[gameId] — Game Detail
  - /baseball/ncaab/teams — Team Directory
    - /baseball/ncaab/teams/[teamSlug] — Team Hub
      - /baseball/ncaab/teams/[teamSlug]/players/[playerSlug] — Player Detail (team context)
  - /baseball/ncaab/players — Player Directory
    - /baseball/ncaab/players/[playerSlug] — Player Detail
  - /baseball/ncaab/standings — Conference Standings
  - /baseball/ncaab/rankings — Top 25 & RPI Rankings
  - /baseball/ncaab/news — News & Insights
    - /baseball/ncaab/news/[articleSlug] — Article Detail

## Navigation Matrix

| Route | Purpose | Primary Navigation | Mobile Entry Point |
| --- | --- | --- | --- |
| `/baseball/ncaab` | Personalized landing with Top 25 slate, hero story, and key analytics cards. | Bottom nav “Home” + top logo. | First screen after splash. |
| `/baseball/ncaab/scoreboard` | Live, filterable slate with game status, scores, and quick stats. | Bottom nav “Scores”. | Shortcut tile on home hero. |
| `/baseball/ncaab/games/[gameId]` | Live game center with tabs for Box Score, Plays, Team Stats. | Deep link from scoreboard, notifications. | Live alerts and schedule cards. |
| `/baseball/ncaab/teams/[teamSlug]` | Comprehensive team hub featuring trends, roster, schedule. | Bottom nav “Teams” + search. | Team search results and share links. |
| `/baseball/ncaab/players/[playerSlug]` | Player scouting card, trends, and Diamond Pro insights. | Search + team roster drill-down. | Player spotlight modules. |
| `/baseball/ncaab/standings` | Real-time conference standings with sort/filter. | Bottom nav “Standings”. | Standings widget on home. |
| `/baseball/ncaab/rankings` | Polls, RPI, power index, postseason odds. | Home hero CTA + nav overflow. | Rankings CTA on scoreboard. |
| `/baseball/ncaab/news` | Editorial hub for recaps, features, portal updates. | Bottom nav “News”. | Home story carousel. |

## System Notes

- **URL Strategy:** All primary destinations live under `/baseball/ncaab` to preserve flexibility for future sports. Dynamic segments use slug identifiers so that archives remain stable.
- **Redirects:** Legacy domains, `/scoreboard`, `/teams/*`, `/players/*`, and `/news/*` must issue 301s to their new equivalents. Refer to `product/ux/RedirectMap.csv` and validate with `scripts/check-301-consistency.sh`.
- **Spec Coverage:** Each critical route maintains a dedicated MDX spec in `product/ux/specs`. `scripts/route-map.ts --check` confirms coverage.
- **Archive Workflow:** Phase 0 requires screenshots of the legacy experience stored under `backups/`. `scripts/screenshots.ts` reports missing captures per route.
- **Future Expansion:** Keep utility routes sport-agnostic. Additional sports will branch from `/baseball/*` peers once baseball MVP is stable.

