export interface PengabdianItem {
  id: string;
  judul: string;
  tahun: string;
  skema?: string;
  sumberDana?: string;
  jumlahDana?: number;
  mitra?: string;
}

export interface KontribusiPengabdianDosenItem {
  nidn: string;
  pengabdianTS2: PengabdianItem[];
  pengabdianTS1: PengabdianItem[];
  pengabdianTS: PengabdianItem[];
}

export const INITIAL_PENGABDIAN_DOSEN_DATA: KontribusiPengabdianDosenItem[] = [];

export function calculateTotalPengabdian(dosen: KontribusiPengabdianDosenItem): number {
  if (!dosen) return 0;
  return (
    (dosen.pengabdianTS2?.length || 0) +
    (dosen.pengabdianTS1?.length || 0) +
    (dosen.pengabdianTS?.length || 0)
  );
}

export function calculateTotalDanaPengabdian(dosen: KontribusiPengabdianDosenItem): number {
  if (!dosen) return 0;
  const all = [
    ...(dosen.pengabdianTS2 || []),
    ...(dosen.pengabdianTS1 || []),
    ...(dosen.pengabdianTS || []),
  ];
  return all.reduce((sum, item) => sum + (Number(item.jumlahDana) || 0), 0);
}
