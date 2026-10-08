import { apiClient, getApiBaseUrl } from '@/lib/api-client';
import type { SatisfactionRespondent } from '@/types/evaluation.types';

function savePdf(blob: Blob, fileName: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

async function imageToPdf(blob: Blob): Promise<Blob> {
  const objectUrl = URL.createObjectURL(blob);
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Gambar bukti formulir tidak dapat dibaca.'));
      image.src = objectUrl;
    });
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: image.naturalWidth > image.naturalHeight ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const scale = Math.min((pageWidth - 20) / image.naturalWidth, (pageHeight - 20) / image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    doc.addImage(image, blob.type === 'image/png' ? 'PNG' : 'JPEG', (pageWidth - width) / 2, (pageHeight - height) / 2, width, height);
    return doc.output('blob');
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function downloadSatisfactionEvidencePdf(row: SatisfactionRespondent): Promise<void> {
  const token = apiClient.getToken();
  if (!token) throw new Error('Sesi telah berakhir. Silakan login kembali.');
  const response = await fetch(`${getApiBaseUrl()}/evaluations/download_satisfaction_evidence.php?respondent_id=${encodeURIComponent(row.id)}`, {
    headers: { Authorization: `Bearer ${token}`, 'X-Auth-Token': token },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(error?.error ?? 'Bukti formulir gagal diunduh. Silakan coba lagi.');
  }
  const blob = await response.blob();
  const mime = blob.type.split(';')[0].toLowerCase();
  if (!['application/pdf', 'image/jpeg', 'image/png'].includes(mime)) {
    throw new Error('Format bukti formulir tidak didukung.');
  }
  const fileName = `Bukti-Kepuasan-${row.nim || row.nama}`.replace(/[^\w-]/g, '_') + '.pdf';
  savePdf(mime === 'application/pdf' ? blob : await imageToPdf(blob), fileName);
}
