import { useState, useRef } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { TaskItem } from "@/components/task-item";
import { CreateTaskSheet } from "@/components/create-task-sheet";
import { EmptyState } from "@/components/empty-state";
import { useTasks, useCreateTask, useUpdateTask } from "@/hooks/tasks";
import { useList } from "@/hooks/lists";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import useBottomSheetBackHandler from "@/hooks/use-bottom-sheet-back-handler";
import * as Crypto from "expo-crypto";
import { SymbolView } from "expo-symbols";

export default function ListItems() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();

  const createTaskSheetRef = useRef<BottomSheetModal>(null);
  useBottomSheetBackHandler(createTaskSheetRef);

  const { data: list } = useList(id);
  const { data: tasks } = useTasks(id);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const [showCompleted, setShowCompleted] = useState(false);

  const incompleteTasks = tasks?.filter((t) => !t.completedAt) ?? [];
  const completedTasks = tasks?.filter((t) => t.completedAt) ?? [];

  const handleToggleTask = (task: {
    id: string;
    title: string;
    notes: string | null;
    completedAt: Date | null;
    position: number | null;
  }) => {
    updateTask.mutate({
      id: task.id,
      title: task.title,
      notes: task.notes ?? undefined,
      completedAt: task.completedAt ? null : new Date(),
      position: task.position ?? 0,
    });
  };

  const handleCreateTask = (title: string) => {
    createTask.mutate(
      { id: Crypto.randomUUID(), listId: id, title },
      {
        onSuccess: () => {
          createTaskSheetRef.current?.close();
        },
      },
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <SymbolView
              tintColor={theme.text}
              name={{
                ios: "arrow.backward",
                android: "arrow_back",
                web: "arrow_back",
              }}
              size={24}
            />
          </Pressable>

          <ThemedText type="subtitle" style={styles.title}>
            {list?.name.toUpperCase()}
          </ThemedText>

          <Pressable
            style={[styles.addButton, { backgroundColor: theme.text }]}
            onPress={() => createTaskSheetRef.current?.present()}
          >
            <SymbolView
              tintColor={theme.background}
              name={{
                ios: "plus",
                android: "add",
                web: "add",
              }}
              size={12}
            />
          </Pressable>
        </View>

        <FlatList
          data={incompleteTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskItem task={item} onToggle={handleToggleTask} />
          )}
          ListEmptyComponent={() => (
            <EmptyState
              message="No items yet"
              actionLabel="Add Item"
              onAction={() => createTaskSheetRef.current?.present()}
            />
          )}
          contentContainerStyle={styles.listContent}
        />

        {completedTasks.length > 0 && (
          <Pressable
            style={styles.completedHeader}
            onPress={() => setShowCompleted(!showCompleted)}
          >
            <ThemedText type="default" style={styles.completedTitle}>
              Completed ({completedTasks.length})
            </ThemedText>
          </Pressable>
        )}

        {showCompleted && (
          <FlatList
            data={completedTasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TaskItem task={item} onToggle={handleToggleTask} />
            )}
          />
        )}
      </SafeAreaView>

      <CreateTaskSheet
        ref={createTaskSheetRef}
        onClose={() => createTaskSheetRef.current?.close()}
        onSubmit={handleCreateTask}
        isLoading={createTask.isPending}
      />
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.three,
  },
  backButton: {
    padding: Spacing.one,
  },
  title: {
    flex: 1,
    fontWeight: "bold",
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: Spacing.three,
  },
  completedHeader: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ccc",
  },
  completedTitle: {
    fontWeight: "bold",
  },
});
