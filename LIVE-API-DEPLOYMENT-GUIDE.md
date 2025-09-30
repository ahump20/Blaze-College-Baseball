# 🔥 Blaze Sports Intel - Live API Deployment Guide

## Deployment Complete

**Production URL:** https://0652f7ab.blazesportsintel.pages.dev  
**GitHub Repo:** https://github.com/ahump20/BSI  
**Commit:** ce9b565 - Live Data Integration

---

## Live API Endpoints Implemented

### 1. NCAA Football Rankings
```bash
GET /api/live/ncaa/football?year=2025&week=1
```

**Response:**
```json
{
  "success": true,
  "sport": "ncaa-football",
  "season": "2025",
  "rankings": [
    {
      "rank": 1,
      "team": "Georgia",
      "school": "Georgia",
      "conference": "SEC",
      "record": "15-0",
      "wins": 15,
      "losses": 0,
      "winPct": 1.000,
      "rating": 95.5
    }
  ]
}
```

### 2. Live MLB Scores
```bash
GET /api/live/mlb/scores?date=2025-09-30
```

**Response:**
```json
{
  "success": true,
  "sport": "mlb",
  "date": "2025-09-30",
  "games": [
    {
      "id": "12345",
      "sport": "baseball",
      "homeTeam": {
        "name": "Cardinals",
        "score": 5,
        "logo": "https://cdn.sportsdata.io/mlb/logos/Cardinals.png"
      },
      "awayTeam": {
        "name": "Cubs",
        "score": 3
      },
      "status": "in_progress",
      "inning": "Inning 7"
    }
  ]
}
```

### 3. Live NFL Scores
```bash
GET /api/live/nfl/scores?season=2025&week=current
```

### 4. Live NBA Scores
```bash
GET /api/live/nba/scores?date=2025-09-30
```

### 5. All Sports Aggregated
```bash
GET /api/live/all/scores?date=2025-09-30
```

---

## API Keys Configuration

### Required Environment Variables

The following secrets need to be configured in Cloudflare Pages:

```bash
# Navigate to Cloudflare Dashboard
# Pages > blazesportsintel > Settings > Environment Variables

# Add these secrets:
SPORTSDATAIO_API_KEY = 6ca2adb39404482da5406f0a6cd7aa37
CFBDATA_API_KEY = hm0Hj86TobTT+xJb4mSCIhuWd0+FuRH/+S/J8Ck04/MmocJxm/zqGXjOL4eutKk8
THEODDS_API_KEY = 930b17cbb3925fd07d3e2f752ff0f9f6
```

### Setting Secrets via Wrangler CLI

```bash
# From /Users/AustinHumphrey/BSI directory:

wrangler pages secret put SPORTSDATAIO_API_KEY --project-name blazesportsintel
# Enter: 6ca2adb39404482da5406f0a6cd7aa37

wrangler pages secret put CFBDATA_API_KEY --project-name blazesportsintel
# Enter: hm0Hj86TobTT+xJb4mSCIhuWd0+FuRH/+S/J8Ck04/MmocJxm/zqGXjOL4eutKk8

wrangler pages secret put THEODDS_API_KEY --project-name blazesportsintel
# Enter: 930b17cbb3925fd07d3e2f752ff0f9f6
```

After adding secrets, redeploy:
```bash
wrangler pages deploy . --project-name blazesportsintel --branch main
```

---

## KV Namespace Setup (Optional but Recommended)

For caching to work optimally, create a KV namespace:

```bash
# Create KV namespace
wrangler kv:namespace create "SPORTS_CACHE" --preview=false

# Note the ID returned (e.g., abc123def456)
# Then bind it in Cloudflare Dashboard:
# Pages > blazesportsintel > Settings > Functions > KV Namespace Bindings
# Variable name: SPORTS_CACHE
# KV namespace: [select your namespace]
```

---

## API Rate Limits & Caching

### SportsDataIO
- **Free Tier**: 1,000 requests/month
- **Pro Tier**: 10,000 requests/month ($10/mo)
- **Rate Limit**: 1 request/second

### CollegeFootballData
- **Free**: Unlimited requests
- **Rate Limit**: 200 requests/hour
- **Requires**: Bearer token authentication

