import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Database,
  MoreHorizontal,
  RefreshCw,
  RotateCcw,
  WifiOff,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FloatingPopoverSurface } from '@/components/admin/FloatingIconPopup';
import { LongPressIconButton } from '@/components/admin/LongPressIconButton';
import { useLoggedInDemo } from '@/contexts/AlumniContext';

interface DemoModeOverflowMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_COPY = {
  synced: {
    label: 'Tersinkron',
    className: 'text-emerald-700 dark:text-emerald-300',
    Icon: CheckCircle2,
  },
  syncing: {
    label: 'Menyinkronkan...',
    className: 'text-blue-700 dark:text-blue-300',
    Icon: RefreshCw,
  },
  stale: {
    label: 'Data lokal perlu diperbarui',
    className: 'text-amber-700 dark:text-amber-300',
    Icon: WifiOff,
  },
  conflict: {
    label: 'Ada konflik data',
    className: 'text-orange-700 dark:text-orange-300',
    Icon: AlertTriangle,
  },
} as const;

export function DemoModeOverflowMenu({ open, onOpenChange }: DemoModeOverflowMenuProps) {
  const { demoSyncState, syncDemoFromProduction, resetDemoChanges } = useLoggedInDemo();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [conflictDismissed, setConflictDismissed] = useState(false);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!open) setShowConfirmReset(false);
  }, [open]);

  const scheduleFeedbackClear = () => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => setSyncFeedback(null), 5000);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const result = await syncDemoFromProduction(true);
      if (result.success) {
        setSyncFeedback(
          result.conflicts.length > 0
            ? `Sinkron selesai dengan ${result.conflicts.length} penyesuaian konflik.`
            : 'Berhasil disinkronkan dengan data produksi terbaru.',
        );
      } else {
        setSyncFeedback(result.error || 'Sinkronisasi gagal.');
      }
    } catch {
      setSyncFeedback('Terjadi kesalahan saat menyinkronkan data.');
    } finally {
      setIsSyncing(false);
      scheduleFeedbackClear();
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetDemoChanges();
      setShowConfirmReset(false);
      setSyncFeedback('Perubahan demo dibersihkan. Memuat ulang data produksi...');
      reloadTimerRef.current = setTimeout(() => window.location.reload(), 700);
    } catch {
      setSyncFeedback('Gagal mereset perubahan demo.');
      scheduleFeedbackClear();
    } finally {
      setIsResetting(false);
    }
  };

  const status = STATUS_COPY[demoSyncState.syncStatus];
  const StatusIcon = status.Icon;
  const pendingCount = demoSyncState.pendingOperationsCount;
  const conflict = demoSyncState.lastConflict;

  return (
    <FloatingPopoverSurface
      open={open}
      onOpenChange={onOpenChange}
      ariaLabel="Status dan tindakan Demo Mode"
      contentRole="dialog"
      side="bottom"
      align="end"
      sideOffset={10}
      className="w-[min(20rem,calc(100vw-24px))] p-3.5"
      trigger={
        <LongPressIconButton
          label="Buka menu Demo Mode"
          tooltipSide="bottom"
          icon={<MoreHorizontal className="h-5 w-5" aria-hidden="true" />}
          aria-haspopup="dialog"
          aria-expanded={open}
          className="h-10 w-10 min-h-10 min-w-10 rounded-xl border border-border/70 bg-background/70 text-foreground"
        />
      }
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Demo Mode</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              Perubahan hanya disimpan sementara di browser ini.
            </p>
          </div>
          <span className={`inline-flex shrink-0 items-center gap-1.5 text-xs font-medium ${status.className}`}>
            <StatusIcon
              className={`h-3.5 w-3.5 ${demoSyncState.syncStatus === 'syncing' || isSyncing ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            {status.label}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/50 px-3 py-2">
          <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Database className="h-3.5 w-3.5" aria-hidden="true" />
            Perubahan tertunda
          </span>
          <span className="text-xs font-semibold tabular-nums text-foreground">{pendingCount}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleSync}
            disabled={isSyncing}
            className="h-10 justify-center"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} aria-hidden="true" />
            Sinkronkan
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setShowConfirmReset(true)}
            disabled={isResetting || pendingCount === 0}
            className="h-10 justify-center hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
          >
            <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
            Reset
          </Button>
        </div>

        {showConfirmReset && (
          <div className="rounded-lg border border-destructive/35 bg-destructive/5 p-2.5">
            <p className="text-xs font-medium text-destructive">Hapus semua perubahan demo?</p>
            <div className="mt-2 flex justify-end gap-2">
              <Button type="button" size="sm" variant="ghost" className="h-8" onClick={() => setShowConfirmReset(false)}>
                Batal
              </Button>
              <Button type="button" size="sm" variant="destructive" className="h-8" disabled={isResetting} onClick={handleReset}>
                {isResetting ? 'Mereset...' : 'Ya, reset'}
              </Button>
            </div>
          </div>
        )}

        {syncFeedback && (
          <div className="flex items-start justify-between gap-2 rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-xs leading-relaxed text-foreground" role="status">
            <span>{syncFeedback}</span>
            <button
              type="button"
              aria-label="Tutup pesan sinkronisasi"
              className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => setSyncFeedback(null)}
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        )}

        {conflict && !conflictDismissed && (
          <div className="flex items-start gap-2 rounded-lg border border-orange-500/35 bg-orange-500/10 px-3 py-2 text-xs leading-relaxed text-foreground" role="status">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" aria-hidden="true" />
            <span className="min-w-0 flex-1">{conflict.message}</span>
            <button
              type="button"
              aria-label="Tutup pesan konflik"
              className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => setConflictDismissed(true)}
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </FloatingPopoverSurface>
  );
}
