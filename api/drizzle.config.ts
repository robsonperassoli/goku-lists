import { defineConfig } from "drizzle-kit";
import { config } from "./src/lib/config";

export const migrationsFolder = "./drizzle";

export default defineConfig({
  out: migrationsFolder,
  schema: "./src/db/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: config.db.fileName,
  },
});
