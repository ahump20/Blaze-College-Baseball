# 🔥 Blaze Sports Intel - Comprehensive Upgrade Plan

## Executive Summary

**Objective**: Integrate best components from iCloud BlazeSportsIntel App with current production deployment while securing all API credentials.

**Current Status**:
- ✅ Production site deployed: https://blazesportsintel.com
- ✅ NCAA API working with 2025 season data
- ⚠️ **CRITICAL**: Exposed API keys in codebase
- ⚠️ Missing advanced features from iCloud app

**Target State**:
- 🎯 Next.js 14 app with React 18
- 🎯 All API keys in Cloudflare secrets
- 🎯 Advanced MLB Worker API with D1 database
- 🎯 Real-time WebSocket updates
- 🎯 Professional dashboard components

---

## Phase 1: Security Remediation (CRITICAL - Immediate)

### 1.1 Identify and Remove Exposed Keys

**Found in `/lib/api/real-sports-data-integration.ts` (lines 416-418)**:
```typescript
// ❌ EXPOSED KEYS - MUST REMOVE
sportsDataIOKey: '6ca2adb39404482da5406f0a6cd7aa37'
collegeFBDataKey: 'hm0Hj86TobTT+xJb4mSCIhuWd0+FuRH/+S/J8Ck04/MmocJxm/zqGXjOL4eutKk8'
theOddsAPIKey: '930b17cbb3925fd07d3e2f752ff0f9f6'
```

### 1.2 Action Items

**Immediate (within 1 hour)**:
1. Rotate ALL exposed API keys with providers
2. Update `real-sports-data-integration.ts` to ONLY use environment variables
3. Add API keys to Cloudflare Pages environment variables
4. Commit and deploy security fix

**Commands**:
```bash
# 1. Update real-sports-data-integration.ts
# Remove fallback hardcoded keys entirely

# 2. Add to Cloudflare Pages via wrangler
wrangler pages secret put SPORTSDATAIO_API_KEY
wrangler pages secret put CFBDATA_API_KEY
wrangler pages secret put THEODDS_API_KEY
wrangler pages secret put MLB_STATS_API_KEY

# 3. Verify no keys in codebase
grep -r "6ca2adb39404482da5406f0a6cd7aa37" . --exclude-dir=node_modules
grep -r "hm0Hj86TobTT" . --exclude-dir=node_modules
grep -r "930b17cbb3925fd07d3e2f752ff0f9f6" . --exclude-dir=node_modules
```

---

## Phase 2: Architecture Integration

### 2.1 Components to Integrate from iCloud

**From `bsi-app.tsx` (42,828 bytes)**:
- ✅ Next.js 14 app structure with app router
- ✅ Professional dashboard components
- ✅ React Query for data fetching
- ✅ Zustand for state management
- ✅ Framer Motion animations
- ✅ Recharts for visualizations

**From `mlb-worker-api.ts` (13,102 bytes)**:
- ✅ Advanced MLB Worker with D1 database
- ✅ KV caching layer
- ✅ Workers AI integration for analysis
- ✅ Monte Carlo simulations
- ✅ Pythagorean win calculations

**From `sync-sports-data.js` (19,093 bytes)**:
- ✅ Robust data sync service
- ✅ Rate limiting with exponential backoff
- ✅ Circuit breaker pattern
- ✅ PostgreSQL integration
- ✅ WebSocket support for live games

### 2.2 Current BSI Structure

```
BSI/
├── functions/api/        # Cloudflare Pages Functions
│   ├── ncaa/
│   │   ├── teams.js     # Working with 2025 season data ✅
│   │   └── standings.js
│   ├── mlb/
│   ├── nfl/
│   └── nba/
├── public/
│   └── index.html       # Simple HTML dashboard
└── lib/
    └── api/
        └── real-sports-data-integration.ts  # ⚠️ Has exposed keys
```

### 2.3 Target Architecture

