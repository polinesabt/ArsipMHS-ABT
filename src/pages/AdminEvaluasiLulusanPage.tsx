import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  closeEvaluation,
  createEvaluation,
  getEvaluationCharts,
  getEvaluationResultDetail,
  getEvaluationResults,
  getEvaluations,
  getEvaluationStudents,
  sendEvaluationNotifications,
} from '@/repositories/evaluation.repository';
import type {
  Evaluation,
  EvaluationChartData,
  EvaluationResultDetail,
  EvaluationResultRow,
  EvaluationStudentTarget,
  InvitationStatus,
} from '@/types/evaluation.types';
import { useToast } from '@/hooks/use-toast';
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
  Dialog,
  DialogContent,
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
  Eye,
  Loader2,
  Plus,
  RefreshCcw,
  Send,
  TrendingUp,
  XCircle,
} from 'lucide-react';

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

export default function AdminEvaluasiLulusanPage() {
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'closed'>('active');

  const [createForm, setCreateForm] = useState<CreateFormState>(defaultCreateForm);

  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<string>('');
  const [selectedChartScope, setSelectedChartScope] = useState<string>('all');

  const [studentRows, setStudentRows] = useState<EvaluationStudentTarget[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const [results, setResults] = useState<EvaluationResultRow[]>([]);
  const [selectedResultDetail, setSelectedResultDetail] = useState<EvaluationResultDetail | null>(null);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);

  const [chartData, setChartData] = useState<EvaluationChartData | null>(null);

  const [filterTahunMasuk, setFilterTahunMasuk] = useState<string>('all');
  const [filterTahunLulus, setFilterTahunLulus] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

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
  }, [selectedEvaluationId, loadStudents, loadResults, toast]);

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

      toast({
        title: 'Kirim notifikasi selesai',
        description: `Berhasil: ${sent}, Dilewati: ${skipped}`,
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
        </div>
        <Button variant="outline" onClick={handleManualRefresh} className="gap-2 self-start">
          <RefreshCcw className="w-4 h-4" />
          Refresh Data
        </Button>
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
              <Input
                type="datetime-local"
                value={createForm.start_at}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, start_at: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Akhir Evaluasi (Opsional)</Label>
              <Input
                type="datetime-local"
                value={createForm.end_at}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, end_at: event.target.value }))
                }
              />
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
                          Filter alumni bekerja, pilih multi-select, lalu kirim notifikasi evaluasi.
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

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">Distribusi Penilaian Kompetensi</CardTitle>
                            </CardHeader>
                            <CardContent>
                              {chartData?.aspect_distribution?.length ? (
                                <ResponsiveContainer width="100%" height={360}>
                                  <BarChart data={chartData.aspect_distribution}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="aspect_name" tick={{ fontSize: 11 }} interval={0} angle={-20} height={80} />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="sangat_baik" stackId="a" fill="#16a34a" name="Sangat Baik" />
                                    <Bar dataKey="baik" stackId="a" fill="#22c55e" name="Baik" />
                                    <Bar dataKey="cukup_baik" stackId="a" fill="#eab308" name="Cukup Baik" />
                                    <Bar dataKey="kurang_baik" stackId="a" fill="#f97316" name="Kurang Baik" />
                                    <Bar dataKey="tidak_baik" stackId="a" fill="#ef4444" name="Tidak Baik" />
                                  </BarChart>
                                </ResponsiveContainer>
                              ) : (
                                <div className="h-[320px] flex items-center justify-center text-sm text-muted-foreground">
                                  Belum ada data evaluasi. Kirim evaluasi ke lulusan untuk mulai mengumpulkan feedback.
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">Kesesuaian Jurusan dengan Pekerjaan</CardTitle>
                            </CardHeader>
                            <CardContent>
                              {chartData?.job_match?.length ? (
                                <ResponsiveContainer width="100%" height={360}>
                                  <PieChart>
                                    <Pie
                                      data={chartData.job_match}
                                      dataKey="value"
                                      nameKey="label"
                                      innerRadius={70}
                                      outerRadius={120}
                                    >
                                      {chartData.job_match.map((entry) => (
                                        <Cell
                                          key={entry.key}
                                          fill={entry.key === 'ya' ? '#16a34a' : '#ef4444'}
                                        />
                                      ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                  </PieChart>
                                </ResponsiveContainer>
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
                                    <TableCell>{row.major_job_match === 'ya' ? 'Ya' : 'Tidak'}</TableCell>
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
                      Klik salah satu evaluasi di bawah untuk melihat grafik dan hasil survey pada fase tersebut.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {closedEvaluations.map((evaluation) => {
                      const isSelected = selectedClosedEvaluation?.id === evaluation.id;
                      return (
                        <button
                          key={evaluation.id}
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => {
                            setSelectedEvaluationId(evaluation.id);
                            setSelectedChartScope(evaluation.id);
                          }}
                          className={cn(
                            'w-full rounded-lg border p-4 text-left transition-colors hover:bg-muted/50',
                            isSelected && 'border-primary bg-primary/5'
                          )}
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
                            </div>
                          </div>
                        </button>
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
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">Distribusi Penilaian Kompetensi</CardTitle>
                            </CardHeader>
                            <CardContent>
                              {chartData?.aspect_distribution?.length ? (
                                <ResponsiveContainer width="100%" height={360}>
                                  <BarChart data={chartData.aspect_distribution}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="aspect_name" tick={{ fontSize: 11 }} interval={0} angle={-20} height={80} />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="sangat_baik" stackId="a" fill="#16a34a" name="Sangat Baik" />
                                    <Bar dataKey="baik" stackId="a" fill="#22c55e" name="Baik" />
                                    <Bar dataKey="cukup_baik" stackId="a" fill="#eab308" name="Cukup Baik" />
                                    <Bar dataKey="kurang_baik" stackId="a" fill="#f97316" name="Kurang Baik" />
                                    <Bar dataKey="tidak_baik" stackId="a" fill="#ef4444" name="Tidak Baik" />
                                  </BarChart>
                                </ResponsiveContainer>
                              ) : (
                                <div className="h-[320px] flex items-center justify-center text-sm text-muted-foreground">
                                  Belum ada data evaluasi.
                                </div>
                              )}
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">Kesesuaian Jurusan dengan Pekerjaan</CardTitle>
                            </CardHeader>
                            <CardContent>
                              {chartData?.job_match?.length ? (
                                <ResponsiveContainer width="100%" height={360}>
                                  <PieChart>
                                    <Pie
                                      data={chartData.job_match}
                                      dataKey="value"
                                      nameKey="label"
                                      innerRadius={70}
                                      outerRadius={120}
                                    >
                                      {chartData.job_match.map((entry) => (
                                        <Cell
                                          key={entry.key}
                                          fill={entry.key === 'ya' ? '#16a34a' : '#ef4444'}
                                        />
                                      ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                  </PieChart>
                                </ResponsiveContainer>
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
                                    <TableCell>{row.major_job_match === 'ya' ? 'Ya' : 'Tidak'}</TableCell>
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
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Hasil Evaluasi (Read-only)</DialogTitle>
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
                  {String(header.major_job_match || '') === 'ya' ? 'Ya' : 'Tidak'}
                </p>
              </div>
            </div>

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
                  {selectedResultDetail?.ratings.map((rating, index) => (
                    <TableRow key={rating.aspect_id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{rating.aspect_name}</TableCell>
                      <TableCell>{ratingScaleLabels[rating.score] || rating.score}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
