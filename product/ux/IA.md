# Information Architecture — Diamond Insights

## Purpose
Define the new site structure for college baseball-focused Diamond Insights platform.

## Core Routes

### Public Routes
- `/` — Home / Landing
- `/baseball/ncaab` — D1 Baseball Hub (primary entry)
- `/baseball/ncaab/games` — Schedule / Today's Games
- `/baseball/ncaab/games/live` — Live Games
- `/baseball/ncaab/games/scores` — Scores
- `/baseball/ncaab/games/[gameId]` — Game Center (live/final)
- `/baseball/ncaab/teams` — Team Directory
- `/baseball/ncaab/teams/[teamSlug]` — Team Overview
- `/baseball/ncaab/teams/[teamSlug]/schedule` — Team Schedule
- `/baseball/ncaab/teams/[teamSlug]/roster` — Team Roster
- `/baseball/ncaab/teams/[teamSlug]/stats` — Team Stats
- `/baseball/ncaab/teams/[teamSlug]/news` — Team News
- `/baseball/ncaab/players/[playerId]` — Player Profile
- `/baseball/ncaab/conferences` — Conference List
- `/baseball/ncaab/conferences/[conferenceSlug]` — Conference Overview
- `/baseball/ncaab/standings` — Standings
- `/baseball/ncaab/rankings` — Top 25 Rankings
- `/baseball/ncaab/news` — Auto-generated Previews/Recaps

### Account Routes (Auth Required)
- `/account` — Account Overview
- `/account/favorites` — Favorite Teams
- `/account/notifications` — Notification Settings
- `/account/subscription` — Subscription Management
- `/login` — Sign In
- `/signup` — Sign Up

### API Routes
- `/api/v1/games` — List games
- `/api/v1/games/[id]` — Game details
- `/api/v1/teams` — List teams
- `/api/v1/teams/[slug]` — Team details
- `/api/v1/players/[id]` — Player details
- `/api/v1/conferences/[slug]/standings` — Conference standings
- `/api/v1/rankings` — Rankings data
- `/api/stripe/webhook` — Stripe webhook handler

## Design Principles
- **Mobile-first**: All views optimized for 390×844 viewport
- **Performance**: LCP ≤ 2.5s, CLS < 0.1
- **Accessibility**: WCAG 2.2 AA compliance
- **Progressive Enhancement**: Core content works without JS

## Navigation Hierarchy
```
Home
└── D1 Baseball Hub
    ├── Games
    │   ├── Live
    │   ├── Scores
    │   └── [Game Center]
    ├── Teams
    │   └── [Team Hub]
    │       ├── Schedule
    │       ├── Roster
    │       ├── Stats
    │       └── News
    ├── Players
    │   └── [Player Profile]
    ├── Conferences
    │   └── [Conference Page]
    ├── Standings
    ├── Rankings
    └── News
```
