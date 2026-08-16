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

export const INITIAL_DOSEN_LUARAN_DATA: DosenLuaranItem[] = [];
