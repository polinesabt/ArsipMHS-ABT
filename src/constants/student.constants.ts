/**
 * Student Constants
 * Static configuration values for the ABT student information system
 */

import type {
  StudentStatus,
  CareerStatus,
  AchievementCategory,
  AchievementSubcategory,
  ChartDataPoint,
} from '@/types/student.types';

// ============ Program Configuration (ABT Fixed) ============

export const ABT_PROGRAM = {
  jurusan: 'Administrasi Bisnis',
  prodi: 'Administrasi Bisnis Terapan',
  fullName: 'Program Studi Administrasi Bisnis Terapan',
  shortName: 'ABT',
  department: 'Jurusan Administrasi Bisnis',
} as const;

// ============ Student Status Configuration ============

export const STUDENT_STATUS_LABELS: Record<StudentStatus, string> = {
  active: 'Aktif',
  on_leave: 'Cuti',
  dropout: 'Keluar',
  alumni: 'Alumni',
};

export const STUDENT_STATUS_COLORS: Record<StudentStatus, string> = {
  active: 'hsl(145, 65%, 42%)', // Green
  on_leave: 'hsl(38, 92%, 50%)', // Orange
  dropout: 'hsl(0, 84%, 60%)', // Red
  alumni: 'hsl(215, 80%, 45%)', // Blue
};

export const STUDENT_STATUS_CSS: Record<StudentStatus, string> = {
  active: 'status-active',
  on_leave: 'status-on-leave',
  dropout: 'status-dropout',
  alumni: 'status-alumni',
};

// ============ Career Status Configuration (Tracer Study) ============

export const CAREER_STATUS_LABELS: Record<CareerStatus, string> = {
  working: 'Bekerja',
  job_seeking: 'Mencari Kerja',
  entrepreneur: 'Wirausaha',
  further_study: 'Melanjutkan Studi',
};

export const CAREER_STATUS_COLORS: Record<CareerStatus, string> = {
  working: 'hsl(215, 80%, 45%)',
  job_seeking: 'hsl(38, 92%, 50%)',
  entrepreneur: 'hsl(145, 65%, 42%)',
  further_study: 'hsl(280, 65%, 50%)',
};

export const CAREER_STATUS_CSS: Record<CareerStatus, string> = {
  working: 'career-working',
  job_seeking: 'career-seeking',
  entrepreneur: 'career-entrepreneur',
  further_study: 'career-study',
};

/** Opsi cakupan tempat kerja (untuk statistik Cakupan Kerja): value disimpan di DB, label untuk form & chart. */
export const CAKUPAN_KERJA_OPTIONS = [
  { value: 'local', label: 'Lokal/Wilayah/ Berwirausaha tidak Berizin' },
  { value: 'national', label: 'Nasional/ Berwirausaha Berizin' },
  { value: 'multinational', label: 'Multinasional/ Internasional' },
] as const;

/** Label untuk menampilkan work_scope (local/national/multinational) di tabel & dashboard. */
export const WORK_SCOPE_LABELS: Record<string, string> = {
  local: 'Lokal/Wilayah/ Berwirausaha tidak Berizin',
  national: 'Nasional/ Berwirausaha Berizin',
  multinational: 'Multinasional/ Internasional',
};

// ============ Achievement Category Configuration ============

export const ACHIEVEMENT_CATEGORY_LABELS: Record<AchievementCategory, string> = {
  event_participation: 'Partisipasi Event',
  scientific_work: 'Karya Ilmiah',
  intellectual_property: 'Hak Kekayaan Intelektual',
  applied_academic: 'Pengalaman Akademik Terapan',
  entrepreneurship: 'Kewirausahaan',
  self_development: 'Pengembangan Diri',
};

export const ACHIEVEMENT_CATEGORY_ICONS: Record<AchievementCategory, string> = {
  event_participation: 'trophy',
  scientific_work: 'file-text',
  intellectual_property: 'shield',
  applied_academic: 'briefcase',
  entrepreneurship: 'rocket',
  self_development: 'user-plus',
};

export const ACHIEVEMENT_SUBCATEGORY_LABELS: Record<AchievementSubcategory, string> = {
  // Event participation
  seminar: 'Publikasi di Seminar',
  competition: 'Kompetisi',
  award: 'Penghargaan',
  conference: 'Konferensi',
  // Scientific works
  journal_publication: 'Publikasi Jurnal',
  proceedings: 'Prosiding',
  book_chapter: 'Bab Buku',
  research_paper: 'Karya Tulis Ilmiah',
  // Intellectual property
  patent: 'Paten',
  copyright: 'Hak Cipta',
  trademark: 'Merek Dagang',
  industrial_design: 'Desain Industri',
  // Applied academic
  internship: 'Magang',
  course_portfolio: 'Portofolio Mata Kuliah',
  entrepreneurship_course: 'Mata Kuliah Kewirausahaan',
  ecommerce_project: 'Proyek E-Commerce',
  ocai_assessment: 'Asesmen OCAI',
  // Entrepreneurship
  active_business: 'Usaha Aktif',
  past_business: 'Usaha Sebelumnya',
  // Self development
  student_exchange: 'Pertukaran Mahasiswa',
  certification: 'Sertifikasi',
  workshop: 'Workshop',
  volunteer: 'Kegiatan Sukarela',
};

