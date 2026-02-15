import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { DashboardCard } from '@/components/insight/dashboard/DashboardCard';
import { PieChartTooltip } from '@/components/insight/dashboard/ChartTooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { researchOutputsData } from '@/data/insightMockData';

type ViewType = 'ip' | 'tech' | 'other';

const IP_COLORS = [
  'hsl(215, 70%, 45%)',
  'hsl(225, 65%, 50%)',
  'hsl(205, 75%, 50%)',
  'hsl(195, 70%, 45%)',
  'hsl(270, 45%, 55%)',
  'hsl(280, 40%, 50%)',
  'hsl(145, 55%, 45%)',
  'hsl(175, 50%, 45%)',
];

export function ResearchOutputs() {
  const [viewType, setViewType] = useState<ViewType>('ip');

  const ipData = useMemo(() => {
    const ip = researchOutputsData.intellectualProperty;
    return [
      { name: 'Hak Cipta', value: ip.copyrights },
      { name: 'Merek Dagang', value: ip.trademarks },
      { name: 'Desain Industri', value: ip.industrialDesigns },
      { name: 'Paten Sederhana', value: ip.simplePatents },
      { name: 'Paten', value: ip.patents },
      { name: 'Rahasia Dagang', value: ip.tradeSecrets },
      { name: 'Indikasi Geografis', value: ip.geographicalIndications },
      { name: 'Tata Letak Sirkuit Terpadu', value: ip.integratedCircuitLayouts },
    ];
  }, []);

  const techData = useMemo(() => {
    const tech = researchOutputsData.appropriateTechnology;
    return [
      { name: 'Pengembangan Perangkat Lunak', value: tech.softwareDevelopment, fill: 'hsl(215, 70%, 45%)' },
      { name: 'Produk', value: tech.products, fill: 'hsl(270, 45%, 55%)' },
    ];
  }, []);

  const otherData = useMemo(() => {
    return [
      { name: 'Konsultasi & Pendampingan', value: researchOutputsData.consultingMentoring, fill: 'hsl(215, 70%, 45%)' },
      { name: 'Bab Buku', value: researchOutputsData.books.bookChapters, fill: 'hsl(225, 65%, 50%)' },
      { name: 'Rekayasa Sosial', value: researchOutputsData.socialEngineering, fill: 'hsl(205, 75%, 50%)' },
      { name: 'Produk Terstandar', value: researchOutputsData.standardizedProducts, fill: 'hsl(145, 55%, 45%)' },
      { name: 'Buku ISBN', value: researchOutputsData.books.isbnBooks, fill: 'hsl(270, 45%, 55%)' },
      { name: 'Produk Tersertifikasi', value: researchOutputsData.certifiedProducts, fill: 'hsl(35, 85%, 55%)' },
    ];
  }, []);

  const ipTotal = ipData.reduce((sum, item) => sum + item.value, 0);
  const techTotal = techData.reduce((sum, item) => sum + item.value, 0);
  const otherTotal = otherData.reduce((sum, item) => sum + item.value, 0);

  const interpretation = useMemo(() => {
    const grandTotal = ipTotal + techTotal + otherTotal;
    const ip = researchOutputsData.intellectualProperty;
    
    return `Luaran riset mahasiswa mencakup ${ipTotal} pendaftaran kekayaan intelektual (${ip.copyrights} hak cipta, ${ip.trademarks} merek dagang, ${ip.patents} paten), ${techTotal} pengembangan teknologi, serta ${otherTotal} luaran lain termasuk ${researchOutputsData.books.isbnBooks + researchOutputsData.books.bookChapters} publikasi buku. Ini menunjukkan budaya inovasi yang berkelanjutan dan kontribusi nyata pada penciptaan pengetahuan.`;
  }, [ipTotal, techTotal, otherTotal]);

  return (
    <DashboardCard
      title="Luaran Riset & Pengabdian Mahasiswa"
      description="Keberlanjutan inovasi dan kontribusi mahasiswa"
      interpretation={interpretation}
    >
      <Tabs value={viewType} onValueChange={(v) => setViewType(v as ViewType)} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="ip">Kekayaan Intelektual</TabsTrigger>
          <TabsTrigger value="tech">Teknologi</TabsTrigger>
          <TabsTrigger value="other">Luaran Lainnya</TabsTrigger>
        </TabsList>

        <TabsContent value="ip">
          <div className="relative h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ipData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {ipData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={IP_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip content={<PieChartTooltip total={ipTotal} />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{ipTotal}</p>
                <p className="text-xs text-muted-foreground">Hak KI</p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
            {ipData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: IP_COLORS[index] }}
                />
                <span className="text-xs text-muted-foreground">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tech">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={techData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip 
                formatter={(value: number) => [value, 'Outputs']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {techData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="other">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart 
              data={otherData} 
              layout="vertical"
              margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis 
                type="number"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                type="category"
                dataKey="name"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                width={95}
              />
              <Tooltip 
                formatter={(value: number) => [value, 'Outputs']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {otherData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </DashboardCard>
  );
}

