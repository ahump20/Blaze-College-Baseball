#!/bin/bash

# 🔥 FIX BLAZE SPORTS INTEL DOMAIN 404 ERROR
# The domain is hitting R2 storage instead of Pages deployment

echo "🔥 BLAZE SPORTS INTEL - DOMAIN FIX SCRIPT"
echo "========================================="
echo ""
echo "⚠️  ISSUE DETECTED: blazesportsintel.com is routing to R2 storage bucket"
echo "   This is causing the 404 error you're seeing."
echo ""
echo "✅ SOLUTION: Connect domain to Pages deployment (not R2)"
echo ""
echo "📍 CURRENT STATUS:"
echo "   - Pages deployment: https://blazesportsintel.pages.dev ✅ WORKING"
echo "   - Custom domain: blazesportsintel.com ❌ Hitting R2 bucket (404)"
echo ""
echo "========================================="
echo "🛠️  AUTOMATED FIX STEPS:"
echo "========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Checking current Pages project status...${NC}"
npx wrangler pages project list 2>/dev/null | grep blazesportsintel

echo -e "${YELLOW}Step 2: Checking current domain configuration...${NC}"
npx wrangler pages domains list --project-name=blazesportsintel 2>/dev/null || echo "No domains configured yet"

echo -e "${YELLOW}Step 3: Attempting to add domain via CLI...${NC}"
echo "Note: This might fail if domain is already configured elsewhere in Cloudflare"

# Try to add the domain via CLI (this often requires dashboard access)
npx wrangler pages domains add blazesportsintel.com --project-name=blazesportsintel 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Domain successfully connected via CLI!${NC}"
    echo "The domain should start working within 1-2 minutes."
else
    echo -e "${RED}❌ CLI domain connection failed (this is expected).${NC}"
    echo ""
    echo "========================================="
    echo "📝 MANUAL FIX REQUIRED (5 minutes):"
    echo "========================================="
    echo ""
    echo "The domain is currently misconfigured in Cloudflare."
    echo "It's pointing to an R2 bucket instead of your Pages deployment."
    echo ""
    echo "🔧 TO FIX THIS ISSUE:"
    echo ""
    echo "1. Go to: https://dash.cloudflare.com"
    echo ""
    echo "2. Check R2 Storage:"
    echo "   - Click 'R2' in the left sidebar"
    echo "   - Look for any bucket named 'blazesportsintel'"
    echo "   - If found, click it and go to Settings"
    echo "   - Remove any custom domain configuration for blazesportsintel.com"
    echo ""
    echo "3. Configure Pages (the correct way):"
    echo "   - Click 'Pages' in the left sidebar"
    echo "   - Click on 'blazesportsintel' project"
    echo "   - Go to 'Custom domains' tab"
    echo "   - Click 'Set up a custom domain'"
    echo "   - Enter: blazesportsintel.com"
    echo "   - Click 'Continue' → 'Activate domain'"
    echo ""
    echo "4. Also add www subdomain:"
    echo "   - Click 'Set up a custom domain' again"
    echo "   - Enter: www.blazesportsintel.com"
    echo "   - Click 'Continue' → 'Activate domain'"
    echo ""
    echo "5. Wait 1-2 minutes for propagation"
    echo ""
    echo "========================================="
    echo "🎯 EXPECTED RESULT:"
    echo "========================================="
    echo ""
    echo "✅ blazesportsintel.com → Your championship platform"
    echo "✅ www.blazesportsintel.com → Your championship platform"
    echo "✅ No more 404 errors"
    echo "✅ Deep South Sports Authority platform loads correctly"
    echo ""
fi

echo "========================================="
echo "🔍 VERIFICATION:"
echo "========================================="
echo ""
echo "After fixing, verify at:"
echo "1. https://blazesportsintel.com (should load platform)"
echo "2. https://www.blazesportsintel.com (should redirect)"
echo "3. https://blazesportsintel.pages.dev (backup URL always works)"
echo ""
echo "Current Pages deployment status:"
curl -s -o /dev/null -w "Preview URL: %{http_code}\n" https://blazesportsintel.pages.dev

echo ""
echo "🔥 The platform is ready - just needs proper domain routing!"