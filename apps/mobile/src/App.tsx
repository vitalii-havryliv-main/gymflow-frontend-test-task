import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Platform, StatusBar } from 'react-native';
import { UsersProvider, createAsyncStoragePersistence } from 'shared-store';
import { ThemeToggle } from './components/ThemeToggle';
import { UserFormScreen } from './screens/UserFormScreen';
import { UsersListScreen } from './screens/UsersListScreen';
import { ThemeProvider, useTheme } from './theme';

type RootStackParamList = {
  UsersList: undefined;
  UserForm: { id?: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { theme } = useTheme();
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
        <StatusBar barStyle={theme.statusBarStyle} />
        <Stack.Navigator
          screenOptions={{
            headerRight: () => <ThemeToggle />,
            headerStyle: { backgroundColor: theme.colors.background },
            headerTintColor: theme.colors.textPrimary,
            headerTitleStyle: { color: theme.colors.textPrimary },
          }}
        >
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

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}
