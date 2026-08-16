export interface PenelitianItem {
  id: string;
  judul: string;
  tahun: string;
  skema?: string;
  sumberDana?: string;
  jumlahDana?: number;
  mitraKerjasama?: string;
}

export interface KontribusiPenelitianDosenItem {
  nidn: string;
  penelitianTS2: PenelitianItem[];
  penelitianTS1: PenelitianItem[];
  penelitianTS: PenelitianItem[];
}

export const INITIAL_PENELITIAN_DOSEN_DATA: KontribusiPenelitianDosenItem[] = [];

export function calculateTotalPenelitian(dosen: KontribusiPenelitianDosenItem): number {
  if (!dosen) return 0;
  return (
    (dosen.penelitianTS2?.length || 0) +
    (dosen.penelitianTS1?.length || 0) +
    (dosen.penelitianTS?.length || 0)
  );
}

export function calculateTotalDanaPenelitian(dosen: KontribusiPenelitianDosenItem): number {
  if (!dosen) return 0;
  const all = [
    ...(dosen.penelitianTS2 || []),
    ...(dosen.penelitianTS1 || []),
    ...(dosen.penelitianTS || []),
  ];
  return all.reduce((sum, item) => sum + (Number(item.jumlahDana) || 0), 0);
}
