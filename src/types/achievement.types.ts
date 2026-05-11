// Achievement Types for Non-Academic Achievements Module

export type AchievementCategory = 
  | 'lomba'         // Lomba / Kompetisi
  | 'seminar'       // Publikasi di Seminar
  | 'pagelaran'     // Pagelaran / Presentasi
  | 'publikasi'     // Karya Ilmiah & Publikasi
  | 'haki'          // Kekayaan Intelektual
  | 'luaran_penelitian' // Luaran Penelitian
  | 'magang'        // Pengalaman Magang
  | 'portofolio'    // Portofolio Praktikum Kelas
  | 'produk_mahasiswa' // Produk Mahasiswa (non-akademik)
  | 'wirausaha'     // Pengalaman Wirausaha
  | 'pengembangan'  // Program Pengembangan Diri
  | 'organisasi';   // Organisasi & Kepemimpinan

export type AchievementType = 'academic' | 'non_academic';

export interface BaseAchievement {
  id: string;
  masterId: string; // Reference to student profile
  category: AchievementCategory;
  achievementType?: AchievementType;
  createdAt: string;
  updatedAt: string;
  // Featured achievement flag
  isUnggulan?: boolean;
  // File attachments
  attachments?: AchievementAttachment[];
}

export interface AchievementAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string; // Local object URL / fetched blob URL for private attachment access
  uploadedAt: string;
  file?: File; // Newly selected file before persisted to backend
  isPersisted?: boolean; // True when already stored in backend
  attachmentId?: string; // Optional alias for backend attachment id
}

// Lomba / Kompetisi
export interface LombaAchievement extends BaseAchievement {
  category: 'lomba';
  namaLomba: string;
  penyelenggara: string;
  tingkat: 'lokal' | 'regional' | 'nasional' | 'internasional';
  peran: 'peserta' | 'juara';
  peringkat?: string; // e.g., Juara 1, Finalis
  bidang?: string;
  tahun: number;
  deskripsi?: string;
}

// Publikasi di Seminar
export interface SeminarAchievement extends BaseAchievement {
  category: 'seminar';
  judulPublikasi: string;
  levelSeminar: 'local' | 'national' | 'international';
  jenisPerolehan: 'mandiri' | 'kolaborasi_dosen';
  tanggalPublikasi: string;
  namaDosen?: string;
  penulis?: string;
  namaSeminarKonferensi?: string;
  penyelenggara?: string;
  urlPublikasi?: string;
  tahun: number;
  deskripsi?: string;
}

// Pagelaran / Presentasi
export interface PagelaranAchievement extends BaseAchievement {
  category: 'pagelaran';
  jenisKegiatan:
    | 'conference'
    | 'presentasi'
    | 'presentation'
    | 'oral_presentation'
    | 'poster_presentation'
    | 'expo'
    | 'exhibition'
    | 'pameran'
    | 'pagelaran';
  judulPublikasi: string;
  levelSeminar: 'local' | 'national' | 'international';
  jenisPerolehan: 'mandiri' | 'kolaborasi_dosen';
  tanggalPublikasi: string;
  namaDosen?: string;
  penulis?: string;
  namaSeminarKonferensi?: string;
  penyelenggara?: string;
  urlPublikasi?: string;
  tahun: number;
  deskripsi?: string;
}

// Karya Ilmiah & Publikasi
export interface PublikasiAchievement extends BaseAchievement {
  category: 'publikasi';
  jenisPublikasi: 'artikel_jurnal' | 'prosiding' | 'buku' | 'book_chapter' | 'lainnya';
  levelJurnal?: 'national_non_accredited' | 'national_accredited' | 'international' | 'reputable_international';
  jenisPerolehan?: 'mandiri' | 'kolaborasi_dosen';
  namaDosen?: string;
  judul: string;
  penulis: string; // Comma separated
  peranPenulis?: string;
  penerbit?: string;
  namaJurnal?: string;
  volume?: string;
  halaman?: string;
  doi?: string;
  tahun: number;
  url?: string;
  deskripsi?: string;
}

// Kekayaan Intelektual (HAKI)
export interface HakiAchievement extends BaseAchievement {
  category: 'haki';
  jenisHaki: 'hak_cipta' | 'paten' | 'merek' | 'desain_industri' | 'rahasia_dagang';
  judul: string;
  nomorPendaftaran?: string;
  nomorSertifikat?: string;
  status: 'terdaftar' | 'granted' | 'pending' | 'ditolak';
  tahunPengajuan: number;
  tahunTerbit?: number;
  pemegang: string;
  deskripsi?: string;
}

export type ResearchOutputSubtype =
  | 'trademark'
  | 'patent'
  | 'simple_patent'
  | 'industrial_design'
  | 'copyright'
  | 'geographical_indication'
  | 'trade_secret'
  | 'circuit_layout'
  | 'software_development'
  | 'technology_product'
  | 'standardized_product'
  | 'certified_product'
  | 'social_engineering'
  | 'consulting_mentoring'
  | 'isbn_book'
  | 'book_chapter';

