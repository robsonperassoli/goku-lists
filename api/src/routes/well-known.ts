import type { App } from "../app"
import { ANDROID_PACKAGE } from "../lib/app-link"

function normalizeFingerprint(value: string): string {
  return value.replace(/\s/g, "").toUpperCase()
}

function assetLinks() {
  const fingerprint = process.env.ANDROID_SHA256_CERT_FINGERPRINT
  const fingerprints = fingerprint ? [normalizeFingerprint(fingerprint)] : []

  return [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: ANDROID_PACKAGE,
        sha256_cert_fingerprints: fingerprints,
      },
    },
  ]
}

export default (app: App) =>
  app.get("/.well-known/assetlinks.json", ({ set }) => {
    set.headers["content-type"] = "application/json"
    return assetLinks()
  })
