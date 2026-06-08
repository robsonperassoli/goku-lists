import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import * as Linking from "expo-linking";
import { useAuth } from "@/context/auth-context";
import { extractInviteToken } from "@/lib/invite-link";
import {
  getPendingInviteToken,
  setPendingInviteToken,
} from "@/lib/pending-invite";

export function InviteLinkHandler() {
  const { isReady, isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const handleUrl = (url: string | null) => {
      if (!url) {
        return;
      }

      const token = extractInviteToken(url);
      if (token) {
        void setPendingInviteToken(token);
      }
    };

    void Linking.getInitialURL().then(handleUrl);
    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleUrl(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!isReady || !isAuthenticated) {
      return;
    }

    void (async () => {
      const pendingToken = await getPendingInviteToken();
      if (!pendingToken) {
        return;
      }

      const inInvite =
        segments[0] === "invite" && segments[1] === pendingToken;

      if (!inInvite) {
        router.replace(`/invite/${pendingToken}`);
      }
    })();
  }, [isReady, isAuthenticated, segments, router]);

  return null;
}
