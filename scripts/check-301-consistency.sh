#!/bin/bash
# scripts/check-301-consistency.sh
set -e

SITE=${SITE:-https://blazesportsintel.com}

echo "🔍 Checking redirect consistency for ${SITE}..."

# Check if routes.json exists
if [ ! -f "archive/designs/routes.json" ]; then
  echo "⚠️  routes.json not found. Run: node scripts/route-map.ts"
  exit 0
fi

fail=0
checked=0

# Read routes and check HTTP status
while IFS= read -r url; do
  # Skip empty lines and JSON syntax
  url=$(echo "$url" | tr -d '", ' | grep "^http" || true)
  [ -z "$url" ] && continue
  
  checked=$((checked + 1))
  code=$(curl -s -o /dev/null -w "%{http_code}" -L "$url" || echo "000")
  
  if [ "$code" -ge 400 ]; then
    echo "❌ BAD:$code $url"
    fail=$((fail + 1))
  elif [ "$code" -eq 301 ] || [ "$code" -eq 302 ]; then
    echo "🔀 REDIRECT:$code $url"
  else
    echo "✅ OK:$code $url"
  fi
done < archive/designs/routes.json

echo ""
echo "📊 Checked $checked routes, $fail failures"

exit $fail
