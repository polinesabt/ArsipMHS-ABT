import { useInsightDashboard } from '@/contexts/InsightDashboardContext';
import { InsightDataEmpty } from '@/components/insight/InsightDataEmpty';
import type { Year } from '@/types/insight';

export function Overview() {
  const { selectedYear } = useInsightDashboard();
  const yearLabel = selectedYear === 'all' ? '2021-2026' : (selectedYear as Year).toString();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Ringkasan Dasbor</h2>
        <p className="text-muted-foreground mt-1">
          Indikator kunci arsip dan hasil survei mahasiswa ABT ({yearLabel})
        </p>
      </div>
      <InsightDataEmpty />
    </div>
  );
}
