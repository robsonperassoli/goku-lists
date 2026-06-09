#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

RELEASE_ENV="$ROOT/.env.release"
APK_REL="android/app/build/outputs/apk/release/app-release.apk"
APK="$ROOT/$APK_REL"
BUILD=false

read_release_env() {
  local key="$1"
  if [[ ! -f "$RELEASE_ENV" ]]; then
    return 1
  fi

  local line
  line="$(grep -E "^${key}=" "$RELEASE_ENV" | head -1 || true)"
  if [[ -z "$line" ]]; then
    return 1
  fi

  local value="${line#*=}"
  value="${value#"${value%%[![:space:]]*}"}"
  value="${value%"${value##*[![:space:]]}"}"
  value="${value#\"}"
  value="${value%\"}"
  value="${value#\'}"
  value="${value%\'}"

  printf '%s' "$value"
}

usage() {
  echo "Usage: $(basename "$0") [--build]"
  echo ""
  echo "  Upload the release APK to the production API."
  echo "  --build   Run ./gradlew assembleRelease first (ENV=production)"
  echo ""
  echo "Requires mobile/.env.release with:"
  echo "  GOKU_RELEASE_API_URL          API base URL, e.g. https://list.goku.tools"
  echo "  GOKU_RELEASE_UPLOAD_SECRET    Bearer token for POST /release"
  echo ""
  echo "Optional shell overrides: GOKU_RELEASE_API_URL, GOKU_RELEASE_UPLOAD_SECRET"
  exit "${1:-0}"
}

for arg in "$@"; do
  case "$arg" in
    --build) BUILD=true ;;
    -h | --help) usage 0 ;;
    *)
      echo "Unknown argument: $arg" >&2
      usage 1
      ;;
  esac
done

if [[ ! -f "$RELEASE_ENV" ]]; then
  echo "Missing ${RELEASE_ENV}" >&2
  echo "Create it with GOKU_RELEASE_API_URL and GOKU_RELEASE_UPLOAD_SECRET." >&2
  exit 1
fi

if [[ ! -d "$ROOT/android" ]]; then
  echo "Missing android/. Run from mobile/: bun run prebuild" >&2
  exit 1
fi

if [[ "$BUILD" == true ]] || [[ ! -f "$APK" ]]; then
  echo "Building release APK..."
  ENV=production sh -c 'cd android && ./gradlew assembleRelease'
fi

if [[ ! -f "$APK" ]]; then
  echo "APK not found at ${APK_REL}" >&2
  exit 1
fi

UPLOAD_SECRET="${GOKU_RELEASE_UPLOAD_SECRET:-$(read_release_env GOKU_RELEASE_UPLOAD_SECRET || true)}"
if [[ -z "$UPLOAD_SECRET" ]]; then
  echo "Set GOKU_RELEASE_UPLOAD_SECRET in ${RELEASE_ENV}" >&2
  exit 1
fi

API_URL="${GOKU_RELEASE_API_URL:-$(read_release_env GOKU_RELEASE_API_URL || true)}"
if [[ -z "$API_URL" ]]; then
  echo "Set GOKU_RELEASE_API_URL in ${RELEASE_ENV}" >&2
  exit 1
fi

API_URL="${API_URL%/}"
UPLOAD_URL="${API_URL}/release"

echo "Uploading APK to ${UPLOAD_URL}"

RESPONSE="$(curl -fsS \
  -X POST \
  -H "Authorization: Bearer ${UPLOAD_SECRET}" \
  -H "Content-Type: application/vnd.android.package-archive" \
  --data-binary "@${APK}" \
  "${UPLOAD_URL}")"

echo "$RESPONSE"
DOWNLOAD_URL="$(echo "$RESPONSE" | bun -e 'const r=JSON.parse(await Bun.stdin.text()); console.log(r.url ?? "")')"
if [[ -n "$DOWNLOAD_URL" ]]; then
  echo "Download: ${DOWNLOAD_URL}"
fi
