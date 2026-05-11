import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  getChartRecords,
  getChartRecordStudents,
  syncChartSection,
  syncAllChartSections,
  deleteChartRecord,
  updateChartRecord,
  deleteAchievementAttachment,
  uploadAchievementAttachment,
  downloadChartRecordsCsv,
  logChartExport,
  DASHBOARD_SECTION_TO_API,
  type ChartRecord,
  type ChartRecordAttachment,
  type ChartRecordStudentCard,
  type ChartRecordsSection,
  type WorkCoverageRecordTab,
} from '@/repositories/insight.repository';
import { apiClient, getApiBaseUrl } from '@/lib/api-client';
import { exportChartRecordsToExcel } from '@/lib/excel-export';
import { ArrowLeft, Download, FileText, LayoutGrid, List, Loader2, RefreshCw, Trash2, Upload, X, CheckSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WORK_SCOPE_LABELS } from '@/constants/student.constants';
import { getPrestasiJenisLabel, getPrestasiKategoriLabel, getPrestasiNama } from '@/lib/chart-record-prestasi-labels';
import {
  getPublicationColumnConfigs,
  getPublicationColumnValue,
  resolvePublicationTableTab,
  type PublicationTableTab,
} from '@/lib/chart-record-publications-table';
import {
  getResearchOutputColumnConfigs,
  getResearchOutputColumnValue,
  resolveResearchOutputsTableTab,
  type ResearchOutputsTableTab,
} from '@/lib/chart-record-research-outputs-table';
import { resolveChartRecordExternalUrl } from '@/lib/chart-record-link-utils';

const WORK_SCOPE_LABELS_BEKERJA: Record<string, string> = {
  local: 'Lokal/Wilayah',
  national: 'Nasional',
  multinational: 'Multinasional/ Internasional',
};

function resolveWorkCoverageRecordTab(rawValue: string | null | undefined): WorkCoverageRecordTab {
  return rawValue === 'entrepreneur' ? 'entrepreneur' : 'working';
}

function getWorkScopeLabel(payload: Record<string, unknown>): string {
  const scope = typeof payload.work_scope === 'string' ? payload.work_scope.trim().toLowerCase() : '';
  if (!scope) return '-';
  const status = typeof payload.career_status === 'string' ? payload.career_status.trim().toLowerCase() : '';
  if (status === 'entrepreneur') {
    return WORK_SCOPE_LABELS[scope] ?? '-';
  }
  return WORK_SCOPE_LABELS_BEKERJA[scope] ?? '-';
}

const ADVANCED_SETTINGS_SECTIONS = Object.keys(DASHBOARD_SECTION_TO_API);
const SECTIONS_WITH_CERTIFICATES = new Set(['student-achievements', 'publications', 'student-products', 'research-outputs']);
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

const RECORDS_PER_PAGE = 20;
const STUDENTS_PER_PAGE = 12;
const PREVIEW_THUMBNAIL_LIMIT = 6;
const MAX_ATTACHMENT_SIZE_BYTES = 2 * 1024 * 1024;
const INVALID_RESPONSE_MSG = 'Format respons API tidak valid: field "data" tidak ditemukan.';

