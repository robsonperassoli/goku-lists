import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Lists from "../services/lists";
import type { CreateListArgs, UpdateListArgs } from "../db/schema";

export function useLists() {
  return useQuery({
    queryKey: ["lists"],
    queryFn: Lists.getLists,
  });
}

export function useList(id: string) {
  return useQuery({
    queryKey: ["list", id],
    queryFn: () => Lists.getList(id),
    enabled: !!id,
  });
}

export function useCreateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateListArgs) => Lists.createList(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
  });
}

export function useUpdateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateListArgs) => Lists.updateList(data),
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      queryClient.invalidateQueries({ queryKey: ["list", id] });
    },
  });
}

export function useDeleteList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => Lists.deleteList(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
  });
}