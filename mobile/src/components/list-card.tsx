import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';
import { Spacing } from '@/constants/theme';

type ListCardProps = {
  id: string;
  name: string;
  description?: string | null;
};

export function ListCard({ name, description }: ListCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={() => console.log('Navigate to list:', name)}
    >
      <View style={styles.content}>
        <ThemedText type="default">{name}</ThemedText>
        {description && (
          <ThemedText type="small" themeColor="textSecondary">
            {description}
          </ThemedText>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  pressed: {
    opacity: 0.7,
  },
  content: {
    gap: Spacing.half,
  },
});
