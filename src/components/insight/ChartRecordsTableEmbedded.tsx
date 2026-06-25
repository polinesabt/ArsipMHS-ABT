import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  getChartRecords,
  deleteChartRecord,
  updateChartRecord,
  DASHBOARD_SECTION_TO_API,
  type ChartRecord,
  type ChartRecordAttachment,
  type ChartRecordsSection,
} from '@/repositories/insight.repository';
import { format as formatDateFns } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Loader2, Trash2, LayoutGrid, List, FileText, TriangleAlert, UploadCloud, CheckSquare, Pencil, Calendar as CalendarIcon, Paperclip, Search } from 'lucide-react';
import {
  deleteAchievementAttachmentViaAPI,
  getAchievementByIdFromAPI,
  listAchievementAttachmentsViaAPI,
  updateStudentViaAPI,
  updateAchievementViaAPI,
  uploadAchievementAttachmentViaAPI,
  type Achievement as ApiAchievement,
  type AchievementAttachment as ApiAchievementAttachment,
  type AchievementImportCategory,
} from '@/repositories/api-student.repository';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FileUpload } from '@/components/shared/FileUpload';
import { AchievementFormModal } from '@/components/shared/AchievementFormModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiClient, getApiBaseUrl } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { useInsightDashboard } from '@/contexts/InsightDashboardContext';
import type { DashboardSectionId } from './InsightDashboardEmbedded';
import type {
  Achievement as UiAchievement,
  AchievementAttachment as FormAchievementAttachment,
  AchievementCategory,
} from '@/types/achievement.types';
import { AchievementImportDialog } from '@/components/insight/AchievementImportDialog';
import { AchievementManualDialog } from '@/components/insight/AchievementManualDialog';
import {
  ACHIEVEMENT_IMPORT_CATEGORY_META,
  resolveScopeFromPublicationsTab,
  resolveScopeFromResearchOutputsTab,
  resolveStudentAchievementFilterCategoriesByTab,
  resolveScopeFromStudentAchievementTab,
  type AchievementImportScope,
} from '@/constants/achievement-import.constants';
import { WORK_SCOPE_LABELS } from '@/constants/student.constants';
import { getPrestasiJenisLabel, getPrestasiKategoriLabel, getPrestasiNama } from '@/lib/chart-record-prestasi-labels';
import { mapApiAchievementToUi } from '@/lib/achievement-api-mapper';
import { STUDENT_PRODUCT_CATEGORY_LABELS } from '@/types/achievement.types';
import {
  getPublicationColumnConfigs,
  getPublicationColumnValue,
  resolvePublicationTableTab,
} from '@/lib/chart-record-publications-table';
import {
  getResearchOutputColumnConfigs,
  getResearchOutputColumnValue,
} from '@/lib/chart-record-research-outputs-table';
import { resolveChartRecordExternalUrl } from '@/lib/chart-record-link-utils';

const WAITING_TIME_BUCKET_LABELS: Record<string, string> = {
  lessThan3Months: '<3 bulan',
  between3And6Months: '3 - 6 bulan',
  moreThan6Months: '>6 bulan',
};

const CAREER_STATUS_LABELS: Record<string, string> = {
  working: 'Bekerja',
  entrepreneur: 'Wirausaha',
};

const WORK_SCOPE_LABELS_BEKERJA: Record<string, string> = {
  local: 'Lokal/Wilayah',
  national: 'Nasional',
  multinational: 'Multinasional/ Internasional',
};

function getWaitingTimeBucketLabel(payload: Record<string, unknown>): string {
  const bucket = typeof payload.bucket === 'string' ? payload.bucket : '';
  return (WAITING_TIME_BUCKET_LABELS[bucket] ?? bucket) || '-';
}

function getCareerStatusLabel(payload: Record<string, unknown>): string {
  const status = typeof payload.career_status === 'string' ? payload.career_status : '';
  return (CAREER_STATUS_LABELS[status] ?? status) || '-';
}

function getWorkScopeLabel(payload: Record<string, unknown>): string {
  const scope = typeof payload.work_scope === 'string' ? payload.work_scope.trim().toLowerCase() : '';
  if (!scope) return '-';
  const status = typeof payload.career_status === 'string' ? payload.career_status.trim().toLowerCase() : '';
  if (status === 'entrepreneur') return WORK_SCOPE_LABELS[scope] ?? '-';
  return WORK_SCOPE_LABELS_BEKERJA[scope] ?? '-';
}

const LEGACY_STUDENT_PRODUCT_CATEGORY_MAP: Record<string, string> = {
  internship: 'layanan_digital',
  course_portfolio: 'pendidikan',
};

const STUDENT_PRODUCT_CATEGORY_LABEL_MAP = STUDENT_PRODUCT_CATEGORY_LABELS as Record<string, string>;

const SECTION_LABELS: Record<string, string> = {
  'student-achievements': 'Prestasi Mahasiswa',
  'study-period': 'Masa Studi',
  'waiting-time': 'Waktu Tunggu',
  'work-coverage': 'Cakupan Kerja',
  'user-satisfaction': 'Kepuasan Pengguna',
  publications: 'Diseminasi Ilmiah Mahasiswa',
  'active-students': 'Mahasiswa Aktif',
  'student-products': 'Produk Mahasiswa',
  'research-outputs': 'Luaran Penelitian',
};

const SECTIONS_WITH_CERTIFICATES = new Set([
  'student-achievements',
  'publications',
  'student-products',
  'research-outputs',
]);

const PER_PAGE = 15;
const INVALID_RESPONSE_MSG = 'Format respons API tidak valid: field "data" tidak ditemukan.';
const UPLOAD_BUTTON_LABELS: Record<AchievementImportScope, { manual: string; excel: string }> = {
  all: { manual: 'Unggah Prestasi', excel: 'Unggah Prestasi Excel' },
  academic: { manual: 'Unggah Prestasi', excel: 'Unggah Prestasi Excel' },
  nonAcademic: { manual: 'Unggah Prestasi', excel: 'Unggah Prestasi Excel' },
  productOnly: { manual: 'Unggah Produk', excel: 'Unggah Produk Excel' },
  researchOutputs: { manual: 'Tambahkan Luaran', excel: 'Unggah by Excel' },
  researchOutputsHki: { manual: 'Tambahkan Luaran', excel: 'Unggah by Excel' },
  researchOutputsTechnology: { manual: 'Tambahkan Luaran', excel: 'Unggah by Excel' },
  researchOutputsBooks: { manual: 'Tambahkan Luaran', excel: 'Unggah by Excel' },
  publicationsJurnal: { manual: 'Unggah Jurnal', excel: 'Unggah Jurnal Excel' },
  publicationsSeminar: { manual: 'Unggah Publikasi Seminar', excel: 'Unggah Publikasi Seminar Excel' },
  publicationsPagelaran: { manual: 'Unggah Pagelaran/Presentasi', excel: 'Unggah Pagelaran/Presentasi Excel' },
};

interface ChartRecordsTableEmbeddedProps {
  section: DashboardSectionId;
  activeTab?: string | null;
  onRecordsChanged?: () => void;
}

interface GalleryItem {
  id: string;
  recordId: string;
  sourceSection: string;
  studentName: string;
  categoryLabel: string;
  description: string | null;
  attachment: ChartRecordAttachment;
}

interface GalleryViewerMeta {
  studentName: string;
  categoryLabel: string;
  description: string | null;
}

function normalizePayloadText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  return text.length > 0 ? text : null;
}

