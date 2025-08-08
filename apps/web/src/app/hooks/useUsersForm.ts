import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, UseFormReturn } from 'react-hook-form';
import type { User } from 'shared-types';
import { createUserSchema, CreateUserSchema } from 'shared-validation';

export function useUsersForm(
  existing?: Partial<User>
): UseFormReturn<CreateUserSchema> {
  return useForm<CreateUserSchema>({
    resolver: zodResolver(createUserSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: existing?.fullName ?? '',
      role: (existing?.role ?? 'STAFF') as 'STAFF' | 'MEMBER',
      dateOfBirth: existing?.dateOfBirth ?? undefined,
    },
  });
}

export type { CreateUserSchema };
