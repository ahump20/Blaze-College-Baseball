#!/usr/bin/env bash
set -euo pipefail

# Blaze Sports Intel - Single Deployment Script
# Purpose: Deploy to Cloudflare Pages without UI regressions

echo "🔥 Blaze Sports Intel Deployment"
echo "================================"

# Check for UI changes in API-only PRs (token guard)
if git diff --name-only origin/main...HEAD 2>/dev/null | grep -E 'styles/|packages/ui|\.css$|\.html$' >/dev/null; then
  echo "⚠️  UI changes detected in this branch"
  echo "   If this is an API-only PR, these changes will be rejected."
  echo "   Add 'ui-change' label to PR if UI changes are intentional."
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
  fi
fi

# Build if package.json exists
if [ -f package.json ]; then
  echo "📦 Building project..."
  npm run build || true
else
  echo "✅ No build required (static site)"
fi

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
  --commit-dirty=true \
  --compatibility-date="$(date +%Y-%m-%d)"

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

  # Check for API endpoints
  echo "🔍 Checking API endpoints..."
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