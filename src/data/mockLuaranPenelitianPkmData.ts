export type KategoriLuaran = 'Penelitian' | 'PKM';

export type SumberPendanaan =
  | 'Perguruan Tinggi / Mandiri'
  | 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)'
  | 'Lembaga Luar Negeri';

export type JenisPublikasi =
  | 'Jurnal Nasional Tidak Terakreditasi'
  | 'Jurnal Nasional Terakreditasi'
  | 'Jurnal Internasional'
  | 'Jurnal Internasional Bereputasi'
  | 'Seminar Wilayah, Lokal, Perguruan Tinggi'
  | 'Seminar Nasional'
  | 'Seminar Internasional'
  | 'Tulisan di Media Massa Nasional'
  | 'Tulisan di Media Massa Internasional'
  | 'Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Wilayah'
  | 'Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Nasional'
  | 'Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Internasional';

export interface LuaranItem {
  id: string;
  kategori: KategoriLuaran;
  judul: string;
  tahun: string;
  sumberPendanaan: SumberPendanaan;
  jenisPublikasi: JenisPublikasi;
}

export interface DosenLuaranItem {
  nidn: string;
  nama: string;
  avatarColor: string;
  luaran: LuaranItem[];
}

export const SUMBER_PENDANAAN_OPTIONS: SumberPendanaan[] = [
  'Perguruan Tinggi / Mandiri',
  'Lembaga Dalam Negeri (di luar Perguruan Tinggi)',
  'Lembaga Luar Negeri',
];

export const JENIS_PUBLIKASI_GROUPS: { groupName: string; options: JenisPublikasi[] }[] = [
  {
    groupName: 'Jurnal Ilmiah',
    options: [
      'Jurnal Nasional Tidak Terakreditasi',
      'Jurnal Nasional Terakreditasi',
      'Jurnal Internasional',
      'Jurnal Internasional Bereputasi',
    ],
  },
  {
    groupName: 'Seminar / Prosiding',
    options: [
      'Seminar Wilayah, Lokal, Perguruan Tinggi',
      'Seminar Nasional',
      'Seminar Internasional',
    ],
  },
  {
    groupName: 'Media Massa',
    options: [
      'Tulisan di Media Massa Nasional',
      'Tulisan di Media Massa Internasional',
    ],
  },
  {
    groupName: 'Pagelaran / Pameran / Forum',
    options: [
      'Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Wilayah',
      'Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Nasional',
      'Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Internasional',
    ],
  },
];

export function calculatePenelitianCount(dosen: DosenLuaranItem): number {
  if (!dosen || !dosen.luaran) return 0;
  return dosen.luaran.filter((l) => l.kategori === 'Penelitian').length;
}

export function calculatePkmCount(dosen: DosenLuaranItem): number {
  if (!dosen || !dosen.luaran) return 0;
  return dosen.luaran.filter((l) => l.kategori === 'PKM').length;
}

export function calculateTotalLuaran(dosen: DosenLuaranItem): number {
  if (!dosen || !dosen.luaran) return 0;
  return dosen.luaran.length;
}

