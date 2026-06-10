import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

const GRAIN_DOTS = Array.from({ length: 96 }, (_, i) => ({
  top: `${((i * 17 + 13) % 97) + 1}%` as `${number}%`,
  left: `${((i * 23 + 7) % 97) + 1}%` as `${number}%`,
  opacity: 0.018 + (i % 6) * 0.006,
  size: i % 3 === 0 ? 1.5 : 1,
}));

export function GrainOverlay() {
  const theme = useTheme();

  return (
    <View style={styles.container} pointerEvents="none">
      {GRAIN_DOTS.map((dot, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              top: dot.top,
              left: dot.left,
              opacity: dot.opacity,
              width: dot.size,
              height: dot.size,
              backgroundColor: theme.grain,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  dot: {
    position: 'absolute',
    borderRadius: 1,
  },
});
