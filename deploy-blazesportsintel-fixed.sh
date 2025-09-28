#!/bin/bash

# 🔥 Blaze Sports Intel - Deep South Sports Authority Deployment (FIXED)
# The Dave Campbell's of SEC & Texas Athletics
# Texas • SEC • Every Player • Every Level

echo "🔥 Starting Blaze Sports Intel - Deep South Sports Authority deployment..."
echo "🏆 Target: blazesportsintel.com (Cloudflare Pages)"
echo "📦 Preparing complete deployment package..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo -e "${RED}Error: index.html not found. Are you in the right directory?${NC}"
    exit 1
fi

# Check if wrangler is installed
if ! command -v npx &> /dev/null; then
    echo -e "${RED}Error: npx is not available${NC}"
    exit 1
fi

echo -e "${YELLOW}🔍 Verifying wrangler installation...${NC}"
npx wrangler --version

# Create deployment headers
echo -e "${YELLOW}📝 Creating _headers file for proper MIME types...${NC}"
cat > _headers << EOF
/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, OPTIONS
  Access-Control-Allow-Headers: Content-Type
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/*.js
  Content-Type: application/javascript; charset=utf-8
  Cache-Control: public, max-age=3600

/*.css
  Content-Type: text/css; charset=utf-8
  Cache-Control: public, max-age=3600

/*.json
  Content-Type: application/json; charset=utf-8
  Cache-Control: public, max-age=300

/*.html
  Content-Type: text/html; charset=utf-8
  Cache-Control: public, max-age=300
EOF

echo -e "${GREEN}✅ Headers file created${NC}"

# Create redirects for clean URLs
echo -e "${YELLOW}📝 Creating _redirects file...${NC}"
cat > _redirects << EOF
# Redirect www to non-www
https://www.blazesportsintel.com/* https://blazesportsintel.com/:splat 301!

# Handle SPA routing
/*    /index.html   200
EOF

echo -e "${GREEN}✅ Redirects file created${NC}"

# Count files for deployment
echo -e "${YELLOW}📊 Counting deployment files...${NC}"
TOTAL_FILES=$(find . -type f -name "*.html" -o -name "*.js" -o -name "*.css" -o -name "*.json" -o -name "*.xml" -o -name "*.txt" -o -name "*.ico" -o -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" -o -name "*.svg" -o -name "*.webp" | grep -v node_modules | grep -v .git | wc -l)
echo -e "${GREEN}📁 Found $TOTAL_FILES files to deploy${NC}"

# Deploy to Cloudflare Pages
echo -e "${YELLOW}🚀 Deploying to Cloudflare Pages...${NC}"
echo "Using project: blazesportsintel"

# Deploy with simple command that works with wrangler 4.x
echo -e "${GREEN}📤 Uploading all files to Cloudflare...${NC}"

npx wrangler pages deploy . --project-name=blazesportsintel

DEPLOY_EXIT_CODE=$?

if [ $DEPLOY_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✨ Deployment successful!${NC}"
    echo ""
    echo "🌐 Your site should be live at:"
    echo "   https://blazesportsintel.com"
    echo "   https://blazesportsintel.pages.dev"
    echo ""
    echo "📊 Deployment Summary:"
    echo "   - Total files deployed: $TOTAL_FILES"
    echo "   - JavaScript modules deployed ✅"
    echo "   - CSS directories included ✅"
    echo "   - CORS headers configured ✅"
    echo "   - MIME types properly set ✅"
    echo ""
    echo "🔍 Next Steps:"
    echo "   1. Visit https://blazesportsintel.com"
    echo "   2. Check domain connection in Cloudflare dashboard"
    echo "   3. Verify all assets load correctly"
    echo "   4. Test championship dashboard functionality"

    # Save deployment info
    echo "$(date): Deployment successful - $TOTAL_FILES files" >> deployment-log.txt
else
    echo -e "${RED}❌ Deployment failed with exit code: $DEPLOY_EXIT_CODE${NC}"
    echo "Check the error messages above for details"
    echo ""
    echo "Common fixes:"
    echo "1. Run: npx wrangler login"
    echo "2. Ensure you have access to the blazesportsintel project"
    echo "3. Check your internet connection"

    # Save error info
    echo "$(date): Deployment failed - Exit code: $DEPLOY_EXIT_CODE" >> deployment-log.txt
    exit 1
fi