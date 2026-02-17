/**
 * Student Service
 * Business logic layer for student-centric operations
 * 
 * ARCHITECTURE NOTE:
 * This service contains business logic and orchestrates repository calls.
 * It should NOT contain UI logic or direct data store access; data via API only (URL dari .env).
 * 
 * ISOLATION: Framework-specific implementation patterns.
 * Service interface remains stable for migration.
 */

import type {
  StudentProfile,
  StudentProfileInput,
  TracerStudyData,
  TracerStudyInput,
  NonAcademicAchievement,
  AchievementInput,
  StudentCompleteView,
  StudentSummaryView,
  StudentFilterCriteria,
  AchievementFilterCriteria,
  StudentStatistics,
  TracerStatistics,
  AchievementStatistics,
  ChartDataPoint,
  TrendData,
  CareerStatus,
  AchievementCategory,
} from '@/types/student.types';
import * as studentRepository from '@/repositories/student.repository';
import {
  CAREER_STATUS_LABELS,
  CAREER_STATUS_COLORS,
  ACHIEVEMENT_CATEGORY_LABELS,
} from '@/constants/student.constants';
import { deleteAchievementsByStudentId } from '@/services/achievement.service';
import { hashPassword } from '@/services/auth.service';

// ============ Student Profile Operations ============

/**
 * Get all students
 */
export const getAllStudents = async (): Promise<StudentProfile[]> => {
  return studentRepository.getAllStudents();
};

/**
 * Get student by ID
 */
export const getStudentById = async (id: string): Promise<StudentProfile | null> => {
  return studentRepository.getStudentById(id);
};

/**
 * Get student by NIM
 */
export const getStudentByNim = async (nim: string): Promise<StudentProfile | null> => {
  return studentRepository.getStudentByNim(nim);
};

/**
 * Validate student identity
 * Returns student if found and matches criteria
 */
export const validateStudent = async (
  nama: string,
  tahunMasuk: number
): Promise<StudentProfile | null> => {
  const results = await studentRepository.searchStudents(nama, tahunMasuk);
  // Return first exact match or null
  const exactMatch = results.find(
    (s) => s.nama.toLowerCase() === nama.toLowerCase().trim()
  );
  return exactMatch ?? results[0] ?? null;
};

/**
 * Get filtered students
 */
export const getFilteredStudents = async (
  criteria: StudentFilterCriteria
): Promise<StudentProfile[]> => {
  return studentRepository.getFilteredStudents(criteria);
};

/**
 * Get alumni only
 */
export const getAlumni = async (): Promise<StudentProfile[]> => {
  return studentRepository.getAlumni();
};

/**
 * Create or update student profile
 */
export const saveStudentProfile = async (
  data: StudentProfileInput,
  existingId?: string
): Promise<StudentProfile> => {
  if (existingId) {
    const updated = await studentRepository.updateStudent(existingId, data);
    if (!updated) throw new Error('Student not found');
    return updated;
  }
  return studentRepository.createStudent(data);
};

// ============ Tracer Study Operations ============

/**
 * Check if student is eligible for tracer study
 */
export const isEligibleForTracerStudy = async (studentId: string): Promise<boolean> => {
  const student = await studentRepository.getStudentById(studentId);
  return student?.status === 'alumni';
};

/**
 * Get tracer study for student
 */
export const getTracerStudy = async (studentId: string): Promise<TracerStudyData | null> => {
  return studentRepository.getTracerByStudentId(studentId);
};

/**
 * Submit tracer study
 * Validates alumni status before submission
 */
export const submitTracerStudy = async (
  data: TracerStudyInput
): Promise<TracerStudyData> => {
  const isEligible = await isEligibleForTracerStudy(data.studentId);
  if (!isEligible) {
    throw new Error('Only alumni can submit tracer study');
  }
  return studentRepository.createTracerStudy(data);
};

/**
 * Update tracer study
 */
export const updateTracerStudy = async (
  id: string,
  data: Partial<TracerStudyInput>
): Promise<TracerStudyData | null> => {
  return studentRepository.updateTracerStudy(id, data);
};

// ============ Achievement Operations ============

/**
 * Get achievements for student
 */
