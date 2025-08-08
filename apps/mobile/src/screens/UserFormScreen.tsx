import DateTimePicker from '@react-native-community/datetimepicker';
import React from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 16, gap: 12 }}>
        <Text style={{ fontSize: 20, fontWeight: '700' }}>
          {isEdit ? 'Edit user' : 'Create user'}
        </Text>
        <TextInput
          placeholder="Full Name"
          value={form.watch('fullName')}
          onChangeText={(t) =>
            form.setValue('fullName', t, { shouldValidate: true })
          }
          style={{
            borderWidth: 1,
            borderColor: form.formState.errors.fullName ? '#ef4444' : '#e5e7eb',
            borderRadius: 8,
            padding: 10,
          }}
        />
        {form.formState.errors.fullName && (
          <Text style={{ color: '#ef4444' }}>
            {String(form.formState.errors.fullName.message)}
          </Text>
        )}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['STAFF', 'MEMBER'] as const).map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => form.setValue('role', r, { shouldValidate: true })}
              style={{
                padding: 10,
                borderWidth: 1,
                borderColor: form.watch('role') === r ? '#111827' : '#e5e7eb',
                borderRadius: 8,
              }}
            >
              <Text>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {form.formState.errors.role && (
          <Text style={{ color: '#ef4444' }}>
            {String(form.formState.errors.role.message)}
          </Text>
        )}
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          style={{
            borderWidth: 1,
            borderColor: form.formState.errors.dateOfBirth
              ? '#ef4444'
              : '#e5e7eb',
            borderRadius: 8,
            padding: 12,
          }}
        >
          <Text style={{ color: '#111827' }}>
            {form.watch('dateOfBirth')
              ? (form.watch('dateOfBirth') as string).slice(0, 10)
              : 'Tap to pick date'}
          </Text>
        </TouchableOpacity>
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
        <TouchableOpacity
          onPress={onSubmit}
          style={{ padding: 12, backgroundColor: '#111827', borderRadius: 8 }}
          disabled={!form.formState.isValid}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>
            {isEdit ? 'Save' : 'Create'}
          </Text>
        </TouchableOpacity>
        {isEdit && (
          <TouchableOpacity
            onPress={onRemove}
            style={{ padding: 12, backgroundColor: '#ef4444', borderRadius: 8 }}
          >
            <Text style={{ color: 'white', textAlign: 'center' }}>
              Remove User
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
