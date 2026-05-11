/**
 * API Student Repository
 * Handles all student-related API operations
 */

import { apiClient, ApiResponse, getApiBaseUrl } from '@/lib/api-client';
import type { AchievementType } from '@/types/achievement.types';

const AUTH_RETRY_CODES = new Set([
  'AUTH_TOKEN_MALFORMED',
  'AUTH_TOKEN_EXPIRED',
  'AUTH_TOKEN_INVALID_SIGNATURE',
  'AUTH_TOKEN_MISSING',
]);

function shouldRetryTransientAuth<T>(response: ApiResponse<T>): boolean {
  if (response.success) return false;
  if (response.code && AUTH_RETRY_CODES.has(response.code)) return true;
  const errorText = (response.error ?? '').toLowerCase();
  return errorText.includes('token') || errorText.includes('expired') || errorText.includes('kedaluwarsa');
}

function buildAuthHeaders(token: string | null): Record<string, string> {
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
    'X-Auth-Token': token,
  };
}

async function parseResponseJsonObject(response: Response): Promise<Record<string, unknown> | null> {
  const rawText = await response.text();
  if (!rawText) return {};
  try {
    const parsed = JSON.parse(rawText);
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export interface Student {
  id: string;
  nim: string;
  nama: string;
  jurusan: string;
  prodi: string;
  status: string;
  status_mode?: string | null;
  status_effective?: string | null;
  tahun_masuk: number;
  tahun_lulus?: number | null;
  email?: string | null;
  login_email?: string | null;
  pending_login_email?: string | null;
  is_email_login_enabled?: number | boolean;
  email_verified_at?: string | null;
  is_first_login?: boolean;
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
  achievement_type?: AchievementType;
  title: string;
  description?: string;
  tanggal?: string;
  lokasi?: string;
  penyelenggara?: string;
  tingkat?: string;
  peringkat?: string;
  peran_penulis?: string;
  jenis_perolehan?: string;
  nama_dosen?: string;
  penulis?: string;
  /** URL publikasi khusus kategori "scientific_work" (journal_publication). */
  url?: string;
  judul_publikasi?: string;
  level_seminar?: string;
  tanggal_publikasi?: string;
  nama_seminar_konferensi?: string;
  nama_seminar?: string;
  url_publikasi?: string;
  link_produk?: string;
  level_diseminasi?: string;
  verified?: number | boolean;
  created_at?: string;
  updated_at?: string;
  attachments?: AchievementAttachment[];
}

export interface AchievementAttachment {
  id: string;
  achievement_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  uploaded_at: string;
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
  achievement_type?: AchievementType;
  description?: string;
  tanggal?: string;
  lokasi?: string;
  penyelenggara?: string;
  tingkat?: string;
  peringkat?: string;
  peran_penulis?: string;
  jenis_perolehan?: string;
  nama_dosen?: string;
  penulis?: string;
  /** URL publikasi khusus kategori "scientific_work" (journal_publication). */
  url?: string;
  judul_publikasi?: string;
  level_seminar?: string;
  tanggal_publikasi?: string;
  nama_seminar_konferensi?: string;
  url_publikasi?: string;
  link_produk?: string;
  verified?: boolean;
}

export type AchievementImportCategory =
  | 'publikasi'
  | 'jurnal'
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
  | 'seminar'
  | 'pagelaran';

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

export interface StudentsListParams {
  search?: string;
  status?: string;
  tahun_masuk?: number;
  tahun_lulus?: number;
  tahun_masuk_from?: number;
  tahun_masuk_to?: number;
  tahun_lulus_from?: number;
  tahun_lulus_to?: number;
  kelas?: string;
  career_status?: string;
  jurusan?: string;
  prodi?: string;
  limit?: number;
  offset?: number;
  id?: string;
  nim?: string;
}

export interface StudentsListResponse extends ApiResponse<Student[]> {
  total?: number;
}

export interface RecycleBinStudentRecord {
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
  user_id?: string | null;
  deleted_at: string;
  deleted_by?: string | null;
  updated_at?: string;
  user_is_active?: boolean;
}

export interface StudentsRecycleBinPayload {
  records: RecycleBinStudentRecord[];
  total: number;
  page: number;
  per_page: number;
}

/**
 * Get students list from API with filters and pagination
 */
export async function getStudentsListFromAPI(
  params: StudentsListParams = {}
): Promise<StudentsListResponse> {
  const query: Record<string, string | number> = {};
  if (params.id != null) query.id = params.id;
  if (params.nim != null) query.nim = params.nim;
  if (params.search != null && params.search !== '') query.search = params.search;
  if (params.status != null && params.status !== '' && params.status !== 'all') query.status = params.status;
  if (params.tahun_masuk != null && params.tahun_masuk > 0) query.tahun_masuk = params.tahun_masuk;
  if (params.tahun_lulus != null && params.tahun_lulus > 0) query.tahun_lulus = params.tahun_lulus;
  if (params.tahun_masuk_from != null && params.tahun_masuk_from > 0) query.tahun_masuk_from = params.tahun_masuk_from;
  if (params.tahun_masuk_to != null && params.tahun_masuk_to > 0) query.tahun_masuk_to = params.tahun_masuk_to;
  if (params.tahun_lulus_from != null && params.tahun_lulus_from > 0) query.tahun_lulus_from = params.tahun_lulus_from;
  if (params.tahun_lulus_to != null && params.tahun_lulus_to > 0) query.tahun_lulus_to = params.tahun_lulus_to;
  if (params.kelas != null && params.kelas !== '' && ['A', 'B', 'C', 'D'].includes(params.kelas.toUpperCase())) query.kelas = params.kelas.toUpperCase();
  if (params.career_status != null && params.career_status !== '' && params.career_status !== 'all') query.career_status = params.career_status;
  if (params.jurusan != null && params.jurusan !== '' && params.jurusan !== 'all') query.jurusan = params.jurusan;
  if (params.prodi != null && params.prodi !== '' && params.prodi !== 'all') query.prodi = params.prodi;
  if (params.limit != null) query.limit = params.limit;
  if (params.offset != null) query.offset = params.offset;
  return apiClient.get<Student[]>('students/list.php', { params: query }) as Promise<StudentsListResponse>;
}

/**
 * Get all students from API (no pagination)
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
  status_mode?: string;
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
    status_mode?: string;
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
 * Get recycle bin student accounts (soft-deleted students).
 */
export async function getStudentsRecycleBinFromAPI(params?: {
  search?: string;
  page?: number;
  per_page?: number;
}): Promise<ApiResponse<StudentsRecycleBinPayload>> {
  const query: Record<string, string | number> = {};
  if (params?.search != null && params.search !== '') query.search = params.search;
  if (params?.page != null) query.page = params.page;
  if (params?.per_page != null) query.per_page = params.per_page;
  return apiClient.get<StudentsRecycleBinPayload>(
    'students/recycle_bin.php',
    Object.keys(query).length ? { params: query } : undefined
  );
}

/**
 * Recover a soft-deleted student account.
 */
export async function recoverStudentViaAPI(studentId: string): Promise<ApiResponse<Student>> {
  return apiClient.post<Student>('students/recover.php', { id: studentId });
}

/**
 * Recover multiple soft-deleted student accounts.
 */
export async function recoverStudentsBatchViaAPI(
  ids: string[]
): Promise<ApiResponse<{ restored_count: number }>> {
  return apiClient.post<{ restored_count: number }>('students/recover_batch.php', { ids });
}

/**
 * Permanently delete a student account and all related data.
 */
export async function permanentDeleteStudentViaAPI(
  studentId: string
): Promise<ApiResponse<{ student_id: string; nim: string; chart_deleted_total: number }>> {
  return apiClient.post<{ student_id: string; nim: string; chart_deleted_total: number }>(
    'students/permanent_delete.php',
    { id: studentId }
  );
}

/**
 * Permanently delete multiple student accounts (batch).
 */
export async function permanentDeleteStudentsBatchViaAPI(
  ids: string[]
): Promise<ApiResponse<{ deleted_count: number; results: Array<{ student_id: string; nim: string; chart_deleted_total: number }> }>> {
  return apiClient.post<{ deleted_count: number; results: Array<{ student_id: string; nim: string; chart_deleted_total: number }> }>(
    'students/permanent_delete_batch.php',
    { ids }
  );
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
 * Delete multiple students via API (batch)
 */
export async function deleteStudentsBatch(ids: string[]): Promise<ApiResponse<{ success: boolean; message?: string }>> {
  return apiClient.post<{ success: boolean; message?: string }>('students/delete_batch.php', { ids });
}

/**
 * Reset password for multiple students via API (batch; random password per student)
 */
export async function resetPasswordBatch(
  ids: string[],
  newPassword: string
): Promise<ApiResponse<{ success: boolean; message?: string }>> {
  return apiClient.post<{ success: boolean; message?: string }>('students/reset_password_batch.php', {
    ids,
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
  studentId?: string,
  options?: { includeAttachments?: boolean }
): Promise<ApiResponse<Achievement[]>> {
  const params: Record<string, string> = {};
  if (studentId) params.student_id = studentId;
  if (options?.includeAttachments) params.include_attachments = '1';
  const requestOptions = Object.keys(params).length ? { params } : undefined;
  return apiClient.get<Achievement[]>('achievements/list.php', requestOptions);
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
 * Download template excel import prestasi per kategori.
 */
export async function downloadAchievementImportTemplateViaAPI(
  kategori: AchievementImportCategory
): Promise<ApiResponse<{ downloaded: boolean }>> {
  try {
    const base = getApiBaseUrl();
    const token = apiClient.getToken();
    const params = new URLSearchParams({ kategori });
    const response = await fetch(`${base}/achievements/import/template.php?${params.toString()}`, {
      method: 'GET',
      headers: buildAuthHeaders(token),
    });

    if (!response.ok) {
      const payload = await parseResponseJsonObject(response);
      const error = payload && typeof payload.error === 'string'
        ? payload.error
        : `Gagal download template (${response.status})`;
      return { success: false, error };
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const filenameHeader = response.headers.get('content-disposition') || '';
    const filenameMatch = filenameHeader.match(/filename="?([^";]+)"?/i);
    const filename = filenameMatch?.[1] ?? `template-import-prestasi-${kategori}.xlsx`;
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);

    return { success: true, data: { downloaded: true } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal download template',
    };
  }
}

/**
 * Upload excel import prestasi per kategori.
 */
export async function importAchievementsFromExcelViaAPI(
  kategori: AchievementImportCategory,
  file: File
): Promise<ApiResponse<AchievementImportSummary>> {
  try {
    const base = getApiBaseUrl();
    const token = apiClient.getToken();
    const form = new FormData();
    form.append('kategori', kategori);
    form.append('file', file);

    const response = await fetch(`${base}/achievements/import/upload.php`, {
      method: 'POST',
      headers: buildAuthHeaders(token),
      body: form,
    });

    const payload = await parseResponseJsonObject(response);
    if (!payload) {
      return { success: false, error: 'Respons import tidak valid (bukan JSON).' };
    }

    if (!response.ok || payload.success !== true) {
      const error = typeof payload.error === 'string' ? payload.error : `Import gagal (${response.status})`;
      return { success: false, error };
    }

    return {
      success: true,
      data: payload.data as AchievementImportSummary,
      message: typeof payload.message === 'string' ? payload.message : undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Import gagal',
    };
  }
}

/**
 * List riwayat import prestasi.
 */
export async function listAchievementImportLogsViaAPI(params?: {
  limit?: number;
  offset?: number;
}): Promise<ApiResponse<{ logs: AchievementImportLog[]; total: number; limit: number; offset: number }>> {
  const query: Record<string, string | number> = {};
  if (params?.limit != null) query.limit = params.limit;
  if (params?.offset != null) query.offset = params.offset;
  return apiClient.get<{ logs: AchievementImportLog[]; total: number; limit: number; offset: number }>(
    'achievements/import/logs.php',
    Object.keys(query).length ? { params: query } : undefined
  );
}

/**
 * Detail log import prestasi (termasuk row-level details).
 */
export async function getAchievementImportLogDetailViaAPI(
  logId: string
): Promise<ApiResponse<{ log: AchievementImportLog; details: AchievementImportRowError[] }>> {
  return apiClient.get<{ log: AchievementImportLog; details: AchievementImportRowError[] }>(
    'achievements/import/logs.php',
    { params: { log_id: logId } }
  );
}

/**
 * Upload single attachment (PNG/PDF/etc) for an achievement.
 */
export async function uploadAchievementAttachmentViaAPI(
  achievementId: string,
  file: File
): Promise<ApiResponse<AchievementAttachment>> {
  try {
    const base = getApiBaseUrl();
    const token = apiClient.getToken();
    const form = new FormData();
    form.append('achievement_id', achievementId);
    form.append('file', file);

    const response = await fetch(`${base}/achievements/attachments/upload.php`, {
      method: 'POST',
      headers: buildAuthHeaders(token),
      body: form,
    });

    const payload = await parseResponseJsonObject(response);
    if (!payload) {
      return { success: false, error: 'Respons upload tidak valid (bukan JSON).' };
    }

    if (!response.ok) {
      const error = typeof payload.error === 'string' ? payload.error : `Upload gagal (${response.status})`;
      return { success: false, error };
    }

    return {
      success: true,
      data: {
        id: String(payload.id ?? ''),
        achievement_id: String(payload.achievement_id ?? achievementId),
        file_name: String(payload.file_name ?? file.name),
        file_type: String(payload.file_type ?? file.type),
        file_size: Number(payload.file_size ?? file.size),
        file_path: String(payload.file_path ?? ''),
        uploaded_at: String(payload.uploaded_at ?? new Date().toISOString()),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload gagal',
    };
  }
}

/**
 * Delete single attachment for an achievement.
 */
export async function deleteAchievementAttachmentViaAPI(
  attachmentId: string
): Promise<ApiResponse<{ attachment_id: string }>> {
  return apiClient.post<{ attachment_id: string }>('achievements/attachments/delete.php', {
    attachment_id: attachmentId,
  });
}

/**
 * Get all attachments for an achievement.
 */
export async function listAchievementAttachmentsViaAPI(
  achievementId: string
): Promise<ApiResponse<AchievementAttachment[]>> {
  try {
    const base = getApiBaseUrl();
    const token = apiClient.getToken();
    const params = new URLSearchParams({ achievement_id: achievementId });

    const response = await fetch(`${base}/achievements/attachments/list.php?${params.toString()}`, {
      method: 'GET',
      headers: buildAuthHeaders(token),
    });

    const payload = await parseResponseJsonObject(response);
    if (!payload) {
      return { success: false, error: 'Respons list lampiran tidak valid (bukan JSON).' };
    }

    if (!response.ok || payload.success !== true) {
      const error = typeof payload.error === 'string' ? payload.error : `Gagal memuat lampiran (${response.status})`;
      return { success: false, error };
    }

    const attachments = Array.isArray(payload.attachments)
      ? (payload.attachments as Array<Record<string, unknown>>).map((item) => ({
          id: String(item.id ?? ''),
          achievement_id: String(item.achievement_id ?? achievementId),
          file_name: String(item.file_name ?? ''),
          file_type: String(item.file_type ?? ''),
          file_size: Number(item.file_size ?? 0),
          file_path: String(item.file_path ?? ''),
          uploaded_at: String(item.uploaded_at ?? new Date().toISOString()),
        }))
      : [];

    return {
      success: true,
      data: attachments,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal memuat lampiran',
    };
  }
}

/** Response from achievements/stats.php (dashboard agregasi prestasi) */
export interface AchievementStatsResponse {
  by_category: Array<{ category: string; label: string; count: number }>;
  by_type?: Array<{ type: AchievementType; label: string; count: number }>;
  by_year: Array<{ year: number; count: number }>;
  total: number;
  filter_year: number | null;
  academic_breakdown?: { local: number; national: number; international: number };
  non_academic_breakdown?: { local: number; national: number; international: number };
}

/**
 * Get achievement stats for dashboard (by category, by year)
 */
export async function getAchievementStats(
  year?: number | null,
  tab?: 'all' | 'academic' | 'nonAcademic'
): Promise<ApiResponse<AchievementStatsResponse>> {
  const params: Record<string, string | number> = {};
  if (year != null) params.year = year;
  if (tab) params.tab = tab;
  const response = await apiClient.get<AchievementStatsResponse>('achievements/stats.php', {
    params,
  });
  if (!shouldRetryTransientAuth(response)) return response;
  await new Promise((resolve) => setTimeout(resolve, 200));
  return apiClient.get<AchievementStatsResponse>('achievements/stats.php', {
    params,
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