function AttachmentThumbnail({
  att,
  onOpen,
}: {
  att: ChartRecordAttachment;
  onOpen: (url: string, isPdf: boolean) => void;
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const isImage = /^image\//.test(att.file_type);

  useEffect(() => {
    let objectUrl: string | null = null;
    const token = apiClient.getToken();
    const url = `${getApiBaseUrl()}/achievements/attachments/serve.php?id=${encodeURIComponent(att.id)}`;
    fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => (r.ok ? r.blob() : null))
      .then((blob) => {
        if (!blob) return;
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      })
      .finally(() => setLoading(false));
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [att.id]);

  if (loading) return <div className="h-20 w-20 animate-pulse rounded border bg-muted" />;
  if (isImage && blobUrl) {
    return (
      <button type="button" className="h-20 w-20 overflow-hidden rounded border" onClick={() => onOpen(blobUrl, false)}>
        <img src={blobUrl} alt={att.file_name} className="h-full w-full object-cover" />
      </button>
    );
  }
  return (
    <button
      type="button"
      className="flex h-20 w-20 items-center justify-center rounded border hover:bg-muted"
      onClick={() => blobUrl && onOpen(blobUrl, true)}
    >
      <FileText className="h-7 w-7 text-muted-foreground" />
    </button>
  );
}

function AttachmentUploadButton({
  achievementId,
  uploading,
  onUploadingChange,
  onUploaded,
}: {
  achievementId: string;
  uploading: boolean;
  onUploadingChange: (value: boolean) => void;
  onUploaded: () => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const onSelectFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
      toast({
        title: 'File terlalu besar',
        description: 'Ukuran lampiran maksimal 2 MB.',
        variant: 'destructive',
      });
      return;
    }
    onUploadingChange(true);
    try {
      const res = await uploadAchievementAttachment(achievementId, file);
      if (res.success) {
        toast({ title: 'Sertifikat berhasil diunggah' });
        onUploaded();
      } else {
        toast({ title: 'Gagal mengunggah', description: res.error, variant: 'destructive' });
      }
    } finally {
      onUploadingChange(false);
    }
  };

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={onSelectFile} disabled={uploading} />
      <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        Ganti/Tambah sertifikat
      </Button>
    </>
  );
}