```
BSI/
├── src/
│   ├── app/                    # Next.js 14 app directory
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Main dashboard
│   │   ├── baseball/
│   │   ├── football/
│   │   ├── basketball/
│   │   └── analytics/
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── live-data-panel.tsx
│   │   │   ├── command-center.tsx
│   │   │   ├── score-feed.tsx
│   │   │   ├── performance-heatmap.tsx
│   │   │   └── win-rate-analysis.tsx
│   │   ├── layout/
│   │   │   └── header.tsx
│   │   └── ui/
│   │       └── card.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── sports-data.ts        # Client-side API
│   │   │   └── adapters/              # Sport-specific adapters
│   │   └── utils.ts
│   └── stores/
│       └── app-store.ts               # Zustand state
├── functions/
│   ├── api/
│   │   ├── _utils.js                 # Keep existing
│   │   ├── ncaa/
│   │   │   └── teams.js              # Keep working version
│   │   ├── mlb/
│   │   │   ├── teams.js              # Upgrade with Worker API
│   │   │   ├── stats.js              # Add advanced stats
│   │   │   └── predictions.js        # Add Monte Carlo
│   │   ├── nfl/
│   │   └── nba/
│   └── workers/
│       ├── mlb-analytics.ts          # Advanced MLB Worker
│       └── sync-service.ts           # Data sync orchestrator
├── public/
│   ├── index.html                    # Keep as static fallback
│   └── assets/
├── wrangler.toml
├── next.config.js
├── package.json
└── deploy.sh
```

---

## Phase 3: Implementation Steps

### 3.1 Security Fix (Priority 1 - 1 hour)

```bash
# Step 1: Remove hardcoded keys
# Edit lib/api/real-sports-data-integration.ts
```

**Updated code**:
```typescript
export const realSportsDataClient = new RealSportsDataClient({
  sportsDataIOKey: process.env.SPORTSDATAIO_API_KEY!,
  collegeFBDataKey: process.env.CFBDATA_API_KEY!,
  theOddsAPIKey: process.env.THEODDS_API_KEY!,
});

// Add runtime validation
if (!process.env.SPORTSDATAIO_API_KEY) {
  throw new Error('SPORTSDATAIO_API_KEY environment variable is required');
}
```

```bash
# Step 2: Commit security fix immediately
git add lib/api/real-sports-data-integration.ts
git commit -m "🔒 SECURITY: Remove exposed API keys, require env vars

BREAKING CHANGE: API keys must now be set via environment variables

- Removed hardcoded SPORTSDATAIO_API_KEY
- Removed hardcoded CFBDATA_API_KEY
- Removed hardcoded THEODDS_API_KEY
- Added runtime validation for required keys
- Keys must be set via Cloudflare Pages environment variables

Action Required:
Run: wrangler pages secret put SPORTSDATAIO_API_KEY
     wrangler pages secret put CFBDATA_API_KEY
     wrangler pages secret put THEODDS_API_KEY"

# Step 3: Rotate keys with providers before deploying
# (Manual step - visit each provider dashboard)

# Step 4: Add secrets to Cloudflare
wrangler pages secret put SPORTSDATAIO_API_KEY --project-name blazesportsintel
# (Enter new rotated key when prompted)

wrangler pages secret put CFBDATA_API_KEY --project-name blazesportsintel
wrangler pages secret put THEODDS_API_KEY --project-name blazesportsintel

# Step 5: Deploy security fix
./deploy.sh
```

### 3.2 Next.js Integration (Priority 2 - 4 hours)

```bash
# Step 1: Copy Next.js structure from iCloud
cp -r "/Users/AustinHumphrey/Library/Mobile Documents/com~apple~CloudDocs/BlazeSportsIntel App/bsi-unified-app/src" ./

# Step 2: Install dependencies
npm install next@14.2.3 react@18.3.1 react-dom@18.3.1
npm install @tanstack/react-query@5.32.0 zustand@4.5.2
npm install framer-motion@11.1.7 recharts@2.12.7
npm install date-fns@3.6.0 date-fns-tz@3.1.3
npm install zod@3.23.8 react-hot-toast@2.4.1

# Step 3: Copy config files
cp "/Users/AustinHumphrey/Library/Mobile Documents/com~apple~CloudDocs/BlazeSportsIntel App/bsi-app.tsx" ./
# Extract package.json, next.config.js, tailwind.config.ts, tsconfig.json

# Step 4: Update wrangler.toml for Pages + Functions hybrid
```

**Updated `wrangler.toml`**:
```toml
name = "blazesportsintel"
compatibility_date = "2025-01-01"
pages_build_output_dir = "out"

[site]
bucket = "./out"

# KV for caching
[[kv_namespaces]]
binding = "SPORTS_CACHE"
id = "YOUR_KV_ID"

# D1 for historical data
[[d1_databases]]
binding = "BSI_DB"
database_name = "bsi-sports"
database_id = "YOUR_D1_ID"

# R2 for large datasets
[[r2_buckets]]
binding = "BSI_R2"
bucket_name = "blaze-sports-data"

# Environment variables (non-secret)
[vars]
ENVIRONMENT = "production"
NEXT_PUBLIC_API_URL = "https://blazesportsintel.com/api"

# Production secrets (set via wrangler)
# SPORTSDATAIO_API_KEY - set via: wrangler pages secret put
# CFBDATA_API_KEY - set via: wrangler pages secret put
# THEODDS_API_KEY - set via: wrangler pages secret put
# MLB_STATS_API_KEY - set via: wrangler pages secret put
```