export const INITIAL_DOSEN_LUARAN_DATA: DosenLuaranItem[] = [
  {
    nidn: '0012087501',
    nama: 'Dr. Ir. Fauzi, M.T.',
    avatarColor: 'from-blue-600 to-indigo-600',
    luaran: [
      {
        id: 'fz-1',
        kategori: 'Penelitian',
        judul: 'Model Optimasi Supply Chain Logam Jawa Tengah Berbasis Hybrid Linear Programming',
        tahun: '2024',
        sumberPendanaan: 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)',
        jenisPublikasi: 'Jurnal Internasional Bereputasi',
      },
      {
        id: 'fz-2',
        kategori: 'Penelitian',
        judul: 'Mitigasi Risiko Operasional Logistik Maritim Tanjung Emas Menggunakan Metode FMEA',
        tahun: '2023',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Jurnal Nasional Terakreditasi',
      },
      {
        id: 'fz-3',
        kategori: 'PKM',
        judul: 'Penerapan Standardisasi Tata Kelola Operasional 5S bagi Pengrajin Logam Ceper',
        tahun: '2024',
        sumberPendanaan: 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)',
        jenisPublikasi: 'Seminar Nasional',
      },
      {
        id: 'fz-4',
        kategori: 'Penelitian',
        judul: 'Urgensi Digitalisasi Rantai Pasok Maritim Pasca Pandemi di Jawa Tengah',
        tahun: '2023',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Tulisan di Media Massa Nasional',
      },
    ],
  },
  {
    nidn: '0015038202',
    nama: 'Siti Aminah, S.E., M.M.',
    avatarColor: 'from-emerald-600 to-teal-600',
    luaran: [
      {
        id: 'sa-1',
        kategori: 'Penelitian',
        judul: 'Determinants of Gen-Z Purchase Intention in Social Commerce Platforms: A Structural Equation Model',
        tahun: '2024',
        sumberPendanaan: 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)',
        jenisPublikasi: 'Jurnal Internasional',
      },
      {
        id: 'sa-2',
        kategori: 'PKM',
        judul: 'Pemberdayaan Pengrajin Batik Pewarna Alami Jarum Klaten Menembus Pasar Digital',
        tahun: '2024',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Seminar Nasional',
      },
      {
        id: 'sa-3',
        kategori: 'PKM',
        judul: 'Pameran Karya Inovasi Produk Ramah Lingkungan Batik Klaten pada Inacraft Jakarta',
        tahun: '2023',
        sumberPendanaan: 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)',
        jenisPublikasi: 'Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Nasional',
      },
    ],
  },
  {
    nidn: '0022117003',
    nama: 'Prof. Budi Raharjo, Ph.D.',
    avatarColor: 'from-violet-600 to-purple-600',
    luaran: [
      {
        id: 'br-1',
        kategori: 'Penelitian',
        judul: 'The Impact of Regional Comprehensive Economic Partnership (RCEP) on Indonesia Non-Oil Export Competitiveness',
        tahun: '2024',
        sumberPendanaan: 'Lembaga Luar Negeri',
        jenisPublikasi: 'Jurnal Internasional Bereputasi',
      },
      {
        id: 'br-2',
        kategori: 'Penelitian',
        judul: 'Comparative Advantage and Export Performance of Furniture Industry in Central Java',
        tahun: '2023',
        sumberPendanaan: 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)',
        jenisPublikasi: 'Jurnal Nasional Terakreditasi',
      },
      {
        id: 'br-3',
        kategori: 'PKM',
        judul: 'Penguatan Sertifikasi Halal Produk Olahan Ekspor untuk Memperluas Akses Pasar Timur Tengah',
        tahun: '2024',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Seminar Internasional',
      },
    ],
  },
  {
    nidn: '0004058804',
    nama: 'Rina Wijaya, M.B.A.',
    avatarColor: 'from-amber-600 to-orange-600',
    luaran: [
      {
        id: 'rw-1',
        kategori: 'Penelitian',
        judul: 'Market Entry Strategies for Agro-Industrial Processed Foods into Gulf Cooperation Council (GCC) Markets',
        tahun: '2024',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Seminar Internasional',
      },
    ],
  },
  {
    nidn: '0020078005',
    nama: 'Hendra Setiawan, M.Kom.',
    avatarColor: 'from-cyan-600 to-blue-600',
    luaran: [
      {
        id: 'hs-1',
        kategori: 'Penelitian',
        judul: 'Real-Time Export KPI Monitoring Dashboard Architecture Using Microsoft Power BI Embedded',
        tahun: '2024',
        sumberPendanaan: 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)',
        jenisPublikasi: 'Jurnal Nasional Terakreditasi',
      },
      {
        id: 'hs-2',
        kategori: 'Penelitian',
        judul: 'Cloud-Based Export Customs Documentation Workflow Automation: A Design Science Approach',
        tahun: '2023',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Seminar Nasional',
      },
      {
        id: 'hs-3',
        kategori: 'PKM',
        judul: 'Implementasi Kasir Cloud POS Terintegrasi Pembayaran QRIS pada Koperasi Karyawan',
        tahun: '2024',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Seminar Wilayah, Lokal, Perguruan Tinggi',
      },
    ],
  },
];
