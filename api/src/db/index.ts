import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"

import { config } from "../lib/config"
import * as schema from "./schema"

export const db = drizzle({
  client: new Database(config.db.fileName),
  schema,
})
