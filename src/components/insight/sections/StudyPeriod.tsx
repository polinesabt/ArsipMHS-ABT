import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DashboardCard } from '@/components/insight/dashboard/DashboardCard';
import { ChartTooltip } from '@/components/insight/dashboard/ChartTooltip';
import { useInsightDashboard } from '@/contexts/InsightDashboardContext';
import { graduationData, years, Year } from '@/data/insightMockData';

export function StudyPeriod() {
  const { selectedYear } = useInsightDashboard();

  const chartData = useMemo(() => {
    if (selectedYear === 'all') {
      return years.map((year) => ({
        year: year.toString(),
        admitted: graduationData[year].admitted,
        graduated: graduationData[year].graduated,
      }));
    }
    return [{
      year: selectedYear.toString(),
      admitted: graduationData[selectedYear as Year].admitted,
      graduated: graduationData[selectedYear as Year].graduated,
    }];
  }, [selectedYear]);

  const interpretation = useMemo(() => {
    const totalAdmitted = chartData.reduce((sum, d) => sum + d.admitted, 0);
    const totalGraduated = chartData.reduce((sum, d) => sum + d.graduated, 0);
    const graduationRate = ((totalGraduated / totalAdmitted) * 100).toFixed(1);
    
    const yearText = selectedYear === 'all' ? 'Periode 2021-2026' : `Pada ${selectedYear}`;
    
    return `${yearText}, program mencatat tingkat kelulusan ${graduationRate}% (${totalGraduated.toLocaleString()} lulusan dari ${totalAdmitted.toLocaleString()} mahasiswa masuk). Ini menunjukkan layanan pendidikan yang efektif dan strategi retensi mahasiswa yang baik.`;
  }, [chartData, selectedYear]);

  return (
    <DashboardCard
      title="Masa Studi Lulusan"
      description="Tren mahasiswa masuk vs lulus (2021-2026)"
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
            dataKey="admitted" 
            name="Mahasiswa Masuk" 
            fill="hsl(var(--chart-academic-light))" 
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="graduated" 
            name="Mahasiswa Lulus" 
            fill="hsl(var(--chart-academic))" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </DashboardCard>
  );
}