### Caching Strategy
- **Live Scores**: 30-second TTL
- **Rankings**: 5-minute TTL
- **Edge Cache**: Cloudflare CDN caching
- **KV Cache**: Distributed caching across regions

---

## Data Sources & Trust Levels

| Source | Sport | Trust Level | Update Frequency |
|--------|-------|-------------|------------------|
| CollegeFootballData API | NCAA Football | 0.95 (official) | Real-time |
| SportsDataIO | MLB, NFL, NBA | 0.9 (aggregator) | 30 seconds |
| ESPN API | All sports | 0.9 (aggregator) | 30 seconds |

---

## Technical Architecture

### Cloudflare Workers Functions
```
/functions/api/live/[[route]].ts
├── onRequest (main handler)
├── getNCAAFootball()
├── getMLBScores()
├── getNFLScores()
├── getNBAScores()
└── getAllScores()
```

### TypeScript Client Library
```
/lib/api/real-sports-data-integration.ts
└── RealSportsDataClient
    ├── getNCAAFootballRankings()
    ├── getLiveMLBScores()
    ├── getLiveNFLScores()
    ├── getLiveNBAScores()
    └── getNCAATeamsByConference()
```

### Caching Flow
```
Request → Cloudflare Edge Cache (30s-5min)
          ↓ (miss)
          KV Cache (distributed)
          ↓ (miss)
          External API (SportsDataIO/CFBD)
          ↓
          Store in KV → Return to Edge → Response
```

---

## Testing Endpoints

### Test NCAA Football Rankings
```bash
curl -s https://0652f7ab.blazesportsintel.pages.dev/api/live/ncaa/football | jq
```

### Test Live MLB Scores
```bash
curl -s https://0652f7ab.blazesportsintel.pages.dev/api/live/mlb/scores | jq
```

### Test All Sports
```bash
curl -s https://0652f7ab.blazesportsintel.pages.dev/api/live/all/scores | jq
```

---

## Error Handling

### Common Errors

#### 401 Unauthorized
```json
{"success": false, "error": "SportsDataIO API error: 401"}
```
**Fix:** Configure API keys as Cloudflare Pages secrets

#### 429 Rate Limit
```json
{"success": false, "error": "Rate limit exceeded"}
```
**Fix:** Implement longer cache TTL or upgrade API tier

#### 404 Not Found
```json
{"success": false, "error": "Invalid route"}
```
**Fix:** Check endpoint URL and available routes

---

## Next Steps

### Immediate Actions
1. **Configure Secrets**: Add API keys to Cloudflare Pages environment variables
2. **Create KV Namespace**: Set up distributed caching for optimal performance
3. **Test Endpoints**: Verify all live endpoints return real data

### Future Enhancements
1. **WebSocket Integration**: Real-time score updates via WebSockets
2. **High School Data**: Integrate MaxPreps API for Texas high school football
3. **Perfect Game**: Add youth baseball tournament data
4. **Athletic.net**: Track & field state championship results
5. **Historical Data**: Store game results in D1 database for analytics

---

## Monitoring & Observability

### Cloudflare Analytics
- Navigate to: Pages > blazesportsintel > Analytics
- Monitor: Request volume, error rates, cache hit ratio

### Key Metrics to Track
- **API Success Rate**: Target 99%+
- **Cache Hit Ratio**: Target 80%+
- **Response Time (p95)**: Target < 500ms
- **Error Rate**: Target < 1%

### Alert Thresholds
- API failures > 5%: Critical
- Cache hit < 60%: Warning
- Response time > 2s: Warning

---

## Deployment History

| Commit | Date | Description |
|--------|------|-------------|
| ce9b565 | 2025-09-30 | Live API integration with SportsDataIO & CFBD |
| 8fbf798 | 2025-09-29 | League-wide Deep South youth sports platform |
| c8b9504 | 2025-09-28 | Authentic Blaze platform with Pythagorean analytics |

---

## API Documentation

Full API documentation available at:
- **OpenAPI Spec**: `/api/live/openapi.json` (TODO)
- **Interactive Docs**: `/api/live/docs` (TODO)

---

**Status**: ✅ Deployed with functional endpoints (pending secret configuration)  
**Last Updated**: 2025-09-30 04:51 CDT  
**Platform**: Cloudflare Pages  
**Framework**: Cloudflare Workers Functions + TypeScript
