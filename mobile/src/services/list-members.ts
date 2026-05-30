import { and, eq, isNull } from "drizzle-orm";
import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite/driver";
import { list, listMember, task } from "@/db/schema";
import type { ListMemberRole } from "@/db/schema";

export function getMyMembership(
  db: ExpoSQLiteDatabase,
  listId: string,
  userId: string,
) {
  return db
    .select()
    .from(listMember)
    .where(
      and(
        eq(listMember.listId, listId),
        eq(listMember.userId, userId),
        isNull(listMember.deletedAt),
      ),
    )
    .get();
}

export function getMyRole(
  db: ExpoSQLiteDatabase,
  listId: string,
  userId: string,
): ListMemberRole | null {
  return getMyMembership(db, listId, userId)?.role ?? null;
}

export function isSharedList(db: ExpoSQLiteDatabase, listId: string) {
  const members = db
    .select()
    .from(listMember)
    .where(and(eq(listMember.listId, listId), isNull(listMember.deletedAt)))
    .all();

  return members.length > 1;
}

export function purgeListData(db: ExpoSQLiteDatabase, listId: string) {
  db.transaction((tx) => {
    tx.delete(task).where(eq(task.listId, listId)).run();
    tx.delete(listMember).where(eq(listMember.listId, listId)).run();
    tx.delete(list).where(eq(list.id, listId)).run();
  });
}

export function insertOwnerMember(
  db: ExpoSQLiteDatabase,
  listId: string,
  userId: string,
  timestamps: { joinedAt: Date; updatedAt: Date },
) {
  db.insert(listMember)
    .values({
      listId,
      userId,
      role: "owner",
      joinedAt: timestamps.joinedAt,
      updatedAt: timestamps.updatedAt,
      deletedAt: null,
    })
    .run();
}
