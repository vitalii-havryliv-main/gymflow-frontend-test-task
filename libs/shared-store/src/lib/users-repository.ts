import type { CreateUserInput, UpdateUserInput, User } from 'shared-types';
import { generateId, nowIso } from 'shared-utils';
import type { UsersPersistence } from './shared-store';

export interface UsersRepository {
  hydrate(): Promise<User[]>;
  create(input: CreateUserInput): Promise<User>;
  update(
    id: string,
    input: UpdateUserInput,
    currentUsers?: User[]
  ): Promise<User>;
  remove(id: string): Promise<void>;
}

export class ApiUsersRepository implements UsersRepository {
  constructor(private readonly apiBaseUrl: string) {}

  async hydrate(): Promise<User[]> {
    try {
      const res = await fetch(`${this.apiBaseUrl}/users`);
      return (await res.json()) as User[];
    } catch {
      return [];
    }
  }

  async create(input: CreateUserInput): Promise<User> {
    const res = await fetch(`${this.apiBaseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return (await res.json()) as User;
  }

  async update(id: string, input: UpdateUserInput): Promise<User> {
    const res = await fetch(`${this.apiBaseUrl}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return (await res.json()) as User;
  }

  async remove(id: string): Promise<void> {
    await fetch(`${this.apiBaseUrl}/users/${id}`, { method: 'DELETE' });
  }
}

export class LocalUsersRepository implements UsersRepository {
  constructor(private readonly persistence: UsersPersistence) {}

  async hydrate(): Promise<User[]> {
    return this.persistence.load();
  }

  async create(input: CreateUserInput): Promise<User> {
    const now = nowIso();
    const id = generateId();
    return {
      id,
      fullName: input.fullName,
      role: input.role,
      dateOfBirth: input.dateOfBirth,
      createdAt: now,
      updatedAt: now,
    } satisfies User;
  }

  async update(
    id: string,
    input: UpdateUserInput,
    currentUsers?: User[]
  ): Promise<User> {
    const existing = currentUsers?.find((u) => u.id === id);
    if (!existing) throw new Error('User not found');
    return {
      ...existing,
      ...input,
      updatedAt: nowIso(),
    } satisfies User;
  }

  async remove(): Promise<void> {
    // No-op here; provider dispatch + persistence effect will handle saving
  }
}
