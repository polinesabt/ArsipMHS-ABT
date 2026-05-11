/**
 * API Insight Dashboard - data untuk chart section
 */
import { apiClient, ApiResponse } from '@/lib/api-client';
import type { AchievementImportCategory } from '@/repositories/api-student.repository';

export type InsightSection =
  | 'study_period'
  | 'waiting_time'
  | 'work_coverage'
  | 'user_satisfaction'
  | 'publications'
  | 'seminar_kegiatan'
  | 'active_students'
  | 'student_products'
  | 'research_outputs';
  

export interface StudyPeriodData {
  by_year: Array<{ year: number; diterima: number; lulus: number }>;
  total_diterima: number;
  total_lulus: number;
}

export interface WaitingTimeData {
  by_year: Array<{
    year: number;
    lessThan3Months: number;
    between3And6Months: number;
    moreThan6Months: number;
  }>;
  total: number;
}

export interface WorkCoverageData {
  by_scope: Array<{ label: string; key: string; count: number }>;
  by_year?: Array<{ year: number; local: number; national: number; multinational: number }>;
  by_year_by_status?: {
    working?: Array<{ year: number; local: number; national: number; multinational: number }>;
    entrepreneur?: Array<{ year: number; local: number; national: number; multinational: number }>;
  };
  total_by_status?: {
    working: number;
    entrepreneur: number;
  };
  total: number;
}

export interface UserSatisfactionData {
  aspects: Array<{ aspect_name: string; avg_score: number; response_count: number }>;
  likert?: Array<{ indicator: string; veryGood: number; good: number; fair: number; poor: number }>;
  overall_avg: number;
  total_responses: number;
}

export interface PublicationsJurnalByYearRow {
  year: number;
  mandiriNationalNonAccredited: number;
  mandiriNationalAccredited: number;
  mandiriInternational: number;
  mandiriReputableInternational: number;
  kolaborasiNationalNonAccredited: number;
  kolaborasiNationalAccredited: number;
  kolaborasiInternational: number;
  kolaborasiReputableInternational: number;
}

export interface PublicationsSeminarByYearRow {
  year: number;
  mandiriLocal: number;
  mandiriNational: number;
  mandiriInternational: number;
  kolaborasiLocal: number;
  kolaborasiNational: number;
  kolaborasiInternational: number;
}

export interface PublicationsPagelaranByYearRow {
  year: number;
  mandiriRegional: number;
  mandiriNational: number;
  mandiriInternational: number;
  kolaborasiRegional: number;
  kolaborasiNational: number;
  kolaborasiInternational: number;
}

export interface PublicationsData {
  jurnal?: {
    by_year: PublicationsJurnalByYearRow[];
    total: number;
  };
  seminar?: {
    by_year: PublicationsSeminarByYearRow[];
    total: number;
  };
  pagelaran?: {
    by_year: PublicationsPagelaranByYearRow[];
    total: number;
  };
  // Backward compatibility keys (old clients)
  journals?: PublicationsData['jurnal'];
  seminars?: PublicationsData['seminar'];
  performances?: PublicationsData['pagelaran'];
  by_year?: Array<{ year: number; count: number }>;
  total?: number;
}

export interface ActiveStudentsData {
  by_year: Array<{
    year: number;
    genap_aktif: number;
    genap_pd_dikti: number;
    ganjil_aktif: number;
    ganjil_pd_dikti: number;
  }>;
  total: number;
}

export interface StudentProductsData {
  by_category: Array<{ label: string; key: string; count: number }>;
  total: number;
}

export interface ResearchOutputsData {
  intellectual_property?: Array<{ name: string; key: string; count: number }>;
  technology?: {
    softwareDevelopment: number;
    products: number;
    breakdown?: Array<{ name: string; key: string; count: number }>;
  };
  other?: Array<{ name: string; key?: string; count: number }>;
  by_type?: Array<{ type: string; label: string; count: number }>;
  total: number;
}

