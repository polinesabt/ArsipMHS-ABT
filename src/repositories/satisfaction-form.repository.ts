/**
 * Satisfaction Form (Custom Form Kepuasan Pengguna) API
 */

import { apiClient, ApiResponse } from '@/lib/api-client';
import type {
  SatisfactionFormDefinition,
  SatisfactionFormTemplate,
  SatisfactionRecycleBinPayload,
  SatisfactionTemplateRecycleRecord,
} from '@/types/satisfaction-form.types';

export async function getSatisfactionTemplates(): Promise<
  ApiResponse<SatisfactionFormTemplate[]>
> {
  return apiClient.get<SatisfactionFormTemplate[]>('satisfaction-forms/list.php');
}

export async function getSatisfactionTemplate(
  id: string
): Promise<ApiResponse<SatisfactionFormTemplate>> {
  return apiClient.get<SatisfactionFormTemplate>('satisfaction-forms/get.php', {
    params: { id },
  });
}

export async function createSatisfactionTemplate(payload: {
  title: string;
  definition: SatisfactionFormDefinition;
}): Promise<ApiResponse<SatisfactionFormTemplate>> {
  return apiClient.post<SatisfactionFormTemplate>('satisfaction-forms/create.php', payload);
}

export async function updateSatisfactionTemplate(payload: {
  id: string;
  title: string;
  definition: SatisfactionFormDefinition;
}): Promise<ApiResponse<SatisfactionFormTemplate>> {
  const res = await apiClient.post<SatisfactionFormTemplate>('satisfaction-forms/update.php', payload);
  return res;
}

export async function deleteSatisfactionTemplate(
  id: string
): Promise<ApiResponse<{ message?: string }>> {
  return apiClient.post<{ message?: string }>('satisfaction-forms/delete.php', { id });
}

export async function setActiveSatisfactionTemplate(
  templateId: string
): Promise<ApiResponse<{ message?: string; active_template_id?: string }>> {
  return apiClient.post<{ message?: string; active_template_id?: string }>(
    'satisfaction-forms/set_active.php',
    { template_id: templateId }
  );
}

export async function getActiveSatisfactionTemplate(): Promise<
  ApiResponse<SatisfactionFormTemplate | null>
> {
  return apiClient.get<SatisfactionFormTemplate | null>('satisfaction-forms/active.php');
}

export async function getSatisfactionTemplateRecycleBin(opts?: {
  search?: string;
  page?: number;
  per_page?: number;
}): Promise<ApiResponse<SatisfactionRecycleBinPayload>> {
  const params: Record<string, string> = {};
  if (opts?.search) params.search = opts.search;
  if (opts?.page != null) params.page = String(opts.page);
  if (opts?.per_page != null) params.per_page = String(opts.per_page);
  return apiClient.get<SatisfactionRecycleBinPayload>('satisfaction-forms/recycle_bin.php', {
    params,
  });
}

export async function recoverSatisfactionTemplate(
  id: string
): Promise<ApiResponse<{ message?: string }>> {
  return apiClient.post<{ message?: string }>('satisfaction-forms/recover.php', { id });
}

export async function permanentDeleteSatisfactionTemplate(
  id: string
): Promise<ApiResponse<{ message?: string }>> {
  return apiClient.post<{ message?: string }>('satisfaction-forms/permanent_delete.php', { id });
}
