import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DashboardCard } from '@/components/insight/dashboard/DashboardCard';
import { studentProductsData, studentProductCategories } from '@/data/insightMockData';

// Generate colors for categories
const getCategoryColor = (index: number) => {
  const colors = [
    'hsl(215, 70%, 45%)',
    'hsl(225, 65%, 50%)',
    'hsl(205, 75%, 50%)',
    'hsl(195, 70%, 45%)',
    'hsl(270, 45%, 55%)',
    'hsl(280, 40%, 50%)',
    'hsl(145, 55%, 45%)',
    'hsl(175, 50%, 45%)',
    'hsl(35, 85%, 55%)',
    'hsl(25, 80%, 50%)',
    'hsl(160, 55%, 45%)',
  ];
  return colors[index % colors.length];
};

export function StudentProducts() {
  const chartData = useMemo(() => {
    return studentProductCategories.map((category, index) => ({
      category: category.length > 20 ? category.substring(0, 20) + '...' : category,
      fullName: category,
      value: studentProductsData[category],
      fill: getCategoryColor(index),
    }));
  }, []);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const interpretation = useMemo(() => {
    // Find top categories
    const sorted = [...chartData].sort((a, b) => b.value - a.value);
    const top3 = sorted.slice(0, 3);
    const top3Pct = ((top3.reduce((sum, item) => sum + item.value, 0) / total) * 100).toFixed(1);
    
    return `Total produk mahasiswa yang diadopsi industri/masyarakat mencapai ${total} pada 11 kategori. ${top3[0].fullName} (${top3[0].value}), ${top3[1].fullName} (${top3[1].value}), dan ${top3[2].fullName} (${top3[2].value}) memimpin dengan gabungan ${top3Pct}%, menunjukkan dampak kewirausahaan yang kuat dan kolaborasi dengan industri.`;
  }, [chartData, total]);

  return (
    <DashboardCard
      title="Produk Mahasiswa yang Diadopsi Industri/Masyarakat"
      description="Dampak hilir dan inovasi mahasiswa"
      interpretation={interpretation}
    >
      <ResponsiveContainer width="100%" height={320}>
        <BarChart 
          data={chartData} 
          layout="vertical"
          margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
          <XAxis 
            type="number"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <YAxis 
            type="category"
            dataKey="category"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            width={115}
          />
          <Tooltip 
            formatter={(value: number) => [value, 'Produk']}
            labelFormatter={(label) => {
              const item = chartData.find(d => d.category === label);
              return item?.fullName || label;
            }}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </DashboardCard>
  );
}

