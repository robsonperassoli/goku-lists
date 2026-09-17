import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import {
  getListGradient,
  getListPillColor,
} from '@/lib/list-visuals';
import { Spacing } from '@/constants/theme';

const CARD_RADIUS = 28;
const TITLE_COLOR = '#1C1917';
const META_COLOR = 'rgba(28, 25, 23, 0.48)';

type ListCardProps = {
  id: string;
  name: string;
  remaining?: number;
  completed?: number;
};

function remainingLabel(remaining: number): string {
  if (remaining === 0) return 'Empty';
  if (remaining === 1) return '1 remaining';
  return `${remaining} remaining`;
}

function completedLabel(completed: number): string {
  return `${completed} Completed`;
}

export function ListCard({
  id,
  name,
  remaining = 0,
  completed = 0,
}: ListCardProps) {
  const router = useRouter();
  const gradient = getListGradient(id);
  const pillColor = getListPillColor(id);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() =>
        router.navigate({ pathname: '/(app)/[id]', params: { id } })
      }
    >
      <LinearGradient
        colors={[...gradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.topRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.name} numberOfLines={2}>
              {name}
            </Text>
            <Text style={styles.remaining}>{remainingLabel(remaining)}</Text>
          </View>

          <View style={[styles.pill, { backgroundColor: pillColor }]}>
            <Text style={styles.pillText}>{completedLabel(completed)}</Text>
          </View>
        </View>

        <View style={styles.arrowWrap}>
          <SymbolView
            tintColor={META_COLOR}
            name={{
              ios: 'arrow.up.right',
              android: 'north_east',
              web: 'north_east',
            }}
            size={18}
          />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.three,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
  },
  gradient: {
    minHeight: 120,
    paddingHorizontal: 22,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  titleBlock: {
    flex: 1,
    gap: 6,
  },
  name: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: TITLE_COLOR,
  },
  remaining: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
    color: META_COLOR,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: TITLE_COLOR,
  },
  arrowWrap: {
    alignSelf: 'flex-end',
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
});
