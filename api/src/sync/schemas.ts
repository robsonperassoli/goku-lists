import { z } from "zod"

const listDataSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  image: z.string().nullable(),
})

const taskDataSchema = z.object({
  listId: z.string(),
  title: z.string(),
  notes: z.string().nullable(),
  completedAt: z.number().nullable(),
  dueDate: z.number().nullable(),
  position: z.number(),
})

const listChangeSchema = z.union([
  z.object({
    table: z.literal("list"),
    id: z.string(),
    operation: z.enum(["create", "update"]),
    updatedAt: z.number(),
    data: listDataSchema,
  }),
  z.object({
    table: z.literal("list"),
    id: z.string(),
    operation: z.literal("delete"),
    updatedAt: z.number(),
  }),
])

const taskChangeSchema = z.union([
  z.object({
    table: z.literal("task"),
    id: z.string(),
    operation: z.enum(["create", "update"]),
    updatedAt: z.number(),
    data: taskDataSchema,
  }),
  z.object({
    table: z.literal("task"),
    id: z.string(),
    operation: z.literal("delete"),
    updatedAt: z.number(),
  }),
])

const changeSchema = z.union([listChangeSchema, taskChangeSchema])

export const pullSyncQuerySchema = z.object({
  since: z.preprocess(
    (value) => (value === undefined || value === "" ? undefined : value),
    z.coerce.number().int().optional(),
  ),
})

export const pushSyncBodySchema = z.object({
  changes: z.array(changeSchema),
})
