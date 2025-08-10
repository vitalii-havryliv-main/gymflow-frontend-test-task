import { AnimatePresence, motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import type { User } from 'shared-types';

export function UserTable({ users }: { users: User[] }) {
  const navigate = useNavigate();
  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center border-[var(--border)] bg-[var(--surface)]">
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Get started by adding your first user.
        </p>
        <Link
          to="/users/new"
          className="mt-4 inline-block rounded-md px-4 py-2 shadow hover:opacity-90 bg-[var(--primary)] text-[var(--button-text)]"
        >
          Add your first user
        </Link>
      </div>
    );
  }
  return (
    <div className="grid gap-3 pt-2">
      <AnimatePresence initial={false}>
        {users.map((u) => (
          <motion.button
            key={u.id}
            layout
            onClick={() => navigate(`/users/${u.id}`)}
            className="w-full rounded-xl border p-4 text-left shadow-sm border-[var(--border)] bg-[var(--surface)] transition duration-150 hover:shadow-md hover:-translate-y-[1px]"
          >
            <div className="flex items-center justify-between">
              <div className="font-semibold text-[var(--text-primary)]">
                {u.fullName}
              </div>
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-[var(--border)] bg-[var(--chip-bg)] text-[var(--text-primary)]">
                {u.role}
              </span>
            </div>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