export const getStudentAchievements = async (
  studentId: string
): Promise<NonAcademicAchievement[]> => {
  return studentRepository.getAchievementsByStudentId(studentId);
};

/**
 * Get filtered achievements
 */
export const getFilteredAchievements = async (
  criteria: AchievementFilterCriteria
): Promise<NonAcademicAchievement[]> => {
  return studentRepository.getFilteredAchievements(criteria);
};

/**
 * Submit new achievement
 */
export const submitAchievement = async (
  data: AchievementInput
): Promise<NonAcademicAchievement> => {
  // Validate student exists
  const student = await studentRepository.getStudentById(data.studentId);
  if (!student) {
    throw new Error('Student not found');
  }
  return studentRepository.createAchievement(data);
};

/**
 * Verify achievement (admin action)
 */
export const verifyAchievement = async (
  id: string,
  verified: boolean
): Promise<NonAcademicAchievement | null> => {
  return studentRepository.updateAchievement(id, { verified });
};

// ============ Composite Operations ============

/**
 * Get complete student view
 */
export const getStudentComplete = async (
  studentId: string
): Promise<StudentCompleteView | null> => {
  return studentRepository.getStudentCompleteView(studentId);
};

/**
 * Get student summaries for listing
 */
export const getStudentSummaries = async (): Promise<StudentSummaryView[]> => {
  return studentRepository.getStudentSummaries();
};

// ============ Statistics Operations ============

/**
 * Calculate student statistics
 */
export const calculateStudentStatistics = async (): Promise<StudentStatistics> => {
  const students = await studentRepository.getAllStudents();
  
  return {
    total: students.length,
    active: students.filter((s) => s.status === 'active').length,
    onLeave: students.filter((s) => s.status === 'on_leave').length,
    dropout: students.filter((s) => s.status === 'dropout').length,
    alumni: students.filter((s) => s.status === 'alumni').length,
  };
};

/**
 * Calculate tracer study statistics
 */
export const calculateTracerStatistics = async (): Promise<TracerStatistics> => {
  const [students, tracers] = await Promise.all([
    studentRepository.getAllStudents(),
    studentRepository.getAllTracerStudies(),
  ]);
  
  const alumni = students.filter((s) => s.status === 'alumni');
  const responded = tracers.length;
  
  return {
    totalAlumni: alumni.length,
    responded,
    responseRate: alumni.length > 0 ? (responded / alumni.length) * 100 : 0,
    working: tracers.filter((t) => t.careerStatus === 'working').length,
    jobSeeking: tracers.filter((t) => t.careerStatus === 'job_seeking').length,
    entrepreneur: tracers.filter((t) => t.careerStatus === 'entrepreneur').length,
    furtherStudy: tracers.filter((t) => t.careerStatus === 'further_study').length,
  };
};

/**
 * Calculate achievement statistics
 */
export const calculateAchievementStatistics = async (): Promise<AchievementStatistics> => {
  const achievements = await studentRepository.getAllAchievements();
  
  const byCategory: Record<AchievementCategory, number> = {
    event_participation: 0,
    scientific_work: 0,
    intellectual_property: 0,
    applied_academic: 0,
    entrepreneurship: 0,
    self_development: 0,
  };
  
  const byTingkat: Record<string, number> = {
    lokal: 0,
    regional: 0,
    nasional: 0,
    internasional: 0,
  };
  
  achievements.forEach((a) => {
    byCategory[a.category]++;
    if (a.tingkat) byTingkat[a.tingkat]++;
  });
  
  return {
    total: achievements.length,
    byCategory,
    byTingkat,
    verified: achievements.filter((a) => a.verified).length,
    pending: achievements.filter((a) => !a.verified).length,
  };
};

// ============ Chart Data Generation ============

/**
 * Get career status chart data
 */
export const getCareerChartData = async (): Promise<ChartDataPoint[]> => {
  const stats = await calculateTracerStatistics();
  
  return [
    { name: CAREER_STATUS_LABELS.working, value: stats.working, color: CAREER_STATUS_COLORS.working },
    { name: CAREER_STATUS_LABELS.entrepreneur, value: stats.entrepreneur, color: CAREER_STATUS_COLORS.entrepreneur },
    { name: CAREER_STATUS_LABELS.further_study, value: stats.furtherStudy, color: CAREER_STATUS_COLORS.further_study },
    { name: CAREER_STATUS_LABELS.job_seeking, value: stats.jobSeeking, color: CAREER_STATUS_COLORS.job_seeking },
  ];
};

