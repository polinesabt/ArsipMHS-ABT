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
): Promise<ApiResponse<{ sent_count: number; skipped_count: number }>> {
  return apiClient.post<{ sent_count: number; skipped_count: number }>(
    'evaluations/send_notifications.php',
    payload
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
    params: { token },
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
