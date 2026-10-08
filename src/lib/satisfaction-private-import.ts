import { apiClient, getApiBaseUrl } from '@/lib/api-client';

export interface SatisfactionImportResult {
  students: number;
  ratings: number;
  proofs: number;
}

async function sendForm(form: FormData): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
  const token = apiClient.getToken();
  if (!token) throw new Error('Sesi admin telah berakhir. Silakan login kembali.');
  const response = await fetch(`${getApiBaseUrl()}/evaluations/import_satisfaction_bundle.php`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'X-Auth-Token': token },
    body: form,
  });
  const payload = await response.json().catch(() => null) as { success?: boolean; data?: Record<string, unknown>; error?: string } | null;
  if (!response.ok || !payload?.success) throw new Error(payload?.error ?? `Unggah gagal (HTTP ${response.status}).`);
  return { success: true, data: payload.data };
}

function request(action: string, fields: Record<string, string>, chunk?: Blob): Promise<{ success: boolean; data?: Record<string, unknown> }> {
  const form = new FormData();
  form.append('action', action);
  for (const [key, value] of Object.entries(fields)) form.append(key, value);
  if (chunk) form.append('chunk', chunk, 'proofs.zip.part');
  return sendForm(form);
}

export async function importSatisfactionPrivateBundle(
  file: File,
  onProgress: (percent: number) => void,
): Promise<SatisfactionImportResult> {
  if (!file.name.toLowerCase().endsWith('.zip') || file.size < 1 || file.size > 30_000_000) {
    throw new Error('Pilih paket ZIP kepuasan pengguna dengan ukuran maksimal 30 MB.');
  }
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  const sha256 = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  onProgress(5);
  const started = await request('start', { size: String(file.size), sha256 });
  const uploadId = String(started.data?.upload_id ?? '');
  const chunkSize = Number(started.data?.chunk_size ?? 0);
  if (!uploadId || chunkSize < 1 || chunkSize > 524288) throw new Error('Sesi unggah tidak valid.');
  try {
    const chunks = Math.ceil(file.size / chunkSize);
    for (let index = 0; index < chunks; index++) {
      await request('chunk', { upload_id: uploadId, index: String(index) }, file.slice(index * chunkSize, (index + 1) * chunkSize));
      onProgress(5 + Math.round((index + 1) / chunks * 90));
    }
    const finished = await request('finish', { upload_id: uploadId });
    const { students, ratings, proofs } = finished.data ?? {};
    if (typeof students !== 'number' || typeof ratings !== 'number' || typeof proofs !== 'number') {
      throw new Error('Respons impor tidak valid. Muat ulang untuk melihat data terbaru.');
    }
    onProgress(100);
    return { students, ratings, proofs };
  } catch (error) {
    await request('cancel', { upload_id: uploadId }).catch(() => undefined);
    throw error;
  }
}
