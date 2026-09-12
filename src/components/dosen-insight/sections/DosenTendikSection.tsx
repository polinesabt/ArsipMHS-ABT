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
} from 'recharts';
import { UserCheck, ExternalLink } from 'lucide-react';
import { useDosen } from '@/contexts/DosenContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChartTooltip, PieChartTooltip } from '@/components/insight/dashboard/ChartTooltip';

const PENDIDIKAN_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b']; // D3, S1, S2, S3
const TENDIK_SERTIF_COLORS = ['#059669', '#cbd5e1']; // Emerald (Ada Sertif), Slate (Belum)

// Urutan standar pangkat / golongan ruang ASN / Tendik untuk ordering sumbu yang konsisten
const STANDARD_GOLONGAN_ORDER = [
  'Gol. IV/e', 'Gol. IV/d', 'Gol. IV/c', 'Gol. IV/b', 'Gol. IV/a',
  'Gol. III/d', 'Gol. III/c', 'Gol. III/b', 'Gol. III/a',
  'Gol. II/d', 'Gol. II/c', 'Gol. II/b', 'Gol. II/a',
  'Gol. I/d', 'Gol. I/c', 'Gol. I/b', 'Gol. I/a',
  'IV/e', 'IV/d', 'IV/c', 'IV/b', 'IV/a',
  'III/d', 'III/c', 'III/b', 'III/a',
  'II/d', 'II/c', 'II/b', 'II/a',
  'I/d', 'I/c', 'I/b', 'I/a',
  'Non-PNS / Kontrak',
];