/**
 * Get industry distribution chart data
 */
export const getIndustryDistribution = async (): Promise<ChartDataPoint[]> => {
  const tracers = await studentRepository.getAllTracerStudies();
  const workingTracers = tracers.filter((t) => t.careerStatus === 'working' && t.employmentData);
  
  const counts: Record<string, number> = {};
  workingTracers.forEach((t) => {
    const industry = t.employmentData?.bidangIndustri;
    if (industry) {
      counts[industry] = (counts[industry] || 0) + 1;
    }
  });
  
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
};

/**
 * Get achievement category chart data
 */
export const getAchievementCategoryData = async (): Promise<ChartDataPoint[]> => {
  const stats = await calculateAchievementStatistics();
  
  return Object.entries(stats.byCategory)
    .filter(([, value]) => value > 0)
    .map(([category, value]) => ({
      name: ACHIEVEMENT_CATEGORY_LABELS[category as AchievementCategory],
      value,
    }))
    .sort((a, b) => b.value - a.value);
};

/**
 * Get year trend data
 */
export const getYearTrendData = async (): Promise<TrendData[]> => {
  const [students, tracers] = await Promise.all([
    studentRepository.getAllStudents(),
    studentRepository.getAllTracerStudies(),
  ]);
  
  const years = [2020, 2021, 2022, 2023, 2024];
  
  return years.map((year) => {
    const yearTracers = tracers.filter((t) => {
      const student = students.find((s) => s.id === t.studentId);
      return student?.tahunLulus === year;
    });
    
    return {
      year: year.toString(),
      bekerja: yearTracers.filter((t) => t.careerStatus === 'working').length,
      wirausaha: yearTracers.filter((t) => t.careerStatus === 'entrepreneur').length,
      studi: yearTracers.filter((t) => t.careerStatus === 'further_study').length,
    };
  });
};

// ============ Export Operations ============

/**
 * Generate CSV content for student export
 */
export const generateStudentCSV = async (
  criteria?: StudentFilterCriteria
): Promise<string> => {
  const students = criteria
    ? await getFilteredStudents(criteria)
    : await getAllStudents();
  
  const headers = ['Nama', 'NIM', 'Status', 'Tahun Masuk', 'Tahun Lulus', 'Email', 'No HP'];
  const rows = students.map((s) => [
    s.nama,
    s.nim,
    s.status,
    s.tahunMasuk.toString(),
    s.tahunLulus?.toString() ?? '-',
    s.email ?? '-',
    s.noHp ?? '-',
  ]);
  
  return [headers, ...rows].map((row) => row.join(',')).join('\n');
};

/**
 * Generate CSV content for tracer study export
 */
export const generateTracerCSV = async (): Promise<string> => {
  const [students, tracers] = await Promise.all([
    studentRepository.getAllStudents(),
    studentRepository.getAllTracerStudies(),
  ]);
  
  const headers = [
    'Nama',
    'NIM',
    'Tahun Lulus',
    'Status Karir',
    'Perusahaan/Usaha/Kampus',
    'Bidang',
    'Relevansi',
    'Email',
    'No HP',
  ];
  
  const rows = tracers.map((t) => {
    const student = students.find((s) => s.id === t.studentId);
    let entity = '-';
    let field = '-';
    let relevance = '-';
    
    if (t.careerStatus === 'working' && t.employmentData) {
      entity = t.employmentData.namaPerusahaan;
      field = t.employmentData.bidangIndustri;
      relevance = t.employmentData.relevansiKompetensi ?? '-';
    } else if (t.careerStatus === 'entrepreneur' && t.entrepreneurshipData) {
      entity = t.entrepreneurshipData.namaUsaha;
      field = t.entrepreneurshipData.jenisUsaha;
      relevance = t.entrepreneurshipData.relevansiKompetensi ?? '-';
    } else if (t.careerStatus === 'further_study' && t.furtherStudyData) {
      entity = t.furtherStudyData.namaKampus;
      field = t.furtherStudyData.programStudi;
      relevance = t.furtherStudyData.relevansiKompetensi ?? '-';
    } else if (t.careerStatus === 'job_seeking' && t.jobSeekingData) {
      entity = '-';
      field = t.jobSeekingData.bidangDiincar;
    }
    
    return [
      student?.nama ?? '-',
      student?.nim ?? '-',
      student?.tahunLulus?.toString() ?? '-',
      CAREER_STATUS_LABELS[t.careerStatus],
      entity,
      field,
      relevance,
      t.email,
      t.noHp,
    ];
  });
  
  return [headers, ...rows].map((row) => row.join(',')).join('\n');
};

