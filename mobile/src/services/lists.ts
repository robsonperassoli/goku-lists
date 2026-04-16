import { asc, eq } from 'drizzle-orm';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite/driver';
import { list, type CreateListArgs, type UpdateListArgs } from '@/db/schema';

export function getLists(db: ExpoSQLiteDatabase) {
  return db.select().from(list).orderBy(asc(list.createdAt)).all();
}

export function getList(db: ExpoSQLiteDatabase, id: string) {
  return db.select().from(list).where(eq(list.id, id)).get();
}

export async function createList(db: ExpoSQLiteDatabase, data: CreateListArgs) {
  const now = new Date();
  db.insert(list)
    .values({
      ...data,
      createdAt: now,
      updatedAt: now,
    })
    .run();
}

export async function updateList(db: ExpoSQLiteDatabase, data: UpdateListArgs) {
  db.update(list)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(list.id, data.id))
    .run();
}

export async function deleteList(db: ExpoSQLiteDatabase, id: string) {
  db.delete(list).where(eq(list.id, id)).run();
}
