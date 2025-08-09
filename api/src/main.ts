import cors from '@fastify/cors';
import Fastify from 'fastify';
import { mkdirSync } from 'fs';
import { JSONFilePreset } from 'lowdb/node';
import * as path from 'path';
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
// Resolve DB location to a writable, non-repo path by default
const dataDir = process.env.API_DATA_DIR ?? path.join(process.cwd(), '.data');
try {
  mkdirSync(dataDir, { recursive: true });
} catch {
  // ignore mkdir errors; lowdb will attempt to create the file on write
}
const dbFile = process.env.API_DB_FILE ?? path.join(dataDir, 'api-db.json');
const dbPromise = JSONFilePreset(dbFile, defaultData);

// Server
const app = Fastify({ logger: true });
// Bootstrap server without top-level await (for TS config compatibility)
async function bootstrap() {
  await app.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    hook: 'preHandler',
    strictPreflight: false,
  });

  // Fallback preflight handlers (some envs require explicit OPTIONS routes)
  app.options('/users', async (_req, reply) => {
    reply.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    reply.send();
  });
  app.options('/users/:id', async (_req, reply) => {
    reply.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    reply.send();
  });

  app.get('/health', async () => ({ ok: true }));

  // --- SSE simple event hub ---
  const sseClients = new Set<{ id: number; reply: any }>();
  let clientSeq = 0;
  function broadcast(event: string, data: unknown = {}) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const { reply } of sseClients) {
      try {
        reply.raw.write(payload);
      } catch {
        // ignore write failures
      }
    }
  }

  app.get('/events', async (req, reply) => {
    reply.headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    reply.raw.flushHeaders?.();

    const id = ++clientSeq;
    sseClients.add({ id, reply });
    reply.raw.write(`event: connected\ndata: {"ok":true}\n\n`);

    const heartbeat = setInterval(() => {
      try {
        reply.raw.write(`: ping\n\n`);
      } catch {
        // ignore
      }
    }, 15000);

    req.raw.on('close', () => {
      clearInterval(heartbeat);
      sseClients.forEach((c) => {
        if (c.id === id) sseClients.delete(c);
      });
    });
  });

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
    broadcast('users-updated');
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
    broadcast('users-updated');
    return updated;
  });

  app.delete('/users/:id', async (req, res) => {
    const db = await dbPromise;
    const id = (req.params as any).id as string;
    db.data.users = db.data.users.filter((u) => u.id !== id);
    await db.write();
    broadcast('users-updated');
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
