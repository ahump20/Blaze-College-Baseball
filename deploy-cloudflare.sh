#!/bin/bash

# Blaze Sports Intel - Cloudflare Pages Deployment Script
# Deep South Sports Authority - Championship Intelligence Platform

echo "🔥 =========================================="
echo "🔥 BLAZE SPORTS INTEL DEPLOYMENT"
echo "🔥 Deep South Sports Authority"
echo "🔥 =========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}❌ Wrangler CLI not found!${NC}"
    echo "Installing wrangler..."
    npm install -g wrangler
fi

# Function to check deployment status
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1 successful${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 failed${NC}"
        return 1
    fi
}

# Step 1: Verify configuration
echo -e "${BLUE}📋 Step 1: Verifying configuration...${NC}"
if [ -f "wrangler.toml" ]; then
    echo -e "${GREEN}✅ wrangler.toml found${NC}"
else
    echo -e "${RED}❌ wrangler.toml not found${NC}"
    exit 1
fi

# Step 2: Check for required files
echo -e "${BLUE}📋 Step 2: Checking required files...${NC}"
required_files=("index.html" "blaze-championship-integration.js")
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file found${NC}"
    else
        echo -e "${YELLOW}⚠️  $file not found (may not be required)${NC}"
    fi
done

# Step 3: Verify API functions
echo -e "${BLUE}📋 Step 3: Verifying API functions...${NC}"
if [ -d "functions/api" ]; then
    echo -e "${GREEN}✅ API functions directory found${NC}"
    ls -la functions/api/
else
    echo -e "${YELLOW}⚠️  API functions directory not found${NC}"
fi

# Step 4: Login to Cloudflare (if needed)
echo -e "${BLUE}📋 Step 4: Checking Cloudflare authentication...${NC}"
wrangler whoami &> /dev/null
if [ $? -ne 0 ]; then
    echo "Please login to Cloudflare:"
    wrangler login
fi

# Step 5: Deploy to preview environment first
echo -e "${BLUE}📋 Step 5: Deploying to preview environment...${NC}"
echo "Deploying to preview.blazesportsintel.com..."

wrangler pages deploy . \
    --project-name=blazesportsintel \
    --branch=preview \
    --env=preview

check_status "Preview deployment"

# Step 6: Run smoke tests
echo -e "${BLUE}📋 Step 6: Running smoke tests...${NC}"

# Test preview URL
PREVIEW_URL="https://blazesportsintel.pages.dev"
echo "Testing preview URL: $PREVIEW_URL"

# Check if site is accessible
curl -s -o /dev/null -w "%{http_code}" $PREVIEW_URL | grep -q "200"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Preview site is accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Preview site returned non-200 status${NC}"
fi

# Test API endpoints
echo "Testing API endpoints..."
API_ENDPOINTS=(
    "/api/championship"
    "/api/live-scores"
)

for endpoint in "${API_ENDPOINTS[@]}"; do
    response=$(curl -s -o /dev/null -w "%{http_code}" "${PREVIEW_URL}${endpoint}")
    if [ "$response" = "200" ] || [ "$response" = "304" ]; then
        echo -e "${GREEN}✅ ${endpoint} is working${NC}"
    else
        echo -e "${YELLOW}⚠️  ${endpoint} returned status ${response}${NC}"
    fi
done

# Step 7: Deploy to production (with confirmation)
echo ""
echo -e "${YELLOW}🚀 Ready to deploy to production (blazesportsintel.com)${NC}"
read -p "Do you want to deploy to production? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}📋 Step 7: Deploying to production...${NC}"

    wrangler pages deploy . \
        --project-name=blazesportsintel \
        --branch=main \
        --env=production

    check_status "Production deployment"

    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}🎉 =========================================="
        echo -e "🎉 DEPLOYMENT SUCCESSFUL!"
        echo -e "🎉 =========================================="
        echo ""
        echo "🔥 Production URL: https://blazesportsintel.com"
        echo "🔥 Preview URL: https://preview.blazesportsintel.com"
        echo "🔥 Pages URL: https://blazesportsintel.pages.dev"
        echo ""
        echo "Championship Intelligence Platform Features:"
        echo "  ✅ Deep South Sports Authority branding"
        echo "  ✅ Real-time sports data for Cardinals, Titans, Grizzlies, Longhorns"
        echo "  ✅ Championship probability analytics"
        echo "  ✅ Perfect Game youth pipeline integration"
        echo "  ✅ Live scores and game updates"
        echo "  ✅ MCP server integration"
        echo ""
        echo "Next steps:"
        echo "  1. Monitor analytics at https://analytics.blazesportsintel.com"
        echo "  2. Check performance metrics in Cloudflare dashboard"
        echo "  3. Verify all API endpoints are responding correctly"
        echo "  4. Test mobile responsiveness on actual devices"
        echo ""
    fi
else
    echo -e "${YELLOW}⏭️  Skipping production deployment${NC}"
    echo "Preview deployment is available at: $PREVIEW_URL"
fi

echo -e "${BLUE}📊 Deployment Summary:${NC}"
echo "  Project: blazesportsintel"
echo "  Platform: Cloudflare Pages"
echo "  Features: Championship Intelligence, Deep South Authority"
echo "  APIs: /api/championship, /api/live-scores"
echo "  Storage: R2 buckets for media and data"
echo "  Caching: KV namespaces for performance"
echo ""
echo "🔥 Blaze Sports Intel - Transform Data Into Championships"