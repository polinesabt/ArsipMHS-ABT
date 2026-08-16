export interface DosenItem {
  id: string;
  nama: string;
  nidn: string;
  nip?: string;
  gelarDepan?: string;
  gelarBelakang?: string;
  status: 'Tetap' | 'Tidak Tetap';
  statusAktif?: 'Aktif' | 'Tugas Belajar' | 'Izin Belajar' | 'Cuti';
  jabatan: 'Asisten Ahli' | 'Lektor' | 'Lektor Kepala' | 'Guru Besar' | 'Tenaga Pendidik';
  institusi: string;
  pendidikanPascaSarjana?: string[];
  bidangKeahlian: string[];
  kompetensi?: string[];
  kesesuaianKomp?: 'Sesuai' | 'Kurang Sesuai' | 'Tidak Sesuai';
  kesesuaianProdi?: boolean;
}

export const INITIAL_DOSEN_DATA: DosenItem[] = [];
