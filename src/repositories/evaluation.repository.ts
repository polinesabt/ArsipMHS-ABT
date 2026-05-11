/**
 * Evaluation Repository
 */

import { apiClient, ApiResponse } from '@/lib/api-client';
import type {
  Evaluation,
  EvaluationChartData,
  EvaluationResultDetail,
  EvaluationResultRow,
  EvaluationStatus,
  EvaluationStudentTarget,
  SurveyDataResponse,
  SurveyFormPayload,
} from '@/types/evaluation.types';

export interface CreateEvaluationPayload {
  title: string;
  short_message?: string;
  status?: EvaluationStatus;
  start_at: string;
  end_at?: string;
  reminder_enabled?: boolean;
  reminder_interval_days?: number;
}

export interface EvaluationStudentsFilter {
  evaluation_id?: string;
  tahun_masuk?: number;
  tahun_lulus?: number;
  evaluation_status?: 'not_sent' | 'sent' | 'submitted';
}

export interface SendEvaluationNotificationsPayload {
  evaluation_id: string;
  student_ids: string[];
  title?: string;
  message?: string;
}

export interface EvaluationRecycleRecord extends Evaluation {
  deleted_at: string;
  deleted_by?: string | null;
  deleted_by_name?: string | null;
  created_by_name?: string | null;
}

export interface EvaluationRecyclePayload {
  records: EvaluationRecycleRecord[];
  total: number;
  page: number;
  per_page: number;
}

export async function getEvaluations(
  status?: EvaluationStatus
): Promise<ApiResponse<Evaluation[]>> {
  const options = status ? { params: { status } } : undefined;
  return apiClient.get<Evaluation[]>('evaluations/list.php', options);
}

export async function createEvaluation(
  payload: CreateEvaluationPayload
): Promise<ApiResponse<Evaluation>> {
  return apiClient.post<Evaluation>('evaluations/create.php', payload);
}

export async function closeEvaluation(
  id: string
): Promise<ApiResponse<{ success: boolean }>> {
  return apiClient.post<{ success: boolean }>('evaluations/close.php', { id });
}

export async function deleteEvaluation(
  id: string
): Promise<ApiResponse<{ success: boolean }>> {
  return apiClient.post<{ success: boolean }>('evaluations/delete.php', { id });
}

export async function getEvaluationRecycleBin(opts?: {
  search?: string;
  page?: number;
  per_page?: number;
}): Promise<ApiResponse<EvaluationRecyclePayload>> {
  const params: Record<string, string> = {};
  if (opts?.search) params.search = opts.search;
  if (opts?.page != null) params.page = String(opts.page);
  if (opts?.per_page != null) params.per_page = String(opts.per_page);
  return apiClient.get<EvaluationRecyclePayload>('evaluations/recycle_bin.php', { params });
}

export async function recoverEvaluation(
  id: string
): Promise<ApiResponse<EvaluationRecycleRecord>> {
  return apiClient.post<EvaluationRecycleRecord>('evaluations/recover.php', { id });
}

export async function permanentDeleteEvaluation(
  id: string
): Promise<ApiResponse<{ evaluation_id: string }>> {
  return apiClient.post<{ evaluation_id: string }>('evaluations/permanent_delete.php', { id });
}

export async function getEvaluationStudents(
  filters: EvaluationStudentsFilter
): Promise<ApiResponse<EvaluationStudentTarget[]>> {
  return apiClient.get<EvaluationStudentTarget[]>('evaluations/students.php', {
    params: {
      ...(filters.evaluation_id ? { evaluation_id: filters.evaluation_id } : {}),
      ...(typeof filters.tahun_masuk === 'number' ? { tahun_masuk: filters.tahun_masuk } : {}),
      ...(typeof filters.tahun_lulus === 'number' ? { tahun_lulus: filters.tahun_lulus } : {}),
      ...(filters.evaluation_status ? { evaluation_status: filters.evaluation_status } : {}),
    },
  });
}

