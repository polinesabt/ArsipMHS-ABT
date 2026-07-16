import React, { useState } from 'react';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Search,
  ArrowLeft,
  FileSpreadsheet,
  Download,
  Calendar,
  Layers,
  MapPin,
  Mail,
  Phone
} from 'lucide-react';
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
  Legend 
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate, useLocation } from 'react-router-dom';

// Colors for chart visualization
const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

// Mock Dosen Data
const INITIAL_DOSEN_DATA = [
  { nip: '197508122003121002', nama: 'Dr. Ir. Fauzi, M.T.', jabatan: 'Lektor Kepala', statusBkd: 'Memenuhi', pengajaran: 12, penelitian: 4, pengabdian: 3, email: 'fauzi@polines.ac.id', telepon: '081234567890' },
  { nip: '198203152008122001', nama: 'Siti Aminah, S.E., M.M.', jabatan: 'Lektor', statusBkd: 'Memenuhi', pengajaran: 10, penelitian: 2, pengabdian: 2, email: 'siti.aminah@polines.ac.id', telepon: '081234567891' },
  { nip: '197011221995121001', nama: 'Prof. Budi Raharjo, Ph.D.', jabatan: 'Guru Besar', statusBkd: 'Memenuhi', pengajaran: 8, penelitian: 6, pengabdian: 4, email: 'budi.raharjo@polines.ac.id', telepon: '081234567892' },
  { nip: '198805042018032002', nama: 'Rina Wijaya, M.B.A.', jabatan: 'Asisten Ahli', statusBkd: 'Belum Memenuhi', pengajaran: 14, penelitian: 1, pengabdian: 1, email: 'rina.wijaya@polines.ac.id', telepon: '081234567893' },
  { nip: '198007202006041003', nama: 'Hendra Setiawan, M.Kom.', jabatan: 'Lektor', statusBkd: 'Belum Memenuhi', pengajaran: 12, penelitian: 0, pengabdian: 2, email: 'hendra.s@polines.ac.id', telepon: '081234567894' },
  { nip: '197801012005011002', nama: 'Ahmad Syarif, M.T.', jabatan: 'Lektor Kepala', statusBkd: 'Memenuhi', pengajaran: 9, penelitian: 3, pengabdian: 3, email: 'ahmad.syarif@polines.ac.id', telepon: '081234567895' },
  { nip: '199209182022032001', nama: 'Dewi Lestari, M.Si.', jabatan: 'Asisten Ahli', statusBkd: 'Memenuhi', pengajaran: 10, penelitian: 2, pengabdian: 2, email: 'dewi.lestari@polines.ac.id', telepon: '081234567896' }
];

