/**
 * API Student Repository
 * Handles all student-related API operations
 */

import { apiClient, ApiResponse } from '@/lib/api-client';

export interface Student {
  id: string;
  nim: string;
  nama: string;
  jurusan: string;
  prodi: string;
  status: string;
  tahun_masuk: number;
  tahun_lulus?: number | null;
  email?: string | null;
  no_hp?: string | null;
  alamat?: string | null;
  user_id?: string | null;
  has_credentials?: number | boolean;
  last_login?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TracerStudy {
  id: string;
  student_id: string;
  email?: string | null;
  no_hp?: string | null;
  media_sosial?: string | null;
  linkedin?: string | null;
  career_status: string;
  tahun_pengisian?: number;
  employment_data?: string | Record<string, unknown> | null;
  job_seeking_data?: string | Record<string, unknown> | null;
  entrepreneurship_data?: string | Record<string, unknown> | null;
  further_study_data?: string | Record<string, unknown> | null;
  ringkasan_karir?: string | null;
  bersedia_dihubungi?: number | boolean;
  saran_komentar?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Achievement {
  id: string;
  student_id: string;
  category: string;
  subcategory?: string;
  title: string;
  description?: string;
  tanggal?: string;
  lokasi?: string;
  penyelenggara?: string;
  tingkat?: string;
  peringkat?: string;
  verified?: number | boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTracerStudyPayload {
  student_id: string;
  career_status: string;
  email: string;
  no_hp: string;
  media_sosial?: string;
  linkedin?: string;
  tahun_pengisian: number;
  employment_data?: Record<string, unknown>;
  job_seeking_data?: Record<string, unknown>;
  entrepreneurship_data?: Record<string, unknown>;
  further_study_data?: Record<string, unknown>;
  ringkasan_karir?: string;
  bersedia_dihubungi?: boolean;
  saran_komentar?: string;
}

export interface CreateAchievementPayload {
  student_id: string;
  title: string;
  category: string;
  subcategory: string;
  description?: string;
  tanggal?: string;
  lokasi?: string;
  penyelenggara?: string;
  tingkat?: string;
  peringkat?: string;
  verified?: boolean;
}

/**
 * Get all students from API
 */
export async function getAllStudentsFromAPI(): Promise<ApiResponse<Student[]>> {
  return apiClient.get<Student[]>('students/list.php');
}

/**
 * Get single student by ID from API
 */
export async function getStudentByIdFromAPI(studentId: string): Promise<ApiResponse<Student[]>> {
  return apiClient.get<Student[]>('students/list.php', {
    params: { id: studentId },
  });
}

/**
 * Create new student via API
 */
export async function createStudentViaAPI(payload: {
  nim: string;
  nama: string;
  password: string;
  status: string;
  tahun_masuk: number;
  tahun_lulus?: number;
  email?: string;
  no_hp?: string;
  alamat?: string;
  jurusan?: string;
  prodi?: string;
}): Promise<ApiResponse<Student>> {
  return apiClient.post<Student>('students/create.php', payload);
}

/**
 * Update student via API
 */
export async function updateStudentViaAPI(
  studentId: string,
  updates: Partial<{
    nim: string;
    nama: string;
    status: string;
    tahun_masuk: number;
    tahun_lulus?: number;
    email?: string;
    no_hp?: string;
    alamat?: string;
    jurusan?: string;
    prodi?: string;
  }>
): Promise<ApiResponse<Student>> {
  return apiClient.post<Student>('students/update.php', {
    id: studentId,
    ...updates,
  });
}

/**
 * Delete student via API
 */
export async function deleteStudentViaAPI(studentId: string): Promise<ApiResponse<{ success: boolean }>> {
  return apiClient.post<{ success: boolean }>('students/delete.php', { id: studentId });
}

/**
 * Reset student password via API
 */
export async function resetStudentPasswordViaAPI(
  studentId: string,
  newPassword: string
): Promise<ApiResponse<{ success: boolean }>> {
  return apiClient.post<{ success: boolean }>('students/reset_password.php', {
    student_id: studentId,
    new_password: newPassword,
  });
}

/**
 * Get tracer study data from API
 */
export async function getTracerStudyFromAPI(
  studentId?: string
): Promise<ApiResponse<TracerStudy[]>> {
  const options = studentId
    ? { params: { student_id: studentId } }
    : undefined;

  return apiClient.get<TracerStudy[]>('tracer/list.php', options);
}

/**
 * Get single tracer study by ID
 */
export async function getTracerStudyByIdFromAPI(tracerId: string): Promise<ApiResponse<TracerStudy>> {
  return apiClient.get<TracerStudy>('tracer/list.php', {
    params: { id: tracerId },
  });
}

/**
 * Create new tracer study record via API
 */
export async function createTracerStudyViaAPI(
  payload: CreateTracerStudyPayload
): Promise<ApiResponse<TracerStudy>> {
  return apiClient.post<TracerStudy>('tracer/create.php', payload);
}

/**
 * Get achievements from API
 */
export async function getAchievementsFromAPI(
  studentId?: string
): Promise<ApiResponse<Achievement[]>> {
  const options = studentId
    ? { params: { student_id: studentId } }
    : undefined;

  return apiClient.get<Achievement[]>('achievements/list.php', options);
}

/**
 * Get single achievement by ID
 */
export async function getAchievementByIdFromAPI(achievementId: string): Promise<ApiResponse<Achievement>> {
  return apiClient.get<Achievement>('achievements/list.php', {
    params: { id: achievementId },
  });
}

/**
 * Create new achievement via API
 */
export async function createAchievementViaAPI(
  payload: CreateAchievementPayload
): Promise<ApiResponse<Achievement>> {
  return apiClient.post<Achievement>('achievements/create.php', payload);
}

/**
 * Update achievement via API
 */
export async function updateAchievementViaAPI(
  achievementId: string,
  payload: Partial<CreateAchievementPayload>
): Promise<ApiResponse<Achievement>> {
  return apiClient.post<Achievement>('achievements/update.php', {
    id: achievementId,
    ...payload,
  });
}

/**
 * Delete achievement via API
 */
export async function deleteAchievementViaAPI(achievementId: string): Promise<ApiResponse<{ success: boolean }>> {
  return apiClient.post<{ success: boolean }>('achievements/delete.php', {
    id: achievementId,
  });
}

/**
 * Update tracer study via API (if supported by backend)
 */
export async function updateTracerStudyViaAPI(
  tracerId: string,
  payload: Partial<CreateTracerStudyPayload>
): Promise<ApiResponse<TracerStudy>> {
  return apiClient.post<TracerStudy>('tracer/update.php', {
    id: tracerId,
    ...payload,
  });
}

/**
 * Delete tracer study via API
 */
export async function deleteTracerStudyViaAPI(
  tracerId: string
): Promise<ApiResponse<{ success: boolean }>> {
  return apiClient.post<{ success: boolean }>('tracer/delete.php', { id: tracerId });
}
