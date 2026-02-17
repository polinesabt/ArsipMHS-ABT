import { DashboardCard } from '@/components/insight/dashboard/DashboardCard';
import { InsightDataEmpty } from '@/components/insight/InsightDataEmpty';

export function ActiveStudents() {
  return (
    <DashboardCard
      title="Mahasiswa Aktif"
      description="Data semester ganjil, genap, dan PD-Dikti"
    >
      <InsightDataEmpty />
    </DashboardCard>
  );
}
