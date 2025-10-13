# Diamond Insights Pivot — Next Steps

## Quick Start

This repository has been scaffolded with the Diamond Insights pivot structure. Here's how to proceed:

### 1. Install Dependencies

```bash
# Root dependencies
npm install

# Install Prisma CLI
npm install -D prisma @prisma/client

# Install in apps/web
cd apps/web
npm install
npm install @prisma/client
```

### 2. Set Up Database

```bash
# Copy .env.example to .env and configure DATABASE_URL
cp .env.example .env

# Generate Prisma Client
npx prisma generate

# Run migrations (when database is ready)
npx prisma migrate dev --name init
```

### 3. Development

```bash
# Start Next.js dev server
cd apps/web
npm run dev

# Open http://localhost:3000
```

### 4. Archive Legacy Site

```bash
# Generate route map
node scripts/route-map.ts

# Take screenshots (requires Playwright)
npm install -D playwright
npx playwright install chromium
node scripts/screenshots.ts

# Check redirect consistency
./scripts/check-301-consistency.sh
```

### 5. Deploy Workers (Optional)

```bash
cd workers/data-sync
npm install
npm run deploy
```

## What's Been Created

### Phase 0: Archive & Documentation
- ✅ `MIGRATION_LOG.md` — Track all changes
- ✅ `archive/` — Legacy site preservation structure
- ✅ Scripts for route mapping, screenshots, redirect checks

### Phase 1: New IA & Structure
- ✅ `product/ux/IA.md` — Complete information architecture
- ✅ `product/ux/RedirectMap.csv` — 301 redirect mapping
- ✅ `.lighthouserc.json` — Performance budgets

### Phase 2: Data & API Foundations
- ✅ `prisma/schema.prisma` — Complete database schema
- ✅ `apps/web/lib/db.ts` — Prisma client helper
- ✅ API routes: `/api/v1/games`, `/api/v1/teams`

### Phase 3: Diamond Insights MVP Routes
- ✅ `/baseball/ncaab` — Baseball hub
- ✅ Game, team, player, standings, rankings pages
- ✅ Account management routes
- ✅ Auth pages (login/signup stubs)

### Phase 4: Monetization
- ✅ Stripe webhook handler stub
- ✅ `Paywall` component for gating Pro features

### Phase 5: Workers
- ✅ Cloudflare Workers structure for data ingestion
- ✅ `wrangler.toml` with cron configuration

### Phase 6: Design System
- ✅ `packages/ui/tokens.ts` — Design tokens
- ✅ Redirect middleware for legacy URLs

## Next Actions

1. **Connect Database**: Set up PostgreSQL (Vercel Postgres, Supabase, or Neon)
2. **Data Ingestion**: Implement worker logic to fetch from sports data APIs
3. **Authentication**: Integrate Clerk or NextAuth for user management
4. **Stripe Integration**: Complete payment flow and subscription management
5. **Styling**: Apply design system tokens to components
6. **Testing**: Add E2E tests with Playwright

## Architecture Overview

```
blazesportsintel/
├── apps/
│   └── web/              # Next.js 15 App Router
│       ├── app/          # Routes and pages
│       │   ├── baseball/ncaab/
│       │   ├── account/
│       │   └── api/v1/
│       └── lib/          # Shared utilities
├── packages/
│   └── ui/               # Design system tokens
├── prisma/
│   └── schema.prisma     # Database schema
├── workers/
│   └── data-sync/        # Cloudflare Workers
├── product/
│   └── ux/               # UX specs and IA
├── archive/              # Legacy preservation
└── scripts/              # Automation tools
```

## Performance Targets

- **LCP**: ≤ 2.5s (mobile 4G)
- **CLS**: < 0.1
- **TBT**: ≤ 200ms
- **API p99**: ≤ 200ms
- **Lighthouse**: ≥ 90 (mobile)

## Support

- Documentation: `product/ux/IA.md`
- Migration Log: `MIGRATION_LOG.md`
- Scripts: `scripts/`

---

**Target Launch**: Feb 1, 2026 (Flexible based on data partnerships)
**Timezone**: America/Chicago for all crons and scheduling
