export type UserRole = 'STAFF' | 'MEMBER';

export interface User {
  id: string;
  fullName: string;
  role: UserRole;
  dateOfBirth?: string; // ISO string (optional)
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface CreateUserInput {
  fullName: string;
  role: UserRole;
  dateOfBirth?: string;
}

export interface UpdateUserInput extends Partial<CreateUserInput> {}
