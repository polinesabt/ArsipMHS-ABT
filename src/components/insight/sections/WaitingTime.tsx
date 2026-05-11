import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DashboardCard } from '@/components/insight/dashboard/DashboardCard';
import { ChartTooltip } from '@/components/insight/dashboard/ChartTooltip';
import { InsightDataEmpty } from '@/components/insight/InsightDataEmpty';
import { useInsightDashboard } from '@/contexts/InsightDashboardContext';
import { getInsightStats, type WaitingTimeData, type InsightStatsResponse } from '@/repositories/insight.repository';
import { getInsightErrorMessage } from '@/lib/insight-errors';
import { useIsMobile } from '@/hooks/use-mobile';

export function WaitingTime() {
  const { selectedYear } = useInsightDashboard();
  const isMobile = useIsMobile();
  const [data, setData] = useState<WaitingTimeData | null>(null);
  const [meta, setMeta] = useState<InsightStatsResponse['meta']>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const yearParam = selectedYear === 'all' ? undefined : (selectedYear as number);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getInsightStats('waiting_time', yearParam)
      .then((res) => {
        if (cancelled) return;
        const typed = res as InsightStatsResponse<WaitingTimeData>;
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
  const hasData = (data?.total ?? 0) > 0;
  const chartData = byYear.map((row) => ({
    year: String(row.year),
    lessThan3: row.lessThan3Months,
    between3And6: row.between3And6Months,
    moreThan6: row.moreThan6Months,
  }));

  const totalTracked = byYear.reduce((sum, row) => sum + row.lessThan3Months + row.between3And6Months + row.moreThan6Months, 0);
  const lessThan3 = byYear.reduce((sum, row) => sum + row.lessThan3Months, 0);
  const quickPct = totalTracked ? ((lessThan3 / totalTracked) * 100).toFixed(1) : '0';
  const yearText = yearParam ? ` tahun ${yearParam}` : ' (semua tahun)';
  const interpretation = `Distribusi waktu tunggu lulusan${yearText}. ${quickPct}% lulusan memperoleh pekerjaan pertama dalam <3 bulan (${lessThan3.toLocaleString()} dari ${totalTracked.toLocaleString()} terlacak).`;

  return (
    <DashboardCard
      title="Waktu Tunggu Lulusan"
      description="Distribusi waktu memperoleh pekerjaan pertama setelah lulus"
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
                formatter={(value: string) => {
                  const labels: Record<string, string> = { lessThan3: '<3 bulan', between3And6: '3 - 6 bulan', moreThan6: '>6 bulan' };
                  return <span className="text-sm text-muted-foreground">{labels[value] ?? value}</span>;
                }}
              />
              <Bar activeBar dataKey="lessThan3" name="<3 bulan" stackId="a" fill="hsl(var(--chart-success))" radius={[0, 0, 0, 0]} />
              <Bar activeBar dataKey="between3And6" name="3 - 6 bulan" stackId="a" fill="hsl(var(--chart-warning))" radius={[0, 0, 0, 0]} />
              <Bar activeBar dataKey="moreThan6" name=">6 bulan" stackId="a" fill="hsl(var(--chart-neutral))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-3 text-center text-xs text-muted-foreground sm:mt-2">Total {data?.total ?? 0} alumni terlacak</p>
        </div>
      )}
    </DashboardCard>
  );
}
