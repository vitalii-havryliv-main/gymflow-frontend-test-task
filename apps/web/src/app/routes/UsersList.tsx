import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useUsers } from 'shared-store';
import { UserTable } from '../components/UserTable';

export default function UsersList() {
  const { users } = useUsers();
  return (
    <div className="mx-auto max-w-6xl p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to Gymflow!
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage all members and staff.
          </p>
        </div>
        <Link
          to="/users/new"
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-white shadow hover:bg-blue-700"
        >
          Create user
        </Link>
      </div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <UserTable users={users} />
      </motion.div>
    </div>
  );
}
