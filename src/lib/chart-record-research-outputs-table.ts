import { RESEARCH_OUTPUT_SUBTYPE_LABELS, type ResearchOutputSubtype } from '@/types/achievement.types';

export type ResearchOutputsTableTab = 'haki' | 'technology' | 'other';

export type ResearchOutputColumnKey =
  | 'jenisLuaran'
  | 'judulLuaran'
  | 'jenisPerolehan'
  | 'namaDosen'
  | 'tanggalLuaran'
  | 'tahun';

export interface ResearchOutputColumnConfig {
  key: ResearchOutputColumnKey;
  label: string;
}

const DASH = '-';

const RESEARCH_OUTPUT_COLUMN_CONFIGS: ResearchOutputColumnConfig[] = [
  { key: 'jenisLuaran', label: 'Jenis Luaran' },
  { key: 'judulLuaran', label: 'Judul Luaran' },
  { key: 'jenisPerolehan', label: 'Jenis Perolehan' },
  { key: 'namaDosen', label: 'Nama Dosen' },
  { key: 'tanggalLuaran', label: 'Tanggal Luaran' },
  { key: 'tahun', label: 'Tahun' },
];

const ACQUISITION_LABELS: Record<string, string> = {
  mandiri: 'Mandiri',
  kolaborasi_dosen: 'Kolaborasi Dosen',
};

export function resolveResearchOutputsTableTab(tab: string | null | undefined): ResearchOutputsTableTab {
  if (tab === 'technology') return 'technology';
  if (tab === 'other') return 'other';
  return 'haki';
}

export function getResearchOutputColumnConfigs(): ResearchOutputColumnConfig[] {
  return RESEARCH_OUTPUT_COLUMN_CONFIGS;
}

export function getResearchOutputColumnValue(params: {
  key: ResearchOutputColumnKey;
  payload: Record<string, unknown>;
  year: number;
}): string {
  const { key, payload, year } = params;

  if (key === 'jenisLuaran') return getResearchOutputSubtypeLabel(payload);
  if (key === 'judulLuaran') return getResearchOutputTitle(payload);
  if (key === 'jenisPerolehan') return getResearchOutputAcquisitionLabel(payload);
  if (key === 'namaDosen') return getResearchOutputLecturerName(payload);
  if (key === 'tanggalLuaran') return getResearchOutputDateLabel(payload);
  if (key === 'tahun') {
    if (Number.isFinite(year)) return String(year);
    const payloadYear = getPayloadYear(payload);
    return payloadYear ?? DASH;
  }
  return DASH;
}

function getResearchOutputSubtypeLabel(payload: Record<string, unknown>): string {
  const rawSubtype =
    normalizePayloadText(payload.subcategory)
    ?? normalizePayloadText(payload.jenis_luaran)
    ?? normalizePayloadText(payload.jenisLuaran)
    ?? normalizePayloadText(payload.type);
  if (!rawSubtype) return DASH;

  const normalizedSubtype = normalizeSubtypeToken(rawSubtype);
  if (Object.prototype.hasOwnProperty.call(RESEARCH_OUTPUT_SUBTYPE_LABELS, normalizedSubtype)) {
    return RESEARCH_OUTPUT_SUBTYPE_LABELS[normalizedSubtype as ResearchOutputSubtype];
  }
  return humanizeToken(normalizedSubtype);
}

function getResearchOutputTitle(payload: Record<string, unknown>): string {
  return (
    normalizePayloadText(payload.title)
    ?? normalizePayloadText(payload.judul_luaran)
    ?? normalizePayloadText(payload.judulLuaran)
    ?? normalizePayloadText(payload.judul_ki)
    ?? normalizePayloadText(payload.judul)
    ?? DASH
  );
}

function getResearchOutputAcquisitionLabel(payload: Record<string, unknown>): string {
  const raw =
    normalizePayloadText(payload.jenis_perolehan)
    ?? normalizePayloadText(payload.jenisPerolehan)
    ?? normalizePayloadText(payload.acquisition_type)
    ?? normalizePayloadText(payload.acquisitionType);

  if (!raw) {
    const fallbackNamaDosen = normalizePayloadText(payload.nama_dosen) ?? normalizePayloadText(payload.namaDosen);
    return fallbackNamaDosen ? ACQUISITION_LABELS.kolaborasi_dosen : DASH;
  }

  const normalized = raw.toLowerCase().replace(/\s+/g, '_').replace(/-+/g, '_').trim();
  if (normalized === 'kolaborasi') return ACQUISITION_LABELS.kolaborasi_dosen;
  return ACQUISITION_LABELS[normalized] ?? humanizeToken(normalized);
}

function getResearchOutputLecturerName(payload: Record<string, unknown>): string {
  const name =
    normalizePayloadText(payload.nama_dosen)
    ?? normalizePayloadText(payload.namaDosen)
    ?? normalizePayloadText(payload.peran_penulis)
    ?? normalizePayloadText(payload.peranPenulis);
  return name ?? DASH;
}

function getResearchOutputDateLabel(payload: Record<string, unknown>): string {
  const rawDate =
    normalizePayloadText(payload.tanggal)
    ?? normalizePayloadText(payload.tanggal_luaran)
    ?? normalizePayloadText(payload.tanggalLuaran)
    ?? normalizePayloadText(payload.tanggal_pengajuan)
    ?? normalizePayloadText(payload.tanggalPengajuan);
  if (!rawDate) return DASH;

  const parsedDate = parseDate(rawDate);
  if (!parsedDate) return rawDate;
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(parsedDate);
}

function getPayloadYear(payload: Record<string, unknown>): string | null {
  const yearCandidate = payload.year ?? payload.tahun ?? payload.tahun_pelaporan;
  if (typeof yearCandidate === 'number' && Number.isFinite(yearCandidate)) {
    return String(Math.trunc(yearCandidate));
  }
  if (typeof yearCandidate === 'string' && /^\d{4}$/.test(yearCandidate.trim())) {
    return yearCandidate.trim();
  }
  return null;
}

function parseDate(value: string): Date | null {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const parsed = new Date(`${trimmed}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizePayloadText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  return text.length > 0 ? text : null;
}

function normalizeSubtypeToken(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, '_').replace(/-+/g, '_');
}

function humanizeToken(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
