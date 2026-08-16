export interface MatkulItem {
  id: string;
  kode?: string;
  nama: string;
  sks?: number;
}

export interface MatkulPSLainItem {
  id: string;
  kode?: string;
  nama: string;
  prodi: string;
  sks?: number;
}

export interface BimbinganDetail {
  ps: number;
  ps1: number;
  ps2: number;
}

export interface KontribusiDosenItem {
  nidn: string;
  nama: string;
  matkulABT: MatkulItem[];
  matkulPSLain: MatkulPSLainItem[];
  bahanAjar: string[];
  bimbingan: {
    psABT: BimbinganDetail;
    psLain: BimbinganDetail;
  };
  rataBimbingan: number;
  rekognisi: string[];
  avatarColor: string;
}

// Rumus Rata-rata Bimbingan: (PS + PS-1 + PS-2) / 3
export const getDosenOverallAvgNum = (dosen: KontribusiDosenItem): number => {
  const totalPS = (dosen.bimbingan?.psABT?.ps || 0) + (dosen.bimbingan?.psLain?.ps || 0);
  const totalPS1 = (dosen.bimbingan?.psABT?.ps1 || 0) + (dosen.bimbingan?.psLain?.ps1 || 0);
  const totalPS2 = (dosen.bimbingan?.psABT?.ps2 || 0) + (dosen.bimbingan?.psLain?.ps2 || 0);
  return (totalPS + totalPS1 + totalPS2) / 3;
};

export const getDosenOverallAvgStr = (dosen: KontribusiDosenItem): string => {
  const avg = getDosenOverallAvgNum(dosen);
  return Number.isInteger(avg) ? avg.toString() : avg.toFixed(1);
};

