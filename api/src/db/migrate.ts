import { migrate } from "drizzle-orm/better-sqlite3/migrator"

import { db } from "."
import { migrationsFolder } from "../../drizzle.config"

migrate(db, { migrationsFolder })
