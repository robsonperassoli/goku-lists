import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { EditableListTitle } from '@/components/editable-list-title';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const ICON_BUTTON_SIZE = 40;

type ListScreenHeaderProps = {
  list?: {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
  };
  remainingCount: number;
  hasCompleted: boolean;
  onBack: () => void;
  onMore: () => void;
};

function IconButton({
  onPress,
  accessibilityLabel,
  children,
}: {
  onPress: () => void;
  accessibilityLabel: string;
  children: ReactNode;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        { backgroundColor: theme.backgroundElement },
        pressed && styles.pressed,
      ]}
    >
      {children}
    </Pressable>
  );
}

function remainingLabel(remainingCount: number, hasCompleted: boolean): string | null {
  if (remainingCount > 0) {
    return remainingCount === 1 ? '1 remaining' : `${remainingCount} remaining`;
  }

  if (hasCompleted) {
    return 'All done';
  }

  return null;
}

export function ListScreenHeader({
  list,
  remainingCount,
  hasCompleted,
  onBack,
  onMore,
}: ListScreenHeaderProps) {
  const theme = useTheme();
  const subtitle = remainingLabel(remainingCount, hasCompleted);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <IconButton accessibilityLabel="Go back" onPress={onBack}>
          <SymbolView
            tintColor={theme.text}
            name={{
              ios: 'arrow.backward',
              android: 'arrow_back',
              web: 'arrow_back',
            }}
            size={20}
          />
        </IconButton>

        <IconButton accessibilityLabel="List options" onPress={onMore}>
          <SymbolView
            tintColor={theme.text}
            name={{
              ios: 'ellipsis',
              android: 'more_horiz',
              web: 'more_horiz',
            }}
            size={20}
          />
        </IconButton>
      </View>

      <EditableListTitle list={list} />

      {subtitle ? (
        <Text style={[styles.remaining, { color: theme.textSubtle }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  iconButton: {
    width: ICON_BUTTON_SIZE,
    height: ICON_BUTTON_SIZE,
    borderRadius: ICON_BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
  remaining: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.2,
    marginTop: Spacing.one,
  },
});
