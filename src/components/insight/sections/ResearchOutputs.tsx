import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DashboardCard } from '@/components/insight/dashboard/DashboardCard';
import { ChartTooltip, PieChartTooltip } from '@/components/insight/dashboard/ChartTooltip';
import { InsightDataEmpty } from '@/components/insight/InsightDataEmpty';
import { useInsightDashboard } from '@/contexts/InsightDashboardContext';
import { getInsightStats, type ResearchOutputsData, type InsightStatsResponse } from '@/repositories/insight.repository';
import { getInsightErrorMessage } from '@/lib/insight-errors';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { isResearchOutputsTab, type ResearchOutputsTab } from '@/types/insight-tabs';
import { useIsMobile } from '@/hooks/use-mobile';

const HAKI_COLORS = ['hsl(var(--chart-academic))', 'hsl(var(--chart-nonacademic))', 'hsl(var(--chart-success))', 'hsl(var(--chart-warning))', 'hsl(var(--level-local))', 'hsl(var(--level-national))', 'hsl(var(--level-international))', 'hsl(var(--chart-neutral))'];
const OTHER_COLORS = ['hsl(var(--chart-academic))', 'hsl(var(--chart-success))', 'hsl(var(--chart-nonacademic))', 'hsl(var(--chart-warning))', 'hsl(var(--chart-neutral))', 'hsl(var(--level-national))'];

interface ResearchOutputsProps {
  activeTab?: ResearchOutputsTab;
  onActiveTabChange?: (tab: ResearchOutputsTab) => void;
}

function truncateLabel(label: string, maxLength = 26): string {
  if (label.length <= maxLength) return label;
  return `${label.slice(0, maxLength - 1)}...`;
}

