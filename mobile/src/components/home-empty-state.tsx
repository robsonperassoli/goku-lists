import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type HomeEmptyStateProps = {
  onAction: () => void;
};

export function HomeEmptyState({ onAction }: HomeEmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.cardStack}>
        <View
          style={[
            styles.ghostCard,
            styles.ghostCardBack,
            { backgroundColor: theme.emptyGhostBack },
          ]}
        />
        <View
          style={[
            styles.ghostCard,
            styles.ghostCardMid,
            { backgroundColor: theme.emptyGhostMid },
          ]}
        />
        <LinearGradient
          colors={[
            theme.emptyGhostGradientStart,
            theme.emptyGhostGradientMid,
            theme.emptyGhostGradientEnd,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.ghostCardFront, { borderColor: theme.emptyGhostBorder }]}
        >
          <Text style={[styles.ghostEmoji, { color: theme.emptyGhostEmoji }]}>
            ✦
          </Text>
          <Text style={[styles.ghostTitle, { color: theme.emptyGhostTitle }]}>
            Your first list
          </Text>
          <Text style={[styles.ghostHint, { color: theme.emptyGhostHint }]}>
            Tap + to begin collecting
          </Text>
        </LinearGradient>
      </View>

      <Pressable
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
          Create a list
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: Spacing.five,
    paddingBottom: Spacing.six,
    gap: Spacing.five,
  },
  cardStack: {
    width: '82%',
    height: 168,
    position: 'relative',
  },
  ghostCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: 32,
  },
  ghostCardBack: {
    top: 14,
    bottom: -8,
    opacity: 0.5,
    transform: [{ scale: 0.94 }],
  },
  ghostCardMid: {
    top: 7,
    bottom: -4,
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
  ghostCardFront: {
    flex: 1,
    borderRadius: 32,
    padding: 24,
    justifyContent: 'space-between',
    borderWidth: StyleSheet.hairlineWidth,
  },
  ghostEmoji: {
    fontSize: 40,
  },
  ghostTitle: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  ghostHint: {
    fontSize: 14,
    fontWeight: '500',
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
  },
});
