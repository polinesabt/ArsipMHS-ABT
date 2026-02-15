import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DashboardCard } from '@/components/insight/dashboard/DashboardCard';
import { ChartTooltip } from '@/components/insight/dashboard/ChartTooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInsightDashboard } from '@/contexts/InsightDashboardContext';
import { publicationsData, years, Year } from '@/data/insightMockData';

type ViewType = 'journals' | 'seminars';

export function Publications() {
  const { selectedYear } = useInsightDashboard();
  const [viewType, setViewType] = useState<ViewType>('journals');

  const journalData = useMemo(() => {
    if (selectedYear === 'all') {
      return years.map((year) => {
        const d = publicationsData[year];
        return {
          year: year.toString(),
          'Nasional Tidak Terakreditasi': d.nationalNonAccredited,
          'Nasional Terakreditasi': d.nationalAccredited,
          'Internasional': d.international,
          'Internasional Bereputasi': d.reputableInternational,
        };
      });
    }
    const d = publicationsData[selectedYear as Year];
    return [{
      year: selectedYear.toString(),
      'Nasional Tidak Terakreditasi': d.nationalNonAccredited,
      'Nasional Terakreditasi': d.nationalAccredited,
      'Internasional': d.international,
      'Internasional Bereputasi': d.reputableInternational,
    }];
  }, [selectedYear]);

  const seminarData = useMemo(() => {
    if (selectedYear === 'all') {
      return years.map((year) => {
        const d = publicationsData[year];
        return {
          year: year.toString(),
          'Seminar Lokal': d.localSeminars,
          'Seminar Nasional': d.nationalSeminars,
          'Seminar Internasional': d.internationalSeminars,
          'Pameran': d.exhibitions,
        };
      });
    }
    const d = publicationsData[selectedYear as Year];
    return [{
      year: selectedYear.toString(),
      'Seminar Lokal': d.localSeminars,
      'Seminar Nasional': d.nationalSeminars,
      'Seminar Internasional': d.internationalSeminars,
      'Pameran': d.exhibitions,
    }];
  }, [selectedYear]);

  const interpretation = useMemo(() => {
    const yearText = selectedYear === 'all' ? 'Periode 2021-2026' : `Pada ${selectedYear}`;
    
    if (selectedYear === 'all') {
      const totalJournals = years.reduce((sum, year) => {
        const d = publicationsData[year];
        return sum + d.nationalNonAccredited + d.nationalAccredited + d.international + d.reputableInternational;
      }, 0);
      const totalIntl = years.reduce((sum, year) => {
        const d = publicationsData[year];
        return sum + d.international + d.reputableInternational;
      }, 0);
      const intlPct = ((totalIntl / totalJournals) * 100).toFixed(1);
      
      return `${yearText}, publikasi mahasiswa menunjukkan pertumbuhan stabil dengan ${totalJournals.toLocaleString()} total publikasi jurnal. Publikasi internasional mencapai ${intlPct}% dari total, menandakan kualitas riset yang meningkat dan kehadiran akademik global.`;
    }
    
    const d = publicationsData[selectedYear as Year];
    const totalJournals = d.nationalNonAccredited + d.nationalAccredited + d.international + d.reputableInternational;
    const intlPct = (((d.international + d.reputableInternational) / totalJournals) * 100).toFixed(1);
    
    return `${yearText}, mahasiswa menghasilkan ${totalJournals} publikasi jurnal dengan ${intlPct}% terbit di forum internasional. Ini mencerminkan budaya akademik yang kuat dan pendampingan riset yang efektif.`;
  }, [selectedYear]);

  return (
    <DashboardCard
      title="Publikasi & Presentasi Mahasiswa"
      description="Distribusi output akademik (2021-2026)"
      interpretation={interpretation}
    >
      <Tabs value={viewType} onValueChange={(v) => setViewType(v as ViewType)} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="journals">Jurnal</TabsTrigger>
          <TabsTrigger value="seminars">Seminar & Kegiatan</TabsTrigger>
        </TabsList>

        <TabsContent value="journals">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={journalData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                wrapperStyle={{ paddingTop: 10 }}
                formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
              />
              <Bar dataKey="Nasional Tidak Terakreditasi" stackId="a" fill="hsl(var(--chart-neutral))" />
              <Bar dataKey="Nasional Terakreditasi" stackId="a" fill="hsl(var(--level-national))" />
              <Bar dataKey="Internasional" stackId="a" fill="hsl(var(--chart-academic))" />
              <Bar dataKey="Internasional Bereputasi" stackId="a" fill="hsl(var(--level-international))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="seminars">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={seminarData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                wrapperStyle={{ paddingTop: 10 }}
                formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
              />
              <Bar dataKey="Seminar Lokal" fill="hsl(var(--level-local))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Seminar Nasional" fill="hsl(var(--level-national))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Seminar Internasional" fill="hsl(var(--level-international))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Pameran" fill="hsl(var(--chart-nonacademic))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </DashboardCard>
  );
}

