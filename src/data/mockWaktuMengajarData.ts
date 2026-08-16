export interface WaktuMengajarItem {
  nidn: string;
  nama: string;
  avatarColor: string;
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

export const INITIAL_WAKTU_MENGAJAR_DATA: WaktuMengajarItem[] = [];
