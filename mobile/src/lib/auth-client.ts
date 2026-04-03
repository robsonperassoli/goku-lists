import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { config } from "./config";

export const authClient = createAuthClient({
  baseURL: config.apiUrl,
  plugins: [
    expoClient({
      scheme: "goku-lists",
      storagePrefix: "goku-lists",
      storage: SecureStore,
    }),
  ],
});
