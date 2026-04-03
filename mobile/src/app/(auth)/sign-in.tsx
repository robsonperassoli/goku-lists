import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { Button, Text, View } from "react-native";

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
    <View>
      <Text>hello here</Text>
      <Text>hello here</Text>
      <Text>hello here</Text>
      <Text>hello here</Text>
      <Text>hello here</Text>
      <Button title="Sign In" onPress={handleSignIn} disabled={loading} />
    </View>
  );
}
