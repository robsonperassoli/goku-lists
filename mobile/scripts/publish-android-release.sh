#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

TAG=latest
APK_REL="android/app/build/outputs/apk/release/app-release.apk"
ASSET_NAME="app-release.apk"
APK="$ROOT/$APK_REL"
BUILD=false

usage() {
  echo "Usage: $(basename "$0") [--build]"
  echo ""
  echo "  Upload the release APK to GitHub Releases (tag: ${TAG})."
  echo "  --build   Run ./gradlew assembleRelease first (ENV=production)"
  echo ""
  echo "Requires: gh auth login, android/ from bun run prebuild"
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

if ! command -v gh >/dev/null 2>&1; then
  echo "Install GitHub CLI: https://cli.github.com/" >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Run: gh auth login" >&2
  exit 1
fi

VERSION="$(bun -e 'console.log(require("./app.json").expo.version)')"
NOTES="Android APK (app version ${VERSION}). Re-run this script to replace the binary on tag \`${TAG}\`."

echo "Publishing ${ASSET_NAME} to GitHub release tag: ${TAG}"

if gh release view "$TAG" >/dev/null 2>&1; then
  gh release upload "$TAG" "${APK}#${ASSET_NAME}" --clobber
  gh release edit "$TAG" --notes "$NOTES" --latest=true
  echo "Updated release ${TAG}"
else
  gh release create "$TAG" "${APK}#${ASSET_NAME}" \
    --title "Latest (Android)" \
    --notes "$NOTES" \
    --latest
  echo "Created release ${TAG}"
fi

RELEASE_URL="$(gh release view "$TAG" --json url -q .url)"
echo "Release: ${RELEASE_URL}"
