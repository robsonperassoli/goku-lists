import { type Static, Type } from "@sinclair/typebox"
import { Value } from "@sinclair/typebox/value"

export const ConfigSchema = Type.Object({
  server: Type.Object({
    frontendUrl: Type.String({ minLength: 1 }),
    port: Type.Integer({ minimum: 1, maximum: 65535 }),
  }),
  db: Type.Object({
    fileName: Type.String({ minLength: 1 }),
  }),
  auth: Type.Object({
    url: Type.String({ minLength: 1 }),
    secret: Type.String({ minLength: 32 }),
    google: Type.Object({
      clientId: Type.String({ minLength: 1 }),
      clientSecret: Type.String({ minLength: 1 }),
    }),
  }),
  devMode: Type.Boolean(),
  ngrokDomain: Type.String(),
  android: Type.Object({
    sha256CertFingerprint: Type.Optional(Type.String()),
    apkDownloadUrl: Type.String({ minLength: 1 }),
  }),
})

export type Config = Static<typeof ConfigSchema>

const rawConfig = {
  server: {
    frontendUrl: process.env.FRONTEND_URL,
    port: process.env.PORT ? Number(process.env.PORT) : 3000,
  },
  db: {
    fileName: process.env.DB_FILE_NAME,
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
  android: {
    sha256CertFingerprint: process.env.ANDROID_SHA256_CERT_FINGERPRINT,
    apkDownloadUrl: process.env.ANDROID_APK_DOWNLOAD_URL,
  },
}

if (!Value.Check(ConfigSchema, rawConfig)) {
  const details = [...Value.Errors(ConfigSchema, rawConfig)]
    .map(({ path, message }) => `${path || "/"}: ${message}`)
    .join("\n")

  throw new Error(`Invalid environment configuration:\n${details}`)
}

export const config: Config = rawConfig
