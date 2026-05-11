import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DistribusiPenilaianChart, KesesuaianJurusanChart } from '@/components/shared';
import {
  closeEvaluation,
  createEvaluation,
  deleteEvaluation,
  getEvaluationCharts,
  getEvaluationResultDetail,
  getEvaluationResults,
  getEvaluations,
  getEvaluationStudents,
  getSatisfactionAttachments,
  sendEvaluationNotifications,
} from '@/repositories/evaluation.repository';
import type { SatisfactionAttachmentItem } from '@/repositories/evaluation.repository';
import { apiClient, getApiBaseUrl } from '@/lib/api-client';
import type {
  Evaluation,
  EvaluationChartData,
  EvaluationResultDetail,
  EvaluationResultRow,
  EvaluationStudentTarget,
  InvitationStatus,
} from '@/types/evaluation.types';
import { useToast } from '@/hooks/use-toast';
import { exportEvaluationResultsToExcel } from '@/lib/excel-export';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  CalendarIcon,
  CheckSquare,
  Download,
  Eye,
  FileText,
  ImageIcon,
  LayoutGrid,
  Loader2,
  List,
  Plus,
  RefreshCcw,
  Send,
  Trash2,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

type CreateFormState = {
  title: string;
  short_message: string;
  start_at: string;
  end_at: string;
};

const defaultCreateForm: CreateFormState = {
  title: '',
  short_message: '',
  start_at: '',
  end_at: '',
};

const invitationStatusMap: Record<
  InvitationStatus,
  { label: string; badgeClass: string; icon: string }
> = {
  not_sent: {
    label: 'Belum dikirimi',
    badgeClass: 'bg-muted text-muted-foreground',
    icon: '⏳',
  },
  sent: {
    label: 'Sudah dikirimi',
    badgeClass: 'bg-blue-100 text-blue-700',
    icon: '📩',
  },
  submitted: {
    label: 'Sudah mengisi',
    badgeClass: 'bg-green-100 text-green-700',
    icon: '✅',
  },
};

const ratingScaleLabels: Record<number, string> = {
  5: 'Sangat Baik',
  4: 'Baik',
  3: 'Cukup Baik',
  2: 'Kurang Baik',
  1: 'Tidak Baik',
};

