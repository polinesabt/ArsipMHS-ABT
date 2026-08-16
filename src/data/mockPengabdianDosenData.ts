export interface PKMItem {
  id: string;
  namaKegiatan: string; // 1. Nama Kegiatan PKM
  kerjasamaInstansi: string; // 2. Kerjasama Instansi/Organisasi / Mitra
  tahun?: string;
  skema?: string; // misal: 'Pemberdayaan Kemitraan Masyarakat', 'Penerapan IPTEK', 'Pengabdian Mandiri'
}

export interface KontribusiPengabdianDosenItem {
  nidn: string; // 0.1 NIDN/NIDK
  nama: string; // 0. Nama Dosen
  avatarColor: string;
  pkm: PKMItem[];
  rekognisi: string[]; // 3. Rekognisi (horizontal wrap)
}

export const INITIAL_PENGABDIAN_DOSEN_DATA: KontribusiPengabdianDosenItem[] = [];
