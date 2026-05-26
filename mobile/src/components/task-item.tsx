import { Pressable, StyleSheet, View } from "react-native";

import { EditableTaskTitle } from "./editable-task-title";
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

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.checkboxButton,
          pressed && styles.pressed,
        ]}
        onPress={() => onToggle(task)}
        hitSlop={8}
      >
        <View
          style={[
            styles.checkbox,
            { borderColor: theme.textSecondary },
            isCompleted && {
              backgroundColor: theme.text,
              borderColor: theme.text,
            },
          ]}
        >
          {isCompleted && <View style={styles.checkmark} />}
        </View>
      </Pressable>

      <EditableTaskTitle task={task} isCompleted={isCompleted} />
    </View>
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
  checkboxButton: {
    padding: Spacing.one,
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
});
