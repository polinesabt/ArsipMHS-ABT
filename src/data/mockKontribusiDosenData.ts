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
    nidn: '0001017806',
    nama: 'Dr. Ahmad Syarif, S.T., M.T.',
    avatarColor: 'from-blue-600 to-indigo-600',
    matkulABT: [
      { id: 'mk-1', kode: 'ABT301', nama: 'Sistem Informasi Manajemen Bisnis', sks: 3 },
      { id: 'mk-2', kode: 'ABT305', nama: 'Otomasi Perkantoran & Basis Data', sks: 3 },
      { id: 'mk-3', kode: 'ABT401', nama: 'Tata Kelola TI Bisnis Digital', sks: 2 },
    ],
    matkulPSLain: [
      { id: 'mkl-1', kode: 'TKK201', nama: 'Jaringan Komputer & IoT', prodi: 'D4 Teknik Telekomunikasi', sks: 2 },
    ],
    bahanAjar: [
      'Buku Ajar: Sistem Informasi Manajemen Berbasis Cloud untuk Vokasi (ISBN: 978-623-456-112-1)',
      'Modul Praktikum: Otomasi Dokumen & Basis Data Bisnis Modern',
    ],
    bimbingan: {
      psABT: { ps: 8, ps1: 6, ps2: 7 },
      psLain: { ps: 2, ps1: 2, ps2: 1 },
    },
    rataBimbingan: 8.7,
    rekognisi: [
      'Asesor Kompetensi LSP BNSP Bidang Teknologi Informasi (2022–2026)',
      'Narasumber Nasional: Transformasi Digital Kampus Vokasi Kemendikbudristek (2024)',
    ],
  },
  {
    nidn: '0004058804',
    nama: 'Rina Wijaya, S.E., M.B.A.',
    avatarColor: 'from-emerald-600 to-teal-600',
    matkulABT: [
      { id: 'mk-4', kode: 'ABT202', nama: 'Pemasaran Digital & E-Commerce', sks: 3 },
      { id: 'mk-5', kode: 'ABT304', nama: 'Manajemen Bisnis Internasional & Ekspor', sks: 3 },
      { id: 'mk-6', kode: 'ABT308', nama: 'Negosiasi Bisnis Global', sks: 2 },
    ],
    matkulPSLain: [
      { id: 'mkl-2', kode: 'MNJ102', nama: 'Pemasaran Industri', prodi: 'D3 Manajemen Pemasaran', sks: 2 },
    ],
    bahanAjar: [
      'Buku Panduan Ekspor Praktis untuk UMKM Manufaktur (ISBN: 978-623-789-221-4)',
    ],
    bimbingan: {
      psABT: { ps: 5, ps1: 4, ps2: 3 },
      psLain: { ps: 0, ps1: 0, ps2: 0 },
    },
    rataBimbingan: 4.0,
    rekognisi: [
      'Konsultan Pemasaran Ekspor Bersertifikat Kementerian Perdagangan RI (2023–2025)',
      'Mentor Startup Inkubator Bisnis Jawa Tengah (2024)',
    ],
  },
  {
    nidn: '0012087501',
    nama: 'Dr. Ir. Fauzi Nurhadi, M.T.',
    avatarColor: 'from-violet-600 to-purple-600',
    matkulABT: [
      { id: 'mk-7', kode: 'ABT302', nama: 'Manajemen Operasional & Produksi', sks: 3 },
      { id: 'mk-8', kode: 'ABT402', nama: 'Lean Management & Six Sigma Bisnis', sks: 3 },
    ],
    matkulPSLain: [
      { id: 'mkl-3', kode: 'TMI301', nama: 'Pengendalian Kualitas Terpadu (TQM)', prodi: 'D4 Teknik Mesin Produksi', sks: 2 },
    ],
    bahanAjar: [
      'Buku Monograf: Implementasi Lean Manufacturing pada Industri Vokasi (ISBN: 978-602-555-890-3)',
      'Modul Ajar: Tata Letak Fasilitas & Ergonomi Kerja Perkantoran',
    ],
    bimbingan: {
      psABT: { ps: 9, ps1: 8, ps2: 8 },
      psLain: { ps: 3, ps1: 2, ps2: 2 },
    },
    rataBimbingan: 10.7,
    rekognisi: [
      'Lead Auditor ISO 9001:2015 Badan Akreditasi Nasional (2021–2025)',
      'Reviewer Nasional Hibah Riset Terapan Vokasi Kemendikbudristek (2023–2026)',
    ],
  },
  {
    nidn: '0015038202',
    nama: 'Siti Aminah, S.E., M.M., Ak., CA',
    avatarColor: 'from-amber-600 to-orange-600',
    matkulABT: [
      { id: 'mk-9', kode: 'ABT201', nama: 'Akuntansi Keuangan & Manajemen', sks: 3 },
      { id: 'mk-10', kode: 'ABT303', nama: 'Manajemen Keuangan Bisnis Terapan', sks: 3 },
      { id: 'mk-11', kode: 'ABT403', nama: 'Perpajakan Bisnis Terapan', sks: 3 },
    ],
    matkulPSLain: [
      { id: 'mkl-4', kode: 'AKT202', nama: 'Analisis Laporan Keuangan Syariah', prodi: 'D4 Akuntansi Manajerial', sks: 2 },
    ],
    bahanAjar: [
      'Buku Ajar: Akuntansi Keuangan Berbasis SAK EMKM untuk Entitas Bisnis (ISBN: 978-623-111-340-9)',
    ],
    bimbingan: {
      psABT: { ps: 7, ps1: 6, ps2: 6 },
      psLain: { ps: 1, ps1: 1, ps2: 0 },
    },
    rataBimbingan: 7.0,
    rekognisi: [
      'Pengurus Ikatan Akuntan Indonesia (IAI) Wilayah Jawa Tengah (2022–2026)',
      'Instruktur Pelatihan Pajak Terapan Brevet A & B (2023–2025)',
    ],
  },
  {
    nidn: '0020078005',
    nama: 'Dr. Hendra Setiawan, S.Kom., M.Kom.',
    avatarColor: 'from-cyan-600 to-blue-600',
    matkulABT: [
      { id: 'mk-12', kode: 'ABT306', nama: 'Sistem ERP (Enterprise Resource Planning)', sks: 3 },
      { id: 'mk-13', kode: 'ABT307', nama: 'Basis Data Terdistribusi & Cloud Storage', sks: 3 },
      { id: 'mk-14', kode: 'ABT404', nama: 'Keamanan Siber & Audit Dokumen Digital', sks: 2 },
    ],
    matkulPSLain: [
      { id: 'mkl-5', kode: 'TIK302', nama: 'Cloud Architecture & DevOps', prodi: 'D4 Teknik Informatika', sks: 3 },
    ],
    bahanAjar: [
      'Buku Ajar: Implementasi ERP SAP Business One di Industri Vokasi (ISBN: 978-623-999-550-1)',
      'Modul Lab: Konfigurasi Cloud Database & Disaster Recovery',
    ],
    bimbingan: {
      psABT: { ps: 8, ps1: 7, ps2: 7 },
      psLain: { ps: 2, ps1: 2, ps2: 1 },
    },
    rataBimbingan: 9.0,
    rekognisi: [
      'Instruktur AWS Academy Terakreditasi Amazon Web Services (2022–2026)',
      'Tim Ahli SPBE (Sistem Pemerintahan Berbasis Elektronik) Pemprov Jateng (2024)',
    ],
  },
  {
    nidn: '0022117003',
    nama: 'Prof. Budi Raharjo, S.E., M.Si., Ph.D.',
    avatarColor: 'from-rose-600 to-pink-600',
    matkulABT: [
      { id: 'mk-15', kode: 'ABT405', nama: 'Manajemen Strategik & Kebijakan Bisnis', sks: 3 },
      { id: 'mk-16', kode: 'ABT406', nama: 'Seminar Kebijakan Ekspor-Impor Nasional', sks: 2 },
    ],
    matkulPSLain: [
      { id: 'mkl-6', kode: 'EKO401', nama: 'Ekonomi Manajerial Terapan', prodi: 'D4 Akuntansi Bisnis', sks: 2 },
    ],
    bahanAjar: [
      'Buku Referensi: Strategi Akselerasi Ekspor Vokasi Indonesia di Pasar Global (ISBN: 978-602-888-771-2)',
    ],
    bimbingan: {
      psABT: { ps: 10, ps1: 9, ps2: 9 },
      psLain: { ps: 4, ps1: 3, ps2: 3 },
    },
    rataBimbingan: 12.7,
    rekognisi: [
      'Dewan Penasihat Ahli KADIN Jawa Tengah Bidang Perdagangan Luar Negeri (2021–2026)',
      'Reviewer Jurnal Internasional Terindeks Scopus Q1 Elsevier & Springer (2020–sekarang)',
      'Anggota Tim Dewan Riset Daerah (DRD) Provinsi Jawa Tengah (2022–2025)',
    ],
  },
  {
    nidn: '0008098301',
    nama: 'Dewi Lestari, S.S., M.Hum.',
    avatarColor: 'from-fuchsia-600 to-purple-600',
    matkulABT: [
      { id: 'mk-17', kode: 'ABT101', nama: 'Bahasa Inggris Bisnis & Komunikasi Interpersonal', sks: 3 },
      { id: 'mk-18', kode: 'ABT203', nama: 'Korespondensi Bisnis Internasional', sks: 3 },
      { id: 'mk-19', kode: 'ABT309', nama: 'Public Speaking & Media Relations', sks: 2 },
    ],
    matkulPSLain: [
      { id: 'mkl-7', kode: 'BHS101', nama: 'English for Technical Purposes', prodi: 'D3 Teknik Listrik', sks: 2 },
    ],
    bahanAjar: [
      'Buku Ajar: English for Professional Business Letters & Reports (ISBN: 978-623-333-119-8)',
    ],
    bimbingan: {
      psABT: { ps: 6, ps1: 5, ps2: 5 },
      psLain: { ps: 1, ps1: 0, ps2: 0 },
    },
    rataBimbingan: 5.7,
    rekognisi: [
      'Trainer Bahasa Inggris Ekspor Bersertifikat British Council (2023–2025)',
      'Penguji Sertifikasi Kompetensi Sekretaris Eksekutif BNSP (2022–2026)',
    ],
  },
  {
    nidn: '0014028604',
    nama: 'Bambang Kusuma, S.T., M.T.',
    avatarColor: 'from-blue-600 to-indigo-600',
    matkulABT: [
      { id: 'mk-20', kode: 'ABT204', nama: 'Manajemen Logistik & Pergudangan Modern', sks: 3 },
      { id: 'mk-21', kode: 'ABT310', nama: 'Manajemen Rantai Pasok (SCM) Terapan', sks: 3 },
      { id: 'mk-22', kode: 'ABT407', nama: 'Freight Forwarding & Kepabeanan Bea Cukai', sks: 3 },
    ],
    matkulPSLain: [
      { id: 'mkl-8', kode: 'LOG201', nama: 'Sistem Transportasi & Distribusi', prodi: 'D4 Teknik Mesin', sks: 2 },
    ],
    bahanAjar: [
      'Buku Ajar: Tata Laksana Kepabeanan dan Logistik Maritim Indonesia (ISBN: 978-623-222-456-0)',
    ],
    bimbingan: {
      psABT: { ps: 6, ps1: 5, ps2: 5 },
      psLain: { ps: 1, ps1: 1, ps2: 0 },
    },
    rataBimbingan: 6.0,
    rekognisi: [
      'Anggota Dewan Pakar Asosiasi Logistik Indonesia (ALI) DPW Jateng (2023–2026)',
      'Instruktur Diklat Ahli Kepabeanan (PPJK) Terakreditasi Kemenkeu (2024)',
    ],
  },
  {
    nidn: '0025129002',
    nama: 'Nadia Putri, S.Pd., M.Pd.',
    avatarColor: 'from-emerald-600 to-teal-600',
    matkulABT: [
      { id: 'mk-23', kode: 'ABT102', nama: 'Tata Kelola Kearsipan & Korespondensi Digital', sks: 3 },
      { id: 'mk-24', kode: 'ABT205', nama: 'Keprotokolan & Event Management', sks: 3 },
    ],
    matkulPSLain: [],
    bahanAjar: [
      'Modul Praktikum: Manajemen Rapat & Tata Kelola Acara Resmi Perusahaan',
    ],
    bimbingan: {
      psABT: { ps: 3, ps1: 2, ps2: 2 },
      psLain: { ps: 0, ps1: 0, ps2: 0 },
    },
    rataBimbingan: 2.3,
    rekognisi: [
      'Master Trainer Protokoler Asosiasi Sekretaris Indonesia (2023–2025)',
    ],
  },
  {
    nidn: '0030017903',
    nama: 'Dr. Agus Priyono, S.E., M.Si.',
    avatarColor: 'from-amber-600 to-orange-600',
    matkulABT: [
      { id: 'mk-25', kode: 'ABT206', nama: 'Manajemen Sumber Daya Manusia Terapan', sks: 3 },
      { id: 'mk-26', kode: 'ABT311', nama: 'Pengembangan Organisasi & Kepemimpinan Bisnis', sks: 3 },
      { id: 'mk-27', kode: 'ABT408', nama: 'Kompensasi, Hubungan Industrial & K3 Perkantoran', sks: 3 },
    ],
    matkulPSLain: [
      { id: 'mkl-9', kode: 'MNJ302', nama: 'Etika Profesi & Manajemen SDM', prodi: 'D4 Akuntansi Manajerial', sks: 2 },
    ],
    bahanAjar: [
      'Buku Ajar: Manajemen Talenta dan Hubungan Industrial di Era Vokasi 4.0 (ISBN: 978-623-666-891-2)',
    ],
    bimbingan: {
      psABT: { ps: 8, ps1: 7, ps2: 7 },
      psLain: { ps: 2, ps1: 2, ps2: 1 },
    },
    rataBimbingan: 9.0,
    rekognisi: [
      'Asesor Kompetensi MSDM BNSP Wilayah Indonesia Bagian Tengah (2021–2025)',
      'Konsultan Budaya Organisasi BUMD Jawa Tengah (2023–2026)',
    ],
  },
  {
    nidn: '0018048503',
    nama: 'Ir. Maya Kartika, M.Sc.',
    avatarColor: 'from-cyan-600 to-blue-600',
    matkulABT: [
      { id: 'mk-28', kode: 'ABT207', nama: 'Kewirausahaan & Inkubasi Bisnis Rintisan', sks: 3 },
      { id: 'mk-29', kode: 'ABT312', nama: 'Perencanaan Usaha & Studi Kelayakan Bisnis', sks: 3 },
    ],
    matkulPSLain: [
      { id: 'mkl-10', kode: 'KWU201', nama: 'Teknopreneurship', prodi: 'D4 Teknik Telekomunikasi', sks: 2 },
    ],
    bahanAjar: [
      'Buku Ajar: Business Model Canvas & Pitching Investasi Mahasiswa Vokasi (ISBN: 978-623-555-780-4)',
    ],
    bimbingan: {
      psABT: { ps: 7, ps1: 6, ps2: 6 },
      psLain: { ps: 1, ps1: 1, ps2: 1 },
    },
    rataBimbingan: 7.3,
    rekognisi: [
      'Fasilitator Nasional Program Wirausaha Merdeka Kemendikbudristek (2022–2025)',
    ],
  },
  {
    nidn: '0005118702',
    nama: 'Rudi Hartono, S.Kom., M.M.',
    avatarColor: 'from-violet-600 to-purple-600',
    matkulABT: [
      { id: 'mk-30', kode: 'ABT208', nama: 'Analisis Data Bisnis dengan Python & R', sks: 3 },
      { id: 'mk-31', kode: 'ABT313', nama: 'Business Intelligence & Visualisasi Data', sks: 3 },
      { id: 'mk-32', kode: 'ABT409', nama: 'Strategi Omnichannel & CRM', sks: 3 },
    ],
    matkulPSLain: [
      { id: 'mkl-11', kode: 'TIK205', nama: 'Pengantar Sains Data', prodi: 'D4 Teknik Informatika', sks: 3 },
    ],
    bahanAjar: [
      'Buku Praktikum: Visualisasi Data Bisnis Interaktif Menggunakan Tableau & Power BI (ISBN: 978-623-444-901-7)',
    ],
    bimbingan: {
      psABT: { ps: 6, ps1: 6, ps2: 5 },
      psLain: { ps: 1, ps1: 1, ps2: 0 },
    },
    rataBimbingan: 6.3,
    rekognisi: [
      'Google Certified Professional Data Engineer (2023–2026)',
    ],
  },
];