function parseNumberOrUndefined(value: string): number | undefined {
  if (!value || value === 'all') return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

function formatApiErrorMessage(
  response: { error?: string; code?: string },
  fallback: string
): string {
  const baseMessage = response.error || fallback;
  return response.code ? `${baseMessage} (${response.code})` : baseMessage;
}

function truncateLabel(text: string, maxLength = 40): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

/** Mengubah answers form kustom + template_definition menjadi baris { label, value } agar admin lihat pertanyaan lengkap dan jawaban (termasuk skala). */
function buildCustomAnswerRows(detail: EvaluationResultDetail): Array<{ label: string; value: string }> {
  const answers = detail.answers ?? {};
  const sections = detail.template_definition?.sections ?? [];
  const seenKeys = new Set<string>();
  const rows: Array<{ label: string; value: string }> = [];

  for (const section of sections) {
    const sectionId = section.id ?? '';
    if (!sectionId || sectionId === '__attachment') continue;
    const value = answers[sectionId];
    seenKeys.add(sectionId);
    const sectionLabel = (section.title ?? sectionId).trim() || sectionId;

    if (section.type === 'scale' && value != null && typeof value === 'object' && !Array.isArray(value)) {
      const scoreMap = value as Record<string, unknown>;
      const questions = section.questions ?? [];
      const orderedIds = questions.map((q) => q.id ?? '').filter(Boolean);
      const remaining = Object.keys(scoreMap).filter((k) => !orderedIds.includes(k));
      for (const qId of orderedIds) {
        const score = scoreMap[qId];
        const q = questions.find((x) => (x.id ?? '') === qId);
        const label = (q?.title ?? qId).trim() || qId;
        const numScore = typeof score === 'number' ? score : parseInt(String(score), 10);
        const valueStr = Number.isFinite(numScore) ? (ratingScaleLabels[numScore] ?? String(score)) : String(score ?? '-');
        rows.push({ label, value: valueStr });
      }
      for (const qId of remaining) {
        const score = scoreMap[qId];
        const numScore = typeof score === 'number' ? score : parseInt(String(score), 10);
        const valueStr = Number.isFinite(numScore) ? (ratingScaleLabels[numScore] ?? String(score)) : String(score ?? '-');
        rows.push({ label: qId, value: valueStr });
      }
    } else {
      const displayValue =
        value === null || value === undefined
          ? '-'
          : typeof value === 'object'
            ? (Array.isArray(value) ? value.join(', ') : Object.entries(value).map(([k, v]) => `${k}: ${v}`).join(', '))
            : String(value);
      rows.push({ label: sectionLabel, value: displayValue });
    }
  }

  for (const [key, value] of Object.entries(answers)) {
    if (key === '__attachment' || seenKeys.has(key)) continue;
    const displayValue =
      value === null || value === undefined
        ? '-'
        : typeof value === 'object'
          ? (Array.isArray(value) ? value.join(', ') : Object.entries(value).map(([k, v]) => `${k}: ${v}`).join(', '))
          : String(value);
    rows.push({ label: key, value: displayValue });
  }

  return rows;
}

export default function AdminEvaluasiLulusanPage() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'closed'>('active');

  const [createForm, setCreateForm] = useState<CreateFormState>(defaultCreateForm);
  const [openStartPicker, setOpenStartPicker] = useState(false);
  const [openEndPicker, setOpenEndPicker] = useState(false);

  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<string>('');
  const [selectedChartScope, setSelectedChartScope] = useState<string>('all');

  const [studentRows, setStudentRows] = useState<EvaluationStudentTarget[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const [results, setResults] = useState<EvaluationResultRow[]>([]);
  const [selectedResultDetail, setSelectedResultDetail] = useState<EvaluationResultDetail | null>(null);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [isDeletingEvaluation, setIsDeletingEvaluation] = useState(false);

  const [closedBatchMode, setClosedBatchMode] = useState(false);
  const [selectedClosedIds, setSelectedClosedIds] = useState<string[]>([]);
  const [isExportingClosed, setIsExportingClosed] = useState(false);
  const [isBatchDeletingClosed, setIsBatchDeletingClosed] = useState(false);
  const [batchDeleteTargets, setBatchDeleteTargets] = useState<{ id: string; title: string }[] | null>(null);

  const [chartData, setChartData] = useState<EvaluationChartData | null>(null);

  const [filterTahunMasuk, setFilterTahunMasuk] = useState<string>('all');
  const [filterTahunLulus, setFilterTahunLulus] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [satisfactionAttachments, setSatisfactionAttachments] = useState<SatisfactionAttachmentItem[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [attachmentViewMode, setAttachmentViewMode] = useState<'table' | 'gallery'>('table');
  const [attachmentPreviewItem, setAttachmentPreviewItem] = useState<SatisfactionAttachmentItem | null>(null);
  const [attachmentPreviewUrl, setAttachmentPreviewUrl] = useState<string | null>(null);
  const [attachmentPreviewLoading, setAttachmentPreviewLoading] = useState(false);
  const [galleryThumbnails, setGalleryThumbnails] = useState<Record<string, string>>({});

  const closedRecapRef = useRef<HTMLDivElement>(null);

  const activeEvaluations = useMemo(
    () => evaluations.filter((item) => item.status === 'active'),
    [evaluations]
  );
  const closedEvaluations = useMemo(
    () => evaluations.filter((item) => item.status === 'closed'),
    [evaluations]
  );

  const selectedEvaluation = useMemo(
    () => evaluations.find((item) => item.id === selectedEvaluationId) || null,
    [evaluations, selectedEvaluationId]
  );

  const selectedClosedEvaluation = useMemo(
    () => closedEvaluations.find((item) => item.id === selectedEvaluationId) || null,
    [closedEvaluations, selectedEvaluationId]
  );

  const aspectDistributionChartData = useMemo(() => {
    const rows = chartData?.aspect_distribution ?? [];
    return rows
      .map((row) => {
        const totalValue =
          row.sangat_baik +
          row.baik +
          row.cukup_baik +
          row.kurang_baik +
          row.tidak_baik;
        return {
          ...row,
          total_value: totalValue,
          aspect_label: truncateLabel(row.aspect_name, 56),
        };
      })
      .filter((row) => row.total_value > 0);
  }, [chartData?.aspect_distribution]);
  const hasAspectDistributionData = aspectDistributionChartData.length > 0;
  const aspectDistributionChartHeight = Math.max(320, aspectDistributionChartData.length * 62);

  const tahunMasukOptions = useMemo(() => {
    const years = Array.from(new Set(studentRows.map((row) => row.tahun_masuk).filter(Boolean)));
    return years.sort((a, b) => b - a);
  }, [studentRows]);

  const tahunLulusOptions = useMemo(() => {
    const years = Array.from(
      new Set(studentRows.map((row) => row.tahun_lulus).filter((v): v is number => typeof v === 'number'))
    );
    return years.sort((a, b) => b - a);
  }, [studentRows]);

  const selectableStudents = useMemo(
    () => studentRows.filter((row) => row.evaluation_status !== 'submitted'),
    [studentRows]
  );

  const allSelectableChecked =
    selectableStudents.length > 0 &&
    selectableStudents.every((row) => selectedStudentIds.includes(row.id));

  const loadEvaluations = useCallback(async () => {
    const response = await getEvaluations();
    if (!response.success || !response.data) {
      throw new Error(formatApiErrorMessage(response, 'Gagal memuat evaluasi'));
    }

    setEvaluations(response.data);

    const active = response.data.filter((item) => item.status === 'active');
    const closed = response.data.filter((item) => item.status === 'closed');
    const isViewingClosed = closed.some((item) => item.id === selectedEvaluationId);
    if (active.length > 0) {
      const hasSelected = active.some((item) => item.id === selectedEvaluationId);
      if (!hasSelected && !isViewingClosed) {
        setSelectedEvaluationId(active[0].id);
      }
    } else if (!isViewingClosed) {
      setSelectedEvaluationId('');
    }
  }, [selectedEvaluationId]);

  const loadStudents = useCallback(async () => {
    if (!selectedEvaluationId) {
      setStudentRows([]);
      setSelectedStudentIds([]);
      return;
    }

    const response = await getEvaluationStudents({
      evaluation_id: selectedEvaluationId,
      tahun_masuk: parseNumberOrUndefined(filterTahunMasuk),
      tahun_lulus: parseNumberOrUndefined(filterTahunLulus),
      evaluation_status:
        filterStatus === 'all'
          ? undefined
          : (filterStatus as 'not_sent' | 'sent' | 'submitted'),
    });

    if (!response.success || !response.data) {
      throw new Error(formatApiErrorMessage(response, 'Gagal memuat daftar alumni'));
    }

    setStudentRows(response.data);
    setSelectedStudentIds((prev) => prev.filter((id) => response.data.some((row) => row.id === id)));
  }, [selectedEvaluationId, filterTahunMasuk, filterTahunLulus, filterStatus]);

  const loadResults = useCallback(async () => {
    if (!selectedEvaluationId) {
      setResults([]);
      return;
    }

    const response = await getEvaluationResults(selectedEvaluationId);
    if (!response.success || !response.data) {
      throw new Error(formatApiErrorMessage(response, 'Gagal memuat hasil evaluasi'));
    }

    setResults(response.data);
  }, [selectedEvaluationId]);

  const loadSatisfactionAttachments = useCallback(async () => {
    setLoadingAttachments(true);
    try {
      const response = await getSatisfactionAttachments(selectedEvaluationId || undefined);
      if (response.success && response.data) {
        setSatisfactionAttachments(response.data);
      } else {
        setSatisfactionAttachments([]);
      }
    } catch {
      setSatisfactionAttachments([]);
    } finally {
      setLoadingAttachments(false);
    }
  }, [selectedEvaluationId]);

  const openAttachment = useCallback(async (path: string) => {
    const token = apiClient.getToken();
    if (!token) {
      toast({ title: 'Sesi habis', description: 'Silakan login kembali.', variant: 'destructive' });
      return;
    }
    const url = `${getApiBaseUrl()}/evaluations/serve_attachment.php?path=${encodeURIComponent(path)}`;
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Gagal memuat file');
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, '_blank', 'noopener');
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    } catch {
      toast({ title: 'Gagal membuka lampiran', variant: 'destructive' });
    }
  }, [toast]);

  const openAttachmentPreview = useCallback(
    async (item: SatisfactionAttachmentItem) => {
      const token = apiClient.getToken();
      if (!token) {
        toast({ title: 'Sesi habis', description: 'Silakan login kembali.', variant: 'destructive' });
        return;
      }
      setAttachmentPreviewItem(item);
      setAttachmentPreviewUrl(null);
      setAttachmentPreviewLoading(true);
      const apiUrl = `${getApiBaseUrl()}/evaluations/serve_attachment.php?path=${encodeURIComponent(item.attachment_path)}`;
      try {
        const res = await fetch(apiUrl, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Gagal memuat file');
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        setAttachmentPreviewUrl(objectUrl);
      } catch {
        toast({ title: 'Gagal memuat lampiran', variant: 'destructive' });
        setAttachmentPreviewItem(null);
      } finally {
        setAttachmentPreviewLoading(false);
      }
    },
    [toast]
  );

  const closeAttachmentPreview = useCallback(() => {
    if (attachmentPreviewUrl) URL.revokeObjectURL(attachmentPreviewUrl);
    setAttachmentPreviewUrl(null);
    setAttachmentPreviewItem(null);
  }, [attachmentPreviewUrl]);

  const isImageAttachment = useCallback((item: SatisfactionAttachmentItem) => {
    const ext = item.file_name?.toLowerCase().split('.').pop() ?? '';
    return ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext);
  }, []);

  useEffect(() => {
    if (attachmentViewMode !== 'gallery' || satisfactionAttachments.length === 0) {
      setGalleryThumbnails((prev) => {
        Object.values(prev).forEach((url) => URL.revokeObjectURL(url));
        return {};
      });
      return;
    }
    const token = apiClient.getToken();
    if (!token) return;

    const imageItems = satisfactionAttachments.filter((item) => isImageAttachment(item));
    if (imageItems.length === 0) return;

    let cancelled = false;
    const newUrls: Record<string, string> = {};

    void (async () => {
      const baseUrl = getApiBaseUrl();
      for (const item of imageItems) {
        if (cancelled) break;
        try {
          const res = await fetch(
            `${baseUrl}/evaluations/serve_attachment.php?path=${encodeURIComponent(item.attachment_path)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (res.ok) {
            const blob = await res.blob();
            newUrls[item.attachment_path] = URL.createObjectURL(blob);
          }
        } catch {
          // skip failed thumbnails
        }
      }
      if (!cancelled) {
        setGalleryThumbnails((prev) => {
          Object.values(prev).forEach((url) => URL.revokeObjectURL(url));
          return { ...newUrls };
        });
      } else {
        Object.values(newUrls).forEach((url) => URL.revokeObjectURL(url));
      }
    })();

    return () => {
      cancelled = true;
      setGalleryThumbnails((prev) => {
        Object.values(prev).forEach((url) => URL.revokeObjectURL(url));
        return {};
      });
    };
  }, [attachmentViewMode, satisfactionAttachments, isImageAttachment]);

  const loadCharts = useCallback(async () => {
    const response = await getEvaluationCharts((selectedChartScope || 'all') as string);
    if (!response.success || !response.data) {
      throw new Error(formatApiErrorMessage(response, 'Gagal memuat grafik evaluasi'));
    }

    setChartData(response.data);
  }, [selectedChartScope]);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    try {
      await loadEvaluations();
    } finally {
      setIsLoading(false);
    }
  }, [loadEvaluations]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    if (!selectedEvaluationId) return;
    void (async () => {
      try {
        await loadStudents();
        await loadResults();
        await loadSatisfactionAttachments();
      } catch (error) {
        const msg = error instanceof Error ? error.message : '';
        if (msg.includes('AUTH_TOKEN_') || msg.includes('Token tidak valid')) return;
        toast({
          title: 'Gagal memuat data evaluasi',
          description: msg || 'Terjadi kesalahan',
          variant: 'destructive',
        });
      }
    })();
  }, [selectedEvaluationId, loadStudents, loadResults, loadSatisfactionAttachments, toast]);

  // Muat grafik setelah data evaluasi selesai (token sudah ter-validasi), kurangi race condition
  useEffect(() => {
    if (isLoading) return;
    void (async () => {
      try {
        await loadCharts();
      } catch (error) {
        const msg = error instanceof Error ? error.message : '';
        // Jangan tampilkan toast untuk error auth 401; session akan di-clear dan user diarahkan ke login
        if (msg.includes('AUTH_TOKEN_') || msg.includes('Token tidak valid')) return;
        toast({
          title: 'Gagal memuat grafik evaluasi',
          description: msg || 'Terjadi kesalahan',
          variant: 'destructive',
        });
      }
    })();
  }, [isLoading, loadCharts, toast]);

  useEffect(() => {
    const REFRESH_INTERVAL_MS = 2 * 60 * 1000; // 2 menit (enterprise: kurangi frekuensi 401)
    const interval = window.setInterval(() => {
      void loadEvaluations();
      if (selectedEvaluationId) {
        void loadStudents();
        void loadResults();
      }
      void loadCharts();
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [selectedEvaluationId, loadEvaluations, loadStudents, loadResults, loadCharts]);

  useEffect(() => {
    if (!selectedChartScope || selectedChartScope === 'all') return;
    const exists = evaluations.some((evaluation) => evaluation.id === selectedChartScope);
    if (!exists) {
      setSelectedChartScope('all');
    }
  }, [evaluations, selectedChartScope]);

  const animateScrollToRecap = useCallback((targetY: number) => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      window.scrollTo({ top: targetY, behavior: 'auto' });
      return () => {};
    }

    const startY = window.scrollY;
    // Lock ke satu arah: hanya turun, jangan pernah naik.
    const safeTargetY = Math.max(startY, targetY);
    const distance = safeTargetY - startY;
    if (Math.abs(distance) < 2) return () => {};

    const durationMs = 800;
    const startTime = performance.now();
    let frameId = 0;

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / durationMs, 1);
      const easedProgress = easeInOutCubic(progress);

      window.scrollTo({
        top: startY + distance * easedProgress,
        behavior: 'auto',
      });

      if (progress < 1) {
        frameId = window.requestAnimationFrame(step);
      }
    };

    frameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  // Smooth scroll ke rekap data saat user klik evaluasi selesai (lebih halus, tidak terasa lompat)
  useEffect(() => {
    if (activeTab !== 'closed' || !selectedClosedEvaluation?.id || !closedRecapRef.current) return;
    let cancelAnimation: (() => void) | undefined;
    const frameId = window.requestAnimationFrame(() => {
      const targetY = Math.max(
        0,
        window.scrollY + (closedRecapRef.current?.getBoundingClientRect().top ?? 0) - 24
      );
      cancelAnimation = animateScrollToRecap(targetY);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      cancelAnimation?.();
    };
  }, [activeTab, selectedClosedEvaluation?.id, animateScrollToRecap]);

  const handleCreateEvaluation = async () => {
    if (!createForm.title.trim() || !createForm.start_at) {
      toast({
        title: 'Data belum lengkap',
        description: 'Judul dan tanggal mulai wajib diisi',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmittingCreate(true);
    try {
      const response = await createEvaluation({
        title: createForm.title.trim(),
        short_message: createForm.short_message.trim() || undefined,
        start_at: createForm.start_at,
        end_at: createForm.end_at || undefined,
        status: 'active',
        reminder_enabled: true,
        reminder_interval_days: 7,
      });

      if (!response.success) {
        throw new Error(formatApiErrorMessage(response, 'Gagal membuat evaluasi'));
      }

      setCreateForm(defaultCreateForm);
      toast({ title: 'Evaluasi berhasil dibuat' });

      await loadEvaluations();
      await loadCharts();
    } catch (error) {
      toast({
        title: 'Gagal membuat evaluasi',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const handleCloseEvaluation = async (id: string) => {
    try {
      const response = await closeEvaluation(id);
      if (!response.success) {
        throw new Error(formatApiErrorMessage(response, 'Gagal menutup evaluasi'));
      }

      toast({ title: 'Evaluasi berhasil ditutup' });
      await loadEvaluations();
      await loadCharts();
    } catch (error) {
      toast({
        title: 'Gagal menutup evaluasi',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteEvaluation = async (id: string) => {
    if (!deleteTarget) return;
    setIsDeletingEvaluation(true);
    try {
      const response = await deleteEvaluation(id);
      if (!response.success) {
        throw new Error(formatApiErrorMessage(response, 'Gagal memindahkan evaluasi ke Recycle Bin'));
      }
      toast({ title: 'Evaluasi dipindahkan ke Recycle Bin' });
      setDeleteTarget(null);
      setSelectedClosedIds((prev) => prev.filter((x) => x !== id));
      if (selectedEvaluationId === id) {
        setSelectedEvaluationId('');
        setSelectedChartScope('all');
      }
      await loadEvaluations();
      await loadCharts();
    } catch (error) {
      toast({
        title: 'Gagal memindahkan evaluasi ke Recycle Bin',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingEvaluation(false);
    }
  };

  const handleToggleClosedCheckbox = (evaluationId: string, checked: boolean) => {
    setSelectedClosedIds((prev) =>
      checked ? (prev.includes(evaluationId) ? prev : [...prev, evaluationId]) : prev.filter((id) => id !== evaluationId)
    );
  };

  const handleSelectAllClosed = (checked: boolean) => {
    if (!checked) {
      setSelectedClosedIds([]);
      return;
    }
    setSelectedClosedIds(closedEvaluations.map((e) => e.id));
  };

  const handleBatchDeleteClosed = () => {
    const targets = closedEvaluations.filter((e) => selectedClosedIds.includes(e.id)).map((e) => ({ id: e.id, title: e.title }));
    if (targets.length === 0) return;
    setBatchDeleteTargets(targets);
  };

  const handleConfirmBatchDeleteClosed = async () => {
    if (!batchDeleteTargets || batchDeleteTargets.length === 0) return;
    setIsBatchDeletingClosed(true);
    try {
      for (const { id } of batchDeleteTargets) {
        const response = await deleteEvaluation(id);
        if (!response.success) throw new Error(formatApiErrorMessage(response, 'Gagal memindahkan ke Recycle Bin'));
      }
      toast({ title: 'Evaluasi terpilih dipindahkan ke Recycle Bin' });
      setBatchDeleteTargets(null);
      setSelectedClosedIds([]);
      if (selectedEvaluationId && batchDeleteTargets.some((t) => t.id === selectedEvaluationId)) {
        setSelectedEvaluationId('');
        setSelectedChartScope('all');
      }
      await loadEvaluations();
      await loadCharts();
    } catch (error) {
      toast({
        title: 'Gagal memindahkan evaluasi ke Recycle Bin',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
    } finally {
      setIsBatchDeletingClosed(false);
    }
  };

  const handleExportClosed = async () => {
    if (selectedClosedIds.length === 0) return;
    setIsExportingClosed(true);
    try {
      const allRows: Array<{
        evaluation_title: string;
        nama: string;
        nim: string;
        company_name: string;
        employee_name: string;
        major_job_match: string;
        submitted_at: string;
      }> = [];
      for (const evaluationId of selectedClosedIds) {
        const response = await getEvaluationResults(evaluationId);
        if (response.success && response.data && response.data.length > 0) {
          response.data.forEach((row) => {
            allRows.push({
              evaluation_title: row.evaluation_title,
              nama: row.nama,
              nim: row.nim,
              company_name: row.company_name ?? '',
              employee_name: row.employee_name ?? '',
              major_job_match: row.major_job_match ?? '',
              submitted_at: row.submitted_at,
            });
          });
        }
      }
      if (allRows.length === 0) {
        toast({ title: 'Tidak ada data hasil survey untuk diekspor', variant: 'destructive' });
        return;
      }
      await exportEvaluationResultsToExcel(allRows, `hasil-evaluasi-${selectedClosedIds.length}-evaluasi.xlsx`);
      toast({ title: 'Data berhasil diekspor' });
    } catch (error) {
      toast({
        title: 'Gagal ekspor data',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
    } finally {
      setIsExportingClosed(false);
    }
  };

  const handleToggleStudent = (studentId: string, checked: boolean) => {
    setSelectedStudentIds((prev) => {
      if (checked) {
        return prev.includes(studentId) ? prev : [...prev, studentId];
      }
      return prev.filter((id) => id !== studentId);
    });
  };

  const handleToggleSelectAll = (checked: boolean) => {
    if (!checked) {
      setSelectedStudentIds([]);
      return;
    }

    setSelectedStudentIds(selectableStudents.map((row) => row.id));
  };

  const handleSendNotifications = async () => {
    if (!selectedEvaluationId) {
      toast({
        title: 'Pilih evaluasi aktif terlebih dahulu',
        variant: 'destructive',
      });
      return;
    }

    if (selectedStudentIds.length === 0) {
      toast({
        title: 'Belum ada alumni bekerja terpilih',
        description: 'Centang alumni bekerja yang ingin dikirimi evaluasi',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    try {
      const response = await sendEvaluationNotifications({
        evaluation_id: selectedEvaluationId,
        student_ids: selectedStudentIds,
      });

      if (!response.success) {
        throw new Error(formatApiErrorMessage(response, 'Gagal mengirim notifikasi'));
      }

      const sent = response.data?.sent_count ?? 0;
      const skipped = response.data?.skipped_count ?? 0;
      const emailSent = response.data?.email_sent_count ?? 0;
      const desc = emailSent > 0
        ? `Berhasil: ${sent}, Dilewati: ${skipped}. Link juga dikirim ke email: ${emailSent} mahasiswa.`
        : `Berhasil: ${sent}, Dilewati: ${skipped}`;

      toast({
        title: 'Kirim notifikasi selesai',
        description: desc,
      });

      setSelectedStudentIds([]);
      await loadStudents();
      await loadEvaluations();
      await loadCharts();
    } catch (error) {
      toast({
        title: 'Gagal mengirim notifikasi',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleViewResult = async (responseId: string) => {
    try {
      const response = await getEvaluationResultDetail(responseId);
      if (!response.success || !response.data) {
        throw new Error(formatApiErrorMessage(response, 'Gagal memuat detail hasil evaluasi'));
      }

      setSelectedResultDetail(response.data);
      setResultDialogOpen(true);
    } catch (error) {
      toast({
        title: 'Gagal memuat detail hasil evaluasi',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
    }
  };

  const handleManualRefresh = async () => {
    try {
      await loadEvaluations();
      if (selectedEvaluationId) {
        await loadStudents();
        await loadResults();
      }
      await loadCharts();

      toast({ title: 'Data evaluasi diperbarui' });
    } catch (error) {
      toast({
        title: 'Gagal memperbarui data',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          Memuat data evaluasi lulusan...
        </div>
      </div>
    );
  }

  const header = (selectedResultDetail?.header || {}) as Record<string, unknown>;

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Manajemen Evaluasi Lulusan</h2>
          <p className="text-sm text-muted-foreground">
            Admin → Kirim Evaluasi → Mahasiswa → Isi Survey → Data Masuk → Grafik Update
          </p>
          {/* Fitur "Atur Template Form Kepuasan" disembunyikan sementara. Lihat docs/FEATURE-TEMPLATE-FORM-KEPUASAN-HIDDEN.md */}
        </div>
        <div className="flex flex-wrap gap-2 self-start">
          <Button variant="outline" onClick={handleManualRefresh} className="gap-2">
            <RefreshCcw className="w-4 h-4" />
            Refresh Data
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Buat Evaluasi Baru</CardTitle>
          <CardDescription>
            Evaluasi baru langsung masuk tab Evaluasi Aktif dengan reminder otomatis mingguan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Judul Evaluasi</Label>
              <Input
                value={createForm.title}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, title: event.target.value }))
                }
                placeholder="Contoh: Evaluasi Lulusan ABT 2026"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Pesan Singkat Notifikasi</Label>
              <Textarea
                value={createForm.short_message}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, short_message: event.target.value }))
                }
                placeholder="Mohon isi survey evaluasi lulusan melalui tautan yang tersedia."
              />
            </div>
            <div className="space-y-2">
              <Label>Mulai Evaluasi</Label>
              <Popover open={openStartPicker} onOpenChange={setOpenStartPicker}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal h-10 rounded-md border border-input bg-background shadow-sm hover:bg-accent/50 hover:border-primary/20 transition-colors',
                      !createForm.start_at && 'text-muted-foreground'
                    )}
                    aria-label="Pilih tanggal dan waktu mulai evaluasi"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                    {createForm.start_at
                      ? format(new Date(createForm.start_at), 'd MMM yyyy, HH:mm', {
                          locale: idLocale,
                        })
                      : 'Pilih tanggal & waktu mulai'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-lg border bg-popover shadow-lg" align="start">
                  <Calendar
                    mode="single"
                    locale={idLocale}
                    selected={
                      createForm.start_at
                        ? new Date(createForm.start_at.split('T')[0])
                        : undefined
                    }
                    onSelect={(date) => {
                      if (!date) return;
                      const timePart =
                        createForm.start_at && createForm.start_at.includes('T')
                          ? createForm.start_at.split('T')[1].slice(0, 5)
                          : '00:00';
                      setCreateForm((prev) => ({
                        ...prev,
                        start_at: `${date.toISOString().split('T')[0]}T${timePart}`,
                      }));
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                  <div className="border-t px-3 py-2 space-y-2">
                    <Label className="text-xs text-muted-foreground">Waktu</Label>
                    <div className="flex gap-2">
                      <div className="flex-1 space-y-1">
                        <span className="text-xs font-medium text-foreground">Jam</span>
                        <Select
                          value={
                            createForm.start_at && createForm.start_at.includes('T')
                              ? createForm.start_at.split('T')[1].slice(0, 2)
                              : '00'
                          }
                          onValueChange={(hour) => {
                            const datePart = createForm.start_at
                              ? createForm.start_at.split('T')[0]
                              : format(new Date(), 'yyyy-MM-dd');
                            const min =
                              createForm.start_at && createForm.start_at.includes('T')
                                ? createForm.start_at.split('T')[1].slice(3, 5)
                                : '00';
                            setCreateForm((prev) => ({
                              ...prev,
                              start_at: `${datePart}T${hour.padStart(2, '0')}:${min}`,
                            }));
                          }}
                        >
                          <SelectTrigger className="h-9 w-full" aria-label="Pilih jam">
                            <SelectValue placeholder="00–23" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => (
                              <SelectItem key={i} value={String(i).padStart(2, '0')}>
                                {String(i).padStart(2, '0')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1 space-y-1">
                        <span className="text-xs font-medium text-foreground">Menit</span>
                        <Select
                          value={
                            createForm.start_at && createForm.start_at.includes('T')
                              ? createForm.start_at.split('T')[1].slice(3, 5)
                              : '00'
                          }
                          onValueChange={(min) => {
                            const datePart = createForm.start_at
                              ? createForm.start_at.split('T')[0]
                              : format(new Date(), 'yyyy-MM-dd');
                            const hour =
                              createForm.start_at && createForm.start_at.includes('T')
                                ? createForm.start_at.split('T')[1].slice(0, 2)
                                : '00';
                            setCreateForm((prev) => ({
                              ...prev,
                              start_at: `${datePart}T${hour}:${min.padStart(2, '0')}`,
                            }));
                          }}
                        >
                          <SelectTrigger className="h-9 w-full" aria-label="Pilih menit">
                            <SelectValue placeholder="00–59" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 60 }, (_, i) => (
                              <SelectItem key={i} value={String(i).padStart(2, '0')}>
                                {String(i).padStart(2, '0')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t px-3 py-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        setCreateForm((prev) => ({ ...prev, start_at: '' }));
                        setOpenStartPicker(false);
                      }}
                    >
                      Hapus
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const now = new Date();
                        setCreateForm((prev) => ({
                          ...prev,
                          start_at: format(now, "yyyy-MM-dd'T'HH:mm"),
                        }));
                        setOpenStartPicker(false);
                      }}
                    >
                      Hari ini
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Akhir Evaluasi (Opsional)</Label>
              <Popover open={openEndPicker} onOpenChange={setOpenEndPicker}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal h-10 rounded-md border border-input bg-background shadow-sm hover:bg-accent/50 hover:border-primary/20 transition-colors',
                      !createForm.end_at && 'text-muted-foreground'
                    )}
                    aria-label="Pilih tanggal dan waktu akhir evaluasi"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                    {createForm.end_at
                      ? format(new Date(createForm.end_at), 'd MMM yyyy, HH:mm', {
                          locale: idLocale,
                        })
                      : 'Pilih tanggal & waktu akhir'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-lg border bg-popover shadow-lg" align="start">
                  <Calendar
                    mode="single"
                    locale={idLocale}
                    selected={
                      createForm.end_at ? new Date(createForm.end_at.split('T')[0]) : undefined
                    }
                    onSelect={(date) => {
                      if (!date) return;
                      const timePart =
                        createForm.end_at && createForm.end_at.includes('T')
                          ? createForm.end_at.split('T')[1].slice(0, 5)
                          : '23:59';
                      setCreateForm((prev) => ({
                        ...prev,
                        end_at: `${date.toISOString().split('T')[0]}T${timePart}`,
                      }));
                    }}
                    disabled={(date) =>
                      createForm.start_at
                        ? date < new Date(createForm.start_at.split('T')[0])
                        : false
                    }
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                  <div className="border-t px-3 py-2 space-y-2">
                    <Label className="text-xs text-muted-foreground">Waktu</Label>
                    <div className="flex gap-2">
                      <div className="flex-1 space-y-1">
                        <span className="text-xs font-medium text-foreground">Jam</span>
                        <Select
                          value={
                            createForm.end_at && createForm.end_at.includes('T')
                              ? createForm.end_at.split('T')[1].slice(0, 2)
                              : '23'
                          }
                          onValueChange={(hour) => {
                            const datePart = createForm.end_at
                              ? createForm.end_at.split('T')[0]
                              : format(new Date(), 'yyyy-MM-dd');
                            const min =
                              createForm.end_at && createForm.end_at.includes('T')
                                ? createForm.end_at.split('T')[1].slice(3, 5)
                                : '59';
                            setCreateForm((prev) => ({
                              ...prev,
                              end_at: `${datePart}T${hour.padStart(2, '0')}:${min}`,
                            }));
                          }}
                        >
                          <SelectTrigger className="h-9 w-full" aria-label="Pilih jam">
                            <SelectValue placeholder="00–23" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => (
                              <SelectItem key={i} value={String(i).padStart(2, '0')}>
                                {String(i).padStart(2, '0')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1 space-y-1">
                        <span className="text-xs font-medium text-foreground">Menit</span>
                        <Select
                          value={
                            createForm.end_at && createForm.end_at.includes('T')
                              ? createForm.end_at.split('T')[1].slice(3, 5)
                              : '59'
                          }
                          onValueChange={(min) => {
                            const datePart = createForm.end_at
                              ? createForm.end_at.split('T')[0]
                              : format(new Date(), 'yyyy-MM-dd');
                            const hour =
                              createForm.end_at && createForm.end_at.includes('T')
                                ? createForm.end_at.split('T')[1].slice(0, 2)
                                : '23';
                            setCreateForm((prev) => ({
                              ...prev,
                              end_at: `${datePart}T${hour}:${min.padStart(2, '0')}`,
                            }));
                          }}
                        >
                          <SelectTrigger className="h-9 w-full" aria-label="Pilih menit">
                            <SelectValue placeholder="00–59" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 60 }, (_, i) => (
                              <SelectItem key={i} value={String(i).padStart(2, '0')}>
                                {String(i).padStart(2, '0')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t px-3 py-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        setCreateForm((prev) => ({ ...prev, end_at: '' }));
                        setOpenEndPicker(false);
                      }}
                    >
                      Hapus
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const now = new Date();
                        setCreateForm((prev) => ({
                          ...prev,
                          end_at: format(now, "yyyy-MM-dd'T'HH:mm"),
                        }));
                        setOpenEndPicker(false);
                      }}
                    >
                      Hari ini
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <Button onClick={handleCreateEvaluation} disabled={isSubmittingCreate} className="gap-2">
            {isSubmittingCreate ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Buat Evaluasi
          </Button>
        </CardContent>
      </Card>

      {evaluations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Belum ada data evaluasi. Kirim evaluasi ke lulusan untuk mulai mengumpulkan feedback.
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'active' | 'closed')}>
          <TabsList>
            <TabsTrigger value="active">Evaluasi Aktif</TabsTrigger>
            <TabsTrigger value="closed">Evaluasi Selesai</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6 mt-4">
            {activeEvaluations.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Belum ada data evaluasi. Kirim evaluasi ke lulusan untuk mulai mengumpulkan feedback.
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Daftar Evaluasi Aktif</CardTitle>
                    <CardDescription>
                      Pilih evaluasi aktif untuk mengirim notifikasi dan memantau progres.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {activeEvaluations.map((evaluation) => {
                      const isSelected = evaluation.id === selectedEvaluationId;
                      return (
                        <div
                          key={evaluation.id}
                          className={cn(
                            'rounded-lg border p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between',
                            isSelected && 'border-primary bg-primary/5'
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedEvaluationId(evaluation.id)}
                            className="text-left flex-1"
                          >
                            <p className="font-semibold text-foreground">{evaluation.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Mulai: {new Date(evaluation.start_at).toLocaleString('id-ID')}
                              {evaluation.end_at
                                ? ` · Selesai: ${new Date(evaluation.end_at).toLocaleString('id-ID')}`
                                : ''}
                            </p>
                          </button>

                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Aktif</Badge>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="gap-1"
                              onClick={() => handleCloseEvaluation(evaluation.id)}
                            >
                              <XCircle className="w-4 h-4" />
                              Tutup Evaluasi
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {selectedEvaluation?.status === 'active' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Daftar Alumni Bekerja Target Evaluasi</CardTitle>
                        <CardDescription>
                          Filter alumni bekerja, pilih multi-select, lalu kirim notifikasi evaluasi. Form yang dibuka mahasiswa mengikuti template aktif di Kustom Formulir Kepuasan.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <Select value={filterTahunMasuk} onValueChange={setFilterTahunMasuk}>
                            <SelectTrigger>
                              <SelectValue placeholder="Tahun Masuk" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Semua Tahun Masuk</SelectItem>
                              {tahunMasukOptions.map((year) => (
                                <SelectItem key={year} value={String(year)}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select value={filterTahunLulus} onValueChange={setFilterTahunLulus}>
                            <SelectTrigger>
                              <SelectValue placeholder="Tahun Lulus" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Semua Tahun Lulus</SelectItem>
                              {tahunLulusOptions.map((year) => (
                                <SelectItem key={year} value={String(year)}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger>
                              <SelectValue placeholder="Status Evaluasi" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Semua Status Evaluasi</SelectItem>
                              <SelectItem value="not_sent">⏳ Belum dikirimi</SelectItem>
                              <SelectItem value="sent">📩 Sudah dikirimi</SelectItem>
                              <SelectItem value="submitted">✅ Sudah mengisi</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            variant="default"
                            className="gap-2"
                            onClick={handleSendNotifications}
                            disabled={isSending}
                          >
                            {isSending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                            Kirim Notifikasi Evaluasi
                          </Button>
                        </div>

                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[44px]">
                                  <Checkbox
                                    checked={allSelectableChecked}
                                    onCheckedChange={(checked) =>
                                      handleToggleSelectAll(Boolean(checked))
                                    }
                                  />
                                </TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>NIM</TableHead>
                                <TableHead>Tahun Masuk</TableHead>
                                <TableHead>Tahun Lulus</TableHead>
                                <TableHead>Status Evaluasi</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {studentRows.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    Belum ada data evaluasi. Kirim evaluasi ke lulusan untuk mulai mengumpulkan feedback.
                                  </TableCell>
                                </TableRow>
                              ) : (
                                studentRows.map((row) => {
                                  const statusConfig = invitationStatusMap[row.evaluation_status];
                                  const checked = selectedStudentIds.includes(row.id);
                                  const isDisabled = row.evaluation_status === 'submitted';

                                  return (
                                    <TableRow key={row.id}>
                                      <TableCell>
                                        <Checkbox
                                          checked={checked}
                                          disabled={isDisabled}
                                          onCheckedChange={(value) =>
                                            handleToggleStudent(row.id, Boolean(value))
                                          }
                                        />
                                      </TableCell>
                                      <TableCell className="font-medium">{row.nama}</TableCell>
                                      <TableCell>{row.nim}</TableCell>
                                      <TableCell>{row.tahun_masuk}</TableCell>
                                      <TableCell>{row.tahun_lulus || '-'}</TableCell>
                                      <TableCell>
                                        <span
                                          className={cn(
                                            'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs',
                                            statusConfig.badgeClass
                                          )}
                                        >
                                          <span>{statusConfig.icon}</span>
                                          {statusConfig.label}
                                        </span>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Visualisasi Data Evaluasi</CardTitle>
                        <CardDescription>
                          Data grafik otomatis ter-update saat ada data baru.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Label className="text-sm">Ruang Lingkup Grafik:</Label>
                          <Select value={selectedChartScope} onValueChange={setSelectedChartScope}>
                            <SelectTrigger className="w-[280px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Semua Evaluasi</SelectItem>
                              {evaluations.map((evaluation) => (
                                <SelectItem key={evaluation.id} value={evaluation.id}>
                                  {evaluation.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <Card>
                            <CardContent className="p-4">
                              <p className="text-xs text-muted-foreground">Total Target</p>
                              <p className="text-2xl font-bold">{chartData?.progress.total_targets ?? 0}</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <p className="text-xs text-muted-foreground">Sudah dikirimi</p>
                              <p className="text-2xl font-bold">{chartData?.progress.total_sent ?? 0}</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <p className="text-xs text-muted-foreground">Sudah mengisi</p>
                              <p className="text-2xl font-bold">{chartData?.progress.total_submitted ?? 0}</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <p className="text-xs text-muted-foreground">Response Rate</p>
                              <p className="text-2xl font-bold flex items-center gap-1">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                                {chartData?.progress.response_rate ?? 0}%
                              </p>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="grid grid-cols-1 gap-5 items-stretch">
                          <Card className="h-full">
                            <CardHeader>
                              <CardTitle className="text-base">Distribusi Penilaian Kompetensi</CardTitle>
                            </CardHeader>
                            <CardContent className="overflow-hidden">
                              {hasAspectDistributionData ? (
                                <div className="w-full overflow-hidden">
                                  <DistribusiPenilaianChart
                                    data={aspectDistributionChartData}
                                    height={aspectDistributionChartHeight}
                                  />
                                </div>
                              ) : (
                                <div className="h-[320px] flex items-center justify-center text-sm text-muted-foreground">
                                  Belum ada data evaluasi. Kirim evaluasi ke lulusan untuk mulai mengumpulkan feedback.
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          <Card className="h-full">
                            <CardHeader>
                              <CardTitle className="text-base">Kesesuaian Jurusan dengan Pekerjaan</CardTitle>
                            </CardHeader>
                            <CardContent className="overflow-hidden">
                              {chartData?.job_match?.length ? (
                                <KesesuaianJurusanChart
                                  data={chartData.job_match}
                                  height={360}
                                  innerRadius={56}
                                />
                              ) : (
                                <div className="h-[320px] flex items-center justify-center text-sm text-muted-foreground">
                                  Belum ada data evaluasi. Kirim evaluasi ke lulusan untuk mulai mengumpulkan feedback.
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Hasil Survey per Mahasiswa</CardTitle>
                        <CardDescription>Data bersifat read-only untuk monitoring admin.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Nama</TableHead>
                                <TableHead>NIM</TableHead>
                                <TableHead>Perusahaan</TableHead>
                                <TableHead>Kesesuaian Jurusan</TableHead>
                                <TableHead>Waktu Submit</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {results.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    Belum ada data evaluasi. Kirim evaluasi ke lulusan untuk mulai mengumpulkan feedback.
                                  </TableCell>
                                </TableRow>
                              ) : (
                                results.map((row) => (
                                  <TableRow key={row.response_id}>
                                    <TableCell className="font-medium">{row.nama}</TableCell>
                                    <TableCell>{row.nim}</TableCell>
                                    <TableCell>{row.company_name}</TableCell>
                                    <TableCell>{row.major_job_match === 'ya' ? 'Ya' : row.major_job_match === 'tidak' ? 'Tidak' : (row.major_job_match ?? '-')}</TableCell>
                                    <TableCell>
                                      {new Date(row.submitted_at).toLocaleString('id-ID')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                        onClick={() => handleViewResult(row.response_id)}
                                      >
                                        <Eye className="w-4 h-4" />
                                        Lihat Hasil Evaluasi
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <CardTitle className="text-lg">Lampiran Form Kepuasan</CardTitle>
                            <CardDescription>
                              Lampiran form bertanda tangan yang diunggah mahasiswa (PDF/PNG).
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant={attachmentViewMode === 'table' ? 'secondary' : 'ghost'}
                              size="sm"
                              onClick={() => setAttachmentViewMode('table')}
                              className="gap-1.5"
                              aria-label="Tampilan tabel"
                            >
                              <List className="h-4 w-4" />
                              Tabel
                            </Button>
                            <Button
                              variant={attachmentViewMode === 'gallery' ? 'secondary' : 'ghost'}
                              size="sm"
                              onClick={() => setAttachmentViewMode('gallery')}
                              className="gap-1.5"
                              aria-label="Tampilan galeri"
                            >
                              <LayoutGrid className="h-4 w-4" />
                              Galeri
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {loadingAttachments ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                          </div>
                        ) : attachmentViewMode === 'table' ? (
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Nama</TableHead>
                                  <TableHead>NIM</TableHead>
                                  <TableHead>Evaluasi</TableHead>
                                  <TableHead>Waktu Submit</TableHead>
                                  <TableHead>File</TableHead>
                                  <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {satisfactionAttachments.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                      Belum ada lampiran.
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  satisfactionAttachments.map((item, idx) => (
                                    <TableRow key={`${item.response_id}-${item.attachment_path}-${idx}`}>
                                      <TableCell className="font-medium">{item.nama}</TableCell>
                                      <TableCell>{item.nim}</TableCell>
                                      <TableCell className="max-w-[180px] truncate">{item.evaluation_title}</TableCell>
                                      <TableCell>{new Date(item.submitted_at).toLocaleString('id-ID')}</TableCell>
                                      <TableCell className="flex items-center gap-1.5">
                                        {item.file_name?.toLowerCase().endsWith('.pdf') ? (
                                          <FileText className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                        )}
                                        <span className="truncate max-w-[120px]">{item.file_name}</span>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="gap-1.5"
                                          onClick={() => openAttachmentPreview(item)}
                                        >
                                          <Eye className="h-4 w-4" />
                                          Lihat
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                            {satisfactionAttachments.length === 0 ? (
                              <div className="col-span-full py-12 text-center text-muted-foreground">
                                Belum ada lampiran.
                              </div>
                            ) : (
                              satisfactionAttachments.map((item, idx) => {
                                const thumbUrl = galleryThumbnails[item.attachment_path];
                                const isPdf = item.file_name?.toLowerCase().endsWith('.pdf');
                                return (
                                  <div
                                    key={`g-${item.response_id}-${item.attachment_path}-${idx}`}
                                    className="rounded-lg border bg-card p-3 space-y-2"
                                  >
                                    <div className="flex justify-center rounded-md bg-muted/50 h-24 items-center overflow-hidden">
                                      {isPdf ? (
                                        <FileText className="h-10 w-10 text-muted-foreground shrink-0" />
                                      ) : thumbUrl ? (
                                        <img
                                          src={thumbUrl}
                                          alt={`Lampiran ${item.nama}`}
                                          className="h-full w-full object-contain rounded-md"
                                        />
                                      ) : (
                                        <ImageIcon className="h-10 w-10 text-muted-foreground shrink-0" />
                                      )}
                                    </div>
                                    <p className="font-medium text-sm truncate" title={item.nama}>{item.nama}</p>
                                    <p className="text-xs text-muted-foreground truncate">{item.evaluation_title}</p>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full gap-1.5"
                                      onClick={() => openAttachmentPreview(item)}
                                    >
                                      <Eye className="h-4 w-4" />
                                      Lihat
                                    </Button>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="closed" className="mt-4 space-y-6">
            {closedEvaluations.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Belum ada data evaluasi. Kirim evaluasi ke lulusan untuk mulai mengumpulkan feedback.
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Evaluasi Selesai</CardTitle>
                    <CardDescription>
                      Klik baris untuk melihat grafik dan hasil survey. Aktifkan pilih untuk pindah ke Recycle Bin atau ekspor data.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        size="lg"
                        variant="outline"
                        className={cn(
                          'cursor-pointer border-2 transition-colors duration-200 min-w-[200px]',
                          !closedBatchMode &&
                            'bg-background border-input hover:bg-green-500/10 hover:border-green-500/50 hover:text-green-700 dark:hover:bg-green-500/15 dark:hover:border-green-500/50 dark:hover:text-green-400',
                          closedBatchMode &&
                            'bg-red-500/10 border-red-500/50 text-red-700 dark:bg-red-500/15 dark:border-red-500/50 dark:text-red-400 hover:bg-red-500/20 hover:border-red-500/60 dark:hover:bg-red-500/25'
                        )}
                        onClick={() => {
                          setClosedBatchMode((b) => !b);
                          if (closedBatchMode) setSelectedClosedIds([]);
                        }}
                      >
                        <CheckSquare className="w-5 h-5 mr-2 shrink-0" />
                        {closedBatchMode ? 'Batalkan' : 'Pilih evaluasi'}
                      </Button>
                    </div>
                    <div
                      className={cn(
                        'overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                        closedBatchMode ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                      )}
                    >
                      <div className="space-y-3 pt-1">
                        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-border bg-muted/40">
                          <span className="text-sm text-muted-foreground">
                            {selectedClosedIds.length} evaluasi dipilih
                          </span>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              disabled={isBatchDeletingClosed}
                              onClick={handleBatchDeleteClosed}
                            >
                              <Trash2 className="w-4 h-4" />
                              Pindah ke Recycle Bin
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5"
                              disabled={isExportingClosed}
                              onClick={handleExportClosed}
                            >
                              {isExportingClosed ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                              Eksport data
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 py-1">
                          <Checkbox
                            id="select-all-closed"
                            checked={
                              closedEvaluations.length > 0 && selectedClosedIds.length === closedEvaluations.length
                            }
                            onCheckedChange={(checked) => handleSelectAllClosed(checked === true)}
                          />
                          <label
                            htmlFor="select-all-closed"
                            className="text-sm text-muted-foreground cursor-pointer"
                          >
                            Pilih semua
                          </label>
                        </div>
                      </div>
                    </div>
                    {closedEvaluations.map((evaluation) => {
                      const isSelected = selectedClosedEvaluation?.id === evaluation.id;
                      const isChecked = selectedClosedIds.includes(evaluation.id);
                      return (
                        <div
                          key={evaluation.id}
                          className={cn(
                            'flex items-center gap-3 w-full rounded-lg border p-4 transition-colors',
                            isSelected && 'border-primary bg-primary/5'
                          )}
                        >
                          {closedBatchMode && (
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(checked) =>
                                handleToggleClosedCheckbox(evaluation.id, checked === true)
                              }
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`Pilih ${evaluation.title}`}
                            />
                          )}
                          <div
                            role="button"
                            tabIndex={0}
                            className={cn(
                              'flex-1 min-w-0 text-left rounded-md -m-2 p-2 hover:bg-muted/50 transition-colors',
                              closedBatchMode && 'flex-[1_1_0]'
                            )}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setSelectedEvaluationId(evaluation.id);
                              setSelectedChartScope(evaluation.id);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setSelectedEvaluationId(evaluation.id);
                                setSelectedChartScope(evaluation.id);
                              }
                            }}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground">{evaluation.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  Mulai: {new Date(evaluation.start_at).toLocaleString('id-ID')}
                                  {evaluation.end_at
                                    ? ` · Selesai: ${new Date(evaluation.end_at).toLocaleString('id-ID')}`
                                    : ''}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <Badge variant="secondary">Selesai</Badge>
                                <Eye className="w-4 h-4 text-muted-foreground" aria-hidden />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-8 gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setDeleteTarget({ id: evaluation.id, title: evaluation.title });
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Pindah ke Recycle Bin
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {selectedClosedEvaluation && (
                  <div ref={closedRecapRef} className="space-y-6 scroll-mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Visualisasi Data Evaluasi</CardTitle>
                        <CardDescription>
                          Grafik untuk: {selectedClosedEvaluation.title}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <Card>
                            <CardContent className="p-4">
                              <p className="text-xs text-muted-foreground">Total Target</p>
                              <p className="text-2xl font-bold">{chartData?.progress.total_targets ?? 0}</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <p className="text-xs text-muted-foreground">Sudah dikirimi</p>
                              <p className="text-2xl font-bold">{chartData?.progress.total_sent ?? 0}</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <p className="text-xs text-muted-foreground">Sudah mengisi</p>
                              <p className="text-2xl font-bold">{chartData?.progress.total_submitted ?? 0}</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <p className="text-xs text-muted-foreground">Response Rate</p>
                              <p className="text-2xl font-bold flex items-center gap-1">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                                {chartData?.progress.response_rate ?? 0}%
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                        <div className="grid grid-cols-1 gap-5 items-stretch">
                          <Card className="h-full">
                            <CardHeader>
                              <CardTitle className="text-base">Distribusi Penilaian Kompetensi</CardTitle>
                            </CardHeader>
                            <CardContent className="overflow-hidden">
                              {hasAspectDistributionData ? (
                                <div className="w-full overflow-hidden">
                                  <DistribusiPenilaianChart
                                    data={aspectDistributionChartData}
                                    height={aspectDistributionChartHeight}
                                  />
                                </div>
                              ) : (
                                <div className="h-[320px] flex items-center justify-center text-sm text-muted-foreground">
                                  Belum ada data evaluasi.
                                </div>
                              )}
                            </CardContent>
                          </Card>
                          <Card className="h-full">
                            <CardHeader>
                              <CardTitle className="text-base">Kesesuaian Jurusan dengan Pekerjaan</CardTitle>
                            </CardHeader>
                            <CardContent className="overflow-hidden">
                              {chartData?.job_match?.length ? (
                                <KesesuaianJurusanChart
                                  data={chartData.job_match}
                                  height={360}
                                  innerRadius={56}
                                />
                              ) : (
                                <div className="h-[320px] flex items-center justify-center text-sm text-muted-foreground">
                                  Belum ada data evaluasi.
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Hasil Survey per Mahasiswa</CardTitle>
                        <CardDescription>Data read-only untuk evaluasi: {selectedClosedEvaluation.title}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Nama</TableHead>
                                <TableHead>NIM</TableHead>
                                <TableHead>Perusahaan</TableHead>
                                <TableHead>Kesesuaian Jurusan</TableHead>
                                <TableHead>Waktu Submit</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {results.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    Belum ada data survey untuk evaluasi ini.
                                  </TableCell>
                                </TableRow>
                              ) : (
                                results.map((row) => (
                                  <TableRow key={row.response_id}>
                                    <TableCell className="font-medium">{row.nama}</TableCell>
                                    <TableCell>{row.nim}</TableCell>
                                    <TableCell>{row.company_name}</TableCell>
                                    <TableCell>{row.major_job_match === 'ya' ? 'Ya' : row.major_job_match === 'tidak' ? 'Tidak' : (row.major_job_match ?? '-')}</TableCell>
                                    <TableCell>
                                      {new Date(row.submitted_at).toLocaleString('id-ID')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                        onClick={() => handleViewResult(row.response_id)}
                                      >
                                        <Eye className="w-4 h-4" />
                                        Lihat Hasil Evaluasi
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <CardTitle className="text-lg">Lampiran Form Kepuasan</CardTitle>
                            <CardDescription>
                              Lampiran form bertanda tangan yang diunggah mahasiswa (PDF/PNG).
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant={attachmentViewMode === 'table' ? 'secondary' : 'ghost'}
                              size="sm"
                              onClick={() => setAttachmentViewMode('table')}
                              className="gap-1.5"
                              aria-label="Tampilan tabel"
                            >
                              <List className="h-4 w-4" />
                              Tabel
                            </Button>
                            <Button
                              variant={attachmentViewMode === 'gallery' ? 'secondary' : 'ghost'}
                              size="sm"
                              onClick={() => setAttachmentViewMode('gallery')}
                              className="gap-1.5"
                              aria-label="Tampilan galeri"
                            >
                              <LayoutGrid className="h-4 w-4" />
                              Galeri
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {loadingAttachments ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                          </div>
                        ) : attachmentViewMode === 'table' ? (
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Nama</TableHead>
                                  <TableHead>NIM</TableHead>
                                  <TableHead>Evaluasi</TableHead>
                                  <TableHead>Waktu Submit</TableHead>
                                  <TableHead>File</TableHead>
                                  <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {satisfactionAttachments.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                      Belum ada lampiran.
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  satisfactionAttachments.map((item, idx) => (
                                    <TableRow key={`closed-${item.response_id}-${item.attachment_path}-${idx}`}>
                                      <TableCell className="font-medium">{item.nama}</TableCell>
                                      <TableCell>{item.nim}</TableCell>
                                      <TableCell className="max-w-[180px] truncate">{item.evaluation_title}</TableCell>
                                      <TableCell>{new Date(item.submitted_at).toLocaleString('id-ID')}</TableCell>
                                      <TableCell className="flex items-center gap-1.5">
                                        {item.file_name?.toLowerCase().endsWith('.pdf') ? (
                                          <FileText className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                        )}
                                        <span className="truncate max-w-[120px]">{item.file_name}</span>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="gap-1.5"
                                          onClick={() => openAttachmentPreview(item)}
                                        >
                                          <Eye className="h-4 w-4" />
                                          Lihat
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                            {satisfactionAttachments.length === 0 ? (
                              <div className="col-span-full py-12 text-center text-muted-foreground">
                                Belum ada lampiran.
                              </div>
                            ) : (
                              satisfactionAttachments.map((item, idx) => {
                                const thumbUrl = galleryThumbnails[item.attachment_path];
                                const isPdf = item.file_name?.toLowerCase().endsWith('.pdf');
                                return (
                                  <div
                                    key={`closed-g-${item.response_id}-${item.attachment_path}-${idx}`}
                                    className="rounded-lg border bg-card p-3 space-y-2"
                                  >
                                    <div className="flex justify-center rounded-md bg-muted/50 h-24 items-center overflow-hidden">
                                      {isPdf ? (
                                        <FileText className="h-10 w-10 text-muted-foreground shrink-0" />
                                      ) : thumbUrl ? (
                                        <img
                                          src={thumbUrl}
                                          alt={`Lampiran ${item.nama}`}
                                          className="h-full w-full object-contain rounded-md"
                                        />
                                      ) : (
                                        <ImageIcon className="h-10 w-10 text-muted-foreground shrink-0" />
                                      )}
                                    </div>
                                    <p className="font-medium text-sm truncate" title={item.nama}>{item.nama}</p>
                                    <p className="text-xs text-muted-foreground truncate">{item.evaluation_title}</p>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full gap-1.5"
                                      onClick={() => openAttachmentPreview(item)}
                                    >
                                      <Eye className="h-4 w-4" />
                                      Lihat
                                    </Button>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={!!attachmentPreviewItem} onOpenChange={(open) => !open && closeAttachmentPreview()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Lampiran Form Kepuasan</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Pengunggah: <span className="font-medium text-foreground">{attachmentPreviewItem?.nama ?? '-'}</span>
              {attachmentPreviewItem?.nim ? ` (NIM: ${attachmentPreviewItem.nim})` : ''}
            </p>
          </DialogHeader>
          <div className="min-h-0 flex-1 rounded-md border bg-muted/30 flex items-center justify-center overflow-auto">
            {attachmentPreviewLoading ? (
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            ) : attachmentPreviewUrl && attachmentPreviewItem ? (
              attachmentPreviewItem.file_name?.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={attachmentPreviewUrl}
                  title={`Lampiran ${attachmentPreviewItem.nama}`}
                  className="w-full h-[70vh] min-h-[400px] rounded-md"
                />
              ) : (
                <img
                  src={attachmentPreviewUrl}
                  alt={`Lampiran ${attachmentPreviewItem.nama}`}
                  className="max-w-full max-h-[70vh] object-contain rounded-md"
                />
              )
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedResultDetail?.response_type === 'custom'
                ? 'Detail Hasil Form Kustom (Read-only)'
                : 'Detail Hasil Evaluasi (Read-only)'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground">Nama Mahasiswa</p>
                <p className="font-medium">{String(header.nama || '-')}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground">NIM</p>
                <p className="font-medium">{String(header.nim || '-')}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground">Perusahaan</p>
                <p className="font-medium">{String(header.company_name || '-')}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground">Nama Karyawan Dinilai</p>
                <p className="font-medium">{String(header.employee_name || '-')}</p>
              </div>
              <div className="rounded-md border p-3 md:col-span-2">
                <p className="text-muted-foreground">Kesesuaian Jurusan</p>
                <p className="font-medium">
                  {String(header.major_job_match || '') === 'ya'
                    ? 'Ya'
                    : String(header.major_job_match || '') === 'tidak'
                      ? 'Tidak'
                      : (header.major_job_match as string) ?? '-'}
                </p>
              </div>
            </div>

            {selectedResultDetail?.response_type === 'custom' ? (
              (() => {
                const customRows = buildCustomAnswerRows(selectedResultDetail);
                return customRows.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Pertanyaan / Bagian</TableHead>
                          <TableHead>Jawaban</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customRows.map((row, index) => (
                          <TableRow key={`${row.label}-${index}`}>
                            <TableCell className="font-medium align-top">{row.label}</TableCell>
                            <TableCell className="whitespace-pre-wrap">{row.value}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-4">Tidak ada jawaban tercatat.</p>
                );
              })()
            ) : (
              selectedResultDetail?.ratings &&
              selectedResultDetail.ratings.length > 0 && (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No</TableHead>
                        <TableHead>Aspek Penilaian</TableHead>
                        <TableHead>Nilai</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedResultDetail.ratings.map((rating, index) => (
                        <TableRow key={rating.aspect_id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{rating.aspect_name}</TableCell>
                          <TableCell>{ratingScaleLabels[rating.score] || rating.score}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Pindahkan evaluasi ke Recycle Bin?</AlertDialogTitle>
            <AlertDialogDescription>
              Evaluasi &quot;{deleteTarget?.title}&quot; akan disembunyikan dari daftar utama dan dipindahkan ke Recycle Bin. Item recycle akan auto-purge setelah 30 hari atau bisa dihapus permanen dari halaman Logbook.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingEvaluation}>Batal</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isDeletingEvaluation}
              onClick={() => deleteTarget && handleDeleteEvaluation(deleteTarget.id)}
            >
              {isDeletingEvaluation ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Memindahkan...
                </>
              ) : (
                'Pindahkan'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!batchDeleteTargets} onOpenChange={(open) => !open && !isBatchDeletingClosed && setBatchDeleteTargets(null)}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Pindahkan evaluasi terpilih ke Recycle Bin?</AlertDialogTitle>
            <AlertDialogDescription>
              {batchDeleteTargets?.length} evaluasi akan dipindahkan ke Recycle Bin. Item recycle akan auto-purge setelah 30 hari atau bisa dihapus permanen dari halaman Logbook.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBatchDeletingClosed}>Batal</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isBatchDeletingClosed}
              onClick={handleConfirmBatchDeleteClosed}
            >
              {isBatchDeletingClosed ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Memindahkan...
                </>
              ) : (
                'Pindahkan semuanya'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
