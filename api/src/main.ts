import cors from '@fastify/cors';
import Fastify from 'fastify';
import { JSONFilePreset } from 'lowdb/node';
import { z } from 'zod';

// Types
type UserRole = 'STAFF' | 'MEMBER';
interface User {
  id: string;
  fullName: string;
  role: UserRole;
  dateOfBirth?: string;
  createdAt: string;
  updatedAt: string;
}

// Validation
const createUserSchema = z.object({
  fullName: z.string().min(3).max(50),
  role: z.enum(['STAFF', 'MEMBER']),
  dateOfBirth: z.string().datetime().optional(),
});

const updateUserSchema = createUserSchema.partial();

// DB
const defaultData = { users: [] as User[] };
const dbPromise = JSONFilePreset('api/db.json', defaultData);

// Server
const app = Fastify({ logger: true });
// Bootstrap server without top-level await (for TS config compatibility)
async function bootstrap() {
  await app.register(cors, { origin: true });

  app.get('/health', async () => ({ ok: true }));

  app.get('/users', async () => {
    const db = await dbPromise;
    return db.data.users;
  });

  app.post('/users', async (req, res) => {
    const db = await dbPromise;
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).send(parsed.error.format());
    const now = new Date().toISOString();
    const id =
      (globalThis as any)?.crypto?.randomUUID?.() ??
      `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const user: User = { id, ...parsed.data, createdAt: now, updatedAt: now };
    db.data.users.unshift(user);
    await db.write();
    return user;
  });

  app.put('/users/:id', async (req, res) => {
    const db = await dbPromise;
    const id = (req.params as any).id as string;
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).send(parsed.error.format());
    const idx = db.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return res.status(404).send({ message: 'Not found' });
    const updated: User = {
      ...db.data.users[idx],
      ...parsed.data,
      updatedAt: new Date().toISOString(),
    };
    db.data.users[idx] = updated;
    await db.write();
    return updated;
  });

  app.delete('/users/:id', async (req, res) => {
    const db = await dbPromise;
    const id = (req.params as any).id as string;
    db.data.users = db.data.users.filter((u) => u.id !== id);
    await db.write();
    return { ok: true };
  });

  const port = Number(process.env.PORT ?? 3333);
  try {
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`API listening on http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

void bootstrap();
