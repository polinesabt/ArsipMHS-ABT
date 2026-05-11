/**
 * Student Types
 * Core type definitions for the student-centric data model
 * 
 * ARCHITECTURE NOTE:
 * ARSIP MAHASISWA ABT is a comprehensive academic information system for ABT students.
 * StudentProfile is the central data hub - all modules attach to it.
 * 
 * Ready for Prisma schema mapping in production:
 * - StudentProfile → prisma model Student
 * - TracerStudyData → prisma model TracerStudy
 * - NonAcademicAchievement → prisma model Achievement
 */

// ============ Role Types ============

/**
 * User role for authentication
 */
export type UserRole = 'admin' | 'student';

/**
 * Admin profile for system administrators
 */
export interface AdminProfile {
  id: string;
  username: string;
  nama: string;
  passwordHash: string;
  role: 'admin';
  createdAt: Date;
  lastLogin?: Date;
}

// ============ Core Enums ============

/**
 * Student status within the academic system
 * This determines which modules are available
 */
export type StudentStatus = 'active' | 'on_leave' | 'dropout' | 'alumni';

/**
 * Student status mode (manual override vs auto-computed)
 * - manual: use stored status as-is
 * - auto: compute effective status from tahunMasuk/tahunLulus (4-year estimation)
 */
export type StudentStatusMode = 'manual' | 'auto';

/**
 * Tracer study career status (only applicable for alumni)
 */
export type CareerStatus = 'working' | 'job_seeking' | 'entrepreneur' | 'further_study';

/**
 * Education level for further study tracking
 */
export type EducationLevel = 'S1' | 'S2' | 'S3';

/**
 * Achievement categories for non-academic records
 */
export type AchievementCategory =
  | 'event_participation'
  | 'scientific_work'
  | 'intellectual_property'
  | 'applied_academic'
  | 'entrepreneurship'
  | 'self_development';

/**
 * Subcategories for detailed achievement classification
 */
export type AchievementSubcategory =
  // Event participation
  | 'seminar'
  | 'competition'
  | 'award'
  | 'conference'
  // Scientific works
  | 'journal_publication'
  | 'proceedings'
  | 'book_chapter'
  | 'research_paper'
  // Intellectual property
  | 'patent'
  | 'copyright'
  | 'trademark'
  | 'industrial_design'
  // Applied academic
  | 'internship'
  | 'course_portfolio'
  | 'entrepreneurship_course'
  | 'ecommerce_project'
  | 'ocai_assessment'
  // Entrepreneurship
  | 'active_business'
  | 'past_business'
  // Self development
  | 'student_exchange'
  | 'certification'
  | 'workshop'
  | 'volunteer';

// ============ Core Profile Types ============

/**
 * StudentProfile - The Central Data Hub
 * 
 * This is the PRIMARY identity record for every ABT student.
 * All other modules (TracerStudy, NonAcademicAchievements) attach to this.
 * 
 * Maps to: Prisma model Student
 */
export interface StudentProfile {
  id: string;
  
  // Core identity
  nama: string;
  nim: string;
  
  // Academic program (fixed: ABT)
  jurusan: 'Administrasi Bisnis'; // Department (fixed)
  prodi: 'Administrasi Bisnis Terapan'; // Study Program (ABT)
  
  // Status tracking
  status: StudentStatus;
  /** Source/mode of status calculation (manual override vs auto). */
  statusMode?: StudentStatusMode;
  /** Stored/manual status value (for admin forms & audit). */
  statusManual?: StudentStatus;
  tahunMasuk: number; // Year of enrollment
  tahunLulus?: number; // Year of graduation (only for alumni)
  
  // Contact information
  email?: string;
  loginEmail?: string;
  pendingLoginEmail?: string;
  isEmailLoginEnabled?: boolean;
  emailVerifiedAt?: Date;
  isFirstLogin?: boolean;
  noHp?: string;
  alamat?: string;
  
