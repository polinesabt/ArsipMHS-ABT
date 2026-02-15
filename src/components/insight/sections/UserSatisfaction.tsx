import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { DashboardCard } from '@/components/insight/dashboard/DashboardCard';
import { ChartTooltip } from '@/components/insight/dashboard/ChartTooltip';
import { satisfactionData, satisfactionIndicators } from '@/data/insightMockData';

const COLORS = {
  veryGood: 'hsl(145, 60%, 45%)',
  good: 'hsl(175, 55%, 45%)',
  fair: 'hsl(45, 80%, 55%)',
  poor: 'hsl(0, 65%, 55%)',
};

export function UserSatisfaction() {
  const chartData = useMemo(() => {
    return satisfactionIndicators.map((indicator) => {
      const data = satisfactionData[indicator];
      return {
        indicator: indicator.length > 15 ? indicator.substring(0, 15) + '...' : indicator,
        fullName: indicator,
        'Sangat Baik': data.veryGood,
        'Baik': data.good,
        'Cukup': data.fair,
        'Kurang': data.poor,
      };
    });
  }, []);

  const interpretation = useMemo(() => {
    // Calculate average satisfaction
    let totalVeryGood = 0;
    let totalGood = 0;
    let count = 0;
    
    satisfactionIndicators.forEach((indicator) => {
      const data = satisfactionData[indicator];
      totalVeryGood += data.veryGood;
      totalGood += data.good;
      count++;
    });
    
    const avgVeryGood = (totalVeryGood / count).toFixed(1);
    const avgGood = (totalGood / count).toFixed(1);
    const combinedPositive = ((totalVeryGood + totalGood) / count).toFixed(1);
    
    // Find highest rated
    let highestIndicator = '';
    let highestScore = 0;
    satisfactionIndicators.forEach((indicator) => {
      const score = satisfactionData[indicator].veryGood + satisfactionData[indicator].good;
      if (score > highestScore) {
        highestScore = score;
        highestIndicator = indicator;
      }
    });
    
    return `Survei kepuasan pengguna menunjukkan ${combinedPositive}% penilaian positif gabungan (Sangat Baik + Baik) di semua indikator. ${highestIndicator} memperoleh kepuasan tertinggi dengan ${highestScore}% umpan balik positif, mencerminkan kualitas lulusan yang dihargai pemberi kerja.`;
  }, []);

  return (
    <DashboardCard
      title="Kepuasan Pengguna"
      description="Kepuasan pengguna terhadap kompetensi lulusan"
      interpretation={interpretation}
    >
      <ResponsiveContainer width="100%" height={320}>
        <BarChart 
          data={chartData} 
          layout="vertical"
          margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
          <XAxis 
            type="number"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis 
            type="category"
            dataKey="indicator"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            width={95}
          />
          <Tooltip 
            content={<ChartTooltip valueFormatter={(v) => `${v}%`} />}
          />
          <Legend 
            wrapperStyle={{ paddingTop: 10 }}
            formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
          />
          <Bar dataKey="Sangat Baik" stackId="a" fill={COLORS.veryGood} />
          <Bar dataKey="Baik" stackId="a" fill={COLORS.good} />
          <Bar dataKey="Cukup" stackId="a" fill={COLORS.fair} />
          <Bar dataKey="Kurang" stackId="a" fill={COLORS.poor} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </DashboardCard>
  );
}

