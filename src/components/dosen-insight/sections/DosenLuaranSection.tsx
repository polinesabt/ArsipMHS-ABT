import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { FileText, ExternalLink } from 'lucide-react';
import { useDosen } from '@/contexts/DosenContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChartTooltip, PieChartTooltip } from '@/components/insight/dashboard/ChartTooltip';

const PENDANAAN_COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

export function DosenLuaranSection() {
  const { luaranList } = useDosen();

  // 1. Data Bar Chart: Luaran Penelitian vs PKM per Tingkat Publikasi
  const publikasiGroupData = useMemo(() => {
    const groups = [
      { key: 'Jurnal Internasional Bereputasi', label: 'Jurnal Internasional Bereputasi' },
      { key: 'Jurnal Internasional', label: 'Jurnal Internasional' },
      { key: 'Jurnal Nasional Terakreditasi', label: 'Jurnal Terakreditasi (Sinta)' },
      { key: 'Seminar Nasional', label: 'Seminar / Prosiding' },
      { key: 'Tulisan di Media Massa', label: 'Media Massa' },
      { key: 'Pagelaran / Pameran', label: 'Forum / Pameran' },
    ];

    const counts: Record<string, { Penelitian: number; PKM: number }> = {};
    groups.forEach((g) => {
      counts[g.key] = { Penelitian: 0, PKM: 0 };
    });

    luaranList.forEach((d) => {
      (d.luaran || []).forEach((l) => {
        const j = l.jenisPublikasi || '';
        const kat = l.kategori || 'Penelitian';

        if (j.includes('Internasional Bereputasi')) {
          counts['Jurnal Internasional Bereputasi'][kat] += 1;
        } else if (j.includes('Internasional') && j.includes('Jurnal')) {
          counts['Jurnal Internasional'][kat] += 1;
        } else if (j.includes('Terakreditasi')) {
          counts['Jurnal Nasional Terakreditasi'][kat] += 1;
        } else if (j.includes('Seminar') || j.includes('Prosiding')) {
          counts['Seminar Nasional'][kat] += 1;
        } else if (j.includes('Media Massa')) {
          counts['Tulisan di Media Massa'][kat] += 1;
        } else {
          counts['Pagelaran / Pameran'][kat] += 1;
        }
      });
    });

    return groups.map((g) => ({
      name: g.label,
      Penelitian: counts[g.key]?.Penelitian || 0,
      PKM: counts[g.key]?.PKM || 0,
    }));
  }, [luaranList]);

  // 2. Data Area Chart: Tren Luaran per Tahun
  const trendTahunanData = useMemo(() => {
    const yearCounts: Record<string, { Penelitian: number; PKM: number; Total: number }> = {};

    luaranList.forEach((d) => {
      (d.luaran || []).forEach((l) => {
        const yr = l.tahun || '2024';
        if (!yearCounts[yr]) {
          yearCounts[yr] = { Penelitian: 0, PKM: 0, Total: 0 };
        }
        const kat = l.kategori || 'Penelitian';
        yearCounts[yr][kat] += 1;
        yearCounts[yr].Total += 1;
      });
    });

    return Object.keys(yearCounts)
      .sort()
      .map((year) => ({
        year,
        Penelitian: yearCounts[year].Penelitian,
        PKM: yearCounts[year].PKM,
        Total: yearCounts[year].Total,
      }));
  }, [luaranList]);

  // 3. Data Donut Chart: Sumber Pendanaan Luaran
  const sumberDanaData = useMemo(() => {
    let mandiri = 0;
    let dalamNegeri = 0;
    let luarNegeri = 0;

    luaranList.forEach((d) => {
      (d.luaran || []).forEach((l) => {
        const dana = l.sumberPendanaan || 'Perguruan Tinggi / Mandiri';
        if (dana.includes('Luar Negeri')) {
          luarNegeri += 1;
        } else if (dana.includes('Dalam Negeri')) {
          dalamNegeri += 1;
        } else {
          mandiri += 1;
        }
      });
    });

    return [
      { name: 'Perguruan Tinggi / Mandiri', value: mandiri, color: PENDANAAN_COLORS[0] },
      { name: 'Lembaga Dalam Negeri (DRTPM/Kementerian)', value: dalamNegeri, color: PENDANAAN_COLORS[1] },
      { name: 'Lembaga Luar Negeri', value: luarNegeri, color: PENDANAAN_COLORS[2] },
    ].filter((i) => i.value > 0);
  }, [luaranList]);

  return (
    <div id="luaran-penelitian-pkm" className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              Luaran Penelitian & PKM
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 ml-9">
            Produktivitas publikasi jurnal, prosiding seminar, tulisan media massa, dan sumber pendanaan.
          </p>
        </div>

        <Button variant="ghost" size="sm" asChild className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <Link to="/admin/dosen/luaran-penelitian-pkm">
            <span>Kelola Luaran</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Grouped Bar Chart: Luaran Penelitian vs PKM */}
        <div className="lg:col-span-7 adaptive-mobile-card p-4 sm:p-5 rounded-2xl bg-card/80 border border-border/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-semibold text-foreground">Distribusi Luaran Berdasarkan Tingkat Publikasi</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Komparasi hasil karya penelitian dan pengabdian dosen</p>
            </div>
          </div>

          <div className="h-[270px] sm:h-[290px] w-full">
            {publikasiGroupData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground border border-dashed rounded-xl">
                Belum ada data luaran publikasi
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={publikasiGroupData}
                  layout="vertical"
                  margin={{ top: 10, right: 25, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis dataKey="name" type="category" width={175} tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                  <Bar dataKey="Penelitian" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="PKM" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right Column: Area Chart & Donut Chart */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Trend Area Chart */}
          <div className="adaptive-mobile-card p-4 sm:p-5 rounded-2xl bg-card/80 border border-border/60 shadow-xs flex-1">
            <h4 className="text-sm font-semibold text-foreground">Tren Produktivitas Luaran per Tahun</h4>
            <p className="text-xs text-muted-foreground mt-0.5 mb-2">Pertumbuhan publikasi & karya per periode</p>
            <div className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendTahunanData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="Total" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut Chart: Sumber Dana */}
          <div className="adaptive-mobile-card p-4 sm:p-5 rounded-2xl bg-card/80 border border-border/60 shadow-xs flex-1">
            <h4 className="text-sm font-semibold text-foreground">Sumber Pendanaan Luaran</h4>
            <div className="flex items-center gap-3 mt-1">
              <div className="h-[100px] w-[110px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sumberDanaData} cx="50%" cy="50%" innerRadius={24} outerRadius={42} paddingAngle={3} dataKey="value">
                      {sumberDanaData.map((entry, index) => (
                        <Cell key={`dana-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[10px] text-muted-foreground space-y-1">
                <p><span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1" />Internal / Mandiri</p>
                <p><span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1" />Lembaga DN (DRTPM)</p>
                <p><span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1" />Lembaga LN</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
