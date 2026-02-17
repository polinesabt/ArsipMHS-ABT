import { DashboardCard } from '@/components/insight/dashboard/DashboardCard';
import { InsightDataEmpty } from '@/components/insight/InsightDataEmpty';

export function UserSatisfaction() {
  return (
    <DashboardCard
      title="Kepuasan Pengguna"
      description="Hasil survei kepuasan pengguna lulusan"
    >
      <InsightDataEmpty />
    </DashboardCard>
  );
}
