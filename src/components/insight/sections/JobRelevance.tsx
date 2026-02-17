import { DashboardCard } from '@/components/insight/dashboard/DashboardCard';
import { InsightDataEmpty } from '@/components/insight/InsightDataEmpty';

export function JobRelevance() {
  return (
    <DashboardCard
      title="Kesesuaian Bidang Kerja"
      description="Kesesuaian pekerjaan dengan bidang studi"
    >
      <InsightDataEmpty />
    </DashboardCard>
  );
}
