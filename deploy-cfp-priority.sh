#!/bin/bash

# Blaze Intelligence - Deploy CFP Priority Update
# Corrects sports priority to put NCAA Football FIRST (It's January!)

echo "🏈 Deploying CFP Championship Priority Update..."
echo "====================================================="
echo "Correcting sports priority order:"
echo "1. NCAA Football (CFP Championship - ACTIVE NOW!)"
echo "2. MLB (Off-season)"
echo "3. NFL (Playoffs)"
echo "4. NBA (Mid-season)"
echo "5. Youth Sports"
echo "6. College Baseball (Starts Feb)"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in BSI project directory"
    exit 1
fi

echo "🔄 Step 1: Installing dependencies..."
npm install

echo ""
echo "🏈 Step 2: Backing up current index.html..."
cp index.html index-backup-$(date +%Y%m%d-%H%M%S).html

echo ""
echo "✅ Step 3: Activating CFP Priority homepage..."
cp index-cfp-priority.html index.html

echo ""
echo "🚀 Step 4: Deploying to Cloudflare Pages..."

# Deploy functions
echo "Deploying API functions with NCAA Football priority..."
wrangler pages publish . \
  --project-name="blazesportsintel" \
  --branch="main" \
  --commit-message="CFP Championship Priority - NCAA Football #1"

echo ""
echo "🔍 Step 5: Verifying deployment..."

# Test the API endpoints
echo "Testing NCAA Football endpoint (Priority #1)..."
curl -s https://blazesportsintel.com/api/ncaa-football-live | head -n 20

echo ""
echo "Testing Seasonal endpoint..."
curl -s https://blazesportsintel.com/api/sports-data/seasonal | head -n 20

echo ""
echo "✅ Deployment Complete!"
echo "====================================================="
echo "🏈 NCAA Football is now Priority #1 (as it should be in January!)"
echo "🔗 Visit: https://blazesportsintel.com"
echo ""
echo "Key Updates:"
echo "  • CFP Championship featured prominently"
echo "  • Texas Longhorns spotlight section"
echo "  • SEC conference focus"
echo "  • Seasonal sports awareness active"
echo "  • Real-time data feeds configured"
echo ""
echo "API Endpoints:"
echo "  • /api/ncaa-football-live (Priority #1)"
echo "  • /api/ncaa-football-live/cfp"
echo "  • /api/ncaa-football-live/texas"
echo "  • /api/ncaa-football-live/sec"
echo "  • /api/sports-data/seasonal"
echo ""
echo "Remember: It's January 2025 - CFP Championship is THE story!"
echo "🏈 Hook 'Em Horns! 🤘"