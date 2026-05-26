import { useState, type RefObject } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";

import { ThemedText } from "@/components/themed-text";
import { AppSheet } from "@/components/ui/app-sheet";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { SymbolView } from "expo-symbols";

interface ListOptionsSheetProps {
  ref: RefObject<BottomSheetModal | null>;
  listName: string;
  onDelete: () => void;
  isDeleting?: boolean;
}

export function ListOptionsSheet({
  ref,
  listName,
  onDelete,
  isDeleting,
}: ListOptionsSheetProps) {
  const theme = useTheme();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <AppSheet
      ref={ref}
      enableDynamicSizing
      onDismiss={() => setConfirmingDelete(false)}
      contentStyle={styles.content}
    >
      {confirmingDelete ? (
        <View style={styles.confirm}>
          <ThemedText type="title">Delete list?</ThemedText>
          <ThemedText themeColor="textSecondary">
            {listName} and all its items will be deleted.
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
      ) : (
        <View style={styles.menu}>
          <ThemedText
            type="small"
            themeColor="textSecondary"
            style={styles.listName}
          >
            {listName}
          </ThemedText>
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