### 3.3 Advanced MLB Worker (Priority 3 - 2 hours)

```bash
# Step 1: Create MLB Worker
mkdir -p functions/workers
cp "/Users/AustinHumphrey/Library/Mobile Documents/com~apple~CloudDocs/BlazeSportsIntel App/mlb-worker-api.ts" functions/workers/

# Step 2: Update import paths
# Change: export interface Env
# To use Cloudflare bindings already in wrangler.toml

# Step 3: Create D1 database schema
wrangler d1 create bsi-sports
wrangler d1 execute bsi-sports --file=schema.sql
```

**Create `schema.sql`**:
```sql
-- MLB Teams
CREATE TABLE IF NOT EXISTS teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  runs_scored INTEGER DEFAULT 0,
  runs_allowed INTEGER DEFAULT 0,
  home_runs INTEGER DEFAULT 0,
  stolen_bases INTEGER DEFAULT 0,
  batting_avg REAL DEFAULT 0.0,
  era REAL DEFAULT 0.0,
  woba REAL DEFAULT 0.0,
  wrc_plus INTEGER DEFAULT 100,
  fip REAL DEFAULT 0.0,
  babip REAL DEFAULT 0.0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Team Batting Stats
CREATE TABLE IF NOT EXISTS team_batting (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_code TEXT NOT NULL,
  season INTEGER NOT NULL,
  games INTEGER,
  at_bats INTEGER,
  hits INTEGER,
  doubles INTEGER,
  triples INTEGER,
  home_runs INTEGER,
  rbi INTEGER,
  walks INTEGER,
  strikeouts INTEGER,
  stolen_bases INTEGER,
  batting_avg REAL,
  obp REAL,
  slg REAL,
  ops REAL,
  woba REAL,
  wrc_plus INTEGER,
  FOREIGN KEY (team_code) REFERENCES teams(team_code)
);

-- Team Pitching Stats
CREATE TABLE IF NOT EXISTS team_pitching (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_code TEXT NOT NULL,
  season INTEGER NOT NULL,
  games INTEGER,
  innings_pitched REAL,
  hits_allowed INTEGER,
  runs_allowed INTEGER,
  earned_runs INTEGER,
  home_runs_allowed INTEGER,
  walks_allowed INTEGER,
  strikeouts INTEGER,
  era REAL,
  whip REAL,
  fip REAL,
  babip REAL,
  FOREIGN KEY (team_code) REFERENCES teams(team_code)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_teams_code ON teams(team_code);
CREATE INDEX IF NOT EXISTS idx_batting_team ON team_batting(team_code, season);
CREATE INDEX IF NOT EXISTS idx_pitching_team ON team_pitching(team_code, season);
```

### 3.4 Data Sync Service (Priority 4 - 3 hours)

```bash
# Step 1: Setup sync service
mkdir -p workers/sync
cp "/Users/AustinHumphrey/Library/Mobile Documents/com~apple~CloudDocs/BlazeSportsIntel App/sync-sports-data.js" workers/sync/

# Step 2: Convert to TypeScript and adapt for Cloudflare
# - Replace pg with D1 database
# - Replace node-fetch with native fetch
# - Use Cloudflare Cron Triggers instead of setInterval

# Step 3: Add to wrangler.toml
```

**Updated `wrangler.toml` (add cron triggers)**:
```toml
[triggers]
crons = [
  "*/30 * * * *",  # Every 30 seconds for live games (handled in code)
  "*/5 * * * *",   # Every 5 minutes for scores
  "0 * * * *",     # Every hour for standings
  "0 */6 * * *"    # Every 6 hours for rosters
]
```

---

## Phase 4: Testing & Validation

### 4.1 Local Testing

```bash
# Test Next.js app locally
npm run dev
# Visit: http://localhost:3000

# Test API endpoints
npm run dev &
curl http://localhost:3000/api/ncaa/teams?teamId=251
curl http://localhost:3000/api/mlb/teams/STL
curl http://localhost:3000/api/mlb/teams/STL/stats

# Test with wrangler
wrangler pages dev out --port 8788
```

