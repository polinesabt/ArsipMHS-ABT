/**
 * Demo Sandbox Session Manager
 * Tracks the current session ID (sid), synchronization status, active conflicts,
 * and handles session teardown upon logout or token expiration.
 */

import type {
  DemoSessionState,
  DemoSyncStatus,
  SandboxConflictEvent,
} from './sandbox-types';
import { deleteSandboxDatabase } from './sandbox-db';

const DEMO_SID_KEY = 'sipal-demo-sid';
const DEMO_USER_KEY = 'sipal-demo-session';

function extractSidFromToken(token: string | null): string | null {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
    const parsed = JSON.parse(atob(padded)) as { sid?: string; demo_mode?: boolean; role?: string };
    if (parsed && (parsed.demo_mode || parsed.role === 'demo') && parsed.sid) {
      return String(parsed.sid);
    }
  } catch {}
  return null;
}

class SandboxSessionManager {
  private currentSid: string | null = null;
  private syncStatus: DemoSyncStatus = 'synced';
  private lastSyncedAt: number | null = null;
  private pendingOpsCount: number = 0;
  private lastConflict: SandboxConflictEvent | null = null;
  private stateListeners = new Set<(state: DemoSessionState) => void>();
  private conflictListeners = new Set<(conflict: SandboxConflictEvent) => void>();

  constructor() {
    if (typeof window !== 'undefined') {
      const storedSid = localStorage.getItem(DEMO_SID_KEY);
      const tokenSid = extractSidFromToken(localStorage.getItem('authToken'));
      this.currentSid = storedSid || tokenSid || null;
      if (this.currentSid && !storedSid) {
        localStorage.setItem(DEMO_SID_KEY, this.currentSid);
      }

      // Listen to cross-tab storage changes
      window.addEventListener('storage', (e) => {
        if (e.key === DEMO_SID_KEY || e.key === 'authToken') {
          const newSid = localStorage.getItem(DEMO_SID_KEY) || extractSidFromToken(localStorage.getItem('authToken'));
          if (newSid !== this.currentSid) {
            this.currentSid = newSid;
            this.notifyState();
          }
        }
      });
    }
  }

  public getSid(): string | null {
    if (!this.currentSid && typeof window !== 'undefined') {
      this.currentSid = localStorage.getItem(DEMO_SID_KEY) || extractSidFromToken(localStorage.getItem('authToken'));
    }
    return this.currentSid;
  }

  public isDemoActive(): boolean {
    const sid = this.getSid();
    if (!sid) return false;
    if (typeof window === 'undefined') return false;
    return Boolean(localStorage.getItem(DEMO_USER_KEY) || localStorage.getItem('authToken'));
  }

  public async startSession(sid: string, userData?: any): Promise<void> {
    this.currentSid = sid;
    this.syncStatus = 'synced';
    this.lastSyncedAt = Date.now();
    this.pendingOpsCount = 0;
    this.lastConflict = null;

    if (typeof window !== 'undefined') {
      localStorage.setItem(DEMO_SID_KEY, sid);
      if (userData) {
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(userData));
      }
    }
    this.notifyState();
  }

  public async endSession(): Promise<void> {
    const sid = this.currentSid;
    this.currentSid = null;
    this.syncStatus = 'synced';
    this.lastSyncedAt = null;
    this.pendingOpsCount = 0;
    this.lastConflict = null;

    if (typeof window !== 'undefined') {
      localStorage.removeItem(DEMO_SID_KEY);
      localStorage.removeItem(DEMO_USER_KEY);
    }

    if (sid) {
      try {
        await deleteSandboxDatabase(sid);
      } catch (err) {
        console.error('[SandboxSession] Error deleting sandbox DB for sid:', sid, err);
      }
    }
    this.notifyState();
  }

  public setSyncStatus(status: DemoSyncStatus): void {
    this.syncStatus = status;
    if (status === 'synced') {
      this.lastSyncedAt = Date.now();
    }
    this.notifyState();
  }

  public setPendingOperationsCount(count: number): void {
    this.pendingOpsCount = Math.max(0, count);
    this.notifyState();
  }

  public recordConflict(conflict: SandboxConflictEvent): void {
    this.lastConflict = conflict;
    this.syncStatus = 'conflict';
    for (const listener of this.conflictListeners) {
      try {
        listener(conflict);
      } catch (e) {
        console.error('[SandboxSession] conflict listener error', e);
      }
    }
    this.notifyState();
  }

  public clearConflict(): void {
    this.lastConflict = null;
    if (this.syncStatus === 'conflict') {
      this.syncStatus = 'synced';
    }
    this.notifyState();
  }

  public getState(): DemoSessionState {
    return {
      sid: this.currentSid || '',
      isActive: this.isDemoActive(),
      syncStatus: this.syncStatus,
      lastSyncedAt: this.lastSyncedAt,
      pendingOperationsCount: this.pendingOpsCount,
      lastConflict: this.lastConflict,
    };
  }

  public subscribe(listener: (state: DemoSessionState) => void): () => void {
    this.stateListeners.add(listener);
    listener(this.getState());
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  public onConflict(listener: (conflict: SandboxConflictEvent) => void): () => void {
    this.conflictListeners.add(listener);
    return () => {
      this.conflictListeners.delete(listener);
    };
  }

  private notifyState(): void {
    const state = this.getState();
    for (const listener of this.stateListeners) {
      try {
        listener(state);
      } catch (e) {
        console.error('[SandboxSession] state listener error', e);
      }
    }
  }
}

export const sandboxSession = new SandboxSessionManager();