export const RESEARCH_OUTPUT_SUBTYPE_LABELS: Record<ResearchOutputSubtype, string> = {
  trademark: 'Merek',
  patent: 'Paten',
  simple_patent: 'Paten Sederhana',
  industrial_design: 'Desain Industri',
  copyright: 'Hak Cipta',
  geographical_indication: 'Indikasi Geografis',
  trade_secret: 'Rahasia Dagang',
  circuit_layout: 'Desain Tata Letak Sirkuit Terpadu',
  software_development: 'Pengembangan Software',
  technology_product: 'Produk Teknologi Tepat Guna',
  standardized_product: 'Produk Terstandarisasi',
  certified_product: 'Produk Tersertifikasi',
  social_engineering: 'Rekayasa Sosial',
  consulting_mentoring: 'Konsultasi/Pendampingan',
  isbn_book: 'Buku ber-ISBN',
  book_chapter: 'Book Chapter',
};

export const RESEARCH_OUTPUT_HAKI_SUBTYPES: ResearchOutputSubtype[] = [
  'trademark',
  'patent',
  'simple_patent',
  'industrial_design',
  'copyright',
  'geographical_indication',
  'trade_secret',
  'circuit_layout',
];

export const RESEARCH_OUTPUT_TECHNOLOGY_SUBTYPES: ResearchOutputSubtype[] = [
  'software_development',
  'technology_product',
  'standardized_product',
  'certified_product',
  'social_engineering',
  'consulting_mentoring',
];

export const RESEARCH_OUTPUT_BOOK_SUBTYPES: ResearchOutputSubtype[] = [
  'isbn_book',
  'book_chapter',
];

export interface LuaranPenelitianAchievement extends BaseAchievement {
  category: 'luaran_penelitian';
  jenisLuaran: ResearchOutputSubtype;
  judul: string;
  jenisPerolehan: 'mandiri' | 'kolaborasi_dosen';
  namaDosen?: string;
  urlPublikasi?: string;
  tanggalLuaran: string;
  tahun: number;
  deskripsi?: string;
}

// Pengalaman Magang
export interface MagangAchievement extends BaseAchievement {
  category: 'magang';
  namaPerusahaan: string;
  posisi: string;
  lokasi: string;
  industri: string;
  tanggalMulai: string;
  tanggalSelesai?: string;
  sedangBerjalan: boolean;
  deskripsiTugas?: string;
  skillDiperoleh?: string[];
}

// Portofolio Praktikum Kelas
export interface PortofolioAchievement extends BaseAchievement {
  category: 'portofolio';
  mataKuliah: 'kwu' | 'ecommerce' | 'msdm_ocai' | 'other';
  mataKuliahCustom?: string; // Only used when mataKuliah === 'other'
  judulProyek: string;
  deskripsiProyek: string;
  output?: string; // link / dokumen / video
  tahun: number;
  semester: 'ganjil' | 'genap';
  nilai?: string;
  urlProyek?: string;
}

export type StudentProductCategory =
  | 'makanan_minuman'
  | 'fashion_lifestyle'
  | 'teknologi_bisnis'
  | 'pendidikan'
  | 'investasi_keuangan'
  | 'transportasi_logistik'
  | 'pariwisata'
  | 'jasa_profesional'
  | 'layanan_digital'
  | 'waralaba'
  | 'bisnis_hijau';

export const STUDENT_PRODUCT_CATEGORY_LABELS: Record<StudentProductCategory, string> = {
  makanan_minuman: 'Makanan & Minuman',
  fashion_lifestyle: 'Fashion & Lifestyle',
  teknologi_bisnis: 'Teknologi Bisnis Terapan',
  pendidikan: 'Pendidikan',
  investasi_keuangan: 'Investasi & Keuangan',
  transportasi_logistik: 'Transportasi & Logistik',
  pariwisata: 'Pariwisata',
  jasa_profesional: 'Jasa Profesional',
  layanan_digital: 'Layanan Digital',
  waralaba: 'Waralaba',
  bisnis_hijau: 'Bisnis Hijau',
};

export const STUDENT_PRODUCT_CATEGORIES: StudentProductCategory[] = [
  'makanan_minuman',
  'fashion_lifestyle',
  'teknologi_bisnis',
  'pendidikan',
  'investasi_keuangan',
  'transportasi_logistik',
  'pariwisata',
  'jasa_profesional',
  'layanan_digital',
  'waralaba',
  'bisnis_hijau',
];

export interface ProdukMahasiswaAchievement extends BaseAchievement {
  category: 'produk_mahasiswa';
  namaProduk: string;
  kategoriProduk: StudentProductCategory;
  tanggalAdopsi: string;
  linkProduk?: string;
  lokasi?: string;
  mitraAdopsi?: string;
  tingkat?: 'lokal' | 'regional' | 'nasional' | 'internasional';
  deskripsi?: string;
}

