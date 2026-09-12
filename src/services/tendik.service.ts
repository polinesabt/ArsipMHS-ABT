import { apiClient, type ApiResponse } from '@/lib/api-client';
import type { TendikProfile } from '@/types/student.types';

export interface TendikProfileUpdateResponse {
  profile: TendikProfile;
  nipChanged: boolean;
  token?: string;
  jwt?: string;
  refreshToken?: string;
}

export async function getOwnTendikProfile(): Promise<ApiResponse<TendikProfile>> {
  return apiClient.get<TendikProfile>('tendik/profile.php');
}

export async function updateOwnTendikProfile(profile: TendikProfile): Promise<ApiResponse<TendikProfileUpdateResponse>> {
  const response = await apiClient.put<TendikProfileUpdateResponse>('tendik/profile.php', profile);
  if (response.success && response.data?.token) {
    apiClient.setToken(response.data.token);
    if (response.data.refreshToken) apiClient.setRefreshToken(response.data.refreshToken);
  }
  return response;
}
