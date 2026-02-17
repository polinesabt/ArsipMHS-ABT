import { DashboardCard } from '@/components/insight/dashboard/DashboardCard';
import { InsightDataEmpty } from '@/components/insight/InsightDataEmpty';

export function ResearchOutputs() {
  return (
    <DashboardCard
      title="Luaran Riset & Pengabdian"
      description="Kekayaan intelektual, teknologi tepat guna, buku"
    >
      <InsightDataEmpty />
    </DashboardCard>
  );
}
