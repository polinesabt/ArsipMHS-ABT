import { DashboardCard } from '@/components/insight/dashboard/DashboardCard';
import { InsightDataEmpty } from '@/components/insight/InsightDataEmpty';

export function StudentAchievements() {
  return (
    <DashboardCard
      title="Prestasi Mahasiswa"
      description="Prestasi akademik dan non-akademik per tahun"
    >
      <InsightDataEmpty />
    </DashboardCard>
  );
}
