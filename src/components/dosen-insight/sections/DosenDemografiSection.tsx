import React, { useMemo } from 'react';
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
import { Users, Award, ExternalLink } from 'lucide-react';
import { useDosen } from '@/contexts/DosenContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChartTooltip, PieChartTooltip } from '@/components/insight/dashboard/ChartTooltip';

const JABATAN_ORDER = ['Profesor / Guru Besar', 'Lektor Kepala', 'Lektor', 'Asisten Ahli'];

const STATUS_COLORS = ['#3b82f6', '#f59e0b']; // Biru (Tetap), Amber (Tidak Tetap)
const SERTIF_COLORS = ['#10b981', '#94a3b8']; // Emerald (Ada Serdos), Slate (Belum)

function normalizeJabatan(jabatan?: string): string {
  if (!jabatan) return 'Asisten Ahli';
  const lower = jabatan.toLowerCase();
  if (lower.includes('profesor') || lower.includes('guru besar')) return 'Profesor / Guru Besar';
  if (lower.includes('lektor kepala')) return 'Lektor Kepala';
  if (lower.includes('lektor')) return 'Lektor';
  if (lower.includes('asisten ahli')) return 'Asisten Ahli';
  return 'Asisten Ahli';
}

export function DosenDemografiSection() {
  const { dosenList } = useDosen();

  // 1. Data Distribusi Jabatan Fungsional & Kualifikasi
  const jabatanData = useMemo(() => {
    const counts: Record<string, { S3: number; S2: number; total: number }> = {};
    JABATAN_ORDER.forEach((j) => {
      counts[j] = { S3: 0, S2: 0, total: 0 };
    });

    dosenList.forEach((d) => {
      const jab = normalizeJabatan(d.jabatan);
      if (!counts[jab]) {
        counts[jab] = { S3: 0, S2: 0, total: 0 };
      }
      const isS3 = (d.pendidikanPascaSarjana || []).some(
        (p) => p.toLowerCase().includes('s3') || p.toLowerCase().includes('doktor')
      );
      if (isS3) {
        counts[jab].S3 += 1;
      } else {
        counts[jab].S2 += 1;
      }
      counts[jab].total += 1;
    });

    return JABATAN_ORDER.map((jabatan) => ({
      name: jabatan,
      'Doktor (S3)': counts[jabatan]?.S3 || 0,
      'Magister (S2)': counts[jabatan]?.S2 || 0,
      total: counts[jabatan]?.total || 0,
    })).filter((item) => item.total > 0 || dosenList.length === 0);
  }, [dosenList]);

  // 2. Data Status Kepegawaian
  const statusData = useMemo(() => {
    const tetap = dosenList.filter((d) => d.statusDosen === 'Tetap').length;
    const tidakTetap = dosenList.filter((d) => d.statusDosen === 'Tidak Tetap').length;
    return [
      { name: 'Dosen Tetap', value: tetap, color: STATUS_COLORS[0] },
      { name: 'Dosen Tidak Tetap / Praktisi', value: tidakTetap, color: STATUS_COLORS[1] },
    ].filter((item) => item.value > 0);
  }, [dosenList]);

  // 3. Data Kepemilikan Sertifikat Pendidik (Serdos)
  const sertifikasiData = useMemo(() => {
    const bersertifikat = dosenList.filter(
      (d) => d.sertifikatPendidik && d.sertifikatPendidik !== '-' && d.sertifikatPendidik.trim() !== ''
    ).length;
    const belum = dosenList.length - bersertifikat;
    return [
      { name: 'Tersertifikasi Pendidik', value: bersertifikat, color: SERTIF_COLORS[0] },
      { name: 'Belum Tersertifikasi', value: Math.max(0, belum), color: SERTIF_COLORS[1] },
    ].filter((item) => item.value > 0);
  }, [dosenList]);

  return (
    <div id="pengelolaan-dosen" className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              Pengelolaan & Demografi Dosen
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 ml-9">
            Profil jenjang jabatan fungsional, rasio kualifikasi pendidikan pascasarjana, dan status sertifikasi.
          </p>
        </div>

        <Button variant="ghost" size="sm" asChild className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <Link to="/admin/dosen/pengelolaan">
            <span>Kelola Dosen</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Horizontal Bar Chart: Jabatan Fungsional & Kualifikasi */}
        <div className="lg:col-span-7 adaptive-mobile-card p-4 sm:p-5 rounded-2xl bg-card/80 border border-border/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-semibold text-foreground">Distribusi Jabatan Fungsional & Kualifikasi</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Komposisi dosen bergelar S2 vs S3 per jabatan fungsional</p>
            </div>
          </div>

          <div className="h-[260px] sm:h-[280px] w-full">
            {jabatanData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground border border-dashed rounded-xl">
                Belum ada data dosen terdaftar
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={jabatanData}
                  layout="vertical"
                  margin={{ top: 10, right: 25, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={110}
                    tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                  <Bar dataKey="Doktor (S3)" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Magister (S2)" stackId="a" fill="#93c5fd" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Duo Donut Chart Card */}
        <div className="lg:col-span-5 adaptive-mobile-card p-4 sm:p-5 rounded-2xl bg-card/80 border border-border/60 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-semibold text-foreground">Status Kepegawaian & Sertifikasi</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Proporsi dosen tetap dan kepemilikan Serdos</p>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            {/* Donut 1: Status Kepegawaian */}
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-medium text-muted-foreground mb-1">Status Dosen</span>
              <div className="h-[140px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={32}
                      outerRadius={52}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`status-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieChartTooltip total={dosenList.length} />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[10px] text-center text-muted-foreground space-y-0.5">
                <p><span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1" />Tetap</p>
                <p><span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1" />Tidak Tetap</p>
              </div>
            </div>

            {/* Donut 2: Sertifikat Pendidik */}
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-medium text-muted-foreground mb-1">Sertifikasi Pendidik</span>
              <div className="h-[140px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sertifikasiData}
                      cx="50%"
                      cy="50%"
                      innerRadius={32}
                      outerRadius={52}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {sertifikasiData.map((entry, index) => (
                        <Cell key={`sertif-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieChartTooltip total={dosenList.length} />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[10px] text-center text-muted-foreground space-y-0.5">
                <p><span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1" />Serdos</p>
                <p><span className="inline-block w-2 h-2 rounded-full bg-slate-400 mr-1" />Belum Serdos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
