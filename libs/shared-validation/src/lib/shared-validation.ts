import type {
  CreateUserInput,
  UpdateUserInput,
  User,
  UserRole,
} from 'shared-types';
import { z } from 'zod';

export const userRoleSchema = z.enum(['STAFF', 'MEMBER']);

export const createUserSchema = z.object({
  fullName: z.string().min(3).max(50),
  role: userRoleSchema,
  // Optional ISO date string. Use z.string().datetime() for strict ISO-8601 validation.
  dateOfBirth: z.string().datetime().optional(),
});

export const updateUserSchema = createUserSchema.partial();

export type UserRoleSchema = z.infer<typeof userRoleSchema>;
export type CreateUserSchema = z.infer<typeof createUserSchema>;
export type UpdateUserSchema = z.infer<typeof updateUserSchema>;

// Helpers to assert types against our shared-types interfaces
export function parseCreateUser(input: unknown): CreateUserInput {
  return createUserSchema.parse(input) as CreateUserInput;
}

export function parseUpdateUser(input: unknown): UpdateUserInput {
  return updateUserSchema.parse(input) as UpdateUserInput;
}

// User entity is produced elsewhere (e.g., repository) so no full schema here.
export type { CreateUserInput, UpdateUserInput, User, UserRole };
