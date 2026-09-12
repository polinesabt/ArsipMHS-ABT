/**
 * Demo Sandbox Synchronization Engine
 * Handles window focus & manual sync, fetches production snapshots,
 * executes "production-wins" conflict resolution, and manages stale/offline status.
 */

import {
  clearAllForSid,
  getJournal,
  getTombstones,
  removeJournalEntriesForRecord,
  removeJournalEntry,
  removeTombstone,
  saveSnapshot,
} from './sandbox-db';
import { generateDemoId } from './sandbox-id';
import { sandboxSession } from './sandbox-session';
import type { SandboxConflictEvent } from './sandbox-types';
import { getApiBaseUrl } from '../api-client';

const SYNC_THROTTLE_MS = 10000; // Minimal interval 10s between auto-syncs on window focus
let lastSyncTimestamp = 0;
let isSyncInProgress = false;
let focusListenerAttached = false;

interface RawFetchOptions {
  headers?: Record<string, string>;
}

async function fetchRawProduction<T>(endpoint: string, options: RawFetchOptions = {}): Promise<T | null> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const url = `${getApiBaseUrl()}/${endpoint.replace(/^\/+/, '')}`;

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}`, 'X-Auth-Token': token } : {}),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, { method: 'GET', headers, cache: 'no-cache' });
    if (!res.ok) {
      return null;
    }
    const json = await res.json().catch(() => null);
    return json as T;
  } catch (err) {
    console.warn(`[SandboxSync] Failed to fetch raw production for ${endpoint}:`, err);
    return null;
  }
}

/**
 * Synchronize Demo Sandbox with latest production data.
 * Adheres to strict "production-wins" conflict resolution.
 */
export async function syncDemoFromProduction(force: boolean = false): Promise<{
  success: boolean;
  conflicts: SandboxConflictEvent[];
  error?: string;
}> {
  const sid = sandboxSession.getSid();
  if (!sid || !sandboxSession.isDemoActive()) {
    return { success: false, conflicts: [], error: 'Demo mode is not active.' };
  }

  const now = Date.now();
  if (!force && isSyncInProgress) {
    return { success: true, conflicts: [] };
  }

  if (!force && now - lastSyncTimestamp < SYNC_THROTTLE_MS) {
    return { success: true, conflicts: [] };
  }

  isSyncInProgress = true;
  sandboxSession.setSyncStatus('syncing');

  const detectedConflicts: SandboxConflictEvent[] = [];

  try {
    // 1. Fetch fresh production data for active resources
    const [studentsRes, tracerRes, achievementsRes, adminsRes, settingsRes] = await Promise.all([
      fetchRawProduction<any>('students/list.php?per_page=500'),
      fetchRawProduction<any>('tracer/list.php'),
      fetchRawProduction<any>('achievements/list.php?per_page=500'),
      fetchRawProduction<any>('admins/list.php'),
      fetchRawProduction<any>('settings/get.php'),
    ]);

    // If all essential requests failed, we are likely offline or server is unreachable
    if (!studentsRes && !achievementsRes && !adminsRes) {
      sandboxSession.setSyncStatus('stale');
      isSyncInProgress = false;
      return { success: false, conflicts: [], error: 'Gagal terhubung ke server produksi. Data ditampilkan dalam status kedaluwarsa (stale).' };
    }

    // 2. Cache valid snapshots
    if (studentsRes) {
      await saveSnapshot(sid, 'students/list', 'students', studentsRes);
    }
    if (tracerRes) {
      await saveSnapshot(sid, 'tracer/list', 'tracer', tracerRes);
    }
    if (achievementsRes) {
      await saveSnapshot(sid, 'achievements/list', 'achievements', achievementsRes);
    }
    if (adminsRes) {
      await saveSnapshot(sid, 'admins/list', 'admins', adminsRes);
    }
    if (settingsRes) {
      await saveSnapshot(sid, 'settings/get', 'settings', settingsRes);
    }

    // 3. Perform Conflict Resolution (Production Wins)
    const journal = await getJournal(sid);
    const tombstones = await getTombstones(sid);

    // Extract production maps for fast lookup
    const prodStudentsList: any[] = Array.isArray(studentsRes?.data) ? studentsRes.data : (Array.isArray(studentsRes) ? studentsRes : []);
    const prodStudentsMap = new Map<string, any>(prodStudentsList.map((s) => [String(s.id), s]));
    const prodStudentsNimSet = new Set<string>(prodStudentsList.map((s) => String(s.nim || '').trim()));

    const prodTracerList: any[] = Array.isArray(tracerRes?.data) ? tracerRes.data : (Array.isArray(tracerRes) ? tracerRes : []);
    const prodTracerMap = new Map<string, any>(prodTracerList.map((t) => [String(t.id), t]));

    const prodAchList: any[] = Array.isArray(achievementsRes?.data) ? achievementsRes.data : (Array.isArray(achievementsRes) ? achievementsRes : []);
    const prodAchMap = new Map<string, any>(prodAchList.map((a) => [String(a.id), a]));

    const prodAdminsList: any[] = Array.isArray(adminsRes?.data) ? adminsRes.data : (Array.isArray(adminsRes) ? adminsRes : []);
    const prodAdminsMap = new Map<string, any>(prodAdminsList.map((a) => [String(a.id), a]));
    const prodAdminUsernames = new Set<string>(prodAdminsList.map((a) => String(a.username || '').toLowerCase().trim()));

    // Check Journal Entries
    for (const entry of journal) {
      if (entry.operation === 'create') {
        // Unique identity collision check
        if (entry.resource === 'students' && entry.uniqueKeys?.nim) {
          const nim = String(entry.uniqueKeys.nim).trim();
          if (prodStudentsNimSet.has(nim)) {
            // Collision: Prod created a student with this NIM -> Prod wins, discard local create
            await removeJournalEntriesForRecord(sid, 'students', entry.recordId);
            const conflict: SandboxConflictEvent = {
              id: generateDemoId('cnf'),
              resource: 'students',
              recordId: entry.recordId,
              reason: 'unique_collision',
              message: `Mahasiswa dengan NIM ${nim} telah dibuat di produksi. Perubahan lokal demo dibatalkan demi integritas.`,
              timestamp: Date.now(),
              discardedPayload: entry.payload,
            };
            detectedConflicts.push(conflict);
            sandboxSession.recordConflict(conflict);
          }
        } else if (entry.resource === 'admins' && entry.uniqueKeys?.username) {
          const username = String(entry.uniqueKeys.username).toLowerCase().trim();
          if (prodAdminUsernames.has(username)) {
            await removeJournalEntriesForRecord(sid, 'admins', entry.recordId);
            const conflict: SandboxConflictEvent = {
              id: generateDemoId('cnf'),
              resource: 'admins',
              recordId: entry.recordId,
              reason: 'unique_collision',
              message: `Admin dengan username "${username}" telah dibuat di produksi. Akun demo lokal dibatalkan.`,
              timestamp: Date.now(),
              discardedPayload: entry.payload,
            };
            detectedConflicts.push(conflict);
            sandboxSession.recordConflict(conflict);
          }
        }
      } else if (entry.operation === 'update') {
        // Check if prod record changed or was deleted
        let prodRecord: any = null;
        if (entry.resource === 'students') prodRecord = prodStudentsMap.get(entry.recordId);
        else if (entry.resource === 'tracer') prodRecord = prodTracerMap.get(entry.recordId);
        else if (entry.resource === 'achievements') prodRecord = prodAchMap.get(entry.recordId);
        else if (entry.resource === 'admins') prodRecord = prodAdminsMap.get(entry.recordId);

        if (!prodRecord && (studentsRes || tracerRes || achievementsRes || adminsRes)) {
          // Record was deleted in production -> prod wins, discard update
          await removeJournalEntry(sid, entry.id);
          const conflict: SandboxConflictEvent = {
            id: generateDemoId('cnf'),
            resource: entry.resource,
            recordId: entry.recordId,
            reason: 'prod_deleted',
            message: `Data ${entry.resource} #${entry.recordId} telah dihapus di produksi. Perubahan simulasi demo dibatalkan.`,
            timestamp: Date.now(),
            discardedPayload: entry.patch,
          };
          detectedConflicts.push(conflict);
          sandboxSession.recordConflict(conflict);
        } else if (prodRecord && entry.baseVersion?.updated_at) {
          const prodUpdatedAt = prodRecord.updated_at || prodRecord.last_updated;
          if (prodUpdatedAt && prodUpdatedAt !== entry.baseVersion.updated_at) {
            // Prod record was modified by another user -> prod wins, discard local patch
            await removeJournalEntry(sid, entry.id);
            const conflict: SandboxConflictEvent = {
              id: generateDemoId('cnf'),
              resource: entry.resource,
              recordId: entry.recordId,
              reason: 'prod_updated',
              message: `Data ${entry.resource} #${entry.recordId} telah diperbarui di produksi. Versi produksi digunakan.`,
              timestamp: Date.now(),
              discardedPayload: entry.patch,
            };
            detectedConflicts.push(conflict);
            sandboxSession.recordConflict(conflict);
          }
        }
      }
    }

    // Check Tombstones: if prod record was already deleted or resurrected
    for (const tomb of tombstones) {
      let prodRecord: any = null;
      if (tomb.resource === 'students') prodRecord = prodStudentsMap.get(tomb.recordId);
      else if (tomb.resource === 'tracer') prodRecord = prodTracerMap.get(tomb.recordId);
      else if (tomb.resource === 'achievements') prodRecord = prodAchMap.get(tomb.recordId);
      else if (tomb.resource === 'admins') prodRecord = prodAdminsMap.get(tomb.recordId);

      // If record is already gone in prod, clean up tombstone
      if (!prodRecord && (studentsRes || tracerRes || achievementsRes || adminsRes)) {
        await removeTombstone(sid, tomb.resource, tomb.recordId);
      }
    }

    // Update session metrics
    const remainingJournal = await getJournal(sid);
    sandboxSession.setPendingOperationsCount(remainingJournal.length);

    lastSyncTimestamp = Date.now();

    if (detectedConflicts.length > 0) {
      sandboxSession.setSyncStatus('conflict');
    } else {
      sandboxSession.setSyncStatus('synced');
    }

    // Dispatch custom event for UI updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('sandbox:synced', {
          detail: {
            timestamp: lastSyncTimestamp,
            conflictsCount: detectedConflicts.length,
          },
        })
      );
    }

    return { success: true, conflicts: detectedConflicts };
  } catch (err: any) {
    console.error('[SandboxSync] Error during synchronization:', err);
    sandboxSession.setSyncStatus('stale');
    return { success: false, conflicts: [], error: err?.message || 'Sinkronisasi gagal.' };
  } finally {
    isSyncInProgress = false;
  }
}

