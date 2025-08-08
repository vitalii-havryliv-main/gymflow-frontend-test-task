import DateTimePicker from '@react-native-community/datetimepicker';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  UsersProvider,
  createAsyncStoragePersistence,
  useUsers,
} from 'shared-store';
import { createUserSchema } from 'shared-validation';

type RootStackParamList = {
  UsersList: undefined;
  UserForm: { id?: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function UsersListScreen({ navigation }: { navigation: any }) {
  const { users } = useUsers();
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 12 }}>
          Users
        </Text>
        {users.map((u) => (
          <TouchableOpacity
            key={u.id}
            onPress={() => navigation.navigate('UserForm', { id: u.id })}
          >
            <Text style={{ paddingVertical: 8 }}>
              {u.fullName} — {u.role}
            </Text>
          </TouchableOpacity>
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

function UserFormScreen({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) {
  const id: string | undefined = route?.params?.id;
  const isEdit = Boolean(id);
  const { users, create, update, remove } = useUsers();
  const existing = users.find((u) => u.id === id);

  const [fullName, setFullName] = React.useState(existing?.fullName ?? '');
  const [role, setRole] = React.useState<'STAFF' | 'MEMBER'>(
    existing?.role ?? 'STAFF'
  );
  const [dateOfBirth, setDateOfBirth] = React.useState(
    existing?.dateOfBirth ?? ''
  );
  const [showPicker, setShowPicker] = React.useState(false);

  function normalizeDobInput(value: string): string | undefined {
    const v = value.trim();
    if (!v) return undefined;
    // Accept YYYY-MM-DD and convert to midnight UTC ISO
    const ymd = /^\d{4}-\d{2}-\d{2}$/;
    if (ymd.test(v)) return `${v}T00:00:00.000Z`;
    // Accept already-ISO values
    const iso = /^\d{4}-\d{2}-\d{2}T.*Z$/;
    if (iso.test(v)) return v;
    return undefined;
  }

  async function onSubmit() {
    const normalizedDob = normalizeDobInput(dateOfBirth);
    const payload = { fullName, role, dateOfBirth: normalizedDob } as const;
    try {
      createUserSchema.parse(payload);
    } catch (e) {
      Alert.alert(
        'Invalid data',
        'Please enter a valid Full Name (3-50) and optional DOB as YYYY-MM-DD'
      );
      return;
    }
    if (isEdit && existing) {
      await update(existing.id, payload);
    } else {
      await create(payload);
    }
    navigation.goBack();
  }

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
          value={fullName}
          onChangeText={setFullName}
          style={{
            borderWidth: 1,
            borderColor: '#e5e7eb',
            borderRadius: 8,
            padding: 10,
          }}
        />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['STAFF', 'MEMBER'] as const).map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => setRole(r)}
              style={{
                padding: 10,
                borderWidth: 1,
                borderColor: role === r ? '#111827' : '#e5e7eb',
                borderRadius: 8,
              }}
            >
              <Text>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          style={{
            borderWidth: 1,
            borderColor: '#e5e7eb',
            borderRadius: 8,
            padding: 12,
          }}
        >
          <Text style={{ color: '#111827' }}>
            {dateOfBirth ? dateOfBirth.slice(0, 10) : 'Tap to pick date'}
          </Text>
        </TouchableOpacity>
        {showPicker && (
          <DateTimePicker
            value={dateOfBirth ? new Date(dateOfBirth) : new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, d) => {
              setShowPicker(false);
              if (d)
                setDateOfBirth(
                  `${d.getFullYear().toString().padStart(4, '0')}-${(
                    d.getMonth() + 1
                  )
                    .toString()
                    .padStart(2, '0')}-${d
                    .getDate()
                    .toString()
                    .padStart(2, '0')}T00:00:00.000Z`
                );
            }}
          />
        )}
        <TouchableOpacity
          onPress={onSubmit}
          style={{ padding: 12, backgroundColor: '#111827', borderRadius: 8 }}
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

export default function App() {
  const API_BASE_URL =
    Platform.OS === 'android'
      ? 'http://10.0.2.2:3333'
      : 'http://127.0.0.1:3333';
  return (
    <UsersProvider
      persistence={createAsyncStoragePersistence()}
      apiBaseUrl={API_BASE_URL}
    >
      <NavigationContainer>
        <StatusBar barStyle="dark-content" />
        <Stack.Navigator>
          <Stack.Screen
            name="UsersList"
            component={UsersListScreen}
            options={{ title: 'Gymflow' }}
          />
          <Stack.Screen
            name="UserForm"
            component={UserFormScreen}
            options={{ title: 'User' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </UsersProvider>
  );
}
