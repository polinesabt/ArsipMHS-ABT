import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DashboardCard } from '@/components/insight/dashboard/DashboardCard';
import { ChartTooltip } from '@/components/insight/dashboard/ChartTooltip';
import { useInsightDashboard } from '@/contexts/InsightDashboardContext';
import { workCoverageData, years, Year } from '@/data/insightMockData';

export function WorkCoverage() {
  const { selectedYear } = useInsightDashboard();

  const chartData = useMemo(() => {
    if (selectedYear === 'all') {
      return years.map((year) => {
        const d = workCoverageData[year];
        return {
          year: year.toString(),
          'Lokal/Regional': d.localUnlicensed,
          'Nasional': d.nationalLicensed,
          'Multinasional/Internasional': d.multinational,
        };
      });
    }
    const d = workCoverageData[selectedYear as Year];
    return [{
      year: selectedYear.toString(),
      'Lokal/Regional': d.localUnlicensed,
      'Nasional': d.nationalLicensed,
      'Multinasional/Internasional': d.multinational,
    }];
  }, [selectedYear]);

  const interpretation = useMemo(() => {
    const yearText = selectedYear === 'all' ? 'Periode 2021-2026' : `Pada ${selectedYear}`;
    
    if (selectedYear === 'all') {
      const latestYear = workCoverageData[2026];
      const total = latestYear.localUnlicensed + latestYear.nationalLicensed + latestYear.multinational;
      const multinationalPct = ((latestYear.multinational / total) * 100).toFixed(1);
      const nationalPct = ((latestYear.nationalLicensed / total) * 100).toFixed(1);
      
      return `${yearText}, cakupan tempat kerja lulusan menunjukkan perluasan jangkauan. Pada 2026, ${nationalPct}% bekerja di perusahaan nasional/berizin, sementara ${multinationalPct}% mencapai posisi multinasional/internasional, menandakan daya saing global yang meningkat.`;
    }
    
    const d = workCoverageData[selectedYear as Year];
    const total = d.localUnlicensed + d.nationalLicensed + d.multinational;
    const multinationalPct = ((d.multinational / total) * 100).toFixed(1);
    
    return `${yearText}, ${multinationalPct}% lulusan (${d.multinational.toLocaleString()}) bekerja di organisasi multinasional/internasional, menunjukkan keberhasilan program dalam menyiapkan profesional yang kompetitif secara global.`;
  }, [selectedYear]);

  return (
    <DashboardCard
      title="Cakupan Tempat Kerja Lulusan"
      description="Cakupan geografis tempat kerja lulusan"
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
            dataKey="Lokal/Regional" 
            fill="hsl(var(--level-local))" 
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="Nasional" 
            fill="hsl(var(--level-national))" 
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="Multinasional/Internasional" 
            fill="hsl(var(--level-international))" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </DashboardCard>
  );
}

