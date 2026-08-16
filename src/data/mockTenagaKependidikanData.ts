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

export const INITIAL_TENAGA_KEPENDIDIKAN_DATA: TenagaKependidikanItem[] = [];
