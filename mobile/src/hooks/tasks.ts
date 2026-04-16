import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Tasks from "../services/tasks";
import type { CreateTaskArgs, UpdateTaskArgs } from "../db/schema";

export function useTasks(listId: string) {
  return useQuery({
    queryKey: ["tasks", listId],
    queryFn: () => Tasks.getTasks(listId),
    enabled: !!listId,
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ["task", id],
    queryFn: () => Tasks.getTask(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskArgs) => Tasks.createTask(data),
    onSettled: (_data, _err, { listId }) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", listId] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTaskArgs) => Tasks.updateTask(data),
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", vars.id] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, listId }: { id: string; listId: string }) => Tasks.deleteTask(id),
    onSettled: (_data, _err, { listId }) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", listId] });
    },
  });
}