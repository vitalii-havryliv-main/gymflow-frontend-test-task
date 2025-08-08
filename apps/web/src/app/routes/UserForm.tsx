import { useNavigate, useParams } from 'react-router-dom';
import { useUsers } from 'shared-store';
import { LabeledField } from '../components/LabeledField';
import { useUsersForm } from '../hooks/useUsersForm';

export default function UserFormRoute() {
  const params = useParams();
  const navigate = useNavigate();
  const { users, create, update, remove } = useUsers();
  const existing = users.find((u) => u.id === params.id);
  const form = useUsersForm(existing);
  const isEdit = Boolean(existing);

  const onSubmit = form.handleSubmit(async (payload) => {
    if (isEdit && existing) await update(existing.id, payload);
    else await create(payload);
    navigate('/');
  });

  async function onRemove() {
    if (!existing) return;
    await remove(existing.id);
    navigate('/');
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="rounded-lg bg-white p-6 shadow ring-1 ring-black/5">
        <h2 className="mb-4 text-2xl font-semibold">
          {isEdit ? 'Edit user' : 'Create user'}
        </h2>
        <form onSubmit={onSubmit} className="grid gap-4">
          <LabeledField
            label="Full Name"
            error={
              form.formState.errors.fullName?.message as string | undefined
            }
          >
            <input
              className={`rounded-md border px-3 py-2 ${
                form.formState.errors.fullName
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              placeholder="e.g. John Smith"
              {...form.register('fullName')}
              aria-invalid={!!form.formState.errors.fullName}
            />
          </LabeledField>

          <LabeledField
            label="Role"
            error={form.formState.errors.role?.message as string | undefined}
          >
            <select
              className={`rounded-md border px-3 py-2 ${
                form.formState.errors.role
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              {...form.register('role')}
              aria-invalid={!!form.formState.errors.role}
            >
              <option value="STAFF">Staff</option>
              <option value="MEMBER">Member</option>
            </select>
          </LabeledField>

          <LabeledField
            label="Date of Birthday (optional)"
            error={
              form.formState.errors.dateOfBirth?.message as string | undefined
            }
          >
            <input
              type="date"
              className={`rounded-md border px-3 py-2 ${
                form.formState.errors.dateOfBirth
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              value={form.watch('dateOfBirth')?.slice(0, 10) ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                form.setValue(
                  'dateOfBirth',
                  v ? `${v}T00:00:00.000Z` : undefined,
                  { shouldValidate: true }
                );
              }}
              aria-invalid={!!form.formState.errors.dateOfBirth}
            />
          </LabeledField>

          <div className="mt-2 flex gap-3">
            <button
              type="submit"
              disabled={!form.formState.isValid}
              className={`rounded-md px-4 py-2 text-white ${
                form.formState.isValid
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-blue-400'
              }`}
            >
              {isEdit ? 'Save' : 'Create'}
            </button>
            {isEdit && (
              <button
                type="button"
                onClick={onRemove}
                className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
              >
                Remove User
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
