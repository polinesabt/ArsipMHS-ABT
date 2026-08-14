import { apiClient } from '@/lib/api-client';

export interface SystemErrorLogItem {
  id: string;
  user_id: string | null;
  username: string | null;
  role: 'student' | 'admin' | 'developer' | 'guest';
  feature_name: string;
  error_message: string;
  stack_trace: string | null;
  url: string | null;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface ErrorLogStats {
  total: number;
  admin: number;
  student: number;
  today: number;
}

export interface LogErrorPayload {
  feature_name?: string;
  error_message: string;
  stack_trace?: string;
  url?: string;
  role?: string;
}

export async function logSystemError(payload: LogErrorPayload): Promise<boolean> {
  try {
    const currentUrl = payload.url || (typeof window !== 'undefined' ? window.location.href : undefined);
    const feature = payload.feature_name || detectFeatureFromUrl(currentUrl);

    const res = await apiClient.post<{ id: string }>('logs/log_error.php', {
      feature_name: feature,
      error_message: payload.error_message,
      stack_trace: payload.stack_trace,
      url: currentUrl,
      role: payload.role,
    });
    return Boolean(res.success);
  } catch (e) {
    // Avoid infinite loop if logging itself fails
    console.warn('Failed to send error log to server:', e);
    return false;
  }
}

export async function getErrorLogs(params?: {
  role?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ stats: ErrorLogStats; logs: SystemErrorLogItem[] }> {
  try {
    const queryParams: Record<string, string | number> = {};
    if (params?.role) queryParams.role = params.role;
    if (params?.search) queryParams.search = params.search;
    if (params?.limit) queryParams.limit = params.limit;
    if (params?.offset) queryParams.offset = params.offset;

    const res = await apiClient.get<{
      stats: ErrorLogStats;
      data: SystemErrorLogItem[];
    }>('logs/get_error_logs.php', { params: queryParams });

    if (res.success && res.data) {
      return {
        stats: res.data.stats || { total: 0, admin: 0, student: 0, today: 0 },
        logs: res.data.data || [],
      };
    }
  } catch (e) {
    console.error('Failed to fetch error logs:', e);
  }
  return {
    stats: { total: 0, admin: 0, student: 0, today: 0 },
    logs: [],
  };
}

export async function clearErrorLogs(): Promise<boolean> {
  try {
    const res = await apiClient.post<{ message?: string }>('logs/clear_error_logs.php', {});
    return Boolean(res.success);
  } catch (e) {
    console.error('Failed to clear error logs:', e);
    return false;
  }
}

export function detectFeatureFromUrl(url?: string): string {
  if (!url) return 'General Application';
  const lowercaseUrl = url.toLowerCase();

  if (lowercaseUrl.includes('/admin/dosen')) return 'Modul Dosen';
  if (lowercaseUrl.includes('/admin/mahasiswa/evaluasi')) return 'Evaluasi Lulusan';
  if (lowercaseUrl.includes('/admin/mahasiswa/kustom-form')) return 'Form Kepuasan Builder';
  if (lowercaseUrl.includes('/admin/mahasiswa/ai-insight')) return 'AI Insight Dashboard';
  if (lowercaseUrl.includes('/admin/mahasiswa/dashboard')) return 'Dashboard Insight Mahasiswa';
  if (lowercaseUrl.includes('/admin/mahasiswa/pengelola')) return 'Pengelolaan Mahasiswa';
  if (lowercaseUrl.includes('/admin/select-dashboard')) return 'Portal Select Dashboard';
  if (lowercaseUrl.includes('/student/prestasi')) return 'Prestasi Mahasiswa';
  if (lowercaseUrl.includes('/student/riwayat-karir')) return 'Tracer Study & Karir';
  if (lowercaseUrl.includes('/student/form')) return 'Form Input Profil';
  if (lowercaseUrl.includes('/student/dashboard')) return 'Dashboard Mahasiswa';
  if (lowercaseUrl.includes('/validasi')) return 'Modul Autentikasi / Login';

  return 'Umum / Platform';
}

let isInitialized = false;

export function initGlobalErrorLogger(): void {
  if (typeof window === 'undefined' || isInitialized) return;
  isInitialized = true;

  window.addEventListener('error', (event) => {
    // Filter out simple script loading noise if desired, but capture uncaught errors
    const errorMsg = event.message || 'Uncaught JS Error';
    const stack = event.error?.stack || `Error at ${event.filename}:${event.lineno}:${event.colno}`;
    
    void logSystemError({
      error_message: errorMsg,
      stack_trace: stack,
      url: window.location.href,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const errorMsg = typeof reason === 'string' 
      ? reason 
      : (reason?.message || 'Unhandled Promise Rejection');
    const stack = reason?.stack || JSON.stringify(reason);

    void logSystemError({
      error_message: `[Promise Rejection] ${errorMsg}`,
      stack_trace: stack,
      url: window.location.href,
    });
  });
}
