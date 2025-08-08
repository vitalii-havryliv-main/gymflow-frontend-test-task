import DateTimePicker from '@react-native-community/datetimepicker';
import React from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  View,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useUsers } from 'shared-store';
import { useUsersForm } from '../hooks/useUsersForm';

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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {isEdit ? 'Edit user' : 'Create user'}
        </Text>
        <TextInput
          placeholder="Full Name"
          value={form.watch('fullName')}
          onChangeText={(t) =>
            form.setValue('fullName', t, { shouldValidate: true })
          }
          style={[
            styles.input,
            form.formState.errors.fullName && styles.inputError,
          ]}
        />
        {form.formState.errors.fullName && (
          <Text style={styles.errorText}>
            {String(form.formState.errors.fullName.message)}
          </Text>
        )}
        <View style={styles.roleRow}>
          {(['STAFF', 'MEMBER'] as const).map((r) => (
            <Pressable
              key={r}
              onPress={() => form.setValue('role', r, { shouldValidate: true })}
              style={({ pressed }) => [
                styles.roleButton,
                form.watch('role') === r
                  ? styles.roleButtonActive
                  : styles.roleButtonInactive,
                pressed && styles.pressed,
              ]}
            >
              <Text>{r}</Text>
            </Pressable>
          ))}
        </View>
        {form.formState.errors.role && (
          <Text style={styles.errorText}>
            {String(form.formState.errors.role.message)}
          </Text>
        )}
        <Pressable
          onPress={() => setShowPicker(true)}
          style={({ pressed }) => [
            styles.dateButton,
            form.formState.errors.dateOfBirth ? styles.inputError : null,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.dateButtonText}>
            {form.watch('dateOfBirth')
              ? (form.watch('dateOfBirth') as string).slice(0, 10)
              : 'Tap to pick date'}
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
            onChange={(_, d) => {
              setShowPicker(false);
              if (d)
                form.setValue(
                  'dateOfBirth',
                  `${d.getFullYear().toString().padStart(4, '0')}-${(
                    d.getMonth() + 1
                  )
                    .toString()
                    .padStart(2, '0')}-${d
                    .getDate()
                    .toString()
                    .padStart(2, '0')}T00:00:00.000Z`,
                  { shouldValidate: true }
                );
            }}
          />
        )}
        <Pressable
          onPress={onSubmit}
          style={({ pressed }) => [
            styles.buttonPrimary,
            pressed && styles.buttonPrimaryPressed,
          ]}
          disabled={!form.formState.isValid}
        >
          <Text style={styles.buttonPrimaryText}>
            {isEdit ? 'Save' : 'Create'}
          </Text>
        </Pressable>
        {isEdit && (
          <Pressable
            onPress={onRemove}
            style={({ pressed }) => [
              styles.buttonDanger,
              pressed && styles.buttonDangerPressed,
            ]}
          >
            <Text style={styles.buttonDangerText}>
              Remove User
            </Text>
          </Pressable>
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
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  dateButtonText: { color: '#111827' },
  buttonPrimary: { padding: 12, backgroundColor: '#111827', borderRadius: 8, marginTop: 12 },
  buttonPrimaryPressed: { opacity: 0.8 },
  buttonPrimaryText: { color: 'white', textAlign: 'center' },
  buttonDanger: { padding: 12, backgroundColor: '#ef4444', borderRadius: 8, marginTop: 8 },
  buttonDangerPressed: { opacity: 0.85 },
  buttonDangerText: { color: 'white', textAlign: 'center' },
});
