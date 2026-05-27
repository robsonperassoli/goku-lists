import { useEffect, useState } from "react";
import { StyleSheet, useColorScheme, View } from "react-native";

import { Colors } from "@/constants/theme";

export function AnimatedSplashOverlay() {
  const [visible, setVisible] = useState(true);
  const colorScheme = useColorScheme();
  const backgroundColor =
    Colors[colorScheme === "dark" ? "dark" : "light"].background;

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(false), 300);
    return () => clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  return <View style={[styles.overlay, { backgroundColor }]} />;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
});
