/**
 * Student Repository
 * Data access layer for student-centric data model
 * 
 * ARCHITECTURE NOTE:
 * This repository abstracts data access, currently using in-memory data.
 * In production with Prisma/PostgreSQL, replace implementations with:
 * - prisma.student.findMany()
 * - prisma.tracerStudy.create()
 * - prisma.achievement.findMany()
 * etc.
 * 
 * ISOLATION: This is a temporary in-memory implementation.
 * Replace this file when migrating to your production persistence layer.
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
} from '@/types/student.types';
// ============ In-Memory Storage (Replace with API in production) ============

let studentStore: StudentProfile[] = [];
let tracerStore: TracerStudyData[] = [];
let achievementStore: NonAcademicAchievement[] = [];

// ============ Student Profile Operations ============

/**
 * Get all student profiles
 */
export const getAllStudents = async (): Promise<StudentProfile[]> => {
  // Production: return prisma.student.findMany();
  return studentStore;
};

/**
 * Get student by ID
 */
export const getStudentById = async (id: string): Promise<StudentProfile | null> => {
  // Production: return prisma.student.findUnique({ where: { id } });
  return studentStore.find((s) => s.id === id) ?? null;
};

/**
 * Get student by NIM
 */
export const getStudentByNim = async (nim: string): Promise<StudentProfile | null> => {
  // Production: return prisma.student.findUnique({ where: { nim } });
  return studentStore.find((s) => s.nim === nim) ?? null;
};

/**
 * Search students by name and enrollment year
 */
export const searchStudents = async (
  nama: string,
  tahunMasuk?: number
): Promise<StudentProfile[]> => {
  // Production: return prisma.student.findMany({
  //   where: {
  //     nama: { contains: nama, mode: 'insensitive' },
  //     ...(tahunMasuk && { tahunMasuk }),
  //   }
  // });
  const namaLower = nama.toLowerCase().trim();
  return studentStore.filter((student) => {
    const matchName = student.nama.toLowerCase().includes(namaLower);
    const matchYear = !tahunMasuk || student.tahunMasuk === tahunMasuk;
    return matchName && matchYear;
  });
};

/**
 * Get filtered students
 */
export const getFilteredStudents = async (
  criteria: StudentFilterCriteria
): Promise<StudentProfile[]> => {
  return studentStore.filter((student) => {
    const matchSearch =
      !criteria.searchQuery ||
      student.nama.toLowerCase().includes(criteria.searchQuery.toLowerCase()) ||
      student.nim.includes(criteria.searchQuery);

    const matchStatus =
      criteria.status === 'all' || !criteria.status || student.status === criteria.status;

    const matchTahunMasuk =
      criteria.tahunMasuk === 'all' || !criteria.tahunMasuk || student.tahunMasuk === criteria.tahunMasuk;

    const matchTahunLulus =
      criteria.tahunLulus === 'all' || !criteria.tahunLulus || student.tahunLulus === criteria.tahunLulus;

    return matchSearch && matchStatus && matchTahunMasuk && matchTahunLulus;
  });
};

/**
 * Get alumni only
 */
export const getAlumni = async (): Promise<StudentProfile[]> => {
  // Production: return prisma.student.findMany({ where: { status: 'alumni' } });
  return studentStore.filter((s) => s.status === 'alumni');
};

/**
 * Create student profile
 */
