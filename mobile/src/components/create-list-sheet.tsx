import { StyleSheet } from "react-native";
import { RefObject } from "react";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { AppSheet } from "@/components/ui/app-sheet";
import { Spacing } from "@/constants/theme";
import { useCreateListForm } from "@/hooks/use-create-list-form";

interface CreateListSheetProps {
  ref: RefObject<BottomSheetModal | null>;
  onClose: () => void;
}

export function CreateListSheet({ ref, onClose }: CreateListSheetProps) {
  const {
    name,
    setName,
    description,
    setDescription,
    error,
    handleSubmit,
    isLoading,
  } = useCreateListForm(onClose);

  return (
    <AppSheet
      ref={ref}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      contentStyle={styles.form}
    >
      <ThemedText type="title" style={styles.title}>
        Create New List
      </ThemedText>

      <Input
        placeholder="List name"
        value={name}
        onChangeText={setName}
        error={error ?? undefined}
        autoFocus
      />

      <Textarea
        placeholder="Description (optional)"
        value={description}
        onChangeText={setDescription}
        numberOfLines={3}
        style={styles.textarea}
      />

      <Button onPress={handleSubmit} disabled={!name.trim() || isLoading}>
        {isLoading ? "Creating..." : "Create List"}
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
  textarea: {
    minHeight: 80,
  },
});
