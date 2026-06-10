import { Pressable, StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { authClient } from "@/lib/auth-client";

const ADD_BUTTON_SIZE = 48;

function getTimeBasedGreeting(date = new Date()): string {
  const hour = date.getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

interface HomeHeaderProps {
  onAddPress: () => void;
}

export function HomeHeader({ onAddPress }: HomeHeaderProps) {
  const theme = useTheme();
  const { data: session } = authClient.useSession();
  const firstName = session?.user?.name?.split(" ")[0] ?? "User";
  const greeting = getTimeBasedGreeting();

  return (
    <View style={styles.container}>
      <View>
        <ThemedText
          type="small"
          themeColor="textSecondary"
          style={styles.greeting}
        >
          {greeting}! <Text style={styles.waveIcon}>👋</Text>
        </ThemedText>
        <ThemedText style={styles.name}>{firstName}</ThemedText>
      </View>
      <Pressable
        accessibilityLabel="Add list"
        accessibilityRole="button"
        onPress={onAddPress}
        style={({ pressed }) => [
          styles.addButton,
          { backgroundColor: theme.text },
          pressed && styles.pressed,
        ]}
      >
        <SymbolView
          tintColor={theme.background}
          name={{
            ios: "plus",
            android: "add",
            web: "add",
          }}
          size={24}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  greeting: {
    marginBottom: Spacing.half,
  },
  waveIcon: {
    fontSize: 16,
  },
  name: {
    fontSize: 36,
    fontWeight: "600",
    lineHeight: 48,
  },
  addButton: {
    width: ADD_BUTTON_SIZE,
    height: ADD_BUTTON_SIZE,
    borderRadius: ADD_BUTTON_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.8,
  },
});
