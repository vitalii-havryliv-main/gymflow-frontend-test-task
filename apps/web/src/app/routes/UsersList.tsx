import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useUsers } from 'shared-store';
import { UserTable } from '../components/UserTable';
import { ThemeToggle } from '../theme';

export default function UsersList() {
  const { users } = useUsers();
  return (
    <div className="mx-auto shadow-md md:my-20 sm:my-0 w-full h-full max-w-3xl min-h-screen text-[var(--text-primary)] overflow-hidden">
      <div className="sm:my-0 md:my-10 h-full sm:min-h-[100dvh] sm:max-h-[100dvh] md:min-h-0 md:max-h-[calc(100dvh-15rem)] flex flex-col bg-transparent p-4 sm:p-6 md:p-8 md:rounded-2xl md:border md:border-[var(--border)] md:bg-[var(--surface)] overflow-hidden">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome to Gymflow!
            </h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Manage all members and staff.
            </p>
          </div>
          <ThemeToggle />
        </div>
        {users.length > 0 && (
          <div className="mb-6 shrink-0">
            <Link
              to="/users/new"
              className="inline-block rounded-lg px-5 py-2.5 shadow hover:opacity-90 bg-[var(--primary)] text-[var(--button-text)]"
            >
              Add user
            </Link>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto pr-2">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <UserTable users={users} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