function EditRecordModal({
  record,
  onClose,
  onSave,
}: {
  record: ChartRecord;
  onClose: () => void;
  onSave: (input: { tahun_pelaporan?: number; payload?: Record<string, unknown> }) => void;
}) {
  const { toast } = useToast();
  const [tahun, setTahun] = useState(record.tahun_pelaporan);
  const [payload, setPayload] = useState(JSON.stringify(record.payload, null, 2));
  const [saving, setSaving] = useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const parsed = JSON.parse(payload) as Record<string, unknown>;
      setSaving(true);
      onSave({ tahun_pelaporan: tahun, payload: parsed });
      setSaving(false);
    } catch {
      toast({ title: 'Payload tidak valid JSON', variant: 'destructive' });
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Edit Data</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Tahun Pelaporan</label>
            <input type="number" className="mt-1 w-full rounded-md border px-3 py-2" value={tahun} min={1900} max={2100} onChange={(e) => setTahun(parseInt(e.target.value, 10) || 0)} />
          </div>
          <div>
            <label className="text-sm font-medium">Payload (JSON)</label>
            <textarea className="mt-1 min-h-[120px] w-full rounded-md border px-3 py-2 font-mono text-xs" value={payload} onChange={(e) => setPayload(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
            <Button type="submit" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Simpan</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminAdvancedSettingsPage() {
  const { section: sectionParam } = useParams<{ section: string }>();
  const { toast } = useToast();
  const apiSection = sectionParam && DASHBOARD_SECTION_TO_API[sectionParam] ? (DASHBOARD_SECTION_TO_API[sectionParam] as ChartRecordsSection) : null;
  const hasCerts = SECTIONS_WITH_CERTIFICATES.has(sectionParam ?? '');
  const isPrestasiSection = sectionParam === 'student-achievements';
  const isPublicationsSection = sectionParam === 'publications';
  const isResearchOutputsSection = sectionParam === 'research-outputs';
  const isStudyPeriodSection = sectionParam === 'study-period';
  const isWorkCoverageSection = sectionParam === 'work-coverage';
  const label = SECTION_LABELS[sectionParam ?? ''] ?? sectionParam ?? '';

  const [records, setRecords] = useState<ChartRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [studentCards, setStudentCards] = useState<ChartRecordStudentCard[]>([]);
  const [studentTotal, setStudentTotal] = useState(0);
  const [studentPage, setStudentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingAttachmentId, setDeletingAttachmentId] = useState<string | null>(null);
  const [uploadingForRecordId, setUploadingForRecordId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'gallery'>('table');
  const [galleryStage, setGalleryStage] = useState<'students' | 'detail'>('students');
  const [selectedStudent, setSelectedStudent] = useState<ChartRecordStudentCard | null>(null);
  const [editingRecord, setEditingRecord] = useState<ChartRecord | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerPdf, setViewerPdf] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showChecklist, setShowChecklist] = useState(false);
  const [publicationTab, setPublicationTab] = useState<PublicationTableTab>('jurnal');
  const [researchOutputsTab, setResearchOutputsTab] = useState<ResearchOutputsTableTab>('haki');
  const [workCoverageTab, setWorkCoverageTab] = useState<WorkCoverageRecordTab>('working');

  const isStudentGridMode = viewMode === 'gallery' && hasCerts && galleryStage === 'students';
  const selectedStudentNim = selectedStudent?.snapshot_nim;
  const withAttachments = useMemo(() => records.filter((record) => (record.attachments?.length ?? 0) > 0), [records]);
  const recordTotalPages = Math.max(1, Math.ceil(total / RECORDS_PER_PAGE));
  const studentTotalPages = Math.max(1, Math.ceil(studentTotal / STUDENTS_PER_PAGE));
  const publicationColumns = useMemo(
    () => getPublicationColumnConfigs(publicationTab),
    [publicationTab]
  );
  const researchOutputColumns = useMemo(
    () => getResearchOutputColumnConfigs(),
    []
  );
  const sectionTab = useMemo(() => {
    if (isPublicationsSection) {
      return publicationTab;
    }
    if (isResearchOutputsSection) {
      return researchOutputsTab;
    }
    if (isWorkCoverageSection) {
      return workCoverageTab;
    }
    return undefined;
  }, [isPublicationsSection, isResearchOutputsSection, isWorkCoverageSection, publicationTab, researchOutputsTab, workCoverageTab]);

  const loadRecords = useCallback(async () => {
    if (!apiSection) return;
    setLoading(true);
    const res = await getChartRecords(apiSection, {
      page,
      per_page: RECORDS_PER_PAGE,
      include_attachments: hasCerts,
      student_nim: viewMode === 'gallery' && galleryStage === 'detail' ? selectedStudentNim : undefined,
      tab: sectionTab,
    });
    setLoading(false);
    if (!res.success) return toast({ title: 'Gagal memuat data', description: res.error ?? 'Unknown error', variant: 'destructive' });
    if (!res.data) return toast({ title: 'Gagal memuat data', description: INVALID_RESPONSE_MSG, variant: 'destructive' });
    const recordsList = res.data.records ?? [];
    setRecords(recordsList);
    setTotal(res.data.total);
    setLastSyncedAt(res.data.last_synced_at ?? null);
    setSelectedIds((prev) => prev.filter((id) => recordsList.some((r) => r.id === id)));
  }, [apiSection, page, hasCerts, viewMode, galleryStage, selectedStudentNim, sectionTab, toast]);

  const loadStudentCards = useCallback(async (silent: boolean = false) => {
    if (!apiSection || !hasCerts) return;
    if (!silent) setLoading(true);
    const res = await getChartRecordStudents(apiSection, {
      page: studentPage,
      per_page: STUDENTS_PER_PAGE,
      thumbnail_limit: PREVIEW_THUMBNAIL_LIMIT,
      tab: sectionTab,
    });
    if (!silent) setLoading(false);
    if (!res.success) return toast({ title: 'Gagal memuat galeri mahasiswa', description: res.error ?? 'Unknown error', variant: 'destructive' });
    if (!res.data) return toast({ title: 'Gagal memuat galeri mahasiswa', description: INVALID_RESPONSE_MSG, variant: 'destructive' });
    setStudentCards(res.data.students);
    setStudentTotal(res.data.total);
    setLastSyncedAt(res.data.last_synced_at ?? null);
  }, [apiSection, hasCerts, sectionTab, studentPage, toast]);

  const reloadAfterMutation = useCallback(async () => {
    await loadRecords();
    if (hasCerts) await loadStudentCards(true);
  }, [loadRecords, loadStudentCards, hasCerts]);

  useEffect(() => {
    setPage(1);
    setStudentPage(1);
    setViewMode('table');
    setGalleryStage('students');
    setSelectedStudent(null);
    setSelectedIds([]);
    setShowChecklist(false);
    setPublicationTab('jurnal');
    setResearchOutputsTab('haki');
    setWorkCoverageTab('working');
  }, [sectionParam]);

  useEffect(() => {
    if (!isPublicationsSection) return;
    setPage(1);
    setStudentPage(1);
    setSelectedIds([]);
    if (viewMode === 'gallery') {
      setGalleryStage('students');
      setSelectedStudent(null);
    }
  }, [publicationTab, isPublicationsSection, viewMode]);

  useEffect(() => {
    if (!isWorkCoverageSection) return;
    setPage(1);
    setStudentPage(1);
    setSelectedIds([]);
    setShowChecklist(false);
  }, [workCoverageTab, isWorkCoverageSection]);

  useEffect(() => {
    if (!isResearchOutputsSection) return;
    setPage(1);
    setStudentPage(1);
    setSelectedIds([]);
    if (viewMode === 'gallery') {
      setGalleryStage('students');
      setSelectedStudent(null);
    }
  }, [isResearchOutputsSection, researchOutputsTab, viewMode]);

  const allSelected = records.length > 0 && selectedIds.length === records.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < records.length;
  const toggleAllRows = (checked: boolean) => {
    if (checked) setSelectedIds(records.map((r) => r.id));
    else setSelectedIds([]);
  };
  const toggleSingleRow = (recordId: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, recordId] : prev.filter((id) => id !== recordId)));
  };

  useEffect(() => {
    if (!apiSection) return;
    if (isStudentGridMode) return void loadStudentCards();
    void loadRecords();
  }, [apiSection, isStudentGridMode, loadRecords, loadStudentCards]);

  useEffect(() => {
    if (viewMode === 'gallery' && galleryStage === 'detail' && selectedStudent && !loading && withAttachments.length === 0) {
      toast({ title: 'Galeri mahasiswa kosong', description: 'Mahasiswa ini tidak memiliki lampiran yang masuk chart.' });
      setGalleryStage('students');
      setSelectedStudent(null);
      setPage(1);
      setStudentPage(1);
    }
  }, [viewMode, galleryStage, selectedStudent, loading, withAttachments.length, toast]);

  const syncCurrent = async () => {
    if (!apiSection) return;
    setSyncing(true);
    const res = await syncChartSection(apiSection);
    setSyncing(false);
    if (!res.success) return toast({ title: 'Sinkronisasi gagal', description: res.error ?? 'Unknown error', variant: 'destructive' });
    if (!res.data) return toast({ title: 'Sinkronisasi gagal', description: INVALID_RESPONSE_MSG, variant: 'destructive' });
    toast({ title: 'Sinkronisasi berhasil', description: `${res.data.records_synced} record disinkronkan.` });
    if (isStudentGridMode) loadStudentCards();
    else reloadAfterMutation();
  };

  const syncAll = async () => {
    setSyncingAll(true);
    const results = await syncAllChartSections();
    setSyncingAll(false);
    const ok = results.filter((item) => item.success).length;
    const fail = results.filter((item) => !item.success);
    if (fail.length === 0) toast({ title: 'Sinkron semua section berhasil', description: `${ok} section disinkronkan.` });
    else toast({ title: 'Sinkron sebagian gagal', description: `${ok} berhasil, ${fail.length} gagal: ${fail.map((item) => item.section).join(', ')}`, variant: 'destructive' });
    if (isStudentGridMode) loadStudentCards();
    else reloadAfterMutation();
  };

  const removeRecord = async (recordId: string) => {
    if (!apiSection) return;
    setDeletingId(recordId);
    const res = await deleteChartRecord(apiSection, recordId);
    setDeletingId(null);
    if (!res.success) return toast({ title: 'Gagal menghapus', description: res.error ?? 'Unknown error', variant: 'destructive' });
    toast({ title: 'Record dihapus', description: 'Data dipindahkan ke Recycle Bin (30 hari).' });
    reloadAfterMutation();
  };

  const saveRecord = async (recordId: string, input: { tahun_pelaporan?: number; payload?: Record<string, unknown> }) => {
    if (!apiSection) return;
    const res = await updateChartRecord(apiSection, recordId, input);
    if (!res.success) return toast({ title: 'Gagal memperbarui', description: res.error ?? 'Unknown error', variant: 'destructive' });
    toast({ title: 'Data diperbarui', description: 'Perubahan tersimpan.' });
    setEditingRecord(null);
    reloadAfterMutation();
  };

  const removeAttachment = async (attachmentId: string) => {
    setDeletingAttachmentId(attachmentId);
    const res = await deleteAchievementAttachment(attachmentId);
    setDeletingAttachmentId(null);
    if (!res.success) return toast({ title: 'Gagal menghapus sertifikat', description: res.error, variant: 'destructive' });
    toast({ title: 'Sertifikat dihapus' });
    reloadAfterMutation();
  };

  const exportCsv = async () => {
    if (!apiSection) return;
    setExporting('csv');
    const exportTab = sectionTab;
    const res = await downloadChartRecordsCsv(apiSection, undefined, exportTab);
    setExporting(null);
    if (res.success) toast({ title: 'Export CSV', description: 'File berhasil diunduh.' });
    else toast({ title: 'Export gagal', description: res.error, variant: 'destructive' });
  };

  const exportXlsx = async () => {
    if (!apiSection) return;
    setExporting('xlsx');
    const exportTab = sectionTab;
    try {
      await logChartExport(apiSection, 'xlsx', undefined, exportTab);
      await exportChartRecordsToExcel(
        records.map((row) => {
          const base = {
            nim: row.snapshot_nim,
            nama: row.snapshot_nama,
            tahun_pelaporan: row.tahun_pelaporan,
            payload_preview: JSON.stringify(row.payload).slice(0, 500),
          };
          if (isPrestasiSection) {
            const p = row.payload ?? {};
            return {
              ...base,
              jenis_prestasi: getPrestasiJenisLabel(p),
              kategori_prestasi: getPrestasiKategoriLabel(p),
              nama_prestasi: getPrestasiNama(p),
            };
          }
          return base;
        }),
        label
      );
      toast({ title: 'Export XLSX', description: 'File berhasil diunduh.' });
    } catch (error) {
      toast({ title: 'Export gagal', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
    }
    setExporting(null);
  };

  if (!sectionParam || !ADVANCED_SETTINGS_SECTIONS.includes(sectionParam)) {
    return <div className="p-6"><p>Section tidak valid.</p><Button variant="link" asChild><Link to="/admin/dashboard/all">Kembali ke Dashboard</Link></Button></div>;
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-shrink-0 border-b bg-card p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild><Link to={`/admin/dashboard/${sectionParam}`}><ArrowLeft className="h-4 w-4" /></Link></Button>
            <h1 className="text-lg font-semibold">Advanced Settings - {label}</h1>
          </div>
          <div className="flex items-center gap-2">
            {lastSyncedAt && <span className="text-sm text-muted-foreground">Terakhir sinkron: {new Date(lastSyncedAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}</span>}
            <Button variant="outline" size="sm" onClick={exportCsv} disabled={!!exporting || loading || records.length === 0}>{exporting === 'csv' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}CSV</Button>
            <Button variant="outline" size="sm" onClick={exportXlsx} disabled={!!exporting || loading || records.length === 0}>{exporting === 'xlsx' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}XLSX</Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void logChartExport(apiSection!, 'pdf', undefined, isWorkCoverageSection ? workCoverageTab : undefined);
                window.print();
              }}
              disabled={loading || records.length === 0}
            >
              PDF
            </Button>
            <Button onClick={syncCurrent} disabled={syncing || syncingAll}>{syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}Sinkron section ini</Button>
            <Button variant="outline" onClick={syncAll} disabled={syncing || syncingAll}>{syncingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}Sinkron semua section</Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <p className="mb-4 text-sm text-muted-foreground">Data di bawah ini adalah sumber grafik untuk section ini. Menghapus record hanya menyembunyikan dari grafik dan export (soft delete).</p>

        {hasCerts && !loading && (records.length > 0 || studentTotal > 0) && (
          <div className="mb-4 flex gap-2">
            <Button variant={viewMode === 'table' ? 'default' : 'outline'} size="sm" onClick={() => { setViewMode('table'); setGalleryStage('students'); setSelectedStudent(null); setPage(1); }}><List className="mr-1 h-4 w-4" />Tabel</Button>
            <Button variant={viewMode === 'gallery' ? 'default' : 'outline'} size="sm" onClick={() => { setViewMode('gallery'); setGalleryStage('students'); setSelectedStudent(null); setStudentPage(1); }}><LayoutGrid className="mr-1 h-4 w-4" />Galeri (sertifikat)</Button>
          </div>
        )}

        {isPublicationsSection && (
          <div className="mb-4">
            <Tabs
              value={publicationTab}
              onValueChange={(nextValue) => setPublicationTab(resolvePublicationTableTab(nextValue))}
            >
              <TabsList className="grid h-auto w-full max-w-xl grid-cols-3 rounded-lg border border-border bg-muted/50 p-1">
                <TabsTrigger value="jurnal">Jurnal</TabsTrigger>
                <TabsTrigger value="seminar">Publikasi di Seminar</TabsTrigger>
                <TabsTrigger value="pagelaran">Pagelaran</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

        {isWorkCoverageSection && (
          <div className="mb-4">
            <Tabs
              value={workCoverageTab}
              onValueChange={(nextValue) => setWorkCoverageTab(resolveWorkCoverageRecordTab(nextValue))}
            >
              <TabsList className="grid h-auto w-full max-w-xl grid-cols-2 rounded-lg border border-border bg-muted/50 p-1">
                <TabsTrigger value="working">Bekerja</TabsTrigger>
                <TabsTrigger value="entrepreneur">Wirausaha</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

        {isResearchOutputsSection && (
          <div className="mb-4">
            <Tabs
              value={researchOutputsTab}
              onValueChange={(nextValue) => setResearchOutputsTab(resolveResearchOutputsTableTab(nextValue))}
            >
              <TabsList className="grid h-auto w-full max-w-xl grid-cols-3 rounded-lg border border-border bg-muted/50 p-1">
                <TabsTrigger value="haki">HAKI</TabsTrigger>
                <TabsTrigger value="technology">Teknologi Tepat Guna</TabsTrigger>
                <TabsTrigger value="other">Luaran Lainnya</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : viewMode === 'gallery' && hasCerts ? (
          galleryStage === 'students' ? (
            studentCards.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">Belum ada mahasiswa dengan lampiran yang masuk chart.</div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {studentCards.map((student) => (
                    <div key={student.snapshot_nim} role="button" tabIndex={0} className="rounded-lg border bg-card p-4 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary" onClick={() => { setSelectedStudent(student); setGalleryStage('detail'); setPage(1); }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedStudent(student); setGalleryStage('detail'); setPage(1); } }}>
                      <p className="line-clamp-1 text-base font-semibold text-foreground">{student.snapshot_nama}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{student.snapshot_nim}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{student.total_records} prestasi - {student.total_attachments} lampiran</p>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {student.preview_attachments.slice(0, PREVIEW_THUMBNAIL_LIMIT).map((a) => (
                          <div key={a.id} className="pointer-events-none"><AttachmentThumbnail att={a} onOpen={() => {}} /></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total {studentTotal} mahasiswa. Halaman {studentPage} ({STUDENTS_PER_PAGE} per halaman).</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setStudentPage((p) => Math.max(1, p - 1))} disabled={studentPage <= 1}>Sebelumnya</Button>
                    <Button variant="outline" size="sm" onClick={() => setStudentPage((p) => Math.min(studentTotalPages, p + 1))} disabled={studentPage >= studentTotalPages}>Selanjutnya</Button>
                  </div>
                </div>
              </>
            )
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Galeri prestasi mahasiswa</p><p className="font-medium text-foreground">{selectedStudent?.snapshot_nama} ({selectedStudent?.snapshot_nim})</p></div>
                <Button variant="outline" size="sm" onClick={() => { setGalleryStage('students'); setSelectedStudent(null); setStudentPage(1); setPage(1); }}>Kembali ke daftar mahasiswa</Button>
              </div>
              {withAttachments.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">Tidak ada record dengan dokumen sertifikat pada mahasiswa ini.</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {withAttachments.map((record) => (
                      <div key={record.id} className="flex flex-col gap-2 rounded-lg border p-4">
                        <div className="font-medium">{record.snapshot_nama}</div>
                        <div className="text-sm text-muted-foreground">{record.snapshot_nim} - {record.tahun_pelaporan}</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {record.attachments?.map((att) => (
                            <div key={att.id} className="group relative">
                              <AttachmentThumbnail att={att} onOpen={(url, isPdf) => { setViewerUrl(url); setViewerPdf(isPdf); setViewerOpen(true); }} />
                              <Button variant="destructive" size="icon" className="absolute right-0 top-0 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100" onClick={() => removeAttachment(att.id)} disabled={deletingAttachmentId === att.id}>
                                {deletingAttachmentId === att.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                              </Button>
                            </div>
                          ))}
                        </div>
                        {record.source_table === 'achievements' && <AttachmentUploadButton achievementId={record.source_id} uploading={uploadingForRecordId === record.id} onUploadingChange={(v) => setUploadingForRecordId(v ? record.id : null)} onUploaded={() => reloadAfterMutation()} />}
                        <Button variant="ghost" size="sm" className="mt-2 text-destructive" onClick={() => removeRecord(record.id)} disabled={deletingId === record.id}>{deletingId === record.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}Hapus record</Button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total {total} record mahasiswa ini. Halaman {page} ({RECORDS_PER_PAGE} per halaman).</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Sebelumnya</Button>
                      <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(recordTotalPages, p + 1))} disabled={page >= recordTotalPages}>Selanjutnya</Button>
                    </div>
                  </div>
                </>
              )}
            </>
          )
        ) : records.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">Belum ada data. Klik &quot;Sinkron dari data master&quot; untuk mengisi dari data master.</div>
        ) : (
          <>
            {viewMode === 'table' && records.length > 0 && (
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
                    <span className="text-sm text-muted-foreground">{selectedIds.length} dipilih</span>
                    <Button
                  size="sm"
                  variant="destructive"
                  disabled={deletingId !== null}
                  onClick={async () => {
                    if (!apiSection || !window.confirm(`Hapus ${selectedIds.length} record ke Recycle Bin?`)) return;
                    setDeletingId(selectedIds[0] ?? null);
                    let ok = 0;
                    for (const id of selectedIds) {
                      const res = await deleteChartRecord(apiSection, id);
                      if (res.success) ok++;
                    }
                    setDeletingId(null);
                    setSelectedIds([]);
                    await reloadAfterMutation();
                    toast({ title: ok === selectedIds.length ? 'Record dipindahkan ke Recycle Bin' : `Berhasil ${ok}, gagal ${selectedIds.length - ok}`, variant: ok < selectedIds.length ? 'destructive' : undefined });
                  }}
                >
                    {deletingId ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Trash2 className="mr-1 h-4 w-4" />}
                    Hapus ke Recycle Bin
                  </Button>
                  </>
                )}
              </div>
            )}
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    {showChecklist && (
                      <th className="w-10 p-2 text-left">
                        <Checkbox
                          checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                          onCheckedChange={(c) => toggleAllRows(c === true)}
                          aria-label="Pilih semua"
                        />
                      </th>
                    )}
                    {hasCerts && <th className="w-24 p-2 text-left font-medium">Sertifikat</th>}
                    <th className="p-2 text-left font-medium">NIM</th>
                    <th className="p-2 text-left font-medium">Nama</th>
                    {isPrestasiSection && (
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
                    {isWorkCoverageSection && (
                      <>
                        <th className="p-2 text-left font-medium">Tahun Lulus</th>
                        <th className="p-2 text-left font-medium">Level Cakupan</th>
                      </>
                    )}
                    {!isStudyPeriodSection && !isWorkCoverageSection && !isPublicationsSection && !isResearchOutputsSection && <th className="p-2 text-left font-medium">Tahun</th>}
                    {hasCerts && <th className="p-2 text-left font-medium">Status Kelengkapan</th>}
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => {
                    const recordExternalUrl = resolveChartRecordExternalUrl(record.payload ?? {}, sectionParam);
                    const prestasiName = getPrestasiNama(record.payload ?? {}) || '-';

                    return (
                    <tr key={record.id} className="border-b hover:bg-muted/30">
                      {showChecklist && (
                        <td className="p-2">
                          <Checkbox
                            checked={selectedIds.includes(record.id)}
                            onCheckedChange={(c) => toggleSingleRow(record.id, c === true)}
                            aria-label={`Pilih ${record.snapshot_nama}`}
                          />
                        </td>
                      )}
                      {hasCerts && (
                        <td className="p-2">
                          <div className="flex flex-wrap gap-1">
                            {record.attachments?.length ? record.attachments.slice(0, 2).map((att) => (
                              <AttachmentThumbnail key={att.id} att={att} onOpen={(url, isPdf) => { setViewerUrl(url); setViewerPdf(isPdf); setViewerOpen(true); }} />
                            )) : <span className="flex h-16 w-16 items-center justify-center rounded border text-xs text-muted-foreground">-</span>}
                          </div>
                        </td>
                      )}
                      <td className="p-2">{record.snapshot_nim}</td>
                      <td className="p-2">{record.snapshot_nama}</td>
                      {isPrestasiSection && (
                        <>
                          <td className="p-2">{getPrestasiJenisLabel(record.payload ?? {})}</td>
                          <td className="p-2">{getPrestasiKategoriLabel(record.payload ?? {})}</td>
                          <td className="max-w-[200px] p-2">
                            <span className="line-clamp-2" title={prestasiName}>
                              {prestasiName}
                            </span>
                            <div className="mt-1">
                              {recordExternalUrl ? (
                                <a
                                  href={recordExternalUrl}
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
                          payload: record.payload ?? {},
                          tab: publicationTab,
                          year: record.tahun_pelaporan,
                        });

                        if (column.key === 'judul') {
                          return (
                            <td key={column.key} className="max-w-[260px] p-2">
                              <span className="line-clamp-2" title={value}>
                                {value}
                              </span>
                              <div className="mt-1">
                                {recordExternalUrl ? (
                                  <a
                                    href={recordExternalUrl}
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

                        return <td key={column.key} className="p-2">{value}</td>;
                      })}
                      {isResearchOutputsSection && researchOutputColumns.map((column) => {
                        const value = getResearchOutputColumnValue({
                          key: column.key,
                          payload: record.payload ?? {},
                          year: record.tahun_pelaporan,
                        });

                        if (column.key === 'judulLuaran') {
                          return (
                            <td key={column.key} className="max-w-[260px] p-2">
                              <span className="line-clamp-2" title={value}>
                                {value}
                              </span>
                              <div className="mt-1">
                                {recordExternalUrl ? (
                                  <a
                                    href={recordExternalUrl}
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

                        return <td key={column.key} className="p-2">{value}</td>;
                      })}
                      {isStudyPeriodSection && (
                        <>
                          <td className="p-2">{record.payload?.tahun_masuk != null ? record.payload.tahun_masuk : '-'}</td>
                          <td className="p-2">{record.payload?.tahun_lulus != null ? record.payload.tahun_lulus : '-'}</td>
                        </>
                      )}
                      {isWorkCoverageSection && (
                        <>
                          <td className="p-2">{record.tahun_pelaporan}</td>
                          <td className="p-2">{getWorkScopeLabel(record.payload ?? {})}</td>
                        </>
                      )}
                      {!isStudyPeriodSection && !isWorkCoverageSection && !isPublicationsSection && !isResearchOutputsSection && <td className="p-2">{record.tahun_pelaporan}</td>}
                      {hasCerts && <td className="p-2"><span className={(record.attachments?.length ?? 0) > 0 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}>{(record.attachments?.length ?? 0) > 0 ? 'Lengkap' : 'Tidak lengkap'}</span></td>}
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total {total} record. Halaman {page} ({RECORDS_PER_PAGE} per halaman).</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Sebelumnya</Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(recordTotalPages, p + 1))} disabled={page >= recordTotalPages}>Selanjutnya</Button>
              </div>
            </div>
          </>
        )}

        <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
          <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden">
            <DialogHeader><DialogTitle>{viewerPdf ? 'Dokumen PDF' : 'Gambar'}</DialogTitle></DialogHeader>
            <div className="min-h-0 flex-1 overflow-auto">
              {viewerUrl && (viewerPdf ? <iframe src={viewerUrl} title="PDF" className="h-[70vh] w-full rounded border-0" /> : <img src={viewerUrl} alt="Sertifikat" className="mx-auto max-h-[70vh] max-w-full object-contain" />)}
            </div>
          </DialogContent>
        </Dialog>

        {editingRecord && <EditRecordModal record={editingRecord} onClose={() => setEditingRecord(null)} onSave={(input) => saveRecord(editingRecord.id, input)} />}
      </div>
    </div>
  );
}
