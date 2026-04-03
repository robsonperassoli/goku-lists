import { type Static, Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

export const ConfigSchema = Type.Object({
  server: Type.Object({
    frontendUrl: Type.String({ minLength: 1 }),
    port: Type.Integer({ minimum: 1, maximum: 65535 }),
  }),
  db: Type.Object({
    fileName: Type.String({ minLength: 1 }),
  }),
  auth: Type.Object({
    google: Type.Object({
      clientId: Type.String({ minLength: 1 }),
      clientSecret: Type.String({ minLength: 1 }),
    }),
  }),
  devMode: Type.Boolean(),
});

export type Config = Static<typeof ConfigSchema>;

const rawConfig = {
  server: {
    frontendUrl: process.env.FRONTEND_URL,
    port: process.env.PORT ? Number(process.env.PORT) : 3000,
  },
  db: {
    fileName: process.env.DB_FILE_NAME,
  },
  auth: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    },
  },
  devMode: process.env.DEV_MODE === "true",
};

if (!Value.Check(ConfigSchema, rawConfig)) {
  const details = [...Value.Errors(ConfigSchema, rawConfig)]
    .map(({ path, message }) => `${path || "/"}: ${message}`)
    .join("\n");

  throw new Error(`Invalid environment configuration:\n${details}`);
}

export const config: Config = rawConfig;