export function ResearchOutputs({ activeTab, onActiveTabChange }: ResearchOutputsProps = {}) {
  const { selectedYear } = useInsightDashboard();
  const isMobile = useIsMobile();
  const [internalTab, setInternalTab] = useState<ResearchOutputsTab>('haki');
  const [data, setData] = useState<ResearchOutputsData | null>(null);
  const [meta, setMeta] = useState<InsightStatsResponse['meta']>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const yearParam = selectedYear === 'all' ? undefined : (selectedYear as number);
  const tab = activeTab ?? internalTab;

  const applyTab = useCallback((nextTab: ResearchOutputsTab) => {
    if (activeTab === undefined) {
      setInternalTab(nextTab);
    }
    if (onActiveTabChange) {
      onActiveTabChange(nextTab);
    }
  }, [activeTab, onActiveTabChange]);

  useLayoutEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getInsightStats('research_outputs', yearParam, tab)
      .then((res) => {
        if (cancelled) return;
        const typed = res as InsightStatsResponse<ResearchOutputsData>;
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
  }, [tab, yearParam]);

  const ip = useMemo(() => data?.intellectual_property ?? [], [data?.intellectual_property]);
  const tech = useMemo(() => data?.technology ?? { softwareDevelopment: 0, products: 0, breakdown: [] }, [data?.technology]);
  const other = useMemo(() => data?.other ?? [], [data?.other]);
  const totalHaki = ip.reduce((sum, item) => sum + item.count, 0);
  const technologyBreakdown = useMemo(
    () => (Array.isArray(tech.breakdown) && tech.breakdown.length > 0
      ? tech.breakdown
      : [
          { name: 'Pengembangan Software', key: 'software_development', count: tech.softwareDevelopment ?? 0 },
          { name: 'Produk Teknologi', key: 'technology_product', count: tech.products ?? 0 },
        ]),
    [tech]
  );
  const totalTech = technologyBreakdown.reduce((sum, item) => sum + (item.count ?? 0), 0);
  const totalOther = other.reduce((sum, item) => sum + item.count, 0);
  const hakiChartData = ip
    .filter((item) => item.count > 0)
    .map((item, index) => ({ name: item.name, value: item.count, fill: HAKI_COLORS[index % HAKI_COLORS.length] }));
  const techChartData = technologyBreakdown.map((item) => ({
    name: item.name,
    count: item.count ?? 0,
  }));
  const otherChartData = useMemo(
    () =>
      other
        .filter((item) => item.count > 0)
        .sort((a, b) => b.count - a.count)
        .map((item, index) => ({ ...item, fill: OTHER_COLORS[index % OTHER_COLORS.length] })),
    [other]
  );
  const otherChartHeight = Math.max(220, otherChartData.length * 44);
  const otherYAxisWidth = useMemo(() => {
    const longest = otherChartData.reduce((acc, row) => Math.max(acc, row.name.length), 0);
    return Math.min(160, Math.max(92, longest * 6));
  }, [otherChartData]);
  const yearText = yearParam ? ` tahun ${yearParam}` : '';
  const interpretation = tab === 'technology'
    ? (totalTech > 0
      ? `Total teknologi tepat guna${yearText}: ${totalTech}.`
      : `Belum ada data teknologi tepat guna${yearText}.`)
    : tab === 'other'
      ? (totalOther > 0
        ? `Total luaran lainnya${yearText}: ${totalOther}.`
        : `Belum ada data luaran lainnya${yearText}.`)
      : (totalHaki > 0
        ? `Total HAKI${yearText}: ${totalHaki}.`
        : `Belum ada data HAKI${yearText}.`);

  return (
    <DashboardCard
      title="Luaran Riset & Pengabdian"
      description="Kekayaan intelektual, teknologi tepat guna, dan luaran lainnya"
      interpretation={interpretation}
      chartMeta={meta ?? undefined}
    >
      {error ? (
        <div className="flex flex-col items-center justify-center px-4 py-16 text-center text-muted-foreground">
          <p className="font-medium text-destructive">{error}</p>
        </div>
      ) : (
        <Tabs
          value={tab}
          onValueChange={(value) => {
            if (isResearchOutputsTab(value)) {
              applyTab(value);
            }
          }}
          className="w-full"
        >
          <TabsList className="grid h-auto w-full grid-cols-1 gap-1 bg-muted/60 p-1 sm:grid-cols-3">
            <TabsTrigger value="haki" className="h-auto whitespace-normal px-2 py-2 text-center text-xs leading-tight sm:text-sm">Kekayaan Intelektual</TabsTrigger>
            <TabsTrigger value="technology" className="h-auto whitespace-normal px-2 py-2 text-center text-xs leading-tight sm:text-sm">Teknologi Tepat Guna</TabsTrigger>
            <TabsTrigger value="other" className="h-auto whitespace-normal px-2 py-2 text-center text-xs leading-tight sm:text-sm">Luaran Lainnya</TabsTrigger>
          </TabsList>

          <TabsContent value="haki" className="mt-4 min-h-[320px]">
            {loading ? (
              <div className="flex h-[240px] items-center justify-center text-muted-foreground sm:h-[280px]">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : hakiChartData.length === 0 ? (
              <div className="flex min-h-[240px] items-center justify-center sm:min-h-[280px]">
                <InsightDataEmpty />
              </div>
            ) : (
              <div className="relative mx-auto h-[240px] w-full max-w-[520px] sm:h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={hakiChartData} cx="50%" cy="50%" innerRadius={isMobile ? 52 : 60} outerRadius={isMobile ? 88 : 100} paddingAngle={2} dataKey="value">
                      {hakiChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={(props) => <PieChartTooltip {...props} total={totalHaki} />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xl font-bold text-foreground sm:text-2xl">{totalHaki.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total HAKI</p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="technology" className="mt-4 min-h-[320px]">
            {loading ? (
              <div className="flex h-[240px] items-center justify-center text-muted-foreground sm:h-[280px]">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : totalTech === 0 ? (
              <div className="flex min-h-[240px] items-center justify-center sm:min-h-[280px]">
                <InsightDataEmpty />
              </div>
            ) : (
              <div className="mx-auto h-[240px] w-full max-w-[620px] sm:h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={techChartData} margin={isMobile ? { top: 12, right: 8, left: 0, bottom: 0 } : { top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: isMobile ? 10 : 12 }} axisLine={{ stroke: 'hsl(var(--border))' }} />
                    <YAxis allowDecimals={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: isMobile ? 10 : 12 }} axisLine={{ stroke: 'hsl(var(--border))' }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar activeBar dataKey="count" name="Jumlah" fill="hsl(var(--chart-academic))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </TabsContent>

          <TabsContent value="other" className="mt-4 min-h-[320px]">
            {loading ? (
              <div className="flex h-[240px] items-center justify-center text-muted-foreground sm:h-[280px]">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : otherChartData.length === 0 ? (
              <div className="flex min-h-[240px] items-center justify-center sm:min-h-[280px]">
                <InsightDataEmpty />
              </div>
            ) : (
              <div className="mx-auto w-full max-w-[760px]" style={{ height: `${Math.max(otherChartHeight, 280)}px` }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={otherChartData} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
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
                      dataKey="name"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                      tickLine={false}
                      tickMargin={8}
                      width={otherYAxisWidth}
                      tickFormatter={(value) => truncateLabel(String(value))}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar activeBar dataKey="count" name="Jumlah" radius={[0, 6, 6, 0]} barSize={18}>
                      {otherChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </DashboardCard>
  );
}
