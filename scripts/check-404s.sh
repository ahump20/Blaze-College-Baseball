#!/bin/bash
# scripts/check-404s.sh
set -e

LIST=${LIST:-product/ux/top-pages.txt}

if [ ! -f "$LIST" ]; then
  echo "ℹ️  No top-pages.txt found at $LIST, skipping 404 check"
  exit 0
fi

echo "🔍 Checking for 404s in critical pages..."

fail=0
checked=0

while read -r url; do
  # Skip empty lines and comments
  [[ -z "$url" || "$url" =~ ^# ]] && continue
  
  checked=$((checked + 1))
  code=$(curl -s -o /dev/null -w "%{http_code}" -L "$url" || echo "000")
  
  if [ "$code" -ge 400 ]; then
    echo "❌ 404:$url (HTTP $code)"
    fail=$((fail + 1))
  else
    echo "✅ OK:$url"
  fi
done < "$LIST"

echo ""
echo "📊 Checked $checked pages, $fail failures"

exit $fail
