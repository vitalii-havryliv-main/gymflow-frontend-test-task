// Use native Date to avoid typing issues for luxon declarations in web/mobile builds
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import type { CreateUserInput, UpdateUserInput, User } from 'shared-types';
import {
  ApiUsersRepository,
  LocalUsersRepository,
  type UsersRepository,
} from './users-repository';

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

function haveUsersChanged(prev: User[], next: User[]): boolean {
  if (prev === next) return false;
  if (prev.length !== next.length) return true;
  const prevMap = new Map<string, string>(prev.map((u) => [u.id, u.updatedAt]));
  for (const u of next) {
    const prevUpdated = prevMap.get(u.id);
    if (prevUpdated === undefined) return true;
    if (prevUpdated !== u.updatedAt) return true;
  }
  return false;
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
  const latestUsersRef = useRef<User[]>(initialState.users);
  useEffect(() => {
    latestUsersRef.current = state.users;
  }, [state.users]);

  const repository: UsersRepository = useMemo(
    () =>
      apiBaseUrl
        ? new ApiUsersRepository(apiBaseUrl)
        : new LocalUsersRepository(persistence),
    [apiBaseUrl, persistence]
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const data = await repository.hydrate();
      if (cancelled) return;
      if (!haveUsersChanged(latestUsersRef.current, data)) return;
      dispatch({ type: 'HYDRATE', payload: data });
    })();
    return () => {
      cancelled = true;
    };
  }, [repository]);

  // SSE subscription + revalidate on focus/online (web) or foreground (RN)
  useEffect(() => {
    if (!apiBaseUrl) return;
    let cancelled = false;
    const rehydrate = async () => {
      try {
        const data = await repository.hydrate();
        if (cancelled) return;
        if (!haveUsersChanged(latestUsersRef.current, data)) return;
        dispatch({ type: 'HYDRATE', payload: data });
      } catch {
        // ignore
      }
    };

    // SSE (web only or envs with EventSource polyfill) or polling fallback
    let es: EventSource | undefined;
    let pollId: ReturnType<typeof setInterval> | undefined;
    const hasEventSource =
      typeof (globalThis as { EventSource?: unknown }).EventSource ===
      'function';
    if (hasEventSource) {
      try {
        es = new (
          globalThis as { EventSource: new (url: string) => EventSource }
        ).EventSource(`${apiBaseUrl}/events`);
        (es as EventSource).addEventListener(
          'users-updated',
          rehydrate as EventListener
        );
      } catch {
        // ignore
      }
    } else {
      // Mobile (React Native) fallback: lightweight polling
      const POLL_MS = 2000;
      pollId = setInterval(() => {
        void rehydrate();
      }, POLL_MS);
    }

    // Web focus/online
    const hasWindow = typeof window !== 'undefined';
    const canAddWinListener =
      hasWindow && typeof window.addEventListener === 'function';
    const onFocus = () => void rehydrate();
    const onOnline = () => void rehydrate();
    if (canAddWinListener) {
      window.addEventListener('focus', onFocus);
      window.addEventListener('online', onOnline);
    }

    // React Native AppState foreground revalidate (guarded require)
    let rnSub: { remove?: () => void } | undefined;
    if (
      !canAddWinListener &&
      (globalThis as { navigator?: { product?: string } }).navigator
        ?.product === 'ReactNative'
    ) {
      try {
        const { AppState } = require('react-native') as {
          AppState: {
            addEventListener: (
              type: 'change',
              listener: (state: string) => void
            ) => { remove: () => void };
          };
        };
        rnSub = AppState.addEventListener('change', (state: string) => {
          if (state === 'active') void rehydrate();
        });
      } catch {
        // ignore if not available
      }
    }

    return () => {
      cancelled = true;
      if (es?.close) es.close();
      if (pollId) clearInterval(pollId);
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
      const created = await repository.create(input);
      dispatch({ type: 'CREATE', payload: created });
      return created;
    },
    [repository]
  );

  const update = useCallback(
    async (id: string, input: UpdateUserInput): Promise<User> => {
      const updated = await repository.update(id, input, state.users);
      dispatch({ type: 'UPDATE', payload: updated });
      return updated;
    },
    [state.users, repository]
  );

  const remove = useCallback(
    async (id: string): Promise<void> => {
      await repository.remove(id);
      dispatch({ type: 'REMOVE', payload: { id } });
    },
    [repository]
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
