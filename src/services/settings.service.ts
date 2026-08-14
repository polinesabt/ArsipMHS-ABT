import { apiClient } from '@/lib/api-client';

export interface SystemSettings {
  dosen_module_enabled: string;
  [key: string]: string;
}

export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    const res = await apiClient.get<SystemSettings>('/backend/api/settings/get_settings.php');
    if (res.success && res.data) {
      return res.data;
    }
  } catch (e) {
    console.warn('Failed to fetch system settings:', e);
  }
  return { dosen_module_enabled: 'true' };
}

export async function updateSystemSetting(key: string, value: string): Promise<boolean> {
  try {
    const res = await apiClient.post<{ key: string; value: string }>('/backend/api/settings/update_setting.php', {
      key,
      value,
    });
    return Boolean(res.success);
  } catch (e) {
    console.error('Failed to update setting:', e);
    return false;
  }
}
