// Use native Date to avoid typing issues for luxon declarations in web/mobile builds
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import type { CreateUserInput, UpdateUserInput, User } from 'shared-types';

type UsersState = {
  users: User[];
  isHydrated: boolean;
};

type UsersAction =
  | { type: 'HYDRATE'; payload: User[] }
  | { type: 'CREATE'; payload: User }
  | { type: 'UPDATE'; payload: User }
  | { type: 'REMOVE'; payload: { id: string } };

const initialState: UsersState = { users: [], isHydrated: false };

function usersReducer(state: UsersState, action: UsersAction): UsersState {
  switch (action.type) {
    case 'HYDRATE':
      return { users: action.payload, isHydrated: true };
    case 'CREATE':
      return { ...state, users: [action.payload, ...state.users] };
    case 'UPDATE':
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === action.payload.id ? action.payload : u
        ),
      };
    case 'REMOVE':
      return {
        ...state,
        users: state.users.filter((u) => u.id !== action.payload.id),
      };
    default:
      return state;
  }
}

// Persistence interface so we can swap localStorage/AsyncStorage later if needed
export interface UsersPersistence {
  load(): Promise<User[]>;
  save(users: User[]): Promise<void>;
}

// Browser localStorage adapter
export function createLocalStoragePersistence(
  key = 'gf_users'
): UsersPersistence {
  return {
    async load() {
      try {
        const raw = globalThis.localStorage?.getItem(key);
        return raw ? (JSON.parse(raw) as User[]) : [];
      } catch {
        return [];
      }
    },
    async save(users: User[]) {
      try {
        globalThis.localStorage?.setItem(key, JSON.stringify(users));
      } catch {
        // ignore
      }
    },
  };
}

// React Native AsyncStorage adapter (runtime-only import in mobile app)
export function createAsyncStoragePersistence(
  key = 'gf_users'
): UsersPersistence {
  return {
    async load() {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - imported at runtime in React Native
        const AsyncStorage = (
          await import('@react-native-async-storage/async-storage')
        ).default;
        const raw = await AsyncStorage.getItem(key);
        return raw ? (JSON.parse(raw) as User[]) : [];
      } catch {
        return [];
      }
    },
    async save(users: User[]) {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - imported at runtime in React Native
        const AsyncStorage = (
          await import('@react-native-async-storage/async-storage')
        ).default;
        await AsyncStorage.setItem(key, JSON.stringify(users));
      } catch {
        // ignore
      }
    },
  };
}

type UsersContextValue = {
  users: User[];
  isHydrated: boolean;
  create(input: CreateUserInput): Promise<User>;
  update(id: string, input: UpdateUserInput): Promise<User>;
  remove(id: string): Promise<void>;
};

const UsersContext = createContext<UsersContextValue | undefined>(undefined);

export function UsersProvider({
  children,
  persistence,
  apiBaseUrl,
}: React.PropsWithChildren<{
  persistence: UsersPersistence;
  apiBaseUrl?: string;
}>) {
  const [state, dispatch] = useReducer(usersReducer, initialState);

  useEffect(() => {
    void (async () => {
      if (apiBaseUrl) {
        try {
          const res = await fetch(`${apiBaseUrl}/users`);
          const data = (await res.json()) as User[];
          dispatch({ type: 'HYDRATE', payload: data });
        } catch {
          dispatch({ type: 'HYDRATE', payload: [] });
        }
      } else {
        const users = await persistence.load();
        dispatch({ type: 'HYDRATE', payload: users });
      }
    })();
  }, [persistence, apiBaseUrl]);

  // SSE subscription + revalidate on focus/online (web) or foreground (RN)
  useEffect(() => {
    if (!apiBaseUrl) return;
    const rehydrate = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/users`);
        const data = (await res.json()) as User[];
        dispatch({ type: 'HYDRATE', payload: data });
      } catch {}
    };

    // SSE (web only or envs with EventSource polyfill)
    let es: any;
    if (typeof (globalThis as any).EventSource === 'function') {
      try {
        es = new (globalThis as any).EventSource(`${apiBaseUrl}/events`);
        es.addEventListener?.('users-updated', rehydrate);
      } catch {
        // ignore
      }
    }

    // Web focus/online
    const hasWindow = typeof window !== 'undefined';
    const canAddWinListener =
      hasWindow && typeof (window as any).addEventListener === 'function';
    const onFocus = () => void rehydrate();
    const onOnline = () => void rehydrate();
    if (canAddWinListener) {
      window.addEventListener('focus', onFocus);
      window.addEventListener('online', onOnline);
    }

    // React Native AppState foreground revalidate (guarded require)
    let rnSub: any;
    if (
      !canAddWinListener &&
      (globalThis as any).navigator?.product === 'ReactNative'
    ) {
      try {
        const { AppState } = require('react-native');
        rnSub = AppState.addEventListener('change', (state: string) => {
          if (state === 'active') void rehydrate();
        });
      } catch {
        // ignore if not available
      }
    }

    return () => {
      if (es?.close) es.close();
      if (canAddWinListener) {
        window.removeEventListener('focus', onFocus);
        window.removeEventListener('online', onOnline);
      }
      if (rnSub?.remove) rnSub.remove();
    };
  }, [apiBaseUrl]);

  useEffect(() => {
    if (!apiBaseUrl && state.isHydrated) void persistence.save(state.users);
  }, [state.users, state.isHydrated, persistence, apiBaseUrl]);

  const create = useCallback(
    async (input: CreateUserInput): Promise<User> => {
      if (apiBaseUrl) {
        const res = await fetch(`${apiBaseUrl}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });
        const created = (await res.json()) as User;
        dispatch({ type: 'CREATE', payload: created });
        return created;
      }
      const now = new Date().toISOString();
      const id =
        (globalThis as any)?.crypto?.randomUUID?.() ??
        `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const user: User = {
        id,
        fullName: input.fullName,
        role: input.role,
        dateOfBirth: input.dateOfBirth,
        createdAt: now,
        updatedAt: now,
      };
      dispatch({ type: 'CREATE', payload: user });
      return user;
    },
    [apiBaseUrl]
  );

  const update = useCallback(
    async (id: string, input: UpdateUserInput): Promise<User> => {
      if (apiBaseUrl) {
        const res = await fetch(`${apiBaseUrl}/users/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });
        const updated = (await res.json()) as User;
        dispatch({ type: 'UPDATE', payload: updated });
        return updated;
      }
      const existing = state.users.find((u) => u.id === id);
      if (!existing) throw new Error('User not found');
      const updated: User = {
        ...existing,
        ...input,
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: 'UPDATE', payload: updated });
      return updated;
    },
    [state.users, apiBaseUrl]
  );

  const remove = useCallback(
    async (id: string): Promise<void> => {
      if (apiBaseUrl) {
        await fetch(`${apiBaseUrl}/users/${id}`, { method: 'DELETE' });
      }
      dispatch({ type: 'REMOVE', payload: { id } });
    },
    [apiBaseUrl]
  );

  const value = useMemo<UsersContextValue>(
    () => ({
      users: state.users,
      isHydrated: state.isHydrated,
      create,
      update,
      remove,
    }),
    [state.users, state.isHydrated, create, update, remove]
  );

  return (
    <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
  );
}

export function useUsers(): UsersContextValue {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error('useUsers must be used within UsersProvider');
  return ctx;
}