export async function sendEvaluationNotifications(
  payload: SendEvaluationNotificationsPayload
): Promise<ApiResponse<{
  sent_count: number;
  skipped_count: number;
  email_sent_count?: number;
  resolved_template_id?: string | null;
  resolved_template_updated_at?: string | null;
}>> {
  return apiClient.post<{
    sent_count: number;
    skipped_count: number;
    email_sent_count?: number;
    resolved_template_id?: string | null;
    resolved_template_updated_at?: string | null;
  }>(
    'evaluations/send_notifications.php',
    payload,
    { timeout: 120000 }
  );
}

export async function getEvaluationCharts(
  evaluationId: string | 'all' = 'all'
): Promise<ApiResponse<EvaluationChartData>> {
  return apiClient.get<EvaluationChartData>('evaluations/charts.php', {
    params: {
      evaluation_id: evaluationId,
    },
  });
}

export async function getEvaluationResults(
  evaluationId?: string
): Promise<ApiResponse<EvaluationResultRow[]>> {
  return apiClient.get<EvaluationResultRow[]>('evaluations/results.php', {
    params: evaluationId ? { evaluation_id: evaluationId } : {},
  });
}

export async function getEvaluationResultDetail(
  responseId: string
): Promise<ApiResponse<EvaluationResultDetail>> {
  return apiClient.get<EvaluationResultDetail>('evaluations/results.php', {
    params: { response_id: responseId },
  });
}

export async function getSurveyByToken(
  token: string
): Promise<ApiResponse<SurveyDataResponse>> {
  return apiClient.get<SurveyDataResponse>('evaluations/survey.php', {
    params: { token, _t: Date.now() },
  });
}

export async function submitSurvey(
  payload: SurveyFormPayload
): Promise<ApiResponse<{ response_id: string; submitted_at: string }>> {
  return apiClient.post<{ response_id: string; submitted_at: string }>(
    'evaluations/submit.php',
    payload
  );
}

export async function submitCustomSurvey(payload: {
  token: string;
  answers: Record<string, string | string[] | Record<string, string>>;
  attachment_path?: string | null;
}): Promise<ApiResponse<{ response_id: string; submitted_at: string }>> {
  return apiClient.post<{ response_id: string; submitted_at: string }>(
    'evaluations/submit_custom.php',
    payload
  );
}

export interface SatisfactionAttachmentItem {
  response_id: string;
  type: 'legacy' | 'custom';
  evaluation_id: string;
  evaluation_title: string;
  student_id: string;
  nim: string;
  nama: string;
  submitted_at: string;
  attachment_path: string;
  file_name: string;
}

export async function getSatisfactionAttachments(
  evaluationId?: string
): Promise<ApiResponse<SatisfactionAttachmentItem[]>> {
  const params: Record<string, string> = {};
  if (evaluationId) params.evaluation_id = evaluationId;
  return apiClient.get<SatisfactionAttachmentItem[]>(
    'evaluations/satisfaction_attachments_list.php',
    { params: Object.keys(params).length ? params : undefined }
  );
}

/** Upload lampiran form kepuasan (PDF/PNG). Token = survey token. */
export async function uploadSurveyAttachment(
  token: string,
  file: File
): Promise<ApiResponse<{ path: string; file_name: string; file_type: string }>> {
  const baseUrl = (await import('@/lib/api-client')).getApiBaseUrl();
  const form = new FormData();
  form.append('token', token);
  form.append('file', file);
  const res = await fetch(`${baseUrl}/evaluations/upload_attachment.php`, {
    method: 'POST',
    body: form,
    headers: {},
  });
  const data = await res.json();
  if (!res.ok) {
    return { success: false, error: data?.error ?? 'Gagal mengunggah lampiran' };
  }
  if (!data?.success || !data?.path) {
    return { success: false, error: data?.error ?? 'Respons tidak valid' };
  }
  return {
    success: true,
    data: {
      path: data.path,
      file_name: data.file_name ?? file.name,
      file_type: data.file_type ?? file.type,
    },
  };
}
