import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { DashboardCard } from '@/components/insight/dashboard/DashboardCard';
import { ChartTooltip } from '@/components/insight/dashboard/ChartTooltip';
import { useInsightDashboard } from '@/contexts/InsightDashboardContext';
import { activeStudentsData, years, Year } from '@/data/insightMockData';

export function ActiveStudents() {
  const { selectedYear } = useInsightDashboard();

  const chartData = useMemo(() => {
    if (selectedYear === 'all') {
      return years.map((year) => {
        const d = activeStudentsData[year];
        return {
          year: year.toString(),
          'Semester Ganjil': d.oddSemester,
          'Semester Genap': d.evenSemester,
          'Terdaftar di PD-Dikti': d.pdDikti,
        };
      });
    }
    const d = activeStudentsData[selectedYear as Year];
    return [{
      year: selectedYear.toString(),
      'Semester Ganjil': d.oddSemester,
      'Semester Genap': d.evenSemester,
      'Terdaftar di PD-Dikti': d.pdDikti,
    }];
  }, [selectedYear]);

  const interpretation = useMemo(() => {
    const yearText = selectedYear === 'all' ? 'Periode 2021-2026' : `Pada ${selectedYear}`;
    
    if (selectedYear === 'all') {
      const latestYear = activeStudentsData[2026];
      const consistency = ((latestYear.pdDikti / latestYear.oddSemester) * 100).toFixed(1);
      
      return `${yearText}, jumlah mahasiswa aktif menunjukkan pertumbuhan yang konsisten. Konsistensi data antara catatan internal dan registrasi PD-Dikti sebesar ${consistency}%, menandakan pelaporan institusi yang andal dan kepatuhan terhadap basis data pendidikan nasional.`;
    }
    
    const d = activeStudentsData[selectedYear as Year];
    const consistency = ((d.pdDikti / d.oddSemester) * 100).toFixed(1);
    const retention = ((d.evenSemester / d.oddSemester) * 100).toFixed(1);
    
    return `${yearText}, terdapat ${d.oddSemester.toLocaleString()} mahasiswa aktif di semester ganjil dengan retensi ${retention}% ke semester genap. Konsistensi PD-Dikti sebesar ${consistency}%, menunjukkan pengelolaan data institusi yang akurat.`;
  }, [selectedYear]);

  return (
    <DashboardCard
      title="Mahasiswa Aktif"
      description="Pendaftaran semester dan registrasi PD-Dikti"
      interpretation={interpretation}
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="year" 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <YAxis 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <Tooltip content={<ChartTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: 20 }}
            formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
          />
          <Bar 
            dataKey="Semester Ganjil" 
            fill="hsl(var(--chart-academic))" 
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="Semester Genap" 
            fill="hsl(var(--chart-academic-light))" 
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="Terdaftar di PD-Dikti" 
            fill="hsl(var(--chart-success))" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </DashboardCard>
  );
}

