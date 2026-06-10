#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

RELEASE_ENV="$ROOT/.env.release"
APK_REL="android/app/build/outputs/apk/release/app-release.apk"
APK="$ROOT/$APK_REL"
BUILD=false
# Cloudflare Free/Pro caps proxied POST bodies at 100 MiB.
CLOUDFLARE_UPLOAD_LIMIT_BYTES=$((100 * 1024 * 1024))

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
  echo ""
  echo "Cloudflare-proxied domains reject uploads over 100 MiB. If publish returns 413,"
  echo "rebuild with 'bun run android:release' (arm64-only, compressed native libs) or"
  echo "point GOKU_RELEASE_API_URL at a DNS-only hostname that reaches Railway directly."
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
  ENV=production sh -c 'cd android && ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a'
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

APK_BYTES="$(wc -c < "${APK}" | tr -d ' ')"
APK_MIB="$(( (APK_BYTES + 1024 * 1024 - 1) / (1024 * 1024) ))"
echo "APK size: ${APK_MIB} MiB"

if [[ "${APK_BYTES}" -gt "${CLOUDFLARE_UPLOAD_LIMIT_BYTES}" ]] \
  && [[ "${UPLOAD_URL}" == *"list.goku.tools"* ]]; then
  echo "Warning: APK exceeds Cloudflare's 100 MiB upload limit for list.goku.tools." >&2
  echo "Rebuild with 'bun run prebuild && bun run android:release', or upload via a" >&2
  echo "DNS-only hostname that points at Railway (see README § Production Android release)." >&2
fi

echo "Uploading APK to ${UPLOAD_URL}"

RESPONSE_FILE="$(mktemp)"
HTTP_CODE="$(curl -sS \
  -o "${RESPONSE_FILE}" \
  -w '%{http_code}' \
  -X POST \
  -H "Authorization: Bearer ${UPLOAD_SECRET}" \
  -H "Content-Type: application/vnd.android.package-archive" \
  --data-binary "@${APK}" \
  "${UPLOAD_URL}")"
RESPONSE="$(cat "${RESPONSE_FILE}")"
rm -f "${RESPONSE_FILE}"

if [[ "${HTTP_CODE}" == "413" ]]; then
  echo "Upload failed: HTTP 413 Payload Too Large" >&2
  if grep -qi cloudflare <<< "${RESPONSE}"; then
    echo "Cloudflare rejected the upload before it reached the API (100 MiB limit on Free/Pro)." >&2
  fi
  echo "Rebuild a smaller APK ('bun run prebuild && bun run android:release') or set" >&2
  echo "GOKU_RELEASE_API_URL to a DNS-only Railway hostname for uploads." >&2
  exit 1
fi

if [[ "${HTTP_CODE}" -lt 200 || "${HTTP_CODE}" -ge 300 ]]; then
  echo "Upload failed: HTTP ${HTTP_CODE}" >&2
  [[ -n "${RESPONSE}" ]] && echo "${RESPONSE}" >&2
  exit 1
fi

echo "$RESPONSE"
DOWNLOAD_URL="$(echo "$RESPONSE" | bun -e 'const r=JSON.parse(await Bun.stdin.text()); console.log(r.url ?? "")')"
if [[ -n "$DOWNLOAD_URL" ]]; then
  echo "Download: ${DOWNLOAD_URL}"
fi
