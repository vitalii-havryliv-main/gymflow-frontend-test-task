import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../theme';

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder?: string;
};

export function Field({
  label,
  value,
  onChangeText,
  error,
  placeholder,
}: FieldProps) {
  const { theme } = useTheme();
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
        {label}
      </Text>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        style={[
          styles.input,
          {
            borderColor: theme.colors.border,
            color: theme.colors.textPrimary,
            backgroundColor: theme.colors.surface,
          },
          error && styles.inputError,
        ]}
        placeholderTextColor={theme.colors.textSecondary}
      />
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '600',
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  inputError: { borderColor: '#ef4444' },
  errorText: { color: '#ef4444', marginTop: 2 },
});
