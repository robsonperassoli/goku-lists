import { type ReactNode } from "react";
import { Pressable, StyleSheet, Text, type ViewStyle } from "react-native";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export type ButtonProps = {
  disabled?: boolean;
  style?: ViewStyle;
  children: ReactNode;
  onPress?: () => void;
};

export function Button({ disabled, style, children, onPress }: ButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      style={(state) => [
        styles.button,
        { backgroundColor: disabled ? theme.backgroundSelected : theme.text },
        state.pressed && !disabled && styles.pressed,
        style,
      ]}
      disabled={disabled}
      onPress={onPress}
    >
      <Text style={[styles.text, { color: disabled ? theme.textSecondary : theme.background }]}>
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.two,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.8,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
});
