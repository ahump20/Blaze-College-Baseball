#!/bin/bash

# Blaze Sports Intelligence - Cloudflare Pages Deployment Script
# Production deployment for blazesportsintel.com

set -e  # Exit on error

echo "================================================"
echo "🔥 BLAZE INTELLIGENCE - CLOUDFLARE DEPLOYMENT"
echo "================================================"
echo ""

# Check if we're in the correct directory
if [ ! -f "wrangler.toml" ]; then
    echo "❌ Error: wrangler.toml not found. Are you in the BSI directory?"
    exit 1
fi

# Ensure austin-portfolio-deploy has latest files
echo "📦 Syncing files to austin-portfolio-deploy..."
rsync -av --exclude='.git' --exclude='node_modules' --exclude='.netlify' \
    --exclude='netlify.toml' --exclude='_redirects' \
    ./*.html ./css/ ./js/ ./images/ ./data/ ./api/ \
    /Users/AustinHumphrey/austin-portfolio-deploy/ 2>/dev/null || true

# Copy the correct _headers file
echo "📋 Copying Cloudflare _headers configuration..."
cp /Users/AustinHumphrey/austin-portfolio-deploy/_headers ./_headers

echo ""
echo "🚀 Deploying to Cloudflare Pages..."
echo "   Project: blazesportsintel"
echo "   Domain: blazesportsintel.com"
echo ""

# Deploy using npx to avoid path issues
npx wrangler pages deploy . \
    --project-name=blazesportsintel \
    --branch=main \
    --commit-dirty=true

echo ""
echo "================================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "================================================"
echo ""
echo "🌐 Site: https://blazesportsintel.com"
echo "📊 Dashboard: https://dash.cloudflare.com/?to=/:account/pages/view/blazesportsintel"
echo ""
echo "Next steps:"
echo "1. Verify deployment at https://blazesportsintel.com"
echo "2. Check Cloudflare dashboard for analytics"
echo "3. Test all API endpoints and live data feeds"
echo ""