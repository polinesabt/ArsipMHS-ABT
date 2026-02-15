import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { DashboardCard } from '@/components/insight/dashboard/DashboardCard';
import { PieChartTooltip } from '@/components/insight/dashboard/ChartTooltip';
import { Button } from '@/components/ui/button';
import { useInsightDashboard } from '@/contexts/InsightDashboardContext';
import { achievementsByYear, years, Year } from '@/data/insightMockData';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type DrilldownLevel = 'main' | 'academic' | 'nonAcademic';

const COLORS = {
  academic: 'hsl(215, 70%, 45%)',
  nonAcademic: 'hsl(270, 45%, 60%)',
  local: 'hsl(205, 65%, 60%)',
  national: 'hsl(215, 70%, 45%)',
  international: 'hsl(220, 80%, 35%)',
};

export function StudentAchievements() {
  const { selectedYear } = useInsightDashboard();
  const [drilldownLevel, setDrilldownLevel] = useState<DrilldownLevel>('main');

  const data = useMemo(() => {
    if (selectedYear === 'all') {
      // Aggregate all years
      const aggregate = { academic: 0, nonAcademic: 0, academicBreakdown: { local: 0, national: 0, international: 0 }, nonAcademicBreakdown: { local: 0, national: 0, international: 0 } };
      years.forEach((year) => {
        const yearData = achievementsByYear[year];
        aggregate.academic += yearData.academic.total;
        aggregate.nonAcademic += yearData.nonAcademic.total;
        aggregate.academicBreakdown.local += yearData.academic.breakdown.local;
        aggregate.academicBreakdown.national += yearData.academic.breakdown.national;
        aggregate.academicBreakdown.international += yearData.academic.breakdown.international;
        aggregate.nonAcademicBreakdown.local += yearData.nonAcademic.breakdown.local;
        aggregate.nonAcademicBreakdown.national += yearData.nonAcademic.breakdown.national;
        aggregate.nonAcademicBreakdown.international += yearData.nonAcademic.breakdown.international;
      });
      return aggregate;
    }
    const yearData = achievementsByYear[selectedYear as Year];
    return {
      academic: yearData.academic.total,
      nonAcademic: yearData.nonAcademic.total,
      academicBreakdown: yearData.academic.breakdown,
      nonAcademicBreakdown: yearData.nonAcademic.breakdown,
    };
  }, [selectedYear]);

  const chartData = useMemo(() => {
    if (drilldownLevel === 'main') {
      return [
        { name: 'Akademik', value: data.academic, fill: COLORS.academic },
        { name: 'Non-Akademik', value: data.nonAcademic, fill: COLORS.nonAcademic },
      ];
    }

    const breakdown = drilldownLevel === 'academic' ? data.academicBreakdown : data.nonAcademicBreakdown;
    return [
      { name: 'Lokal/Regional', value: breakdown.local, fill: COLORS.local },
      { name: 'Nasional', value: breakdown.national, fill: COLORS.national },
      { name: 'Internasional', value: breakdown.international, fill: COLORS.international },
    ];
  }, [data, drilldownLevel]);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const handlePieClick = (entry: { name: string }) => {
    if (drilldownLevel === 'main') {
      if (entry.name === 'Akademik') {
        setDrilldownLevel('academic');
      } else if (entry.name === 'Non-Akademik') {
        setDrilldownLevel('nonAcademic');
      }
    }
  };

  const breadcrumbs = useMemo(() => {
    const items = [{ label: 'Prestasi', level: 'main' as DrilldownLevel }];
    if (drilldownLevel === 'academic') {
      items.push({ label: 'Akademik', level: 'academic' as DrilldownLevel });
    } else if (drilldownLevel === 'nonAcademic') {
      items.push({ label: 'Non-Akademik', level: 'nonAcademic' as DrilldownLevel });
    }
    return items;
  }, [drilldownLevel]);

  const interpretation = useMemo(() => {
    const yearText = selectedYear === 'all' ? 'Periode 2021-2026' : `Pada ${selectedYear}`;
    
    if (drilldownLevel === 'main') {
      const academicPct = ((data.academic / total) * 100).toFixed(1);
      return `${yearText}, tercatat ${total.toLocaleString()} total prestasi mahasiswa. Prestasi akademik mencapai ${academicPct}% (${data.academic.toLocaleString()}), menunjukkan kinerja akademik yang kuat. Klik segmen untuk melihat sebaran tingkat capaian.`;
    }

    const breakdown = drilldownLevel === 'academic' ? data.academicBreakdown : data.nonAcademicBreakdown;
    const typeLabel = drilldownLevel === 'academic' ? 'akademik' : 'non-akademik';
    const intlPct = ((breakdown.international / total) * 100).toFixed(1);
    
    return `${yearText}, prestasi ${typeLabel} menunjukkan ${intlPct}% capaian internasional (${breakdown.international.toLocaleString()} prestasi), menandakan daya saing global yang meningkat. Capaian tingkat nasional (${breakdown.national.toLocaleString()}) menjadi mayoritas, mencerminkan reputasi domestik yang kuat.`;
  }, [data, drilldownLevel, selectedYear, total]);

  return (
    <DashboardCard
      title="Prestasi Mahasiswa"
      description="Distribusi prestasi akademik dan non-akademik"
      interpretation={interpretation}
      headerAction={
        drilldownLevel !== 'main' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDrilldownLevel('main')}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Kembali
          </Button>
        )
      }
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-4 text-sm">
        {breadcrumbs.map((item, index) => (
          <div key={item.level} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            <button
              onClick={() => setDrilldownLevel(item.level)}
              className={cn(
                index === breadcrumbs.length - 1 ? 'breadcrumb-current' : 'breadcrumb-link'
              )}
            >
              {item.label}
            </button>
          </div>
        ))}
      </nav>

      {/* Chart */}
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
              onClick={handlePieClick}
              className={drilldownLevel === 'main' ? 'cursor-pointer' : ''}
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
            <p className="text-3xl font-bold text-foreground">{total.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-4">
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

