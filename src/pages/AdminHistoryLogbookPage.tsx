import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  getChangeLogs,
  getAchievementAttachmentRecycleBin,
  recoverAchievementAttachment,
  permanentDeleteAchievementAttachment,
  type ChangeLogEntry,
  type RecycledAchievementAttachment,
} from '@/repositories/insight.repository';
import {
  getStudentsRecycleBinFromAPI,
  recoverStudentViaAPI,
  recoverStudentsBatchViaAPI,
  permanentDeleteStudentViaAPI,
  permanentDeleteStudentsBatchViaAPI,
  type RecycleBinStudentRecord,
} from '@/repositories/api-student.repository';
import {
  getEvaluationRecycleBin,
  recoverEvaluation,
  permanentDeleteEvaluation,
  type EvaluationRecycleRecord,
} from '@/repositories/evaluation.repository';
import {
  getSatisfactionTemplateRecycleBin,
  recoverSatisfactionTemplate,
  permanentDeleteSatisfactionTemplate,
} from '@/repositories/satisfaction-form.repository';
import type { SatisfactionTemplateRecycleRecord } from '@/types/satisfaction-form.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { History, Trash2, RotateCcw, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const SECTION_LABELS: Record<string, string> = {
  student_achievements: 'Prestasi Mahasiswa',
  study_period: 'Masa Studi',
  waiting_time: 'Waktu Tunggu',
  work_coverage: 'Cakupan Kerja',
  user_satisfaction: 'Kepuasan Pengguna',
  publications: 'Diseminasi Ilmiah Mahasiswa',
  seminar_kegiatan: 'Diseminasi Ilmiah Mahasiswa',
  active_students: 'Mahasiswa Aktif',
  student_products: 'Produk Mahasiswa',
  research_outputs: 'Luaran Penelitian',
  student_accounts: 'Akun Mahasiswa',
  achievement_attachments: 'Lampiran Prestasi',
  graduate_evaluations: 'Evaluasi Lulusan',
};

const PAGE_SIZE = 20;
type RecycleTab = 'students' | 'attachments' | 'evaluations' | 'satisfaction_template';

function formatDateTime(value?: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
}

