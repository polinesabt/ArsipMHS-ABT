import { DashboardCard } from '@/components/insight/dashboard/DashboardCard';
import { InsightDataEmpty } from '@/components/insight/InsightDataEmpty';

export function WorkCoverage() {
  return (
    <DashboardCard
      title="Cakupan Tempat Kerja Lulusan"
      description="Lokal, nasional, dan multinasional"
    >
      <InsightDataEmpty />
    </DashboardCard>
  );
}
