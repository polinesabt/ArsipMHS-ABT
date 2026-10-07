import { useCallback, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { DashboardCard } from '@/components/insight/dashboard/DashboardCard';
import { InsightDataEmpty } from '@/components/insight/InsightDataEmpty';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartRefreshOverlay, ChartSkeleton } from '@/components/ui/loading';
import { AnimatePresence, LayoutGroup, m, useReducedMotion } from 'framer-motion';
import { useInsightDashboard } from '@/contexts/InsightDashboardContext';
import { getAchievementStats, type AchievementStatsResponse } from '@/repositories/api-student.repository';
import type { ChartMeta } from '@/repositories/insight.repository';
import type { ApiResponse } from '@/lib/api-client';
import type { StudentAchievementsTab } from '@/types/insight-tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  StudentAchievementMorphChart,
  type AchievementBreakdownLevel,
  type AchievementBreakdownRow,
} from './StudentAchievementMorphChart';

type AnalysisMode = 'all' | 'academic' | 'nonAcademic';
type AchievementType = 'academic' | 'non_academic';

const TYPE_LABELS: Record<AchievementType, string> = {
  academic: 'Akademik',
  non_academic: 'Non Akademik',
};

const TYPE_COLORS: Record<AchievementType, string> = {
  academic: 'hsl(var(--chart-academic))',
  non_academic: 'hsl(var(--chart-nonacademic))',
};

const BREAKDOWN_META: Array<{ key: AchievementBreakdownLevel; name: string; fill: string }> = [
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

function AchievementTabTrigger({
  value,
  active,
  reducedMotion,
  children,
}: {
  value: AnalysisMode;
  active: boolean;
  reducedMotion: boolean;
  children: ReactNode;
}) {
  return (
    <TabsTrigger
      value={value}
      className="relative isolate h-auto overflow-hidden py-2 text-center text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:text-sm"
    >
      {active && (
        <m.span
          layoutId="student-achievement-active-pill"
          className="absolute inset-0 -z-10 rounded-md bg-card shadow-soft"
          transition={reducedMotion ? { duration: 0 } : { duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden="true"
        />
      )}
      <span className="relative z-10">{children}</span>
    </TabsTrigger>
  );
}

interface StudentAchievementsProps {
  activeTab?: StudentAchievementsTab;
  onActiveTabChange?: (tab: StudentAchievementsTab) => void;
}

export function StudentAchievements({ activeTab, onActiveTabChange }: StudentAchievementsProps = {}) {
  const { selectedYear, refreshTrigger } = useInsightDashboard();
  const reducedMotion = Boolean(useReducedMotion());
  const isMobile = useIsMobile();
  const tabLayoutId = useId();
  const [internalAnalysisMode, setInternalAnalysisMode] = useState<AnalysisMode>('all');
  const [data, setData] = useState<AchievementStatsResponse | null>(null);
  const [meta, setMeta] = useState<ChartMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const yearParam = selectedYear === 'all' ? undefined : (selectedYear as number);
  const queryKeyRef = useRef<string | null>(null);
  const queryKey = String(yearParam ?? 'all');
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
    if (queryKeyRef.current !== queryKey) setLoading(true);
    queryKeyRef.current = queryKey;
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
  }, [refreshTrigger, yearParam, queryKey]);

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

  const academicRows = useMemo<AchievementBreakdownRow[]>(() => BREAKDOWN_META.map((level) => ({
    key: level.key,
    name: level.name,
    count: academicBreakdown[level.key] ?? 0,
    fill: level.fill,
  })), [academicBreakdown]);

  const nonAcademicRows = useMemo<AchievementBreakdownRow[]>(() => BREAKDOWN_META.map((level) => ({
    key: level.key,
    name: level.name,
    count: nonAcademicBreakdown[level.key] ?? 0,
    fill: level.fill,
  })), [nonAcademicBreakdown]);

  const activeBreakdownRows = useMemo<AchievementBreakdownRow[]>(() => {
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
            <LayoutGroup id={tabLayoutId}>
              <TabsList className="grid h-auto w-full grid-cols-1 gap-1 bg-muted/60 p-1 sm:grid-cols-3">
                <AchievementTabTrigger value="all" active={analysisMode === 'all'} reducedMotion={reducedMotion}>
                  Semua Prestasi
                </AchievementTabTrigger>
                <AchievementTabTrigger value="academic" active={analysisMode === 'academic'} reducedMotion={reducedMotion}>
                  Akademik
                </AchievementTabTrigger>
                <AchievementTabTrigger value="nonAcademic" active={analysisMode === 'nonAcademic'} reducedMotion={reducedMotion}>
                  Non Akademik
                </AchievementTabTrigger>
              </TabsList>
            </LayoutGroup>
            <p className="mt-2 text-xs text-muted-foreground">
              Mode analisis akademik dan non akademik memakai klasifikasi turunan dari kategori prestasi.
            </p>
          </div>

          <TabsContent value={analysisMode} className="mt-2 min-h-[320px]">
            {loading && !data ? (
              <ChartSkeleton kind="pie" className="min-h-0 h-[300px] sm:h-[320px]" />
            ) : !hasData ? (
              <div className="flex min-h-[300px] items-center justify-center sm:min-h-[320px]">
                <InsightDataEmpty />
              </div>
            ) : (
              <>
                <div className="relative mx-auto w-full max-w-[620px]">
                  <StudentAchievementMorphChart
                    mode={analysisMode}
                    pieRows={allChartData}
                    academicRows={academicRows}
                    nonAcademicRows={nonAcademicRows}
                    total={total}
                    isMobile={isMobile}
                    onModeChange={applyAnalysisMode}
                  />
                  {loading && <ChartRefreshOverlay label="Memuat ulang data prestasi mahasiswa" />}
                </div>
                <div className="mt-2 flex min-h-8 items-start justify-center text-center text-xs text-muted-foreground">
                  <AnimatePresence initial={false} mode="popLayout">
                    <m.p
                      key={analysisMode === 'all' ? 'all' : 'detail'}
                      initial={reducedMotion ? false : { opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reducedMotion ? undefined : { opacity: 0, y: -4 }}
                      transition={{ duration: reducedMotion ? 0.08 : 0.2, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {analysisMode === 'all'
                        ? 'Klik irisan untuk membuka mode detail Akademik atau Non Akademik.'
                        : `Total: ${activeBreakdownTotal}`}
                    </m.p>
                  </AnimatePresence>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      )}
    </DashboardCard>
  );
}
