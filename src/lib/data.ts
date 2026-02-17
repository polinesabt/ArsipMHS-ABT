// Master data alumni untuk validasi
export interface AlumniMaster {
  id: string;
  nama: string;
  nim: string;
  jurusan: string;
  prodi: string;
  tahunLulus: number;
}

// Kosong – data dari database saja
export const alumniMasterData: AlumniMaster[] = [];

// Data alumni yang sudah mengisi form
export interface AlumniData {
  id: string;
  alumniMasterId: string;
  status: 'bekerja' | 'mencari' | 'wirausaha' | 'studi';
  tahunPengisian: number;
  namaPerusahaan?: string;
  lokasiPerusahaan?: string;
  bidangIndustri?: string;
  jabatan?: string;
  tahunMulaiKerja?: number;
  tahunSelesaiKerja?: number;
  masihAktifKerja?: boolean;
  kontakProfesional?: string;
  lokasiTujuan?: string;
  bidangDiincar?: string;
  lamaMencari?: number;
  namaUsaha?: string;
  jenisUsaha?: string;
  lokasiUsaha?: string;
  tahunMulaiUsaha?: number;
  punyaKaryawan?: boolean;
  jumlahKaryawan?: number;
  usahaAktif?: boolean;
  sosialMediaUsaha?: string[];
  namaKampus?: string;
  programStudi?: string;
  jenjang?: 'S1' | 'S2' | 'S3';
  lokasiKampus?: string;
  tahunMulaiStudi?: number;
  tahunSelesaiStudi?: number;
  masihAktifStudi?: boolean;
  email: string;
  noHp: string;
  mediaSosial?: string;
  linkedin?: string;
  bersediaDihubungi?: boolean;
  saranKomentar?: string;
  createdAt: Date;
}

export const alumniFilledData: AlumniData[] = [];

export const jurusanList = [
  "Teknik Elektro",
  "Teknik Mesin",
  "Teknik Sipil",
  "Akuntansi",
  "Administrasi Bisnis",
];

export const prodiList: Record<string, string[]> = {
  "Teknik Elektro": ["D3 Teknik Elektronika", "D3 Teknik Telekomunikasi", "D3 Teknik Komputer", "D4 Teknik Elektronika"],
  "Teknik Mesin": ["D3 Teknik Mesin", "D4 Teknik Mesin Produksi"],
  "Teknik Sipil": ["D3 Teknik Konstruksi Gedung", "D4 Teknik Perancangan Jalan"],
  "Akuntansi": ["D3 Akuntansi", "D4 Akuntansi Manajerial"],
  "Administrasi Bisnis": ["D3 Administrasi Bisnis", "D4 Manajemen Bisnis"],
};

export const tahunLulusList = [2019, 2020, 2021, 2022, 2023, 2024, 2025];

/** Tahun masuk untuk filter (range 2015–2030) */
export const tahunMasukList = Array.from({ length: 16 }, (_, i) => 2015 + i);

export const bidangIndustriList = [
  "Telekomunikasi",
  "Manufaktur",
  "Manufaktur Otomotif",
  "Konstruksi",
  "Perbankan & Keuangan",
  "IT & Software",
  "E-Commerce",
  "Heavy Equipment",
  "BUMN",
  "Startup",
  "Lainnya",
];
