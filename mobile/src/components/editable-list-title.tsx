import { useEffect, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useUpdateList } from "@/hooks/lists";
import { useTheme } from "@/hooks/use-theme";

type EditableListTitleProps = {
  list?: {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
  };
};

export function EditableListTitle({ list }: EditableListTitleProps) {
  const theme = useTheme();
  const updateList = useUpdateList();

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!isEditing && list?.name) {
      setDraft(list.name);
    }
  }, [list?.name, isEditing]);

  const save = () => {
    const trimmed = draft.trim();

    if (!trimmed || !list) {
      setDraft(list?.name ?? "");
      setIsEditing(false);
      return;
    }

    if (trimmed !== list.name) {
      updateList.mutate({
        id: list.id,
        name: trimmed,
        description: list.description ?? undefined,
        image: list.image ?? undefined,
      });
    }

    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      {isEditing ? (
        <TextInput
          style={[styles.titleText, styles.input, { color: theme.text }]}
          value={draft}
          onChangeText={setDraft}
          onBlur={save}
          onSubmitEditing={save}
          autoFocus
          selectTextOnFocus
          returnKeyType="done"
        />
      ) : (
        <Pressable
          onPress={() => setIsEditing(true)}
          style={({ pressed }) => [
            styles.titleFrame,
            pressed && styles.pressed,
          ]}
        >
          <ThemedText style={styles.titleText}>{list?.name ?? ""}</ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleFrame: {
    minHeight: 44,
    justifyContent: "center",
  },
  titleText: {
    fontSize: 32,
    lineHeight: 44,
    fontWeight: "700",
  },
  input: {
    minHeight: 44,
    padding: 0,
    margin: 0,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  pressed: {
    opacity: 0.7,
  },
});
