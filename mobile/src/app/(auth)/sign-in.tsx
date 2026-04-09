import { authClient } from "@/lib/auth-client";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";

export default function SignIn() {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setLoading(true);

      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/(app)",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <ThemedView type="backgroundElement" style={styles.card}>
            <View style={styles.hero}>
              <View style={styles.badge}>
                <ThemedText style={styles.badgeText}>G</ThemedText>
              </View>

              <ThemedText type="title" style={styles.title}>
                Welcome back
              </ThemedText>

              <ThemedText themeColor="textSecondary" style={styles.subtitle}>
                Sign in with your Google account to continue to your lists.
              </ThemedText>
            </View>

            <Pressable
              onPress={handleSignIn}
              disabled={loading}
              style={({ pressed }) => [
                styles.googleButton,
                pressed && !loading && styles.googleButtonPressed,
                loading && styles.googleButtonDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#111827" />
              ) : (
                <>
                  <View style={styles.googleMark}>
                    <ThemedText style={styles.googleMarkText}>G</ThemedText>
                  </View>
                  <ThemedText style={styles.googleButtonText}>
                    Login with Google
                  </ThemedText>
                </>
              )}
            </Pressable>

            <ThemedText
              themeColor="textSecondary"
              type="small"
              style={styles.helper}
            >
              We will only use Google to securely sign you in.
            </ThemedText>
          </ThemedView>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.four,
  },
  card: {
    width: "100%",
    maxWidth: MaxContentWidth / 1.8,
    borderRadius: 28,
    padding: Spacing.five,
    gap: Spacing.four,
  },
  hero: {
    gap: Spacing.three,
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  badgeText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#4285F4",
  },
  title: {
    fontSize: 40,
    lineHeight: 44,
  },
  subtitle: {
    maxWidth: 420,
  },
  googleButton: {
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  googleButtonPressed: {
    opacity: 0.92,
  },
  googleButtonDisabled: {
    opacity: 0.7,
  },
  googleMark: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
  },
  googleMarkText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4285F4",
  },
  googleButtonText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "600",
  },
  helper: {
    textAlign: "center",
  },
});
