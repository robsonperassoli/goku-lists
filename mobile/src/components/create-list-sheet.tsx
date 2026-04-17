import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { StyleSheet } from "react-native";
import { RefObject } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Spacing } from "@/constants/theme";
import { useCreateListForm } from "@/hooks/use-create-list-form";
import { useTheme } from "@/hooks/use-theme";

interface CreateListSheetProps {
  ref: RefObject<BottomSheetModal | null>;
  onClose: () => void;
}

export function CreateListSheet({ ref, onClose }: CreateListSheetProps) {
  const theme = useTheme();
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
  textarea: {
    minHeight: 80,
  },
});
