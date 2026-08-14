import React, { useState } from 'react';
import { 
  Users, 
  BookOpen, 
  Search, 
  User, 
  GraduationCap, 
  Award, 
  FileText, 
  Building,
  Pencil,
  Save,
  X,
  Check
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from '@/components/ui/sheet';
import { INITIAL_DOSEN_DATA, type DosenItem } from '@/data/mockDosenData';
import { useToast } from '@/hooks/use-toast';

const OPSI_PENDIDIKAN_PASCA_SARJANA = [
  'Magister (S2)',
  'Doktor (S3)',
  'Magister Terapan (S2 Terapan)',
  'Doktor Terapan (S3 Terapan)',
  'Spesialis (Sp-1)'
];

export default function AdminDosenDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [dosenList, setDosenList] = useState<DosenItem[]>(INITIAL_DOSEN_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDosen, setSelectedDosen] = useState<DosenItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<DosenItem | null>(null);

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
  const filteredDosen = dosenList.filter((dosen) => {
    return dosen.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
           dosen.nidn.includes(searchTerm) || 
           dosen.jabatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
           dosen.institusi.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Aggregate stats
  const totalDosen = dosenList.length;

  const handleOpenView = (dosen: DosenItem) => {
    setSelectedDosen(dosen);
    setEditFormData({ ...dosen });
    setIsEditing(false);
    setIsDetailOpen(true);
  };

  const handleOpenEdit = (dosen: DosenItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedDosen(dosen);
    setEditFormData({ ...dosen });
    setIsEditing(true);
    setIsDetailOpen(true);
  };

  const handleTogglePendidikan = (tingkat: string) => {
    if (!editFormData) return;
    const current = editFormData.pendidikanPascaSarjana || [];
    const exists = current.includes(tingkat);
    const updated = exists 
      ? current.filter(t => t !== tingkat)
      : [...current, tingkat];
    setEditFormData({ ...editFormData, pendidikanPascaSarjana: updated });
  };

  const handleSaveEdit = () => {
    if (!editFormData) return;
    setDosenList(prev => prev.map(d => d.nidn === editFormData.nidn ? editFormData : d));
    setSelectedDosen(editFormData);
    setIsEditing(false);
    toast({
      title: 'Perubahan Disimpan',
      description: `Data profil dosen ${editFormData.nama} berhasil diperbarui.`,
    });
  };

  const handleCancelEdit = () => {
    if (selectedDosen) {
      setEditFormData({ ...selectedDosen });
    }
    setIsEditing(false);
  };

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
            <p className="text-xs text-muted-foreground">Kelola profil, jabatan fungsional, dan kualifikasi profesional dosen</p>
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
                <th className="py-3 px-5 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 text-sm">
              {filteredDosen.length > 0 ? (
                filteredDosen.map((dosen, index) => (
                  <tr 
                    key={dosen.nidn} 
                    onClick={() => handleOpenView(dosen)}
                    className="hover:bg-muted/10 transition-colors cursor-pointer group"
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
                    <td className="py-4 px-5 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleOpenEdit(dosen, e)}
                        className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all"
                        title="Edit Data Dosen"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    Tidak ada data dosen yang sesuai dengan pencarian Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Sheet View / Edit Mode */}
      <Sheet open={isDetailOpen} onOpenChange={(open) => {
        setIsDetailOpen(open);
        if (!open) setIsEditing(false);
      }}>
        <SheetContent className="sm:max-w-lg overflow-y-auto bg-card/95 backdrop-blur-xl border-l border-border/40 text-foreground flex flex-col justify-between">
          <div>
            <SheetHeader className="pb-5 border-b border-border/30">
              <div className="flex items-center justify-between pr-6">
                <SheetTitle className="text-xl font-bold text-foreground">
                  {isEditing ? 'Edit Profil Dosen' : 'Detail Profil Dosen'}
                </SheetTitle>
                {!isEditing && selectedDosen && (
                  <button
                    onClick={() => {
                      setEditFormData({ ...selectedDosen });
                      setIsEditing(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 transition-all shadow-sm"
                    title="Edit Profil"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit Profil</span>
                  </button>
                )}
              </div>
              <SheetDescription className="text-muted-foreground text-xs">
                {isEditing 
                  ? 'Sesuaikan informasi kepegawaian dan latar belakang keahlian dosen.'
                  : 'Informasi lengkap dan kualifikasi profesional dosen.'}
              </SheetDescription>
            </SheetHeader>
            
            {/* VIEW MODE */}
            {!isEditing && selectedDosen && (
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

                {/* Section 1: Profil Status Kepegawaian */}
                <div className="space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-primary/80">Profil Status Kepegawaian</h5>
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

                {/* Section 2: Profil Latar Belakang Keahlian */}
                <div className="space-y-4 pt-4 border-t border-border/30">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-primary/80">
                    Profil Latar Belakang Keahlian
                  </h5>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {/* 1. Pendidikan Pasca Sarjana */}
                    <div className="space-y-1 col-span-2">
                      <p className="text-xs text-muted-foreground">Pendidikan Pasca Sarjana</p>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {Array.isArray(selectedDosen.pendidikanPascaSarjana) ? (
                          selectedDosen.pendidikanPascaSarjana.map((tingkat: string, idx: number) => (
                            <span
                              key={idx}
                              className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20"
                            >
                              {tingkat}
                            </span>
                          ))
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                            {selectedDosen.pendidikanPascaSarjana || 'Magister'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 2. Bidang Keahlian */}
                    <div className="space-y-1 col-span-2">
                      <p className="text-xs text-muted-foreground">Bidang Keahlian</p>
                      <p className="font-semibold text-foreground flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-sky-500" />
                        {selectedDosen.bidangKeahlian}
                      </p>
                    </div>

                    {/* 3. Nomor Sertifikat Pendidik Profesional */}
                    <div className="space-y-1 col-span-2">
                      <p className="text-xs text-muted-foreground">Nomor Sertifikat Pendidik Profesional</p>
                      <p className="font-semibold text-foreground flex items-center gap-1.5 font-mono text-xs">
                        <FileText className="w-4 h-4 text-emerald-500" />
                        {selectedDosen.sertifikatPendidik && selectedDosen.sertifikatPendidik !== '-' ? (
                          <span className="text-emerald-500 font-semibold">{selectedDosen.sertifikatPendidik}</span>
                        ) : (
                          <span className="text-muted-foreground font-sans font-normal italic">-</span>
                        )}
                      </p>
                    </div>

                    {/* 4. Sertifikat Kompetensi */}
                    <div className="space-y-1 col-span-2">
                      <p className="text-xs text-muted-foreground">Sertifikat Kompetensi</p>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <Award className="w-4 h-4 text-purple-500 flex-shrink-0" />
                        <div className="flex flex-wrap gap-1.5">
                          {typeof selectedDosen.sertifikatKompetensi === 'string' && selectedDosen.sertifikatKompetensi.includes(',') ? (
                            selectedDosen.sertifikatKompetensi.split(',').map((cert: string, idx: number) => (
                              <span
                                key={idx}
                                className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20"
                              >
                                {cert.trim()}
                              </span>
                            ))
                          ) : selectedDosen.sertifikatKompetensi && selectedDosen.sertifikatKompetensi !== '-' ? (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              {selectedDosen.sertifikatKompetensi}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">-</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* EDIT MODE FORM */}
            {isEditing && editFormData && (
              <div className="space-y-6 pt-6 text-sm">
                {/* Basic Identity Inputs */}
                <div className="p-4 rounded-2xl bg-muted/20 border border-border/40 space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Nama Dosen Beserta Gelar</label>
                    <Input
                      value={editFormData.nama}
                      onChange={(e) => setEditFormData({ ...editFormData, nama: e.target.value })}
                      placeholder="Contoh: Dr. Ir. Fauzi, M.T."
                      className="bg-background rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">NIDN / NIDK</label>
                    <Input
                      value={editFormData.nidn}
                      onChange={(e) => setEditFormData({ ...editFormData, nidn: e.target.value })}
                      placeholder="Contoh: 0012087501"
                      className="bg-background rounded-xl font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Section 1: Profil Status Kepegawaian (Edit) */}
                <div className="space-y-4 pt-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-primary/80">
                    Profil Status Kepegawaian
                  </h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Status Dosen</label>
                      <select
                        value={editFormData.statusDosen}
                        onChange={(e) => setEditFormData({ ...editFormData, statusDosen: e.target.value as 'Tetap' | 'Tidak Tetap' })}
                        className="w-full h-10 px-3 text-xs bg-background border border-border/70 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                      >
                        <option value="Tetap">Tetap</option>
                        <option value="Tidak Tetap">Tidak Tetap</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Kategori Peran</label>
                      <select
                        value={editFormData.peran}
                        onChange={(e) => setEditFormData({ ...editFormData, peran: e.target.value as 'Akademisi' | 'Praktisi' })}
                        className="w-full h-10 px-3 text-xs bg-background border border-border/70 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                      >
                        <option value="Akademisi">Akademisi</option>
                        <option value="Praktisi">Praktisi</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 col-span-2">
                      <label className="text-xs font-medium text-muted-foreground">Jabatan Akademik</label>
                      <Input
                        value={editFormData.jabatan}
                        onChange={(e) => setEditFormData({ ...editFormData, jabatan: e.target.value })}
                        placeholder="Contoh: Lektor Kepala, Guru Besar, Asisten Ahli"
                        className="bg-background rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5 col-span-2">
                      <label className="text-xs font-medium text-muted-foreground">Perusahaan / Institusi</label>
                      <Input
                        value={editFormData.institusi}
                        onChange={(e) => setEditFormData({ ...editFormData, institusi: e.target.value })}
                        placeholder="Contoh: Politeknik Negeri Semarang"
                        className="bg-background rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Profil Latar Belakang Keahlian (Edit) */}
                <div className="space-y-4 pt-4 border-t border-border/30">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-primary/80">
                    Profil Latar Belakang Keahlian
                  </h5>

                  <div className="space-y-4">
                    {/* Pendidikan Pasca Sarjana (Interactive Toggle Badges) */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground block">
                        Pendidikan Pasca Sarjana (Pilih yang sesuai)
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {OPSI_PENDIDIKAN_PASCA_SARJANA.map((tingkat) => {
                          const isSelected = editFormData.pendidikanPascaSarjana?.includes(tingkat);
                          return (
                            <button
                              key={tingkat}
                              type="button"
                              onClick={() => handleTogglePendidikan(tingkat)}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                isSelected
                                  ? 'bg-primary text-primary-foreground shadow-sm scale-102 border border-primary'
                                  : 'bg-muted/40 text-muted-foreground border border-border/60 hover:bg-muted/70'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              <span>{tingkat}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bidang Keahlian */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Bidang Keahlian</label>
                      <Input
                        value={editFormData.bidangKeahlian}
                        onChange={(e) => setEditFormData({ ...editFormData, bidangKeahlian: e.target.value })}
                        placeholder="Contoh: Manajemen Rekayasa Industri, Pemasaran Digital"
                        className="bg-background rounded-xl"
                      />
                    </div>

                    {/* Nomor Sertifikat Pendidik Profesional */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Nomor Sertifikat Pendidik Profesional</label>
                      <Input
                        value={editFormData.sertifikatPendidik}
                        onChange={(e) => setEditFormData({ ...editFormData, sertifikatPendidik: e.target.value })}
                        placeholder="Masukkan nomor serdos atau '-' jika belum ada"
                        className="bg-background rounded-xl font-mono text-xs"
                      />
                    </div>

                    {/* Sertifikat Kompetensi */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Sertifikat Kompetensi (Pisahkan dengan koma)</label>
                      <Input
                        value={editFormData.sertifikatKompetensi}
                        onChange={(e) => setEditFormData({ ...editFormData, sertifikatKompetensi: e.target.value })}
                        placeholder="Contoh: MSDM, Ekspor Impor Expert, KWU"
                        className="bg-background rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions (Only in Edit Mode) */}
          {isEditing && (
            <div className="pt-6 border-t border-border/30 flex items-center justify-end gap-3 sticky bottom-0 bg-card/95 backdrop-blur-md py-4 mt-6">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                className="rounded-xl px-4 text-xs font-semibold"
              >
                <X className="w-3.5 h-3.5 mr-1.5" />
                Batal
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveEdit}
                className="rounded-xl px-5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Simpan Perubahan
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