export const INITIAL_KONTRIBUSI_DOSEN_DATA: KontribusiDosenItem[] = [
  {
    nidn: '0012087501',
    nama: 'Dr. Ir. Fauzi, M.T.',
    matkulABT: [
      { id: 'abt-1', kode: 'ABT-201', nama: 'Manajemen Operasi & Rantai Pasok', sks: 3 },
      { id: 'abt-2', kode: 'ABT-304', nama: 'Perencanaan Strategis Bisnis Terapan', sks: 3 },
      { id: 'abt-3', kode: 'ABT-402', nama: 'Manajemen Logistik Ekspor Impor', sks: 3 },
      { id: 'abt-4', kode: 'ABT-105', nama: 'Pengantar Manajemen Industri', sks: 3 },
    ],
    matkulPSLain: [
      { id: 'psl-1', kode: 'AKT-302', nama: 'Metodologi Penelitian Terapan', prodi: 'D4 Akuntansi Manajerial', sks: 3 },
      { id: 'psl-2', kode: 'TM-204', nama: 'Manajemen Rekayasa Mesin', prodi: 'D4 Teknik Rekayasa Mesin', sks: 2 },
    ],
    bahanAjar: [
      'Buku Ajar: Manajemen Operasi Industri Manufaktur & Jasa (ISBN: 978-602-1234-01-2)',
      'Modul Praktikum: Simulasi Optimasi Supply Chain dengan Arena & Excel Solver',
      'Monograf: Penerapan Lean Six Sigma pada UKM Logam Jawa Tengah',
    ],
    bimbingan: {
      psABT: { ps: 8, ps1: 6, ps2: 7 },
      psLain: { ps: 3, ps1: 2, ps2: 2 },
    },
    rataBimbingan: 9.3,
    rekognisi: [
      'Narasumber Utama Forum Logistik Nasional 2024 di Surabaya',
      'Reviewer Nasional Hibah DRTPM Kemendikbudristek Bidang Sosial Humaniora',
      'Konsultan Ahli Efisiensi Tata Kelola Pabrik di Kawasan Industri Wijayakusuma',
    ],
    avatarColor: 'from-blue-600 to-indigo-600',
  },
  {
    nidn: '0015038202',
    nama: 'Siti Aminah, S.E., M.M.',
    matkulABT: [
      { id: 'abt-5', kode: 'ABT-202', nama: 'Pemasaran Digital & E-Commerce', sks: 3 },
      { id: 'abt-6', kode: 'ABT-301', nama: 'Kewirausahaan & Inkubasi Bisnis', sks: 3 },
      { id: 'abt-7', kode: 'ABT-103', nama: 'Dasar-Dasar Komunikasi Pemasaran', sks: 2 },
      { id: 'abt-8', kode: 'ABT-405', nama: 'Riset Pasar Internasional', sks: 2 },
    ],
    matkulPSLain: [
      { id: 'psl-3', kode: 'IK-102', nama: 'Pengantar Bisnis & Industri Kreatif', prodi: 'D4 Animasi & Desain Komunikasi Visual', sks: 2 },
    ],
    bahanAjar: [
      'Buku Teks: Strategi Brand & Pemasaran Digital Era AI (ISBN: 978-602-5678-22-1)',
      'Petunjuk Praktikum: Optimasi Social Media Ads & Conversion Analytics',
    ],
    bimbingan: {
      psABT: { ps: 6, ps1: 5, ps2: 6 },
      psLain: { ps: 2, ps1: 1, ps2: 2 },
    },
    rataBimbingan: 7.3,
    rekognisi: [
      'Mentor Terbaik Program Wirausaha Merdeka (WMK) 2023 Wilayah VI',
      'Juri Kompetisi Inovasi Bisnis Mahasiswa Tingkat Provinsi Jawa Tengah',
    ],
    avatarColor: 'from-emerald-600 to-teal-600',
  },
  {
    nidn: '0022117003',
    nama: 'Prof. Budi Raharjo, Ph.D.',
    matkulABT: [
      { id: 'abt-9', kode: 'ABT-401', nama: 'Ekonomi Manajerial & Kebijakan Publik', sks: 3 },
      { id: 'abt-10', kode: 'ABT-303', nama: 'Keuangan Perusahaan Multinasional', sks: 3 },
      { id: 'abt-11', kode: 'ABT-408', nama: 'Seminar Kebijakan Ekspor Terapan', sks: 2 },
    ],
    matkulPSLain: [
      { id: 'psl-4', kode: 'AKT-401', nama: 'Teori Portofolio & Investasi Pasar Modal', prodi: 'D4 Perbankan Syariah', sks: 3 },
    ],
    bahanAjar: [
      'Buku Referensi: Dinamika Kebijakan Tarif & Non-Tarif Perdagangan Asia Tenggara',
      'Monograf: Valuasi Finansial Terapan untuk Keputusan Merger & Akuisisi UKM',
    ],
    bimbingan: {
      psABT: { ps: 5, ps1: 4, ps2: 5 },
      psLain: { ps: 4, ps1: 3, ps2: 3 },
    },
    rataBimbingan: 8.0,
    rekognisi: [
      'Anggota Dewan Pakar Asosiasi Pengusaha Ekspor Indonesia (GPEI) Jateng',
      'Guest Lecturer di Universiti Teknologi Malaysia (UTM) 2024',
      'Editor in Chief Journal of Applied Business and Economics (SINTA 2)',
    ],
    avatarColor: 'from-violet-600 to-purple-600',
  },
  {
    nidn: '0004058804',
    nama: 'Rina Wijaya, M.B.A.',
    matkulABT: [
      { id: 'abt-12', kode: 'ABT-102', nama: 'Bahasa Inggris Korespondensi Bisnis', sks: 3 },
      { id: 'abt-13', kode: 'ABT-206', nama: 'Teknik Negosiasi & Diplomasi Bisnis', sks: 3 },
      { id: 'abt-14', kode: 'ABT-308', nama: 'Kepabeanan, Incoterms & Letter of Credit', sks: 4 },
      { id: 'abt-15', kode: 'ABT-404', nama: 'Kapita Selekta Perdagangan Global', sks: 4 },
    ],
    matkulPSLain: [],
    bahanAjar: [
      'Modul Panduan: English for International Trade and Customs Clearance',
      'Studi Kasus Video: Simulasi Negosiasi Kontrak Dagang dengan Buyer Eropa',
    ],
    bimbingan: {
      psABT: { ps: 7, ps1: 6, ps2: 5 },
      psLain: { ps: 0, ps1: 0, ps2: 0 },
    },
    rataBimbingan: 6.0,
    rekognisi: [
      'Praktisi Ekspor Terbaik Kadin Jawa Tengah Award 2023',
      'Instruktur Bersertifikat BNSP untuk Skema Ahli Ekspor',
    ],
    avatarColor: 'from-amber-600 to-orange-600',
  },
  {
    nidn: '0020078005',
    nama: 'Hendra Setiawan, M.Kom.',
    matkulABT: [
      { id: 'abt-16', kode: 'ABT-204', nama: 'Sistem Informasi Manajemen Bisnis', sks: 3 },
      { id: 'abt-17', kode: 'ABT-306', nama: 'Enterprise Resource Planning (ERP)', sks: 3 },
      { id: 'abt-18', kode: 'ABT-108', nama: 'Aplikasi Komputer Perkantoran Modern', sks: 3 },
      { id: 'abt-19', kode: 'ABT-310', nama: 'Keamanan Data & Tata Kelola IT Bisnis', sks: 3 },
      { id: 'abt-20', kode: 'ABT-406', nama: 'Manajemen Proyek Sistem Informasi', sks: 4 },
    ],
    matkulPSLain: [
      { id: 'psl-5', kode: 'TI-201', nama: 'Analisis dan Perancangan Sistem', prodi: 'D4 Teknik Informatika', sks: 3 },
    ],
    bahanAjar: [
      'Buku Ajar: Implementasi Modul Penjualan & Distribusi Menggunakan OpenERP/Odoo',
      'Lab Manual: Analisis Database Relasional SQL untuk Keputusan Manajemen',
    ],
    bimbingan: {
      psABT: { ps: 9, ps1: 8, ps2: 7 },
      psLain: { ps: 3, ps1: 2, ps2: 3 },
    },
    rataBimbingan: 10.7,
    rekognisi: [
      'Lead IT Consultant untuk Implementasi SIM-RS Terintegrasi di 3 RSUD',
      'Sertifikasi Internasional Microsoft Certified: Power BI Data Analyst',
    ],
    avatarColor: 'from-cyan-600 to-blue-600',
  },
];
