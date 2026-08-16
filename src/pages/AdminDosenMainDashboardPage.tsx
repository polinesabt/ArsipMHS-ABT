import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Users, BookOpen, FlaskConical, HandHeart, Plus } from 'lucide-react';
import { useDosen } from '@/contexts/DosenContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function AdminDosenMainDashboardPage() {
  const { dosenList } = useDosen();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const totalDosen = dosenList.length;
    const totalPengajaran = dosenList.reduce((acc, d) => acc + (d.pengajaran || 0), 0);
    const totalPenelitian = dosenList.reduce((acc, d) => acc + (d.penelitian || 0), 0);
    const totalPengabdian = dosenList.reduce((acc, d) => acc + (d.pengabdian || 0), 0);
    return { totalDosen, totalPengajaran, totalPenelitian, totalPengabdian };
  }, [dosenList]);

  // Chart Data: Tridharma points per Lecturer
  const chartDataTridharma = useMemo(() => {
    return dosenList.map((d) => ({
      name: d.nama ? d.nama.split(',')[0] : 'Dosen',
      Pengajaran: d.pengajaran || 0,
      Penelitian: d.penelitian || 0,
      Pengabdian: d.pengabdian || 0,
    }));
  }, [dosenList]);

  return (
    <div className="space-y-6 pb-12">
      {/* Responsive KPI Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="adaptive-mobile-card p-3.5 sm:p-5 flex items-center gap-3 bg-card/80">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs text-muted-foreground font-medium truncate">Total Dosen</p>
            <h4 className="text-base sm:text-xl font-bold text-foreground mt-0.5">{stats.totalDosen} Dosen</h4>
          </div>
        </div>

        <div className="adaptive-mobile-card p-3.5 sm:p-5 flex items-center gap-3 bg-card/80">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs text-muted-foreground font-medium truncate">SKS Pengajaran</p>
            <h4 className="text-base sm:text-xl font-bold text-foreground mt-0.5">{stats.totalPengajaran} SKS</h4>
          </div>
        </div>

        <div className="adaptive-mobile-card p-3.5 sm:p-5 flex items-center gap-3 bg-card/80">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs text-muted-foreground font-medium truncate">Kredit Penelitian</p>
            <h4 className="text-base sm:text-xl font-bold text-foreground mt-0.5">{stats.totalPenelitian} Poin</h4>
          </div>
        </div>

        <div className="adaptive-mobile-card p-3.5 sm:p-5 flex items-center gap-3 bg-card/80">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <HandHeart className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs text-muted-foreground font-medium truncate">Kredit Pengabdian</p>
            <h4 className="text-base sm:text-xl font-bold text-foreground mt-0.5">{stats.totalPengabdian} Poin</h4>
          </div>
        </div>
      </div>

      {/* Visual Charts section */}
      <div id="tridharma" className="w-full">
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-border/50 bg-card/60 backdrop-blur-xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm sm:text-base font-bold text-foreground">Distribusi Angka Kredit Tridharma</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Beban SKS pengajaran, penelitian, dan pengabdian per dosen semester ini</p>
            </div>
          </div>

          {chartDataTridharma.length === 0 ? (
            <div className="h-[280px] sm:h-[320px] flex flex-col items-center justify-center text-center p-6 border border-dashed border-border/60 rounded-xl">
              <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-2">
                <Users className="w-6 h-6 opacity-60" />
              </div>
              <h5 className="text-sm font-semibold text-foreground">Belum Ada Data Dosen</h5>
              <p className="text-xs text-muted-foreground max-w-sm mt-0.5 mb-3">
                Tambahkan data master dosen pada menu Pengelolaan Dosen untuk melihat visualisasi distribusi Tridharma.
              </p>
              <Button
                size="sm"
                onClick={() => navigate('/admin/dosen/data')}
                className="rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Buka Pengelolaan Dosen
              </Button>
            </div>
          ) : (
            <div className="h-[280px] sm:h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartDataTridharma}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(200,200,200,0.15)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="rgba(150,150,150,0.7)" />
                  <YAxis tick={{ fontSize: 10 }} stroke="rgba(150,150,150,0.7)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', borderRadius: '12px', border: 'none', color: '#fff' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', marginTop: '10px' }} />
                  <Bar dataKey="Pengajaran" stackId="a" fill="#3B82F6" />
                  <Bar dataKey="Penelitian" stackId="a" fill="#10B981" />
                  <Bar dataKey="Pengabdian" stackId="a" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

