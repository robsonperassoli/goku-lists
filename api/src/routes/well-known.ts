import { Hono } from "hono"

import { ANDROID_PACKAGE } from "../lib/app-link"
import { config } from "../lib/config"

function normalizeFingerprint(value: string): string {
  return value.replace(/\s/g, "").toUpperCase()
}

function assetLinks() {
  const fingerprint = config.android.sha256CertFingerprint
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

export const wellKnownRoutes = new Hono().get(
  "/.well-known/assetlinks.json",
  (c) => c.json(assetLinks()),
)
