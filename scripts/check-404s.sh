#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: ./scripts/check-404s.sh <base_url> [--static-only]

Checks every route defined in product/ux/IA.md against the provided base URL and reports 404 responses.
- base_url: The deployed site or local dev server (e.g., https://staging.example.com).
- --static-only: Skip dynamic parameterized routes containing bracket segments.
USAGE
}

if [[ $# -lt 1 ]]; then
  usage >&2
  exit 1
fi

BASE_URL=""
SKIP_DYNAMIC=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --static-only)
      SKIP_DYNAMIC=true
      ;;
    http://*|https://*)
      BASE_URL="$1"
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
  shift
done

if [[ -z "$BASE_URL" ]]; then
  echo "Base URL is required." >&2
  usage >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required for this check." >&2
  exit 1
fi

if ! command -v npx >/dev/null 2>&1; then
  echo "npx is required to gather the IA route list." >&2
  exit 1
fi

echo "🌐 Checking for 404s at $BASE_URL"

mapfile -t ROUTES < <(npx tsx --tsconfig tsconfig.json scripts/route-map.ts --format=paths)

MISSING=()

for route in "${ROUTES[@]}"; do
  if [[ -z "$route" ]]; then
    continue
  fi
  if [[ "$SKIP_DYNAMIC" == true && "$route" == *"["* ]]; then
    continue
  fi
  url="${BASE_URL%/}${route}"
  status="$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")"
  if [[ "$status" == "404" || "$status" == "000" ]]; then
    MISSING+=("$route $status")
  fi
  echo "${status} ${route}"
  sleep 0.05
done

if [[ ${#MISSING[@]} -gt 0 ]]; then
  echo ""
  echo "❌ Detected ${#MISSING[@]} route(s) returning 404 or unreachable:"
  for entry in "${MISSING[@]}"; do
    printf '  %s\n' "$entry"
  done
  exit 1
fi

echo "✅ No 404s detected across IA routes"
