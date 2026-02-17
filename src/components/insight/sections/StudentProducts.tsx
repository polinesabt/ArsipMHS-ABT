import { DashboardCard } from '@/components/insight/dashboard/DashboardCard';
import { InsightDataEmpty } from '@/components/insight/InsightDataEmpty';

export function StudentProducts() {
  return (
    <DashboardCard
      title="Produk Mahasiswa"
      description="Kategori produk/by product mahasiswa"
    >
      <InsightDataEmpty />
    </DashboardCard>
  );
}
