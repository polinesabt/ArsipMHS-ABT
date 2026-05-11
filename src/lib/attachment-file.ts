import { apiClient, getApiBaseUrl } from '@/lib/api-client';

function buildAuthHeaders(token: string | null): Record<string, string> {
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
    'X-Auth-Token': token,
  };
}

async function parseErrorMessage(response: Response): Promise<string> {
  const rawText = await response.text();
  if (!rawText) return `HTTP ${response.status}`;
  try {
    const parsed = JSON.parse(rawText) as { error?: string; message?: string };
    if (parsed.error) return parsed.error;
    if (parsed.message) return parsed.message;
  } catch {
    return rawText.slice(0, 180);
  }
  return `HTTP ${response.status}`;
}

export async function fetchAttachmentBlobUrl(attachmentId: string): Promise<string> {
  const baseUrl = getApiBaseUrl();
  const token = apiClient.getToken();
  const response = await fetch(
    `${baseUrl}/achievements/attachments/serve.php?id=${encodeURIComponent(attachmentId)}`,
    {
      method: 'GET',
      headers: buildAuthHeaders(token),
    }
  );
  if (!response.ok) {
    const message = await parseErrorMessage(response);
    throw new Error(message || 'Gagal memuat lampiran.');
  }
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export async function downloadAttachment(attachmentId: string, fileName: string): Promise<void> {
  const blobUrl = await fetchAttachmentBlobUrl(attachmentId);
  try {
    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = fileName || 'attachment';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}
