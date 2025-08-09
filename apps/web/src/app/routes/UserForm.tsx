import { useNavigate, useParams } from 'react-router-dom';
import { useUsersForm } from 'shared-hooks';
import { useUsers } from 'shared-store';
import { LabeledField } from '../components/LabeledField';
import ChevronDown from '../components/icons/ChevronDown';

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
    <div className="mx-auto w-full max-w-3xl min-h-screen md:my-20 sm:my-0 text-[var(--text-primary)] overflow-hidden">
      <div className="my-6 sm:my-8 md:my-10 h-full flex flex-col bg-transparent p-4 sm:p-6 md:p-8 md:rounded-2xl md:border md:border-[var(--border)] md:bg-[var(--surface)] overflow-hidden">
        <h2 className="mb-4 text-2xl font-semibold shrink-0">
          {isEdit ? 'Edit user' : 'Create user'}
        </h2>
        <form
          onSubmit={onSubmit}
          className="grid gap-4 min-h-0 flex-1 overflow-y-auto p-1"
        >
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
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
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
              className={`rounded-2xl px-4 hover:scale-[1.02] transition-transform duration-150 py-2 bg-[var(--primary)] text-[var(--button-text)] ${
                form.formState.isValid ? '' : 'opacity-60'
              }`}
            >
              {isEdit ? 'Save' : 'Create'}
            </button>
            {isEdit && (
              <button
                type="button"
                onClick={onRemove}
                className="rounded-2xl border px-4 hover:scale-[1.02] bg-[var(--danger)] text-[var(--button-text)] transition-transform duration-150 py-2 border-[var(--border)]"
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
