import React from 'react';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import {
  UsersProvider,
  createLocalStoragePersistence,
  useUsers,
} from 'shared-store';
import { createUserSchema } from 'shared-validation';

function DemoForm() {
  const { create } = useUsers();
  const [name, setName] = React.useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const input = { fullName: name, role: 'STAFF' as const };
    createUserSchema.pick({ fullName: true, role: true }).parse(input);
    await create(input);
    setName('');
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8 }}>
      <input
        placeholder="Full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
      />
      <button type="submit" style={{ padding: '8px 12px' }}>
        Quick add
      </button>
    </form>
  );
}

function DemoList() {
  const { users } = useUsers();
  return (
    <ul style={{ marginTop: 16 }}>
      {users.map((u) => (
        <li key={u.id}>
          {u.fullName} — {u.role}
        </li>
      ))}
    </ul>
  );
}

function UsersList() {
  const { users } = useUsers();
  return (
    <div style={{ padding: 16, maxWidth: 880, margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1>Gymflow Web</h1>
        <Link to="/users/new" style={{ textDecoration: 'underline' }}>
          Create user
        </Link>
      </div>
      <DemoForm />
      <DemoList />
      <ul style={{ marginTop: 16 }}>
        {users.map((u) => (
          <li key={u.id}>
            <Link to={`/users/${u.id}`}>{u.fullName}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function UserForm() {
  const params = useParams();
  const isEdit = Boolean(params.id);
  const navigate = useNavigate();
  const { users, create, update, remove } = useUsers();
  const existing = users.find((u) => u.id === params.id);
  const [fullName, setFullName] = React.useState(existing?.fullName ?? '');
  const [role, setRole] = React.useState<'STAFF' | 'MEMBER'>(
    existing?.role ?? 'STAFF'
  );
  const [dateOfBirth, setDateOfBirth] = React.useState(
    existing?.dateOfBirth ?? ''
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      fullName,
      role,
      dateOfBirth: dateOfBirth || undefined,
    } as const;
    createUserSchema.parse(payload);
    if (isEdit && existing) {
      await update(existing.id, payload);
    } else {
      await create(payload);
    }
    navigate('/');
  }

  async function onRemove() {
    if (existing) {
      await remove(existing.id);
      navigate('/');
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 640, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 12 }}>
        {isEdit ? 'Edit user' : 'Create user'}
      </h2>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <input
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as 'STAFF' | 'MEMBER')}
          style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
        >
          <option value="STAFF">Staff</option>
          <option value="MEMBER">Member</option>
        </select>
        <input
          type="date"
          value={dateOfBirth?.slice(0, 10) ?? ''}
          onChange={(e) =>
            setDateOfBirth(
              e.target.value ? new Date(e.target.value).toISOString() : ''
            )
          }
          style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" style={{ padding: '8px 12px' }}>
            {isEdit ? 'Save' : 'Create'}
          </button>
          {isEdit && (
            <button
              type="button"
              onClick={onRemove}
              style={{ padding: '8px 12px' }}
            >
              Remove User
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default function App() {
  return (
    <UsersProvider persistence={createLocalStoragePersistence()}>
      <Routes>
        <Route path="/" element={<UsersList />} />
        <Route path="/users/new" element={<UserForm />} />
        <Route path="/users/:id" element={<UserForm />} />
      </Routes>
    </UsersProvider>
  );
}