export default function AdminDosenDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  React.useEffect(() => {
    const hash = location.hash;
    if (hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        // Delay slightly to ensure layout and charts are rendered
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [location.hash]);

  // Filtered Dosen data
  const filteredDosen = INITIAL_DOSEN_DATA.filter((dosen) => {
    const matchesSearch = dosen.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          dosen.nip.includes(searchTerm) || 
                          dosen.jabatan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || dosen.statusBkd === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Aggregate stats
  const totalDosen = INITIAL_DOSEN_DATA.length;
  const bkdMemenuhi = INITIAL_DOSEN_DATA.filter(d => d.statusBkd === 'Memenuhi').length;
  const bkdBelumMemenuhi = totalDosen - bkdMemenuhi;

  // Chart Data: Tridharma points per Lecturer
  const chartDataTridharma = INITIAL_DOSEN_DATA.map((d) => ({
    name: d.nama.split(',')[0], // Short name
    Pengajaran: d.pengajaran,
    Penelitian: d.penelitian,
    Pengabdian: d.pengabdian,
  }));

  // Chart Data: BKD status distribution
  const chartDataBkd = [
    { name: 'Memenuhi BKD', value: bkdMemenuhi },
    { name: 'Belum Memenuhi', value: bkdBelumMemenuhi },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Dosen */}
        <div className="glass-card rounded-2xl p-5 border border-border/50 bg-card/60 backdrop-blur-xl flex items-center justify-between shadow-soft">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Dosen</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{totalDosen}</h3>
            <p className="text-xs text-emerald-500 mt-1 font-medium">Aktif Mengajar</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Memenuhi BKD */}
        <div className="glass-card rounded-2xl p-5 border border-border/50 bg-card/60 backdrop-blur-xl flex items-center justify-between shadow-soft">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Memenuhi BKD</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{bkdMemenuhi}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((bkdMemenuhi / totalDosen) * 100)}% dari total dosen
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Belum Memenuhi */}
        <div className="glass-card rounded-2xl p-5 border border-border/50 bg-card/60 backdrop-blur-xl flex items-center justify-between shadow-soft">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Belum Memenuhi BKD</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{bkdBelumMemenuhi}</h3>
            <p className="text-xs text-red-500 mt-1 font-medium">Memerlukan Review</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Rerata SKS Pengajaran */}
        <div className="glass-card rounded-2xl p-5 border border-border/50 bg-card/60 backdrop-blur-xl flex items-center justify-between shadow-soft">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Rata-rata Pengajaran</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">11.1 <span className="text-sm font-normal text-muted-foreground">SKS</span></h3>
            <p className="text-xs text-emerald-500 mt-1 font-medium">Beban Normal</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center text-info">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Visual Charts section */}
      <div id="tridharma" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart: Tridharma Performance */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 border border-border/50 bg-card/60 backdrop-blur-xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-foreground">Distribusi Angka Kredit Tridharma</h4>
              <p className="text-xs text-muted-foreground">Beban SKS pengajaran, penelitian, and pengabdian per dosen semester ini</p>
            </div>
          </div>
          <div className="h-[280px] w-full">
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

        {/* Pie Chart: BKD Status */}
        <div id="bkd" className="glass-card rounded-2xl p-5 border border-border/50 bg-card/60 backdrop-blur-xl shadow-soft flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-foreground">Status BKD Semester Ini</h4>
            <p className="text-xs text-muted-foreground">Persentase dosen yang telah melengkapi beban minimum</p>
          </div>
          <div className="h-[200px] w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartDataBkd}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#10B981" />
                  <Cell fill="#F59E0B" />
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', borderRadius: '12px', border: 'none', color: '#fff' }} 
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text label */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-foreground">{Math.round((bkdMemenuhi / totalDosen) * 100)}%</span>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Lengkap</span>
            </div>
          </div>
          <div className="space-y-2 mt-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span className="text-muted-foreground">Memenuhi Syarat BKD</span>
              </div>
              <span className="font-semibold text-foreground">{bkdMemenuhi} Dosen</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span className="text-muted-foreground">Belum Memenuhi</span>
              </div>
              <span className="font-semibold text-foreground">{bkdBelumMemenuhi} Dosen</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Table Section */}
      <div className="glass-card rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl shadow-soft overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-border/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h4 className="text-lg font-bold text-foreground">Daftar Kinerja Dosen</h4>
            <p className="text-xs text-muted-foreground">Kelola profil, jabatan fungsional, dan progress pengumpulan BKD dosen</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari dosen, NIP, jabatan..."
                className="pl-9 bg-background/50 rounded-xl border-border/70"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="bg-background/50 border border-border/70 text-foreground text-sm rounded-xl px-3 py-2 focus:ring-primary focus:border-primary outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">Semua Status BKD</option>
              <option value="Memenuhi">Memenuhi</option>
              <option value="Belum Memenuhi">Belum Memenuhi</option>
            </select>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/40 bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-5">Nama & NIP</th>
                <th className="py-3 px-5">Jabatan Fungsional</th>
                <th className="py-3 px-5 text-center">Status BKD</th>
                <th className="py-3 px-5 text-center">Pengajaran (SKS)</th>
                <th className="py-3 px-5 text-center">Penelitian</th>
                <th className="py-3 px-5 text-center">Pengabdian</th>
                <th className="py-3 px-5">Kontak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 text-sm">
              {filteredDosen.length > 0 ? (
                filteredDosen.map((dosen) => (
                  <tr key={dosen.nip} className="hover:bg-muted/10 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-semibold text-foreground">{dosen.nama}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">{dosen.nip}</div>
                    </td>
                    <td className="py-4 px-5 text-muted-foreground">{dosen.jabatan}</td>
                    <td className="py-4 px-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        dosen.statusBkd === 'Memenuhi' 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          dosen.statusBkd === 'Memenuhi' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`} />
                        {dosen.statusBkd}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center font-semibold text-foreground">{dosen.pengajaran}</td>
                    <td className="py-4 px-5 text-center font-semibold text-foreground">{dosen.penelitian}</td>
                    <td className="py-4 px-5 text-center font-semibold text-foreground">{dosen.pengabdian}</td>
                    <td className="py-4 px-5">
                      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" />
                          {dosen.email}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" />
                          {dosen.telepon}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    Tidak ada data dosen yang sesuai dengan pencarian Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
