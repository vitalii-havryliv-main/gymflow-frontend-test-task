import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';

type Role = 'STAFF' | 'MEMBER';

type Props = {
  value: Role;
  onChange: (role: Role) => void;
  error?: string;
};

export function RoleSelector({ value, onChange, error }: Props) {
  const { theme } = useTheme();
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {(['STAFF', 'MEMBER'] as const).map((r) => (
          <Pressable
            key={r}
            onPress={() => onChange(r)}
            style={({ pressed }) => [
              styles.button,
              {
                borderColor:
                  value === r ? theme.colors.primary : theme.colors.border,
              },
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: value === r }}
          >
            <Text style={{ color: theme.colors.textPrimary }}>{r}</Text>
          </Pressable>
        ))}
      </View>
      {!!error && <Text style={{ color: theme.colors.danger }}>{error}</Text>}
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
  pressed: { opacity: 0.7 },
});
