import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { User } from 'shared-types';
import { createUserSchema } from 'shared-validation';

type RoleLiteral = 'STAFF' | 'MEMBER';

export function useUsersForm(existing?: User) {
  return useForm({
    resolver: zodResolver(createUserSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: existing?.fullName ?? '',
      role: (existing?.role ?? 'STAFF') as RoleLiteral,
      dateOfBirth: existing?.dateOfBirth ?? undefined,
    },
  });
}

export type UsersFormReturn = ReturnType<typeof useUsersForm>;
