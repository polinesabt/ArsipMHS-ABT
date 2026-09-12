import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export type ChartSkeletonKind = 'pie' | 'bar' | 'line';

interface ChartSkeletonProps {
  kind?: ChartSkeletonKind;
  className?: string;
}

/** Placeholder that preserves the chart area while data is loading. */
export function ChartSkeleton({ kind = 'line', className }: ChartSkeletonProps) {
  if (kind === 'pie') {
    return (
      <div className={cn('flex w-full flex-col items-center justify-center gap-4', className)} aria-label="Memuat grafik">
        <Skeleton className="h-44 w-44 rounded-full sm:h-52 sm:w-52" />
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          {[0, 1, 2].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <Skeleton className="h-2.5 w-2.5 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex w-full items-end justify-center gap-2 px-4 py-6', className)} aria-label="Memuat grafik">
      {Array.from({ length: 8 }, (_, index) => (
        <Skeleton
          key={index}
          className={cn(
            'w-full max-w-8 rounded-t-md rounded-b-none',
            kind === 'bar' ? 'h-24' : 'h-16',
            index % 3 === 0 && 'h-10',
            index % 3 === 1 && 'h-20',
          )}
        />
      ))}
    </div>
  );
}

interface ChartRefreshOverlayProps {
  label?: string;
}

/** Non-blocking refresh state shown over an already-rendered chart. */
export function ChartRefreshOverlay({ label = 'Memuat ulang data' }: ChartRefreshOverlayProps) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/55 backdrop-blur-[1px]">
      <div className="flex items-center gap-2 rounded-full border border-border/70 bg-card/95 px-3 py-2 text-xs font-medium text-foreground shadow-sm">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" aria-hidden="true" />
        <span>{label}</span>
      </div>
    </div>
  );
}
