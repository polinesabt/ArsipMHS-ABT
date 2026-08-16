export interface WaktuMengajarItem {
  nidn: string;
  nama: string;
  jabatan: string;
  statusDosen: 'Tetap' | 'Tidak Tetap';
  avatarColor?: string;
  // 1. Pendidikan (Pembelajaran & Pembimbingan)
  pendidikanPsAbt: number; // PS Sendiri (PS ABT)
  pendidikanPsLain: number; // PS Lain (Internal PT)
  pendidikanPtLain: number; // PT Lain (Eksternal PT)
  // 2. Penelitian
  penelitian: number;
  // 3. PKM (Pengabdian Kepada Masyarakat)
  pkm: number;
  // 4. Tugas Tambahan dan/atau Penunjang
  tugasTambahan: number;
}

/**
 * Kalkulasi total SKS Pendidikan (PS Sendiri + PS Lain + PT Lain)
 */
export function calculatePendidikanTotal(item: WaktuMengajarItem): number {
  if (!item) return 0;
  const sum = 
    (Number(item.pendidikanPsAbt) || 0) +
    (Number(item.pendidikanPsLain) || 0) +
    (Number(item.pendidikanPtLain) || 0);
  return Math.round(sum * 100) / 100;
}

/**
 * Kalkulasi Total SKS Keseluruhan EWMP (5 Komponen)
 */
export function calculateTotalSks(item: WaktuMengajarItem): number {
  if (!item) return 0;
  const sum =
    (Number(item.pendidikanPsAbt) || 0) +
    (Number(item.pendidikanPsLain) || 0) +
    (Number(item.pendidikanPtLain) || 0) +
    (Number(item.penelitian) || 0) +
    (Number(item.pkm) || 0) +
    (Number(item.tugasTambahan) || 0);
  return Math.round(sum * 100) / 100;
}

/**
 * Kalkulasi Rata-rata SKS per Semester (Total SKS / 2)
 */
export function calculateAvgSks(item: WaktuMengajarItem): number {
  if (!item) return 0;
  const total = calculateTotalSks(item);
  return Math.round((total / 2) * 100) / 100;
}

export const INITIAL_WAKTU_MENGAJAR_DATA: WaktuMengajarItem[] = [
  {
    nidn: '0012087501',
    nama: 'Dr. Ir. Fauzi, M.T.',
    jabatan: 'Lektor Kepala',
    statusDosen: 'Tetap',
    avatarColor: 'from-blue-600 to-indigo-600',
    pendidikanPsAbt: 8.5,
    pendidikanPsLain: 2.0,
    pendidikanPtLain: 1.5,
    penelitian: 4.0,
    pkm: 3.0,
    tugasTambahan: 3.0,
  },
  {
    nidn: '0015038202',
    nama: 'Siti Aminah, S.E., M.M.',
    jabatan: 'Lektor',
    statusDosen: 'Tetap',
    avatarColor: 'from-emerald-600 to-teal-600',
    pendidikanPsAbt: 7.0,
    pendidikanPsLain: 2.0,
    pendidikanPtLain: 0.0,
    penelitian: 3.0,
    pkm: 2.5,
    tugasTambahan: 2.0,
  },
  {
    nidn: '0022117003',
    nama: 'Prof. Budi Raharjo, Ph.D.',
    jabatan: 'Guru Besar',
    statusDosen: 'Tetap',
    avatarColor: 'from-violet-600 to-purple-600',
    pendidikanPsAbt: 5.5,
    pendidikanPsLain: 2.5,
    pendidikanPtLain: 2.0,
    penelitian: 6.0,
    pkm: 4.0,
    tugasTambahan: 4.0,
  },
  {
    nidn: '0004058804',
    nama: 'Rina Wijaya, M.B.A.',
    jabatan: 'Asisten Ahli',
    statusDosen: 'Tidak Tetap',
    avatarColor: 'from-amber-600 to-orange-600',
    pendidikanPsAbt: 10.0,
    pendidikanPsLain: 0.0,
    pendidikanPtLain: 0.0,
    penelitian: 1.5,
    pkm: 1.5,
    tugasTambahan: 0.0,
  },
  {
    nidn: '0020078005',
    nama: 'Hendra Setiawan, M.Kom.',
    jabatan: 'Lektor',
    statusDosen: 'Tetap',
    avatarColor: 'from-cyan-600 to-blue-600',
    pendidikanPsAbt: 9.0,
    pendidikanPsLain: 3.0,
    pendidikanPtLain: 0.0,
    penelitian: 4.5,
    pkm: 2.0,
    tugasTambahan: 2.5,
  },
];
