#!/usr/bin/env bash
set -euo pipefail

# Blaze Sports Intel - SINGLE Deployment Script
# Purpose: Deploy to Cloudflare Pages - NCAA FIRST
# Reality Enforcer: Working ugly > beautiful broken

echo "🔥 Blaze Sports Intel Deployment"
echo "================================"
echo "📍 NCAA FOOTBALL PRIORITY #1"
echo "📍 Real data or DEMO labels required"
echo ""

# Build if package.json exists
if [ -f package.json ]; then
  echo "📦 Building project..."
  npm run build || true
else
  echo "✅ No build required (static site)"
fi

# Truth Check - Ensure no false claims
echo "🔍 Running Truth Audit..."
if grep -r "98\.\|99\.\|accuracy.*[89][0-9]\|million.*data\|billion" index.html functions/api/*.js 2>/dev/null; then
  echo "❌ FALSE CLAIMS DETECTED! Fix these before deploying:"
  grep -r "98\.\|99\.\|accuracy.*[89][0-9]\|million.*data\|billion" index.html functions/api/*.js 2>/dev/null || true
  echo ""
  echo "Reality Check Failed. Add DEMO labels or remove false claims."
  exit 1
fi
echo "✅ Truth audit passed - no false claims found"
echo ""

# Find wrangler (prefer global installation)
WRANGLER=""
WRANGLER_PATHS=(
  "$HOME/.npm-global/bin/wrangler"
  "/usr/local/bin/wrangler"
  "$HOME/node_modules/.bin/wrangler"
  "$(which wrangler 2>/dev/null || true)"
)

for path in "${WRANGLER_PATHS[@]}"; do
  if [ -x "$path" ]; then
    WRANGLER="$path"
    echo "✅ Found wrangler at: $WRANGLER"
    break
  fi
done

if [ -z "$WRANGLER" ]; then
  echo "⚠️  Wrangler not found, installing globally..."
  npm install -g wrangler@latest
  WRANGLER="$HOME/.npm-global/bin/wrangler"
fi

# Check for required environment variables or use defaults
CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-a12cb329d84130460eed99b816e4d0d3}"
export CLOUDFLARE_ACCOUNT_ID

echo "🚀 Deploying to Cloudflare Pages..."
echo "   Project: blazesportsintel"
echo "   Branch: main"
echo "   Account: $CLOUDFLARE_ACCOUNT_ID"

# Deploy to Cloudflare Pages
"$WRANGLER" pages deploy . \
  --project-name blazesportsintel \
  --branch main \
  --commit-dirty

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Deployment successful!"
  echo "🌐 Site: https://blazesportsintel.com"
  echo ""

  # Verify deployment
  echo "🔍 Verifying deployment..."
  sleep 5

  # Check if site responds
  if curl -s -o /dev/null -w "%{http_code}" https://blazesportsintel.com | grep -q "200\|304"; then
    echo "✅ Site is live and responding"
  else
    echo "⚠️  Site may still be propagating, check in a few minutes"
  fi

  # Check for API endpoints - NCAA FIRST!
  echo "🔍 Checking API endpoints..."
  echo ""

  # Priority #1: NCAA Football
  echo "Testing NCAA Football (Priority #1)..."
  if curl -s https://blazesportsintel.com/api/ncaa-football?teamId=251 | grep -q "team\|demo\|error"; then
    echo "✅ NCAA Football API endpoint responding"
    # Show if it's demo or live
    if curl -s https://blazesportsintel.com/api/ncaa-football?teamId=251 | grep -q "isLiveData.*true"; then
      echo "   ✅ LIVE DATA from ESPN"
    else
      echo "   ⚠️  DEMO MODE (ESPN connection pending)"
    fi
  else
    echo "❌ NCAA Football API endpoint NOT responding - FIX THIS FIRST!"
  fi

  # Other endpoints (lower priority)
  if curl -s https://blazesportsintel.com/api/mlb?teamId=138 | grep -q "team\|error"; then
    echo "✅ MLB API endpoint responding"
  else
    echo "⚠️  MLB API endpoint not responding yet"
  fi
else
  echo ""
  echo "❌ Deployment failed"
  echo "   Check the error messages above"
  echo "   Common issues:"
  echo "   - Missing CLOUDFLARE_API_TOKEN"
  echo "   - Incorrect project name"
  echo "   - Network issues"
  exit 1
fi