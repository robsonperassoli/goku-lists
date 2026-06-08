import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema";
import { config } from "./config";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "sqlite", schema }),
  secret: config.auth.secret,
  baseURL: config.auth.url,
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days, so an offline user stays valid well past a week
    updateAge: 60 * 60 * 24, // roll the expiry forward at most once per day when online
  },
  plugins: [expo()],
  socialProviders: {
    google: {
      enabled: true,
      clientId: config.auth.google.clientId,
      clientSecret: config.auth.google.clientSecret,
    },
  },
  trustedOrigins: [
    "goku-lists://",

    // Development mode - Expo's exp:// scheme with local IP ranges
    ...(config.devMode
      ? [
          "exp://", // Trust all Expo URLs (prefix matching)
          "exp://**", // Trust all Expo URLs (wildcard matching)
          "exp://192.168.*.*:*/**", // Trust 192.168.x.x IP range with any port and path
        ]
      : []),
  ],
});