export function DosenTendikSection() {
  const { tendikList } = useDosen();

  // 1. Data Distribusi Berdasarkan Golongan Tendik (Dinamis dari Data Riil Tendik)
  const golonganTendikData = useMemo(() => {
    // Normalisasi case-insensitive map untuk mencegah sumbu ganda
    const canonicalNameMap: Record<string, string> = {};
    const counts: Record<string, number> = {};

    tendikList.forEach((t) => {
      const raw = (t.golongan || '').trim();
      if (!raw || raw === '-') return;

      const lowerKey = raw.toLowerCase();
      // Gunakan nama pertama yang terdaftar sebagai representasi display
      if (!canonicalNameMap[lowerKey]) {
        canonicalNameMap[lowerKey] = raw;
      }
      const displayName = canonicalNameMap[lowerKey];
      counts[displayName] = (counts[displayName] || 0) + 1;
    });

    const entries = Object.keys(counts);

    // Sorting hierarki: Golongan tertinggi di atas, atau alfabetik jika kustom
    const sortedKeys = entries.sort((a, b) => {
      const getIndex = (val: string) => {
        const found = STANDARD_GOLONGAN_ORDER.findIndex(
          (std) => std.toLowerCase() === val.toLowerCase()
        );
        return found !== -1 ? found : 999;
      };

      const idxA = getIndex(a);
      const idxB = getIndex(b);

      if (idxA !== 999 || idxB !== 999) {
        return idxA - idxB;
      }
      return a.localeCompare(b);
    });

    return sortedKeys.map((name) => ({
      name,
      Jumlah: counts[name],
    }));
  }, [tendikList]);

  // 2. Data Kualifikasi Pendidikan Tertinggi Tendik
  const pendidikanTendikData = useMemo(() => {
    let s2Count = 0;
    let s1Count = 0;
    let d3Count = 0;

    tendikList.forEach((t) => {
      if (t.pendidikanS2 && t.pendidikanS2 !== '-' && t.pendidikanS2.trim() !== '') {
        s2Count += 1;
      } else if (t.pendidikanS1 && t.pendidikanS1 !== '-' && t.pendidikanS1.trim() !== '') {
        s1Count += 1;
      } else if (t.pendidikanD3 && t.pendidikanD3 !== '-' && t.pendidikanD3.trim() !== '') {
        d3Count += 1;
      }
    });

    return [
      { name: 'Magister (S2)', value: s2Count, color: PENDIDIKAN_COLORS[2] },
      { name: 'Sarjana / D4 (S1)', value: s1Count, color: PENDIDIKAN_COLORS[0] },
      { name: 'Diploma Tiga (D3)', value: d3Count, color: PENDIDIKAN_COLORS[1] },
    ].filter((i) => i.value > 0);
  }, [tendikList]);

  // 3. Data Kepemilikan Sertifikat Kompetensi Tendik
  const sertifTendikData = useMemo(() => {
    const bersertif = tendikList.filter(
      (t) => Array.isArray(t.sertifikatKompetensi) && t.sertifikatKompetensi.length > 0
    ).length;
    const belum = tendikList.length - bersertif;

    return [
      { name: 'Memiliki Sertifikat Kompetensi', value: bersertif, color: TENDIK_SERTIF_COLORS[0] },
      { name: 'Belum Bersertifikat', value: Math.max(0, belum), color: TENDIK_SERTIF_COLORS[1] },
    ].filter((i) => i.value > 0);
  }, [tendikList]);

  return (
    <div id="tenaga-kependidikan" className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              Tenaga Kependidikan (Tendik)
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 ml-9">
            Distribusi golongan kepegawaian, kualifikasi jenjang pendidikan, dan sertifikasi kompetensi tenaga kependidikan.
          </p>
        </div>

        <Button variant="ghost" size="sm" asChild className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <Link to="/admin/dosen/tenaga-kependidikan">
            <span>Kelola Tendik</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Horizontal Bar Chart: Distribusi Berdasarkan Golongan Tendik */}
        <div className="lg:col-span-7 adaptive-mobile-card p-4 sm:p-5 rounded-2xl bg-card/80 border border-border/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-semibold text-foreground">Distribusi Berdasarkan Golongan Tendik</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Klasifikasi jumlah staf pendukung operasional berdasarkan pangkat &amp; golongan</p>
            </div>
          </div>

          <div className="h-[250px] sm:h-[270px] w-full">
            {tendikList.length === 0 || golonganTendikData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground border border-dashed rounded-xl">
                Belum ada data golongan tenaga kependidikan
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={golonganTendikData}
                  layout="vertical"
                  margin={{ top: 10, right: 25, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="Jumlah" fill="#059669" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Duo Donut Chart: Kualifikasi Pendidikan & Sertifikasi Tendik */}
        <div className="lg:col-span-5 adaptive-mobile-card p-4 sm:p-5 rounded-2xl bg-card/80 border border-border/60 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-semibold text-foreground">Kualifikasi &amp; Sertifikasi Profesi Tendik</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Jenjang pendidikan formal dan kompetensi BNSP/LSP</p>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            {/* Donut 1: Pendidikan */}
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-medium text-muted-foreground mb-1">Pendidikan</span>
              <div className="h-[140px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pendidikanTendikData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pendidikanTendikData.map((entry, index) => (
                        <Cell key={`tendik-pend-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieChartTooltip total={tendikList.length} />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[10px] text-center text-muted-foreground space-y-0.5">
                <p><span className="inline-block w-2 h-2 rounded-full bg-violet-500 mr-1" />S2 Magister</p>
                <p><span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1" />S1 Sarjana</p>
                <p><span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1" />D3 Diploma</p>
              </div>
            </div>

            {/* Donut 2: Sertifikasi Profesi */}
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-medium text-muted-foreground mb-1">Sertifikat Profesi</span>
              <div className="h-[140px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sertifTendikData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {sertifTendikData.map((entry, index) => (
                        <Cell key={`tendik-sertif-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieChartTooltip total={tendikList.length} />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[10px] text-center text-muted-foreground space-y-0.5">
                <p><span className="inline-block w-2 h-2 rounded-full bg-emerald-600 mr-1" />Bersertifikasi</p>
                <p><span className="inline-block w-2 h-2 rounded-full bg-slate-300 mr-1" />Belum Ada</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
