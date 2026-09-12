import React, { useMemo } from 'react';
import { Users, GraduationCap, Clock, FileText, UserCheck, RefreshCw } from 'lucide-react';
import { useDosen } from '@/contexts/DosenContext';
import { Button } from '@/components/ui/button';
import { calculateAvgSks, latestWaktuMengajarPerDosen } from '@/data/mockWaktuMengajarData';
import { calculateTotalLuaran } from '@/data/mockLuaranPenelitianPkmData';

export function DosenOverviewBanner() {
  const {
    dosenList,
    waktuMengajarList,
    luaranList,
    tendikList,
    refreshFromDatabase,
    isLoading,
  } = useDosen();

  const stats = useMemo(() => {
    const totalDosen = dosenList.length;
    const dosenTetap = dosenList.filter((d) => d.statusDosen === 'Tetap').length;
    const dosenS3 = dosenList.filter((d) =>
      (d.pendidikanPascaSarjana || []).some((p) => p.toLowerCase().includes('s3') || p.toLowerCase().includes('doktor'))
    ).length;
    const persenS3 = totalDosen > 0 ? Math.round((dosenS3 / totalDosen) * 100) : 0;

    // Average EWMP SKS
    const latestRecords = latestWaktuMengajarPerDosen(waktuMengajarList);
    const totalAvgSks = latestRecords.reduce((acc, curr) => acc + calculateAvgSks(curr), 0);
    const avgEWMP = latestRecords.length > 0 ? (totalAvgSks / latestRecords.length).toFixed(1) : '0';

    // Total Luaran
    const totalLuaran = luaranList.reduce((acc, curr) => acc + calculateTotalLuaran(curr), 0);

    // Total Tendik
    const totalTendik = tendikList.length;
    const tendikSertif = tendikList.filter((t) => (t.sertifikatKompetensi || []).length > 0).length;
    const persenTendikSertif = totalTendik > 0 ? Math.round((tendikSertif / totalTendik) * 100) : 0;

    return {
      totalDosen,
      dosenTetap,
      dosenS3,
      persenS3,
      avgEWMP,
      totalLuaran,
      totalTendik,
      persenTendikSertif,
    };
  }, [dosenList, waktuMengajarList, luaranList, tendikList]);

  return (
    <div className="space-y-4">
      {/* Header Bar with Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border/40">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Dashboard Dosen & Tenaga Kependidikan
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Monitoring data kinerja tridharma, beban mengajar, dan luaran dosen berbasis database terintegrasi.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshFromDatabase()}
            disabled={isLoading}
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </Button>
        </div>
      </div>

      {/* 5 KPI Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Dosen */}
        <div className="adaptive-mobile-card p-3.5 sm:p-4 rounded-2xl bg-card/80 border border-border/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-muted-foreground">Total Dosen</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h4 className="text-xl sm:text-2xl font-bold text-foreground">{stats.totalDosen}</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              <span className="font-semibold text-foreground">{stats.dosenTetap}</span> Dosen Tetap
            </p>
          </div>
        </div>

        {/* Kualifikasi Doktor */}
        <div className="adaptive-mobile-card p-3.5 sm:p-4 rounded-2xl bg-card/80 border border-border/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-muted-foreground">Kualifikasi S3</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h4 className="text-xl sm:text-2xl font-bold text-foreground">{stats.persenS3}%</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              <span className="font-semibold text-foreground">{stats.dosenS3}</span> Dosen Bergelar Doktor
            </p>
          </div>
        </div>

        {/* Rata-rata EWMP */}
        <div className="adaptive-mobile-card p-3.5 sm:p-4 rounded-2xl bg-card/80 border border-border/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-muted-foreground">Rata-rata EWMP</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h4 className="text-xl sm:text-2xl font-bold text-foreground">{stats.avgEWMP} <span className="text-sm font-normal text-muted-foreground">SKS</span></h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Target Beban: <span className="font-medium text-emerald-600 dark:text-emerald-400">12 - 16 SKS</span>
            </p>
          </div>
        </div>

        {/* Total Luaran Riset & PKM */}
        <div className="adaptive-mobile-card p-3.5 sm:p-4 rounded-2xl bg-card/80 border border-border/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-muted-foreground">Luaran Riset & PKM</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h4 className="text-xl sm:text-2xl font-bold text-foreground">{stats.totalLuaran}</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Publikasi, Seminar & Media
            </p>
          </div>
        </div>

        {/* Tenaga Kependidikan */}
        <div className="adaptive-mobile-card p-3.5 sm:p-4 rounded-2xl bg-card/80 border border-border/60 shadow-xs flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-muted-foreground">Tenaga Kependidikan</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h4 className="text-xl sm:text-2xl font-bold text-foreground">{stats.totalTendik} <span className="text-sm font-normal text-muted-foreground">Staf</span></h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              <span className="font-semibold text-foreground">{stats.persenTendikSertif}%</span> Bersertifikasi Profesi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
