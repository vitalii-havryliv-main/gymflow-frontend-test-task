import { v4 as uuidv4 } from 'uuid';

export function sharedUtils(): string {
  return 'shared-utils';
}

export function generateId(): string {
  return uuidv4() ?? globalThis?.crypto?.randomUUID?.();
}

export function nowIso(): string {
  return new Date().toISOString();
}
