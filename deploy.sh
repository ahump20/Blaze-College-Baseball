#!/usr/bin/env bash
set -euo pipefail

# fail if UI files changed in API-only PRs (token guard already in CI)
if git diff --name-only origin/main...HEAD | grep -E 'styles/|packages/ui|\\.css$|\\.html$' >/dev/null; then
  echo "UI changes detected — require 'ui-change' label and design review" >&2
  exit 1
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
