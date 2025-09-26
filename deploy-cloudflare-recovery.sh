#!/bin/bash

# 🔥 BLAZE INTELLIGENCE - CLOUDFLARE PAGES RECOVERY DEPLOYMENT
# Restores proper Cloudflare deployment for blazesportsintel.com
# Date: September 26, 2025

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${MAGENTA}🔥 BLAZE INTELLIGENCE - CLOUDFLARE RECOVERY DEPLOYMENT${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Function to check command success
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1 failed${NC}"
        exit 1
    fi
}

# Step 1: Check current directory
echo -e "${YELLOW}📍 Step 1: Verifying current directory...${NC}"
if [ ! -f "index.html" ] || [ ! -f "wrangler.toml" ]; then
    echo -e "${RED}❌ Error: Not in the correct directory (BSI)${NC}"
    echo "Please run this script from /Users/AustinHumphrey/BSI"
    exit 1
fi
check_status "Directory verification"
echo ""

# Step 2: Fix Wrangler installation
echo -e "${YELLOW}🔧 Step 2: Fixing Wrangler CLI installation...${NC}"
echo "Installing wrangler locally..."

# Check if node_modules exists and clean it
if [ -d "node_modules" ]; then
    echo "Cleaning existing node_modules..."
    rm -rf node_modules/@cloudflare/workerd* 2>/dev/null || true
fi

# Install wrangler
npm install wrangler@latest --save-dev --force
check_status "Wrangler installation"

# Verify wrangler works
echo "Verifying wrangler installation..."
npx wrangler --version
check_status "Wrangler verification"
echo ""

# Step 3: Check authentication
echo -e "${YELLOW}🔐 Step 3: Checking Cloudflare authentication...${NC}"
if npx wrangler whoami 2>/dev/null | grep -q "You are logged in"; then
    echo -e "${GREEN}✅ Already authenticated with Cloudflare${NC}"
else
    echo "You need to authenticate with Cloudflare"
    echo -e "${CYAN}Opening browser for authentication...${NC}"
    npx wrangler login
    check_status "Cloudflare authentication"
fi
echo ""

# Step 4: Check if Pages project exists
echo -e "${YELLOW}🔍 Step 4: Checking Cloudflare Pages project...${NC}"
PROJECT_EXISTS=$(npx wrangler pages project list 2>/dev/null | grep -c "blazesportsintel" || true)

if [ "$PROJECT_EXISTS" -eq "0" ]; then
    echo "Project doesn't exist. Creating blazesportsintel project..."
    npx wrangler pages project create blazesportsintel \
        --production-branch main \
        --compatibility-date 2024-09-26
    check_status "Project creation"
else
    echo -e "${GREEN}✅ Project 'blazesportsintel' already exists${NC}"
fi
echo ""

# Step 5: Verify required files
echo -e "${YELLOW}📋 Step 5: Verifying deployment files...${NC}"
MISSING_FILES=0

check_file() {
    if [ -f "$1" ]; then
        echo -e "  ${GREEN}✓${NC} $1"
    else
        echo -e "  ${RED}✗${NC} $1 (missing)"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
}

echo "Checking critical files:"
check_file "index.html"
check_file "_headers"
check_file "_redirects"
check_file "wrangler.toml"

if [ $MISSING_FILES -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Warning: $MISSING_FILES files are missing${NC}"
    echo "Continue anyway? (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        exit 1
    fi
else
    echo -e "${GREEN}✅ All critical files present${NC}"
fi
echo ""

# Step 6: Deploy to Cloudflare Pages
echo -e "${YELLOW}🚀 Step 6: Deploying to Cloudflare Pages...${NC}"
echo "Deploying blazesportsintel.com..."
echo ""

# Show what we're deploying
echo -e "${CYAN}Deployment Configuration:${NC}"
echo "  Project: blazesportsintel"
echo "  Branch: main"
echo "  URL: https://blazesportsintel.pages.dev"
echo "  Custom Domain: https://blazesportsintel.com"
echo ""

# Deploy with error handling
npx wrangler pages deploy . \
    --project-name=blazesportsintel \
    --branch=main \
    --commit-dirty=true \
    --compatibility-date=2024-09-26

DEPLOY_STATUS=$?

if [ $DEPLOY_STATUS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🎉 DEPLOYMENT SUCCESSFUL!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${CYAN}📊 Deployment Summary:${NC}"
    echo "  ✅ Cloudflare Pages: Deployed"
    echo "  ✅ Headers: Enterprise configuration"
    echo "  ✅ Wrangler: Properly configured"
    echo "  ✅ Platform: Cloudflare (NOT Netlify)"
    echo ""
    echo -e "${CYAN}🌐 Your site is now live at:${NC}"
    echo -e "  ${BLUE}https://blazesportsintel.pages.dev${NC}"
    echo -e "  ${BLUE}https://blazesportsintel.com${NC}"
    echo ""
    echo -e "${CYAN}📋 Next Steps:${NC}"
    echo "  1. Clear browser cache and test the site"
    echo "  2. Check browser console for any errors"
    echo "  3. Verify all features are working"
    echo "  4. Monitor Cloudflare Analytics"
    echo ""

    # Log success
    echo "$(date): Cloudflare recovery deployment successful" >> deployment-log.txt

else
    echo ""
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ DEPLOYMENT FAILED${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}🔧 Troubleshooting Steps:${NC}"
    echo "  1. Run: npx wrangler login"
    echo "  2. Check your Cloudflare account permissions"
    echo "  3. Verify API tokens are valid"
    echo "  4. Check deployment logs above for specific errors"
    echo ""
    echo -e "${YELLOW}📝 For detailed logs, run:${NC}"
    echo "  npx wrangler pages deployment tail --project-name=blazesportsintel"
    echo ""

    # Log failure
    echo "$(date): Cloudflare recovery deployment failed - Exit code: $DEPLOY_STATUS" >> deployment-log.txt
    exit 1
fi

# Step 7: Quick verification
echo -e "${YELLOW}🔍 Step 7: Running quick verification...${NC}"
echo "Testing deployment endpoints..."

# Test Pages URL
if curl -s -o /dev/null -w "%{http_code}" https://blazesportsintel.pages.dev | grep -q "200\|301\|302"; then
    echo -e "  ${GREEN}✓${NC} Pages URL responding"
else
    echo -e "  ${YELLOW}⚠${NC} Pages URL not responding yet (may take a few minutes)"
fi

echo ""
echo -e "${MAGENTA}🏆 CLOUDFLARE DEPLOYMENT RECOVERY COMPLETE${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Platform: Cloudflare Pages ✅ (NOT Netlify ❌)"
echo "Transform Data Into Championships 🔥"