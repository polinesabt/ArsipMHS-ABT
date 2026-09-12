export interface TenagaKependidikanItem {
  id: string;
  nama: string;
  nip: string; // NIDN / NIDK / NIP / NITK
  status: 'Tetap' | 'Tidak Tetap';
  jabatan: string; // Jabatan Fungsional / Penugasan (contoh: "Teknisi Laboratorium Komputer")
  golongan: string; // Pangkat & Golongan Ruang (contoh: "Gol. III/b")
  pendidikanD3?: string;
  pendidikanS1?: string;
  pendidikanS2?: string;
  pendidikanS3?: string;
  sertifikatKompetensi: string[];
}

export const INITIAL_TENAGA_KEPENDIDIKAN_DATA: TenagaKependidikanItem[] = [
  {
    id: 'tendik-1',
    nip: '198805122014041001',
    nama: 'Agus Setiawan, A.Md.Kom.',
    status: 'Tetap',
    jabatan: 'Teknisi Laboratorium Komputer',
    golongan: 'Gol. III/b',
    pendidikanD3: 'D3 Manajemen Informatika',
    pendidikanS1: 'S1 Sistem Informasi',
    pendidikanS2: '-',
    pendidikanS3: '-',
    sertifikatKompetensi: [
      'Jaringan Komputer (CCNA)',
      'Hardware & Network Maintenance BNSP',
      'IT Support Specialist Google',
    ],
  },
  {
    id: 'tendik-2',
    nip: '198503222009122003',
    nama: 'Sri Wahyuni, S.Sos., M.M.',
    status: 'Tetap',
    jabatan: 'Arsiparis Ahli Muda',
    golongan: 'Gol. III/c',
    pendidikanD3: '-',
    pendidikanS1: 'S1 Ilmu Administrasi Negara',
    pendidikanS2: 'S2 Magister Manajemen',
    pendidikanS3: '-',
    sertifikatKompetensi: [
      'Manajemen Kearsipan Digital ANRI',
      'Sistem Kearsipan Elektronik Lembaga',
      'Pengelolaan Dokumen Rahasia Negara',
    ],
  },
  {
    id: 'tendik-3',
    nip: '199201152019031008',
    nama: 'Bambang Pratama, S.Kom., M.Kom.',
    status: 'Tetap',
    jabatan: 'Pranata Komputer Ahli Pertama',
    golongan: 'Gol. III/a',
    pendidikanD3: '-',
    pendidikanS1: 'S1 Teknik Informatika',
    pendidikanS2: 'S2 Magister Ilmu Komputer',
    pendidikanS3: '-',
    sertifikatKompetensi: [
      'Database Administrator Oracle',
      'Web Security & Penetration Testing',
      'Cloud Practitioner AWS',
    ],
  },
  {
    id: 'tendik-4',
    nip: '199008102015052002',
    nama: 'Dina Kusuma, S.E.',
    status: 'Tetap',
    jabatan: 'Pengadministrasi Akademik',
    golongan: 'Gol. III/a',
    pendidikanD3: 'D3 Kesekretariatan',
    pendidikanS1: 'S1 Manajemen Bisnis',
    pendidikanS2: '-',
    pendidikanS3: '-',
    sertifikatKompetensi: [
      'Pelayanan Prima Administrasi Akademik',
      'Sertifikasi Operator PDDIKTI Kemenristekdikti',
    ],
  },
  {
    id: 'tendik-5',
    nip: '198711042010121004',
    nama: 'Eko Santoso, S.E., Ak.',
    status: 'Tetap',
    jabatan: 'Pengelola Keuangan & Anggaran',
    golongan: 'Gol. III/b',
    pendidikanD3: '-',
    pendidikanS1: 'S1 Akuntansi Keuangan',
    pendidikanS2: '-',
    pendidikanS3: '-',
    sertifikatKompetensi: [
      'Bendahara Pengeluaran APBN Kemenkeu RI',
      'Sertifikasi Pengadaan Barang dan Jasa Pemerintah (PBJP)',
    ],
  },
  {
    id: 'tendik-6',
    nip: '199507192022042006',
    nama: 'Ratna Sari, S.I.Pust.',
    status: 'Tidak Tetap',
    jabatan: 'Pustakawan & Pengelola Repositori',
    golongan: 'Gol. II/c',
    pendidikanD3: 'D3 Perpustakaan',
    pendidikanS1: 'S1 Ilmu Perpustakaan & Informasi',
    pendidikanS2: '-',
    pendidikanS3: '-',
    sertifikatKompetensi: [
      'Pengelolaan Repositori Institusi EPrints',
      'Katalogisasi Standar Perpustakaan Nasional RI',
    ],
  },
  {
    id: 'tendik-7',
    nip: '199304182020121002',
    nama: 'Wahyu Nugroho, A.Md.T.',
    status: 'Tetap',
    jabatan: 'Teknisi Laboratorium Perkantoran',
    golongan: 'Gol. II/c',
    pendidikanD3: 'D3 Teknik Komputer',
    pendidikanS1: '-',
    pendidikanS2: '-',
    pendidikanS3: '-',
    sertifikatKompetensi: [
      'Maintenance Alat Perkantoran & Audio Visual',
      'K3 Lingkungan Kerja Laboratorium',
    ],
  },
  {
    id: 'tendik-8',
    nip: '199610252023022005',
    nama: 'Anisa Rahmawati, S.Tr.Kom.',
    status: 'Tidak Tetap',
    jabatan: 'Pranata Media Informasi & Humas',
    golongan: 'Gol. II/b',
    pendidikanD3: '-',
    pendidikanS1: 'D4 Animasi & Desain Multimedia',
    pendidikanS2: '-',
    pendidikanS3: '-',
    sertifikatKompetensi: [
      'Desain Komunikasi Visual BNSP',
      'Content Creator & Social Media Strategist',
    ],
  },
];
