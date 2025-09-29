#!/usr/bin/env bash
set -euo pipefail

# Cloudflare Pages deployment script for Blaze Sports Intel
echo "🔥 Deploying Blaze Sports Intel to Cloudflare Pages..."

# Check for wrangler
if ! command -v wrangler &> /dev/null; then
    echo "❌ Error: wrangler CLI not found"
    echo "Install with: npm install -g wrangler"
    exit 1
fi

# Deploy to Cloudflare Pages
echo "📦 Deploying to production..."
npx wrangler pages deploy . \
    --project-name=blazesportsintel \
    --branch=main \
    --commit-dirty=true

echo "✅ Deployment complete!"
echo "🌐 Site: https://blazesportsintel.com"