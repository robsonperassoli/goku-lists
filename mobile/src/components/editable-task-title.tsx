import { useEffect, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useUpdateTask } from "@/hooks/tasks";
import { useTheme } from "@/hooks/use-theme";

type EditableTaskTitleProps = {
  task: {
    id: string;
    title: string;
    notes: string | null;
    completedAt: Date | null;
    position: number | null;
  };
  isCompleted?: boolean;
};

export function EditableTaskTitle({ task, isCompleted }: EditableTaskTitleProps) {
  const theme = useTheme();
  const updateTask = useUpdateTask();

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!isEditing) {
      setDraft(task.title);
    }
  }, [task.title, isEditing]);

  const save = () => {
    const trimmed = draft.trim();

    if (!trimmed) {
      setDraft(task.title);
      setIsEditing(false);
      return;
    }

    if (trimmed !== task.title) {
      updateTask.mutate({
        id: task.id,
        title: trimmed,
        notes: task.notes ?? undefined,
        completedAt: task.completedAt,
        position: task.position ?? 0,
      });
    }

    setIsEditing(false);
  };

  const completedTextStyle = isCompleted && !isEditing
    ? { textDecorationLine: "line-through" as const, color: theme.textSecondary }
    : undefined;

  return (
    <View style={styles.container}>
      {isEditing ? (
        <TextInput
          style={[styles.titleText, styles.input, { color: theme.text }]}
          value={draft}
          onChangeText={setDraft}
          onBlur={save}
          onSubmitEditing={save}
          autoFocus
          selectTextOnFocus
          returnKeyType="done"
        />
      ) : (
        <Pressable
          onPress={() => setIsEditing(true)}
          style={({ pressed }) => [
            styles.titleFrame,
            pressed && styles.pressed,
          ]}
        >
          <ThemedText style={[styles.titleText, completedTextStyle]}>
            {task.title}
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleFrame: {
    minHeight: 24,
    justifyContent: "center",
  },
  titleText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
  },
  input: {
    minHeight: 24,
    padding: 0,
    margin: 0,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  pressed: {
    opacity: 0.7,
  },
});
