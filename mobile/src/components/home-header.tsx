import { Pressable, StyleSheet, View, Text } from "react-native";
import { Spacing } from "@/constants/theme";
import { authClient } from "@/lib/auth-client";

interface HomeHeaderProps {
  onAddPress: () => void;
}

export function HomeHeader({ onAddPress }: HomeHeaderProps) {
  const { data: session } = authClient.useSession();
  const firstName = session?.user?.name?.split(" ")[0] ?? "User";

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.welcome}>Welcome</Text>
        <Text style={styles.name}>{firstName}</Text>
      </View>
      <Pressable
        onPress={onAddPress}
        style={styles.button}
        hitSlop={8}>
        <Text style={styles.buttonText}>+ Add List</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  welcome: {
    fontSize: 16,
    color: "#666",
  },
  name: {
    fontSize: 28,
    fontWeight: "700",
  },
  button: {
    height: 56,
    justifyContent: "center",
    paddingHorizontal: Spacing.two,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3c87f7",
  },
});