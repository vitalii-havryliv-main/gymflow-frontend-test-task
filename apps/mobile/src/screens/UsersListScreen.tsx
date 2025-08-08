import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useUsers } from 'shared-store';

type NavProp = {
  navigate: (route: string, params?: unknown) => void;
};

export function UsersListScreen({ navigation }: { navigation: NavProp }) {
  const { users } = useUsers();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 12 }}>
          Users
        </Text>
        {users.map((u) => (
          <Animated.View key={u.id} entering={FadeIn}>
            <TouchableOpacity
              onPress={() => navigation.navigate('UserForm', { id: u.id })}
            >
              <Text style={{ paddingVertical: 8 }}>
                {u.fullName} — {u.role}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
        <TouchableOpacity
          onPress={() => navigation.navigate('UserForm')}
          style={{
            marginTop: 16,
            padding: 12,
            backgroundColor: '#111827',
            borderRadius: 8,
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>
            Create user
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
