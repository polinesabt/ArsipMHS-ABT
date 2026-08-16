/**
 * Admin Management Service
 * Provides API client functions to manage Admin accounts and module edit permissions.
 */

import { apiClient, ApiResponse } from '@/lib/api-client';
import type { AdminAccountItem, CreateAdminInput } from '@/types/student.types';

export interface AdminListResponse {
  success: boolean;
  data: AdminAccountItem[];
  total?: number;
  error?: string;
}

export interface AdminActionResponse {
  success: boolean;
  data?: AdminAccountItem;
  message?: string;
  error?: string;
}

/**
 * Fetch all active admin accounts
 */
export async function getAdminAccounts(): Promise<AdminAccountItem[]> {
  try {
    const res = await apiClient.get<AdminAccountItem[]>('admins/list.php');
    if (res.success && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch admin accounts:', error);
    return [];
  }
}

/**
 * Create a new admin account with designated module permissions
 */
export async function createAdminAccount(
  input: CreateAdminInput
): Promise<ApiResponse<AdminAccountItem>> {
  return apiClient.post<AdminAccountItem>('admins/create.php', {
    username: input.username.trim(),
    nama: input.nama.trim(),
    password: input.password,
    can_edit_dosen: input.can_edit_dosen ?? true,
    can_edit_mahasiswa: input.can_edit_mahasiswa ?? true,
  });
}

/**
 * Update module permissions for a specific admin account
 */
export async function updateAdminPermissions(
  id: string,
  permissions: { can_edit_dosen?: boolean; can_edit_mahasiswa?: boolean }
): Promise<ApiResponse<{ id: string; can_edit_dosen: boolean; can_edit_mahasiswa: boolean }>> {
  return apiClient.post('admins/update_permissions.php', {
    id,
    ...permissions,
  });
}

/**
 * Delete or deactivate an admin account
 */
export async function deleteAdminAccount(
  id: string
): Promise<ApiResponse<{ id: string; username: string }>> {
  return apiClient.post('admins/delete.php', {
    id,
  });
}
