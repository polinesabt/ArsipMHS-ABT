export interface DosenItem {
  nidn: string;
  nama: string;
  statusDosen: 'Tetap' | 'Tidak Tetap';
  jabatan: string;
  peran: 'Akademisi' | 'Praktisi';
  institusi: string;
  pendidikanPascaSarjana: string[];
  bidangKeahlian: string;
  sertifikatPendidik: string;
  sertifikatKompetensi: string;
  email: string;
  telepon: string;
  pengajaran: number;
  penelitian: number;
  pengabdian: number;
}

export const INITIAL_DOSEN_DATA: DosenItem[] = [
  {
    nidn: '0012087501',
    nama: 'Dr. Ir. Fauzi, M.T.',
    statusDosen: 'Tetap',
    jabatan: 'Lektor Kepala',
    peran: 'Akademisi',
    institusi: 'Politeknik Negeri Semarang',
    pendidikanPascaSarjana: ['Magister (S2)', 'Doktor (S3)'],
    bidangKeahlian: 'Manajemen Rekayasa Industri & Rantai Pasok',
    sertifikatPendidik: '19106100203492',
    sertifikatKompetensi: 'MSDM, Ekspor Impor Expert, Six Sigma Black Belt',
    email: 'fauzi@polines.ac.id',
    telepon: '081234567890',
    pengajaran: 12,
    penelitian: 4,
    pengabdian: 3,
  },
  {
    nidn: '0015038202',
    nama: 'Siti Aminah, S.E., M.M.',
    statusDosen: 'Tetap',
    jabatan: 'Lektor',
    peran: 'Akademisi',
    institusi: 'Politeknik Negeri Semarang',
    pendidikanPascaSarjana: ['Magister (S2)', 'Spesialis (Sp-1)'],
    bidangKeahlian: 'Manajemen Pemasaran & Bisnis Digital',
    sertifikatPendidik: '20108200104810',
    sertifikatKompetensi: 'Kewirausahaan (KWU), Digital Marketing BNSP',
    email: 'siti.aminah@polines.ac.id',
    telepon: '081234567891',
    pengajaran: 10,
    penelitian: 2,
    pengabdian: 2,
  },
  {
    nidn: '0022117003',
    nama: 'Prof. Budi Raharjo, Ph.D.',
    statusDosen: 'Tetap',
    jabatan: 'Guru Besar',
    peran: 'Akademisi',
    institusi: 'Politeknik Negeri Semarang',
    pendidikanPascaSarjana: ['Magister (S2)', 'Doktor (S3)'],
    bidangKeahlian: 'Ilmu Ekonomi & Kebijakan Perdagangan Internasional',
    sertifikatPendidik: '15104200801290',
    sertifikatKompetensi: 'Ekspor Impor Expert, Analisis Finansial Terapan',
    email: 'budi.raharjo@polines.ac.id',
    telepon: '081234567892',
    pengajaran: 8,
    penelitian: 6,
    pengabdian: 4,
  },
  {
    nidn: '0004058804',
    nama: 'Rina Wijaya, M.B.A.',
    statusDosen: 'Tidak Tetap',
    jabatan: 'Asisten Ahli',
    peran: 'Praktisi',
    institusi: 'PT Global Niaga Ekspor & Polines',
    pendidikanPascaSarjana: ['Magister Terapan (S2 Terapan)'],
    bidangKeahlian: 'Bisnis Internasional & Komunikasi Negosiasi Ekspor',
    sertifikatPendidik: '-',
    sertifikatKompetensi: 'Bahasa Inggris Bisnis, Kepabeanan & Forwarding',
    email: 'rina.wijaya@polines.ac.id',
    telepon: '081234567893',
    pengajaran: 14,
    penelitian: 1,
    pengabdian: 1,
  },
  {
    nidn: '0020078005',
    nama: 'Hendra Setiawan, M.Kom.',
    statusDosen: 'Tetap',
    jabatan: 'Lektor',
    peran: 'Akademisi',
    institusi: 'Politeknik Negeri Semarang',
    pendidikanPascaSarjana: ['Magister (S2)'],
    bidangKeahlian: 'Sistem Informasi Bisnis & ERP Terapan',
    sertifikatPendidik: '21105300702581',
    sertifikatKompetensi: 'IT Governance, SAP Certified Associate, BNSP',
    email: 'hendra.s@polines.ac.id',
    telepon: '081234567894',
    pengajaran: 16,
    penelitian: 5,
    pengabdian: 2,
  },
  {
    nidn: '0011048606',
    nama: 'Agus Purnomo, S.T., M.Eng.',
    statusDosen: 'Tetap',
    jabatan: 'Lektor',
    peran: 'Akademisi',
    institusi: 'Politeknik Negeri Semarang',
    pendidikanPascaSarjana: ['Magister (S2)'],
    bidangKeahlian: 'Teknologi Rekayasa Logistik & Otomasi Gudang',
    sertifikatPendidik: '18103300501980',
    sertifikatKompetensi: 'Supply Chain Management BNSP, Ahli K3 Umum',
    email: 'agus.purnomo@polines.ac.id',
    telepon: '081234567895',
    pengajaran: 12,
    penelitian: 3,
    pengabdian: 3,
  },
  {
    nidn: '0018099207',
    nama: 'Dewi Lestari, M.Si.',
    statusDosen: 'Tidak Tetap',
    jabatan: 'Asisten Ahli',
    peran: 'Praktisi',
    institusi: 'Politeknik Negeri Semarang',
    pendidikanPascaSarjana: ['Magister (S2)'],
    bidangKeahlian: 'Statistika Bisnis & Analitik Big Data',
    sertifikatPendidik: '-',
    sertifikatKompetensi: 'Data Science Specialist, Analis Data Bisnis',
    email: 'dewi.lestari@polines.ac.id',
    telepon: '081234567896',
    pengajaran: 10,
    penelitian: 2,
    pengabdian: 2,
  },
];