function humanizeToken(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getGalleryCategoryLabel(payload: Record<string, unknown>): string {
  const subcategory = normalizePayloadText(payload.subcategory);
  if (subcategory) return humanizeToken(subcategory);
  const category = normalizePayloadText(payload.category);
  if (category) return humanizeToken(category);
  return 'Kategori tidak tersedia';
}

function getGalleryDescription(payload: Record<string, unknown>): string | null {
  const keys = ['description', 'deskripsi', 'keterangan', 'detail'];
  for (const key of keys) {
    const value = normalizePayloadText(payload[key]);
    if (value) return value;
  }
  return null;
}

function getStudentProductName(payload: Record<string, unknown>): string {
  const keys = ['nama_produk', 'namaProduk', 'title'];
  for (const key of keys) {
    const value = normalizePayloadText(payload[key]);
    if (value) return value;
  }
  return '-';
}

function getStudentProductCategoryLabel(payload: Record<string, unknown>): string {
  const rawCategory = normalizePayloadText(payload.kategori_produk) ?? normalizePayloadText(payload.subcategory);
  if (!rawCategory) return '-';
  const normalizedKey = LEGACY_STUDENT_PRODUCT_CATEGORY_MAP[rawCategory.toLowerCase()] ?? rawCategory.toLowerCase();
  return STUDENT_PRODUCT_CATEGORY_LABEL_MAP[normalizedKey] ?? humanizeToken(normalizedKey);
}

function getStudentProductCategoryKey(payload: Record<string, unknown>): string {
  const rawCategory = normalizePayloadText(payload.kategori_produk) ?? normalizePayloadText(payload.subcategory);
  if (!rawCategory) return 'makanan_minuman';
  const normalizedKey = LEGACY_STUDENT_PRODUCT_CATEGORY_MAP[rawCategory.toLowerCase()] ?? rawCategory.toLowerCase();
  return STUDENT_PRODUCT_CATEGORY_LABEL_MAP[normalizedKey] ? normalizedKey : 'makanan_minuman';
}

function formatDateLabel(value: unknown): string {
  const raw = normalizePayloadText(value);
  if (!raw) return '-';

  const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? new Date(`${raw}T00:00:00`) : new Date(raw);
  if (Number.isNaN(parsedDate.getTime())) return raw;
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(parsedDate);
}

function getStudentProductAdoptionDate(payload: Record<string, unknown>): string {
  const keys = ['tanggal_adopsi', 'tanggalAdopsi', 'tanggal'];
  for (const key of keys) {
    const label = formatDateLabel(payload[key]);
    if (label !== '-') return label;
  }
  return '-';
}

function getStudentProductDateInputValue(payload: Record<string, unknown>): string {
  const keys = ['tanggal_adopsi', 'tanggalAdopsi', 'tanggal'];
  for (const key of keys) {
    const raw = normalizePayloadText(payload[key]);
    if (!raw) continue;
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      return raw;
    }
    const parsedDate = parseDateValue(raw);
    if (parsedDate) {
      return formatDateFns(parsedDate, 'yyyy-MM-dd');
    }
  }
  return '';
}

function parseDateValue(value: string): Date | null {
  const raw = value.trim();
  if (raw === '') return null;

  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (parts) {
    const year = Number(parts[1]);
    const month = Number(parts[2]);
    const day = Number(parts[3]);
    const parsed = new Date(year, month - 1, day);
    if (
      parsed.getFullYear() === year
      && parsed.getMonth() === month - 1
      && parsed.getDate() === day
    ) {
      return parsed;
    }
    return null;
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getStudentProductOptionalText(payload: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = normalizePayloadText(payload[key]);
    if (value) return value;
  }
  return '';
}

function getStudyPeriodYearInputValue(payload: Record<string, unknown>, key: 'tahun_masuk' | 'tahun_lulus'): string {
  const value = payload[key];
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(Math.trunc(value));
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^\d{4}$/.test(trimmed)) {
      return trimmed;
    }
  }
  return '';
}

function parseStudyPeriodYearInput(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d{4}$/.test(trimmed)) {
    return null;
  }
  const year = Number(trimmed);
  if (!Number.isFinite(year) || year < 1900 || year > 2100) {
    return null;
  }
  return year;
}

type FormAttachmentCandidate = FormAchievementAttachment;

function mapChartAttachmentToFormAttachment(attachment: ChartRecordAttachment): FormAttachmentCandidate {
  return {
    id: attachment.id,
    attachmentId: attachment.id,
    fileName: attachment.file_name,
    fileType: attachment.file_type,
    fileSize: 0,
    fileUrl: `${getApiBaseUrl()}/achievements/attachments/serve.php?id=${encodeURIComponent(attachment.id)}`,
    uploadedAt: new Date().toISOString(),
    isPersisted: true,
  };
}

function mapApiAttachmentToFormAttachment(attachment: ApiAchievementAttachment): FormAttachmentCandidate {
  return {
    id: attachment.id,
    attachmentId: attachment.id,
    fileName: attachment.file_name,
    fileType: attachment.file_type,
    fileSize: Number(attachment.file_size ?? 0),
    fileUrl: `${getApiBaseUrl()}/achievements/attachments/serve.php?id=${encodeURIComponent(attachment.id)}`,
    uploadedAt: attachment.uploaded_at ?? new Date().toISOString(),
    isPersisted: true,
  };
}

function mapChartAttachmentToApiAttachment(
  attachment: ChartRecordAttachment,
  achievementId: string
): ApiAchievementAttachment {
  return {
    id: attachment.id,
    achievement_id: achievementId,
    file_name: attachment.file_name,
    file_type: attachment.file_type,
    file_size: 0,
    file_path: attachment.file_path,
    uploaded_at: new Date().toISOString(),
  };
}

function isPendingUploadAttachment(attachment: FormAttachmentCandidate): boolean {
  return Boolean(attachment.file && attachment.isPersisted !== true);
}

function getAttachmentId(attachment: FormAttachmentCandidate): string {
  return String(attachment.attachmentId || attachment.id || '').trim();
}

function AttachmentPreview({
  att,
  onOpen,
  variant = 'thumb',
  interactive = true,
}: {
  att: ChartRecordAttachment;
  onOpen?: (url: string, isPdf: boolean) => void;
  variant?: 'thumb' | 'cover';
  interactive?: boolean;
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const isImage = /^image\//.test(att.file_type);
  const isCover = variant === 'cover';
  const sizeClass = isCover ? 'h-52 w-full rounded-t-xl' : 'h-14 w-14 rounded border';

  useEffect(() => {
    let createdUrl: string | null = null;
    const token = apiClient.getToken();
    const url = `${getApiBaseUrl()}/achievements/attachments/serve.php?id=${encodeURIComponent(att.id)}`;
    fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) => {
        if (!blob) return;
        createdUrl = URL.createObjectURL(blob);
        setBlobUrl(createdUrl);
      })
      .finally(() => setLoading(false));

    return () => {
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [att.id]);

  const openPdf = useCallback(async () => {
    if (!onOpen) return;
    if (blobUrl) {
      onOpen(blobUrl, true);
      return;
    }
    const token = apiClient.getToken();
    const url = `${getApiBaseUrl()}/achievements/attachments/serve.php?id=${encodeURIComponent(att.id)}`;
    const response = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!response.ok) return;
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    onOpen(objectUrl, true);
  }, [att.id, blobUrl, onOpen]);

  if (loading) return <div className={cn(sizeClass, 'animate-pulse border bg-muted')} />;

  if (isImage && blobUrl) {
    if (!interactive || !onOpen) {
      return (
        <div className={cn(sizeClass, 'overflow-hidden border bg-muted')}>
          <img src={blobUrl} alt={att.file_name} className="h-full w-full object-cover" />
        </div>
      );
    }
    return (
      <button
        type="button"
        className={cn(sizeClass, 'overflow-hidden border focus:outline-none focus:ring-2 focus:ring-primary')}
        onClick={() => onOpen(blobUrl, false)}
      >
        <img src={blobUrl} alt={att.file_name} className="h-full w-full object-cover" />
      </button>
    );
  }

  if (!interactive || !onOpen) {
    return (
      <div className={cn(sizeClass, 'flex items-center justify-center border bg-muted')}>
        <FileText className={cn('text-muted-foreground', isCover ? 'h-12 w-12' : 'h-6 w-6')} />
      </div>
    );
  }

  return (
    <button
      type="button"
      className={cn(sizeClass, 'flex items-center justify-center border hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary')}
      onClick={() => {
        void openPdf();
      }}
    >
      <FileText className={cn('text-muted-foreground', isCover ? 'h-12 w-12' : 'h-6 w-6')} />
    </button>
  );
}

