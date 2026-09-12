/**
 * IndexedDB Storage Layer for Demo Sandbox
 * Namespaced by session ID (sid) with dedicated stores for:
 * - Snapshots: Cached production data
 * - Journal: Locally simulated operations (create, update, delete)
 * - Tombstones: Deleted production records
 * - Blobs: Simulated file attachments and imports
 * - Metadata: Version hashes, sync timestamps, conflict history
 */

import type {
  SandboxJournalEntry,
  SandboxResource,
  SandboxSnapshotItem,
  SandboxTombstone,
  SandboxBlobItem,
} from './sandbox-types';
import { generateDemoId } from './sandbox-id';

export class SandboxStorageError extends Error {
  public code: string;
  constructor(message: string, code: string = 'DEMO_CACHE_ERROR') {
    super(message);
    this.name = 'SandboxStorageError';
    this.code = code;
  }
}

const DB_VERSION = 1;

function getDbName(sid: string): string {
  const safeSid = encodeURIComponent(sid.trim() || 'default');
  return `sipal_sandbox_${safeSid}`;
}

const dbConnections = new Map<string, IDBDatabase>();

export function isIndexedDbAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
}

function handleDbError(err: unknown): never {
  if (err instanceof DOMException && (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
    throw new SandboxStorageError(
      'Penyimpanan cache browser gagal karena kuota penyimpanan habis. Perubahan dibatalkan.',
      'DEMO_QUOTA_EXCEEDED'
    );
  }
  const msg = err instanceof Error ? err.message : String(err);
  throw new SandboxStorageError(
    `Penyimpanan cache browser gagal: ${msg}. Perubahan dibatalkan.`,
    'DEMO_CACHE_ERROR'
  );
}

export async function openSandboxDB(sid: string): Promise<IDBDatabase> {
  if (!isIndexedDbAvailable()) {
    throw new SandboxStorageError(
      'IndexedDB tidak tersedia di peramban ini. Mode demo memerlukan dukungan penyimpanan browser lokal.',
      'INDEXEDDB_UNAVAILABLE'
    );
  }

  const dbName = getDbName(sid);
  const existing = dbConnections.get(dbName);
  if (existing && existing.name === dbName) {
    return existing;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Snapshots
      if (!db.objectStoreNames.contains('snapshots')) {
        const store = db.createObjectStore('snapshots', { keyPath: 'key' });
        store.createIndex('by_resource', 'resource', { unique: false });
      }

      // 2. Journal
      if (!db.objectStoreNames.contains('journal')) {
        const store = db.createObjectStore('journal', { keyPath: 'id' });
        store.createIndex('by_resource', 'resource', { unique: false });
        store.createIndex('by_recordId', 'recordId', { unique: false });
        store.createIndex('by_createdAt', 'createdAt', { unique: false });
      }

      // 3. Tombstones
      if (!db.objectStoreNames.contains('tombstones')) {
        const store = db.createObjectStore('tombstones', { keyPath: ['resource', 'recordId'] });
        store.createIndex('by_resource', 'resource', { unique: false });
      }

      // 4. Blobs
      if (!db.objectStoreNames.contains('blobs')) {
        db.createObjectStore('blobs', { keyPath: 'id' });
      }

      // 5. Metadata
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      dbConnections.set(dbName, db);
      db.onclose = () => {
        dbConnections.delete(dbName);
      };
      resolve(db);
    };

    request.onerror = () => {
      reject(new SandboxStorageError('Gagal membuka basis data cache IndexedDB demo.'));
    };

    request.onblocked = () => {
      reject(new SandboxStorageError('Akses IndexedDB demo terblokir oleh tab lain.'));
    };
  });
}

function runTransaction<T>(
  db: IDBDatabase,
  storeNames: string | string[],
  mode: IDBTransactionMode,
  runner: (stores: Record<string, IDBObjectStore>, transaction: IDBTransaction) => Promise<T> | T
): Promise<T> {
  return new Promise((resolve, reject) => {
    try {
      const names = Array.isArray(storeNames) ? storeNames : [storeNames];
      const tx = db.transaction(names, mode);
      const storeMap: Record<string, IDBObjectStore> = {};
      for (const name of names) {
        storeMap[name] = tx.objectStore(name);
      }

      let result: T;
      let isCompleted = false;
      let runnerFinished = false;

      Promise.resolve(runner(storeMap, tx))
        .then((res) => {
          result = res;
          runnerFinished = true;
          if (isCompleted) {
            resolve(result);
          }
        })
        .catch((err) => {
          try {
            tx.abort();
          } catch {}
          reject(err);
        });

      tx.oncomplete = () => {
        isCompleted = true;
        if (runnerFinished) {
          resolve(result);
        }
      };
      tx.onerror = (e) => {
        e.preventDefault();
        try {
          handleDbError(tx.error);
        } catch (err) {
          reject(err);
        }
      };
      tx.onabort = () => {
        try {
          handleDbError(tx.error || new Error('Transaksi dibatalkan.'));
        } catch (err) {
          reject(err);
        }
      };
    } catch (err) {
      try {
        handleDbError(err);
      } catch (e) {
        reject(e);
      }
    }
  });
}

