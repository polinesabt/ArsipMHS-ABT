import { DashboardCard } from '@/components/insight/dashboard/DashboardCard';
import { InsightDataEmpty } from '@/components/insight/InsightDataEmpty';

export function WaitingTime() {
  return (
    <DashboardCard
      title="Masa Tunggu Lulusan"
      description="Waktu memperoleh pekerjaan setelah lulus"
    >
      <InsightDataEmpty />
    </DashboardCard>
  );
}