  // Authentication (for NIM + password login)
  passwordHash?: string; // Hashed password (demo: simple hash)
  hasCredentials: boolean; // Has login account created by admin
  lastLogin?: Date; // Last login timestamp
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input type for creating student account by admin
 */
export interface StudentAccountInput {
  nim: string;
  nama: string;
  password: string;
  email?: string;
  noHp?: string;
  status: StudentStatus;
  statusMode?: StudentStatusMode;
  tahunMasuk: number;
  tahunLulus?: number;
}

/**
 * Input type for creating/updating student profiles
 */
export type StudentProfileInput = Omit<StudentProfile, 'id' | 'createdAt' | 'updatedAt'>;

// ============ Tracer Study Types (Alumni Only) ============

/**
 * Base contact info for tracer study responses
 */
export interface TracerContactInfo {
  email: string;
  noHp: string;
  mediaSosial?: string;
  linkedin?: string;
}

/**
 * Employment data for "working" status
 */
export interface EmploymentData {
  namaPerusahaan: string;
  lokasiPerusahaan: string;
  bidangIndustri: string;
  jabatan: string;
  tahunMulaiKerja: number;
  relevansiKompetensi?: 'sangat_relevan' | 'relevan' | 'cukup_relevan' | 'kurang_relevan' | 'tidak_relevan';
  kontakProfesional?: string;
}

/**
 * Job seeking data for "job_seeking" status
 */
export interface JobSeekingData {
  lokasiTujuan: string;
  bidangDiincar: string;
  lamaMencari: number; // months
}

/**
 * Entrepreneurship data for "entrepreneur" status
 */
export interface EntrepreneurshipData {
  namaUsaha: string;
  jenisUsaha: string;
  lokasiUsaha: string;
  tahunMulaiUsaha: number;
  punyaKaryawan: boolean;
  jumlahKaryawan?: number;
  usahaAktif: boolean;
  relevansiKompetensi?: 'sangat_relevan' | 'relevan' | 'cukup_relevan' | 'kurang_relevan' | 'tidak_relevan';
  sosialMediaUsaha?: string[];
}

/**
 * Further study data for "further_study" status
 */
export interface FurtherStudyData {
  namaKampus: string;
  programStudi: string;
  jenjang: EducationLevel;
  lokasiKampus: string;
  tahunMulaiStudi: number;
  relevansiKompetensi?: 'sangat_relevan' | 'relevan' | 'cukup_relevan' | 'kurang_relevan' | 'tidak_relevan';
}

/**
 * TracerStudyData - Alumni Career Tracking Module
 * 
 * CONDITIONAL: Only available for students with status = 'alumni'
 * Must be linked to a StudentProfile
 * 
 * Maps to: Prisma model TracerStudy
 */
export interface TracerStudyData extends TracerContactInfo {
  id: string;
  studentId: string; // FK to StudentProfile
  
  careerStatus: CareerStatus;
  tahunPengisian: number;
  
  // Status-specific data (polymorphic - only one populated based on careerStatus)
  employmentData?: EmploymentData;
  jobSeekingData?: JobSeekingData;
  entrepreneurshipData?: EntrepreneurshipData;
  furtherStudyData?: FurtherStudyData;
  
  // Career summary (short structured narrative)
  ringkasanKarir?: string;
  
  // Additional
  bersediaDihubungi: boolean;
  saranKomentar?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input type for tracer study submission
 */
export type TracerStudyInput = Omit<TracerStudyData, 'id' | 'createdAt' | 'updatedAt'>;

// ============ Non-Academic Achievement Types ============

/**
 * NonAcademicAchievement - Flexible Achievement Module
 * 
 * Available for ALL student statuses (active, on_leave, alumni)
 * Permanent record attached to StudentProfile
 * 
 * Maps to: Prisma model Achievement
 */
export interface NonAcademicAchievement {
  id: string;
  studentId: string; // FK to StudentProfile
  
  // Classification
  category: AchievementCategory;
  subcategory: AchievementSubcategory;
  
  // Details
  title: string;
  description?: string;
  tanggal: Date;
  lokasi?: string;
  penyelenggara?: string; // Organizer
  
  // Evidence
  dokumentasi?: string[]; // URLs to uploaded files
  sertifikatUrl?: string;
  
  // Recognition
  tingkat?: 'lokal' | 'regional' | 'nasional' | 'internasional';
  peringkat?: string; // e.g., "Juara 1", "Finalist"
  
  // Metadata
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input type for achievement submission
 */
export type AchievementInput = Omit<NonAcademicAchievement, 'id' | 'createdAt' | 'updatedAt' | 'verified'>;

// ============ Merged/View Types ============

/**
 * Complete student view with all attached modules
 * Used for dashboards and reports
 */
export interface StudentCompleteView extends StudentProfile {
  tracerStudy?: TracerStudyData;
  achievements: NonAcademicAchievement[];
}

/**
 * Summary view for lists and tables
 */
export interface StudentSummaryView {
  id: string;
  nama: string;
  nim: string;
  status: StudentStatus;
  tahunMasuk: number;
  tahunLulus?: number;
  hasTracerStudy: boolean;
  achievementCount: number;
  careerStatus?: CareerStatus;
}

// ============ Filter Types ============

/**
 * Filter criteria for student queries
 */
export interface StudentFilterCriteria {
  searchQuery?: string;
  status?: StudentStatus | 'all';
  tahunMasuk?: number | 'all';
  tahunLulus?: number | 'all';
  careerStatus?: CareerStatus | 'all';
}

/**
 * Filter criteria for achievement queries
 */
export interface AchievementFilterCriteria {
  studentId?: string;
  category?: AchievementCategory | 'all';
  subcategory?: AchievementSubcategory | 'all';
  tahun?: number | 'all';
  tingkat?: string | 'all';
  verified?: boolean;
}

// ============ Statistics Types ============

/**
 * Student statistics aggregation
 */
export interface StudentStatistics {
  total: number;
  active: number;
  onLeave: number;
  dropout: number;
  alumni: number;
}

/**
 * Tracer study statistics (alumni only)
 */
export interface TracerStatistics {
  totalAlumni: number;
  responded: number;
  responseRate: number;
  working: number;
  jobSeeking: number;
  entrepreneur: number;
  furtherStudy: number;
}

/**
 * Achievement statistics
 */
export interface AchievementStatistics {
  total: number;
  byCategory: Record<AchievementCategory, number>;
  byTingkat: Record<string, number>;
  verified: number;
  pending: number;
}

/**
 * Chart data for visualizations
 */
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

/**
 * Trend data for year-over-year analysis
 */
export interface TrendData {
  year: string;
  [key: string]: string | number;
}
