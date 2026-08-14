import React, { useState } from 'react';
import { 
  Users, 
  BookOpen, 
  Search,
  Mail,
  Phone,
  User,
  GraduationCap,
  Award,
  FileText,
  Building
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from '@/components/ui/sheet';
import { INITIAL_DOSEN_DATA } from '@/data/mockDosenData';

export default function AdminDosenDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDosen, setSelectedDosen] = useState<typeof INITIAL_DOSEN_DATA[0] | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  React.useEffect(() => {
    const hash = location.hash;
    if (hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        // Delay slightly to ensure layout is rendered
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [location.hash]);

  // Filtered Dosen data
  const filteredDosen = INITIAL_DOSEN_DATA.filter((dosen) => {
    return dosen.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
           dosen.nidn.includes(searchTerm) || 
           dosen.jabatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
           dosen.institusi.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Aggregate stats
  const totalDosen = INITIAL_DOSEN_DATA.length;

  return (
    <div className="space-y-6 pb-12">
      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Main Interactive Table Section */}
      <div className="glass-card rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl shadow-soft overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-border/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h4 className="text-lg font-bold text-foreground">Daftar Profil Dosen</h4>
            <p className="text-xs text-muted-foreground">Kelola profil, jabatan fungsional, dan kinerja tridharma dosen</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari dosen, NIDN/NIDK, jabatan..."
                className="pl-9 bg-background/50 rounded-xl border-border/70"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/40 bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-5 text-center">No</th>
                <th className="py-3 px-5">Nama Dosen</th>
                <th className="py-3 px-5 text-center">Status Dosen</th>
                <th className="py-3 px-5 text-center">NIDN/NIDK</th>
                <th className="py-3 px-5">Jabatan Akademik</th>
                <th className="py-3 px-5 text-center">Akademisi/Praktisi</th>
                <th className="py-3 px-5">Perusahaan/Institusi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 text-sm">
              {filteredDosen.length > 0 ? (
                filteredDosen.map((dosen, index) => (
                  <tr 
                    key={dosen.nidn} 
                    onClick={() => {
                      setSelectedDosen(dosen);
                      setIsDetailOpen(true);
                    }}
                    className="hover:bg-muted/10 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-5 text-center text-muted-foreground font-medium">{index + 1}</td>
                    <td className="py-4 px-5 font-semibold text-foreground">{dosen.nama}</td>
                    <td className="py-4 px-5 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        dosen.statusDosen === 'Tetap' 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {dosen.statusDosen}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center text-muted-foreground font-mono">{dosen.nidn}</td>
                    <td className="py-4 px-5 text-muted-foreground font-medium">{dosen.jabatan}</td>
                    <td className="py-4 px-5 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        dosen.peran === 'Akademisi' 
                          ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' 
                          : 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                      }`}>
                        {dosen.peran}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-muted-foreground">{dosen.institusi}</td>
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

      {/* Side Sheet Detail View */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto bg-card/95 backdrop-blur-xl border-l border-border/40 text-foreground">
          <SheetHeader className="pb-6 border-b border-border/30">
            <SheetTitle className="text-xl font-bold text-foreground">Detail Profil Dosen</SheetTitle>
            <SheetDescription className="text-muted-foreground">
              Informasi lengkap dan kualifikasi profesional dosen.
            </SheetDescription>
          </SheetHeader>
          
          {selectedDosen && (
            <div className="space-y-6 pt-6">
              {/* Header profile info */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/30">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground leading-snug text-base">{selectedDosen.nama}</h4>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">NIDN/NIDK: {selectedDosen.nidn}</p>
                </div>
              </div>

              {/* Section 1: Profil Dosen Utama */}
              <div className="space-y-4">
                <h5 className="text-xs font-bold uppercase tracking-wider text-primary/80">Informasi Kepegawaian & Peran</h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Status Dosen</p>
                    <div>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                        selectedDosen.statusDosen === 'Tetap' 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {selectedDosen.statusDosen}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Kategori Peran</p>
                    <div>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                        selectedDosen.peran === 'Akademisi' 
                          ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' 
                          : 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                      }`}>
                        {selectedDosen.peran}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <p className="text-xs text-muted-foreground">Jabatan Akademik</p>
                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-500" />
                      {selectedDosen.jabatan}
                    </p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <p className="text-xs text-muted-foreground font-medium">Perusahaan / Institusi</p>
                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-sky-500" />
                      {selectedDosen.institusi}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
