#!/bin/bash
set -euo pipefail

echo "🔍 Blaze Sports Intel - Security Key Scan"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

VIOLATIONS=0

# Known exposed keys that should NOT exist
EXPOSED_KEYS=(
  "6ca2adb39404482da5406f0a6cd7aa37"  # Old SPORTSDATAIO key
  "hm0Hj86TobTT"                       # Old CFBDATA key prefix
  "930b17cbb3925fd07d3e2f752ff0f9f6"  # Old THEODDS key
)

echo "1️⃣ Checking for previously exposed keys..."
for key in "${EXPOSED_KEYS[@]}"; do
  if grep -rq "$key" . --exclude-dir={node_modules,.git,BSI-archive,scripts} --exclude="*.md" --exclude="check-exposed-keys.sh" 2>/dev/null; then
    echo -e "${RED}❌ CRITICAL: Found exposed key: $key${NC}"
    grep -rn "$key" . --exclude-dir={node_modules,.git,BSI-archive,scripts} --exclude="*.md" --exclude="check-exposed-keys.sh" 2>/dev/null
    VIOLATIONS=$((VIOLATIONS + 1))
  fi
done

if [ $VIOLATIONS -eq 0 ]; then
  echo -e "${GREEN}✅ No previously exposed keys found${NC}"
else
  echo -e "${RED}❌ Found $VIOLATIONS exposed keys that must be removed!${NC}"
fi

echo ""
echo "2️⃣ Checking for hardcoded API key patterns..."

# Common API key patterns
PATTERNS=(
  "['\"][a-zA-Z0-9]{32}['\"]"                    # 32-char hex in quotes
  "api_key['\"]\\s*:\\s*['\"][^'\"]{20,}"       # api_key: "value"
  "apiKey['\"]\\s*:\\s*['\"][^'\"]{20,}"        # apiKey: "value"
  "API_KEY['\"]\\s*:\\s*['\"][^'\"]{20,}"       # API_KEY: "value"
  "Bearer [a-zA-Z0-9_\-]{20,}"                   # Bearer tokens
)

PATTERN_VIOLATIONS=0

for pattern in "${PATTERNS[@]}"; do
  MATCHES=$(grep -rE "$pattern" lib/ src/ functions/ --exclude-dir=node_modules --exclude="*.md" 2>/dev/null | grep -v "process.env" | grep -v "throw new Error" || true)

  if [ ! -z "$MATCHES" ]; then
    echo -e "${YELLOW}⚠️  Found potential keys matching pattern: $pattern${NC}"
    echo "$MATCHES"
    PATTERN_VIOLATIONS=$((PATTERN_VIOLATIONS + 1))
  fi
done

if [ $PATTERN_VIOLATIONS -eq 0 ]; then
  echo -e "${GREEN}✅ No suspicious key patterns found${NC}"
else
  echo -e "${YELLOW}⚠️  Found $PATTERN_VIOLATIONS potential patterns (may be false positives)${NC}"
fi

echo ""
echo "3️⃣ Checking for environment variable usage..."

# Check that API keys are using environment variables
if grep -r "process.env.SPORTSDATAIO_API_KEY" lib/ functions/ src/ 2>/dev/null > /dev/null; then
  echo -e "${GREEN}✅ SPORTSDATAIO_API_KEY using environment variable${NC}"
else
  echo -e "${RED}❌ SPORTSDATAIO_API_KEY not using environment variable${NC}"
  VIOLATIONS=$((VIOLATIONS + 1))
fi

if grep -r "process.env.CFBDATA_API_KEY" lib/ functions/ src/ 2>/dev/null > /dev/null; then
  echo -e "${GREEN}✅ CFBDATA_API_KEY using environment variable${NC}"
else
  echo -e "${RED}❌ CFBDATA_API_KEY not using environment variable${NC}"
  VIOLATIONS=$((VIOLATIONS + 1))
fi

if grep -r "process.env.THEODDS_API_KEY" lib/ functions/ src/ 2>/dev/null > /dev/null; then
  echo -e "${GREEN}✅ THEODDS_API_KEY using environment variable${NC}"
else
  echo -e "${RED}❌ THEODDS_API_KEY not using environment variable${NC}"
  VIOLATIONS=$((VIOLATIONS + 1))
fi

echo ""
echo "4️⃣ Checking git history for exposed keys..."

# Check if old keys are in git history
if git log --all --full-history --source --all -- "*" 2>/dev/null | grep -q "6ca2adb39404482da5406f0a6cd7aa37" 2>/dev/null; then
  echo -e "${YELLOW}⚠️  Old SPORTSDATAIO key found in git history${NC}"
  echo "   This is expected after key rotation. Verify key has been rotated with provider."
else
  echo -e "${GREEN}✅ No old keys in git history${NC}"
fi

echo ""
echo "=========================================="
if [ $VIOLATIONS -eq 0 ]; then
  echo -e "${GREEN}✅ Security scan PASSED - No critical violations${NC}"
  exit 0
else
  echo -e "${RED}❌ Security scan FAILED - $VIOLATIONS critical violations found${NC}"
  echo ""
  echo "Action Required:"
  echo "1. Remove all hardcoded API keys"
  echo "2. Use environment variables: process.env.KEY_NAME"
  echo "3. Rotate any exposed keys with providers"
  echo "4. Add keys to Cloudflare: wrangler pages secret put KEY_NAME"
  exit 1
fi