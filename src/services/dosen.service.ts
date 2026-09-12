import { apiClient, getApiBaseUrl, type ApiResponse } from '@/lib/api-client';
import type { DosenProfile } from '@/types/student.types';
import type { KontribusiDosenItem } from '@/data/mockKontribusiDosenData';
import type { KontribusiPenelitianDosenItem } from '@/data/mockPenelitianDosenData';
import type { KontribusiPengabdianDosenItem } from '@/data/mockPengabdianDosenData';
import type { WaktuMengajarItem } from '@/data/mockWaktuMengajarData';
import type { DosenLuaranItem } from '@/data/mockLuaranPenelitianPkmData';

export interface DosenSelfData {
  profile: DosenProfile;
  pengajaran: KontribusiDosenItem;
  penelitian: KontribusiPenelitianDosenItem;
  pengabdian: KontribusiPengabdianDosenItem;
  waktuMengajar: WaktuMengajarItem[];
  luaran: DosenLuaranItem;
}

export type DosenImportModule =
  | 'pengelolaan'
  | 'pengajaran'
  | 'penelitian'
  | 'pengabdian'
  | 'waktu_mengajar'
  | 'tendik'
  | 'luaran';

export interface DosenImportDetail {
  row: number;
  identity?: string | null;
  status: 'inserted' | 'skipped' | 'error';
  message: string;
}

export interface DosenImportSummary {
  module: DosenImportModule;
  total_rows: number;
  inserted: number;
  skipped: number;
  failed: number;
  affected_dosen: number;
  import_log_id: string;
  details: DosenImportDetail[];
}

export interface DosenProfileUpdateResponse {
  profile: DosenProfile;
  nidnChanged: boolean;
  token?: string;
  jwt?: string;
  refreshToken?: string;
}

export async function getOwnDosenProfile(): Promise<ApiResponse<DosenProfile>> {
  return apiClient.get<DosenProfile>('dosen/profile.php');
}

export async function updateOwnDosenProfile(profile: DosenProfile): Promise<ApiResponse<DosenProfileUpdateResponse>> {
  const response = await apiClient.put<DosenProfileUpdateResponse>('dosen/profile.php', profile);
  if (response.success && response.data?.token) {
    apiClient.setToken(response.data.token);
    if (response.data.refreshToken) apiClient.setRefreshToken(response.data.refreshToken);
  }
  return response;
}

export type DosenSelfSection = 'pengajaran' | 'penelitian' | 'pengabdian' | 'waktu_mengajar' | 'luaran';

export async function getOwnDosenData(): Promise<ApiResponse<DosenSelfData>> {
  return apiClient.get<DosenSelfData>('dosen/self-data.php');
}

export async function saveOwnDosenSection(section: DosenSelfSection, data: unknown): Promise<ApiResponse<DosenSelfData>> {
  return apiClient.put<DosenSelfData>(`dosen/self-data.php?section=${encodeURIComponent(section)}`, data);
}

export async function deleteOwnDosenEwmp(tahunAkademik: string): Promise<ApiResponse<DosenSelfData>> {
  return apiClient.delete<DosenSelfData>(`dosen/self-data.php?section=waktu_mengajar&tahunAkademik=${encodeURIComponent(tahunAkademik)}`);
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}`, 'X-Auth-Token': token } : {};
}

export async function downloadDosenImportTemplate(module: DosenImportModule): Promise<void> {
  const response = await fetch(`${getApiBaseUrl()}/dosen/import/template.php?module=${encodeURIComponent(module)}`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(payload?.error || 'Gagal mengunduh template Excel.');
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `template-import-dosen-${module}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function previewDosenImportFile(file: File, expectedModule?: DosenImportModule): Promise<{ headers: string[]; rows: string[][]; total: number }> {
  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());
  const worksheet = workbook.worksheets[0];
  const meta = workbook.getWorksheet('_meta');
  if (!worksheet || !meta) throw new Error('File bukan template impor dosen yang valid.');
  const version = String(meta.getCell('B1').value ?? '').trim();
  if (version !== '1.0' && version !== '1') throw new Error('Versi template tidak didukung. Unduh template terbaru.');
  const module = String(meta.getCell('B2').value ?? '').trim();
  if (expectedModule && module !== expectedModule) throw new Error('Template berasal dari modul berbeda. Unduh template yang sesuai.');
  const columnCount = Math.max(worksheet.getRow(8).cellCount, worksheet.getRow(9).cellCount);
  const headers: string[] = [];
  for (let column = 1; column <= columnCount; column++) {
    const upper = String(worksheet.getRow(8).getCell(column).value ?? '').trim();
    const lower = String(worksheet.getRow(9).getCell(column).value ?? '').trim();
    headers.push(lower && lower !== upper ? `${upper} — ${lower}`.replace(/^ — /, '') : upper || lower);
  }
  const rows: string[][] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber < 10) return;
    const values = headers.map((_, index) => String(row.getCell(index + 1).text ?? '').trim());
    const dataValues = values.slice(3);
    if (dataValues.some(Boolean) || (values[0] && values[1])) rows.push(values);
  });
  return { headers, rows: rows.slice(0, 10), total: rows.length };
}

export async function uploadDosenImport(module: DosenImportModule, file: File): Promise<ApiResponse<DosenImportSummary>> {
  const form = new FormData();
  form.append('module', module);
  form.append('file', file);
  try {
    const response = await fetch(`${getApiBaseUrl()}/dosen/import/upload.php`, {
      method: 'POST',
      headers: authHeaders(),
      body: form,
    });
    const payload = await response.json().catch(() => ({ success: false, error: 'Respons server tidak valid.' }));
    return payload as ApiResponse<DosenImportSummary>;
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Gagal mengunggah file.' };
  }
}
