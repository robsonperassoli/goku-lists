import { Database } from "bun:sqlite"
import { drizzle } from "drizzle-orm/bun-sqlite"
import * as schema from "./schema"

if (!process.env.DB_FILE_NAME) {
  throw new Error("DB_FILE_NAME environment variable is not set")
}

export const db = drizzle({
  client: new Database(process.env.DB_FILE_NAME),
  schema,
})
