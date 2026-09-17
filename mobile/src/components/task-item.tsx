import { Pressable, StyleSheet, View } from 'react-native';

import { EditableTaskTitle } from './editable-task-title';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface TaskItemProps {
  task: {
    id: string;
    title: string;
    notes: string | null;
    completedAt: Date | null;
    position: number | null;
  };
  onToggle: (task: TaskItemProps['task']) => void;
  accentColor: string;
  showSeparator?: boolean;
}

export function TaskItem({
  task,
  onToggle,
  accentColor,
  showSeparator = false,
}: TaskItemProps) {
  const theme = useTheme();
  const isCompleted = !!task.completedAt;

  return (
    <View>
      <View style={styles.container}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isCompleted }}
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
                backgroundColor: accentColor,
                borderColor: accentColor,
              },
            ]}
          >
            {isCompleted && <View style={styles.checkmark} />}
          </View>
        </Pressable>

        <EditableTaskTitle task={task} isCompleted={isCompleted} />
      </View>

      {showSeparator ? (
        <View
          style={[styles.separator, { backgroundColor: theme.groupSeparator }]}
        />
      ) : null}
    </View>
  );
}

const CHECKBOX_SIZE = 22;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  checkboxButton: {
    padding: Spacing.one,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
  checkbox: {
    width: CHECKBOX_SIZE,
    height: CHECKBOX_SIZE,
    borderRadius: CHECKBOX_SIZE / 2,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    width: 9,
    height: 5,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#fff',
    transform: [{ rotate: '-45deg' }],
    marginTop: -2,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft:
      Spacing.four + Spacing.one + CHECKBOX_SIZE + Spacing.one + Spacing.three,
    marginRight: Spacing.four,
  },
});
