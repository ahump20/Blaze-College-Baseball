#!/bin/bash
# UI Token Guard - Prevents unauthorized UI/design changes
# This script enforces the separation between API and UI components

set -euo pipefail

echo "🔍 Checking for UI/Design changes..."

# Define UI files that should NOT be modified without design review
UI_FILES_PATTERNS=(
    "*.css"
    "*.scss" 
    "*.html"
    "*.htm"
    "styles/*"
    "css/*"
    "Assets/Scripts/UI/*"
    "unity-app/Assets/Scripts/UI/*"
    "tailwind.config.*"
    "package.json"
    "*.design"
    "*.figma"
    "*.sketch"
)

# Check for modified UI files
MODIFIED_UI_FILES=()
for pattern in "${UI_FILES_PATTERNS[@]}"; do
    if git diff --name-only origin/main...HEAD | grep -E "$pattern" >/dev/null; then
        MODIFIED_UI_FILES+=($(git diff --name-only origin/main...HEAD | grep -E "$pattern"))
    fi
done

# Check Unity UI files specifically
UNITY_UI_FILES=$(git diff --name-only origin/main...HEAD | grep -E "unity-app/Assets/Scripts/UI/.*\.cs$" || true)

if [[ -n "$UNITY_UI_FILES" ]]; then
    MODIFIED_UI_FILES+=($UNITY_UI_FILES)
fi

# Check for color/design token changes
DESIGN_TOKEN_CHANGES=$(git diff origin/main...HEAD | grep -E "(Color|color|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})" || true)

if [[ ${#MODIFIED_UI_FILES[@]} -gt 0 ]]; then
    echo "❌ UI files modified. This PR needs design review." >&2
    echo "" >&2
    echo "Modified UI files:" >&2
    printf '%s\n' "${MODIFIED_UI_FILES[@]}" >&2
    echo "" >&2
    echo "🔒 UI files are FROZEN without design review approval." >&2
    echo "Please add the 'ui-change' and 'needs-design-review' labels to this PR." >&2
    exit 1
fi

if [[ -n "$DESIGN_TOKEN_CHANGES" ]]; then
    echo "⚠️  Design token changes detected:" >&2
    echo "$DESIGN_TOKEN_CHANGES" >&2
    echo "" >&2
    echo "Please ensure these changes are intentional and approved by design team." >&2
fi

# Check for API-only changes (these are allowed)
API_FILES=$(git diff --name-only origin/main...HEAD | grep -E "(api/|lib/api/|lib/adapters/|functions/api/|Context7Service\.cs|MCPClient\.cs)" || true)

if [[ -n "$API_FILES" ]]; then
    echo "✅ API files modified - this is allowed:"
    echo "$API_FILES"
fi

echo "✅ No unauthorized UI changes detected"
echo "🎯 API/UI separation maintained"