// ============ Admin Career History Management ============

// In-memory career history storage
let careerHistoryData: CareerHistoryEntry[] = [];

export interface CareerHistoryEntry {
  id: string;
  studentId: string;
  title: string;
  subtitle: string;
  location: string;
  industry: string;
  year: number;
  yearEnd?: number;
  isActive: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CareerHistoryInput {
  title: string;
  subtitle: string;
  location: string;
  industry: string;
  year: number;
  yearEnd?: number;
  isActive: boolean;
  description?: string;
}

// Initialize sample career data
const initCareerHistory = () => {
  if (careerHistoryData.length === 0) {
    careerHistoryData = [
      {
        id: 'ch_1',
        studentId: 's1',
        title: 'Marketing Manager',
        subtitle: 'PT Telkom Indonesia',
        location: 'Jakarta',
        industry: 'Telekomunikasi',
        year: 2022,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'ch_2',
        studentId: 's1',
        title: 'Marketing Staff',
        subtitle: 'PT Telkom Indonesia',
        location: 'Semarang',
        industry: 'Telekomunikasi',
        year: 2020,
        yearEnd: 2022,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'ch_3',
        studentId: 's2',
        title: 'HR Coordinator',
        subtitle: 'Bank BRI',
        location: 'Semarang',
        industry: 'Perbankan',
        year: 2021,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }
};

initCareerHistory();

export const getStudentCareerHistory = (studentId: string): CareerHistoryEntry[] => {
  return careerHistoryData
    .filter(ch => ch.studentId === studentId)
    .sort((a, b) => b.year - a.year);
};

export const addCareerHistory = (studentId: string, data: CareerHistoryInput): CareerHistoryEntry => {
  const entry: CareerHistoryEntry = {
    id: `ch_${Date.now()}`,
    studentId,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  careerHistoryData.push(entry);
  return entry;
};

export const updateCareerHistory = (id: string, data: Partial<CareerHistoryInput>): CareerHistoryEntry | null => {
  const index = careerHistoryData.findIndex(ch => ch.id === id);
  if (index === -1) return null;
  
  careerHistoryData[index] = {
    ...careerHistoryData[index],
    ...data,
    updatedAt: new Date(),
  };
  return careerHistoryData[index];
};

export const deleteCareerHistory = (id: string): boolean => {
  const index = careerHistoryData.findIndex(ch => ch.id === id);
  if (index === -1) return false;
  
  careerHistoryData.splice(index, 1);
  return true;
};

export const deleteCareerHistoryByStudentId = (studentId: string): number => {
  const count = careerHistoryData.filter(ch => ch.studentId === studentId).length;
  careerHistoryData = careerHistoryData.filter(ch => ch.studentId !== studentId);
  return count;
};

// ============ Admin Cascade Delete ============

export const deleteStudentWithCascade = (
  studentId: string,
  onLogout?: () => void
): { 
  success: boolean; 
  deletedAchievements: number;
  deletedCareerHistory: number;
} => {
  const deletedAchievements = deleteAchievementsByStudentId(studentId);
  const deletedCareerHistory = deleteCareerHistoryByStudentId(studentId);
  
  if (onLogout) {
    onLogout();
  }
  
  return {
    success: true,
    deletedAchievements,
    deletedCareerHistory,
  };
};

export const generatePasswordHash = (password: string): string => {
  return hashPassword(password);
};
