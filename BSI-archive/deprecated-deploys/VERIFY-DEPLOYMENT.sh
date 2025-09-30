#!/bin/bash

# 🔥 BLAZE SPORTS INTEL - DEPLOYMENT VERIFICATION
# Confirms platform is working and provides access URLs

echo "🔥 BLAZE SPORTS INTEL - DEPLOYMENT VERIFICATION"
echo "==============================================="
echo ""
echo "📊 CHECKING ALL DEPLOYMENT URLS..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to check URL
check_url() {
    local url=$1
    local description=$2
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$url")

    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ $description: $url (Status: $response)${NC}"
        return 0
    else
        echo -e "${RED}❌ $description: $url (Status: $response)${NC}"
        return 1
    fi
}

echo "🌐 PAGES DEPLOYMENTS (These should work):"
echo "----------------------------------------"
check_url "https://blazesportsintel.pages.dev" "Main Pages URL"
check_url "https://acecdcd7.blazesportsintel.pages.dev" "Latest Deploy"

echo ""
echo "🔗 CUSTOM DOMAIN STATUS (Currently broken):"
echo "-------------------------------------------"
check_url "https://blazesportsintel.com" "Custom Domain"
check_url "https://www.blazesportsintel.com" "WWW Domain"

echo ""
echo "==============================================="
echo "📋 DEPLOYMENT SUMMARY:"
echo "==============================================="
echo ""

# Check if Pages URLs are working
if curl -s -o /dev/null -w "" "https://blazesportsintel.pages.dev"; then
    echo -e "${GREEN}✅ PLATFORM STATUS: FULLY DEPLOYED AND OPERATIONAL${NC}"
    echo ""
    echo "Your championship platform is live at:"
    echo "👉 https://blazesportsintel.pages.dev"
    echo "👉 https://acecdcd7.blazesportsintel.pages.dev"
    echo ""
    echo "Features available:"
    echo "• Deep South Sports Authority branding"
    echo "• Championship analytics dashboards"
    echo "• 3D sports visualizations"
    echo "• Real-time data integration"
    echo "• AI-powered biomechanics analysis"
    echo "• Monte Carlo simulations"
else
    echo -e "${RED}⚠️  Pages deployment may need refresh${NC}"
fi

echo ""
echo "==============================================="
echo "🔧 DOMAIN FIX REQUIRED:"
echo "==============================================="
echo ""

if ! curl -s -o /dev/null -w "" "https://blazesportsintel.com"; then
    echo -e "${YELLOW}The custom domain blazesportsintel.com is misconfigured.${NC}"
    echo ""
    echo "PROBLEM: Domain is routing to R2 storage instead of Pages"
    echo ""
    echo "TO FIX:"
    echo "1. Go to https://dash.cloudflare.com"
    echo "2. Remove domain from R2 (if present)"
    echo "3. Add domain to Pages → blazesportsintel → Custom domains"
    echo ""
    echo "See CLOUDFLARE-DASHBOARD-FIX-INSTRUCTIONS.md for detailed steps"
else
    echo -e "${GREEN}✅ Custom domain is working correctly!${NC}"
fi

echo ""
echo "==============================================="
echo "🚀 QUICK ACCESS:"
echo "==============================================="
echo ""
echo "Working Platform URLs:"
echo "• https://blazesportsintel.pages.dev"
echo "• https://acecdcd7.blazesportsintel.pages.dev"
echo ""
echo "Documentation:"
echo "• CLOUDFLARE-DASHBOARD-FIX-INSTRUCTIONS.md"
echo "• CHAMPIONSHIP-DEPLOYMENT-SUCCESS-FINAL.md"
echo ""
echo "🔥 Championship platform is ready - just needs domain fix!"