export default function AdminHistoryLogbookPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'activity' | 'recycle'>('activity');
  const [recycleTab, setRecycleTab] = useState<RecycleTab>('students');
  const ALL_SECTIONS = 'all';

  const [logs, setLogs] = useState<ChangeLogEntry[]>([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsPage, setLogsPage] = useState(1);
  const [logsSection, setLogsSection] = useState<string>(ALL_SECTIONS);
  const [logsLoading, setLogsLoading] = useState(true);

  const [recycleRecords, setRecycleRecords] = useState<RecycleBinStudentRecord[]>([]);
  const [recycleTotal, setRecycleTotal] = useState(0);
  const [recyclePage, setRecyclePage] = useState(1);
  const [recycleSearchInput, setRecycleSearchInput] = useState('');
  const [recycleSearch, setRecycleSearch] = useState('');
  const [recycleLoading, setRecycleLoading] = useState(true);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [recoveringId, setRecoveringId] = useState<string | null>(null);
  const [batchRecovering, setBatchRecovering] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [batchDeleting, setBatchDeleting] = useState(false);
  const [confirmPermanent, setConfirmPermanent] = useState<{ record: RecycleBinStudentRecord } | null>(null);
  const [confirmBatchPermanent, setConfirmBatchPermanent] = useState(false);

  const [attachmentRecords, setAttachmentRecords] = useState<RecycledAchievementAttachment[]>([]);
  const [attachmentTotal, setAttachmentTotal] = useState(0);
  const [attachmentPage, setAttachmentPage] = useState(1);
  const [attachmentSearchInput, setAttachmentSearchInput] = useState('');
  const [attachmentSearch, setAttachmentSearch] = useState('');
  const [attachmentLoading, setAttachmentLoading] = useState(true);
  const [recoveringAttachmentId, setRecoveringAttachmentId] = useState<string | null>(null);
  const [deletingAttachmentId, setDeletingAttachmentId] = useState<string | null>(null);
  const [confirmAttachmentPermanent, setConfirmAttachmentPermanent] = useState<{ record: RecycledAchievementAttachment } | null>(null);

  const [evaluationRecords, setEvaluationRecords] = useState<EvaluationRecycleRecord[]>([]);
  const [evaluationTotal, setEvaluationTotal] = useState(0);
  const [evaluationPage, setEvaluationPage] = useState(1);
  const [evaluationSearchInput, setEvaluationSearchInput] = useState('');
  const [evaluationSearch, setEvaluationSearch] = useState('');
  const [evaluationLoading, setEvaluationLoading] = useState(true);
  const [recoveringEvaluationId, setRecoveringEvaluationId] = useState<string | null>(null);
  const [deletingEvaluationId, setDeletingEvaluationId] = useState<string | null>(null);
  const [confirmEvaluationPermanent, setConfirmEvaluationPermanent] = useState<{ record: EvaluationRecycleRecord } | null>(null);

  const [selectedAttachmentIds, setSelectedAttachmentIds] = useState<string[]>([]);
  const [batchRecoveringAttachments, setBatchRecoveringAttachments] = useState(false);
  const [batchDeletingAttachments, setBatchDeletingAttachments] = useState(false);
  const [confirmBatchAttachmentPermanent, setConfirmBatchAttachmentPermanent] = useState(false);

  const [selectedEvaluationIds, setSelectedEvaluationIds] = useState<string[]>([]);
  const [batchRecoveringEvaluations, setBatchRecoveringEvaluations] = useState(false);
  const [batchDeletingEvaluations, setBatchDeletingEvaluations] = useState(false);
  const [confirmBatchEvaluationPermanent, setConfirmBatchEvaluationPermanent] = useState(false);

  const [satisfactionTemplateRecords, setSatisfactionTemplateRecords] = useState<SatisfactionTemplateRecycleRecord[]>([]);
  const [satisfactionTemplateTotal, setSatisfactionTemplateTotal] = useState(0);
  const [satisfactionTemplatePage, setSatisfactionTemplatePage] = useState(1);
  const [satisfactionTemplateSearchInput, setSatisfactionTemplateSearchInput] = useState('');
  const [satisfactionTemplateSearch, setSatisfactionTemplateSearch] = useState('');
  const [satisfactionTemplateLoading, setSatisfactionTemplateLoading] = useState(true);
  const [recoveringSatisfactionId, setRecoveringSatisfactionId] = useState<string | null>(null);
  const [deletingSatisfactionId, setDeletingSatisfactionId] = useState<string | null>(null);
  const [confirmSatisfactionPermanent, setConfirmSatisfactionPermanent] = useState<{ record: SatisfactionTemplateRecycleRecord } | null>(null);
  const [selectedSatisfactionIds, setSelectedSatisfactionIds] = useState<string[]>([]);
  const [batchRecoveringSatisfaction, setBatchRecoveringSatisfaction] = useState(false);
  const [batchDeletingSatisfaction, setBatchDeletingSatisfaction] = useState(false);
  const [confirmBatchSatisfactionPermanent, setConfirmBatchSatisfactionPermanent] = useState(false);

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedAttachmentIdSet = useMemo(() => new Set(selectedAttachmentIds), [selectedAttachmentIds]);
  const selectedEvaluationIdSet = useMemo(() => new Set(selectedEvaluationIds), [selectedEvaluationIds]);

  const loadLogs = useCallback(async () => {
    setLogsLoading(true);
    const res = await getChangeLogs({
      section: logsSection === ALL_SECTIONS ? undefined : logsSection,
      page: logsPage,
      per_page: PAGE_SIZE,
    });
    setLogsLoading(false);
    if (res.success && res.data) {
      setLogs(res.data.logs);
      setLogsTotal(res.data.total);
    }
  }, [logsSection, logsPage]);

  const loadRecycle = useCallback(async () => {
    setRecycleLoading(true);
    const res = await getStudentsRecycleBinFromAPI({
      search: recycleSearch || undefined,
      page: recyclePage,
      per_page: PAGE_SIZE,
    });
    setRecycleLoading(false);
    if (res.success && res.data) {
      setRecycleRecords(res.data.records ?? []);
      setRecycleTotal(res.data.total ?? 0);
      setSelectedIds((prev) => prev.filter((id) => (res.data?.records ?? []).some((record) => record.id === id)));
    }
  }, [recycleSearch, recyclePage]);

  const loadAttachmentRecycle = useCallback(async () => {
    setAttachmentLoading(true);
    const res = await getAchievementAttachmentRecycleBin({
      search: attachmentSearch || undefined,
      page: attachmentPage,
      per_page: PAGE_SIZE,
    });
    setAttachmentLoading(false);
    if (res.success && res.data) {
      const records = res.data.records ?? [];
      setAttachmentRecords(records);
      setAttachmentTotal(res.data.total ?? 0);
      setSelectedAttachmentIds((prev) => prev.filter((id) => records.some((r) => r.id === id)));
      return;
    }
    setAttachmentRecords([]);
    setAttachmentTotal(0);
  }, [attachmentSearch, attachmentPage]);

  const loadEvaluationRecycle = useCallback(async () => {
    setEvaluationLoading(true);
    const res = await getEvaluationRecycleBin({
      search: evaluationSearch || undefined,
      page: evaluationPage,
      per_page: PAGE_SIZE,
    });
    setEvaluationLoading(false);
    if (res.success && res.data) {
      const records = res.data.records ?? [];
      setEvaluationRecords(records);
      setEvaluationTotal(res.data.total ?? 0);
      setSelectedEvaluationIds((prev) => prev.filter((id) => records.some((r) => r.id === id)));
      return;
    }
    setEvaluationRecords([]);
    setEvaluationTotal(0);
  }, [evaluationSearch, evaluationPage]);

  const loadSatisfactionTemplateRecycle = useCallback(async () => {
    setSatisfactionTemplateLoading(true);
    const res = await getSatisfactionTemplateRecycleBin({
      search: satisfactionTemplateSearch || undefined,
      page: satisfactionTemplatePage,
      per_page: PAGE_SIZE,
    });
    setSatisfactionTemplateLoading(false);
    if (res.success && res.data) {
      const records = res.data.records ?? [];
      setSatisfactionTemplateRecords(records);
      setSatisfactionTemplateTotal(res.data.total ?? 0);
      setSelectedSatisfactionIds((prev) => prev.filter((id) => records.some((r) => r.id === id)));
      return;
    }
    setSatisfactionTemplateRecords([]);
    setSatisfactionTemplateTotal(0);
  }, [satisfactionTemplateSearch, satisfactionTemplatePage]);

  useEffect(() => {
    if (activeTab === 'activity') {
      loadLogs();
    }
  }, [activeTab, loadLogs]);

  useEffect(() => {
    if (activeTab !== 'recycle') return;

    if (recycleTab === 'students') {
      loadRecycle();
      return;
    }
    if (recycleTab === 'attachments') {
      loadAttachmentRecycle();
      return;
    }
    if (recycleTab === 'evaluations') {
      loadEvaluationRecycle();
      return;
    }
    if (recycleTab === 'satisfaction_template') {
      loadSatisfactionTemplateRecycle();
      return;
    }
  }, [activeTab, recycleTab, loadRecycle, loadAttachmentRecycle, loadEvaluationRecycle, loadSatisfactionTemplateRecycle]);

  const handleRecover = async (record: RecycleBinStudentRecord) => {
    setRecoveringId(record.id);
    const res = await recoverStudentViaAPI(record.id);
    setRecoveringId(null);

    if (res.success) {
      toast({ title: 'Berhasil', description: 'Akun mahasiswa berhasil dipulihkan.' });
      await loadRecycle();
      return;
    }

    toast({ title: 'Gagal', description: res.error ?? 'Unknown error', variant: 'destructive' });
  };

  const handleBatchRecover = async () => {
    if (selectedIds.length === 0) return;

    setBatchRecovering(true);
    const res = await recoverStudentsBatchViaAPI(selectedIds);
    setBatchRecovering(false);

    if (res.success) {
      setSelectedIds([]);
      toast({
        title: 'Berhasil',
        description: selectedIds.length === 1
          ? '1 akun mahasiswa berhasil dipulihkan.'
          : `${selectedIds.length} akun mahasiswa berhasil dipulihkan.`,
      });
      await loadRecycle();
      return;
    }

    toast({ title: 'Gagal', description: res.error ?? 'Unknown error', variant: 'destructive' });
  };

  const handlePermanentDelete = async (record: RecycleBinStudentRecord) => {
    setDeletingId(record.id);
    const res = await permanentDeleteStudentViaAPI(record.id);
    setDeletingId(null);
    setConfirmPermanent(null);

    if (res.success) {
      toast({ title: 'Berhasil', description: 'Akun dan seluruh data terkait dihapus permanen.' });
      await loadRecycle();
      return;
    }

    toast({ title: 'Gagal', description: res.error ?? 'Unknown error', variant: 'destructive' });
  };

  const handleBatchPermanentDelete = async () => {
    if (selectedIds.length === 0) return;

    setBatchDeleting(true);
    const res = await permanentDeleteStudentsBatchViaAPI(selectedIds);
    setBatchDeleting(false);
    setConfirmBatchPermanent(false);

    if (res.success) {
      setSelectedIds([]);
      const count = res.data?.deleted_count ?? selectedIds.length;
      toast({
        title: 'Berhasil',
        description: count === 1
          ? '1 akun mahasiswa berhasil dihapus permanen.'
          : `${count} akun mahasiswa berhasil dihapus permanen.`,
      });
      await loadRecycle();
      return;
    }

    toast({ title: 'Gagal', description: res.error ?? 'Unknown error', variant: 'destructive' });
  };

  const handleRecoverAttachment = async (record: RecycledAchievementAttachment) => {
    setRecoveringAttachmentId(record.id);
    const res = await recoverAchievementAttachment(record.id);
    setRecoveringAttachmentId(null);

    if (res.success) {
      toast({ title: 'Berhasil', description: 'Lampiran berhasil dipulihkan.' });
      await loadAttachmentRecycle();
      return;
    }

    toast({ title: 'Gagal', description: res.error ?? 'Unknown error', variant: 'destructive' });
  };

  const handlePermanentDeleteAttachment = async (record: RecycledAchievementAttachment) => {
    setDeletingAttachmentId(record.id);
    const res = await permanentDeleteAchievementAttachment(record.id);
    setDeletingAttachmentId(null);
    setConfirmAttachmentPermanent(null);

    if (res.success) {
      toast({ title: 'Berhasil', description: 'Lampiran berhasil dihapus permanen.' });
      await loadAttachmentRecycle();
      return;
    }

    toast({ title: 'Gagal', description: res.error ?? 'Unknown error', variant: 'destructive' });
  };

  const handleRecoverEvaluation = async (record: EvaluationRecycleRecord) => {
    setRecoveringEvaluationId(record.id);
    const res = await recoverEvaluation(record.id);
    setRecoveringEvaluationId(null);

    if (res.success) {
      toast({ title: 'Berhasil', description: 'Evaluasi berhasil dipulihkan.' });
      await loadEvaluationRecycle();
      return;
    }

    toast({ title: 'Gagal', description: res.error ?? 'Unknown error', variant: 'destructive' });
  };

  const handlePermanentDeleteEvaluation = async (record: EvaluationRecycleRecord) => {
    setDeletingEvaluationId(record.id);
    const res = await permanentDeleteEvaluation(record.id);
    setDeletingEvaluationId(null);
    setConfirmEvaluationPermanent(null);

    if (res.success) {
      toast({ title: 'Berhasil', description: 'Evaluasi berhasil dihapus permanen.' });
      await loadEvaluationRecycle();
      return;
    }

    toast({ title: 'Gagal', description: res.error ?? 'Unknown error', variant: 'destructive' });
  };

  const handleBatchRecoverAttachments = async () => {
    if (selectedAttachmentIds.length === 0) return;
    setBatchRecoveringAttachments(true);
    let ok = 0;
    let err = 0;
    for (const id of selectedAttachmentIds) {
      const res = await recoverAchievementAttachment(id);
      if (res.success) ok++; else err++;
    }
    setBatchRecoveringAttachments(false);
    setSelectedAttachmentIds([]);
    if (ok > 0) {
      toast({
        title: 'Berhasil',
        description: ok === 1 ? '1 lampiran berhasil dipulihkan.' : `${ok} lampiran berhasil dipulihkan.`,
      });
      await loadAttachmentRecycle();
    }
    if (err > 0) {
      toast({ title: 'Gagal', description: `${err} item gagal dipulihkan.`, variant: 'destructive' });
    }
  };

  const handleBatchPermanentDeleteAttachments = async () => {
    if (selectedAttachmentIds.length === 0) return;
    setBatchDeletingAttachments(true);
    setConfirmBatchAttachmentPermanent(false);
    let ok = 0;
    let err = 0;
    for (const id of selectedAttachmentIds) {
      const res = await permanentDeleteAchievementAttachment(id);
      if (res.success) ok++; else err++;
    }
    setBatchDeletingAttachments(false);
    setSelectedAttachmentIds([]);
    if (ok > 0) {
      toast({
        title: 'Berhasil',
        description: ok === 1 ? '1 lampiran berhasil dihapus permanen.' : `${ok} lampiran berhasil dihapus permanen.`,
      });
      await loadAttachmentRecycle();
    }
    if (err > 0) {
      toast({ title: 'Gagal', description: `${err} item gagal dihapus permanen.`, variant: 'destructive' });
    }
  };

  const handleBatchRecoverEvaluations = async () => {
    if (selectedEvaluationIds.length === 0) return;
    setBatchRecoveringEvaluations(true);
    let ok = 0;
    let err = 0;
    for (const id of selectedEvaluationIds) {
      const res = await recoverEvaluation(id);
      if (res.success) ok++; else err++;
    }
    setBatchRecoveringEvaluations(false);
    setSelectedEvaluationIds([]);
    if (ok > 0) {
      toast({
        title: 'Berhasil',
        description: ok === 1 ? '1 evaluasi berhasil dipulihkan.' : `${ok} evaluasi berhasil dipulihkan.`,
      });
      await loadEvaluationRecycle();
    }
    if (err > 0) {
      toast({ title: 'Gagal', description: `${err} item gagal dipulihkan.`, variant: 'destructive' });
    }
  };

  const handleBatchPermanentDeleteEvaluations = async () => {
    if (selectedEvaluationIds.length === 0) return;
    setBatchDeletingEvaluations(true);
    setConfirmBatchEvaluationPermanent(false);
    let ok = 0;
    let err = 0;
    for (const id of selectedEvaluationIds) {
      const res = await permanentDeleteEvaluation(id);
      if (res.success) ok++; else err++;
    }
    setBatchDeletingEvaluations(false);
    setSelectedEvaluationIds([]);
    if (ok > 0) {
      toast({
        title: 'Berhasil',
        description: ok === 1 ? '1 evaluasi berhasil dihapus permanen.' : `${ok} evaluasi berhasil dihapus permanen.`,
      });
      await loadEvaluationRecycle();
    }
    if (err > 0) {
      toast({ title: 'Gagal', description: `${err} item gagal dihapus permanen.`, variant: 'destructive' });
    }
  };

  const handleRecoverSatisfactionTemplate = async (record: SatisfactionTemplateRecycleRecord) => {
    setRecoveringSatisfactionId(record.id);
    const res = await recoverSatisfactionTemplate(record.id);
    setRecoveringSatisfactionId(null);
    if (res.success) {
      toast({ title: 'Berhasil', description: 'Template form kepuasan berhasil dipulihkan.' });
      await loadSatisfactionTemplateRecycle();
    } else {
      toast({ title: 'Gagal', description: res.error ?? 'Unknown error', variant: 'destructive' });
    }
  };

  const handlePermanentDeleteSatisfactionTemplate = async (record: SatisfactionTemplateRecycleRecord) => {
    if (record.is_default) return;
    setDeletingSatisfactionId(record.id);
    const res = await permanentDeleteSatisfactionTemplate(record.id);
    setDeletingSatisfactionId(null);
    setConfirmSatisfactionPermanent(null);
    if (res.success) {
      toast({ title: 'Berhasil', description: 'Template dihapus permanen.' });
      await loadSatisfactionTemplateRecycle();
    } else {
      toast({ title: 'Gagal', description: res.error ?? 'Unknown error', variant: 'destructive' });
    }
  };

  const handleBatchRecoverSatisfactionTemplates = async () => {
    if (selectedSatisfactionIds.length === 0) return;
    setBatchRecoveringSatisfaction(true);
    let ok = 0;
    let err = 0;
    for (const id of selectedSatisfactionIds) {
      const res = await recoverSatisfactionTemplate(id);
      if (res.success) ok++; else err++;
    }
    setBatchRecoveringSatisfaction(false);
    setSelectedSatisfactionIds([]);
    if (ok > 0) {
      toast({
        title: 'Berhasil',
        description: ok === 1 ? '1 template dipulihkan.' : `${ok} template dipulihkan.`,
      });
      await loadSatisfactionTemplateRecycle();
    }
    if (err > 0) {
      toast({ title: 'Gagal', description: `${err} item gagal dipulihkan.`, variant: 'destructive' });
    }
  };

  const handleBatchPermanentDeleteSatisfactionTemplates = async () => {
    if (selectedSatisfactionIds.length === 0) return;
    setBatchDeletingSatisfaction(true);
    setConfirmBatchSatisfactionPermanent(false);
    let ok = 0;
    let err = 0;
    for (const id of selectedSatisfactionIds) {
      const res = await permanentDeleteSatisfactionTemplate(id);
      if (res.success) ok++; else err++;
    }
    setBatchDeletingSatisfaction(false);
    setSelectedSatisfactionIds([]);
    if (ok > 0) {
      toast({
        title: 'Berhasil',
        description: ok === 1 ? '1 template dihapus permanen.' : `${ok} template dihapus permanen.`,
      });
      await loadSatisfactionTemplateRecycle();
    }
    if (err > 0) {
      toast({ title: 'Gagal', description: `${err} item gagal dihapus permanen.`, variant: 'destructive' });
    }
  };

  const toggleSelected = (studentId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) {
        if (prev.includes(studentId)) return prev;
        return [...prev, studentId];
      }
      return prev.filter((id) => id !== studentId);
    });
  };

  const isAllSelected = recycleRecords.length > 0 && recycleRecords.every((record) => selectedIdSet.has(record.id));

  const toggleSelectAll = (checked: boolean) => {
    if (!checked) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(recycleRecords.map((record) => record.id));
  };

  const toggleSelectedAttachment = (id: string, checked: boolean) => {
    setSelectedAttachmentIds((prev) =>
      checked ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter((x) => x !== id)
    );
  };
  const isAllSelectedAttachments =
    attachmentRecords.length > 0 && attachmentRecords.every((r) => selectedAttachmentIdSet.has(r.id));
  const toggleSelectAllAttachments = (checked: boolean) => {
    if (!checked) {
      setSelectedAttachmentIds([]);
      return;
    }
    setSelectedAttachmentIds(attachmentRecords.map((r) => r.id));
  };

  const toggleSelectedEvaluation = (id: string, checked: boolean) => {
    setSelectedEvaluationIds((prev) =>
      checked ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter((x) => x !== id)
    );
  };
  const isAllSelectedEvaluations =
    evaluationRecords.length > 0 && evaluationRecords.every((r) => selectedEvaluationIdSet.has(r.id));
  const toggleSelectAllEvaluations = (checked: boolean) => {
    if (!checked) {
      setSelectedEvaluationIds([]);
      return;
    }
    setSelectedEvaluationIds(evaluationRecords.map((r) => r.id));
  };

  const selectedSatisfactionIdSet = useMemo(() => new Set(selectedSatisfactionIds), [selectedSatisfactionIds]);
  const toggleSelectedSatisfaction = (id: string, checked: boolean) => {
    setSelectedSatisfactionIds((prev) =>
      checked ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter((x) => x !== id)
    );
  };
  const isAllSelectedSatisfaction =
    satisfactionTemplateRecords.length > 0 &&
    satisfactionTemplateRecords.filter((r) => !r.is_default).every((r) => selectedSatisfactionIdSet.has(r.id));
  const toggleSelectAllSatisfaction = (checked: boolean) => {
    if (!checked) {
      setSelectedSatisfactionIds([]);
      return;
    }
    setSelectedSatisfactionIds(satisfactionTemplateRecords.filter((r) => !r.is_default).map((r) => r.id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <History className="h-5 w-5" />
          Riwayat Logbook
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Log aktivitas admin dan recycle bin umum. Log aktivitas dihapus permanen setelah 20 hari (tanpa recycle bin). Semua item recycle (akun, lampiran, evaluasi, template form kepuasan) auto-purge setelah 30 hari.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'activity' | 'recycle')}>
        <TabsList>
          <TabsTrigger value="activity">Aktivitas</TabsTrigger>
          <TabsTrigger value="recycle">Recycle Bin</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="mt-4">
          <div className="flex gap-2 mb-4">
            <Select
              value={logsSection}
              onValueChange={(value) => {
                setLogsSection(value);
                setLogsPage(1);
              }}
            >
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Filter section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_SECTIONS}>Semua section</SelectItem>
                {Object.entries(SECTION_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {logsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">Belum ada log aktivitas.</p>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-2 font-medium">Waktu</th>
                      <th className="text-left p-2 font-medium">Admin</th>
                      <th className="text-left p-2 font-medium">Aksi</th>
                      <th className="text-left p-2 font-medium">Section</th>
                      <th className="text-left p-2 font-medium">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-muted/30">
                        <td className="p-2">{formatDateTime(log.changed_at)}</td>
                        <td className="p-2">{log.admin_nama ?? log.admin_id}</td>
                        <td className="p-2">{log.action_label}</td>
                        <td className="p-2">{log.section_label}</td>
                        <td className="p-2 max-w-[220px] truncate" title={typeof log.old_data === 'object' ? JSON.stringify(log.old_data) : ''}>
                          {typeof log.old_data === 'object' && log.old_data && 'snapshot_nama' in log.old_data
                            ? String((log.old_data as { snapshot_nama?: string }).snapshot_nama ?? '')
                            : `Record ${log.record_id}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-muted-foreground">Total {logsTotal} log</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLogsPage((prev) => Math.max(1, prev - 1))}
                    disabled={logsPage <= 1}
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLogsPage((prev) => prev + 1)}
                    disabled={logsPage * PAGE_SIZE >= logsTotal}
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="recycle" className="mt-4">
          <Tabs value={recycleTab} onValueChange={(value) => setRecycleTab(value as RecycleTab)}>
            <TabsList>
              <TabsTrigger value="students">Akun</TabsTrigger>
              <TabsTrigger value="attachments">Lampiran</TabsTrigger>
              <TabsTrigger value="evaluations">Evaluasi</TabsTrigger>
              <TabsTrigger value="satisfaction_template">Template Form Kepuasan Pengguna</TabsTrigger>
            </TabsList>

            <TabsContent value="students" className="mt-4">
              <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-2">
                  <Input
                    value={recycleSearchInput}
                    onChange={(event) => setRecycleSearchInput(event.target.value)}
                    placeholder="Cari nama atau NIM"
                    className="w-72"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRecyclePage(1);
                      setRecycleSearch(recycleSearchInput.trim());
                    }}
                  >
                    Cari
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleBatchRecover}
                    disabled={selectedIds.length === 0 || batchRecovering}
                  >
                    {batchRecovering ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                    Pulihkan Terpilih ({selectedIds.length})
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setConfirmBatchPermanent(true)}
                    disabled={selectedIds.length === 0 || batchDeleting}
                  >
                    {batchDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Hapus Permanen Terpilih ({selectedIds.length})
                  </Button>
                </div>
              </div>

              {recycleLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : recycleRecords.length === 0 ? (
                <p className="text-center py-12 text-muted-foreground">Recycle Bin akun mahasiswa kosong.</p>
              ) : (
                <>
                  <div className="rounded-md border overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="p-2 w-12">
                            <input
                              type="checkbox"
                              checked={isAllSelected}
                              onChange={(event) => toggleSelectAll(event.target.checked)}
                              aria-label="Pilih semua akun"
                            />
                          </th>
                          <th className="text-left p-2 font-medium">NIM</th>
                          <th className="text-left p-2 font-medium">Nama</th>
                          <th className="text-left p-2 font-medium">Status</th>
                          <th className="text-left p-2 font-medium">Dihapus</th>
                          <th className="w-56 p-2">Pulihkan / Hapus Permanen</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recycleRecords.map((record) => (
                          <tr key={record.id} className="border-b hover:bg-muted/30">
                            <td className="p-2">
                              <input
                                type="checkbox"
                                checked={selectedIdSet.has(record.id)}
                                onChange={(event) => toggleSelected(record.id, event.target.checked)}
                                aria-label={`Pilih akun ${record.nama}`}
                              />
                            </td>
                            <td className="p-2">{record.nim}</td>
                            <td className="p-2">{record.nama}</td>
                            <td className="p-2">{record.status}</td>
                            <td className="p-2">{formatDateTime(record.deleted_at)}</td>
                            <td className="p-2 flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRecover(record)}
                                disabled={recoveringId === record.id}
                              >
                                {recoveringId === record.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                                Pulihkan
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setConfirmPermanent({ record })}
                                disabled={deletingId === record.id}
                              >
                                {deletingId === record.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                Hapus Permanen
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-muted-foreground">Total {recycleTotal} akun</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRecyclePage((prev) => Math.max(1, prev - 1))}
                        disabled={recyclePage <= 1}
                      >
                        Sebelumnya
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRecyclePage((prev) => prev + 1)}
                        disabled={recyclePage * PAGE_SIZE >= recycleTotal}
                      >
                        Selanjutnya
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="attachments" className="mt-4">
              <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-2">
                  <Input
                    value={attachmentSearchInput}
                    onChange={(event) => setAttachmentSearchInput(event.target.value)}
                    placeholder="Cari file, NIM, atau nama mahasiswa"
                    className="w-80"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAttachmentPage(1);
                      setAttachmentSearch(attachmentSearchInput.trim());
                    }}
                  >
                    Cari
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleBatchRecoverAttachments}
                    disabled={selectedAttachmentIds.length === 0 || batchRecoveringAttachments}
                  >
                    {batchRecoveringAttachments ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                    Pulihkan Terpilih ({selectedAttachmentIds.length})
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setConfirmBatchAttachmentPermanent(true)}
                    disabled={selectedAttachmentIds.length === 0 || batchDeletingAttachments}
                  >
                    {batchDeletingAttachments ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Hapus Permanen Terpilih ({selectedAttachmentIds.length})
                  </Button>
                </div>
              </div>

              {attachmentLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : attachmentRecords.length === 0 ? (
                <p className="text-center py-12 text-muted-foreground">Recycle Bin lampiran kosong.</p>
              ) : (
                <>
                  <div className="rounded-md border overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="p-2 w-12">
                            <input
                              type="checkbox"
                              checked={isAllSelectedAttachments}
                              onChange={(e) => toggleSelectAllAttachments(e.target.checked)}
                              aria-label="Pilih semua lampiran"
                            />
                          </th>
                          <th className="text-left p-2 font-medium">File</th>
                          <th className="text-left p-2 font-medium">Pemilik</th>
                          <th className="text-left p-2 font-medium">Kategori</th>
                          <th className="text-left p-2 font-medium">Dihapus</th>
                          <th className="w-56 p-2">Pulihkan / Hapus Permanen</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attachmentRecords.map((record) => (
                          <tr key={record.id} className="border-b hover:bg-muted/30">
                            <td className="p-2">
                              <input
                                type="checkbox"
                                checked={selectedAttachmentIdSet.has(record.id)}
                                onChange={(e) => toggleSelectedAttachment(record.id, e.target.checked)}
                                aria-label={`Pilih lampiran ${record.file_name}`}
                              />
                            </td>
                            <td className="p-2">
                              <div className="font-medium">{record.file_name}</div>
                              <div className="text-xs text-muted-foreground">{record.file_type}</div>
                            </td>
                            <td className="p-2">
                              <div>{record.student_nama}</div>
                              <div className="text-xs text-muted-foreground">{record.student_nim}</div>
                            </td>
                            <td className="p-2">{record.achievement_key}</td>
                            <td className="p-2">{formatDateTime(record.deleted_at)}</td>
                            <td className="p-2 flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRecoverAttachment(record)}
                                disabled={recoveringAttachmentId === record.id}
                              >
                                {recoveringAttachmentId === record.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                                Pulihkan
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setConfirmAttachmentPermanent({ record })}
                                disabled={deletingAttachmentId === record.id}
                              >
                                {deletingAttachmentId === record.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                Hapus Permanen
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-muted-foreground">Total {attachmentTotal} lampiran</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAttachmentPage((prev) => Math.max(1, prev - 1))}
                        disabled={attachmentPage <= 1}
                      >
                        Sebelumnya
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAttachmentPage((prev) => prev + 1)}
                        disabled={attachmentPage * PAGE_SIZE >= attachmentTotal}
                      >
                        Selanjutnya
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="evaluations" className="mt-4">
              <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-2">
                  <Input
                    value={evaluationSearchInput}
                    onChange={(event) => setEvaluationSearchInput(event.target.value)}
                    placeholder="Cari judul evaluasi"
                    className="w-80"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEvaluationPage(1);
                      setEvaluationSearch(evaluationSearchInput.trim());
                    }}
                  >
                    Cari
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleBatchRecoverEvaluations}
                    disabled={selectedEvaluationIds.length === 0 || batchRecoveringEvaluations}
                  >
                    {batchRecoveringEvaluations ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                    Pulihkan Terpilih ({selectedEvaluationIds.length})
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setConfirmBatchEvaluationPermanent(true)}
                    disabled={selectedEvaluationIds.length === 0 || batchDeletingEvaluations}
                  >
                    {batchDeletingEvaluations ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Hapus Permanen Terpilih ({selectedEvaluationIds.length})
                  </Button>
                </div>
              </div>

              {evaluationLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : evaluationRecords.length === 0 ? (
                <p className="text-center py-12 text-muted-foreground">Recycle Bin evaluasi kosong.</p>
              ) : (
                <>
                  <div className="rounded-md border overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="p-2 w-12">
                            <input
                              type="checkbox"
                              checked={isAllSelectedEvaluations}
                              onChange={(e) => toggleSelectAllEvaluations(e.target.checked)}
                              aria-label="Pilih semua evaluasi"
                            />
                          </th>
                          <th className="text-left p-2 font-medium">Judul</th>
                          <th className="text-left p-2 font-medium">Status</th>
                          <th className="text-left p-2 font-medium">Target / Submit</th>
                          <th className="text-left p-2 font-medium">Dihapus</th>
                          <th className="w-56 p-2">Pulihkan / Hapus Permanen</th>
                        </tr>
                      </thead>
                      <tbody>
                        {evaluationRecords.map((record) => (
                          <tr key={record.id} className="border-b hover:bg-muted/30">
                            <td className="p-2">
                              <input
                                type="checkbox"
                                checked={selectedEvaluationIdSet.has(record.id)}
                                onChange={(e) => toggleSelectedEvaluation(record.id, e.target.checked)}
                                aria-label={`Pilih evaluasi ${record.title}`}
                              />
                            </td>
                            <td className="p-2">
                              <div className="font-medium">{record.title}</div>
                              <div className="text-xs text-muted-foreground">{record.short_message || '-'}</div>
                            </td>
                            <td className="p-2">{record.status === 'closed' ? 'Selesai' : 'Aktif'}</td>
                            <td className="p-2">
                              {(record.total_targets ?? 0)} / {(record.total_submitted ?? 0)}
                            </td>
                            <td className="p-2">{formatDateTime(record.deleted_at)}</td>
                            <td className="p-2 flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRecoverEvaluation(record)}
                                disabled={recoveringEvaluationId === record.id}
                              >
                                {recoveringEvaluationId === record.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                                Pulihkan
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setConfirmEvaluationPermanent({ record })}
                                disabled={deletingEvaluationId === record.id}
                              >
                                {deletingEvaluationId === record.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                Hapus Permanen
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-muted-foreground">Total {evaluationTotal} evaluasi</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEvaluationPage((prev) => Math.max(1, prev - 1))}
                        disabled={evaluationPage <= 1}
                      >
                        Sebelumnya
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEvaluationPage((prev) => prev + 1)}
                        disabled={evaluationPage * PAGE_SIZE >= evaluationTotal}
                      >
                        Selanjutnya
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="satisfaction_template" className="mt-4">
              <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-2">
                  <Input
                    value={satisfactionTemplateSearchInput}
                    onChange={(e) => setSatisfactionTemplateSearchInput(e.target.value)}
                    placeholder="Cari judul template"
                    className="w-72"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSatisfactionTemplatePage(1);
                      setSatisfactionTemplateSearch(satisfactionTemplateSearchInput.trim());
                    }}
                  >
                    Cari
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleBatchRecoverSatisfactionTemplates}
                    disabled={selectedSatisfactionIds.length === 0 || batchRecoveringSatisfaction}
                  >
                    {batchRecoveringSatisfaction ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                    Pulihkan Terpilih ({selectedSatisfactionIds.length})
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setConfirmBatchSatisfactionPermanent(true)}
                    disabled={selectedSatisfactionIds.length === 0 || batchDeletingSatisfaction}
                  >
                    {batchDeletingSatisfaction ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Hapus Permanen Terpilih ({selectedSatisfactionIds.length})
                  </Button>
                </div>
              </div>
              {satisfactionTemplateLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : satisfactionTemplateRecords.length === 0 ? (
                <p className="text-center py-12 text-muted-foreground">Recycle Bin template form kepuasan pengguna kosong.</p>
              ) : (
                <>
                  <div className="rounded-md border overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="p-2 w-12">
                            <input
                              type="checkbox"
                              checked={isAllSelectedSatisfaction}
                              onChange={(e) => toggleSelectAllSatisfaction(e.target.checked)}
                              aria-label="Pilih semua template"
                            />
                          </th>
                          <th className="text-left p-2 font-medium">Judul</th>
                          <th className="text-left p-2 font-medium">Dihapus</th>
                          <th className="w-56 p-2">Pulihkan / Hapus Permanen</th>
                        </tr>
                      </thead>
                      <tbody>
                        {satisfactionTemplateRecords.map((record) => (
                          <tr key={record.id} className="border-b hover:bg-muted/30">
                            <td className="p-2">
                              {!record.is_default && (
                                <input
                                  type="checkbox"
                                  checked={selectedSatisfactionIdSet.has(record.id)}
                                  onChange={(e) => toggleSelectedSatisfaction(record.id, e.target.checked)}
                                  aria-label={`Pilih ${record.title}`}
                                />
                              )}
                            </td>
                            <td className="p-2">
                              {record.title}
                              {record.is_default && <span className="text-xs text-muted-foreground ml-2">(template utama)</span>}
                            </td>
                            <td className="p-2">{formatDateTime(record.deleted_at)}</td>
                            <td className="p-2 flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRecoverSatisfactionTemplate(record)}
                                disabled={recoveringSatisfactionId === record.id}
                              >
                                {recoveringSatisfactionId === record.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                                Pulihkan
                              </Button>
                              {!record.is_default && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setConfirmSatisfactionPermanent({ record })}
                                  disabled={deletingSatisfactionId === record.id}
                                >
                                  {deletingSatisfactionId === record.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                  Hapus Permanen
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-muted-foreground">Total {satisfactionTemplateTotal} template</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSatisfactionTemplatePage((p) => Math.max(1, p - 1))}
                        disabled={satisfactionTemplatePage <= 1}
                      >
                        Sebelumnya
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSatisfactionTemplatePage((p) => p + 1)}
                        disabled={satisfactionTemplatePage * PAGE_SIZE >= satisfactionTemplateTotal}
                      >
                        Selanjutnya
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      <Dialog open={!!confirmPermanent} onOpenChange={(open) => !open && setConfirmPermanent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Hapus Permanen Akun?
            </DialogTitle>
            <DialogDescription>
              Akun mahasiswa dan seluruh data terkait akan dihapus permanen dan tidak dapat dipulihkan.
              {confirmPermanent && (
                <span className="block mt-2 font-medium">
                  {confirmPermanent.record.nama} ({confirmPermanent.record.nim})
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmPermanent(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmPermanent && handlePermanentDelete(confirmPermanent.record)}
              disabled={!!deletingId}
            >
              {deletingId ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Hapus Permanen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmBatchPermanent} onOpenChange={(open) => !open && setConfirmBatchPermanent(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Hapus Permanen {selectedIds.length} Akun?
            </DialogTitle>
            <DialogDescription>
              {selectedIds.length} akun mahasiswa terpilih dan seluruh data terkait akan dihapus permanen dan tidak dapat dipulihkan. Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmBatchPermanent(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleBatchPermanentDelete}
              disabled={batchDeleting}
            >
              {batchDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Hapus Permanen ({selectedIds.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmAttachmentPermanent} onOpenChange={(open) => !open && setConfirmAttachmentPermanent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Hapus Permanen Lampiran?
            </DialogTitle>
            <DialogDescription>
              Lampiran akan dihapus permanen dari database dan file fisik.
              {confirmAttachmentPermanent && (
                <span className="block mt-2 font-medium">
                  {confirmAttachmentPermanent.record.file_name}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAttachmentPermanent(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmAttachmentPermanent && handlePermanentDeleteAttachment(confirmAttachmentPermanent.record)}
              disabled={!!deletingAttachmentId}
            >
              {deletingAttachmentId ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Hapus Permanen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmEvaluationPermanent} onOpenChange={(open) => !open && setConfirmEvaluationPermanent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Hapus Permanen Evaluasi?
            </DialogTitle>
            <DialogDescription>
              Evaluasi dan seluruh data undangan, response, rating, serta notifikasi terkait akan dihapus permanen.
              {confirmEvaluationPermanent && (
                <span className="block mt-2 font-medium">
                  {confirmEvaluationPermanent.record.title}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmEvaluationPermanent(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmEvaluationPermanent && handlePermanentDeleteEvaluation(confirmEvaluationPermanent.record)}
              disabled={!!deletingEvaluationId}
            >
              {deletingEvaluationId ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Hapus Permanen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmBatchAttachmentPermanent} onOpenChange={(open) => !open && setConfirmBatchAttachmentPermanent(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Hapus Permanen {selectedAttachmentIds.length} Lampiran?
            </DialogTitle>
            <DialogDescription>
              {selectedAttachmentIds.length} lampiran terpilih akan dihapus permanen dari database dan file fisik. Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmBatchAttachmentPermanent(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleBatchPermanentDeleteAttachments}
              disabled={batchDeletingAttachments}
            >
              {batchDeletingAttachments ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Hapus Permanen ({selectedAttachmentIds.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmBatchEvaluationPermanent} onOpenChange={(open) => !open && setConfirmBatchEvaluationPermanent(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Hapus Permanen {selectedEvaluationIds.length} Evaluasi?
            </DialogTitle>
            <DialogDescription>
              {selectedEvaluationIds.length} evaluasi terpilih dan seluruh data terkait akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmBatchEvaluationPermanent(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleBatchPermanentDeleteEvaluations}
              disabled={batchDeletingEvaluations}
            >
              {batchDeletingEvaluations ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Hapus Permanen ({selectedEvaluationIds.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmSatisfactionPermanent} onOpenChange={(open) => !open && setConfirmSatisfactionPermanent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Hapus Permanen Template?
            </DialogTitle>
            <DialogDescription>
              Template form kepuasan &quot;{confirmSatisfactionPermanent?.record.title}&quot; akan dihapus permanen dan tidak dapat dipulihkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmSatisfactionPermanent(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmSatisfactionPermanent && handlePermanentDeleteSatisfactionTemplate(confirmSatisfactionPermanent.record)}
              disabled={!!deletingSatisfactionId}
            >
              {deletingSatisfactionId ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Hapus Permanen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmBatchSatisfactionPermanent} onOpenChange={(open) => !open && setConfirmBatchSatisfactionPermanent(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Hapus Permanen {selectedSatisfactionIds.length} Template?
            </DialogTitle>
            <DialogDescription>
              {selectedSatisfactionIds.length} template terpilih akan dihapus permanen dan tidak dapat dipulihkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmBatchSatisfactionPermanent(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleBatchPermanentDeleteSatisfactionTemplates}
              disabled={batchDeletingSatisfaction}
            >
              {batchDeletingSatisfaction ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Hapus Permanen ({selectedSatisfactionIds.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
