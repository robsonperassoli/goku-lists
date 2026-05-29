import { eq } from "drizzle-orm";
import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite/driver";
import { syncState } from "@/db/schema";

const DEFAULT_ID = "default";

type DbLike = Pick<ExpoSQLiteDatabase, "select" | "insert" | "update">;

export function getCursor(db: DbLike): number | undefined {
  const row = db
    .select()
    .from(syncState)
    .where(eq(syncState.id, DEFAULT_ID))
    .get();

  if (!row || row.cursor == null) {
    return undefined;
  }

  return row.cursor;
}

export function setCursor(db: DbLike, cursor: number) {
  const existing = db
    .select()
    .from(syncState)
    .where(eq(syncState.id, DEFAULT_ID))
    .get();

  if (existing) {
    db.update(syncState)
      .set({ cursor, lastSyncedAt: new Date() })
      .where(eq(syncState.id, DEFAULT_ID))
      .run();
    return;
  }

  db.insert(syncState)
    .values({
      id: DEFAULT_ID,
      cursor,
      lastSyncedAt: new Date(),
    })
    .run();
}

export function touchLastSyncedAt(db: DbLike) {
  const existing = db
    .select()
    .from(syncState)
    .where(eq(syncState.id, DEFAULT_ID))
    .get();

  if (existing) {
    db.update(syncState)
      .set({ lastSyncedAt: new Date() })
      .where(eq(syncState.id, DEFAULT_ID))
      .run();
    return;
  }

  db.insert(syncState)
    .values({
      id: DEFAULT_ID,
      lastSyncedAt: new Date(),
    })
    .run();
}