// ================= Snapshot Methods =================

export async function saveSnapshot<T>(
  sid: string,
  key: string,
  resource: SandboxResource,
  data: T,
  versionHash?: string
): Promise<void> {
  const db = await openSandboxDB(sid);
  const item: SandboxSnapshotItem<T> = {
    key,
    resource,
    data,
    versionHash,
    fetchedAt: Date.now(),
  };
  await runTransaction(db, 'snapshots', 'readwrite', (stores) => {
    stores.snapshots.put(item);
  });
}

export async function getSnapshot<T>(
  sid: string,
  key: string
): Promise<SandboxSnapshotItem<T> | null> {
  const db = await openSandboxDB(sid);
  return runTransaction(db, 'snapshots', 'readonly', (stores) => {
    return new Promise<SandboxSnapshotItem<T> | null>((resolve, reject) => {
      const req = stores.snapshots.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  });
}

// ================= Journal Methods =================

export async function addJournalEntry(
  sid: string,
  entry: Omit<SandboxJournalEntry, 'id' | 'createdAt'> & { id?: string }
): Promise<SandboxJournalEntry> {
  const db = await openSandboxDB(sid);
  const fullEntry: SandboxJournalEntry = {
    ...entry,
    id: entry.id || generateDemoId('op'),
    createdAt: Date.now(),
  };

  await runTransaction(db, 'journal', 'readwrite', (stores) => {
    stores.journal.put(fullEntry);
  });
  return fullEntry;
}

export async function getJournal(
  sid: string,
  resource?: SandboxResource
): Promise<SandboxJournalEntry[]> {
  const db = await openSandboxDB(sid);
  return runTransaction(db, 'journal', 'readonly', (stores) => {
    return new Promise<SandboxJournalEntry[]>((resolve, reject) => {
      let req: IDBRequest;
      if (resource) {
        const index = stores.journal.index('by_resource');
        req = index.getAll(resource);
      } else {
        req = stores.journal.getAll();
      }
      req.onsuccess = () => {
        const list = (req.result || []) as SandboxJournalEntry[];
        list.sort((a, b) => a.createdAt - b.createdAt);
        resolve(list);
      };
      req.onerror = () => reject(req.error);
    });
  });
}

export async function removeJournalEntry(sid: string, entryId: string): Promise<void> {
  const db = await openSandboxDB(sid);
  await runTransaction(db, 'journal', 'readwrite', (stores) => {
    stores.journal.delete(entryId);
  });
}

export async function removeJournalEntriesForRecord(
  sid: string,
  resource: SandboxResource,
  recordId: string
): Promise<void> {
  const db = await openSandboxDB(sid);
  await runTransaction(db, 'journal', 'readwrite', async (stores) => {
    const index = stores.journal.index('by_recordId');
    const req = index.getAll(recordId);
    await new Promise<void>((resolve, reject) => {
      req.onsuccess = () => {
        const entries = (req.result || []) as SandboxJournalEntry[];
        for (const e of entries) {
          if (e.resource === resource) {
            stores.journal.delete(e.id);
          }
        }
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
  });
}

export async function clearJournal(sid: string, resource?: SandboxResource): Promise<void> {
  const db = await openSandboxDB(sid);
  await runTransaction(db, 'journal', 'readwrite', async (stores) => {
    if (!resource) {
      stores.journal.clear();
      return;
    }
    const index = stores.journal.index('by_resource');
    const req = index.getAll(resource);
    await new Promise<void>((resolve, reject) => {
      req.onsuccess = () => {
        const entries = (req.result || []) as SandboxJournalEntry[];
        for (const e of entries) {
          stores.journal.delete(e.id);
        }
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
  });
}

// ================= Tombstone Methods =================

export async function addTombstone(
  sid: string,
  tombstone: Omit<SandboxTombstone, 'deletedAt'>
): Promise<void> {
  const db = await openSandboxDB(sid);
  const full: SandboxTombstone = {
    ...tombstone,
    deletedAt: Date.now(),
  };
  await runTransaction(db, 'tombstones', 'readwrite', (stores) => {
    stores.tombstones.put(full);
  });
}

export async function removeTombstone(
  sid: string,
  resource: SandboxResource,
  recordId: string
): Promise<void> {
  const db = await openSandboxDB(sid);
  await runTransaction(db, 'tombstones', 'readwrite', (stores) => {
    stores.tombstones.delete([resource, recordId]);
  });
}

export async function getTombstones(
  sid: string,
  resource?: SandboxResource
): Promise<SandboxTombstone[]> {
  const db = await openSandboxDB(sid);
  return runTransaction(db, 'tombstones', 'readonly', (stores) => {
    return new Promise<SandboxTombstone[]>((resolve, reject) => {
      let req: IDBRequest;
      if (resource) {
        const index = stores.tombstones.index('by_resource');
        req = index.getAll(resource);
      } else {
        req = stores.tombstones.getAll();
      }
      req.onsuccess = () => resolve((req.result || []) as SandboxTombstone[]);
      req.onerror = () => reject(req.error);
    });
  });
}

export async function getTombstoneSet(
  sid: string,
  resource: SandboxResource,
  includePermanent: boolean = true
): Promise<Set<string>> {
  const list = await getTombstones(sid, resource);
  const set = new Set<string>();
  for (const t of list) {
    if (!t.isPermanent || includePermanent) {
      set.add(t.recordId);
    }
  }
  return set;
}

// ================= Blob Methods =================

export async function saveBlob(
  sid: string,
  id: string,
  fileOrBlob: Blob | File,
  fileName?: string,
  mimeType?: string
): Promise<SandboxBlobItem> {
  const db = await openSandboxDB(sid);
  const resolvedFileName = fileName || (fileOrBlob instanceof File ? fileOrBlob.name : `attachment-${id}.dat`);
  const resolvedMime = mimeType || fileOrBlob.type || 'application/octet-stream';

  const item: SandboxBlobItem = {
    id,
    fileName: resolvedFileName,
    mimeType: resolvedMime,
    size: fileOrBlob.size,
    blob: fileOrBlob,
    createdAt: Date.now(),
  };

  await runTransaction(db, 'blobs', 'readwrite', (stores) => {
    stores.blobs.put(item);
  });
  return item;
}

export async function getBlob(sid: string, id: string): Promise<SandboxBlobItem | null> {
  const db = await openSandboxDB(sid);
  return runTransaction(db, 'blobs', 'readonly', (stores) => {
    return new Promise<SandboxBlobItem | null>((resolve, reject) => {
      const req = stores.blobs.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  });
}

export async function deleteBlob(sid: string, id: string): Promise<void> {
  const db = await openSandboxDB(sid);
  await runTransaction(db, 'blobs', 'readwrite', (stores) => {
    stores.blobs.delete(id);
  });
}

// ================= Metadata Methods =================

export async function setMetadata<T>(sid: string, key: string, value: T): Promise<void> {
  const db = await openSandboxDB(sid);
  await runTransaction(db, 'metadata', 'readwrite', (stores) => {
    stores.metadata.put({ key, value, updatedAt: Date.now() });
  });
}

export async function getMetadata<T>(sid: string, key: string): Promise<T | null> {
  const db = await openSandboxDB(sid);
  return runTransaction(db, 'metadata', 'readonly', (stores) => {
    return new Promise<T | null>((resolve, reject) => {
      const req = stores.metadata.get(key);
      req.onsuccess = () => resolve(req.result ? req.result.value : null);
      req.onerror = () => reject(req.error);
    });
  });
}

// ================= Reset & Cleanup =================

export async function clearAllForSid(sid: string): Promise<void> {
  if (!sid) return;
  const db = await openSandboxDB(sid);
  await runTransaction(
    db,
    ['snapshots', 'journal', 'tombstones', 'blobs', 'metadata'],
    'readwrite',
    (stores) => {
      stores.snapshots.clear();
      stores.journal.clear();
      stores.tombstones.clear();
      stores.blobs.clear();
      stores.metadata.clear();
    }
  );
}

export async function deleteSandboxDatabase(sid: string): Promise<void> {
  if (!sid || !isIndexedDbAvailable()) return;
  const dbName = getDbName(sid);
  const conn = dbConnections.get(dbName);
  if (conn) {
    try {
      conn.close();
    } catch {}
    dbConnections.delete(dbName);
  }

  return new Promise((resolve) => {
    const req = indexedDB.deleteDatabase(dbName);
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
    req.onblocked = () => resolve();
  });
}
