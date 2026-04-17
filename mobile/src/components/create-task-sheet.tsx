import React, { useState } from "react";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { StyleSheet } from "react-native";
import { RefObject } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "@/components/ui/input";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

interface CreateTaskSheetProps {
  ref: RefObject<BottomSheetModal | null>;
  onClose: () => void;
  onSubmit: (title: string) => void;
  isLoading?: boolean;
}

export function CreateTaskSheet({ ref, onClose, onSubmit, isLoading }: CreateTaskSheetProps) {
  const theme = useTheme();
  const [title, setTitle] = useState("");

  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit(title.trim());
      setTitle("");
    }
  };

  return (
    <BottomSheetModal
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      ref={ref}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          opacity={0.7}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      )}
      backgroundStyle={{
        backgroundColor: theme.surfaceHigh,
      }}
      handleIndicatorStyle={{ backgroundColor: theme.backgroundSelected }}
    >
      <BottomSheetView>
        <SafeAreaView style={styles.form}>
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
        </SafeAreaView>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  form: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  title: {
    marginBottom: Spacing.two,
  },
});