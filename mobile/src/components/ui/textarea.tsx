import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { type TextInputProps } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type TextareaProps = TextInputProps & {
  error?: string;
};

export function Textarea({ error, placeholder, value, onChangeText, style, ...rest }: TextareaProps) {
  const theme = useTheme();

  return (
    <ThemedView
      type="backgroundElement"
      style={{
        borderRadius: Spacing.two,
        borderWidth: 1,
        borderColor: error ? '#ef4444' : theme.backgroundSelected,
        paddingHorizontal: Spacing.three,
        paddingVertical: Spacing.two,
        minHeight: 100,
      }}>
      <BottomSheetTextInput
        style={[{ fontSize: 16, padding: 0, minHeight: 80, color: theme.text }, style]}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        value={value}
        onChangeText={onChangeText}
        multiline
        textAlignVertical="top"
        {...rest}
      />
    </ThemedView>
  );
}