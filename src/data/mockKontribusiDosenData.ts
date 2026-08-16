export interface MataKuliahItem {
  id: string;
  nama: string;
  kode?: string;
  sks: number;
}

export interface BahanAjarItem {
  id: string;
  judul: string;
  jenis: 'Buku Ajar' | 'Diktat' | 'Modul Praktikum' | 'Petunjuk Praktikum' | 'Monograf';
  isbn?: string;
  penerbit?: string;
  tahun: string;
}

export interface BimbinganItem {
  id: string;
  nim: string;
  namaMahasiswa: string;
  judulTugasAkhir: string;
  tahun: string;
  status: 'Sedang Berjalan' | 'Lulus';
}

export interface RekognisiItem {
  id: string;
  bidangKeahlian: string;
  namaRekognisi: string;
  tingkat: 'Wilayah' | 'Nasional' | 'Internasional';
  tahun: string;
  buktiUrl?: string;
}

export interface KontribusiDosenItem {
  nidn: string;
  mataKuliahPS: MataKuliahItem[];
  mataKuliahLuar: MataKuliahItem[];
  bahanAjar: BahanAjarItem[];
  bimbinganUtamaPS: BimbinganItem[];
  bimbinganUtamaLuar: BimbinganItem[];
  bimbinganPendampingPS: BimbinganItem[];
  bimbinganPendampingLuar: BimbinganItem[];
  rekognisi: RekognisiItem[];
}

export const INITIAL_KONTRIBUSI_DOSEN_DATA: KontribusiDosenItem[] = [];

export function calculateTotalSksPS(dosen: KontribusiDosenItem): number {
  if (!dosen || !dosen.mataKuliahPS) return 0;
  return dosen.mataKuliahPS.reduce((sum, item) => sum + (Number(item.sks) || 0), 0);
}

export function calculateTotalSksLuar(dosen: KontribusiDosenItem): number {
  if (!dosen || !dosen.mataKuliahLuar) return 0;
  return dosen.mataKuliahLuar.reduce((sum, item) => sum + (Number(item.sks) || 0), 0);
}

export function calculateTotalBimbingan(dosen: KontribusiDosenItem): number {
  if (!dosen) return 0;
  return (
    (dosen.bimbinganUtamaPS?.length || 0) +
    (dosen.bimbinganUtamaLuar?.length || 0) +
    (dosen.bimbinganPendampingPS?.length || 0) +
    (dosen.bimbinganPendampingLuar?.length || 0)
  );
}

export function getDosenOverallAvgNum(dosenList: KontribusiDosenItem[]): number {
  if (!dosenList || dosenList.length === 0) return 0;
  const totalBimbingan = dosenList.reduce((sum, d) => sum + calculateTotalBimbingan(d), 0);
  return parseFloat((totalBimbingan / dosenList.length).toFixed(2));
}

export function getDosenOverallAvgStr(dosenList: KontribusiDosenItem[]): string {
  return getDosenOverallAvgNum(dosenList).toFixed(2);
}
