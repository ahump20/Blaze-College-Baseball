#!/bin/bash
# scripts/verify-pivot.sh
# Verify Diamond Insights pivot scaffold is complete

set -e

echo "🔍 Verifying Diamond Insights Pivot Implementation..."
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

failed=0

check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✅${NC} $1"
  else
    echo -e "${RED}❌${NC} $1 (MISSING)"
    failed=$((failed + 1))
  fi
}

check_dir() {
  if [ -d "$1" ]; then
    echo -e "${GREEN}✅${NC} $1/"
  else
    echo -e "${RED}❌${NC} $1/ (MISSING)"
    failed=$((failed + 1))
  fi
}

echo "📋 Phase 0: Archive & Documentation"
check_file "MIGRATION_LOG.md"
check_dir "archive/designs"
check_dir "archive/code"
check_dir "archive/config"
check_file "scripts/route-map.ts"
check_file "scripts/screenshots.ts"
check_file "scripts/check-301-consistency.sh"
check_file "scripts/check-404s.sh"
check_file "scripts/slo-smoke.sh"
echo ""

echo "📋 Phase 1: New IA & Structure"
check_file "product/ux/IA.md"
check_file "product/ux/RedirectMap.csv"
check_file ".lighthouserc.json"
check_dir "packages/ui"
echo ""

echo "📋 Phase 2: Data & API Foundations"
check_file "prisma/schema.prisma"
check_file "apps/web/lib/db.ts"
check_file "apps/web/app/api/v1/games/route.ts"
check_file "apps/web/app/api/v1/teams/route.ts"
echo ""

echo "📋 Phase 3: Diamond Insights MVP Routes"
check_file "apps/web/app/baseball/ncaab/page.tsx"
check_file "apps/web/app/baseball/ncaab/games/page.tsx"
check_file "apps/web/app/baseball/ncaab/games/[gameId]/page.tsx"
check_file "apps/web/app/baseball/ncaab/teams/page.tsx"
check_file "apps/web/app/baseball/ncaab/teams/[teamSlug]/page.tsx"
check_file "apps/web/app/baseball/ncaab/players/[playerId]/page.tsx"
check_file "apps/web/app/baseball/ncaab/standings/page.tsx"
check_file "apps/web/app/baseball/ncaab/rankings/page.tsx"
check_file "apps/web/app/baseball/ncaab/news/page.tsx"
check_file "apps/web/app/account/page.tsx"
check_file "apps/web/app/login/page.tsx"
check_file "apps/web/app/signup/page.tsx"
echo ""

echo "📋 Phase 4: Monetization & Integration"
check_file "apps/web/app/api/stripe/webhook/route.ts"
check_file "apps/web/app/_components/Paywall.tsx"
echo ""

echo "📋 Phase 5: Workers & Ingest"
check_file "workers/data-sync/wrangler.toml"
check_file "workers/data-sync/src/index.ts"
echo ""

echo "📋 Phase 6: Design System & QA"
check_file "packages/ui/tokens.ts"
check_file "apps/web/middleware.ts"
check_file ".gitignore"
echo ""

echo "📋 Documentation"
check_file "PIVOT-INSTRUCTIONS.md"
check_file "DIAMOND-INSIGHTS-IMPLEMENTATION.md"
check_file "product/README.md"
echo ""

if [ $failed -eq 0 ]; then
  echo -e "${GREEN}✅ All files present! Pivot scaffold complete.${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Install dependencies: npm install && cd apps/web && npm install"
  echo "2. Configure .env with DATABASE_URL"
  echo "3. Run: npx prisma generate && npx prisma migrate dev"
  echo "4. Start dev server: cd apps/web && npm run dev"
  exit 0
else
  echo -e "${RED}❌ $failed files/directories missing${NC}"
  exit 1
fi