export type InsightStatsData =
  | StudyPeriodData
  | WaitingTimeData
  | WorkCoverageData
  | UserSatisfactionData
  | PublicationsData
  | ActiveStudentsData
  | StudentProductsData
  | ResearchOutputsData;

/** Metadata untuk Chart Explanation Tooltip (sumber data, last sync, metode). */
export interface ChartMeta {
  source: string;
  last_synced_at: string | null;
  calculation: string;
}

export type InsightTone = 'formal' | 'ringkas' | 'aksi';

export interface InsightFindingInterpretation {
  primary: string;
  alternatives: string[];
  template_id: string;
  tone: InsightTone;
}

export interface InsightFinding {
  id: string;
  title: string;
  summary: string;
  severity: 'info' | 'warning' | 'critical';
  metric_key: string;
  current_value: number;
  baseline_value: number | null;
  delta_pct: number | null;
  confidence_score: number;
  evidence: string[];
  interpretation: InsightFindingInterpretation;
}

export interface InsightRecommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
  rationale: string;
  related_finding_ids: string[];
}

export interface InsightDataQuality {
  completeness_score: number;
  stale_sections: string[];
  missing_fields_top: Array<{ field: string; count: number }>;
  sample_warning: boolean;
  sample_size?: number;
  min_sample?: number;
}

export interface InsightChangeLogEntry {
  metric_key: string;
  current: number;
  previous: number | null;
  delta_pct: number | null;
  direction: 'up' | 'down' | 'flat';
}

export interface InsightIntelligenceData {
  generated_at: string;
  filters: {
    year: number | 'all';
    compare_prev: boolean;
    tone: InsightTone;
    variant_seed?: string | null;
    previous_year?: number | null;
    min_sample?: number;
  };
  kpi_summary: {
    employability_rate: number;
    entrepreneurship_rate: number;
    waiting_time_lt_6m_rate: number;
    satisfaction_overall: number;
    total_alumni_analyzed: number;
    total_working?: number;
    total_entrepreneur?: number;
    waiting_time_total?: number;
    waiting_time_lt_6m_count?: number;
    total_responses: number;
  };
  findings: InsightFinding[];
  recommendations: InsightRecommendation[];
  data_quality: InsightDataQuality;
  change_log: InsightChangeLogEntry[];
}

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

export type InsightStatsResponse<T = InsightStatsData> = ApiResponse<T> & { meta?: ChartMeta };

export type InsightIntelligenceResponse = ApiResponse<InsightIntelligenceData>;

export async function getInsightStats(
  section: InsightSection,
  year?: number | null,
  tab?: string | null
): Promise<InsightStatsResponse<InsightStatsData>> {
  const params: Record<string, string> = { section };
  if (year != null) params.year = String(year);
  if (tab) params.tab = tab;
  const response = await apiClient.get<InsightStatsData>('insight/stats.php', { params }) as InsightStatsResponse<InsightStatsData>;
  if (!shouldRetryTransientAuth(response)) return response;
  await new Promise((resolve) => setTimeout(resolve, 200));
  return apiClient.get<InsightStatsData>('insight/stats.php', { params }) as Promise<InsightStatsResponse<InsightStatsData>>;
}

export async function getInsightIntelligence(opts?: {
  year?: number | 'all' | null;
  comparePrev?: boolean;
  tone?: InsightTone;
  variantSeed?: string | null;
  minSample?: number | null;
}): Promise<InsightIntelligenceResponse> {
  const params: Record<string, string> = {};
  if (opts?.year != null) params.year = String(opts.year);
  if (opts?.comparePrev != null) params.compare_prev = opts.comparePrev ? '1' : '0';
  if (opts?.tone) params.tone = opts.tone;
  if (opts?.variantSeed) params.variant_seed = opts.variantSeed;
  if (opts?.minSample != null) params.min_sample = String(opts.minSample);

  const response = await apiClient.get<InsightIntelligenceData>('insight/intelligence.php', { params });
  if (!shouldRetryTransientAuth(response)) return response;
  await new Promise((resolve) => setTimeout(resolve, 200));
  return apiClient.get<InsightIntelligenceData>('insight/intelligence.php', { params });
}

