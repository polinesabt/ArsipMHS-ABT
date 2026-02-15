import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { DashboardCard } from '@/components/insight/dashboard/DashboardCard';
import { PieChartTooltip } from '@/components/insight/dashboard/ChartTooltip';
import { useInsightDashboard } from '@/contexts/InsightDashboardContext';
import { jobRelevanceData, years, Year } from '@/data/insightMockData';

const COLORS = {
  relevant: 'hsl(145, 60%, 45%)',
  notRelevant: 'hsl(0, 65%, 55%)',
};

export function JobRelevance() {
  const { selectedYear } = useInsightDashboard();

  const data = useMemo(() => {
    if (selectedYear === 'all') {
      const aggregate = { relevant: 0, notRelevant: 0, tracked: 0 };
      years.forEach((year) => {
        const yearData = jobRelevanceData[year];
        aggregate.relevant += yearData.relevant;
        aggregate.notRelevant += yearData.notRelevant;
        aggregate.tracked += yearData.tracked;
      });
      return aggregate;
    }
    return jobRelevanceData[selectedYear as Year];
  }, [selectedYear]);

  const chartData = [
    { name: 'Sesuai', value: data.relevant, fill: COLORS.relevant },
    { name: 'Tidak Sesuai', value: data.notRelevant, fill: COLORS.notRelevant },
  ];

  const total = data.relevant + data.notRelevant;
  const relevantPct = ((data.relevant / total) * 100).toFixed(1);

  const interpretation = useMemo(() => {
    const yearText = selectedYear === 'all' ? 'Periode 2021-2026' : `Pada ${selectedYear}`;
    
    return `${yearText}, ${relevantPct}% lulusan terpantau (${data.relevant.toLocaleString()} dari ${total.toLocaleString()}) bekerja sesuai bidang studinya. Tingkat kesesuaian yang tinggi ini menunjukkan kurikulum yang selaras dengan kebutuhan industri dan bimbingan karier yang efektif.`;
  }, [data, relevantPct, selectedYear, total]);

  return (
    <DashboardCard
      title="Kesesuaian Bidang Kerja"
      description="Kesesuaian pekerjaan lulusan dengan bidang studi"
      interpretation={interpretation}
    >
      <div className="relative h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<PieChartTooltip total={total} />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">{relevantPct}%</p>
            <p className="text-xs text-muted-foreground">Sesuai</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 mt-4">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.fill }}
            />
            <span className="text-sm text-muted-foreground">{item.name}</span>
            <span className="text-sm font-medium text-foreground">
              ({item.value.toLocaleString()})
            </span>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

