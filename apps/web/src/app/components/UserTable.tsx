import { Link } from 'react-router-dom';
import type { User } from 'shared-types';

export function UserTable({ users }: { users: User[] }) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow ring-1 ring-black/5">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="sticky top-0 bg-slate-50/80 backdrop-blur supports-[backdrop-filter]:bg-slate-50/60">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
              Full name
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
              Role
            </th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((u) => (
            <tr
              key={u.id}
              className="even:bg-slate-50 hover:bg-slate-100/60 transition-colors"
            >
              <td className="px-6 py-4 text-sm text-slate-900">{u.fullName}</td>
              <td className="px-6 py-4 text-sm text-slate-700">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                  {u.role}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <Link
                  to={`/users/${u.id}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
