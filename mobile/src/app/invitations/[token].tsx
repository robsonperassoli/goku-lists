import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { Spacing } from "@/constants/theme";
import {
  useAcceptInvitation,
  useInvitationPreview,
} from "@/hooks/sharing";
import { getInvitationState } from "@/api";
import { clearPendingInviteToken } from "@/lib/pending-invite";

export default function InviteScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const preview = useInvitationPreview(token);
  const acceptInvitation = useAcceptInvitation();

  const close = () => {
    void clearPendingInviteToken();
    router.replace("/(app)");
  };

  if (preview.isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (preview.isError || !preview.data) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.content}>
          <ThemedText type="title">Invitation unavailable</ThemedText>
          <ThemedText themeColor="textSecondary">
            This link may be invalid or expired.
          </ThemedText>
          <Button onPress={close}>Close</Button>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const state = getInvitationState(preview.data);
  const canAccept = state === "pending";

  const handleAccept = () => {
    acceptInvitation.mutate(token, {
      onSuccess: ({ listId }) => {
        void clearPendingInviteToken();
        router.replace(`/(app)/${listId}`);
      },
    });
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.content}>
        <ThemedText type="title">List invitation</ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          {preview.data.inviterName} invited you to collaborate on
        </ThemedText>
        <ThemedText type="subtitle">{preview.data.listName}</ThemedText>

        {state === "expired" && (
          <ThemedText themeColor="textSecondary">
            This invitation has expired.
          </ThemedText>
        )}
        {state === "revoked" && (
          <ThemedText themeColor="textSecondary">
            This invitation is no longer active.
          </ThemedText>
        )}
        {state === "accepted" && (
          <ThemedText themeColor="textSecondary">
            This invitation was already accepted.
          </ThemedText>
        )}

        <View style={styles.actions}>
          {canAccept ? (
            <Button
              onPress={handleAccept}
              disabled={acceptInvitation.isPending}
            >
              {acceptInvitation.isPending ? "Joining..." : "Accept invitation"}
            </Button>
          ) : null}
          <Pressable onPress={close} style={styles.closeButton}>
            <ThemedText type="default" style={styles.closeLabel}>
              Close
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    padding: Spacing.five,
    gap: Spacing.three,
    justifyContent: "center",
  },
  actions: {
    gap: Spacing.three,
    marginTop: Spacing.four,
  },
  closeButton: {
    alignItems: "center",
    paddingVertical: Spacing.two,
  },
  closeLabel: {
    fontWeight: "600",
  },
});
