import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { Fonts, Spacing } from '@/constants/theme';
import { authClient } from '@/lib/auth-client';
import { useTheme } from '@/hooks/use-theme';

function getTimeBasedGreeting(date = new Date()): string {
  const hour = date.getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

function getDayLabel(date = new Date()): string {
  return date.toLocaleDateString(undefined, { weekday: 'long' }).toUpperCase();
}

interface HomeHeaderProps {
  onAddPress: () => void;
  listCount?: number;
}

const ADD_BUTTON_SIZE = 72;

export function HomeHeader({ onAddPress, listCount = 0 }: HomeHeaderProps) {
  const theme = useTheme();
  const { data: session } = authClient.useSession();
  const firstName = session?.user?.name?.split(' ')[0] ?? 'there';
  const greeting = getTimeBasedGreeting();
  const dayLabel = getDayLabel();

  const addButtonShadow: ViewStyle['boxShadow'] = [
    {
      offsetX: 0,
      offsetY: 12,
      blurRadius: 32,
      spreadDistance: -4,
      color: theme.addButtonShadowLight,
    },
    {
      offsetX: 0,
      offsetY: 4,
      blurRadius: 12,
      spreadDistance: 0,
      color: theme.addButtonShadowDark,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        <Text style={[styles.dayLabel, { color: theme.textLabel }]}>{dayLabel}</Text>
        <Text style={[styles.greeting, { color: theme.textGreeting }]}>
          {greeting},
        </Text>
        <Text style={[styles.name, { color: theme.text }]}>{firstName}</Text>
        {listCount > 0 ? (
          <Text style={[styles.subtitle, { color: theme.textSubtle }]}>
            {listCount} {listCount === 1 ? 'collection' : 'collections'}
          </Text>
        ) : null}
      </View>

      <View>
        <Pressable
          accessibilityLabel="Add list"
          accessibilityRole="button"
          onPress={onAddPress}
          style={({ pressed }) => [
            styles.addButton,
            { boxShadow: addButtonShadow },
            pressed && styles.pressed,
          ]}
        >
          <LinearGradient
            colors={[theme.addButtonGradientStart, theme.addButtonGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.addGradient, { borderColor: theme.addButtonBorder }]}
          >
            <SymbolView
              tintColor={theme.addButtonIcon}
              name={{
                ios: 'plus',
                android: 'add',
                web: 'add',
              }}
              size={32}
              weight="medium"
            />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.two,
    paddingBottom: Spacing.five,
    minHeight: 180,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textBlock: {
    maxWidth: '72%',
    gap: 2,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.4,
    marginBottom: Spacing.two,
    fontFamily: Fonts.mono,
  },
  greeting: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  name: {
    fontSize: 48,
    lineHeight: 52,
    fontWeight: '700',
    letterSpacing: -1.5,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: Spacing.two,
    letterSpacing: 0.2,
  },
  addButton: {
    width: ADD_BUTTON_SIZE,
    height: ADD_BUTTON_SIZE,
    borderRadius: ADD_BUTTON_SIZE / 2,
  },
  addGradient: {
    flex: 1,
    borderRadius: ADD_BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
});
