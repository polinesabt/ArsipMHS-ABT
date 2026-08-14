import React from 'react';
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
import { INITIAL_DOSEN_DATA } from '@/data/mockDosenData';

export default function AdminDosenMainDashboardPage() {
  // Chart Data: Tridharma points per Lecturer
  const chartDataTridharma = INITIAL_DOSEN_DATA.map((d) => ({
    name: d.nama.split(',')[0], // Short name
    Pengajaran: d.pengajaran,
    Penelitian: d.penelitian,
    Pengabdian: d.pengabdian,
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Visual Charts section */}
      <div id="tridharma" className="w-full">
        {/* Bar Chart: Tridharma Performance */}
        <div className="glass-card rounded-2xl p-5 border border-border/50 bg-card/60 backdrop-blur-xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-foreground">Distribusi Angka Kredit Tridharma</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Beban SKS pengajaran, penelitian, dan pengabdian per dosen semester ini</p>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartDataTridharma}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(200,200,200,0.15)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="rgba(150,150,150,0.7)" />
                <YAxis tick={{ fontSize: 11 }} stroke="rgba(150,150,150,0.7)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', borderRadius: '12px', border: 'none', color: '#fff' }} 
                  itemStyle={{ fontSize: '12px' }} 
                />
                <Legend wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
                <Bar dataKey="Pengajaran" stackId="a" fill="#3B82F6" />
                <Bar dataKey="Penelitian" stackId="a" fill="#10B981" />
                <Bar dataKey="Pengabdian" stackId="a" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
