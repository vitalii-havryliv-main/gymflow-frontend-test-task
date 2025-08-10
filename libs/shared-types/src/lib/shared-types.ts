export type UserRole = 'STAFF' | 'MEMBER';

export interface User {
  id: string;
  fullName: string;
  role: UserRole;
  dateOfBirth?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  fullName: string;
  role: UserRole;
  dateOfBirth?: string;
}

export type UpdateUserInput = Partial<CreateUserInput>;
