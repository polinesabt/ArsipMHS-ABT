/**
 * Demo ID Generator and Identifier Utilities
 * Ensures all local demo creations are cleanly identified with demo-<uuid>
 */

export function generateDemoUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback RFC4122 v4 UUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function generateDemoId(prefix?: string): string {
  const uuid = generateDemoUuid();
  if (prefix && prefix.trim()) {
    return `demo-${prefix.trim()}-${uuid}`;
  }
  return `demo-${uuid}`;
}

export function isDemoId(id: unknown): boolean {
  if (typeof id !== 'string') return false;
  return id.startsWith('demo-');
}