// Pengalaman Wirausaha
export interface WirausahaAchievement extends BaseAchievement {
  category: 'wirausaha';
  namaUsaha: string;
  jenisUsaha: string;
  peran?: string;
  deskripsiUsaha: string;
  tahunMulai: number;
  masihAktif: boolean;
  tahunSelesai?: number;
  jumlahKaryawan?: number;
  omzetPerBulan?: string;
  lokasi: string;
  sosialMedia?: string[];
}

// Program Pengembangan Diri
export interface PengembanganAchievement extends BaseAchievement {
  category: 'pengembangan';
  jenisProgram: 'pertukaran_mahasiswa' | 'beasiswa' | 'volunteer' | 'pelatihan' | 'lainnya';
  namaProgram: string;
  penyelenggara: string;
  peranMahasiswa?: string;
  lokasi?: string;
  negara?: string;
  tanggalMulai: string;
  tanggalSelesai?: string;
  sedangBerjalan: boolean;
  output?: string;
  deskripsi?: string;
}

// Organisasi & Kepemimpinan
export interface OrganisasiAchievement extends BaseAchievement {
  category: 'organisasi';
  namaOrganisasi: string;
  jenisOrganisasi: 'kampus' | 'luar_kampus'; // Organization scope
  jabatan: string;
  tanggalMulai: string; // Start date (always required)
  tanggalSelesai?: string; // End date (null if still active)
  masihAktif: boolean; // Membership status toggle
  deskripsi?: string;
}

// Union type for all achievements
export type Achievement = 
  | LombaAchievement
  | SeminarAchievement
  | PagelaranAchievement
  | PublikasiAchievement
  | HakiAchievement
  | LuaranPenelitianAchievement
  | MagangAchievement
  | PortofolioAchievement
  | ProdukMahasiswaAchievement
  | WirausahaAchievement
  | PengembanganAchievement
  | OrganisasiAchievement;

// Category metadata for UI
export const ACHIEVEMENT_CATEGORIES: Record<AchievementCategory, { label: string; icon: string; color: string }> = {
  lomba: { label: 'Lomba', icon: 'Trophy', color: 'text-warning' },
  seminar: { label: 'Publikasi di Seminar', icon: 'Mic', color: 'text-purple-500' },
  pagelaran: { label: 'Pagelaran / Presentasi', icon: 'Presentation', color: 'text-fuchsia-500' },
  publikasi: { label: 'Karya Ilmiah & Publikasi', icon: 'BookOpen', color: 'text-primary' },
  haki: { label: 'Kekayaan Intelektual', icon: 'Shield', color: 'text-success' },
  luaran_penelitian: { label: 'Luaran Penelitian', icon: 'FlaskConical', color: 'text-indigo-500' },
  magang: { label: 'Pengalaman Magang', icon: 'Briefcase', color: 'text-info' },
  portofolio: { label: 'Portofolio Praktikum Kelas', icon: 'FolderOpen', color: 'text-orange-500' },
  produk_mahasiswa: { label: 'Produk Mahasiswa', icon: 'Package', color: 'text-cyan-500' },
  wirausaha: { label: 'Pengalaman Wirausaha', icon: 'Rocket', color: 'text-destructive' },
  pengembangan: { label: 'Program Pengembangan Diri', icon: 'Sprout', color: 'text-emerald-500' },
  organisasi: { label: 'Organisasi & Kepemimpinan', icon: 'Users', color: 'text-sky-500' },
};

export type AchievementImportCategory =
  | 'publikasi'
  | 'portofolio'
  | 'lomba'
  | 'kekayaan_intelektual'
  | 'research_output_hki'
  | 'research_output_technology'
  | 'research_output_books'
  | 'magang'
  | 'produk_mahasiswa'
  | 'wirausaha'
  | 'pengembangan_diri'
  | 'organisasi'
  | 'seminar';

export interface AchievementImportSummary {
  import_log_id: string;
  kategori: AchievementImportCategory;
  total_rows: number;
  valid_rows: number;
  empty_rows: number;
  error_rows: number;
  duplicate_rows: number;
  success_rows: number;
  affected_students: number;
}

export interface AchievementImportRowError {
  id: string;
  row_number: number;
  nim_raw?: string | null;
  status: 'error' | 'duplicate' | 'skipped_empty' | 'inserted';
  message?: string | null;
  raw_payload_json?: unknown;
  created_at?: string;
}

export interface AchievementImportLog {
  id: string;
  module: string;
  kategori: AchievementImportCategory;
  uploaded_by: string;
  file_name?: string | null;
  total_rows: number;
  valid_rows: number;
  success_rows: number;
  failed_rows: number;
  duplicate_rows: number;
  empty_rows: number;
  affected_students: number;
  status: 'processing' | 'completed' | 'failed';
  created_at: string;
  finished_at?: string | null;
}
