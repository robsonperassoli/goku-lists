import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDrizzle } from "./useDrizzle";
import * as Tasks from "../services/tasks";
import type { CreateTaskArgs, UpdateTaskArgs } from "../db/schema";

export function useTasks(listId: string) {
  const db = useDrizzle();

  return useQuery({
    queryKey: ["tasks", listId],
    queryFn: () => Tasks.getTasks(db, listId),
    enabled: !!listId,
  });
}

export function useTask(id: string) {
  const db = useDrizzle();

  return useQuery({
    queryKey: ["task", id],
    queryFn: () => Tasks.getTask(db, id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const db = useDrizzle();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskArgs) => Tasks.createTask(db, data),
    onSettled: (_data, _err, { listId }) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", listId] });
    },
  });
}

export function useUpdateTask() {
  const db = useDrizzle();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTaskArgs) => Tasks.updateTask(db, data),
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", vars.id] });
    },
  });
}

export function useDeleteTask() {
  const db = useDrizzle();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, listId }: { id: string; listId: string }) => Tasks.deleteTask(db, id),
    onSettled: (_data, _err, { listId }) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", listId] });
    },
  });
}
