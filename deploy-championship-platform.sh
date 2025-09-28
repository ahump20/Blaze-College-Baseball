#!/bin/bash

# ================================================================
# BLAZE SPORTS INTEL - CHAMPIONSHIP PLATFORM DEPLOYMENT
# Deep South Sports Authority - blazesportsintel.com
# Staff Engineer: Austin Humphrey
# ================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="blazesportsintel"
DOMAIN="blazesportsintel.com"
ENVIRONMENT="${1:-production}"
TIMESTAMP=$(date '+%Y-%m-%d_%H-%M-%S')
LOG_FILE="deployment-log-${TIMESTAMP}.txt"

echo -e "${BLUE}🏆 BLAZE SPORTS INTEL CHAMPIONSHIP PLATFORM DEPLOYMENT${NC}"
echo -e "${BLUE}================================================================${NC}"
echo -e "Project: ${PROJECT_NAME}"
echo -e "Domain: ${DOMAIN}"
echo -e "Environment: ${ENVIRONMENT}"
echo -e "Timestamp: ${TIMESTAMP}"
echo -e "================================================================"

# Function to log with timestamp
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    case $level in
        "INFO")
            echo -e "${GREEN}[INFO]${NC} ${message}"
            ;;
        "WARN")
            echo -e "${YELLOW}[WARN]${NC} ${message}"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} ${message}"
            ;;
        "DEBUG")
            echo -e "${BLUE}[DEBUG]${NC} ${message}"
            ;;
    esac

    echo "${timestamp} [${level}] ${message}" >> "${LOG_FILE}"
}

# Function to check prerequisites
check_prerequisites() {
    log "INFO" "Checking prerequisites..."

    # Check if wrangler is installed
    if ! command -v wrangler &> /dev/null; then
        log "ERROR" "Wrangler CLI not found. Please install with: npm install -g wrangler"
        exit 1
    fi

    # Check if authenticated
    if ! wrangler whoami &> /dev/null; then
        log "ERROR" "Not authenticated with Cloudflare. Please run: wrangler auth login"
        exit 1
    fi

    # Check for required files
    local required_files=("index.html" "_headers" "_redirects" "wrangler.toml")
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            log "ERROR" "Required file missing: $file"
            exit 1
        fi
    done

    log "INFO" "Prerequisites check passed ✅"
}

# Function to validate HTML
validate_html() {
    log "INFO" "Validating index.html..."

    # Check file size
    local file_size=$(wc -c < index.html)
    log "INFO" "index.html size: ${file_size} bytes"

    if [[ $file_size -lt 1000 ]]; then
        log "ERROR" "index.html appears to be too small (${file_size} bytes)"
        exit 1
    fi

    # Check for basic HTML structure
    if ! grep -q "<!DOCTYPE html>" index.html; then
        log "ERROR" "index.html missing DOCTYPE declaration"
        exit 1
    fi

    if ! grep -q "blazesportsintel.com" index.html; then
        log "WARN" "index.html may not contain proper domain references"
    fi

    log "INFO" "HTML validation passed ✅"
}

# Function to optimize assets
optimize_assets() {
    log "INFO" "Optimizing assets for deployment..."

    # Create optimized build directory
    mkdir -p ".build"

    # Copy essential files
    cp index.html .build/
    cp _headers .build/
    cp _redirects .build/

    # Copy additional assets if they exist
    [[ -d "css" ]] && cp -r css .build/
    [[ -d "js" ]] && cp -r js .build/
    [[ -d "images" ]] && cp -r images .build/
    [[ -d "assets" ]] && cp -r assets .build/
    [[ -d "data" ]] && cp -r data .build/
    [[ -d "functions" ]] && cp -r functions .build/

    # Copy manifest and service worker if they exist
    [[ -f "manifest.json" ]] && cp manifest.json .build/
    [[ -f "sw.js" ]] && cp sw.js .build/
    [[ -f "service-worker.js" ]] && cp service-worker.js .build/

    log "INFO" "Assets optimization completed ✅"
}

# Function to deploy to Cloudflare Pages
deploy_pages() {
    log "INFO" "Deploying to Cloudflare Pages..."

    # Deploy using wrangler pages
    if wrangler pages deploy .build \
        --project-name="${PROJECT_NAME}" \
        --compatibility-date="2025-09-26" \
        --compatibility-flags="nodejs_compat" >> "${LOG_FILE}" 2>&1; then

        log "INFO" "Pages deployment successful ✅"

        # Get deployment URL
        local deployment_url
        deployment_url=$(wrangler pages deployment list --project-name="${PROJECT_NAME}" --format=json | jq -r '.[0].url' 2>/dev/null || echo "")

        if [[ -n "$deployment_url" ]]; then
            log "INFO" "Deployment URL: ${deployment_url}"
        fi

    else
        log "ERROR" "Pages deployment failed ❌"
        log "ERROR" "Check ${LOG_FILE} for details"
        exit 1
    fi
}

