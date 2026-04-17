import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "./themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
interface TaskItemProps {
  task: {
    id: string;
    title: string;
    notes: string | null;
    completedAt: Date | null;
    position: number | null;
  };
  onToggle: (task: TaskItemProps["task"]) => void;
}

export function TaskItem({ task, onToggle }: TaskItemProps) {
  const theme = useTheme();
  const isCompleted = !!task.completedAt;

  const handlePress = () => {
    onToggle(task);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={handlePress}
    >
      <View
        style={[
          styles.checkbox,
          { borderColor: theme.textSecondary },
          isCompleted && { backgroundColor: theme.text, borderColor: theme.text },
        ]}
      >
        {isCompleted && (
          <View style={styles.checkmark} />
        )}
      </View>
      <ThemedText
        type="default"
        style={[
          styles.title,
          isCompleted && { textDecorationLine: "line-through", color: theme.textSecondary },
        ]}
      >
        {task.title}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmark: {
    width: 10,
    height: 6,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#fff",
    transform: [{ rotate: "-45deg" }],
    marginTop: -2,
  },
  title: {
    flex: 1,
  },
});