export const createStudent = async (data: StudentProfileInput): Promise<StudentProfile> => {
  // Production: return prisma.student.create({ data });
  const newStudent: StudentProfile = {
    ...data,
    id: `s${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  studentStore.push(newStudent);
  return newStudent;
};

/**
 * Update student profile
 */
export const updateStudent = async (
  id: string,
  data: Partial<StudentProfileInput>
): Promise<StudentProfile | null> => {
  // Production: return prisma.student.update({ where: { id }, data });
  const index = studentStore.findIndex((s) => s.id === id);
  if (index === -1) return null;
  
  studentStore[index] = {
    ...studentStore[index],
    ...data,
    updatedAt: new Date(),
  };
  return studentStore[index];
};

// ============ Tracer Study Operations ============

/**
 * Get all tracer study records
 */
export const getAllTracerStudies = async (): Promise<TracerStudyData[]> => {
  // Production: return prisma.tracerStudy.findMany();
  return tracerStore;
};

/**
 * Get tracer study by student ID
 */
export const getTracerByStudentId = async (
  studentId: string
): Promise<TracerStudyData | null> => {
  // Production: return prisma.tracerStudy.findFirst({
  //   where: { studentId },
  //   orderBy: { createdAt: 'desc' }
  // });
  const records = tracerStore
    .filter((t) => t.studentId === studentId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return records[0] ?? null;
};

/**
 * Create tracer study record
 */
export const createTracerStudy = async (
  data: TracerStudyInput
): Promise<TracerStudyData> => {
  // Production: return prisma.tracerStudy.create({ data });
  const newRecord: TracerStudyData = {
    ...data,
    id: `t${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  tracerStore.push(newRecord);
  return newRecord;
};

/**
 * Update tracer study record
 */
export const updateTracerStudy = async (
  id: string,
  data: Partial<TracerStudyInput>
): Promise<TracerStudyData | null> => {
  // Production: return prisma.tracerStudy.update({ where: { id }, data });
  const index = tracerStore.findIndex((t) => t.id === id);
  if (index === -1) return null;
  
  tracerStore[index] = {
    ...tracerStore[index],
    ...data,
    updatedAt: new Date(),
  };
  return tracerStore[index];
};

// ============ Achievement Operations ============

/**
 * Get all achievements
 */
export const getAllAchievements = async (): Promise<NonAcademicAchievement[]> => {
  // Production: return prisma.achievement.findMany();
  return achievementStore;
};

/**
 * Get achievements by student ID
 */
export const getAchievementsByStudentId = async (
  studentId: string
): Promise<NonAcademicAchievement[]> => {
  // Production: return prisma.achievement.findMany({ where: { studentId } });
  return achievementStore.filter((a) => a.studentId === studentId);
};

/**
 * Get filtered achievements
 */
export const getFilteredAchievements = async (
  criteria: AchievementFilterCriteria
): Promise<NonAcademicAchievement[]> => {
  return achievementStore.filter((achievement) => {
    const matchStudent =
      !criteria.studentId || achievement.studentId === criteria.studentId;

    const matchCategory =
      criteria.category === 'all' || !criteria.category || achievement.category === criteria.category;

    const matchSubcategory =
      criteria.subcategory === 'all' || !criteria.subcategory || achievement.subcategory === criteria.subcategory;

    const matchTahun =
      criteria.tahun === 'all' || !criteria.tahun || achievement.tanggal.getFullYear() === criteria.tahun;

    const matchTingkat =
      criteria.tingkat === 'all' || !criteria.tingkat || achievement.tingkat === criteria.tingkat;

    const matchVerified =
      criteria.verified === undefined || achievement.verified === criteria.verified;

    return matchStudent && matchCategory && matchSubcategory && matchTahun && matchTingkat && matchVerified;
  });
};

/**
 * Create achievement record
 */
export const createAchievement = async (
  data: AchievementInput
): Promise<NonAcademicAchievement> => {
  // Production: return prisma.achievement.create({ data: { ...data, verified: false } });
  const newRecord: NonAcademicAchievement = {
    ...data,
    id: `a${Date.now()}`,
    verified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  achievementStore.push(newRecord);
  return newRecord;
};

/**
 * Update achievement record
 */
export const updateAchievement = async (
  id: string,
  data: Partial<AchievementInput & { verified: boolean }>
): Promise<NonAcademicAchievement | null> => {
  // Production: return prisma.achievement.update({ where: { id }, data });
  const index = achievementStore.findIndex((a) => a.id === id);
  if (index === -1) return null;
  
  achievementStore[index] = {
    ...achievementStore[index],
    ...data,
    updatedAt: new Date(),
  };
  return achievementStore[index];
};

// ============ Composite Operations ============

/**
 * Get complete student view with all modules
 */
export const getStudentCompleteView = async (
  studentId: string
): Promise<StudentCompleteView | null> => {
  const student = await getStudentById(studentId);
  if (!student) return null;

  const tracer = await getTracerByStudentId(studentId);
  const achievements = await getAchievementsByStudentId(studentId);

  return {
    ...student,
    tracerStudy: tracer ?? undefined,
    achievements,
  };
};

/**
 * Get student summary list
 */
export const getStudentSummaries = async (): Promise<StudentSummaryView[]> => {
  const students = await getAllStudents();
  const tracers = await getAllTracerStudies();
  const achievements = await getAllAchievements();

  return students.map((student) => {
    const tracer = tracers.find((t) => t.studentId === student.id);
    const studentAchievements = achievements.filter((a) => a.studentId === student.id);

    return {
      id: student.id,
      nama: student.nama,
      nim: student.nim,
      status: student.status,
      tahunMasuk: student.tahunMasuk,
      tahunLulus: student.tahunLulus,
      hasTracerStudy: !!tracer,
      achievementCount: studentAchievements.length,
      careerStatus: tracer?.careerStatus,
    };
  });
};

// ============ Reset (for testing) ============

export const resetStore = () => {
  studentStore = [];
  tracerStore = [];
  achievementStore = [];
};