# Function to deploy Workers (API Gateway)
deploy_workers() {
    log "INFO" "Deploying Cloudflare Workers (API Gateway)..."

    if [[ -f "functions/api-gateway.js" ]]; then
        # Deploy the API gateway worker
        if wrangler deploy functions/api-gateway.js \
            --name="blazesportsintel-api" \
            --compatibility-date="2025-09-26" >> "${LOG_FILE}" 2>&1; then

            log "INFO" "API Gateway deployment successful ✅"
        else
            log "WARN" "API Gateway deployment failed - continuing with static deployment"
        fi
    else
        log "INFO" "No API Gateway found - skipping Worker deployment"
    fi
}

# Function to verify deployment
verify_deployment() {
    log "INFO" "Verifying deployment..."

    # Wait for DNS propagation
    sleep 10

    # Test main domain
    local http_status
    http_status=$(curl -s -o /dev/null -w "%{http_code}" "https://${DOMAIN}" || echo "000")

    if [[ "$http_status" == "200" ]]; then
        log "INFO" "Domain verification successful: https://${DOMAIN} ✅"
    else
        log "WARN" "Domain verification failed: HTTP ${http_status}"

        # Test Pages URL as fallback
        local pages_url="${PROJECT_NAME}.pages.dev"
        http_status=$(curl -s -o /dev/null -w "%{http_code}" "https://${pages_url}" || echo "000")

        if [[ "$http_status" == "200" ]]; then
            log "INFO" "Pages URL verification successful: https://${pages_url} ✅"
        else
            log "ERROR" "Deployment verification failed ❌"
            exit 1
        fi
    fi

    # Test API endpoints if available
    if curl -s "https://${DOMAIN}/api/health" > /dev/null 2>&1; then
        log "INFO" "API endpoints responding ✅"
    else
        log "INFO" "API endpoints not available (static deployment)"
    fi
}

# Function to update DNS records
update_dns() {
    log "INFO" "Checking DNS configuration..."

    # This would typically be handled by Cloudflare Pages automatically
    # For custom domains, ensure CNAME record points to pages.dev
    log "INFO" "DNS should be configured to point ${DOMAIN} to ${PROJECT_NAME}.pages.dev"
}

# Function to cleanup
cleanup() {
    log "INFO" "Cleaning up temporary files..."
    [[ -d ".build" ]] && rm -rf .build
    log "INFO" "Cleanup completed ✅"
}

# Function to show deployment summary
show_summary() {
    log "INFO" "🏆 DEPLOYMENT SUMMARY"
    echo -e "${GREEN}================================================================${NC}"
    echo -e "${GREEN}✅ Blaze Sports Intel Championship Platform Deployed${NC}"
    echo -e "${GREEN}================================================================${NC}"
    echo -e "🌐 Primary URL: https://${DOMAIN}"
    echo -e "🔄 Backup URL: https://${PROJECT_NAME}.pages.dev"
    echo -e "📊 API Endpoint: https://${DOMAIN}/api"
    echo -e "🔍 Health Check: https://${DOMAIN}/api/health"
    echo -e "📝 Log File: ${LOG_FILE}"
    echo -e "⏰ Deployed: $(date)"
    echo -e "${GREEN}================================================================${NC}"
    echo -e "${BLUE}🏆 CHAMPIONSHIP INTELLIGENCE PLATFORM LIVE! 🏆${NC}"
}

# Main deployment process
main() {
    log "INFO" "Starting Blaze Sports Intel Championship Platform deployment..."

    # Trap to ensure cleanup on exit
    trap cleanup EXIT

    check_prerequisites
    validate_html
    optimize_assets
    deploy_pages
    deploy_workers
    update_dns
    verify_deployment
    show_summary

    # Update deployment status
    echo "$(date): Deployment successful ✅" >> deployment-log.txt

    log "INFO" "🏆 Championship Platform deployment completed successfully! 🏆"
}

# Error handling
error_handler() {
    local line_number=$1
    log "ERROR" "Deployment failed at line ${line_number}"
    echo "$(date): Deployment failed - Exit code: 1" >> deployment-log.txt
    cleanup
    exit 1
}

trap 'error_handler $LINENO' ERR

# Run main deployment
main "$@"