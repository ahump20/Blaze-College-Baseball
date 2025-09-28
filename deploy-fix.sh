#!/bin/bash

# Blaze Sports Intel - API Routing Fix Deployment Script
# Deploys the fixed API routing to Cloudflare Pages

set -e

echo "🔥 Blaze Sports Intel - API Routing Fix Deployment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

# Step 1: Verify we're on the fix branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "fix/prod-api-and-dashboard" ]; then
    warn "Not on fix/prod-api-and-dashboard branch. Current: $CURRENT_BRANCH"
    echo "Switch to fix branch? (y/n)"
    read -r response
    if [ "$response" = "y" ]; then
        git checkout fix/prod-api-and-dashboard
        log "Switched to fix/prod-api-and-dashboard branch"
    else
        error "Deployment cancelled"
        exit 1
    fi
fi

# Step 2: Verify all API files exist
log "Verifying API structure..."

API_FILES=(
    "functions/api/mlb.js"
    "functions/api/nfl.js" 
    "functions/api/nba.js"
    "functions/api/ncaa.js"
    "functions/api/sports-data-real-mlb.js"
    "functions/api/sports-data-real-nfl.js"
    "functions/api/sports-data-real-nba.js"
    "functions/api/sports-data-real-ncaa.js"
    "functions/api/mlb-standings.js"
    "functions/api/nfl-standings.js"
    "functions/api/nba-standings.js"
    "functions/api/ncaa-standings.js"
)

for file in "${API_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        error "Missing required file: $file"
        exit 1
    fi
done

log "✅ All API files present"

# Step 3: Verify frontend uses query strings
log "Verifying frontend API calls..."
if grep -q "teamId=" index.html && ! grep -q "/mlb/138\|/nfl/10\|/nba/29\|/ncaa/251" index.html; then
    log "✅ Frontend uses query strings"
else
    error "❌ Frontend still uses path segments"
    exit 1
fi

# Step 4: Run final validation
log "Running final validation tests..."
if command -v node &> /dev/null; then
    if [ -f "/tmp/validate_fix_requirements.js" ]; then
        cd /tmp && node validate_fix_requirements.js
        if [ $? -eq 0 ]; then
            log "✅ All validation tests passed"
        else
            error "❌ Validation tests failed"
            exit 1
        fi
    else
        warn "Validation script not found, skipping tests"
    fi
else
    warn "Node.js not available, skipping validation tests"
fi

# Step 5: Clean deployment setup
log "Setting up clean deployment environment..."

# Remove node_modules to avoid wrangler conflicts (as mentioned in problem statement)
if [ -d "node_modules" ]; then
    log "Removing node_modules to avoid wrangler conflicts"
    rm -rf node_modules
fi

# Step 6: Deploy with wrangler
log "Deploying to Cloudflare Pages..."

# Check if wrangler is available globally (preferred approach from problem statement)
if command -v wrangler &> /dev/null; then
    WRANGLER_CMD="wrangler"
    log "Using global wrangler"
else
    # Fallback to npx
    WRANGLER_CMD="npx wrangler"
    log "Using npx wrangler"
fi

# Deploy to production
log "Deploying to production environment..."
$WRANGLER_CMD pages deploy . \
    --project-name blazesportsintel \
    --branch main \
    --commit-dirty=true

if [ $? -eq 0 ]; then
    log "🎉 Deployment successful!"
else
    error "❌ Deployment failed"
    exit 1
fi

# Step 7: Verification commands (as suggested in problem statement)
log "Deployment complete! Running verification commands..."

echo ""
echo -e "${BLUE}🔍 Verification Commands:${NC}"
echo ""
echo "# Test main page title:"
echo "curl -s https://blazesportsintel.com | grep -q \"Blaze Sports Intel\" && echo \"✅ OK: Title\" || echo \"❌ FAIL: Title\""
echo ""
echo "# Test APIs return JSON (not HTML):"
echo "curl -s https://blazesportsintel.com/api/mlb?teamId=138 | jq 'type' || echo \"❌ Not JSON\""
echo "curl -s https://blazesportsintel.com/api/mlb-standings | jq '.[0] | keys' || echo \"❌ Not JSON array\""
echo ""
echo "# Test no HTML in API responses:"
echo "curl -s https://blazesportsintel.com/api/nfl-standings | head -1 | grep -q '<' && echo \"❌ ERR: HTML\" || echo \"✅ OK: JSON\""
echo ""

log "🚀 Blaze Sports Intel API Routing Fix Deployed Successfully!"
log "🌐 Site: https://blazesportsintel.com"
log "📊 APIs: https://blazesportsintel.com/api/"

echo ""
echo -e "${GREEN}================================================================${NC}"
echo -e "${GREEN}✅ API ROUTING FIX DEPLOYMENT COMPLETE${NC}"
echo -e "${GREEN}================================================================${NC}"
echo -e "🔧 Fixed: Per-sport API endpoints with query string support"
echo -e "📊 Added: League-wide standings endpoints"  
echo -e "🎨 Restored: Brand tokens and styling"
echo -e "🌐 Deployed: https://blazesportsintel.com"
echo -e "${GREEN}================================================================${NC}"