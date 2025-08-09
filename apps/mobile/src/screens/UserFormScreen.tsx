import DateTimePicker from '@react-native-community/datetimepicker';
import { DateTime } from 'luxon';
import React from 'react';
import {
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useUsersForm } from 'shared-hooks';
import { useUsers } from 'shared-store';
import { Button } from '../components/Button';
import { Field } from '../components/Field';
import { RoleSelector } from '../components/RoleSelector';
import { useTheme } from '../theme';

type NavProp = {
  goBack: () => void;
};

export function UserFormScreen({
  route,
  navigation,
}: {
  route: { params?: { id?: string } };
  navigation: NavProp;
}) {
  const { theme } = useTheme();
  const id: string | undefined = route?.params?.id;
  const isEdit = Boolean(id);
  const { users, create, update, remove } = useUsers();
  const existing = users.find((u) => u.id === id);

  const form = useUsersForm(existing);
  const [showPicker, setShowPicker] = React.useState(false);

  const onSubmit = form.handleSubmit(async (payload): Promise<void> => {
    try {
      if (isEdit && existing) await update(existing.id, payload);
      else await create(payload);
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save user');
    }
  });

  async function onRemove() {
    if (!existing) return;
    await remove(existing.id);
    navigation.goBack();
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          {isEdit ? 'Edit user' : 'Create user'}
        </Text>
        <Field
          label="Full Name"
          placeholder="e.g. John Smith"
          value={form.watch('fullName') as string}
          onChangeText={(t) =>
            form.setValue('fullName', t, { shouldValidate: true })
          }
          error={
            form.formState.errors.fullName
              ? String(form.formState.errors.fullName.message)
              : undefined
          }
        />
        <RoleSelector
          value={form.watch('role') as 'STAFF' | 'MEMBER'}
          onChange={(r) => form.setValue('role', r, { shouldValidate: true })}
          error={
            form.formState.errors.role
              ? String(form.formState.errors.role.message)
              : undefined
          }
        />
        <Pressable
          onPress={() => setShowPicker(true)}
          style={({ pressed }) => [
            styles.dateButton,
            {
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
            },
            form.formState.errors.dateOfBirth ? styles.inputError : null,
            pressed && styles.pressed,
          ]}
        >
          <Text
            style={[styles.dateButtonText, { color: theme.colors.textPrimary }]}
          >
            {form.watch('dateOfBirth')
              ? DateTime.fromISO(form.watch('dateOfBirth') as string)
                  .toUTC()
                  .toFormat('yyyy-LL-dd')
              : 'Date of Birth'}
          </Text>
        </Pressable>
        {showPicker && (
          <DateTimePicker
            value={
              form.watch('dateOfBirth')
                ? new Date(form.watch('dateOfBirth') as string)
                : new Date()
            }
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            themeVariant={theme.mode}
            onChange={(_, d) => {
              setShowPicker(false);
              if (d)
                form.setValue(
                  'dateOfBirth',
                  DateTime.fromJSDate(d).startOf('day').toUTC().toISO(),
                  { shouldValidate: true }
                );
            }}
          />
        )}
        <Button
          title={isEdit ? 'Save' : 'Create'}
          onPress={onSubmit}
          disabled={!form.formState.isValid}
          style={styles.createButton}
        />
        {isEdit && (
          <Button
            title="Remove User"
            onPress={onRemove}
            variant="danger"
            style={styles.removeButton}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 10,
  },
  inputError: { borderColor: '#ef4444' },
  errorText: { color: '#ef4444', marginTop: 4 },
  roleRow: { flexDirection: 'row', marginTop: 8 },
  roleButton: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 8,
  },
  roleButtonActive: { borderColor: '#111827' },
  roleButtonInactive: { borderColor: '#e5e7eb' },
  pressed: { opacity: 0.7 },
  dateButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 8,
  },
  dateButtonText: { color: '#111827' },
  buttonPrimary: {
    padding: 12,
    backgroundColor: '#111827',
    borderRadius: 8,
    marginTop: 12,
  },
  buttonPrimaryPressed: { opacity: 0.8 },
  buttonPrimaryText: { color: 'white', textAlign: 'center' },
  buttonDanger: {
    padding: 12,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    marginTop: 8,
  },
  buttonDangerPressed: { opacity: 0.85 },
  buttonDangerText: { color: 'white', textAlign: 'center' },
  createButton: {
    marginTop: 12,
  },
  removeButton: {
    marginTop: 12,
  },
});
