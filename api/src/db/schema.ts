import {
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core"
import { user } from "./auth-schema"

export * from "./auth-schema"

export type ListMemberRole = "owner" | "contributor"

export const list = sqliteTable("list", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  image: text("image"),
  createdByUserId: text("created_by_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .$onUpdate(() => new Date())
    .notNull(),
  deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
})

export const task = sqliteTable("task", {
  id: text("id").primaryKey(),
  listId: text("list_id")
    .notNull()
    .references(() => list.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  notes: text("notes"),
  createdByUserId: text("created_by_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  completedAt: integer("completed_at", { mode: "timestamp_ms" }),
  dueDate: integer("due_date", { mode: "timestamp_ms" }),
  position: real("position").default(0.0),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .$onUpdate(() => new Date())
    .notNull(),
  deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
})

export const listMember = sqliteTable(
  "list_member",
  {
    listId: text("list_id")
      .notNull()
      .references(() => list.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").notNull().$type<ListMemberRole>(),
    joinedAt: integer("joined_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
  },
  (table) => [primaryKey({ columns: [table.listId, table.userId] })],
)

export const listInvitation = sqliteTable("list_invitation", {
  id: text("id").primaryKey(),
  listId: text("list_id")
    .notNull()
    .references(() => list.id, { onDelete: "cascade" }),
  invitedByUserId: text("invited_by_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  inviteeUserId: text("invitee_user_id").references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  acceptedAt: integer("accepted_at", { mode: "timestamp_ms" }),
  revokedAt: integer("revoked_at", { mode: "timestamp_ms" }),
})
