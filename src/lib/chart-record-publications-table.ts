import type { PublicationsTab } from '@/types/insight-tabs';

export type PublicationTableTab = PublicationsTab;

export type PublicationColumnKey =
  | 'judul'
  | 'level'
  | 'jenisPerolehan'
  | 'namaDosen'
  | 'mitraKegiatan'
  | 'tahun'
  | 'jenisKegiatan';

export interface PublicationColumnConfig {
  key: PublicationColumnKey;
  label: string;
}

const DASH = '-';

const PUBLICATION_COLUMN_CONFIGS_BY_TAB: Record<PublicationTableTab, PublicationColumnConfig[]> = {
  jurnal: [
    { key: 'judul', label: 'Judul Jurnal' },
    { key: 'level', label: 'Level Jurnal' },
    { key: 'jenisPerolehan', label: 'Jenis Perolehan' },
    { key: 'namaDosen', label: 'Nama Dosen' },
    { key: 'tahun', label: 'Tahun' },
  ],
  seminar: [
    { key: 'judul', label: 'Judul Publikasi Seminar' },
    { key: 'level', label: 'Level Seminar' },
    { key: 'jenisPerolehan', label: 'Jenis Perolehan' },
    { key: 'namaDosen', label: 'Nama Dosen' },
    { key: 'tahun', label: 'Tahun' },
  ],
  pagelaran: [
    { key: 'judul', label: 'Judul Kegiatan' },
    { key: 'jenisKegiatan', label: 'Jenis Kegiatan' },
    { key: 'level', label: 'Level Kegiatan' },
    { key: 'mitraKegiatan', label: 'Mitra Kegiatan' },
    { key: 'tahun', label: 'Tahun' },
  ],
};

const JOURNAL_LEVEL_LABELS: Record<string, string> = {
  national_non_accredited: 'Nasional Tidak Terakreditasi',
  national_accredited: 'Nasional Terakreditasi',
  international: 'Internasional',
  reputable_international: 'Internasional Bereputasi',
};

const SEMINAR_LEVEL_LABELS: Record<string, string> = {
  local: 'Lokal/Wilayah/Perguruan Tinggi',
  national: 'Nasional',
  international: 'Internasional',
};

const PAGELARAN_LEVEL_LABELS: Record<string, string> = {
  regional: 'Wilayah',
  national: 'Nasional',
  international: 'Internasional',
};

const ACQUISITION_LABELS: Record<string, string> = {
  mandiri: 'Mandiri',
  kolaborasi_dosen: 'Kolaborasi dengan Dosen',
};

const PAGELARAN_TYPE_LABELS: Record<string, string> = {
  conference: 'Presentasi Konferensi',
  presentasi: 'Presentasi Ilmiah',
  presentation: 'Presentasi Ilmiah',
  oral_presentation: 'Presentasi Lisan',
  poster_presentation: 'Presentasi Poster',
  expo: 'Pameran/Expo',
  exhibition: 'Pameran/Expo',
  pameran: 'Pameran/Expo',
  pagelaran: 'Pagelaran',
};

export function resolvePublicationTableTab(tab: string | null | undefined): PublicationTableTab {
  if (tab === 'seminar') return 'seminar';
  if (tab === 'pagelaran') return 'pagelaran';
  return 'jurnal';
}

export function getPublicationColumnConfigs(tab: PublicationTableTab): PublicationColumnConfig[] {
  return PUBLICATION_COLUMN_CONFIGS_BY_TAB[tab];
}

export function getPublicationColumnValue(params: {
  key: PublicationColumnKey;
  payload: Record<string, unknown>;
  tab: PublicationTableTab;
  year: number;
}): string {
  const { key, payload, tab, year } = params;

  if (key === 'judul') return getPublicationTitle(payload);
  if (key === 'level') return getPublicationLevelLabel(payload, tab);
  if (key === 'jenisPerolehan') return getPublicationAcquisitionLabel(payload);
  if (key === 'namaDosen') return getPublicationLecturerName(payload);
  if (key === 'mitraKegiatan') return tab === 'pagelaran' ? getPublicationPartnerLabel(payload) : DASH;
  if (key === 'tahun') return Number.isFinite(year) ? String(year) : DASH;
  if (key === 'jenisKegiatan') return tab === 'pagelaran' ? getPublicationEventTypeLabel(payload) : DASH;
  return DASH;
}

function getPublicationTitle(payload: Record<string, unknown>): string {
  const title =
    normalizePayloadText(payload.judul_publikasi)
    ?? normalizePayloadText(payload.judulPublikasi)
    ?? normalizePayloadText(payload.title)
    ?? normalizePayloadText(payload.judul);
  return title ?? DASH;
}

