import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Platform, StatusBar } from 'react-native';
import { UsersProvider, createAsyncStoragePersistence } from 'shared-store';
import { UserFormScreen } from './screens/UserFormScreen';
import { UsersListScreen } from './screens/UsersListScreen';

type RootStackParamList = {
  UsersList: undefined;
  UserForm: { id?: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

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
