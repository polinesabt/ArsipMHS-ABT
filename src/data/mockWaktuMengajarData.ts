export interface WaktuMengajarItem {
  nidn: string;
  nama: string;
  avatarColor?: string;
  jabatan?: string;
  statusDosen?: 'Tetap' | 'Tidak Tetap';
  tahunAkademik?: string;
  sksPendidikanPS: number;
  sksPendidikanPSLain: number;
  sksPendidikanPTLain: number;
  sksPenelitian: number;
  sksPengabdian: number;
  sksTugasTambahan: number;
}

export function calculatePendidikanTotal(dosen: WaktuMengajarItem): number {
  if (!dosen) return 0;
  return (
    (Number(dosen.sksPendidikanPS) || 0) +
    (Number(dosen.sksPendidikanPSLain) || 0) +
    (Number(dosen.sksPendidikanPTLain) || 0)
  );
}

export const calculateSksPembelajaran = calculatePendidikanTotal;

export function calculateTotalSks(dosen: WaktuMengajarItem): number {
  if (!dosen) return 0;
  return (
    calculatePendidikanTotal(dosen) +
    (Number(dosen.sksPenelitian) || 0) +
    (Number(dosen.sksPengabdian) || 0) +
    (Number(dosen.sksTugasTambahan) || 0)
  );
}

export function calculateAvgSks(dosen: WaktuMengajarItem): number {
  if (!dosen) return 0;
  return parseFloat((calculateTotalSks(dosen) / 2).toFixed(2));
}

export const calculateRataRataPerSemester = calculateAvgSks;

/** Satu periode terbaru per dosen untuk KPI yang membandingkan antar-dosen. */
export function latestWaktuMengajarPerDosen(items: WaktuMengajarItem[]): WaktuMengajarItem[] {
  const latest = new Map<string, WaktuMengajarItem>();
  items.forEach((item) => {
    const current = latest.get(item.nidn);
    if (!current || (item.tahunAkademik || '') > (current.tahunAkademik || '')) latest.set(item.nidn, item);
  });
  return Array.from(latest.values());
}

export const INITIAL_WAKTU_MENGAJAR_DATA: WaktuMengajarItem[] = [
  {
    nidn: '0001017806',
    nama: 'Dr. Ahmad Syarif, S.T., M.T.',
    avatarColor: 'from-blue-600 to-indigo-600',
    sksPendidikanPS: 8.0,
    sksPendidikanPSLain: 2.0,
    sksPendidikanPTLain: 0.0,
    sksPenelitian: 3.5,
    sksPengabdian: 2.0,
    sksTugasTambahan: 2.0,
  },
  {
    nidn: '0004058804',
    nama: 'Rina Wijaya, S.E., M.B.A.',
    avatarColor: 'from-emerald-600 to-teal-600',
    sksPendidikanPS: 8.0,
    sksPendidikanPSLain: 2.0,
    sksPendidikanPTLain: 2.0,
    sksPenelitian: 1.5,
    sksPengabdian: 1.0,
    sksTugasTambahan: 0.0,
  },
  {
    nidn: '0012087501',
    nama: 'Dr. Ir. Fauzi Nurhadi, M.T.',
    avatarColor: 'from-violet-600 to-purple-600',
    sksPendidikanPS: 6.0,
    sksPendidikanPSLain: 2.0,
    sksPendidikanPTLain: 0.0,
    sksPenelitian: 4.0,
    sksPengabdian: 2.5,
    sksTugasTambahan: 4.0,
  },
  {
    nidn: '0015038202',
    nama: 'Siti Aminah, S.E., M.M., Ak., CA',
    avatarColor: 'from-amber-600 to-orange-600',
    sksPendidikanPS: 9.0,
    sksPendidikanPSLain: 2.0,
    sksPendidikanPTLain: 0.0,
    sksPenelitian: 2.5,
    sksPengabdian: 2.0,
    sksTugasTambahan: 0.0,
  },
  {
    nidn: '0020078005',
    nama: 'Dr. Hendra Setiawan, S.Kom., M.Kom.',
    avatarColor: 'from-cyan-600 to-blue-600',
    sksPendidikanPS: 7.5,
    sksPendidikanPSLain: 3.0,
    sksPendidikanPTLain: 0.0,
    sksPenelitian: 3.5,
    sksPengabdian: 2.0,
    sksTugasTambahan: 2.0,
  },
  {
    nidn: '0022117003',
    nama: 'Prof. Budi Raharjo, S.E., M.Si., Ph.D.',
    avatarColor: 'from-rose-600 to-pink-600',
    sksPendidikanPS: 5.0,
    sksPendidikanPSLain: 1.5,
    sksPendidikanPTLain: 1.0,
    sksPenelitian: 5.5,
    sksPengabdian: 2.5,
    sksTugasTambahan: 6.0,
  },
  {
    nidn: '0008098301',
    nama: 'Dewi Lestari, S.S., M.Hum.',
    avatarColor: 'from-fuchsia-600 to-purple-600',
    sksPendidikanPS: 8.5,
    sksPendidikanPSLain: 2.5,
    sksPendidikanPTLain: 0.0,
    sksPenelitian: 2.5,
    sksPengabdian: 2.0,
    sksTugasTambahan: 0.0,
  },
  {
    nidn: '0014028604',
    nama: 'Bambang Kusuma, S.T., M.T.',
    avatarColor: 'from-blue-600 to-indigo-600',
    sksPendidikanPS: 9.5,
    sksPendidikanPSLain: 2.5,
    sksPendidikanPTLain: 0.0,
    sksPenelitian: 2.0,
    sksPengabdian: 1.5,
    sksTugasTambahan: 0.0,
  },
  {
    nidn: '0025129002',
    nama: 'Nadia Putri, S.Pd., M.Pd.',
    avatarColor: 'from-emerald-600 to-teal-600',
    sksPendidikanPS: 6.0,
    sksPendidikanPSLain: 0.0,
    sksPendidikanPTLain: 4.0,
    sksPenelitian: 1.0,
    sksPengabdian: 1.0,
    sksTugasTambahan: 0.0,
  },
  {
    nidn: '0030017903',
    nama: 'Dr. Agus Priyono, S.E., M.Si.',
    avatarColor: 'from-amber-600 to-orange-600',
    sksPendidikanPS: 7.0,
    sksPendidikanPSLain: 2.0,
    sksPendidikanPTLain: 0.0,
    sksPenelitian: 3.5,
    sksPengabdian: 2.5,
    sksTugasTambahan: 3.0,
  },
  {
    nidn: '0018048503',
    nama: 'Ir. Maya Kartika, M.Sc.',
    avatarColor: 'from-cyan-600 to-blue-600',
    sksPendidikanPS: 8.0,
    sksPendidikanPSLain: 2.0,
    sksPendidikanPTLain: 0.0,
    sksPenelitian: 3.0,
    sksPengabdian: 2.5,
    sksTugasTambahan: 0.0,
  },
  {
    nidn: '0005118702',
    nama: 'Rudi Hartono, S.Kom., M.M.',
    avatarColor: 'from-violet-600 to-purple-600',
    sksPendidikanPS: 9.0,
    sksPendidikanPSLain: 3.0,
    sksPendidikanPTLain: 0.0,
    sksPenelitian: 2.5,
    sksPengabdian: 1.5,
    sksTugasTambahan: 0.0,
  },
];
