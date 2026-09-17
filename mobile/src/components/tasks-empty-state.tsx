import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TasksEmptyStateProps = {
  onAction: () => void;
};

export function TasksEmptyState({ onAction }: TasksEmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.emptyGhostTitle }]}>
        Nothing here yet
      </Text>
      <Text style={[styles.hint, { color: theme.emptyGhostHint }]}>
        Add a first item to get going
      </Text>
      <Pressable
        accessibilityLabel="Add item"
        accessibilityRole="button"
        onPress={onAction}
        style={({ pressed }) => [
          styles.cta,
          {
            backgroundColor: theme.emptyCtaBackground,
            borderColor: theme.emptyCtaBorder,
          },
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.ctaText, { color: theme.emptyCtaText }]}>
          Add item
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: Spacing.five,
    paddingBottom: Spacing.five,
    gap: Spacing.two,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  hint: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: Spacing.three,
  },
  cta: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
