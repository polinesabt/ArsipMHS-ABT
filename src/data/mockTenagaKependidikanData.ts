export interface TenagaKependidikanItem {
  id: string;
  nama: string;
  nip: string; // NIDN / NIDK / NIP / NITK
  status: 'Tetap' | 'Tidak Tetap';
  jabatan: string; // contoh: "Teknisi Lab Gol. III/b", "Arsiparis Ahli Pertama Gol. III/a", etc.
  pendidikanD3?: string;
  pendidikanS1?: string;
  pendidikanS2?: string;
  pendidikanS3?: string;
  sertifikatKompetensi: string[];
}

export const INITIAL_TENAGA_KEPENDIDIKAN_DATA: TenagaKependidikanItem[] = [
  {
    id: 'tendik-1',
    nama: 'Agus Setiawan, A.Md.Kom., S.Kom.',
    nip: '198805122014041001',
    status: 'Tetap',
    jabatan: 'Pranata Laboratorium Pendidikan (PLP) Ahli Pertama Gol. III/b',
    pendidikanD3: 'D3 Teknik Telekomunikasi',
    pendidikanS1: 'S1 Sistem Informasi',
    pendidikanS2: '-',
    pendidikanS3: '-',
    sertifikatKompetensi: [
      'Jaringan Komputer & Cyber Security (CCNA)',
      'Hardware & Server Maintenance BNSP',
      'Pengelolaan Laboratorium Komputer Bersertifikat Kemenristekdikti',
    ],
  },
  {
    id: 'tendik-2',
    nama: 'Sri Wahyuni, S.Sos., M.M.',
    nip: '198503222009122003',
    status: 'Tetap',
    jabatan: 'Arsiparis Ahli Muda Gol. III/c',
    pendidikanD3: 'D3 Sekretari & Administrasi Perkantoran',
    pendidikanS1: 'S1 Ilmu Administrasi Negara',
    pendidikanS2: 'S2 Magister Manajemen SDM',
    pendidikanS3: '-',
    sertifikatKompetensi: [
      'Manajemen Kearsipan Digital ANRI (Tingkat Nasional)',
      'Audit Kearsipan Elektronik & ISO 15489',
      'Pengelolaan Dokumen Lembaga & Retensi Arsip',
    ],
  },
  {
    id: 'tendik-3',
    nama: 'Bambang Triyono, S.T.',
    nip: '199208152019031005',
    status: 'Tetap',
    jabatan: 'Teknisi Sarana dan Prasarana Lab Ekspor Impor Gol. III/a',
    pendidikanD3: 'D3 Teknik Elektro',
    pendidikanS1: 'S1 Teknik Industri',
    pendidikanS2: '-',
    pendidikanS3: '-',
    sertifikatKompetensi: [
      'Ahli K3 Umum Kemenaker RI',
      'Tata Kelola Fasilitas dan Manajemen Logistik Pergudangan',
    ],
  },
  {
    id: 'tendik-4',
    nama: 'Nurul Hidayati, S.M.',
    nip: '199511042022012008',
    status: 'Tidak Tetap',
    jabatan: 'Pengadministrasi Akademik dan Kemahasiswaan',
    pendidikanD3: '-',
    pendidikanS1: 'S1 Manajemen Bisnis Terapan',
    pendidikanS2: '-',
    pendidikanS3: '-',
    sertifikatKompetensi: [
      'Sistem Informasi Akademik (SIAKAD) Expert',
      'Customer Service Excellence & Public Speaking',
    ],
  },
];
