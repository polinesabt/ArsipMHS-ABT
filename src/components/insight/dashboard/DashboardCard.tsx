import { ReactNode } from 'react';
import { Info } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useInsightDashboard } from '@/contexts/InsightDashboardContext';
import type { ChartMeta } from '@/repositories/insight.repository';

interface DashboardCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  interpretation?: string;
  className?: string;
  headerAction?: ReactNode;
  /** Jika ada, tampilkan ikon info dengan penjelasan sumber data grafik */
  chartMeta?: ChartMeta | null;
}

export function DashboardCard({
  title,
  description,
  children,
  interpretation,
  className,
  headerAction,
  chartMeta,
}: DashboardCardProps) {
  const { presentationMode } = useInsightDashboard();

  return (
    <div
      className={cn(
        'dashboard-card h-full flex flex-col animate-fade-in',
        presentationMode && 'p-8',
        className
      )}
    >
      <div className="dashboard-card-header">
        <div>
          <div className="flex items-center gap-2">
            <h3 className={cn('dashboard-card-title', presentationMode && 'text-xl')}>
              {title}
            </h3>
            {chartMeta && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[min(20rem,calc(100vw-2rem))] text-sm sm:w-80" align="start">
                  <p className="font-medium mb-2">Penjelasan grafik</p>
                  <p className="text-muted-foreground mb-1"><strong>Rumus/Perhitungan:</strong> {chartMeta.calculation}</p>
                  <p className="text-muted-foreground mb-1"><strong>Sumber data:</strong> {chartMeta.source}</p>
                  {chartMeta.last_synced_at ? (
                    <p className="text-muted-foreground mb-1">
                      <strong>Tahun data / Terakhir sinkron:</strong>{' '}
                      {new Date(chartMeta.last_synced_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
                    </p>
                  ) : (
                    <p className="text-muted-foreground mb-1"><strong>Terakhir sinkron:</strong> Belum pernah</p>
                  )}
                  {interpretation && (
                    <p className="text-muted-foreground mt-2 pt-2 border-t">
                      <strong>Interpretasi singkat:</strong> {interpretation}
                    </p>
                  )}
                </PopoverContent>
              </Popover>
            )}
          </div>
          {description && (
            <p className="dashboard-card-description">{description}</p>
          )}
        </div>
        {headerAction}
      </div>

      <div className="flex min-h-[260px] flex-1 flex-col sm:min-h-[320px]">{children}</div>

      {interpretation && (
        <div className={cn('interpretation-text', presentationMode && 'text-base p-5')}>
          <strong className="text-foreground">Interpretasi:</strong> {interpretation}
        </div>
      )}
    </div>
  );
}
