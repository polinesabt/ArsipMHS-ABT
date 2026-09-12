import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DashboardCard } from '@/components/insight/dashboard/DashboardCard';
import { ChartTooltip, PieChartTooltip } from '@/components/insight/dashboard/ChartTooltip';
import { InsightDataEmpty } from '@/components/insight/InsightDataEmpty';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartRefreshOverlay, ChartSkeleton } from '@/components/ui/loading';
import { useInsightDashboard } from '@/contexts/InsightDashboardContext';
import { getAchievementStats, type AchievementStatsResponse } from '@/repositories/api-student.repository';
import type { ChartMeta } from '@/repositories/insight.repository';
import type { ApiResponse } from '@/lib/api-client';
import type { StudentAchievementsTab } from '@/types/insight-tabs';
import { useIsMobile } from '@/hooks/use-mobile';

type AnalysisMode = 'all' | 'academic' | 'nonAcademic';
type AchievementType = 'academic' | 'non_academic';
type BreakdownLevel = 'local' | 'national' | 'international';

interface BreakdownChartRow {
  key: BreakdownLevel;
  name: string;
  count: number;
  fill: string;
}

const TYPE_LABELS: Record<AchievementType, string> = {
  academic: 'Akademik',
  non_academic: 'Non Akademik',
};

const TYPE_COLORS: Record<AchievementType, string> = {
  academic: 'hsl(var(--chart-academic))',
  non_academic: 'hsl(var(--chart-nonacademic))',
};

const BREAKDOWN_META: Array<{ key: BreakdownLevel; name: string; fill: string }> = [
  { key: 'local', name: 'Lokal', fill: 'hsl(var(--level-local))' },
  { key: 'national', name: 'Nasional', fill: 'hsl(var(--level-national))' },
  { key: 'international', name: 'Internasional', fill: 'hsl(var(--level-international))' },
];

function isAnalysisMode(value: string): value is AnalysisMode {
  return value === 'all' || value === 'academic' || value === 'nonAcademic';
}

function sumBreakdown(input?: { local: number; national: number; international: number }): number {
  if (!input) return 0;
  return (input.local ?? 0) + (input.national ?? 0) + (input.international ?? 0);
}

