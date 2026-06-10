import { LinearGradient } from 'expo-linear-gradient';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { useRouter } from 'expo-router';

import {
  getCardHeight,
  getListEmoji,
  getListPalette,
} from '@/lib/list-visuals';
import { useTheme } from '@/hooks/use-theme';

const CARD_BORDER_RADIUS = 32;

type ListCardProps = {
  id: string;
  name: string;
  image?: string | null;
  index: number;
  itemCount?: number;
};

function getCardShadow(glow: string, cardShadow: string): ViewStyle['boxShadow'] {
  return [
    {
      offsetX: 0,
      offsetY: 16,
      blurRadius: 40,
      spreadDistance: -8,
      color: `${glow}55`,
    },
    {
      offsetX: 0,
      offsetY: 8,
      blurRadius: 24,
      spreadDistance: -4,
      color: cardShadow,
    },
  ];
}

export function ListCard({
  id,
  name,
  image,
  index,
  itemCount = 0,
}: ListCardProps) {
  const router = useRouter();
  const theme = useTheme();
  const palette = getListPalette(id);
  const emoji = getListEmoji(id, image);
  const height = getCardHeight(index);
  const shadow = getCardShadow(palette.glow, theme.cardShadow);

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.stackLayer,
          styles.stackLayerBack,
          {
            backgroundColor: palette.colors[0],
            boxShadow: shadow,
          },
        ]}
      />
      <View
        style={[
          styles.stackLayer,
          styles.stackLayerMid,
          { backgroundColor: palette.colors[1] },
        ]}
      />

      <Pressable
        style={({ pressed }) => [
          styles.card,
          { height, boxShadow: shadow },
          pressed && styles.pressed,
        ]}
        onPress={() =>
          router.navigate({ pathname: '/(app)/[id]', params: { id } })
        }
      >
        <LinearGradient
          colors={[...palette.colors]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View
            style={[
              styles.glowOrb,
              { backgroundColor: palette.glow, shadowColor: palette.glow },
            ]}
          />
          <View
            style={[styles.glowOrbSmall, { backgroundColor: palette.accent }]}
          />

          <View style={styles.content}>
            <View style={styles.topRow}>
              <Text
                style={[styles.emoji, { textShadowColor: theme.cardEmojiShadow }]}
              >
                {emoji}
              </Text>
              <View
                style={[
                  styles.countBadge,
                  {
                    backgroundColor: theme.cardBadgeBackground,
                    borderColor: theme.cardBadgeBorder,
                  },
                ]}
              >
                <Text style={[styles.countText, { color: theme.cardTextMuted }]}>
                  {itemCount === 0 ? 'empty' : `${itemCount} open`}
                </Text>
              </View>
            </View>

            <View style={styles.titleBlock}>
              <Text
                style={[
                  styles.name,
                  {
                    color: theme.cardText,
                    textShadowColor: theme.cardTitleShadow,
                  },
                ]}
                numberOfLines={2}
              >
                {name}
              </Text>
            </View>
          </View>

          <View
            style={[styles.glassEdge, { backgroundColor: theme.cardGlassEdge }]}
          />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 28,
    position: 'relative',
  },
  stackLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: CARD_BORDER_RADIUS,
  },
  stackLayerBack: {
    top: 10,
    bottom: -6,
    opacity: 0.35,
    transform: [{ scale: 0.96 }],
  },
  stackLayerMid: {
    top: 5,
    bottom: -3,
    opacity: 0.2,
    transform: [{ scale: 0.98 }],
  },
  card: {
    borderRadius: CARD_BORDER_RADIUS,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 22,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  glowOrb: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    top: -40,
    right: -30,
    opacity: 0.35,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
  },
  glowOrbSmall: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    bottom: -20,
    left: 20,
    opacity: 0.12,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  emoji: {
    fontSize: 44,
    lineHeight: 52,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  countBadge: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  countText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  titleBlock: {
    paddingRight: 48,
  },
  name: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  glassEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
});