### 4.2 Security Validation

```bash
# Verify no exposed keys in codebase
./scripts/check-exposed-keys.sh

# Check git history (should be clean after rotation)
git log --all --full-history -- "*api*key*"

# Verify environment variables are set
wrangler pages secret list --project-name blazesportsintel
```

**Create `scripts/check-exposed-keys.sh`**:
```bash
#!/bin/bash
set -euo pipefail

echo "🔍 Scanning for exposed API keys..."

# Common API key patterns
PATTERNS=(
  "[a-zA-Z0-9]{32}"           # 32-char hex keys
  "[A-Z0-9]{20,}"             # Long uppercase alphanumeric
  "Bearer [a-zA-Z0-9_\-]+"    # Bearer tokens
  "sk_[a-zA-Z0-9]+"           # Stripe-style keys
)

VIOLATIONS=0

for pattern in "${PATTERNS[@]}"; do
  if grep -rE "$pattern" lib/ src/ functions/ --exclude-dir=node_modules --exclude="*.md" 2>/dev/null; then
    echo "❌ Found potential key matching pattern: $pattern"
    VIOLATIONS=$((VIOLATIONS + 1))
  fi
done

if [ $VIOLATIONS -eq 0 ]; then
  echo "✅ No exposed API keys found"
  exit 0
else
  echo "❌ Found $VIOLATIONS potential key exposures"
  exit 1
fi
```

### 4.3 Functional Testing

**Test checklist**:
- [ ] NCAA API returns 2025 season data
- [ ] MLB API returns Cardinals data
- [ ] Advanced stats calculations work
- [ ] Monte Carlo simulations execute
- [ ] Live scores update every 30 seconds
- [ ] Standings refresh every 5 minutes
- [ ] All API endpoints return valid JSON
- [ ] Error handling works (try invalid team IDs)
- [ ] Cache headers are correct
- [ ] CORS headers allow frontend access

---

## Phase 5: Deployment

### 5.1 Pre-Deployment Checklist

- [ ] All API keys rotated and added to Cloudflare secrets
- [ ] No hardcoded keys in codebase
- [ ] D1 database schema created
- [ ] KV namespace created
- [ ] R2 bucket created
- [ ] Tests passing locally
- [ ] Security scan clean
- [ ] Git history reviewed

### 5.2 Deployment Commands

```bash
# Build Next.js app
npm run build

# Deploy to Cloudflare Pages
npm run deploy

# Verify deployment
curl https://blazesportsintel.com/api/health
curl https://blazesportsintel.com/api/ncaa/teams?teamId=251

# Check production logs
wrangler pages deployment tail --project-name blazesportsintel
```

### 5.3 Post-Deployment Validation

```bash
# Run production smoke tests
./scripts/production-tests.sh
```

**Create `scripts/production-tests.sh`**:
```bash
#!/bin/bash
set -euo pipefail

BASE_URL="https://blazesportsintel.com"

echo "🧪 Running production smoke tests..."

# Test 1: Health check
echo "1️⃣ Health check..."
HEALTH=$(curl -s "$BASE_URL/api/health" | jq -r '.status')
if [ "$HEALTH" != "healthy" ]; then
  echo "❌ Health check failed"
  exit 1
fi
echo "✅ Health check passed"

# Test 2: NCAA season data
echo "2️⃣ NCAA season check..."
SEASON=$(curl -s "$BASE_URL/api/ncaa/teams?teamId=251" | jq -r '.meta.season')
if [ "$SEASON" != "2025" ]; then
  echo "❌ NCAA season incorrect: $SEASON"
  exit 1
fi
echo "✅ NCAA season correct: 2025"

# Test 3: MLB Cardinals data
echo "3️⃣ MLB Cardinals check..."
CARDINALS=$(curl -s "$BASE_URL/api/mlb/138" | jq -r '.team.name')
if [ -z "$CARDINALS" ] || [ "$CARDINALS" == "null" ]; then
  echo "❌ Cardinals data not found"
  exit 1
fi
echo "✅ Cardinals data found: $CARDINALS"

# Test 4: Dashboard loads
echo "4️⃣ Dashboard load check..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/")
if [ "$STATUS" != "200" ]; then
  echo "❌ Dashboard returned status: $STATUS"
  exit 1
fi
echo "✅ Dashboard loads successfully"

echo ""
echo "✅ All production tests passed!"
```

