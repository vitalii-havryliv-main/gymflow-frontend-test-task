import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

type ButtonVariant = 'primary' | 'danger';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
};

export function Button({ title, onPress, variant = 'primary', disabled }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.danger,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: '#111827' },
  danger: { backgroundColor: '#ef4444' },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  text: { color: 'white', textAlign: 'center' },
});

