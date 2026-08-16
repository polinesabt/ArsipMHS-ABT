export interface DosenItem {
  nidn: string;
  nama: string;
  statusDosen: 'Tetap' | 'Tidak Tetap';
  jabatan: string;
  peran: 'Akademisi' | 'Praktisi';
  institusi: string;
  pendidikanPascaSarjana: string[];
  bidangKeahlian: string;
  sertifikatPendidik: string;
  sertifikatKompetensi: string;
  email: string;
  telepon: string;
  pengajaran: number;
  penelitian: number;
  pengabdian: number;
}

export const INITIAL_DOSEN_DATA: DosenItem[] = [];
