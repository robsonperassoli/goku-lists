#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

APK_REL="android/app/build/outputs/apk/release/app-release.apk"
APK="$ROOT/$APK_REL"
BUILD=false
BUILD_ONLY=false
# Cloudflare Free/Pro caps proxied POST bodies at 100 MiB.
CLOUDFLARE_UPLOAD_LIMIT_BYTES=$((100 * 1024 * 1024))

require_env() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    echo "Set ${name} in the environment." >&2
    exit 1
  fi
}

build_release_apk() {
  echo "Building release APK (NODE_ENV=production, uses .env.production.local)..."
  NODE_ENV=production sh -c \
    'cd android && ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a'
}

usage() {
  echo "Usage: $(basename "$0") [--build | --build-only]"
  echo ""
  echo "  Upload the release APK to the production API."
  echo "  --build       Build the APK first if missing, then upload"
  echo "  --build-only  Build the APK and exit (no upload)"
  echo ""
  echo "Upload requires environment variables:"
  echo "  GOKU_RELEASE_API_URL          API base URL, e.g. https://list.goku.tools"
  echo "  GOKU_RELEASE_UPLOAD_SECRET    Bearer token for POST /release"
  echo ""
  echo "Cloudflare-proxied domains reject uploads over 100 MiB. If publish returns 413,"
  echo "rebuild with 'bun run android:release' (arm64-only, compressed native libs) or"
  echo "point GOKU_RELEASE_API_URL at a DNS-only hostname that reaches Railway directly."
  exit "${1:-0}"
}

for arg in "$@"; do
  case "$arg" in
    --build) BUILD=true ;;
    --build-only) BUILD_ONLY=true ;;
    -h | --help) usage 0 ;;
    *)
      echo "Unknown argument: $arg" >&2
      usage 1
      ;;
  esac
done

if [[ ! -d "$ROOT/android" ]]; then
  echo "Missing android/. Run from mobile/: bun run prebuild" >&2
  exit 1
fi

if [[ "$BUILD_ONLY" == true ]]; then
  build_release_apk
  echo ""
  echo "APK: ${APK_REL}"
  exit 0
fi

if [[ "$BUILD" == true ]] || [[ ! -f "$APK" ]]; then
  build_release_apk
fi

if [[ ! -f "$APK" ]]; then
  echo "APK not found at ${APK_REL}" >&2
  exit 1
fi

require_env GOKU_RELEASE_UPLOAD_SECRET
require_env GOKU_RELEASE_API_URL

UPLOAD_SECRET="$GOKU_RELEASE_UPLOAD_SECRET"
API_URL="${GOKU_RELEASE_API_URL%/}"
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