/**
 * Reset all local sandbox modifications and restore clean production views.
 */
export async function resetDemoChanges(): Promise<void> {
  const sid = sandboxSession.getSid();
  if (!sid) return;

  try {
    await clearAllForSid(sid);
    sandboxSession.setPendingOperationsCount(0);
    sandboxSession.clearConflict();
    sandboxSession.setSyncStatus('synced');

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sandbox:reset', { detail: { sid } }));
      // Notify user via console
      console.info('[SandboxSync] Semua perubahan demo lokal telah direset.');
    }
  } catch (err) {
    console.error('[SandboxSync] Error resetting sandbox changes:', err);
    throw err;
  }
}

/**
 * Handle window focus event to automatically sync when returning to tab.
 */
function handleWindowFocus(): void {
  if (sandboxSession.isDemoActive()) {
    void syncDemoFromProduction(false);
  }
}

/**
 * Setup lifecycle listeners for sandbox sync.
 */
export function setupSandboxSync(): void {
  if (typeof window === 'undefined' || focusListenerAttached) return;
  window.addEventListener('focus', handleWindowFocus);
  focusListenerAttached = true;
}

/**
 * Teardown lifecycle listeners for sandbox sync.
 */
export function teardownSandboxSync(): void {
  if (typeof window === 'undefined' || !focusListenerAttached) return;
  window.removeEventListener('focus', handleWindowFocus);
  focusListenerAttached = false;
}
