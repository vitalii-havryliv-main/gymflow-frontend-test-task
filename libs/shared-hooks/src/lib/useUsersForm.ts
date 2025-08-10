import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import type { User } from 'shared-types';
import { createUserSchema, type CreateUserSchema } from 'shared-validation';

export function useUsersForm(
  existing?: Partial<User>
): UseFormReturn<CreateUserSchema> {
  const form = useForm<CreateUserSchema>({
    resolver: zodResolver(createUserSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: existing?.fullName ?? '',
      role: (existing?.role ?? 'STAFF') as 'STAFF' | 'MEMBER',
      dateOfBirth: existing?.dateOfBirth ?? undefined,
    },
  });

  useEffect(() => {
    if (existing) {
      form.reset({
        fullName: existing.fullName ?? '',
        role: (existing.role ?? 'STAFF') as 'STAFF' | 'MEMBER',
        dateOfBirth: existing.dateOfBirth ?? undefined,
      });
    }
  }, [existing?.id, existing?.fullName, existing?.role, existing?.dateOfBirth]);

  return form;
}

export type { CreateUserSchema };
