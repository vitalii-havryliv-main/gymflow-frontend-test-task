import { act, renderHook } from '@testing-library/react';
import React from 'react';
import {
  UsersProvider,
  createLocalStoragePersistence,
  useUsers,
} from './shared-store';

describe('Users store', () => {
  function wrapper({ children }: { children: React.ReactNode }) {
    return (
      <UsersProvider persistence={createLocalStoragePersistence()}>
        {children}
      </UsersProvider>
    );
  }

  it('creates and updates a user', async () => {
    const { result } = renderHook(() => useUsers(), { wrapper });

    // Wait for initial hydration
    await act(async () => {
      // microtask to allow useEffect hydration to dispatch
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.create({ fullName: 'John Smith', role: 'STAFF' });
    });

    expect(result.current.users.length).toBe(1);
    const created = result.current.users[0];
    expect(created.fullName).toBe('John Smith');

    await act(async () => {
      await result.current.update(created.id, { fullName: 'Jane Smith' });
    });

    expect(result.current.users[0].fullName).toBe('Jane Smith');
  });
});
