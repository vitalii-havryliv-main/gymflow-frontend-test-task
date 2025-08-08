import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useUsers } from 'shared-store';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { useTheme } from '../theme';

type NavProp = {
  navigate: (route: string, params?: unknown) => void;
};

export function UsersListScreen({ navigation }: { navigation: NavProp }) {
  const { users } = useUsers();
  const { theme } = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          Users
        </Text>
        {users.map((u) => (
          <Animated.View key={u.id} entering={FadeIn}>
            <Pressable
              onPress={() => navigation.navigate('UserForm', { id: u.id })}
              style={({ pressed }) => [
                styles.listItem,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                },
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.rowBetween}>
                <Text
                  style={[styles.name, { color: theme.colors.textPrimary }]}
                >
                  {u.fullName}
                </Text>
                <Badge label={u.role} />
              </View>
            </Pressable>
          </Animated.View>
        ))}
        <Button
          title="Create user"
          onPress={() => navigation.navigate('UserForm')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 12 },
  listItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  name: { fontSize: 16, fontWeight: '600' },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pressed: { opacity: 0.7 },
  buttonPrimary: {},
  buttonPrimaryPressed: {},
  buttonPrimaryText: {},
});
