import { useState, useRef } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { TaskItem } from "@/components/task-item";
import { CreateTaskSheet } from "@/components/create-task-sheet";
import { ListOptionsSheet } from "@/components/list-options-sheet";
import { EditableListTitle } from "@/components/editable-list-title";
import { EmptyState } from "@/components/empty-state";
import { useTasks, useCreateTask, useUpdateTask } from "@/hooks/tasks";
import { useList, useDeleteList } from "@/hooks/lists";
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
  const listOptionsSheetRef = useRef<BottomSheetModal>(null);
  useBottomSheetBackHandler(createTaskSheetRef, listOptionsSheetRef);

  const { data: list } = useList(id);
  const { data: tasks } = useTasks(id);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteList = useDeleteList();

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

  const handleDeleteList = () => {
    if (!list) return;

    deleteList.mutate(list.id, {
      onSuccess: () => {
        listOptionsSheetRef.current?.close();
        router.back();
      },
    });
  };

  const openListOptions = () => listOptionsSheetRef.current?.present();

  const openCreateTaskSheet = () => createTaskSheetRef.current?.present();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
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

          <EditableListTitle list={list} />

          <Pressable onPress={openListOptions} style={styles.iconButton}>
            <SymbolView
              tintColor={theme.text}
              name={{
                ios: "ellipsis",
                android: "more_horiz",
                web: "more_horiz",
              }}
              size={24}
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
            <EmptyState message="No items yet" />
          )}
          ListFooterComponent={() => (
            <Pressable
              style={({ pressed }) => [
                styles.addItemRow,
                pressed && styles.pressed,
              ]}
              onPress={openCreateTaskSheet}
            >
              <SymbolView
                tintColor={theme.textSecondary}
                name={{
                  ios: "plus",
                  android: "add",
                  web: "add",
                }}
                size={20}
              />
              <ThemedText type="default" themeColor="textSecondary">
                Add item
              </ThemedText>
            </Pressable>
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

      <ListOptionsSheet
        ref={listOptionsSheetRef}
        listName={list?.name ?? ""}
        onDelete={handleDeleteList}
        isDeleting={deleteList.isPending}
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
    gap: Spacing.two,
  },
  iconButton: {
    padding: Spacing.one,
  },
  pressed: {
    opacity: 0.7,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: Spacing.three,
  },
  addItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
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
