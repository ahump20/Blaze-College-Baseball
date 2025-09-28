#!/bin/bash
# Token drift blocker - prevents UI/design changes
set -euo pipefail

if git diff --name-only origin/main...HEAD | grep -E 'styles/tokens.css|packages/ui|tailwind.config|\.css$|index\.html|dashboard\.html' ; then
  echo "❌ UI files modified. This PR needs label: ui-change and design review." >&2
  echo "Modified files that are FROZEN:" >&2
  git diff --name-only origin/main...HEAD | grep -E 'styles/|packages/ui|tailwind|\.css$|\.html$' >&2
  exit 1
fi

echo "✅ No UI files modified - API changes only"