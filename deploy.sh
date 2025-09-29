#!/usr/bin/env bash
set -euo pipefail

# fail if UI files changed in API-only PRs (token guard already in CI)
if git diff --name-only origin/main...HEAD | grep -E 'styles/|packages/ui|\\.css$|\\.html$' >/dev/null; then
  # Check for 'ui-change' label on the PR
  if [ -n "${GITHUB_TOKEN:-}" ] && [ -n "${GITHUB_EVENT_PATH:-}" ]; then
    PR_NUMBER=$(jq -r .pull_request.number < "$GITHUB_EVENT_PATH")
    LABELS=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
      "https://api.github.com/repos/${GITHUB_REPOSITORY}/issues/${PR_NUMBER}" | jq -r '.labels[].name')
    if echo "$LABELS" | grep -q '^ui-change$'; then
      echo "UI changes detected and 'ui-change' label present — proceeding"
    else
      echo "UI changes detected — require 'ui-change' label and design review" >&2
      exit 1
    fi
  else
    echo "UI changes detected — require 'ui-change' label and design review" >&2
    exit 1
  fi
fi

# build (noop if static)
[ -f package.json ] && npm run build || true

# deploy via global wrangler
WRANGLER="$HOME/.npm-global/bin/wrangler"
if [ ! -x "$WRANGLER" ]; then echo "wrangler not found at $WRANGLER" >&2; exit 1; fi

"$WRANGLER" pages deploy . \
  --project-name blazesportsintel \
  --branch main \
  --commit-dirty=true
