import { useInsightDashboard } from '@/contexts/InsightDashboardContext';
import type { Year } from '@/types/insight';

export function Overview() {
  const { selectedYear } = useInsightDashboard();
  const yearLabel = selectedYear === 'all' ? '2021-2026' : (selectedYear as Year).toString();

  return (
    <div className="space-y-6">
      {/* Welcome block */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Selamat datang di Dashboard Admin.</h2>
        <p className="text-muted-foreground mt-1">
          Kelola indikator arsip dan hasil survei mahasiswa ABT. Data ditampilkan untuk periode {yearLabel}.
        </p>
      </div>
    </div>
  );
}