---

## Phase 6: Monitoring & Maintenance

### 6.1 Monitoring Setup

**Key Metrics to Track**:
- API response times (target: p95 < 500ms)
- Error rates (target: < 1%)
- Cache hit rates (target: > 80%)
- Data freshness (live games: < 60s, standings: < 5min)

**Cloudflare Analytics**:
```bash
# View analytics
wrangler pages deployment list --project-name blazesportsintel

# Monitor errors
wrangler pages deployment tail --project-name blazesportsintel --format=json | jq 'select(.level == "error")'
```

### 6.2 Maintenance Schedule

**Daily**:
- Check error logs
- Verify live data updates
- Monitor API rate limits

**Weekly**:
- Review API usage and costs
- Update standings data if stale
- Test backup/restore procedures

**Monthly**:
- Rotate API keys
- Update dependencies
- Performance optimization review

---

## Timeline

### Sprint 1: Security (Day 1 - CRITICAL)
- **Hour 1-2**: Remove exposed keys, rotate with providers
- **Hour 2-3**: Add secrets to Cloudflare, deploy fix
- **Hour 3-4**: Verify security scan clean, test production

### Sprint 2: Next.js Integration (Days 2-3)
- **Day 2**: Setup Next.js structure, install dependencies
- **Day 3**: Integrate dashboard components, test locally

### Sprint 3: Advanced Features (Days 4-5)
- **Day 4**: MLB Worker API with D1 database
- **Day 5**: Data sync service with cron triggers

### Sprint 4: Testing & Launch (Days 6-7)
- **Day 6**: Comprehensive testing, bug fixes
- **Day 7**: Production deployment, monitoring setup

---

## Success Criteria

### Security
- ✅ No hardcoded API keys in codebase
- ✅ All keys in Cloudflare secrets
- ✅ Security scan passes
- ✅ Git history reviewed and clean

### Performance
- ✅ Page load < 2 seconds
- ✅ API response p95 < 500ms
- ✅ Lighthouse score > 90
- ✅ Cache hit rate > 80%

### Functionality
- ✅ NCAA API returns 2025 season data
- ✅ MLB advanced stats working
- ✅ Live scores update every 30s
- ✅ Standings refresh every 5min
- ✅ Monte Carlo simulations execute
- ✅ All dashboard components render

### User Experience
- ✅ Professional dashboard design
- ✅ Real-time data updates
- ✅ Smooth animations
- ✅ Mobile responsive
- ✅ Accessible (WCAG AA)

---

## Rollback Plan

If deployment fails or issues arise:

```bash
# Rollback to previous deployment
wrangler pages deployment list --project-name blazesportsintel
wrangler pages deployment rollback [DEPLOYMENT_ID]

# Restore API keys (if rotation caused issues)
wrangler pages secret put SPORTSDATAIO_API_KEY  # Use old key
wrangler pages secret put CFBDATA_API_KEY
wrangler pages secret put THEODDS_API_KEY

# Revert code changes
git revert HEAD
git push origin main
./deploy.sh
```

---

## Cost Estimates

### Cloudflare Pages (Free tier includes):
- ✅ Unlimited requests
- ✅ Unlimited bandwidth
- ✅ 500 builds/month
- ✅ 100 custom domains

### Cloudflare Workers ($5/month):
- ✅ 10M requests/month
- ✅ KV: 100K reads, 1K writes/day
- ✅ D1: 5M rows read, 100K rows written/day
- ✅ R2: 10GB storage, 1M Class A operations

### API Costs:
- SportsDataIO: $0-$49/month (depends on tier)
- CollegeFootballData: Free
- TheOdds API: $0-$29/month

**Total Estimated Monthly Cost**: $5-$83/month

---

## Next Phase (Future Enhancements)

### Phase 7: Authentication
- User accounts with Auth0 or Clerk
- Personalized dashboards
- Saved favorite teams
- Custom alerts

### Phase 8: Mobile App
- React Native app
- Push notifications
- Offline mode
- Biometric login

### Phase 9: Advanced Analytics
- Machine learning predictions
- Player tracking
- Game simulations
- Statistical modeling

### Phase 10: Monetization
- Premium subscriptions
- API access for developers
- White-label solutions
- Partnership integrations

---

**Generated**: 2025-09-30T00:30:00-05:00
**Version**: 1.0.0
**Status**: Ready for Implementation
**Priority**: CRITICAL (Phase 1 - Security)