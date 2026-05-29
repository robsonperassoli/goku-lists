import type { ReactNode } from "react";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/lib/query-client";
import { useDrizzle } from "@/hooks/useDrizzle";
import { addNetworkStateListener } from "@/lib/network";
import { initSyncCoordinator, scheduleSync } from "./coordinator";

export function SyncScheduler({ children }: { children: ReactNode }) {
  const db = useDrizzle();
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (!session) {
      initSyncCoordinator(null);
      return;
    }

    initSyncCoordinator({ db, queryClient });
    scheduleSync("session");

    return () => {
      initSyncCoordinator(null);
    };
  }, [session, db]);

  useEffect(() => {
    if (!session) {
      return;
    }

    const subscription = addNetworkStateListener(() => {
      scheduleSync("network");
    });

    return () => {
      subscription.remove();
    };
  }, [session]);

  return children;
}
