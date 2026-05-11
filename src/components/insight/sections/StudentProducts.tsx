import { useEffect, useState, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DashboardCard } from '@/components/insight/dashboard/DashboardCard';
import { ChartTooltip } from '@/components/insight/dashboard/ChartTooltip';
import { InsightDataEmpty } from '@/components/insight/InsightDataEmpty';
import { useInsightDashboard } from '@/contexts/InsightDashboardContext';
import { getInsightStats, type StudentProductsData, type InsightStatsResponse } from '@/repositories/insight.repository';
import { getInsightErrorMessage } from '@/lib/insight-errors';

const BAR_COLORS = ['hsl(var(--chart-academic))', 'hsl(var(--chart-nonacademic))', 'hsl(var(--chart-success))', 'hsl(var(--chart-warning))', 'hsl(var(--chart-neutral))', 'hsl(var(--level-local))', 'hsl(var(--level-national))'];

function truncateLabel(label: string, maxLength = 24): string {
  if (label.length <= maxLength) return label;
  return `${label.slice(0, maxLength - 1)}…`;
}

export function StudentProducts() {
  const { selectedYear } = useInsightDashboard();
  const [data, setData] = useState<StudentProductsData | null>(null);
  const [meta, setMeta] = useState<InsightStatsResponse['meta']>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const yearParam = selectedYear === 'all' ? undefined : (selectedYear as number);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getInsightStats('student_products', yearParam)
      .then((res) => {
        if (cancelled) return;
        const typed = res as InsightStatsResponse<StudentProductsData>;
        if (typed.success && typed.data) {
          setData(typed.data);
          setMeta(typed.meta ?? null);
        } else setError(getInsightErrorMessage(res.error));
      })
      .catch(() => { if (!cancelled) setError('Gagal memuat data'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [yearParam]);

  const byCategory = data?.by_category ?? [];
  const total = data?.total ?? 0;
  const chartData = useMemo(
    () =>
      byCategory
        .filter((c) => c.count > 0)
        .sort((a, b) => b.count - a.count)
        .map((c, i) => ({
          category: c.label,
          value: c.count,
          fill: BAR_COLORS[i % BAR_COLORS.length],
        })),
    [byCategory]
  );
  const hasData = total > 0 && chartData.length > 0;
  const chartHeight = Math.max(280, chartData.length * 44);
  const yAxisWidth = useMemo(() => {
    const longest = chartData.reduce((acc, row) => Math.max(acc, row.category.length), 0);
    return Math.min(150, Math.max(96, longest * 6));
  }, [chartData]);
  const top3 = useMemo(() => [...chartData].filter((c) => c.value > 0).sort((a, b) => b.value - a.value).slice(0, 3), [chartData]);
  const top3Sum = top3.reduce((s, i) => s + i.value, 0);
  const top3Pct = total ? ((top3Sum / total) * 100).toFixed(1) : '0';
  const interpretation = top3.length ? `Total produk mahasiswa yang diadopsi: ${total}. Tiga kategori teratas: ${top3.map((t) => `${t.category} (${t.value})`).join(', ')} — ${top3Pct}% dari total.` : `Total produk mahasiswa yang diadopsi: ${total}.`;

  return (
    <DashboardCard title="Produk Mahasiswa yang Diadopsi" description="Per kategori (tidak difilter per tahun)" interpretation={interpretation} chartMeta={meta ?? undefined}>
      {loading ? (
        <div className="flex min-h-[280px] items-center justify-center text-muted-foreground">Memuat data…</div>
      ) : error ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center px-4 py-16 text-center text-muted-foreground">
          <p className="font-medium text-destructive">{error}</p>
        </div>
      ) : !hasData ? (
        <div className="flex min-h-[280px] items-center justify-center">
          <InsightDataEmpty />
        </div>
      ) : (
        <div className="w-full min-h-[280px]">
          <div className="w-full" style={{ height: `${chartHeight}px` }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 12, right: 12, left: 12, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  domain={[0, 'dataMax + 1']}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={false}
                  tickMargin={8}
                  width={yAxisWidth}
                  tickFormatter={(value) => truncateLabel(String(value))}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar activeBar dataKey="value" name="Jumlah" radius={[0, 6, 6, 0]} barSize={18}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">Total {data?.total ?? 0} produk</p>
        </div>
      )}
    </DashboardCard>
  );
}