function getPublicationLevelLabel(payload: Record<string, unknown>, tab: PublicationTableTab): string {
  const rawLevel =
    normalizePayloadText(payload.level_seminar)
    ?? normalizePayloadText(payload.levelSeminar)
    ?? normalizePayloadText(payload.level_diseminasi)
    ?? normalizePayloadText(payload.levelDiseminasi)
    ?? normalizePayloadText(payload.tingkat);
  if (!rawLevel) return DASH;

  const normalizedLevel = normalizePublicationLevel(rawLevel, tab);
  if (tab === 'jurnal') {
    return JOURNAL_LEVEL_LABELS[normalizedLevel] ?? humanizeToken(normalizedLevel);
  }
  if (tab === 'seminar') {
    return SEMINAR_LEVEL_LABELS[normalizedLevel] ?? humanizeToken(normalizedLevel);
  }
  return PAGELARAN_LEVEL_LABELS[normalizedLevel] ?? humanizeToken(normalizedLevel);
}

function getPublicationAcquisitionLabel(payload: Record<string, unknown>): string {
  const raw =
    normalizePayloadText(payload.jenis_perolehan)
    ?? normalizePayloadText(payload.jenisPerolehan)
    ?? normalizePayloadText(payload.perolehan)
    ?? normalizePayloadText(payload.acquisition_type)
    ?? normalizePayloadText(payload.acquisitionType);
  if (!raw) {
    const fallbackLecturerName =
      normalizePayloadText(payload.nama_dosen)
      ?? normalizePayloadText(payload.namaDosen)
      ?? normalizePayloadText(payload.peran_penulis)
      ?? normalizePayloadText(payload.peranPenulis);
    return fallbackLecturerName ? ACQUISITION_LABELS.kolaborasi_dosen : DASH;
  }

  const normalized = raw.toLowerCase().trim().replace(/\s+/g, '_').replace(/-+/g, '_');
  if (normalized === 'kolaborasi' || normalized === 'kolaborasi_dosen') {
    return ACQUISITION_LABELS.kolaborasi_dosen;
  }
  if (normalized === 'mandiri') {
    return ACQUISITION_LABELS.mandiri;
  }
  return humanizeToken(normalized);
}

function getPublicationLecturerName(payload: Record<string, unknown>): string {
  const name =
    normalizePayloadText(payload.nama_dosen)
    ?? normalizePayloadText(payload.namaDosen)
    ?? normalizePayloadText(payload.nama_dosen_pendamping)
    ?? normalizePayloadText(payload.namaDosenPendamping)
    ?? normalizePayloadText(payload.peran_penulis)
    ?? normalizePayloadText(payload.peranPenulis);

  const rawAcquisition =
    normalizePayloadText(payload.jenis_perolehan)
    ?? normalizePayloadText(payload.jenisPerolehan)
    ?? normalizePayloadText(payload.perolehan);
  const normalizedAcquisition = rawAcquisition
    ? rawAcquisition.toLowerCase().trim().replace(/\s+/g, '_').replace(/-+/g, '_')
    : '';
  const isKolaborasi =
    normalizedAcquisition === 'kolaborasi_dosen'
    || normalizedAcquisition === 'kolaborasi'
    || Boolean(name);
  if (!isKolaborasi) return DASH;

  return name ?? DASH;
}

function getPublicationEventTypeLabel(payload: Record<string, unknown>): string {
  const rawSubcategory =
    normalizePayloadText(payload.subcategory)
    ?? normalizePayloadText(payload.jenis_kegiatan)
    ?? normalizePayloadText(payload.jenisKegiatan);
  if (!rawSubcategory) return DASH;

  const normalized = rawSubcategory.toLowerCase().trim().replace(/\s+/g, '_').replace(/-+/g, '_');
  return PAGELARAN_TYPE_LABELS[normalized] ?? humanizeToken(normalized);
}

function getPublicationPartnerLabel(payload: Record<string, unknown>): string {
  const partner =
    normalizePayloadText(payload.penyelenggara)
    ?? normalizePayloadText(payload.mitra_kegiatan)
    ?? normalizePayloadText(payload.mitraKegiatan)
    ?? normalizePayloadText(payload.mitra)
    ?? normalizePayloadText(payload.partner);
  return partner ?? DASH;
}

function normalizePayloadText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  return text.length > 0 ? text : null;
}

function normalizePublicationLevel(rawLevel: string, tab: PublicationTableTab): string {
  const normalized = rawLevel.toLowerCase().trim().replace(/\s+/g, '_').replace(/-+/g, '_');

  if (tab === 'jurnal') {
    if (normalized === 'national') return 'national_non_accredited';
    if (normalized === 'internasional' || normalized === 'international') return 'international';
    if (normalized === 'international_reputable') return 'reputable_international';
    return normalized;
  }

  if (tab === 'seminar') {
    if (['regional', 'wilayah', 'lokal', 'local', 'perguruan_tinggi', 'kampus', 'pt'].includes(normalized)) return 'local';
    if (normalized === 'internasional') return 'international';
    return normalized;
  }

  if (['regional', 'wilayah', 'lokal', 'local', 'perguruan_tinggi', 'kampus', 'pt'].includes(normalized)) return 'regional';
  if (normalized === 'internasional') return 'international';
  return normalized;
}

function humanizeToken(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
