import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { list, type CreateListArgs, type UpdateListArgs } from "@/db/schema";

export async function getLists() {
  return db.select().from(list).orderBy(asc(list.createdAt)).all();
}

export async function getList(id: string) {
  return db.select().from(list).where(eq(list.id, id)).get();
}

export async function createList(data: CreateListArgs) {
  const now = new Date();
  db.insert(list)
    .values({
      ...data,
      createdAt: now,
      updatedAt: now,
    })
    .run();
}

export async function updateList(data: UpdateListArgs) {
  db.update(list)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(list.id, data.id))
    .run();
}

export async function deleteList(id: string) {
  db.delete(list).where(eq(list.id, id)).run();
}
