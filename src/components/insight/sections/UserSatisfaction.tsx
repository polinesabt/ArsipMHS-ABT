import { useEffect, useState, useMemo, useRef } from 'react';
import { ChartSkeleton } from '@/components/ui/loading';
import { DashboardCard } from '@/components/insight/dashboard/DashboardCard';
import { useInsightDashboard } from '@/contexts/InsightDashboardContext';
import { InsightDataEmpty } from '@/components/insight/InsightDataEmpty';
import {
  DistribusiPenilaianChart,
  KesesuaianJurusanChart,
  type DistribusiPenilaianRow,
  type KesesuaianJurusanEntry,
} from '@/components/shared';
import { getEvaluationCharts } from '@/repositories/evaluation.repository';
import type { ChartMeta } from '@/repositories/insight.repository';

/** Survey responses plus historical ratings from the imported workbook. */
const CHART_META_LIKERT: ChartMeta = {
  source: 'Evaluasi Lulusan dan data historis impor',
  last_synced_at: null,
  calculation: 'Agregat respons evaluasi dan penilaian historis. Skala 1–5 (Sangat Baik s.d. Tidak Baik) per indikator.',
};

const CHART_META_JOB_MATCH: ChartMeta = {
  source: 'Evaluasi Lulusan (form kepuasan)',
  last_synced_at: null,
  calculation: 'Persentase responden dengan pekerjaan yang sesuai vs tidak sesuai dengan jurusan.',
};

export function UserSatisfaction() {
  const { refreshTrigger } = useInsightDashboard();
  const loadedRef = useRef(false);
  const [aspectData, setAspectData] = useState<DistribusiPenilaianRow[]>([]);
  const [jobMatchData, setJobMatchData] = useState<KesesuaianJurusanEntry[]>([]);
  const [totalRespondents, setTotalRespondents] = useState(0);
  const [importedRespondents, setImportedRespondents] = useState(0);
  const [importAvailable, setImportAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!loadedRef.current) setLoading(true);
    setError(null);
    getEvaluationCharts('all', true)
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data) {
          const rows = res.data.aspect_distribution ?? [];
          const withTotal = rows.map((row) => {
            const total =
              (row.sangat_baik ?? 0) +
              (row.baik ?? 0) +
              (row.cukup_baik ?? 0) +
              (row.kurang_baik ?? 0) +
              (row.tidak_baik ?? 0);
            return { ...row, total };
          });
          setAspectData(withTotal.filter((r) => r.total! > 0));
          setJobMatchData(res.data.job_match ?? []);
          const importedCount = res.data.imported_satisfaction?.respondents ?? 0;
          setImportAvailable(res.data.imported_satisfaction?.available ?? null);
          setImportedRespondents(importedCount);
          setTotalRespondents((res.data.progress?.total_submitted ?? 0) + importedCount);
        } else {
          setAspectData([]);
          setJobMatchData([]);
          setTotalRespondents(0);
          setImportedRespondents(0);
          setImportAvailable(null);
          setError(res.error ?? 'Gagal memuat data');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Gagal memuat data');
          setAspectData([]);
          setJobMatchData([]);
          setTotalRespondents(0);
          setImportedRespondents(0);
          setImportAvailable(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          loadedRef.current = true;
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [refreshTrigger]);

  const hasAspectData = aspectData.length > 0;
  const hasJobMatchData = jobMatchData.length > 0 && jobMatchData.some((e) => e.value > 0);

  const chartHeight = Math.max(280, aspectData.length * 58);

  const positivePct = useMemo(() => {
    let sumPos = 0;
    let sumTotal = 0;
    aspectData.forEach((r) => {
      sumPos += (r.sangat_baik ?? 0) + (r.baik ?? 0);
      sumTotal += r.total ?? 0;
    });
    return sumTotal ? (((sumPos / sumTotal) * 100).toFixed(1)) : '0';
  }, [aspectData]);

  const topIndicator = useMemo(() => {
    if (aspectData.length === 0) return '';
    return aspectData.reduce((a, b) =>
      (a.sangat_baik + a.baik > b.sangat_baik + b.baik ? a : b)
    ).aspect_name;
  }, [aspectData]);

  const interpretationLikert = `Jumlah pengisi: ${totalRespondents} orang, termasuk ${importedRespondents} dari data historis. Rata-rata skor positif (Sangat Baik + Baik): ${positivePct}%.${topIndicator ? ` Indikator tertinggi: ${topIndicator}.` : ''}`;

  return (
    <div className="grid grid-cols-1 gap-6">
      <DashboardCard
        title="Kepuasan Pengguna Lulusan (Distribusi Penilaian)"
        description="Skala Likert per indikator (Sangat Baik s.d. Tidak Baik) dari formulir evaluasi dan data historis impor"
        interpretation={interpretationLikert}
        chartMeta={CHART_META_LIKERT}
      >
        {loading ? (
          <ChartSkeleton kind="bar" className="h-[240px] sm:h-[280px]" />
        ) : error ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-4 py-16 text-center text-muted-foreground">
            <p className="font-medium text-destructive">{error}</p>
          </div>
        ) : !hasAspectData ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <InsightDataEmpty description={importAvailable === false
              ? 'Data historis belum tersedia di database aplikasi. Pastikan SQL sudah diimpor ke database yang digunakan website.'
              : undefined}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="inline-flex items-center rounded-md border border-border/60 bg-background/60 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Jumlah pengisi:</span>
              <span className="ml-2 font-semibold text-foreground">{totalRespondents} orang</span>
            </div>
            <DistribusiPenilaianChart data={aspectData} height={chartHeight} />
          </div>
        )}
      </DashboardCard>

      <DashboardCard
        title="Kesesuaian Jurusan dengan Pekerjaan"
        description="Persentase kesesuaian pekerjaan dengan jurusan dari formulir Evaluasi Lulusan"
        chartMeta={CHART_META_JOB_MATCH}
      >
        {loading ? (
          <ChartSkeleton kind="pie" className="h-[240px] sm:h-[280px]" />
        ) : error ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-4 py-16 text-center text-muted-foreground">
            <p className="font-medium text-destructive">{error}</p>
          </div>
        ) : !hasJobMatchData ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <InsightDataEmpty
              description={importedRespondents > 0
                ? 'Spreadsheet historis tidak memuat jawaban kesesuaian jurusan. Grafik ini terisi setelah ada respons dari formulir Evaluasi Lulusan.'
                : undefined}
            />
          </div>
        ) : (
          <KesesuaianJurusanChart data={jobMatchData} height={360} innerRadius={56} />
        )}
      </DashboardCard>
    </div>
  );
}
