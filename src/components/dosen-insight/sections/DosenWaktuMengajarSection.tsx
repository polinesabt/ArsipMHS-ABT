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
import { Clock, ExternalLink } from 'lucide-react';
import { useDosen } from '@/contexts/DosenContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChartTooltip, PieChartTooltip } from '@/components/insight/dashboard/ChartTooltip';
import { calculateTotalSks, latestWaktuMengajarPerDosen } from '@/data/mockWaktuMengajarData';

const KEPATUHAN_COLORS = {
  underload: '#ef4444', // Red
  ideal: '#10b981',     // Emerald
  overload: '#f59e0b',  // Amber
};

const KOMPONEN_COLORS = [
  '#3b82f6', // PS Sendiri (Blue)
  '#6366f1', // PS Lain (Indigo)
  '#06b6d4', // PT Lain (Cyan)
  '#10b981', // Riset (Emerald)
  '#f59e0b', // PKM (Amber)
  '#ec4899', // Tugas Tambahan (Pink)
];

export function DosenWaktuMengajarSection() {
  const { dosenList, waktuMengajarList } = useDosen();
  const latestRecords = useMemo(() => latestWaktuMengajarPerDosen(waktuMengajarList), [waktuMengajarList]);

  // 1. Data Distribusi Kepatuhan Beban Kerja (Underload, Ideal, Overload)
  const kepatuhanData = useMemo(() => {
    let underloadTetap = 0;
    let underloadTidakTetap = 0;
    let idealTetap = 0;
    let idealTidakTetap = 0;
    let overloadTetap = 0;
    let overloadTidakTetap = 0;

    latestRecords.forEach((w) => {
      const totalSks = calculateTotalSks(w);
      const dosen = dosenList.find((d) => d.nidn === w.nidn);
      const isTetap = dosen?.statusDosen === 'Tetap';

      if (totalSks < 12) {
        if (isTetap) underloadTetap += 1;
        else underloadTidakTetap += 1;
      } else if (totalSks <= 16) {
        if (isTetap) idealTetap += 1;
        else idealTidakTetap += 1;
      } else {
        if (isTetap) overloadTetap += 1;
        else overloadTidakTetap += 1;
      }
    });

    return [
      {
        kategori: 'Underload (< 12 SKS)',
        'Dosen Tetap': underloadTetap,
        'Dosen Tidak Tetap': underloadTidakTetap,
        total: underloadTetap + underloadTidakTetap,
        fill: KEPATUHAN_COLORS.underload,
      },
      {
        kategori: 'Ideal (12 - 16 SKS)',
        'Dosen Tetap': idealTetap,
        'Dosen Tidak Tetap': idealTidakTetap,
        total: idealTetap + idealTidakTetap,
        fill: KEPATUHAN_COLORS.ideal,
      },
      {
        kategori: 'Overload (> 16 SKS)',
        'Dosen Tetap': overloadTetap,
        'Dosen Tidak Tetap': overloadTidakTetap,
        total: overloadTetap + overloadTidakTetap,
        fill: KEPATUHAN_COLORS.overload,
      },
    ];
  }, [latestRecords, dosenList]);

  // 2. Data Rata-rata SKS per Komponen Beban Kerja
  const rataRataKomponenData = useMemo(() => {
    const count = latestRecords.length || 1;
    let totPs = 0;
    let totPsLain = 0;
    let totPtLain = 0;
    let totRiset = 0;
    let totPkm = 0;
    let totTugas = 0;

    latestRecords.forEach((w) => {
      totPs += Number(w.sksPendidikanPS) || 0;
      totPsLain += Number(w.sksPendidikanPSLain) || 0;
      totPtLain += Number(w.sksPendidikanPTLain) || 0;
      totRiset += Number(w.sksPenelitian) || 0;
      totPkm += Number(w.sksPengabdian) || 0;
      totTugas += Number(w.sksTugasTambahan) || 0;
    });

    return [
      { name: 'Pendidikan PS Sendiri', 'Rata-rata SKS': Number((totPs / count).toFixed(2)), fill: KOMPONEN_COLORS[0] },
      { name: 'Pendidikan PS Lain', 'Rata-rata SKS': Number((totPsLain / count).toFixed(2)), fill: KOMPONEN_COLORS[1] },
      { name: 'Pendidikan PT Lain', 'Rata-rata SKS': Number((totPtLain / count).toFixed(2)), fill: KOMPONEN_COLORS[2] },
      { name: 'Penelitian', 'Rata-rata SKS': Number((totRiset / count).toFixed(2)), fill: KOMPONEN_COLORS[3] },
      { name: 'Pengabdian (PKM)', 'Rata-rata SKS': Number((totPkm / count).toFixed(2)), fill: KOMPONEN_COLORS[4] },
      { name: 'Tugas Tambahan', 'Rata-rata SKS': Number((totTugas / count).toFixed(2)), fill: KOMPONEN_COLORS[5] },
    ];
  }, [latestRecords]);

  // 3. Data Donut Komposisi Total SKS Prodi
  const totalKomposisiData = useMemo(() => {
    let totPs = 0;
    let totPsLain = 0;
    let totPtLain = 0;
    let totRiset = 0;
    let totPkm = 0;
    let totTugas = 0;

    latestRecords.forEach((w) => {
      totPs += Number(w.sksPendidikanPS) || 0;
      totPsLain += Number(w.sksPendidikanPSLain) || 0;
      totPtLain += Number(w.sksPendidikanPTLain) || 0;
      totRiset += Number(w.sksPenelitian) || 0;
      totPkm += Number(w.sksPengabdian) || 0;
      totTugas += Number(w.sksTugasTambahan) || 0;
    });

    return [
      { name: 'PS Sendiri', value: Number(totPs.toFixed(1)), color: KOMPONEN_COLORS[0] },
      { name: 'PS Lain', value: Number(totPsLain.toFixed(1)), color: KOMPONEN_COLORS[1] },
      { name: 'PT Lain', value: Number(totPtLain.toFixed(1)), color: KOMPONEN_COLORS[2] },
      { name: 'Penelitian', value: Number(totRiset.toFixed(1)), color: KOMPONEN_COLORS[3] },
      { name: 'PKM', value: Number(totPkm.toFixed(1)), color: KOMPONEN_COLORS[4] },
      { name: 'Tugas Tambahan', value: Number(totTugas.toFixed(1)), color: KOMPONEN_COLORS[5] },
    ].filter((i) => i.value > 0);
  }, [latestRecords]);

  return (
    <div id="waktu-mengajar" className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              Waktu Mengajar & EWMP
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 ml-9">
            Distribusi kepatuhan beban kerja standar BKD (12–16 SKS) dan rata-rata alokasi waktu tridharma prodi.
          </p>
        </div>

        <Button variant="ghost" size="sm" asChild className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <Link to="/admin/dosen/waktu-mengajar">
            <span>Kelola EWMP</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Chart 1: Distribusi Kepatuhan Beban Kerja (Histogram Kategori BKD) */}
        <div className="lg:col-span-6 adaptive-mobile-card p-4 sm:p-5 rounded-2xl bg-card/80 border border-border/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-sm font-semibold text-foreground">Distribusi Kepatuhan Beban Kerja Dosen (BKD)</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Klasifikasi jumlah dosen berdasarkan standar beban semester</p>
            </div>
          </div>

          <div className="h-[250px] sm:h-[270px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kepatuhanData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="kategori" tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                <Bar dataKey="Dosen Tetap" stackId="kepatuhan" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Dosen Tidak Tetap" stackId="kepatuhan" fill="#93c5fd" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Rata-rata SKS per Komponen Beban Kerja */}
        <div className="lg:col-span-6 adaptive-mobile-card p-4 sm:p-5 rounded-2xl bg-card/80 border border-border/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-sm font-semibold text-foreground">Rata-rata SKS per Komponen Tridharma</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Rata-rata alokasi waktu per dosen di tingkat program studi</p>
            </div>
          </div>

          <div className="h-[250px] sm:h-[270px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rataRataKomponenData} layout="vertical" margin={{ top: 10, right: 25, left: 25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="Rata-rata SKS" fill="#06b6d4" radius={[0, 4, 4, 0]}>
                  {rataRataKomponenData.map((entry, index) => (
                    <Cell key={`komp-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
