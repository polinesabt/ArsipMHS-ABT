import React, { useState } from 'react';
import { 
  BookOpenText, 
  Users, 
  Search, 
  Award, 
  GraduationCap 
} from 'lucide-react';
import { Input } from '@/components/ui/input';

const KONTRIBUSI_DATA = [
  {
    nidn: '0012087501',
    nama: 'Dr. Ir. Fauzi, M.T.',
    mkDiakreditasi: 'Manajemen Operasi, Perencanaan Strategis',
    mkProdiLain: 'Metodologi Penelitian (Prodi Akuntansi)',
    bahanAjarCount: 3,
    rataBimbingan: 14,
    rekognisi: 'Asesor Kompetensi LSP, Reviewer Jurnal Internasional'
  },
  {
    nidn: '0015038202',
    nama: 'Siti Aminah, S.E., M.M.',
    mkDiakreditasi: 'Manajemen Pemasaran, Perilaku Konsumen',
    mkProdiLain: 'Pengantar Bisnis (Prodi Administrasi Bisnis)',
    bahanAjarCount: 2,
    rataBimbingan: 12,
    rekognisi: 'Dosen Tamu di Universitas Diponegoro, Juri Lomba Kewirausahaan'
  },
  {
    nidn: '0022117003',
    nama: 'Prof. Budi Raharjo, Ph.D.',
    mkDiakreditasi: 'Ekonomi Manajerial, Analisis Finansial',
    mkProdiLain: 'Ekonomi Makro (Prodi Perbankan Syariah)',
    bahanAjarCount: 5,
    rataBimbingan: 18,
    rekognisi: 'Reviewer Jurnal Terakreditasi SINTA 2, Ketua Asosiasi Profesi'
  },
  {
    nidn: '0004058804',
    nama: 'Rina Wijaya, M.B.A.',
    mkDiakreditasi: 'Bisnis Internasional, Perdagangan Ekspor Impor',
    mkProdiLain: '-',
    bahanAjarCount: 1,
    rataBimbingan: 8,
    rekognisi: 'Narasumber Praktisi Industri di Kadin Jateng'
  },
  {
    nidn: '0020078005',
    nama: 'Hendra Setiawan, M.Kom.',
    mkDiakreditasi: 'Sistem Informasi Manajemen, E-Business',
    mkProdiLain: 'Dasar Pemrograman (Prodi Teknik Informatika)',
    bahanAjarCount: 2,
    rataBimbingan: 15,
    rekognisi: 'Konsultan IT Dinas Kominfo Jateng, Trainer IT Oracle'
  },
  {
    nidn: '0001017806',
    nama: 'Ahmad Syarif, M.T.',
    mkDiakreditasi: 'Jaringan Komputer, Keamanan Informasi',
    mkProdiLain: 'Sistem Digital (Prodi Teknik Elektro)',
    bahanAjarCount: 4,
    rataBimbingan: 13,
    rekognisi: 'Instruktur Cisco Academy, Reviewer Prosiding Nasional'
  },
  {
    nidn: '0018099207',
    nama: 'Dewi Lestari, M.Si.',
    mkDiakreditasi: 'Statistika Bisnis, Analitik Data',
    mkProdiLain: 'Pengantar Statistika (Prodi Akuntansi)',
    bahanAjarCount: 1,
    rataBimbingan: 10,
    rekognisi: 'Anggota Ikatan Statistisi Indonesia (ISI)'
  }
];

export default function AdminDosenKontribusiPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtered Dosen data
  const filteredData = KONTRIBUSI_DATA.filter((dosen) => {
    return dosen.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
           dosen.nidn.includes(searchTerm) || 
           dosen.mkDiakreditasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
           dosen.rekognisi.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Calculate statistics
  const totalBahanAjar = KONTRIBUSI_DATA.reduce((acc, d) => acc + d.bahanAjarCount, 0);
  const totalBimbingan = KONTRIBUSI_DATA.reduce((acc, d) => acc + d.rataBimbingan, 0);
  const averageBimbingan = (totalBimbingan / KONTRIBUSI_DATA.length).toFixed(1);
  const totalRekognisiCount = KONTRIBUSI_DATA.filter(d => d.rekognisi !== '-').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Bahan Ajar */}
        <div className="glass-card rounded-2xl p-5 border border-border/50 bg-card/60 backdrop-blur-xl flex items-center justify-between shadow-soft">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Bahan Ajar</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{totalBahanAjar}</h3>
            <p className="text-xs text-primary mt-1 font-medium">Buku & Modul Terbit</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <BookOpenText className="w-6 h-6" />
          </div>
        </div>

        {/* Rata-rata Bimbingan */}
        <div className="glass-card rounded-2xl p-5 border border-border/50 bg-card/60 backdrop-blur-xl flex items-center justify-between shadow-soft">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Rerata Bimbingan</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{averageBimbingan} <span className="text-sm font-normal text-muted-foreground">Mhs</span></h3>
            <p className="text-xs text-emerald-500 mt-1 font-medium">Per Dosen / Semester</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Rekognisi Bidang */}
        <div className="glass-card rounded-2xl p-5 border border-border/50 bg-card/60 backdrop-blur-xl flex items-center justify-between shadow-soft">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Dosen Berrekognisi</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{totalRekognisiCount}</h3>
            <p className="text-xs text-info mt-1 font-medium">Rekognisi Bidang & Pengajaran</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center text-info">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Interactive Table Section */}
      <div className="glass-card rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl shadow-soft overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-border/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h4 className="text-lg font-bold text-foreground">Kontribusi Intelektual Dosen</h4>
            <p className="text-xs text-muted-foreground">Pengajaran prodi diakreditasi, prodi lain, bahan ajar, bimbingan, dan rekognisi</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari dosen, mata kuliah, rekognisi..."
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
                <th className="py-3 px-5">Mata Kuliah yang Diampu pada PS yang Diakreditasi</th>
                <th className="py-3 px-5">Mata Kuliah yang Diampu pada PS Lain</th>
                <th className="py-3 px-5 text-center">Judul Bahan Ajar</th>
                <th className="py-3 px-5 text-center">Rata-rata Jml Bimbingan Semua PS / Semester</th>
                <th className="py-3 px-5">Rekognisi Bidang & Pengajaran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 text-sm">
              {filteredData.length > 0 ? (
                filteredData.map((dosen, index) => (
                  <tr key={dosen.nidn} className="hover:bg-muted/10 transition-colors">
                    <td className="py-4 px-5 text-center text-muted-foreground font-medium">{index + 1}</td>
                    <td className="py-4 px-5 font-semibold text-foreground">
                      <div>{dosen.nama}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">NIDN: {dosen.nidn}</div>
                    </td>
                    <td className="py-4 px-5 text-muted-foreground leading-relaxed">{dosen.mkDiakreditasi}</td>
                    <td className="py-4 px-5 text-muted-foreground leading-relaxed">{dosen.mkProdiLain}</td>
                    <td className="py-4 px-5 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-xs">
                        {dosen.bahanAjarCount}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 font-bold text-xs">
                        {dosen.rataBimbingan}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-muted-foreground leading-relaxed">
                      <div className="flex items-start gap-1.5">
                        <Award className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <span>{dosen.rekognisi}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    Tidak ada data kontribusi intelektual dosen yang sesuai.
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
