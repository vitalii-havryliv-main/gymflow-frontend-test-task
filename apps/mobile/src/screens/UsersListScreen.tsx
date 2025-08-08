import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useUsers } from 'shared-store';

type NavProp = {
  navigate: (route: string, params?: unknown) => void;
};

export function UsersListScreen({ navigation }: { navigation: NavProp }) {
  const { users } = useUsers();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Users</Text>
        {users.map((u) => (
          <Animated.View key={u.id} entering={FadeIn}>
            <Pressable
              onPress={() => navigation.navigate('UserForm', { id: u.id })}
              style={({ pressed }) => [
                styles.listItem,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.listItemText}>
                {u.fullName} — {u.role}
              </Text>
            </Pressable>
          </Animated.View>
        ))}
        <Pressable
          onPress={() => navigation.navigate('UserForm')}
          style={({ pressed }) => [
            styles.buttonPrimary,
            pressed && styles.buttonPrimaryPressed,
          ]}
        >
          <Text style={styles.buttonPrimaryText}>Create user</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  listItem: { paddingVertical: 8, borderRadius: 8 },
  listItemText: { color: '#111827' },
  pressed: { opacity: 0.7 },
  buttonPrimary: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#111827',
    borderRadius: 8,
  },
  buttonPrimaryPressed: { opacity: 0.8 },
  buttonPrimaryText: { color: 'white', textAlign: 'center' },
});