export const SUBCATEGORIES_BY_CATEGORY: Record<AchievementCategory, AchievementSubcategory[]> = {
  event_participation: ['seminar', 'competition', 'award', 'conference'],
  scientific_work: ['journal_publication', 'proceedings', 'book_chapter', 'research_paper'],
  intellectual_property: ['patent', 'copyright', 'trademark', 'industrial_design'],
  applied_academic: ['internship', 'course_portfolio', 'entrepreneurship_course', 'ecommerce_project', 'ocai_assessment'],
  entrepreneurship: ['active_business', 'past_business'],
  self_development: ['student_exchange', 'certification', 'workshop', 'volunteer'],
};

// ============ Level/Tingkat Configuration ============

export const TINGKAT_OPTIONS = [
  { value: 'lokal', label: 'Lokal' },
  { value: 'regional', label: 'Regional' },
  { value: 'nasional', label: 'Nasional' },
  { value: 'internasional', label: 'Internasional' },
] as const;

// ============ Relevance Configuration ============

export const RELEVANSI_OPTIONS = [
  { value: 'sangat_relevan', label: 'Sangat Relevan', score: 5 },
  { value: 'relevan', label: 'Relevan', score: 4 },
  { value: 'cukup_relevan', label: 'Cukup Relevan', score: 3 },
  { value: 'kurang_relevan', label: 'Kurang Relevan', score: 2 },
  { value: 'tidak_relevan', label: 'Tidak Relevan', score: 1 },
] as const;

// ============ Industry Options ============

export const BIDANG_INDUSTRI_LIST = [
  'Perbankan & Keuangan',
  'Asuransi',
  'Logistik & Supply Chain',
  'Retail & E-Commerce',
  'Marketing & Digital Marketing',
  'Human Resources',
  'Konsultan Bisnis',
  'BUMN/BUMD',
  'Hospitality & Pariwisata',
  'UMKM & Koperasi',
  'Startup',
  'Ekspor-Impor',
  'Properti',
  'Kesehatan',
  'Pendidikan',
  'Lainnya',
] as const;

// ============ Year Configuration ============

export const generateYearList = (startYear: number = 2015): number[] => {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = startYear; y <= currentYear + 1; y++) {
    years.push(y);
  }
  return years;
};

export const TAHUN_MASUK_LIST = generateYearList(2015);
export const TAHUN_LULUS_LIST = generateYearList(2018);

// ============ Education Levels ============

export const JENJANG_OPTIONS = [
  { value: 'S1', label: 'Sarjana (S1)' },
  { value: 'S2', label: 'Magister (S2)' },
  { value: 'S3', label: 'Doktoral (S3)' },
] as const;

// ============ Form Configuration ============

export const PROFILE_FORM_STEPS = {
  IDENTITY: 1,
  CONTACT: 2,
  CONFIRMATION: 3,
} as const;

export const TRACER_FORM_STEPS = {
  STATUS_SELECTION: 1,
  STATUS_DETAILS: 2,
  RELEVANCE: 3,
  CONTACT: 4,
  SUMMARY: 5,
} as const;

export const ACHIEVEMENT_FORM_STEPS = {
  CATEGORY: 1,
  DETAILS: 2,
  EVIDENCE: 3,
  CONFIRMATION: 4,
} as const;

// ============ Export Configuration ============

export const STUDENT_EXPORT_HEADERS = [
  'Nama',
  'NIM',
  'Status',
  'Tahun Masuk',
  'Tahun Lulus',
  'Email',
  'No HP',
] as const;

export const TRACER_EXPORT_HEADERS = [
  'Nama',
  'NIM',
  'Status Karir',
  'Perusahaan/Usaha/Kampus',
  'Bidang',
  'Relevansi Kompetensi',
  'Email',
  'No HP',
] as const;

// ============ Chart Helpers ============

export const getCareerChartData = (stats: {
  working: number;
  jobSeeking: number;
  entrepreneur: number;
  furtherStudy: number;
}): ChartDataPoint[] => [
  { name: 'Bekerja', value: stats.working, color: CAREER_STATUS_COLORS.working },
  { name: 'Wirausaha', value: stats.entrepreneur, color: CAREER_STATUS_COLORS.entrepreneur },
  { name: 'Studi Lanjut', value: stats.furtherStudy, color: CAREER_STATUS_COLORS.further_study },
  { name: 'Mencari Kerja', value: stats.jobSeeking, color: CAREER_STATUS_COLORS.job_seeking },
];

export const getStudentStatusChartData = (stats: {
  active: number;
  onLeave: number;
  dropout: number;
  alumni: number;
}): ChartDataPoint[] => [
  { name: 'Aktif', value: stats.active, color: STUDENT_STATUS_COLORS.active },
  { name: 'Alumni', value: stats.alumni, color: STUDENT_STATUS_COLORS.alumni },
  { name: 'Cuti', value: stats.onLeave, color: STUDENT_STATUS_COLORS.on_leave },
  { name: 'Keluar', value: stats.dropout, color: STUDENT_STATUS_COLORS.dropout },
];

// ============ Validation Patterns ============

export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^(\+62|62|0)8[1-9][0-9]{6,9}$/,
  nim: /^(?=.{4,20}$)[0-9.]+$/,
  year: /^(19|20)\d{2}$/,
} as const;