function EditStudentProductModal({
  record,
  onClose,
  onSave,
}: {
  record: ChartRecord;
  onClose: () => void;
  onSave: (input: {
    nama_produk: string;
    kategori_produk: string;
    tanggal_adopsi: string;
    mitra_adopsi: string;
    lokasi: string;
    description: string;
    attachments: FormAttachmentCandidate[];
  }) => Promise<void>;
}) {
  const { toast } = useToast();
  const [namaProduk, setNamaProduk] = useState(getStudentProductName(record.payload ?? {}));
  const [kategoriProduk, setKategoriProduk] = useState(getStudentProductCategoryKey(record.payload ?? {}));
  const [tanggalAdopsi, setTanggalAdopsi] = useState(getStudentProductDateInputValue(record.payload ?? {}));
  const [mitraAdopsi, setMitraAdopsi] = useState(getStudentProductOptionalText(record.payload ?? {}, ['mitra_adopsi', 'mitraAdopsi', 'penyelenggara']));
  const [lokasi, setLokasi] = useState(getStudentProductOptionalText(record.payload ?? {}, ['lokasi']));
  const [description, setDescription] = useState(getStudentProductOptionalText(record.payload ?? {}, ['description', 'deskripsi']));
  const [attachments, setAttachments] = useState<FormAttachmentCandidate[]>(
    Array.isArray(record.attachments) ? record.attachments.map(mapChartAttachmentToFormAttachment) : []
  );
  const [openAdoptionDate, setOpenAdoptionDate] = useState(false);
  const [saving, setSaving] = useState(false);
  const selectedAdoptionDate = useMemo(() => (
    tanggalAdopsi ? parseDateValue(tanggalAdopsi) : null
  ), [tanggalAdopsi]);
  const adoptionDateLabel = selectedAdoptionDate
    ? formatDateFns(selectedAdoptionDate, 'd MMMM yyyy', { locale: idLocale })
    : 'Pilih tanggal adopsi';

  useEffect(() => {
    const payload = record.payload ?? {};
    setNamaProduk(getStudentProductName(payload));
    setKategoriProduk(getStudentProductCategoryKey(payload));
    setTanggalAdopsi(getStudentProductDateInputValue(payload));
    setMitraAdopsi(getStudentProductOptionalText(payload, ['mitra_adopsi', 'mitraAdopsi', 'penyelenggara']));
    setLokasi(getStudentProductOptionalText(payload, ['lokasi']));
    setDescription(getStudentProductOptionalText(payload, ['description', 'deskripsi']));
    setAttachments(Array.isArray(record.attachments) ? record.attachments.map(mapChartAttachmentToFormAttachment) : []);
    setOpenAdoptionDate(false);
  }, [record]);

  useEffect(() => {
    const achievementId = (record.source_id || record.id || '').trim();
    if ((record.source_table || '') !== 'achievements' || achievementId === '') {
      return;
    }

    let active = true;
    void listAchievementAttachmentsViaAPI(achievementId)
      .then((response) => {
        if (!active) return;
        if (!response.success || !Array.isArray(response.data)) return;
        setAttachments(response.data.map(mapApiAttachmentToFormAttachment));
      })
      .catch(() => {
        // Silent fallback: gunakan lampiran dari data tabel jika list API gagal.
      });

    return () => {
      active = false;
    };
  }, [record.id, record.source_id, record.source_table]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (namaProduk.trim() === '') {
      toast({ title: 'Nama produk wajib diisi.', variant: 'destructive' });
      return;
    }
    if (kategoriProduk.trim() === '') {
      toast({ title: 'Kategori produk wajib dipilih.', variant: 'destructive' });
      return;
    }
    if (tanggalAdopsi.trim() === '') {
      toast({ title: 'Tanggal adopsi wajib diisi.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      await onSave({
        nama_produk: namaProduk.trim(),
        kategori_produk: kategoriProduk.trim(),
        tanggal_adopsi: tanggalAdopsi.trim(),
        mitra_adopsi: mitraAdopsi.trim(),
        lokasi: lokasi.trim(),
        description: description.trim(),
        attachments,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto overscroll-contain">
        <DialogHeader>
          <DialogTitle>Edit Produk Mahasiswa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nama Produk</label>
            <Input
              type="text"
              className="mt-1"
              value={namaProduk}
              onChange={(event) => setNamaProduk(event.target.value)}
              placeholder="Contoh: Mi Rame"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Kategori Produk</label>
              <select
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={kategoriProduk}
                onChange={(event) => setKategoriProduk(event.target.value)}
              >
                {Object.entries(STUDENT_PRODUCT_CATEGORY_LABEL_MAP).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Tanggal Adopsi</label>
              <Popover open={openAdoptionDate} onOpenChange={setOpenAdoptionDate}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      'mt-1 h-10 w-full justify-start rounded-md border border-input bg-background px-3 text-left font-normal shadow-sm transition-colors hover:bg-accent/40',
                      !selectedAdoptionDate && 'text-muted-foreground'
                    )}
                    aria-label="Pilih tanggal adopsi"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>{adoptionDateLabel}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  side="right"
                  align="start"
                  sideOffset={6}
                  collisionPadding={12}
                  className="flex w-[18rem] max-w-[calc(100vw-1rem)] max-h-[min(23rem,var(--radix-popover-content-available-height))] flex-col overflow-hidden rounded-xl border border-border/80 bg-popover p-0 text-popover-foreground shadow-2xl"
                >
                  <div className="min-h-0 overflow-y-auto overscroll-contain">
                    <Calendar
                      mode="single"
                      locale={idLocale}
                      captionLayout="dropdown"
                      fromYear={2000}
                      toYear={new Date().getFullYear() + 1}
                      selected={selectedAdoptionDate ?? undefined}
                      onSelect={(date) => {
                        if (!date) return;
                        setTanggalAdopsi(formatDateFns(date, 'yyyy-MM-dd'));
                        setOpenAdoptionDate(false);
                      }}
                      initialFocus
                      className="p-3 pointer-events-auto"
                      classNames={{
                        vhidden: 'sr-only',
                        month: 'space-y-1.5',
                        caption: 'flex items-center justify-center border-b border-border/60 pb-2',
                        caption_label: 'hidden',
                        caption_dropdowns: 'grid w-full grid-cols-2 gap-2',
                        dropdown_month: 'relative min-w-0',
                        dropdown_year: 'relative min-w-0',
                        dropdown: 'h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs font-semibold text-foreground shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        head_cell: 'text-muted-foreground rounded-md w-8 font-medium text-[0.72rem]',
                        row: 'flex w-full mt-1',
                        day: 'h-8 w-8 rounded-md p-0 text-sm font-normal transition-colors hover:bg-accent hover:text-accent-foreground',
                        day_selected: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                        day_today: 'bg-accent text-accent-foreground ring-1 ring-primary/40 ring-offset-1 ring-offset-background',
                      }}
                    />
                  </div>
                  <div className="shrink-0 border-t border-border/60 bg-popover/95 px-2.5 py-2 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        setTanggalAdopsi('');
                        setOpenAdoptionDate(false);
                      }}
                    >
                      Hapus
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      onClick={() => {
                        setTanggalAdopsi(formatDateFns(new Date(), 'yyyy-MM-dd'));
                        setOpenAdoptionDate(false);
                      }}
                    >
                      Hari ini
                    </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Mitra Adopsi</label>
              <Input
                type="text"
                className="mt-1"
                value={mitraAdopsi}
                onChange={(event) => setMitraAdopsi(event.target.value)}
                placeholder="Contoh: Dinas Koperasi Kota Semarang"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Lokasi</label>
              <Input
                type="text"
                className="mt-1"
                value={lokasi}
                onChange={(event) => setLokasi(event.target.value)}
                placeholder="Contoh: Semarang"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Deskripsi</label>
            <Textarea
              className="mt-1 min-h-[110px]"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Tulis ringkasan produk mahasiswa yang diadopsi..."
            />
          </div>
          <div className="border-t border-border/60 pt-3">
            <p className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Paperclip className="h-4 w-4" />
              Lampiran Dokumentasi
            </p>
            <FileUpload
              value={attachments}
              onChange={setAttachments}
              maxFiles={5}
              maxSizeInMB={2}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Upload sertifikat/foto/dokumen pendukung (maks. 5 file, 2 MB per file). Perubahan lampiran diproses saat klik Simpan.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Simpan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditStudyPeriodModal({
  record,
  onClose,
  onSave,
}: {
  record: ChartRecord;
  onClose: () => void;
  onSave: (input: { tahun_masuk: number; tahun_lulus: number }) => Promise<void>;
}) {
  const { toast } = useToast();
  const [tahunMasuk, setTahunMasuk] = useState(getStudyPeriodYearInputValue(record.payload ?? {}, 'tahun_masuk'));
  const [tahunLulus, setTahunLulus] = useState(getStudyPeriodYearInputValue(record.payload ?? {}, 'tahun_lulus'));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const payload = record.payload ?? {};
    setTahunMasuk(getStudyPeriodYearInputValue(payload, 'tahun_masuk'));
    setTahunLulus(getStudyPeriodYearInputValue(payload, 'tahun_lulus'));
  }, [record]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const parsedMasuk = parseStudyPeriodYearInput(tahunMasuk);
    if (parsedMasuk === null) {
      toast({
        title: 'Tahun masuk tidak valid',
        description: 'Masukkan tahun 4 digit antara 1900 sampai 2100.',
        variant: 'destructive',
      });
      return;
    }

    const parsedLulus = parseStudyPeriodYearInput(tahunLulus);
    if (parsedLulus === null) {
      toast({
        title: 'Tahun lulus tidak valid',
        description: 'Masukkan tahun 4 digit antara 1900 sampai 2100.',
        variant: 'destructive',
      });
      return;
    }

    if (parsedLulus < parsedMasuk) {
      toast({
        title: 'Rentang tahun tidak valid',
        description: 'Tahun lulus tidak boleh lebih kecil dari tahun masuk.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      await onSave({
        tahun_masuk: parsedMasuk,
        tahun_lulus: parsedLulus,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>Edit Masa Studi</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Tahun Masuk</label>
            <Input
              type="number"
              min={1900}
              max={2100}
              step={1}
              className="mt-1"
              value={tahunMasuk}
              onChange={(event) => setTahunMasuk(event.target.value)}
              placeholder="Contoh: 2021"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Tahun Lulus</label>
            <Input
              type="number"
              min={1900}
              max={2100}
              step={1}
              className="mt-1"
              value={tahunLulus}
              onChange={(event) => setTahunLulus(event.target.value)}
              placeholder="Contoh: 2025"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Simpan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ChartRecordsTableEmbedded({ section, activeTab = null, onRecordsChanged }: ChartRecordsTableEmbeddedProps) {
  const { toast } = useToast();
  const { selectedYear } = useInsightDashboard();
  const apiSection = DASHBOARD_SECTION_TO_API[section] as ChartRecordsSection | undefined;
  const yearParam = selectedYear === 'all' ? undefined : (selectedYear as number);
  const isStudentAchievementsSection = section === 'student-achievements';
  const isStudentProductsSection = section === 'student-products';
  const isPublicationsSection = section === 'publications';
  const isResearchOutputsSection = section === 'research-outputs';
  const isStudyPeriodSection = section === 'study-period';
  const isWaitingTimeSection = section === 'waiting-time';
  const isWorkCoverageSection = section === 'work-coverage';
  const importScope = resolveScopeFromStudentAchievementTab(activeTab);
  const publicationsScope = resolveScopeFromPublicationsTab(activeTab);
  const researchOutputsScope = resolveScopeFromResearchOutputsTab(activeTab);
  const uploadScope: AchievementImportScope = isStudentProductsSection
    ? 'productOnly'
    : (isPublicationsSection
      ? publicationsScope
      : (isResearchOutputsSection ? researchOutputsScope : importScope));
  const canUploadAchievements = isStudentAchievementsSection || isStudentProductsSection || isPublicationsSection || isResearchOutputsSection;
  const manualUploadLabel = UPLOAD_BUTTON_LABELS[uploadScope].manual;
  const excelUploadLabel = UPLOAD_BUTTON_LABELS[uploadScope].excel;
  const hasCertificates = SECTIONS_WITH_CERTIFICATES.has(section);
  const [records, setRecords] = useState<ChartRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'gallery'>('table');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<'delete' | null>(null);
  const [processingRecordId, setProcessingRecordId] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<ChartRecord | null>(null);
  const [editingStudyPeriodRecord, setEditingStudyPeriodRecord] = useState<ChartRecord | null>(null);
  const [editingAchievement, setEditingAchievement] = useState<UiAchievement | null>(null);
  const [editingAchievementAllowedCategories, setEditingAchievementAllowedCategories] = useState<AchievementCategory[] | undefined>(undefined);
  const [editingAchievementPublicationMode, setEditingAchievementPublicationMode] = useState<'default' | 'jurnalOnly'>('default');
  const [openingAchievementEditId, setOpeningAchievementEditId] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerPdf, setViewerPdf] = useState(false);
  const [viewerMeta, setViewerMeta] = useState<GalleryViewerMeta | null>(null);
  const [openingGalleryItemId, setOpeningGalleryItemId] = useState<string | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [nameSearchInput, setNameSearchInput] = useState('');
  const [nameSearchQuery, setNameSearchQuery] = useState('');
  const [selectedAchievementCategory, setSelectedAchievementCategory] = useState<'all' | AchievementImportCategory>('all');
  const recordsTab = isWorkCoverageSection
    ? (activeTab === 'entrepreneur' ? 'entrepreneur' : 'working')
    : (activeTab ?? undefined);
  const studentAchievementCategoryOptions = useMemo(
    () => (isStudentAchievementsSection ? resolveStudentAchievementFilterCategoriesByTab(activeTab) : []),
    [activeTab, isStudentAchievementsSection]
  );
  const selectedAchievementCategoryFilter = isStudentAchievementsSection && selectedAchievementCategory !== 'all'
    ? selectedAchievementCategory
    : undefined;

  const loadRecords = useCallback(async () => {
    if (!apiSection) return;
    setLoading(true);
    setError(null);

    const res = await getChartRecords(apiSection, {
      year: yearParam,
      page,
      per_page: PER_PAGE,
      include_attachments: hasCertificates,
      tab: recordsTab,
      student_name: nameSearchQuery || undefined,
      achievement_category: selectedAchievementCategoryFilter,
    });

    setLoading(false);
    if (!res.success) {
      const msg = res.error || (res as { message?: string }).message || 'Gagal memuat data';
      setError(msg);
      return;
    }
    if (!res.data) {
      setError(INVALID_RESPONSE_MSG);
      return;
    }

    const recordsList = Array.isArray(res.data.records) ? res.data.records : [];
    const totalCount = typeof res.data.total === 'number' ? res.data.total : 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
      return;
    }

    setRecords(recordsList);
    setTotal(totalCount);
    setSelectedIds((previous) => previous.filter((id) => recordsList.some((row) => row.id === id)));
  }, [apiSection, hasCertificates, nameSearchQuery, page, recordsTab, selectedAchievementCategoryFilter, yearParam]);

  const reloadAfterMutation = useCallback(async () => {
    await loadRecords();
  }, [loadRecords]);

  useEffect(() => {
    setPage(1);
    setSelectedIds([]);
    setViewMode('table');
    setShowChecklist(false);
    setEditingRecord(null);
    setEditingStudyPeriodRecord(null);
    setEditingAchievement(null);
    setEditingAchievementAllowedCategories(undefined);
    setEditingAchievementPublicationMode('default');
    setOpeningAchievementEditId(null);
    setNameSearchInput('');
    setNameSearchQuery('');
    setSelectedAchievementCategory('all');
  }, [section]);

  useEffect(() => {
    setPage(1);
    setSelectedIds([]);
    setShowChecklist(false);
    setEditingStudyPeriodRecord(null);
    setEditingAchievement(null);
    setEditingAchievementAllowedCategories(undefined);
    setEditingAchievementPublicationMode('default');
    setOpeningAchievementEditId(null);
  }, [activeTab]);

  useEffect(() => {
    if (!isStudentAchievementsSection) {
      if (selectedAchievementCategory !== 'all') {
        setSelectedAchievementCategory('all');
      }
      return;
    }
    if (selectedAchievementCategory === 'all') return;
    if (!studentAchievementCategoryOptions.includes(selectedAchievementCategory)) {
      setSelectedAchievementCategory('all');
    }
  }, [isStudentAchievementsSection, selectedAchievementCategory, studentAchievementCategoryOptions]);

  useEffect(() => {
    if (!apiSection) return;
    void loadRecords();
  }, [apiSection, loadRecords]);

  const refreshChartSection = useCallback(() => {
    if (onRecordsChanged) onRecordsChanged();
  }, [onRecordsChanged]);

  const applyNameSearch = useCallback((rawValue?: string) => {
    const nextQuery = (rawValue ?? nameSearchInput).trim();
    setPage(1);
    setSelectedIds([]);
    setShowChecklist(false);
    setNameSearchQuery(nextQuery);
  }, [nameSearchInput]);

  const resetNameSearch = useCallback(() => {
    setNameSearchInput('');
    setNameSearchQuery('');
    setPage(1);
    setSelectedIds([]);
    setShowChecklist(false);
  }, []);

  useEffect(() => {
    const nextQuery = nameSearchInput.trim();
    const timer = window.setTimeout(() => {
      if (nextQuery === nameSearchQuery) return;
      setPage(1);
      setSelectedIds([]);
      setShowChecklist(false);
      setNameSearchQuery(nextQuery);
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [nameSearchInput, nameSearchQuery]);

  const handleDeleteRecord = async (recordId: string) => {
    if (!apiSection) return;
    if (!window.confirm('Hapus record ini ke Recycle Bin?')) return;

    setProcessingRecordId(recordId);
    const res = await deleteChartRecord(apiSection, recordId);
    setProcessingRecordId(null);
    if (!res.success) {
      toast({ title: 'Gagal menghapus record', description: res.error, variant: 'destructive' });
      return;
    }

    toast({
      title: 'Record dipindahkan ke Recycle Bin',
      description: 'Data tidak dihapus permanen dari database.',
    });
    await reloadAfterMutation();
    refreshChartSection();
  };

  const openAchievementEdit = async (
    record: ChartRecord,
    options?: { allowedCategories?: AchievementCategory[]; publicationMode?: 'default' | 'jurnalOnly' }
  ) => {
    const achievementId = String(record.source_id || record.id || '').trim();
    if (achievementId === '' || (record.source_table || '') !== 'achievements') {
      toast({
        title: 'Data tidak dapat diedit',
        description: 'Record ini tidak terhubung ke sumber prestasi utama.',
        variant: 'destructive',
      });
      return;
    }

    setOpeningAchievementEditId(record.id);
    setEditingAchievementAllowedCategories(undefined);
    setEditingAchievementPublicationMode('default');
    try {
      const response = await getAchievementByIdFromAPI(achievementId);
      if (!response.success || !response.data) {
        toast({
          title: 'Gagal memuat detail prestasi',
          description: response.error || 'Detail prestasi tidak ditemukan.',
          variant: 'destructive',
        });
        return;
      }

      const responseData = response.data as ApiAchievement | ApiAchievement[];
      const sourceAchievement = Array.isArray(responseData) ? responseData[0] : responseData;
      if (!sourceAchievement || typeof sourceAchievement !== 'object') {
        toast({
          title: 'Gagal memuat detail prestasi',
          description: 'Format data detail prestasi tidak valid.',
          variant: 'destructive',
        });
        return;
      }

      const fallbackAttachments = Array.isArray(record.attachments)
        ? record.attachments.map((attachment) => mapChartAttachmentToApiAttachment(attachment, achievementId))
        : [];
      const attachmentsResponse = await listAchievementAttachmentsViaAPI(achievementId);
      const attachments = attachmentsResponse.success && Array.isArray(attachmentsResponse.data)
        ? attachmentsResponse.data
        : fallbackAttachments;

      const mappedAchievement = mapApiAchievementToUi({
        ...sourceAchievement,
        attachments,
      });
      setEditingAchievementAllowedCategories(options?.allowedCategories);
      setEditingAchievementPublicationMode(options?.publicationMode ?? 'default');
      setEditingAchievement(mappedAchievement);
    } catch (error) {
      toast({
        title: 'Gagal memuat detail prestasi',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat data.',
        variant: 'destructive',
      });
    } finally {
      setOpeningAchievementEditId(null);
    }
  };

  const handleUpdateStudyPeriodRecord = async (
    record: ChartRecord,
    input: { tahun_masuk: number; tahun_lulus: number }
  ) => {
    if (!apiSection) return;
    const studentId = String(record.source_id || record.id || '').trim();
    if (studentId === '' || (record.source_table || '') !== 'students') {
      toast({
        title: 'Data tidak dapat diedit',
        description: 'Record masa studi tidak terhubung ke data mahasiswa utama.',
        variant: 'destructive',
      });
      return;
    }

    const updateStudentRes = await updateStudentViaAPI(studentId, {
      tahun_masuk: input.tahun_masuk,
      tahun_lulus: input.tahun_lulus,
    });
    if (!updateStudentRes.success) {
      toast({
        title: 'Gagal memperbarui masa studi',
        description: updateStudentRes.error || 'Terjadi kesalahan saat menyimpan data mahasiswa.',
        variant: 'destructive',
      });
      return;
    }

    const chartUpdateRes = await updateChartRecord(apiSection, record.id, {
      tahun_pelaporan: input.tahun_lulus,
      payload: {
        tahun_masuk: input.tahun_masuk,
        tahun_lulus: input.tahun_lulus,
      },
    });
    if (!chartUpdateRes.success) {
      toast({
        title: 'Data mahasiswa tersimpan, chart belum terbarui',
        description: chartUpdateRes.error || 'Gagal sinkron ke tabel chart.',
        variant: 'destructive',
      });
      return;
    }

    toast({ title: 'Masa studi berhasil diperbarui' });
    setEditingStudyPeriodRecord(null);
    await reloadAfterMutation();
    refreshChartSection();
  };

  const handleUpdateStudentProductRecord = async (
    record: ChartRecord,
    input: {
      nama_produk: string;
      kategori_produk: string;
      tanggal_adopsi: string;
      mitra_adopsi: string;
      lokasi: string;
      description: string;
      attachments: FormAttachmentCandidate[];
    }
  ) => {
    const achievementId = (record.source_id || record.id || '').trim();
    const canSyncAttachments = (record.source_table || '') === 'achievements' && achievementId !== '';
    let updatedOk = false;

    if (canSyncAttachments) {
      const res = await updateAchievementViaAPI(achievementId, {
        title: input.nama_produk,
        category: 'applied_academic',
        subcategory: input.kategori_produk,
        tanggal: input.tanggal_adopsi,
        penyelenggara: input.mitra_adopsi || undefined,
        lokasi: input.lokasi || undefined,
        description: input.description || undefined,
      });

      if (!res.success) {
        toast({ title: 'Gagal memperbarui data produk', description: res.error, variant: 'destructive' });
        return;
      }
      updatedOk = true;
    }

    if (!updatedOk) {
      if (!apiSection) return;
      const reportYear = Number.parseInt(input.tanggal_adopsi.slice(0, 4), 10);
      const fallbackRes = await updateChartRecord(apiSection, record.id, {
        tahun_pelaporan: Number.isFinite(reportYear) ? reportYear : record.tahun_pelaporan,
        category: 'applied_academic',
        subcategory: input.kategori_produk,
        tanggal: input.tanggal_adopsi,
        payload: {
          title: input.nama_produk,
          nama_produk: input.nama_produk,
          category: 'applied_academic',
          subcategory: input.kategori_produk,
          kategori_produk: input.kategori_produk,
          tanggal: input.tanggal_adopsi,
          tanggal_adopsi: input.tanggal_adopsi,
          mitra_adopsi: input.mitra_adopsi || null,
          penyelenggara: input.mitra_adopsi || null,
          lokasi: input.lokasi || null,
          description: input.description || null,
          deskripsi: input.description || null,
        },
      });

      if (!fallbackRes.success) {
        toast({ title: 'Gagal memperbarui data produk', description: fallbackRes.error, variant: 'destructive' });
        return;
      }
      updatedOk = true;
    }

    if (canSyncAttachments && updatedOk) {
      const existingAttachmentRes = await listAchievementAttachmentsViaAPI(achievementId);
      const existingPersistedAttachmentIds = existingAttachmentRes.success && Array.isArray(existingAttachmentRes.data)
        ? existingAttachmentRes.data
            .map((attachment) => String(attachment.id || '').trim())
            .filter((id) => id !== '')
        : (Array.isArray(record.attachments) ? record.attachments : [])
            .map((attachment) => String(attachment.id || '').trim())
            .filter((id) => id !== '');

      const keptPersistedAttachmentIds = new Set(
        input.attachments
          .filter((attachment) => !isPendingUploadAttachment(attachment))
          .map(getAttachmentId)
          .filter((id) => id !== '')
      );
      const removedPersistedAttachmentIds = existingPersistedAttachmentIds
        .filter((id) => !keptPersistedAttachmentIds.has(id));

      const failedDeletes: string[] = [];
      for (const attachmentId of removedPersistedAttachmentIds) {
        const deleteRes = await deleteAchievementAttachmentViaAPI(attachmentId);
        if (deleteRes.success) continue;
        failedDeletes.push(`${attachmentId}: ${deleteRes.error || 'Gagal hapus'}`);
      }

      const pendingUploads = input.attachments.filter((attachment) => isPendingUploadAttachment(attachment));
      const failedUploads: string[] = [];
      for (const attachment of pendingUploads) {
        const file = attachment.file;
        if (!file) continue;
        const uploadRes = await uploadAchievementAttachmentViaAPI(achievementId, file);
        if (uploadRes.success) continue;
        const attachmentName = attachment.fileName?.trim() || file.name || 'File';
        failedUploads.push(`${attachmentName}: ${uploadRes.error || 'Gagal upload'}`);
      }

      if (failedDeletes.length > 0 || failedUploads.length > 0) {
        const failureMessages = [
          ...failedDeletes.map((message) => `Hapus ${message}`),
          ...failedUploads.map((message) => `Upload ${message}`),
        ];
        toast({
          title: 'Sebagian sinkronisasi lampiran gagal',
          description: failureMessages.slice(0, 2).join(' | '),
          variant: 'destructive',
        });
      }
    }

    toast({ title: 'Data produk berhasil diperbarui' });
    setEditingRecord(null);
    await reloadAfterMutation();
    refreshChartSection();
  };

  const runBulkAction = async (action: 'delete') => {
    if (!apiSection || selectedIds.length === 0) return;
    if (!window.confirm(`Hapus ${selectedIds.length} record ke Recycle Bin?`)) return;

    setBulkAction(action);
    const ids = [...selectedIds];
    let successCount = 0;
    let failCount = 0;

    for (const recordId of ids) {
      const res = await deleteChartRecord(apiSection, recordId);
      if (res.success) successCount += 1;
      else failCount += 1;
    }

    setBulkAction(null);
    setSelectedIds([]);

    if (successCount > 0) {
      await reloadAfterMutation();
      refreshChartSection();
    }

    if (failCount > 0) {
      toast({
        title: 'Bulk action selesai dengan sebagian gagal',
        description: `${successCount} berhasil, ${failCount} gagal.`,
        variant: 'destructive',
      });
      return;
    }

    toast({ title: `Bulk action berhasil untuk ${successCount} record.` });
  };

  const toggleAllRows = (checked: boolean) => {
    if (!checked) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(safeRecords.map((row) => row.id));
  };

  const toggleSingleRow = (recordId: string, checked: boolean) => {
    setSelectedIds((previous) => {
      if (checked) return [...new Set([...previous, recordId])];
      return previous.filter((id) => id !== recordId);
    });
  };

  const openAttachmentViewer = useCallback((url: string, isPdf: boolean, meta: GalleryViewerMeta | null = null) => {
    setViewerUrl(url);
    setViewerPdf(isPdf);
    setViewerMeta(meta);
    setViewerOpen(true);
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const label = SECTION_LABELS[section] ?? section;
  const safeRecords = useMemo(
    () => (Array.isArray(records) ? records : []),
    [records]
  );
  const allSelected = safeRecords.length > 0 && selectedIds.length === safeRecords.length;
  const someSelected = selectedIds.length > 0 && !allSelected;
  const publicationTab = resolvePublicationTableTab(activeTab);
  const publicationAllowedCategories = useMemo<AchievementCategory[]>(() => {
    if (publicationTab === 'jurnal') return ['publikasi'];
    if (publicationTab === 'seminar') return ['seminar'];
    return ['pagelaran'];
  }, [publicationTab]);
  const publicationColumns = useMemo(
    () => getPublicationColumnConfigs(publicationTab),
    [publicationTab]
  );
  const researchOutputColumns = useMemo(
    () => getResearchOutputColumnConfigs(),
    []
  );

  const galleryItems = useMemo<GalleryItem[]>(() => {
    return safeRecords.flatMap((row) => {
      const attachments = row.attachments ?? [];
      if (attachments.length === 0) return [];

      const categoryLabel = getGalleryCategoryLabel(row.payload);
      const description = getGalleryDescription(row.payload);

      return attachments.map((attachment) => ({
        id: `${row.id}:${attachment.id}`,
        recordId: row.id,
        sourceSection: label,
        studentName: row.snapshot_nama,
        categoryLabel,
        description,
        attachment,
      }));
    });
  }, [safeRecords, label]);

  const openGalleryItem = useCallback(async (item: GalleryItem) => {
    setOpeningGalleryItemId(item.id);
    try {
      const token = apiClient.getToken();
      const url = `${getApiBaseUrl()}/achievements/attachments/serve.php?id=${encodeURIComponent(item.attachment.id)}`;
      const response = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!response.ok) {
        throw new Error(`Gagal memuat lampiran (${response.status})`);
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      openAttachmentViewer(blobUrl, !/^image\//.test(item.attachment.file_type), {
        studentName: item.studentName,
        categoryLabel: item.categoryLabel,
        description: item.description,
      });
    } catch (error) {
      toast({
        title: 'Preview gagal dibuka',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan saat membuka lampiran.',
        variant: 'destructive',
      });
    } finally {
      setOpeningGalleryItemId(null);
    }
  }, [openAttachmentViewer, toast]);

  if (!apiSection) return null;

  return (
    <div className="mt-6 overflow-hidden rounded-lg border bg-card">
      <div className="flex items-center justify-between gap-3 border-b bg-muted/20 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Pengaturan Lanjutan</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Panel kontrol data chart untuk section "{label}".
          </p>
        </div>
        <div className="flex items-center gap-3">
          {canUploadAchievements && (
            <>
              <Button type="button" size="sm" variant="outline" onClick={() => setIsManualDialogOpen(true)}>
                <UploadCloud className="mr-1 h-4 w-4" />
                {manualUploadLabel}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setIsImportDialogOpen(true)}>
                <UploadCloud className="mr-1 h-4 w-4" />
                {excelUploadLabel}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="p-4">
        <p className="mb-4 text-xs text-muted-foreground">
          {viewMode === 'gallery' && hasCertificates
            ? 'Gallery View menampilkan lampiran secara visual. Aksi manajemen data tetap berada di Table View.'
            : 'Perubahan status, edit, dan hapus akan langsung memengaruhi perhitungan chart tanpa reload halaman.'}
        </p>

        <form
          className="mb-4 flex flex-wrap items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            applyNameSearch();
          }}
        >
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={nameSearchInput}
              onChange={(event) => setNameSearchInput(event.target.value)}
              placeholder="Cari nama mahasiswa..."
              className="h-9 pl-8"
            />
          </div>
          <Button type="submit" size="sm" variant="outline">
            Cari
          </Button>
          {(nameSearchInput !== '' || nameSearchQuery !== '') && (
            <Button type="button" size="sm" variant="ghost" onClick={resetNameSearch}>
              Reset
            </Button>
          )}
          {nameSearchQuery !== '' && (
            <span className="text-xs text-muted-foreground">
              Filter nama: "{nameSearchQuery}"
            </span>
          )}
        </form>

        {hasCertificates && !loading && (safeRecords.length > 0 || isStudentAchievementsSection) && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setViewMode('table');
                setPage(1);
              }}
            >
              <List className="mr-1 h-4 w-4" />
              Table View
            </Button>
            <Button
              variant={viewMode === 'gallery' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setViewMode('gallery');
                setSelectedIds([]);
                setPage(1);
              }}
            >
              <LayoutGrid className="mr-1 h-4 w-4" />
              Gallery View
            </Button>
            {isStudentAchievementsSection && (
              <div className="w-full sm:w-[260px]">
                <Select
                  value={selectedAchievementCategory}
                  onValueChange={(value) => {
                    const nextValue = value as 'all' | AchievementImportCategory;
                    setSelectedAchievementCategory(nextValue);
                    setPage(1);
                    setSelectedIds([]);
                    setShowChecklist(false);
                  }}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Semua Jenis Prestasi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Jenis Prestasi</SelectItem>
                    {studentAchievementCategoryOptions.map((category) => (
                      <SelectItem key={category} value={category}>
                        {ACHIEVEMENT_IMPORT_CATEGORY_META[category]?.label ?? category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {viewMode === 'table' && (
              <Button
                variant={showChecklist ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setShowChecklist((v) => !v);
                  if (showChecklist) setSelectedIds([]);
                }}
              >
                <CheckSquare className="mr-1 h-4 w-4" />
                Checklist
              </Button>
            )}
            {viewMode === 'table' && showChecklist && selectedIds.length > 0 && (
              <>
                <span className="mx-1 text-xs text-muted-foreground">{selectedIds.length} dipilih</span>
                <Button size="sm" variant="destructive" disabled={bulkAction !== null} onClick={() => void runBulkAction('delete')}>
                  {bulkAction === 'delete' ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Trash2 className="mr-1 h-4 w-4" />}
                  Hapus ke Recycle Bin
                </Button>
              </>
            )}
          </div>
        )}

        {!hasCertificates && !loading && safeRecords.length > 0 && viewMode === 'table' && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Button
              variant={showChecklist ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setShowChecklist((v) => !v);
                if (showChecklist) setSelectedIds([]);
              }}
            >
              <CheckSquare className="mr-1 h-4 w-4" />
              Checklist
            </Button>
            {showChecklist && selectedIds.length > 0 && (
              <>
                <span className="text-xs text-muted-foreground">{selectedIds.length} dipilih</span>
                <Button size="sm" variant="destructive" disabled={bulkAction !== null} onClick={() => void runBulkAction('delete')}>
                  {bulkAction === 'delete' ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Trash2 className="mr-1 h-4 w-4" />}
                  Hapus ke Recycle Bin
                </Button>
              </>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : error ? (
          <p className="py-8 text-center text-sm text-destructive">{error}</p>
        ) : viewMode === 'gallery' && hasCertificates ? (
          galleryItems.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Belum ada lampiran yang bisa ditampilkan pada halaman ini.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {galleryItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="relative overflow-hidden rounded-xl border bg-card text-left shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-wait disabled:opacity-80"
                    onClick={() => {
                      void openGalleryItem(item);
                    }}
                    disabled={openingGalleryItemId === item.id}
                    aria-label={`Lihat lampiran ${item.studentName}`}
                  >
                    <AttachmentPreview att={item.attachment} variant="cover" interactive={false} />
                    <div className="space-y-1 p-4">
                      <p className="line-clamp-1 text-sm font-semibold text-foreground">{item.studentName}</p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">{item.categoryLabel}</p>
                    </div>
                    {openingGalleryItemId === item.id && (
                      <div className="absolute right-3 top-3 rounded-full bg-card/90 p-1.5">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Total {total} record - Halaman {page} dari {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded border px-2 py-1 text-xs hover:bg-muted disabled:opacity-50"
                    onClick={() => setPage((previous) => Math.max(1, previous - 1))}
                    disabled={page <= 1}
                  >
                    Sebelumnya
                  </button>
                  <button
                    type="button"
                    className="rounded border px-2 py-1 text-xs hover:bg-muted disabled:opacity-50"
                    onClick={() => setPage((previous) => Math.min(totalPages, previous + 1))}
                    disabled={page >= totalPages}
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            </>
          )
        ) : safeRecords.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Belum ada data.</p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    {showChecklist && (
                      <th className="w-10 p-2 text-left">
                        <Checkbox
                          checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                          onCheckedChange={(checked) => toggleAllRows(checked === true)}
                          aria-label="Pilih semua"
                        />
                      </th>
                    )}
                    {hasCertificates && <th className="w-24 p-2 text-left font-medium">Preview</th>}
                    <th className="p-2 text-left font-medium">NIM</th>
                    <th className="p-2 text-left font-medium">Nama</th>
                    {isStudentProductsSection && (
                      <>
                        <th className="p-2 text-left font-medium">Nama Produk</th>
                        <th className="p-2 text-left font-medium">Kategori Produk</th>
                        <th className="p-2 text-left font-medium">Tanggal Adopsi</th>
                      </>
                    )}
                    {isStudentAchievementsSection && (
                      <>
                        <th className="p-2 text-left font-medium">Jenis Prestasi</th>
                        <th className="p-2 text-left font-medium">Kategori</th>
                        <th className="p-2 text-left font-medium">Nama Prestasi</th>
                      </>
                    )}
                    {isPublicationsSection && publicationColumns.map((column) => (
                      <th key={column.key} className="p-2 text-left font-medium">{column.label}</th>
                    ))}
                    {isResearchOutputsSection && researchOutputColumns.map((column) => (
                      <th key={column.key} className="p-2 text-left font-medium">{column.label}</th>
                    ))}
                    {isStudyPeriodSection && (
                      <>
                        <th className="p-2 text-left font-medium">Tahun Masuk</th>
                        <th className="p-2 text-left font-medium">Tahun Lulus</th>
                      </>
                    )}
                    {isWaitingTimeSection && (
                      <>
                        <th className="p-2 text-left font-medium">Tahun Lulus</th>
                        <th className="p-2 text-left font-medium">Waktu Tunggu</th>
                        <th className="p-2 text-left font-medium">Tahun Mulai Bekerja</th>
                      </>
                    )}
                    {isWorkCoverageSection && (
                      <>
                        <th className="p-2 text-left font-medium">Tahun Lulus</th>
                        <th className="p-2 text-left font-medium">Level Cakupan</th>
                      </>
                    )}
                    {!isStudyPeriodSection
                      && !isWaitingTimeSection
                      && !isWorkCoverageSection
                      && !isStudentProductsSection
                      && !isPublicationsSection
                      && !isResearchOutputsSection
                      && <th className="p-2 text-left font-medium">Tahun</th>}
                    {(isStudentProductsSection || isStudentAchievementsSection || isStudyPeriodSection || isPublicationsSection) && <th className="w-14 p-2 text-right font-medium">Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {safeRecords.map((row) => {
                    const rowExternalUrl = resolveChartRecordExternalUrl(row.payload ?? {}, section);
                    const studentProductName = getStudentProductName(row.payload ?? {});
                    const prestasiName = getPrestasiNama(row.payload ?? {}) || '-';

                    return (
                      <tr key={row.id} className="border-b hover:bg-muted/30">
                        {showChecklist && (
                          <td className="p-2 align-top">
                            <Checkbox
                              checked={selectedIds.includes(row.id)}
                              onCheckedChange={(checked) => toggleSingleRow(row.id, checked === true)}
                              aria-label={`Pilih ${row.snapshot_nama}`}
                            />
                          </td>
                        )}
                        {hasCertificates && (
                          <td className="p-2 align-top">
                            {(row.attachments?.length ?? 0) > 0 ? (
                              <div className="flex items-center gap-1">
                                <AttachmentPreview
                                  att={row.attachments![0]}
                                  onOpen={(url, isPdf) => openAttachmentViewer(url, isPdf)}
                                />
                                {row.attachments!.length > 1 && (
                                  <span className="text-xs text-muted-foreground">+{row.attachments!.length - 1}</span>
                                )}
                              </div>
                            ) : (
                              <div className="flex h-14 w-14 items-center justify-center rounded border border-dashed">
                                <TriangleAlert className="h-4 w-4 text-amber-500" />
                              </div>
                            )}
                          </td>
                        )}
                        <td className="p-2 align-top">{row.snapshot_nim}</td>
                        <td className="p-2 align-top">{row.snapshot_nama}</td>
                        {isStudentProductsSection && (
                          <>
                            <td className="max-w-[220px] p-2 align-top">
                              <span className="line-clamp-2" title={studentProductName}>
                                {studentProductName}
                              </span>
                              <div className="mt-1">
                                {rowExternalUrl ? (
                                  <a
                                    href={rowExternalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(event) => event.stopPropagation()}
                                    className="inline-flex rounded border px-2 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                                  >
                                    Buka Link
                                  </a>
                                ) : (
                                  <span className="text-xs text-muted-foreground">Link: -</span>
                                )}
                              </div>
                            </td>
                            <td className="p-2 align-top">{getStudentProductCategoryLabel(row.payload ?? {})}</td>
                            <td className="p-2 align-top">{getStudentProductAdoptionDate(row.payload ?? {})}</td>
                          </>
                        )}
                        {isStudentAchievementsSection && (
                          <>
                            <td className="p-2 align-top">{getPrestasiJenisLabel(row.payload ?? {})}</td>
                            <td className="p-2 align-top">{getPrestasiKategoriLabel(row.payload ?? {})}</td>
                            <td className="max-w-[200px] p-2 align-top">
                              <span className="line-clamp-2" title={prestasiName}>
                                {prestasiName}
                              </span>
                              <div className="mt-1">
                                {rowExternalUrl ? (
                                  <a
                                    href={rowExternalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(event) => event.stopPropagation()}
                                    className="inline-flex rounded border px-2 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                                  >
                                    Buka Link
                                  </a>
                                ) : (
                                  <span className="text-xs text-muted-foreground">Link: -</span>
                                )}
                              </div>
                            </td>
                          </>
                        )}
                        {isPublicationsSection && publicationColumns.map((column) => {
                          const value = getPublicationColumnValue({
                            key: column.key,
                            payload: row.payload ?? {},
                            tab: publicationTab,
                            year: row.tahun_pelaporan,
                          });

                          if (column.key === 'judul') {
                            return (
                              <td key={column.key} className="max-w-[260px] p-2 align-top">
                                <span className="line-clamp-2" title={value}>
                                  {value}
                                </span>
                                <div className="mt-1">
                                  {rowExternalUrl ? (
                                    <a
                                      href={rowExternalUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(event) => event.stopPropagation()}
                                      className="inline-flex rounded border px-2 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                                    >
                                      Buka Link
                                    </a>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">Link: -</span>
                                  )}
                                </div>
                              </td>
                            );
                          }

                          return <td key={column.key} className="p-2 align-top">{value}</td>;
                        })}
                        {isResearchOutputsSection && researchOutputColumns.map((column) => {
                          const value = getResearchOutputColumnValue({
                            key: column.key,
                            payload: row.payload ?? {},
                            year: row.tahun_pelaporan,
                          });

                          if (column.key === 'judulLuaran') {
                            return (
                              <td key={column.key} className="max-w-[260px] p-2 align-top">
                                <span className="line-clamp-2" title={value}>
                                  {value}
                                </span>
                                <div className="mt-1">
                                  {rowExternalUrl ? (
                                    <a
                                      href={rowExternalUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(event) => event.stopPropagation()}
                                      className="inline-flex rounded border px-2 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                                    >
                                      Buka Link
                                    </a>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">Link: -</span>
                                  )}
                                </div>
                              </td>
                            );
                          }

                          return <td key={column.key} className="p-2 align-top">{value}</td>;
                        })}
                        {isStudyPeriodSection && (
                          <>
                            <td className="p-2 align-top">{row.payload?.tahun_masuk != null ? row.payload.tahun_masuk : '-'}</td>
                            <td className="p-2 align-top">{row.payload?.tahun_lulus != null ? row.payload.tahun_lulus : '-'}</td>
                          </>
                        )}
                        {isWaitingTimeSection && (
                          <>
                            <td className="p-2 align-top">{row.tahun_pelaporan}</td>
                            <td className="p-2 align-top">{getWaitingTimeBucketLabel(row.payload ?? {})}</td>
                            <td className="p-2 align-top">{row.payload?.tahun_mulai_kerja != null ? row.payload.tahun_mulai_kerja : '-'}</td>
                          </>
                        )}
                        {isWorkCoverageSection && (
                          <>
                            <td className="p-2 align-top">{row.tahun_pelaporan}</td>
                            <td className="p-2 align-top">{getWorkScopeLabel(row.payload ?? {})}</td>
                          </>
                        )}
                        {!isStudyPeriodSection
                          && !isWaitingTimeSection
                          && !isWorkCoverageSection
                          && !isStudentProductsSection
                          && !isPublicationsSection
                          && !isResearchOutputsSection
                          && <td className="p-2 align-top">{row.tahun_pelaporan}</td>}
                        {isStudyPeriodSection && (
                          <td className="p-2 align-top text-right">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-md"
                              onClick={() => setEditingStudyPeriodRecord(row)}
                              aria-label={`Edit masa studi ${row.snapshot_nama}`}
                              title="Edit masa studi"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </td>
                        )}
                        {isPublicationsSection && (
                          <td className="p-2 align-top text-right">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-md"
                              onClick={() => {
                                void openAchievementEdit(row, {
                                  allowedCategories: publicationAllowedCategories,
                                  publicationMode: publicationTab === 'jurnal' ? 'jurnalOnly' : 'default',
                                });
                              }}
                              disabled={openingAchievementEditId === row.id}
                              aria-label={`Edit diseminasi ilmiah ${row.snapshot_nama}`}
                              title="Edit data"
                            >
                              {openingAchievementEditId === row.id
                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                : <Pencil className="h-4 w-4" />}
                            </Button>
                          </td>
                        )}
                        {isStudentAchievementsSection && (
                          <td className="p-2 align-top text-right">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-md"
                              onClick={() => {
                                void openAchievementEdit(row);
                              }}
                              disabled={openingAchievementEditId === row.id}
                              aria-label={`Edit data prestasi ${row.snapshot_nama}`}
                              title="Edit data"
                            >
                              {openingAchievementEditId === row.id
                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                : <Pencil className="h-4 w-4" />}
                            </Button>
                          </td>
                        )}
                        {isStudentProductsSection && (
                          <td className="p-2 align-top text-right">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-md"
                              onClick={() => setEditingRecord(row)}
                              aria-label={`Edit data produk ${row.snapshot_nama}`}
                              title="Edit data"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Total {total} record - Halaman {page} dari {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded border px-2 py-1 text-xs hover:bg-muted disabled:opacity-50"
                  onClick={() => setPage((previous) => Math.max(1, previous - 1))}
                  disabled={page <= 1}
                >
                  Sebelumnya
                </button>
                <button
                  type="button"
                  className="rounded border px-2 py-1 text-xs hover:bg-muted disabled:opacity-50"
                  onClick={() => setPage((previous) => Math.min(totalPages, previous + 1))}
                  disabled={page >= totalPages}
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <Dialog
        open={viewerOpen}
        onOpenChange={(open) => {
          setViewerOpen(open);
          if (!open) setViewerMeta(null);
        }}
      >
        <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>{viewerMeta ? 'Detail Lampiran' : viewerPdf ? 'Dokumen PDF' : 'Preview Dokumen'}</DialogTitle>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-auto">
            {viewerMeta && (
              <div className="mb-4 rounded-md border bg-muted/20 p-3">
                <p className="text-sm font-semibold text-foreground">{viewerMeta.studentName}</p>
                <p className="mt-1 text-xs text-muted-foreground">Kategori: {viewerMeta.categoryLabel}</p>
                {viewerMeta.description && (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{viewerMeta.description}</p>
                )}
              </div>
            )}
            {viewerUrl && (
              viewerPdf
                ? <iframe src={viewerUrl} title="Dokumen PDF" className="h-[70vh] w-full rounded border-0" />
                : <img src={viewerUrl} alt="Dokumen" className="mx-auto max-h-[70vh] max-w-full object-contain" />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {editingRecord && (
        <EditStudentProductModal
          record={editingRecord}
          onClose={() => setEditingRecord(null)}
          onSave={(input) => handleUpdateStudentProductRecord(editingRecord, input)}
        />
      )}

      {editingStudyPeriodRecord && (
        <EditStudyPeriodModal
          record={editingStudyPeriodRecord}
          onClose={() => setEditingStudyPeriodRecord(null)}
          onSave={(input) => handleUpdateStudyPeriodRecord(editingStudyPeriodRecord, input)}
        />
      )}

      {editingAchievement && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (open) return;
            setEditingAchievement(null);
            setEditingAchievementAllowedCategories(undefined);
            setEditingAchievementPublicationMode('default');
          }}
        >
          <DialogContent className="w-[min(92vw,760px)] max-h-[90vh] overflow-y-auto rounded-2xl p-0">
            <AchievementFormModal
              masterId={editingAchievement.masterId}
              category={editingAchievement.category}
              editData={editingAchievement}
              onClose={() => {
                setEditingAchievement(null);
                setEditingAchievementAllowedCategories(undefined);
                setEditingAchievementPublicationMode('default');
              }}
              onSuccess={() => {
                setEditingAchievement(null);
                setEditingAchievementAllowedCategories(undefined);
                setEditingAchievementPublicationMode('default');
                void reloadAfterMutation();
                refreshChartSection();
              }}
              useApi
              renderMode="embedded"
              categoryScope={uploadScope}
              allowedCategories={editingAchievementAllowedCategories}
              publicationMode={editingAchievementPublicationMode}
            />
          </DialogContent>
        </Dialog>
      )}

      {canUploadAchievements && (
        <AchievementImportDialog
          open={isImportDialogOpen}
          onOpenChange={setIsImportDialogOpen}
          scope={uploadScope}
          onImportCompleted={() => {
            void reloadAfterMutation();
            refreshChartSection();
          }}
        />
      )}

      {canUploadAchievements && (
        <AchievementManualDialog
          open={isManualDialogOpen}
          onOpenChange={setIsManualDialogOpen}
          scope={uploadScope}
          onCompleted={() => {
            void reloadAfterMutation();
            refreshChartSection();
          }}
        />
      )}
    </div>
  );
}

