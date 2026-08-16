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

export const INITIAL_KONTRIBUSI_DOSEN_DATA: KontribusiDosenItem[] = [];
