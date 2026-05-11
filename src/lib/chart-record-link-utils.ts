const PUBLICATIONS_URL_KEYS = ['url_publikasi', 'url'] as const;
const GENERIC_URL_KEYS = [
  ...PUBLICATIONS_URL_KEYS,
  'link_produk',
  'linkProduk',
  'url_proyek',
  'urlProyek',
  'link',
  'tautan',
  'output',
] as const;

function getNormalizedText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function resolveUrlFromKeys(
  payload: Record<string, unknown>,
  keys: readonly string[]
): string | null {
  for (const key of keys) {
    const candidate = getNormalizedText(payload[key]);
    if (!candidate) continue;
    if (!isValidHttpUrl(candidate)) continue;
    return candidate;
  }
  return null;
}

function resolveUrlFromText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  if (text === '') return null;

  const match = text.match(/https?:\/\/[^\s<>"']+/i);
  if (!match) return null;
  const candidate = match[0].trim();
  return isValidHttpUrl(candidate) ? candidate : null;
}

export function resolveChartRecordExternalUrl(
  payload: Record<string, unknown> | null | undefined,
  section: string | null | undefined
): string | null {
  if (!payload || typeof payload !== 'object') return null;

  const normalizedSection = String(section ?? '').trim().toLowerCase();
  const keys = normalizedSection === 'publications'
    ? PUBLICATIONS_URL_KEYS
    : GENERIC_URL_KEYS;
  const directUrl = resolveUrlFromKeys(payload, keys);
  if (directUrl) return directUrl;

  const fromDescription = resolveUrlFromText(payload.description);
  if (fromDescription) return fromDescription;
  return resolveUrlFromText(payload.deskripsi);
}
