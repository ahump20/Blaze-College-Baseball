#!/bin/bash
# scripts/slo-smoke.sh
set -e

API=${API:-https://blazesportsintel.com/api/v1}

echo "🔍 Running SLO smoke test against ${API}..."

# Check API health endpoint
echo "Testing /api/v1/games endpoint..."
t0=$(date +%s%3N)
response=$(curl -s -w "\n%{http_code}" "$API/games?limit=5" || echo "000")
t1=$(date +%s%3N)
d=$((t1 - t0))

http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

echo "Response time: ${d}ms"
echo "HTTP Status: ${http_code}"

if [ "$http_code" -lt 200 ] || [ "$http_code" -ge 300 ]; then
  echo "❌ API returned non-2xx status: $http_code"
  exit 1
fi

if [ $d -gt 200 ]; then
  echo "⚠️  WARNING: Response time ${d}ms exceeds p99 target of 200ms"
  exit 1
fi

echo "✅ SLO check passed: ${d}ms (target: ≤200ms)"
exit 0
