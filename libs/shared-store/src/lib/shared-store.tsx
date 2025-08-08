import { DateTime } from 'luxon';
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
}: React.PropsWithChildren<{ persistence: UsersPersistence }>) {
  const [state, dispatch] = useReducer(usersReducer, initialState);

  useEffect(() => {
    void (async () => {
      const users = await persistence.load();
      dispatch({ type: 'HYDRATE', payload: users });
    })();
  }, [persistence]);

  useEffect(() => {
    if (state.isHydrated) void persistence.save(state.users);
  }, [state.users, state.isHydrated, persistence]);

  const create = useCallback(async (input: CreateUserInput): Promise<User> => {
    const now = DateTime.now().toUTC().toISO();
    const user: User = {
      id: crypto.randomUUID(),
      fullName: input.fullName,
      role: input.role,
      dateOfBirth: input.dateOfBirth,
      createdAt: now!,
      updatedAt: now!,
    };
    dispatch({ type: 'CREATE', payload: user });
    return user;
  }, []);

  const update = useCallback(
    async (id: string, input: UpdateUserInput): Promise<User> => {
      const existing = state.users.find((u) => u.id === id);
      if (!existing) throw new Error('User not found');
      const updated: User = {
        ...existing,
        ...input,
        updatedAt: DateTime.now().toUTC().toISO()!,
      };
      dispatch({ type: 'UPDATE', payload: updated });
      return updated;
    },
    [state.users]
  );

  const remove = useCallback(async (id: string): Promise<void> => {
    dispatch({ type: 'REMOVE', payload: { id } });
  }, []);

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