/** Satu baris statistik mahasiswa aktif per semester (input manual). */
export interface ActiveStudentsSemesterRow {
  tahun: number;
  semester: 'genap' | 'ganjil';
  pd_dikti: number;
  aktif: number | null;
}

export interface ActiveStudentsSemesterStatsPayload {
  success: boolean;
  data?: ActiveStudentsSemesterRow[];
  error?: string;
}

export interface ActiveStudentsSemesterUpsertPayload {
  success: boolean;
  data?: ActiveStudentsSemesterRow;
  error?: string;
}

/** GET: Daftar statistik per semester (untuk input manual Mahasiswa Aktif). */
export async function getActiveStudentsSemesterStats(year?: number): Promise<ActiveStudentsSemesterStatsPayload> {
  const params: Record<string, string> = {};
  if (year != null) params.year = String(year);
  const res = await apiClient.get<ActiveStudentsSemesterRow[]>('insight/active_students_semester.php', { params });
  if (!res.success) return { success: false, error: res.error };
  return { success: true, data: res.data ?? [] };
}

/** PUT: Simpan/update satu baris (tahun, semester, pd_dikti, aktif). */
export async function upsertActiveStudentsSemesterStat(payload: {
  tahun: number;
  semester: 'genap' | 'ganjil';
  pd_dikti: number;
  aktif?: number | null;
}): Promise<ActiveStudentsSemesterUpsertPayload> {
  const res = await apiClient.put<ActiveStudentsSemesterRow>('insight/active_students_semester.php', payload);
  if (!res.success) return { success: false, error: res.error };
  return { success: true, data: res.data };
}

/** DELETE: Hapus satu baris (tahun, semester). */
export async function deleteActiveStudentsSemesterStat(tahun: number, semester: 'genap' | 'ganjil'): Promise<{ success: boolean; error?: string }> {
  const res = await apiClient.delete<{ deleted?: boolean }>('insight/active_students_semester.php', {
    params: { tahun: String(tahun), semester },
  });
  if (!res.success) return { success: false, error: res.error };
  return { success: true };
}

/** Section id untuk API (snake_case). Dashboard route memakai kebab-case. */
export type ChartRecordsSection =
  | InsightSection
  | 'student_achievements';

export type WorkCoverageRecordTab = 'working' | 'entrepreneur';

/** Map dashboard path section (kebab) -> API section (snake). */
export const DASHBOARD_SECTION_TO_API: Record<string, ChartRecordsSection> = {
  'student-achievements': 'student_achievements',
  'study-period': 'study_period',
  'waiting-time': 'waiting_time',
  'work-coverage': 'work_coverage',
  'user-satisfaction': 'user_satisfaction',
  publications: 'publications',
  'active-students': 'active_students',
  'student-products': 'student_products',
  'research-outputs': 'research_outputs',
};

/** Semua section chart (untuk sinkron semua). */
export const ALL_CHART_SECTIONS: ChartRecordsSection[] = [
  'study_period',
  'waiting_time',
  'work_coverage',
  'user_satisfaction',
  'publications',
  'active_students',
  'student_products',
  'research_outputs',
  'student_achievements',
];

export interface SyncAllResult {
  section: ChartRecordsSection;
  success: boolean;
  records_synced?: number;
  error?: string;
}

const INVALID_SYNC_RESPONSE_MSG = 'Format respons API tidak valid: field "data" tidak ditemukan.';

function buildTokenHeaders(token: string | null): Record<string, string> {
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
    'X-Auth-Token': token,
  };
}

