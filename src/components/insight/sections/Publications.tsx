import { DashboardCard } from '@/components/insight/dashboard/DashboardCard';
import { InsightDataEmpty } from '@/components/insight/InsightDataEmpty';

export function Publications() {
  return (
    <DashboardCard
      title="Publikasi & Presentasi Mahasiswa"
      description="Jurnal, seminar, dan pameran"
    >
      <InsightDataEmpty />
    </DashboardCard>
  );
}
