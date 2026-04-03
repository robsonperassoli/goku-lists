import { Database } from "bun:sqlite"
import { drizzle } from "drizzle-orm/bun-sqlite"
import { config } from "../lib/config"
import * as schema from "./schema"

export const db = drizzle({
  client: new Database(config.db.fileName),
  schema,
})
