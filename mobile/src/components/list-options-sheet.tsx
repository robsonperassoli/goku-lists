import { useState, type RefObject } from "react";
import {
  Alert,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  View,
} from "react-native";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";

import { ThemedText } from "@/components/themed-text";
import { AppSheet } from "@/components/ui/app-sheet";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { SymbolView } from "expo-symbols";
import { invitationLink } from "@/api";
import { isOnline } from "@/lib/network";
import type { ListMemberRole } from "@/db/schema";

interface ListOptionsSheetProps {
  ref: RefObject<BottomSheetModal | null>;
  listName: string;
  role: ListMemberRole | null | undefined;
  onDelete: () => void;
  onLeave: () => void;
  onCreateInvitation: () => Promise<{ token: string }>;
  isDeleting?: boolean;
  isLeaving?: boolean;
  isSharing?: boolean;
}

export function ListOptionsSheet({
  ref,
  listName,
  role,
  onDelete,
  onLeave,
  onCreateInvitation,
  isDeleting,
  isLeaving,
  isSharing,
}: ListOptionsSheetProps) {
  const theme = useTheme();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const isOwner = role === "owner" || role == null;
  const isContributor = role === "contributor";

  const handleShare = async () => {
    const online = await isOnline();
    if (!online) {
      Alert.alert(
        "You're offline",
        "Connect to the internet to create an invitation link.",
      );
      return;
    }

    try {
      const invitation = await onCreateInvitation();
      const link = invitationLink(invitation.token);
      const text = `Join my list "${listName}" on Goku Lists:`;

      if (Platform.OS === "ios") {
        await Share.share({
          title: `Join ${listName}`,
          message: text,
          url: link,
        });
      } else {
        await Share.share({
          message: `${text}\n\n${link}`,
        });
      }
    } catch {
      Alert.alert("Could not create invitation", "Please try again.");
    }
  };

  return (
    <AppSheet
      ref={ref}
      enableDynamicSizing
      onDismiss={() => {
        setConfirmingDelete(false);
        setConfirmingLeave(false);
      }}
      contentStyle={styles.content}
    >
      {confirmingDelete ? (
        <View style={styles.confirm}>
          <ThemedText type="title">Delete list?</ThemedText>
          <ThemedText themeColor="textSecondary">
            {listName} and all its items will be deleted for everyone.
          </ThemedText>
          <View style={styles.confirmActions}>
            <Pressable
              style={({ pressed }) => [
                styles.confirmButton,
                { backgroundColor: theme.backgroundElement },
                pressed && styles.pressed,
              ]}
              onPress={() => setConfirmingDelete(false)}
              disabled={isDeleting}
            >
              <ThemedText type="default" style={styles.confirmButtonText}>
                Cancel
              </ThemedText>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.confirmButton,
                styles.deleteButton,
                pressed && styles.pressed,
                isDeleting && styles.disabled,
              ]}
              onPress={onDelete}
              disabled={isDeleting}
            >
              <ThemedText style={styles.deleteButtonText}>
                {isDeleting ? "Deleting..." : "Delete"}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      ) : confirmingLeave ? (
        <View style={styles.confirm}>
          <ThemedText type="title">Leave list?</ThemedText>
          <ThemedText themeColor="textSecondary">
            You will lose access to {listName} on this device.
          </ThemedText>
          <View style={styles.confirmActions}>
            <Pressable
              style={({ pressed }) => [
                styles.confirmButton,
                { backgroundColor: theme.backgroundElement },
                pressed && styles.pressed,
              ]}
              onPress={() => setConfirmingLeave(false)}
              disabled={isLeaving}
            >
              <ThemedText type="default" style={styles.confirmButtonText}>
                Cancel
              </ThemedText>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.confirmButton,
                styles.deleteButton,
                pressed && styles.pressed,
                isLeaving && styles.disabled,
              ]}
              onPress={onLeave}
              disabled={isLeaving}
            >
              <ThemedText style={styles.deleteButtonText}>
                {isLeaving ? "Leaving..." : "Leave"}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.menu}>
          <ThemedText
            type="small"
            themeColor="textSecondary"
            style={styles.listName}
          >
            {listName}
          </ThemedText>
          {isOwner ? (
            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.pressed,
                isSharing && styles.disabled,
              ]}
              onPress={() => void handleShare()}
              disabled={isSharing}
            >
              <SymbolView
                tintColor={theme.text}
                name={{
                  ios: "person.badge.plus",
                  android: "person_add",
                  web: "person_add",
                }}
                size={20}
              />
              <ThemedText style={styles.menuLabel}>
                {isSharing ? "Creating link..." : "Share list"}
              </ThemedText>
            </Pressable>
          ) : null}
          {isOwner ? (
            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.pressed,
              ]}
              onPress={() => setConfirmingDelete(true)}
            >
              <SymbolView
                tintColor="#ef4444"
                name={{
                  ios: "trash",
                  android: "delete",
                  web: "delete",
                }}
                size={20}
              />
              <ThemedText style={styles.deleteLabel}>Delete list</ThemedText>
            </Pressable>
          ) : null}
          {isContributor ? (
            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.pressed,
              ]}
              onPress={() => setConfirmingLeave(true)}
            >
              <SymbolView
                tintColor="#ef4444"
                name={{
                  ios: "rectangle.portrait.and.arrow.right",
                  android: "logout",
                  web: "logout",
                }}
                size={20}
              />
              <ThemedText style={styles.deleteLabel}>Leave list</ThemedText>
            </Pressable>
          ) : null}
        </View>
      )}
    </AppSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: Spacing.five,
  },
  menu: {
    gap: Spacing.two,
  },
  listName: {
    marginBottom: Spacing.one,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  deleteLabel: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "500",
  },
  confirm: {
    gap: Spacing.three,
  },
  confirmActions: {
    flexDirection: "row",
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
  },
  deleteButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.7,
  },
});
