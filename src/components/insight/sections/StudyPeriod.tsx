import { DashboardCard } from '@/components/insight/dashboard/DashboardCard';
import { InsightDataEmpty } from '@/components/insight/InsightDataEmpty';

export function StudyPeriod() {
  return (
    <DashboardCard
      title="Masa Studi Lulusan"
      description="Data mahasiswa diterima dan lulus per tahun"
    >
      <InsightDataEmpty />
    </DashboardCard>
  );
}
