/**
 * Demo Mode Banner Component
 * Permanent banner for demo sessions providing visibility into sandbox status,
 * manual sync triggers, and instant demo modifications reset.
 */

import React, { useState } from 'react';
import { useLoggedInDemo } from '@/contexts/AlumniContext';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Database,
  RefreshCw,
  RotateCcw,
  Sparkles,
  WifiOff,
  X,
} from 'lucide-react';

export function DemoModeBanner() {
  const {
    isDemoMode,
    demoSyncState,
    syncDemoFromProduction,
    resetDemoChanges,
  } = useLoggedInDemo();

  const [isSyncing, setIsSyncing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [conflictDismissed, setConflictDismissed] = useState(false);

  if (!isDemoMode) {
    return null;
  }

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await syncDemoFromProduction(true);
      if (res.success) {
        if (res.conflicts.length > 0) {
          setSyncFeedback(
            `Sinkron selesai dengan ${res.conflicts.length} penyesuaian konflik (versi produksi diutamakan).`
          );
        } else {
          setSyncFeedback('Berhasil disinkronkan dengan data produksi terbaru.');
        }
      } else {
        setSyncFeedback(res.error || 'Sinkronisasi gagal.');
      }
    } catch {
      setSyncFeedback('Terjadi kesalahan saat menyinkronkan data.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 5000);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetDemoChanges();
      setShowConfirmReset(false);
      setSyncFeedback('Semua perubahan simulasi telah dibersihkan. Memuat ulang data produksi...');
      setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch {
      setSyncFeedback('Gagal mereset perubahan simulasi.');
    } finally {
      setIsResetting(false);
    }
  };

  const status = demoSyncState.syncStatus;
  const pendingCount = demoSyncState.pendingOperationsCount;
  const conflict = demoSyncState.lastConflict;

  return (
    <div className="w-full bg-linear-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-b border-amber-500/30 text-foreground text-xs sm:text-sm px-3 py-2 sm:px-6 sticky top-0 z-40 shadow-xs backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5">
        {/* Left Side: Tag & Explanation */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-xs bg-amber-500 text-amber-950 dark:bg-amber-400 dark:text-amber-950 shadow-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Demo Mode
          </span>
          <span className="font-medium text-amber-950 dark:text-amber-100">
            Perubahan hanya sementara di browser Anda. Database & file produksi tidak akan dimodifikasi.
          </span>
        </div>

        {/* Right Side: Status Badge & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap self-end md:self-center">
          {/* Sync Status Indicator */}
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-background/80 border border-border/60">
            {status === 'synced' && (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-300">Tersinkron</span>
              </>
            )}
            {status === 'syncing' && (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                <span className="text-blue-700 dark:text-blue-300">Menyinkronkan...</span>
              </>
            )}
            {status === 'stale' && (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="text-amber-700 dark:text-amber-300">Data Lokal (Stale)</span>
              </>
            )}
            {status === 'conflict' && (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                <span className="text-orange-700 dark:text-orange-300">Ada Konflik</span>
              </>
            )}
          </div>

          {/* Pending Changes Count */}
          {pendingCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-500/30">
              <Database className="w-3 h-3" />
              {pendingCount} perubahan demo
            </span>
          )}

          {/* Manual Sync Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleSync}
            disabled={isSyncing}
            className="h-7 px-2.5 text-xs bg-background/90 hover:bg-amber-500/10 border-amber-500/40 text-foreground font-medium"
            title="Ambil data terbaru dari server produksi"
          >
            <RefreshCw className={`w-3 h-3 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
            Sinkronkan
          </Button>

          {/* Reset Changes Button */}
          {!showConfirmReset ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowConfirmReset(true)}
              disabled={isResetting || pendingCount === 0}
              className="h-7 px-2.5 text-xs bg-background/90 hover:bg-destructive/10 border-border/80 text-muted-foreground hover:text-destructive font-medium"
              title="Bersihkan semua perubahan yang disimpan di cache browser ini"
            >
              <RotateCcw className="w-3 h-3 mr-1.5" />
              Reset
            </Button>
          ) : (
            <div className="flex items-center gap-1.5 bg-background border border-destructive/50 rounded-lg p-1 animate-in fade-in zoom-in-95">
              <span className="text-[11px] text-destructive font-medium px-1.5">Reset semua?</span>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleReset}
                disabled={isResetting}
                className="h-6 px-2 text-[11px]"
              >
                {isResetting ? 'Mereset...' : 'Ya, Reset'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowConfirmReset(false)}
                className="h-6 px-2 text-[11px]"
              >
                Batal
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Sync Feedback Toast message */}
      {syncFeedback && (
        <div className="mt-1.5 text-xs text-amber-950 dark:text-amber-200 bg-amber-500/20 border border-amber-500/30 rounded-md px-2.5 py-1 flex items-center justify-between animate-in fade-in">
          <span>{syncFeedback}</span>
          <button
            type="button"
            onClick={() => setSyncFeedback(null)}
            className="text-muted-foreground hover:text-foreground ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Conflict Warning Bar */}
      {conflict && !conflictDismissed && (
        <div className="mt-1.5 text-xs text-orange-950 dark:text-orange-100 bg-orange-500/25 border border-orange-500/40 rounded-md px-2.5 py-1.5 flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
            <span>
              <strong>Konflik diselesaikan:</strong> {conflict.message}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setConflictDismissed(true)}
            className="text-muted-foreground hover:text-foreground shrink-0"
            title="Tutup pesan ini"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
