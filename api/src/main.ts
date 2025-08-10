import cors from '@fastify/cors';
import Fastify from 'fastify';
import { mkdirSync } from 'fs';
import { JSONFilePreset } from 'lowdb/node';
import * as path from 'path';
import { generateId, nowIso } from 'shared-utils';
import { createUserSchema, updateUserSchema } from 'shared-validation';

type UserRole = 'STAFF' | 'MEMBER';
interface User {
  id: string;
  fullName: string;
  role: UserRole;
  dateOfBirth?: string;
  createdAt: string;
  updatedAt: string;
}

const defaultData = { users: [] as User[] };
const dataDir = process.env.API_DATA_DIR ?? path.join(process.cwd(), '.data');
try {
  mkdirSync(dataDir, { recursive: true });
} catch (error) {
  console.error(error);
}
const dbFile = process.env.API_DB_FILE ?? path.join(dataDir, 'api-db.json');
const dbPromise = JSONFilePreset(dbFile, defaultData);

const app = Fastify({ logger: true });

async function bootstrap() {
  await app.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    hook: 'preHandler',
    strictPreflight: false,
  });

  app.options('/users', async (_req, reply) => {
    reply.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    reply.send();
  });
  app.options('/users/:id', async (_req, reply) => {
    reply.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    reply.send();
  });

  app.get('/health', async () => ({ ok: true }));

  const sseClients = new Set<{
    id: number;
    reply: { raw: { write: (chunk: string) => void } };
  }>();
  let clientSeq = 0;
  function broadcast(event: string, data: unknown = {}) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const { reply } of sseClients) {
      try {
        reply.raw.write(payload);
      } catch {
        console.error('Error writing to SSE client');
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
        console.error('Error writing to SSE client');
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
    const now = nowIso();
    const id = generateId();
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
      updatedAt: nowIso(),
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