async function parseJsonObjectSafe(response: Response): Promise<Record<string, unknown> | null> {
  const rawText = await response.text();
  if (!rawText) return {};
  try {
    const parsed = JSON.parse(rawText);
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Sinkron semua section chart dari data master (sequential). */
export async function syncAllChartSections(): Promise<SyncAllResult[]> {
  const results: SyncAllResult[] = [];
  for (const section of ALL_CHART_SECTIONS) {
    const res = await syncChartSection(section);
    if (!res.success) {
      results.push({
        section,
        success: false,
        error: res.error,
      });
      continue;
    }
    if (!res.data) {
      results.push({
        section,
        success: false,
        error: INVALID_SYNC_RESPONSE_MSG,
      });
      continue;
    }
    results.push({
      section,
      success: true,
      records_synced: res.data.records_synced,
    });
  }
  return results;
}

export interface ChartRecordAttachment {
  id: string;
  file_name: string;
  file_type: string;
  file_path: string;
}

export interface ChartRecordStudentPreviewAttachment {
  id: string;
  achievement_id: string;
  file_name: string;
  file_type: string;
  file_path: string;
}

export interface ChartRecordStudentCard {
  snapshot_nim: string;
  snapshot_nama: string;
  snapshot_prodi: string;
  snapshot_fakultas: string;
  total_records: number;
  total_attachments: number;
  latest_updated_at: string | null;
  preview_attachments: ChartRecordStudentPreviewAttachment[];
}

export interface ChartRecord {
  id: string;
  source_table: string;
  source_id: string;
  snapshot_nim: string;
  snapshot_nama: string;
  snapshot_prodi: string;
  snapshot_fakultas: string;
  tahun_pelaporan: number;
  payload: Record<string, unknown>;
  included_in_chart: number | boolean;
  created_at: string;
  updated_at: string;
  attachments?: ChartRecordAttachment[];
}

export interface ChartRecordsPayload {
  section: string;
  records: ChartRecord[];
  total: number;
  page: number;
  per_page: number;
  last_synced_at: string | null;
}

export interface ChartRecordStudentsPayload {
  section: string;
  students: ChartRecordStudentCard[];
  total: number;
  page: number;
  per_page: number;
  last_synced_at: string | null;
}

const SECTIONS_WITH_ATTACHMENTS: ChartRecordsSection[] = [
  'student_achievements',
  'publications',
  'seminar_kegiatan',
  'student_products',
  'research_outputs',
];

export async function getChartRecords(
  section: ChartRecordsSection,
  opts?: {
    year?: number;
    page?: number;
    per_page?: number;
    include_attachments?: boolean;
    student_nim?: string;
    student_name?: string;
    tab?: string;
    achievement_category?: AchievementImportCategory;
  }
): Promise<ApiResponse<ChartRecordsPayload>> {
  const params: Record<string, string> = { section };
  if (opts?.year != null) params.year = String(opts.year);
  if (opts?.page != null) params.page = String(opts.page);
  if (opts?.per_page != null) params.per_page = String(opts.per_page);
  if (opts?.student_nim) params.student_nim = opts.student_nim;
  if (opts?.student_name) params.student_name = opts.student_name;
  if (opts?.tab) params.tab = opts.tab;
  if (opts?.achievement_category) params.achievement_category = opts.achievement_category;
  if (opts?.include_attachments !== false && SECTIONS_WITH_ATTACHMENTS.includes(section)) {
    params.include_attachments = '1';
  }
  return apiClient.get<ChartRecordsPayload>('insight/records.php', { params });
}

export async function getChartRecordStudents(
  section: ChartRecordsSection,
  opts?: { year?: number; page?: number; per_page?: number; thumbnail_limit?: number; tab?: string }
): Promise<ApiResponse<ChartRecordStudentsPayload>> {
  const params: Record<string, string> = {
    section,
    view: 'students',
  };
  if (opts?.year != null) params.year = String(opts.year);
  if (opts?.page != null) params.page = String(opts.page);
  if (opts?.per_page != null) params.per_page = String(opts.per_page);
  if (opts?.thumbnail_limit != null) params.thumbnail_limit = String(opts.thumbnail_limit);
  if (opts?.tab) params.tab = opts.tab;
  return apiClient.get<ChartRecordStudentsPayload>('insight/records.php', { params });
}

export interface SyncChartSectionPayload {
  section: ChartRecordsSection;
  records_synced: number;
  message?: string;
}

export async function syncChartSection(section: ChartRecordsSection): Promise<ApiResponse<SyncChartSectionPayload>> {
  return apiClient.post<SyncChartSectionPayload>('insight/sync.php', { section });
}

export async function deleteChartRecord(
  section: ChartRecordsSection,
  recordId: string
): Promise<ApiResponse<unknown>> {
  return apiClient.post<unknown>('chart-records/delete.php', { section, record_id: recordId });
}

export async function recoverChartRecord(
  section: ChartRecordsSection,
  recordId: string
): Promise<ApiResponse<unknown>> {
  return apiClient.post<unknown>('chart-records/recovery.php', { section, record_id: recordId });
}

export async function permanentDeleteChartRecord(
  section: ChartRecordsSection,
  recordId: string
): Promise<ApiResponse<unknown>> {
  return apiClient.post<unknown>('chart-records/permanent-delete.php', { section, record_id: recordId });
}

export interface RecycleBinRecord {
  id: string;
  menu_section: string;
  section_label: string;
  snapshot_nim: string;
  snapshot_nama: string;
  snapshot_prodi: string;
  snapshot_fakultas: string;
  tahun_pelaporan: number;
  payload: Record<string, unknown>;
  deleted_at: string;
}

export interface RecycleBinPayload {
  records: RecycleBinRecord[];
  total: number;
  page: number;
  per_page: number;
}

export async function getRecycleBinRecords(
  opts?: { section?: string; page?: number; per_page?: number }
): Promise<ApiResponse<RecycleBinPayload>> {
  const params: Record<string, string> = {};
  if (opts?.section) params.section = opts.section;
  if (opts?.page != null) params.page = String(opts.page);
  if (opts?.per_page != null) params.per_page = String(opts.per_page);
  return apiClient.get<RecycleBinPayload>('chart-records/recycle-bin.php', { params });
}

export interface ChangeLogEntry {
  id: string;
  menu_section: string;
  section_label: string;
  record_id: string;
  action: string;
  action_label: string;
  admin_id: string;
  admin_nama: string | null;
  changed_at: string;
  old_data: unknown;
  new_data: unknown;
}

export interface ChangeLogsPayload {
  logs: ChangeLogEntry[];
  total: number;
  page: number;
  per_page: number;
}

export async function getChangeLogs(
  opts?: { section?: string; page?: number; per_page?: number }
): Promise<ApiResponse<ChangeLogsPayload>> {
  const params: Record<string, string> = {};
  if (opts?.section) params.section = opts.section;
  if (opts?.page != null) params.page = String(opts.page);
  if (opts?.per_page != null) params.per_page = String(opts.per_page);
  return apiClient.get<ChangeLogsPayload>('chart-records/change-logs.php', { params });
}

export interface UpdateChartRecordInput {
  tahun_pelaporan?: number;
  payload?: Record<string, unknown>;
  included_in_chart?: boolean;
  category?: string;
  subcategory?: string;
  tanggal?: string;
  verified?: boolean;
}

export async function updateChartRecord(
  section: ChartRecordsSection,
  recordId: string,
  input: UpdateChartRecordInput
): Promise<ApiResponse<unknown>> {
  return apiClient.post<unknown>('chart-records/update.php', {
    section,
    record_id: recordId,
    ...input,
  });
}

/** Hapus satu lampiran sertifikat (admin only). */
export async function deleteAchievementAttachment(attachmentId: string): Promise<ApiResponse<unknown>> {
  return apiClient.post<unknown>('achievements/attachments/delete.php', { attachment_id: attachmentId });
}

export interface RecycledAchievementAttachment {
  id: string;
  achievement_id: string;
  achievement_key: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  uploaded_at: string;
  deleted_at: string;
  deleted_by?: string | null;
  student_id: string;
  student_nim: string;
  student_nama: string;
}

export interface AchievementAttachmentRecyclePayload {
  records: RecycledAchievementAttachment[];
  total: number;
  page: number;
  per_page: number;
}

export async function getAchievementAttachmentRecycleBin(opts?: {
  search?: string;
  page?: number;
  per_page?: number;
}): Promise<ApiResponse<AchievementAttachmentRecyclePayload>> {
  const params: Record<string, string> = {};
  if (opts?.search) params.search = opts.search;
  if (opts?.page != null) params.page = String(opts.page);
  if (opts?.per_page != null) params.per_page = String(opts.per_page);
  return apiClient.get<AchievementAttachmentRecyclePayload>('achievements/attachments/recycle_bin.php', {
    params,
  });
}

export async function recoverAchievementAttachment(attachmentId: string): Promise<ApiResponse<unknown>> {
  return apiClient.post<unknown>('achievements/attachments/recover.php', { id: attachmentId });
}

export async function permanentDeleteAchievementAttachment(attachmentId: string): Promise<ApiResponse<unknown>> {
  return apiClient.post<unknown>('achievements/attachments/permanent_delete.php', { id: attachmentId });
}

/** Unggah sertifikat untuk achievement (admin only). */
export async function uploadAchievementAttachment(
  achievementId: string,
  file: File
): Promise<ApiResponse<{ id: string; file_name: string; file_type: string }>> {
  try {
    const base = (await import('@/lib/api-client')).getApiBaseUrl();
    const token = apiClient.getToken();
    const form = new FormData();
    form.append('achievement_id', achievementId);
    form.append('file', file);

    const response = await fetch(`${base}/achievements/attachments/upload.php`, {
      method: 'POST',
      headers: buildTokenHeaders(token),
      body: form,
    });

    const payload = await parseJsonObjectSafe(response);
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
        file_name: String(payload.file_name ?? file.name),
        file_type: String(payload.file_type ?? file.type),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload gagal',
    };
  }
}

/** Panggil export endpoint untuk log saja (format xlsx/pdf tidak mengembalikan file dari server). */
export async function logChartExport(
  section: ChartRecordsSection,
  format: 'xlsx' | 'pdf',
  year?: number | null,
  tab?: string | null
): Promise<void> {
  const base = (await import('@/lib/api-client')).getApiBaseUrl();
  const token = apiClient.getToken();
  const params = new URLSearchParams({ section, format });
  if (year != null) params.set('year', String(year));
  if (tab) params.set('tab', tab);
  await fetch(`${base}/insight/export.php?${params.toString()}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

/** Unduh export CSV untuk section (auth di-handle via header). */
export async function downloadChartRecordsCsv(
  section: ChartRecordsSection,
  year?: number | null,
  tab?: string | null
): Promise<{ success: boolean; error?: string }> {
  const base = (await import('@/lib/api-client')).getApiBaseUrl();
  const token = apiClient.getToken();
  const params = new URLSearchParams({ section, format: 'csv' });
  if (year != null) params.set('year', String(year));
  if (tab) params.set('tab', tab);
  const url = `${base}/insight/export.php?${params.toString()}`;
  try {
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const text = await res.text();
      let err = res.statusText;
      try {
        const j = JSON.parse(text);
        if (j.error) err = j.error;
      } catch {
        if (text) err = text.slice(0, 200);
      }
      return { success: false, error: err };
    }
    const blob = await res.blob();
    const name = `export-${section}-${new Date().toISOString().slice(0, 10)}.csv`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Export gagal' };
  }
}
