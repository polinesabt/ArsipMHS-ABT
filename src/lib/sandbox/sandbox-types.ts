/**
 * Demo Sandbox Types
 * Defines data structures for namespaced IndexedDB cache, operation journal,
 * tombstones, conflict resolution, and sync state.
 */

export type SandboxOperationType =
  | 'create'
  | 'update'
  | 'delete'
  | 'recover'
  | 'permanent_delete';

export type SandboxResource =
  | 'students'
  | 'tracer'
  | 'achievements'
  | 'attachments'
  | 'chart_records'
  | 'active_students_stats'
  | 'evaluations'
  | 'satisfaction_forms'
  | 'dosen'
  | 'tendik'
  | 'admins'
  | 'settings'
  | 'logs'
  | 'notifications';

export interface BaseVersionMeta {
  updated_at?: string | null;
  hash?: string | null;
}

export interface SandboxJournalEntry {
  id: string;
  operation: SandboxOperationType;
  resource: SandboxResource;
  recordId: string;
  payload?: any;
  patch?: Record<string, any>;
  baseVersion?: BaseVersionMeta;
  uniqueKeys?: Record<string, string>; // e.g. { nim: '12345' } or { username: 'admin2' }
  createdAt: number;
}

export interface SandboxTombstone {
  resource: SandboxResource;
  recordId: string;
  deletedAt: number;
  isPermanent: boolean;
  metadata?: Record<string, any>;
}

export interface SandboxBlobItem {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  blob: Blob;
  createdAt: number;
}

export interface SandboxSnapshotItem<T = any> {
  key: string;
  resource: SandboxResource;
  data: T;
  versionHash?: string;
  fetchedAt: number;
}

export type ConflictReason =
  | 'prod_updated'
  | 'prod_deleted'
  | 'unique_collision';

export interface SandboxConflictEvent {
  id: string;
  resource: SandboxResource;
  recordId: string;
  reason: ConflictReason;
  message: string;
  timestamp: number;
  discardedPayload?: any;
}

export type DemoSyncStatus = 'synced' | 'syncing' | 'stale' | 'conflict';

export interface DemoSessionState {
  sid: string;
  isActive: boolean;
  syncStatus: DemoSyncStatus;
  lastSyncedAt: number | null;
  pendingOperationsCount: number;
  lastConflict: SandboxConflictEvent | null;
}