function BreakdownChart({
  rows,
  isMobile,
}: {
  rows: BreakdownChartRow[];
  isMobile: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={rows} margin={isMobile ? { top: 12, right: 8, left: 0, bottom: 0 } : { top: 20, right: 20, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: isMobile ? 10 : 12 }} axisLine={{ stroke: 'hsl(var(--border))' }} />
        <YAxis allowDecimals={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: isMobile ? 10 : 12 }} axisLine={{ stroke: 'hsl(var(--border))' }} />
        <Tooltip content={<ChartTooltip />} />
        <Bar
          activeBar
          dataKey="count"
          name="Jumlah"
          radius={[6, 6, 0, 0]}
          isAnimationActive={false}
        >
          {rows.map((row) => (
            <Cell key={row.key} fill={row.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

interface StudentAchievementsProps {
  activeTab?: StudentAchievementsTab;
  onActiveTabChange?: (tab: StudentAchievementsTab) => void;
}

export function StudentAchievements({ activeTab, onActiveTabChange }: StudentAchievementsProps = {}) {
  const { selectedYear, refreshTrigger } = useInsightDashboard();
  const isMobile = useIsMobile();
  const [internalAnalysisMode, setInternalAnalysisMode] = useState<AnalysisMode>('all');
  const [data, setData] = useState<AchievementStatsResponse | null>(null);
  const [meta, setMeta] = useState<ChartMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const yearParam = selectedYear === 'all' ? undefined : (selectedYear as number);
  const analysisMode: AnalysisMode = activeTab ?? internalAnalysisMode;
  const applyAnalysisMode = useCallback((nextMode: AnalysisMode) => {
    if (activeTab === undefined) {
      setInternalAnalysisMode(nextMode);
    }
    if (onActiveTabChange) {
      onActiveTabChange(nextMode);
    }
  }, [activeTab, onActiveTabChange]);

  useLayoutEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getAchievementStats(yearParam, 'all')
      .then((res) => {
        if (cancelled) return;
        const typedRes = res as ApiResponse<AchievementStatsResponse> & { meta?: ChartMeta | null };
        if (typedRes.success && typedRes.data) {
          setData(typedRes.data);
          setMeta(typedRes.meta ?? null);
          return;
        }
        setError(typedRes.error || 'Gagal memuat data');
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
  }, [refreshTrigger, yearParam]);

  const academicBreakdown = useMemo(
    () => data?.academic_breakdown ?? { local: 0, national: 0, international: 0 },
    [data?.academic_breakdown]
  );
  const nonAcademicBreakdown = useMemo(
    () => data?.non_academic_breakdown ?? { local: 0, national: 0, international: 0 },
    [data?.non_academic_breakdown]
  );
  const academicTotal = sumBreakdown(academicBreakdown);
  const nonAcademicTotal = sumBreakdown(nonAcademicBreakdown);

  const byTypeMap = useMemo(() => {
    const map = new Map<AchievementType, number>();
    (data?.by_type ?? []).forEach((item) => {
      if (item.type === 'academic' || item.type === 'non_academic') {
        map.set(item.type, item.count);
      }
    });
    return map;
  }, [data?.by_type]);

  const countByType = useMemo(
    () => ({
      academic: byTypeMap.get('academic') ?? academicTotal,
      non_academic: byTypeMap.get('non_academic') ?? nonAcademicTotal,
    }),
    [academicTotal, byTypeMap, nonAcademicTotal]
  );

  const allChartData = useMemo(
    () =>
      (Object.keys(TYPE_LABELS) as AchievementType[]).map((type) => ({
        type,
        name: TYPE_LABELS[type],
        value: countByType[type],
        fill: TYPE_COLORS[type],
      })),
    [countByType]
  );

  const activeBreakdownRows = useMemo<BreakdownChartRow[]>(() => {
    const source = analysisMode === 'academic' ? academicBreakdown : nonAcademicBreakdown;
    return BREAKDOWN_META.map((level) => ({
      key: level.key,
      name: level.name,
      count: source[level.key] ?? 0,
      fill: level.fill,
    }));
  }, [academicBreakdown, analysisMode, nonAcademicBreakdown]);

  const activeBreakdownTotal = useMemo(
    () => activeBreakdownRows.reduce((sum, row) => sum + row.count, 0),
    [activeBreakdownRows]
  );

  const total = data?.total ?? countByType.academic + countByType.non_academic;
  const hasData = total > 0;
  const yearText = yearParam ? ` tahun ${yearParam}` : '';

  const interpretation = useMemo(() => {
    if (!hasData) return 'Belum ada data prestasi untuk ditampilkan.';
    if (analysisMode === 'all') {
      return `Total prestasi${yearText}: ${total}. Akademik: ${countByType.academic}. Non Akademik: ${countByType.non_academic}.`;
    }
    if (analysisMode === 'academic') {
      return `Prestasi akademik${yearText}: ${academicTotal}. Lokal: ${academicBreakdown.local}, Nasional: ${academicBreakdown.national}, Internasional: ${academicBreakdown.international}.`;
    }
    return `Prestasi non akademik${yearText}: ${nonAcademicTotal}. Lokal: ${nonAcademicBreakdown.local}, Nasional: ${nonAcademicBreakdown.national}, Internasional: ${nonAcademicBreakdown.international}.`;
  }, [
    academicBreakdown.international,
    academicBreakdown.local,
    academicBreakdown.national,
    academicTotal,
    analysisMode,
    countByType.academic,
    countByType.non_academic,
    hasData,
    nonAcademicBreakdown.international,
    nonAcademicBreakdown.local,
    nonAcademicBreakdown.national,
    nonAcademicTotal,
    total,
    yearText,
  ]);

  return (
    <DashboardCard
      title="Prestasi Mahasiswa"
      description="Analisis agregat prestasi berdasarkan kategori klasifikasi"
      interpretation={interpretation}
      chartMeta={meta ?? undefined}
    >
      {error ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center text-muted-foreground">
          <p className="font-medium text-destructive">{error}</p>
        </div>
      ) : (
        <Tabs
          value={analysisMode}
          onValueChange={(value) => {
            if (isAnalysisMode(value)) {
              applyAnalysisMode(value);
            }
          }}
          className="w-full"
        >
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium text-foreground">Analisis Berdasarkan:</p>
            <TabsList className="grid h-auto w-full grid-cols-1 gap-1 bg-muted/60 p-1 sm:grid-cols-3">
              <TabsTrigger value="all" className="h-auto py-2 text-center text-xs sm:text-sm">
                Semua Prestasi
              </TabsTrigger>
              <TabsTrigger value="academic" className="h-auto py-2 text-center text-xs sm:text-sm">
                Akademik
              </TabsTrigger>
              <TabsTrigger value="nonAcademic" className="h-auto py-2 text-center text-xs sm:text-sm">
                Non Akademik
              </TabsTrigger>
            </TabsList>
            <p className="mt-2 text-xs text-muted-foreground">
              Mode analisis akademik dan non akademik memakai klasifikasi turunan dari kategori prestasi.
            </p>
          </div>

          <TabsContent value={analysisMode} className="mt-2 min-h-[320px]">
            {loading && !data ? (
              <ChartSkeleton kind="pie" className="min-h-0 h-[240px] sm:h-[280px]" />
            ) : !hasData ? (
              <div className="flex min-h-[240px] items-center justify-center sm:min-h-[280px]">
                <InsightDataEmpty />
              </div>
            ) : (
              <>
                <div className="relative mx-auto h-[240px] w-full max-w-[620px] sm:h-[280px]">
                  {analysisMode === 'all' ? (
                    <div className="absolute inset-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={allChartData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={isMobile ? 52 : 62}
                            outerRadius={isMobile ? 88 : 102}
                            paddingAngle={3}
                            isAnimationActive={false}
                            onClick={(entry) => {
                              if (entry?.type === 'academic') {
                                applyAnalysisMode('academic');
                              } else if (entry?.type === 'non_academic') {
                                applyAnalysisMode('nonAcademic');
                              }
                            }}
                          >
                            {allChartData.map((entry) => (
                              <Cell key={entry.type} fill={entry.fill} className="cursor-pointer" />
                            ))}
                          </Pie>
                          <Tooltip content={<PieChartTooltip total={total} />} />
                          <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: isMobile ? 10 : 12, lineHeight: 1.4 }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-xl font-bold text-foreground sm:text-2xl">{total.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Total Prestasi</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0">
                      {activeBreakdownTotal > 0 ? (
                        <BreakdownChart
                          rows={activeBreakdownRows}
                          isMobile={isMobile}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <InsightDataEmpty />
                        </div>
                      )}
                    </div>
                  )}
                  {loading && <ChartRefreshOverlay label="Memuat ulang data prestasi mahasiswa" />}
                </div>
                <div className="mt-2 flex min-h-8 items-start justify-center text-center text-xs text-muted-foreground">
                  {analysisMode === 'all' ? (
                    <p>Klik irisan untuk membuka mode detail Akademik atau Non Akademik.</p>
                  ) : (
                    <p>Total: {activeBreakdownTotal}</p>
                  )}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      )}
    </DashboardCard>
  );
}
