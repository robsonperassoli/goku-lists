import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptInvitation,
  createInvitation,
  getInvitationPreview,
  leaveList,
} from "@/api";
import { authClient } from "@/lib/auth-client";
import { useDrizzle } from "./useDrizzle";
import { getMyRole } from "@/services/list-members";
import { resyncFull } from "@/sync/run";

export function useListMembership(listId: string) {
  const db = useDrizzle();
  const { data: session } = authClient.useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ["listMembership", listId, userId],
    queryFn: () => (userId ? getMyRole(db, listId, userId) : null),
    enabled: !!listId && !!userId,
  });
}

export function useCreateInvitation() {
  return useMutation({
    mutationFn: (listId: string) => createInvitation(listId),
  });
}

export function useInvitationPreview(token: string) {
  return useQuery({
    queryKey: ["invitation", token],
    queryFn: () => getInvitationPreview(token),
    enabled: !!token,
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      const result = await acceptInvitation(token);
      await resyncFull();
      return result;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
  });
}

export function useLeaveList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listId: string) => {
      await leaveList(listId);
      await resyncFull();
      return listId;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
  });
}
