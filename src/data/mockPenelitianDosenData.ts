export interface PenelitianItem {
  id: string;
  judul: string;
  kerjasamaInstansi: string; // Nama instansi/organisasi kerjasama atau 'Mandiri / Internal'
  tahun?: string;
  skema?: string; // misal: 'Hibah Terapan', 'Kerjasama Industri', 'Riset Internal', 'DRTPM'
}

export interface KontribusiPenelitianDosenItem {
  nidn: string;
  nama: string;
  avatarColor: string;
  penelitian: PenelitianItem[];
  rekognisi: string[];
}

export const INITIAL_PENELITIAN_DOSEN_DATA: KontribusiPenelitianDosenItem[] = [];
