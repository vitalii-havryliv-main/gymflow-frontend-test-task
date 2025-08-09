import { useNavigate, useParams } from 'react-router-dom';
import { useUsersForm } from 'shared-hooks';
import { useUsers } from 'shared-store';
import { LabeledField } from '../components/LabeledField';

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
    <div className="mx-auto max-w-2xl p-10 mt-10">
      <div className="rounded-2xl p-8 shadow-sm border bg-[var(--surface)] border-[var(--border)]">
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
              className={`rounded-md border px-3 py-2 w-full text-[var(--text-primary)] bg-[var(--surface)] outline-none focus:ring-2 focus:ring-[var(--primary)] ${
                form.formState.errors.fullName
                  ? 'border-[var(--danger)]'
                  : 'border-[var(--border)]'
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
            <div className="relative">
              <select
                className={`appearance-none rounded-md border pl-3 pr-10 py-2 w-full text-[var(--text-primary)] bg-[var(--surface)] outline-none focus:ring-2 focus:ring-[var(--primary)] ${
                  form.formState.errors.role
                    ? 'border-[var(--danger)]'
                    : 'border-[var(--border)]'
                }`}
                {...form.register('role')}
                aria-invalid={!!form.formState.errors.role}
              >
                <option value="STAFF">Staff</option>
                <option value="MEMBER">Member</option>
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </LabeledField>

          <LabeledField
            label="Date of Birthday (optional)"
            error={
              form.formState.errors.dateOfBirth?.message as string | undefined
            }
          >
            <input
              type="date"
              className={`date-input rounded-md border px-3 py-2 w-full text-[var(--text-primary)] bg-[var(--surface)] outline-none focus:ring-2 focus:ring-[var(--primary)] [color-scheme:dark] dark:[color-scheme:light] ${
                form.formState.errors.dateOfBirth
                  ? 'border-[var(--danger)]'
                  : 'border-[var(--border)]'
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
              className={`rounded-md px-4 py-2 bg-[var(--primary)] text-[var(--button-text)] ${
                form.formState.isValid ? '' : 'opacity-60'
              }`}
            >
              {isEdit ? 'Save' : 'Create'}
            </button>
            {isEdit && (
              <button
                type="button"
                onClick={onRemove}
                className="rounded-md border px-4 py-2 border-[var(--border)]"
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
