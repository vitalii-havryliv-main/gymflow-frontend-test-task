import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Role = 'STAFF' | 'MEMBER';

type Props = {
  value: Role;
  onChange: (role: Role) => void;
  error?: string;
};

export function RoleSelector({ value, onChange, error }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {(['STAFF', 'MEMBER'] as const).map((r) => (
          <Pressable
            key={r}
            onPress={() => onChange(r)}
            style={({ pressed }) => [
              styles.button,
              value === r ? styles.buttonActive : styles.buttonInactive,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: value === r }}
          >
            <Text>{r}</Text>
          </Pressable>
        ))}
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  row: { flexDirection: 'row' },
  button: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 8,
  },
  buttonActive: { borderColor: '#111827' },
  buttonInactive: { borderColor: '#e5e7eb' },
  pressed: { opacity: 0.7 },
  errorText: { color: '#ef4444' },
});

