import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';

type BadgeProps = {
  label: string;
};

export function Badge({ label }: BadgeProps) {
  const { theme } = useTheme();

  const bgColor = theme.colors.surface;
  const textColor = theme.colors.textPrimary;
  const borderColor = theme.colors.border;

  return (
    <View style={[styles.badge, { backgroundColor: bgColor, borderColor }]}>
      <Text style={[styles.badgeText, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
