import { mkdirSync } from "node:fs"
import { dirname } from "node:path"

import { z } from "zod"

export const APK_FILE_NAME = "goku-lists-latest.apk"

export const ConfigSchema = z.object({
  server: z.object({
    frontendUrl: z.string().min(1),
    port: z.number().int().min(1).max(65535),
  }),
  db: z.object({
    fileName: z.string().min(1),
  }),
  public: z.object({
    dir: z.string().min(1),
  }),
  auth: z.object({
    url: z.string().min(1),
    secret: z.string().min(32),
    google: z.object({
      clientId: z.string().min(1),
      clientSecret: z.string().min(1),
    }),
  }),
  devMode: z.boolean(),
  ngrokDomain: z.string(),
  apkUpload: z.object({
    secret: z.string().min(32),
  }),
  android: z.object({
    sha256CertFingerprint: z.string().optional(),
    apkDownloadUrl: z.string().min(1),
  }),
})

export type Config = z.infer<typeof ConfigSchema>

const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, "")

const rawConfig = {
  server: {
    frontendUrl,
    port: process.env.PORT ? Number(process.env.PORT) : 3000,
  },
  db: {
    fileName: process.env.DB_FILE_NAME,
  },
  public: {
    dir: process.env.PUBLIC_DIR,
  },
  auth: {
    url: process.env.BETTER_AUTH_URL ?? process.env.FRONTEND_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    google: {
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    },
  },
  devMode: process.env.DEV_MODE === "true",
  ngrokDomain: process.env.NGROK_DOMAIN,
  apkUpload: {
    secret: process.env.APK_UPLOAD_SECRET,
  },
  android: {
    sha256CertFingerprint: process.env.ANDROID_SHA256_CERT_FINGERPRINT,
    apkDownloadUrl: frontendUrl
      ? `${frontendUrl}/public/${APK_FILE_NAME}`
      : undefined,
  },
}

const parsed = ConfigSchema.safeParse(rawConfig)

if (!parsed.success) {
  const details = parsed.error.issues
    .map(({ path, message }) => `${path.join(".") || "/"}: ${message}`)
    .join("\n")

  throw new Error(`Invalid environment configuration:\n${details}`)
}

mkdirSync(dirname(parsed.data.db.fileName), { recursive: true })
mkdirSync(parsed.data.public.dir, { recursive: true })

export const config: Config = parsed.data
