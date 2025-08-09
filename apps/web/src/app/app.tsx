import { Route, Routes } from 'react-router-dom';
import { UsersProvider, createLocalStoragePersistence } from 'shared-store';
import UserForm from './routes/UserForm';
import UsersList from './routes/UsersList';
import { ThemeProvider } from './theme';

export default function App() {
  return (
    <ThemeProvider>
      <UsersProvider
        persistence={createLocalStoragePersistence()}
        apiBaseUrl={'http://localhost:3333'}
      >
        <Routes>
          <Route path="/" element={<UsersList />} />
          <Route path="/users/new" element={<UserForm />} />
          <Route path="/users/:id" element={<UserForm />} />
        </Routes>
      </UsersProvider>
    </ThemeProvider>
  );
}
