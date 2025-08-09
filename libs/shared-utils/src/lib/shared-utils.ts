import { v4 as uuidv4 } from 'uuid';

export function sharedUtils(): string {
  return 'shared-utils';
}

export function generateId(): string {
  return globalThis?.crypto?.randomUUID?.() ?? uuidv4();
}

export function nowIso(): string {
  return new Date().toISOString();
}
