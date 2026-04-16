import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDrizzle } from './useDrizzle';
import * as Lists from '@/services/lists';
import type { CreateListArgs, UpdateListArgs } from '@/db/schema';

export function useLists() {
  const db = useDrizzle();

  return useQuery({
    queryKey: ['lists'],
    queryFn: () => Lists.getLists(db),
  });
}

export function useList(id: string) {
  const db = useDrizzle();

  return useQuery({
    queryKey: ['list', id],
    queryFn: () => Lists.getList(db, id),
    enabled: !!id,
  });
}

export function useCreateList() {
  const db = useDrizzle();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateListArgs) => Lists.createList(db, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
}

export function useUpdateList() {
  const db = useDrizzle();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateListArgs) => Lists.updateList(db, data),
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      queryClient.invalidateQueries({ queryKey: ['list', id] });
    },
  });
}

export function useDeleteList() {
  const db = useDrizzle();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => Lists.deleteList(db, id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
}
