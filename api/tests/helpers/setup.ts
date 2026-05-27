import { Database } from "bun:sqlite"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { drizzle } from "drizzle-orm/bun-sqlite"
import { migrate } from "drizzle-orm/bun-sqlite/migrator"
import * as schema from "../../src/db/schema"
import { msToDate } from "../../src/lib/dates"

const migrationsFolder = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../drizzle",
)

export function createTestDb() {
  const client = new Database(":memory:")
  const db = drizzle({ client, schema })

  migrate(db, { migrationsFolder })

  const now = msToDate(0)
  db.insert(schema.user)
    .values({
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    })
    .run()

  db.insert(schema.user)
    .values({
      id: "user-2",
      name: "Other User",
      email: "other@example.com",
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    })
    .run()

  return db
}

export const USER_ID = "user-1"
export const OTHER_USER_ID = "user-2"
