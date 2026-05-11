import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DashboardCard } from '@/components/insight/dashboard/DashboardCard';
import { ChartTooltip } from '@/components/insight/dashboard/ChartTooltip';
import { InsightDataEmpty } from '@/components/insight/InsightDataEmpty';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInsightDashboard } from '@/contexts/InsightDashboardContext';
import { getInsightStats, type WorkCoverageData, type InsightStatsResponse } from '@/repositories/insight.repository';
import { getInsightErrorMessage } from '@/lib/insight-errors';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

type WorkCoverageTab = 'working' | 'entrepreneur';

const TAB_CONFIG: Record<
  WorkCoverageTab,
  {
    title: string;
    localLabel: string;
    nationalLabel: string;
    multinationalLabel: string;
    emptyText: string;
  }
> = {
  working: {
    title: 'Bekerja',
    localLabel: 'Lokal/Wilayah',
    nationalLabel: 'Nasional',
    multinationalLabel: 'Multinasional/ Internasional',
    emptyText: 'Belum ada data alumni bekerja pada filter ini.',
  },
  entrepreneur: {
    title: 'Wirausaha',
    localLabel: 'Lokal/Wilayah/ Berwirausaha tidak Berizin',
    nationalLabel: 'Nasional/ Berwirausaha Berizin',
    multinationalLabel: 'Multinasional/ Internasional',
    emptyText: 'Belum ada data alumni wirausaha pada filter ini.',
  },
};

function WorkCoverageLegend({
  payload = [],
  isMobile,
}: {
  payload?: Array<{ color?: string; value?: string }>;
  isMobile: boolean;
}) {
  if (!payload.length) return null;

  return (
    <div
      className={cn(
        'mt-4 flex gap-2 text-xs text-muted-foreground sm:text-sm',
        isMobile ? 'flex-col items-start' : 'flex-wrap items-center justify-center gap-x-4 gap-y-2'
      )}
    >
      {payload.map((entry) => (
        <div key={`${entry.value}-${entry.color}`} className="flex items-start gap-2">
          <span
            className="mt-1 h-2.5 w-2.5 shrink-0 rounded-sm"
            style={{ backgroundColor: entry.color || 'hsl(var(--muted-foreground))' }}
          />
          <span className="leading-relaxed">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function WorkCoverage() {
  const { selectedYear } = useInsightDashboard();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<WorkCoverageTab>('working');
  const [data, setData] = useState<WorkCoverageData | null>(null);
  const [meta, setMeta] = useState<InsightStatsResponse['meta']>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const yearParam = selectedYear === 'all' ? undefined : (selectedYear as number);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getInsightStats('work_coverage', yearParam)
      .then((res) => {
        if (cancelled) return;
        const typed = res as InsightStatsResponse<WorkCoverageData>;
        if (typed.success && typed.data) {
          setData(typed.data);
          setMeta(typed.meta ?? null);
        } else {
          setError(getInsightErrorMessage(res.error));
        }
      })
      .catch(() => {
        if (!cancelled) setError('Gagal memuat data');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [yearParam]);

  const config = TAB_CONFIG[activeTab];
  const hasSplitByStatus = useMemo(() => {
    if (!data?.by_year_by_status) return false;
    return Array.isArray(data.by_year_by_status.working) || Array.isArray(data.by_year_by_status.entrepreneur);
  }, [data]);

  const byYear = hasSplitByStatus
    ? activeTab === 'working'
      ? (data?.by_year_by_status?.working ?? [])
      : (data?.by_year_by_status?.entrepreneur ?? [])
    : (data?.by_year ?? []);

  const chartData = byYear.map((row) => ({
    year: String(row.year),
    [config.localLabel]: row.local,
    [config.nationalLabel]: row.national,
    [config.multinationalLabel]: row.multinational,
  }));

  const totalLocal = byYear.reduce((sum, row) => sum + row.local, 0);
  const totalNational = byYear.reduce((sum, row) => sum + row.national, 0);
  const totalMultinational = byYear.reduce((sum, row) => sum + row.multinational, 0);
  const totalTab = totalLocal + totalNational + totalMultinational;

  const localPct = totalTab > 0 ? ((totalLocal / totalTab) * 100).toFixed(1) : '0';
  const nationalPct = totalTab > 0 ? ((totalNational / totalTab) * 100).toFixed(1) : '0';
  const multinationalPct = totalTab > 0 ? ((totalMultinational / totalTab) * 100).toFixed(1) : '0';
  const yearText = yearParam ? ` tahun ${yearParam}` : '';
  const interpretation = totalTab > 0
    ? `Cakupan kerja lulusan (tab ${config.title})${yearText}: ${localPct}% ${config.localLabel}, ${nationalPct}% ${config.nationalLabel}, ${multinationalPct}% ${config.multinationalLabel}.`
    : config.emptyText;

  return (
    <DashboardCard
      title="Cakupan Kerja Lulusan"
      description="Pisahkan analisis tab Bekerja dan tab Wirausaha per tahun lulus."
      interpretation={interpretation}
      chartMeta={meta ?? undefined}
    >
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as WorkCoverageTab)} className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 bg-muted/60 p-1">
          <TabsTrigger value="working" className="h-auto text-xs sm:text-sm">
            Bekerja
          </TabsTrigger>
          <TabsTrigger value="entrepreneur" className="h-auto text-xs sm:text-sm">
            Wirausaha
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          {loading ? (
            <div className="flex min-h-[240px] items-center justify-center text-muted-foreground sm:min-h-[280px]">Memuat data...</div>
          ) : error ? (
            <div className="flex min-h-[240px] flex-col items-center justify-center px-4 py-16 text-center text-muted-foreground sm:min-h-[280px]">
              <p className="font-medium text-destructive">{error}</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex min-h-[240px] items-center justify-center sm:min-h-[280px]">
              <InsightDataEmpty />
            </div>
          ) : (
            <div className="w-full">
              <div className="h-[240px] w-full sm:h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={isMobile ? { top: 12, right: 8, left: 0, bottom: 0 } : { top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: isMobile ? 10 : 12 }} axisLine={{ stroke: 'hsl(var(--border))' }} />
                    <YAxis allowDecimals={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: isMobile ? 10 : 12 }} axisLine={{ stroke: 'hsl(var(--border))' }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend content={<WorkCoverageLegend isMobile={isMobile} />} />
                    <Bar activeBar dataKey={config.localLabel} fill="hsl(var(--level-local))" radius={[4, 4, 0, 0]} />
                    <Bar activeBar dataKey={config.nationalLabel} fill="hsl(var(--level-national))" radius={[4, 4, 0, 0]} />
                    <Bar activeBar dataKey={config.multinationalLabel} fill="hsl(var(--level-international))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground sm:mt-2">Total {totalTab} alumni</p>
            </div>
          )}
        </div>
      </Tabs>
    </DashboardCard>
  );
}
