import { FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ListCard } from "@/components/list-card";
import { EmptyState } from "@/components/empty-state";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useLists } from "@/hooks/lists";
import { authClient } from "@/lib/auth-client";
import { BottomTabInset, Spacing } from "@/constants/theme";
import type { List } from "@/db/schema";

export default function HomeScreen() {
  const { data: lists } = useLists();
  const { data: session } = authClient.useSession();

  const userName = session?.user?.name ?? session?.user?.email ?? "User";

  const renderItem = ({ item }: { item: List }) => (
    <ListCard id={item.id} name={item.name} description={item.description} />
  );

  const renderEmpty = () => (
    <EmptyState
      message="No lists yet"
      actionLabel="Create List"
      onAction={() => console.log("Create list")}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="title">Welcome {userName}</ThemedText>
        </View>

        <FlatList
          data={lists}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: BottomTabInset,
  },
});
