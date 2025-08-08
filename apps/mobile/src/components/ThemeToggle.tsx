import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';

export function ThemeToggle() {
  const { mode, toggleMode, theme } = useTheme();
  const isDark = mode === 'dark';
  const icon = isDark ? '🌙' : '☀️';

  return (
    <Pressable
      onPress={toggleMode}
      accessibilityRole="button"
      accessibilityLabel="Toggle theme"
      style={({ pressed }) => [
        styles.button,
        {
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.row}>
        <Text style={[styles.icon, { color: theme.colors.textPrimary }]}>
          {icon}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
  },
  pressed: { opacity: 0.7 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  icon: { fontSize: 16 },
});
