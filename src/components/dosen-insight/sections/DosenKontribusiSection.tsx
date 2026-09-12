import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { GraduationCap, FlaskConical, HeartHandshake, ExternalLink, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react';
import { useDosen } from '@/contexts/DosenContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartTooltip, PieChartTooltip } from '@/components/insight/dashboard/ChartTooltip';

const PENGAJARAN_COLORS = ['#3b82f6', '#8b5cf6']; // Biru (PS ABT), Ungu (PS Lain)
const DUAL_BAR_COLORS = {
  penelitian: '#3b82f6', // Biru
  pengabdian: '#10b981', // Emerald
};

export function DosenKontribusiSection() {
  const {
    kontribusiPengajaranList,
    kontribusiPenelitianList,
    kontribusiPengabdianList,
  } = useDosen();

  const [activeTab, setActiveTab] = useState<'overview' | 'penelitian' | 'pengabdian'>('overview');

  // 1. Tab Overview - Chart 1: Perbandingan Dosen Mengajar di PS ABT vs PS Lain (Pie Chart dalam %)
  const pengajaranPieData = useMemo(() => {
    let dosenABT = 0;
    let dosenLain = 0;

    kontribusiPengajaranList.forEach((p) => {
      const hasABT = (p.matkulABT?.length || 0) > 0;
      const hasLain = (p.matkulPSLain?.length || 0) > 0;
      if (hasABT) dosenABT += 1;
      if (hasLain) dosenLain += 1;
    });

    const totalInstances = dosenABT + dosenLain || 1;
    const persenABT = ((dosenABT / totalInstances) * 100).toFixed(1);
    const persenLain = ((dosenLain / totalInstances) * 100).toFixed(1);

    const items = [
      { name: 'Program Studi ABT', value: dosenABT, persen: persenABT, color: PENGAJARAN_COLORS[0] },
      { name: 'Program Studi Lain', value: dosenLain, persen: persenLain, color: PENGAJARAN_COLORS[1] },
    ];

    return {
      items: items.filter((i) => i.value > 0),
      total: dosenABT + dosenLain,
      dosenABT,
      dosenLain,
      persenABT,
      persenLain,
    };
  }, [kontribusiPengajaranList]);

  // 2. Tab Overview - Chart 2: Gabungan Penelitian & Pengabdian Dual Bar per Tahun
  const trenDualBarData = useMemo(() => {
    const yearsSet = new Set<string>();

    kontribusiPenelitianList.forEach((d) => {
      (d.penelitian || []).forEach((p) => {
        if (p.tahun && p.tahun.trim() !== '') yearsSet.add(p.tahun.trim());
      });
    });

    kontribusiPengabdianList.forEach((d) => {
      (d.pkm || []).forEach((pk) => {
        if (pk.tahun && pk.tahun.trim() !== '') yearsSet.add(pk.tahun.trim());
      });
    });

    // Fallback if empty
    if (yearsSet.size === 0) {
      ['2021', '2022', '2023', '2024', '2025'].forEach((y) => yearsSet.add(y));
    }

    const sortedYears = Array.from(yearsSet).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

    return sortedYears.map((tahun) => {
      let countPenelitian = 0;
      let countPengabdian = 0;

      kontribusiPenelitianList.forEach((d) => {
        (d.penelitian || []).forEach((p) => {
          if (p.tahun === tahun) countPenelitian += 1;
        });
      });

      kontribusiPengabdianList.forEach((d) => {
        (d.pkm || []).forEach((pk) => {
          if (pk.tahun === tahun) countPengabdian += 1;
        });
      });

      return {
        tahun,
        Penelitian: countPenelitian,
        'Pengabdian (PKM)': countPengabdian,
      };
    });
  }, [kontribusiPenelitianList, kontribusiPengabdianList]);

  // 3. Tab Penelitian - Banyaknya Penelitian per Tahun
  const penelitianPerTahunData = useMemo(() => {
    const yearCounts: Record<string, number> = {};

    kontribusiPenelitianList.forEach((d) => {
      (d.penelitian || []).forEach((p) => {
        const yr = p.tahun?.trim() || '2024';
        yearCounts[yr] = (yearCounts[yr] || 0) + 1;
      });
    });

    const sortedYears = Object.keys(yearCounts).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    const totalPenelitian = Object.values(yearCounts).reduce((a, b) => a + b, 0);

    const chartData = sortedYears.map((tahun) => ({
      tahun,
      'Jumlah Penelitian': yearCounts[tahun],
    }));

    return {
      chartData,
      totalPenelitian,
      yearsCount: sortedYears.length || 1,
      avgPerYear: (totalPenelitian / (sortedYears.length || 1)).toFixed(1),
    };
  }, [kontribusiPenelitianList]);

  // 4. Tab Pengabdian - Banyaknya Pengabdian per Tahun
  const pengabdianPerTahunData = useMemo(() => {
    const yearCounts: Record<string, number> = {};

    kontribusiPengabdianList.forEach((d) => {
      (d.pkm || []).forEach((pk) => {
        const yr = pk.tahun?.trim() || '2024';
        yearCounts[yr] = (yearCounts[yr] || 0) + 1;
      });
    });

    const sortedYears = Object.keys(yearCounts).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    const totalPengabdian = Object.values(yearCounts).reduce((a, b) => a + b, 0);

    const chartData = sortedYears.map((tahun) => ({
      tahun,
      'Jumlah Pengabdian': yearCounts[tahun],
    }));

    return {
      chartData,
      totalPengabdian,
      yearsCount: sortedYears.length || 1,
      avgPerYear: (totalPengabdian / (sortedYears.length || 1)).toFixed(1),
    };
  }, [kontribusiPengabdianList]);

  return (
    <div id="kontribusi-intelektual" className="space-y-4 pt-2">
      {/* Header Section without Modul Prefix */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              Kontribusi Intelektual (Tridharma)
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 ml-9">
            Statistik agregasi kegiatan pengajaran program studi, riset penelitian, dan pengabdian masyarakat dosen.
          </p>
        </div>

        <Button variant="ghost" size="sm" asChild className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <Link to="/admin/dosen/kontribusi">
            <span>Kelola Kontribusi</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </div>

      {/* Tabs Navigation: Overview, Penelitian, Pengabdian */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as typeof activeTab)} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-sm mb-3">
          <TabsTrigger value="overview" className="text-xs font-medium">Overview</TabsTrigger>
          <TabsTrigger value="penelitian" className="text-xs font-medium">Penelitian</TabsTrigger>
          <TabsTrigger value="pengabdian" className="text-xs font-medium">Pengabdian</TabsTrigger>
        </TabsList>

        {/* TAB 1: OVERVIEW (Pie Pengajaran & Dual Bar Penelitian-Pengabdian) */}
        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Chart 1 (Pie Chart): Modul Pengajaran ABT vs PS Lain dalam % */}
            <div className="lg:col-span-4 adaptive-mobile-card p-4 sm:p-5 rounded-2xl bg-card/80 border border-border/60 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground">Distribusi Pengajaran Dosen</h4>
                  <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-semibold">
                    Format %
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Proporsi dosen mengajar di PS ABT vs Program Studi Lain
                </p>
              </div>

              <div className="h-[190px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pengajaranPieData.items}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pengajaranPieData.items.map((entry, index) => (
                        <Cell key={`pie-ajar-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieChartTooltip total={pengajaranPieData.total} />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend & Percent Stats */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-center">
                <div className="p-2 rounded-xl bg-blue-500/5 border border-blue-500/20">
                  <div className="text-[11px] font-medium text-muted-foreground flex items-center justify-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                    PS ABT
                  </div>
                  <div className="text-base font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                    {pengajaranPieData.persenABT}%
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {pengajaranPieData.dosenABT} Dosen
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-purple-500/5 border border-purple-500/20">
                  <div className="text-[11px] font-medium text-muted-foreground flex items-center justify-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                    PS Lain
                  </div>
                  <div className="text-base font-bold text-purple-600 dark:text-purple-400 mt-0.5">
                    {pengajaranPieData.persenLain}%
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {pengajaranPieData.dosenLain} Dosen
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 2 (Dual Bar): Gabungan Penelitian dan Pengabdian per Tahun */}
            <div className="lg:col-span-8 adaptive-mobile-card p-4 sm:p-5 rounded-2xl bg-card/80 border border-border/60 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Tren Penelitian &amp; Pengabdian Masyarakat
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Perbandingan dual bar jumlah penelitian dan pengabdian per tahun pelaksanaan
                  </p>
                </div>
              </div>

              <div className="h-[260px] sm:h-[280px] w-full">
                {trenDualBarData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground border border-dashed rounded-xl">
                    Belum ada data penelitian &amp; pengabdian
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trenDualBarData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="tahun" tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                      <Bar dataKey="Penelitian" fill={DUAL_BAR_COLORS.penelitian} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Pengabdian (PKM)" fill={DUAL_BAR_COLORS.pengabdian} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: PENELITIAN (1 Grafik Tunggal Banyaknya Penelitian per Tahun) */}
        <TabsContent value="penelitian" className="mt-0">
          <div className="adaptive-mobile-card p-4 sm:p-6 rounded-2xl bg-card/80 border border-border/60 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <FlaskConical className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-foreground">
                    Grafik Banyaknya Penelitian per Tahun
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 ml-8">
                  Distribusi volume judul penelitian yang terlaksana oleh dosen Program Studi ABT
                </p>
              </div>

              {/* Summary Badges */}
              <div className="flex items-center gap-2 text-xs">
                <div className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold">
                  Total: {penelitianPerTahunData.totalPenelitian} Riset
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-muted/60 border border-border/60 text-muted-foreground">
                  Rata-rata: {penelitianPerTahunData.avgPerYear} / Tahun
                </div>
              </div>
            </div>

            {/* Single Full-width Bar Chart */}
            <div className="h-[280px] sm:h-[320px] w-full pt-2">
              {penelitianPerTahunData.chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground border border-dashed rounded-xl">
                  Belum ada data penelitian terdaftar
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={penelitianPerTahunData.chartData} margin={{ top: 15, right: 25, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="tahun" tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="Jumlah Penelitian" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: PENGABDIAN (1 Grafik Tunggal Banyaknya Pengabdian per Tahun) */}
        <TabsContent value="pengabdian" className="mt-0">
          <div className="adaptive-mobile-card p-4 sm:p-6 rounded-2xl bg-card/80 border border-border/60 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <HeartHandshake className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-foreground">
                    Grafik Banyaknya Pengabdian (PKM) per Tahun
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 ml-8">
                  Distribusi volume program pengabdian kepada masyarakat yang terlaksana oleh dosen Program Studi ABT
                </p>
              </div>

              {/* Summary Badges */}
              <div className="flex items-center gap-2 text-xs">
                <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold">
                  Total: {pengabdianPerTahunData.totalPengabdian} PKM
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-muted/60 border border-border/60 text-muted-foreground">
                  Rata-rata: {pengabdianPerTahunData.avgPerYear} / Tahun
                </div>
              </div>
            </div>

            {/* Single Full-width Bar Chart */}
            <div className="h-[280px] sm:h-[320px] w-full pt-2">
              {pengabdianPerTahunData.chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground border border-dashed rounded-xl">
                  Belum ada data pengabdian terdaftar
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pengabdianPerTahunData.chartData} margin={{ top: 15, right: 25, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="tahun" tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="Jumlah Pengabdian" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
