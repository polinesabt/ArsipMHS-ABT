import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DashboardCard } from '@/components/insight/dashboard/DashboardCard';
import { ChartTooltip } from '@/components/insight/dashboard/ChartTooltip';
import { InsightDataEmpty } from '@/components/insight/InsightDataEmpty';
import { useInsightDashboard } from '@/contexts/InsightDashboardContext';
import { getInsightStats, type StudyPeriodData, type InsightStatsResponse } from '@/repositories/insight.repository';
import { getInsightErrorMessage } from '@/lib/insight-errors';
import { useIsMobile } from '@/hooks/use-mobile';

export function StudyPeriod() {
  const { selectedYear } = useInsightDashboard();
  const isMobile = useIsMobile();
  const [data, setData] = useState<StudyPeriodData | null>(null);
  const [meta, setMeta] = useState<InsightStatsResponse['meta']>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const yearParam = selectedYear === 'all' ? undefined : (selectedYear as number);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getInsightStats('study_period', yearParam)
      .then((res) => {
        if (cancelled) return;
        const typed = res as InsightStatsResponse<StudyPeriodData>;
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

  const byYear = data?.by_year ?? [];
  const hasData = byYear.length > 0;
  const chartData = byYear.map((row) => ({ ...row, year: String(row.year) }));
  const totalDiterima = data?.total_diterima ?? 0;
  const totalLulus = data?.total_lulus ?? 0;
  const graduationRate = totalDiterima ? ((totalLulus / totalDiterima) * 100).toFixed(1) : '0';
  const yearText = yearParam ? ` tahun ${yearParam}` : ' (semua tahun)';
  const interpretation = `Tingkat kelulusan${yearText}: ${graduationRate}% (${totalLulus.toLocaleString()} lulus dari ${totalDiterima.toLocaleString()} diterima).`;

  return (
    <DashboardCard
      title="Masa Studi Lulusan"
      description="Data mahasiswa diterima dan lulus per tahun"
      interpretation={interpretation}
      chartMeta={meta ?? undefined}
    >
      {loading ? (
        <div className="flex min-h-[240px] items-center justify-center text-muted-foreground sm:min-h-[280px]">
          Memuat data...
        </div>
      ) : error ? (
        <div className="flex min-h-[240px] flex-col items-center justify-center px-4 py-16 text-center text-muted-foreground sm:min-h-[280px]">
          <p className="font-medium text-destructive">{error}</p>
        </div>
      ) : !hasData ? (
        <div className="flex min-h-[240px] items-center justify-center sm:min-h-[280px]">
          <InsightDataEmpty />
        </div>
      ) : (
        <div className="h-[240px] w-full sm:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={isMobile ? { top: 12, right: 8, left: 0, bottom: 0 } : { top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="year"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: isMobile ? 10 : 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: isMobile ? 10 : 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: isMobile ? 12 : 20, fontSize: isMobile ? 10 : 12, lineHeight: 1.4 }}
                formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
              />
              <Bar activeBar dataKey="diterima" name="Diterima" fill="hsl(var(--chart-academic-light))" radius={[4, 4, 0, 0]} />
              <Bar activeBar dataKey="lulus" name="Lulus" fill="hsl(var(--chart-academic))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-3 text-center text-xs text-muted-foreground sm:mt-2">
            Total diterima: {data?.total_diterima ?? 0} · Lulus: {data?.total_lulus ?? 0}
          </p>
        </div>
      )}
    </DashboardCard>
  );
}
