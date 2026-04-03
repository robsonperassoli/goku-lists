import { defineConfig } from "drizzle-kit"
import { config } from "./src/lib/config"

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: config.db.fileName,
  },
})
