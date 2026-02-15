import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DashboardCard } from '@/components/insight/dashboard/DashboardCard';
import { ChartTooltip } from '@/components/insight/dashboard/ChartTooltip';
import { useInsightDashboard } from '@/contexts/InsightDashboardContext';
import { waitingTimeData, years, Year } from '@/data/insightMockData';

export function WaitingTime() {
  const { selectedYear } = useInsightDashboard();

  const chartData = useMemo(() => {
    if (selectedYear === 'all') {
      return years.map((year) => {
        const d = waitingTimeData[year];
        return {
          year: year.toString(),
          'MT < 3 bulan': d.lessThan3Months,
          '3 <= MT <= 6 bulan': d.between3And6Months,
          'MT > 6 bulan': d.moreThan6Months,
        };
      });
    }
    const d = waitingTimeData[selectedYear as Year];
    return [{
      year: selectedYear.toString(),
      'MT < 3 bulan': d.lessThan3Months,
      '3 <= MT <= 6 bulan': d.between3And6Months,
      'MT > 6 bulan': d.moreThan6Months,
    }];
  }, [selectedYear]);

  const interpretation = useMemo(() => {
    const yearText = selectedYear === 'all' ? 'Periode 2021-2026' : `Pada ${selectedYear}`;
    
    if (selectedYear === 'all') {
      const latestYear = waitingTimeData[2026];
      const quickHirePct = ((latestYear.lessThan3Months / latestYear.tracked) * 100).toFixed(1);
      return `${yearText}, daya serap lulusan menunjukkan peningkatan yang kuat. Pada 2026, ${quickHirePct}% lulusan terpantau memperoleh pekerjaan dalam 3 bulan, menandakan permintaan pasar yang tinggi dan kesiapan karier yang efektif.`;
    }
    
    const d = waitingTimeData[selectedYear as Year];
    const quickHirePct = ((d.lessThan3Months / d.tracked) * 100).toFixed(1);
    const trackedPct = ((d.tracked / d.total) * 100).toFixed(1);
    
    return `${yearText}, ${trackedPct}% lulusan (${d.tracked.toLocaleString()} dari ${d.total.toLocaleString()}) berhasil dipantau. Dari jumlah tersebut, ${quickHirePct}% memperoleh pekerjaan dalam 3 bulan, menunjukkan penyerapan lulusan yang sangat baik oleh pasar kerja.`;
  }, [selectedYear]);

  return (
    <DashboardCard
      title="Masa Tunggu Lulusan"
      description="Waktu dari kelulusan ke pekerjaan pertama"
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
            dataKey="MT < 3 bulan" 
            stackId="a" 
            fill="hsl(var(--chart-success))" 
            radius={[0, 0, 0, 0]}
          />
          <Bar 
            dataKey="3 <= MT <= 6 bulan" 
            stackId="a" 
            fill="hsl(var(--chart-warning))" 
            radius={[0, 0, 0, 0]}
          />
          <Bar 
            dataKey="MT > 6 bulan" 
            stackId="a" 
            fill="hsl(var(--chart-neutral))" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </DashboardCard>
  );
}


