import { useState, type RefObject } from "react";
import { StyleSheet } from "react-native";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";

import { Input } from "@/components/ui/input";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { AppSheet } from "@/components/ui/app-sheet";
import { Spacing } from "@/constants/theme";

interface CreateTaskSheetProps {
  ref: RefObject<BottomSheetModal | null>;
  onClose: () => void;
  onSubmit: (title: string) => void;
  isLoading?: boolean;
}

export function CreateTaskSheet({
  ref,
  onSubmit,
  isLoading,
}: CreateTaskSheetProps) {
  const [title, setTitle] = useState("");

  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit(title.trim());
      setTitle("");
    }
  };

  return (
    <AppSheet
      ref={ref}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      contentStyle={styles.form}
    >
      <ThemedText type="title" style={styles.title}>
        Add Item
      </ThemedText>

      <Input
        placeholder="Item name"
        value={title}
        onChangeText={setTitle}
        autoFocus
        onSubmitEditing={handleSubmit}
      />

      <Button onPress={handleSubmit} disabled={!title.trim() || isLoading}>
        {isLoading ? "Adding..." : "Add Item"}
      </Button>
    </AppSheet>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.three,
  },
  title: {
    marginBottom: Spacing.two,
  },
});
