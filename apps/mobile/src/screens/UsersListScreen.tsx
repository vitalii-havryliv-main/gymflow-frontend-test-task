import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useUsers } from 'shared-store';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { useTheme } from '../theme';

type NavProp = {
  navigate: (route: string, params?: unknown) => void;
};

export function UsersListScreen({ navigation }: { navigation: NavProp }) {
  const { users, isHydrated } = useUsers();
  const { theme } = useTheme();
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          Welcome to Gymflow!
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Manage all members and staff.
        </Text>
        {users.length > 0 && (
          <Button
            title="Add user"
            onPress={() => navigation.navigate('UserForm')}
            style={styles.createButton}
            textStyle={styles.createButtonText}
          />
        )}

        {!isHydrated ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="small"
              color={theme.colors.textSecondary}
            />
          </View>
        ) : users.length === 0 ? (
          <View
            style={[
              styles.emptyState,
              { borderColor: theme.colors.emptyBorder },
            ]}
          >
            <Text
              style={[styles.emptyText, { color: theme.colors.textSecondary }]}
            >
              Get started by adding your first user.
            </Text>
            <Button
              title="Add user"
              onPress={() => navigation.navigate('UserForm')}
              style={styles.addButton}
            />
          </View>
        ) : null}

        {isHydrated && (
          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={ListSeparator}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator
            renderItem={({ item: u }) => (
              <Animated.View entering={FadeIn}>
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
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function ListSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 12 },
  subtitle: { fontSize: 14, marginBottom: 12 },
  loadingContainer: { paddingVertical: 24 },
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
  createButton: {
    marginBottom: 12,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyText: { marginBottom: 12 },
  addButton: {
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  list: { flex: 1 },
  listContent: { paddingVertical: 16 },
  separator: { height: 1 },
});
