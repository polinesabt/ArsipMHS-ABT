import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAlumni } from '@/contexts/AlumniContext';
import { StatCard, StatusBadge, DataTable } from '@/components/shared';
import { StudentAccountModal, DeleteStudentDialog, AdminStudentEditModal } from '@/components/admin';
import type { StudentAccountInput, StudentProfile } from '@/types/student.types';
import type { AlumniData } from '@/types';
import {
  getStudentsListFromAPI,
  deleteStudentsBatch,
  resetPasswordBatch,
} from '@/repositories/api-student.repository';
import {
  Search, Download, Users2, Briefcase, Rocket, BookOpen, TrendingUp,
  User, Mail, Phone, Building2, MapPin, Calendar, ExternalLink, X,
  UserPlus, Trash2, KeyRound, ChevronLeft, ChevronRight, Filter, CheckSquare,
  Pencil
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { exportStudentsToExcel, exportStudentImportTemplate } from '@/lib/excel-export';
import { parseStudentAccountsFromExcel } from '@/lib/excel-import';

/** Table row shape for Pengelola Mahasiswa (camelCase from API) */
interface StudentTableRow {
  id: string;
  nama: string;
  nim: string;
  email?: string;
  noHp?: string;
  /** Effective status for display/filtering (from `status_effective`). */
  status: string;
  /** Stored/manual status value (from `status`). */
  statusManual?: string;
  /** Mode of status calculation (from `status_mode`). */
  statusMode?: string;
  tahunMasuk: number;
  tahunLulus: number;
  jurusan: string;
  prodi: string;
  filledData?: AlumniData | null;
}

function mapApiStudentToRow(s: {
  id: string;
  nama: string;
  nim: string;
  jurusan?: string;
  prodi?: string;
  status: string;
  status_mode?: string | null;
  status_effective?: string | null;
  tahun_masuk: number;
  tahun_lulus?: number | null;
  email?: string | null;
  no_hp?: string | null;
  [k: string]: unknown;
}, filled?: AlumniData | null): StudentTableRow {
  const tahunMasuk = Number(s.tahun_masuk);
  const tahunLulus = s.tahun_lulus != null ? Number(s.tahun_lulus) : tahunMasuk + 4;
  const statusManual = s.status;
  const statusMode = s.status_mode ?? undefined;
  const statusEffective = s.status_effective ?? s.status;
  return {
    id: s.id,
    nama: s.nama,
    nim: s.nim,
    email: s.email ?? undefined,
    noHp: s.no_hp ?? undefined,
    status: statusEffective,
    statusManual,
    statusMode,
    tahunMasuk,
    tahunLulus,
    jurusan: s.jurusan ?? 'Administrasi Bisnis',
    prodi: s.prodi ?? 'Administrasi Bisnis Terapan',
    filledData: filled ?? null,
  };
}

function rowToStudentProfile(row: StudentTableRow): StudentProfile {
  return {
    id: row.id,
    nama: row.nama,
    nim: row.nim,
    email: row.email,
    noHp: row.noHp,
    status: row.status as StudentProfile['status'],
    statusMode: row.statusMode as StudentProfile['statusMode'],
    statusManual: (row.statusManual ?? row.status) as StudentProfile['statusManual'],
    tahunMasuk: row.tahunMasuk,
    tahunLulus: row.tahunLulus,
    jurusan: 'Administrasi Bisnis',
    prodi: 'Administrasi Bisnis Terapan',
  };
}

export default function AdminDashboard() {
  const { masterData, alumniData, studentAccounts, addStudentAccount, deleteStudentAccount, updateStudentAccount, resetStudentPassword, refreshData } = useAlumni();
  const [selectedAlumniId, setSelectedAlumniId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [studentList, setStudentList] = useState<StudentTableRow[]>([]);
  const [isListLoading, setIsListLoading] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showChecklist, setShowChecklist] = useState(false);

  const [filterTahunMasukFrom, setFilterTahunMasukFrom] = useState<string>('');
  const [filterTahunMasukTo, setFilterTahunMasukTo] = useState<string>('');
  const [filterTahunLulusFrom, setFilterTahunLulusFrom] = useState<string>('');
  const [filterTahunLulusTo, setFilterTahunLulusTo] = useState<string>('');
  const [filterKelas, setFilterKelas] = useState<string>('');
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const [searchInput, setSearchInput] = useState<string>('');
  const [appliedSearch, setAppliedSearch] = useState<string>('');
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const MIN_SEARCH_CHARS = 3;

  const filterYearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years: { value: string; label: string }[] = [];
    for (let y = currentYear + 2; y >= 1995; y--) years.push({ value: String(y), label: String(y) });
    return years;
  }, []);
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false);
  const [isBatchDeleting, setIsBatchDeleting] = useState(false);
  const [showBatchResetModal, setShowBatchResetModal] = useState(false);
  const [batchResetPassword, setBatchResetPassword] = useState('');
  const [batchResetPasswordConfirm, setBatchResetPasswordConfirm] = useState('');
  const [isBatchResetting, setIsBatchResetting] = useState(false);

  // Modal states for student account management
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; nama: string; nim: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Import Excel state
  const [isImporting, setIsImporting] = useState(false);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [pendingImportAccounts, setPendingImportAccounts] = useState<StudentAccountInput[]>([]);
  const [importSummary, setImportSummary] = useState<{ success: number; failed: number; warnings: string[] } | null>(null);
  const [previewWarnings, setPreviewWarnings] = useState<string[]>([]);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Edit modal state
  const [editStudent, setEditStudent] = useState<StudentProfile | null>(null);

  const fetchStudentsList = useCallback(async () => {
    setIsListLoading(true);
    try {
      const params: Record<string, string | number> = {
        limit: pageSize,
        offset: (page - 1) * pageSize,
      };
      const fromMasuk = filterTahunMasukFrom ? parseInt(filterTahunMasukFrom, 10) : undefined;
      const toMasuk = filterTahunMasukTo ? parseInt(filterTahunMasukTo, 10) : undefined;
      const fromLulus = filterTahunLulusFrom ? parseInt(filterTahunLulusFrom, 10) : undefined;
      const toLulus = filterTahunLulusTo ? parseInt(filterTahunLulusTo, 10) : undefined;
      if (fromMasuk != null && !Number.isNaN(fromMasuk) && fromMasuk > 0) params.tahun_masuk_from = fromMasuk;
      if (toMasuk != null && !Number.isNaN(toMasuk) && toMasuk > 0) params.tahun_masuk_to = toMasuk;
      if (fromLulus != null && !Number.isNaN(fromLulus) && fromLulus > 0) params.tahun_lulus_from = fromLulus;
      if (toLulus != null && !Number.isNaN(toLulus) && toLulus > 0) params.tahun_lulus_to = toLulus;
      if (filterKelas && ['A', 'B', 'C', 'D'].includes(filterKelas)) params.kelas = filterKelas;
      if (appliedSearch.trim() !== '') params.search = appliedSearch.trim();

      const res = await getStudentsListFromAPI(params);
      if (res.success && res.data != null) {
        const rows = res.data.map((s) => {
          const filled = alumniData.find((d) => d.alumniMasterId === s.id);
          return mapApiStudentToRow(s, filled);
        });
        setStudentList(rows);
        setTotalCount(res.total ?? res.data.length);
      } else {
        setStudentList([]);
        setTotalCount(0);
      }
    } finally {
      setIsListLoading(false);
    }
  }, [page, pageSize, alumniData, filterTahunMasukFrom, filterTahunMasukTo, filterTahunLulusFrom, filterTahunLulusTo, filterKelas, appliedSearch]);

  useEffect(() => {
    fetchStudentsList();
  }, [fetchStudentsList]);

  // Live table filtering: debounce 300ms, minimal 3 karakter; input kosong = data default
  useEffect(() => {
    const term = searchInput.trim();
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (term === '' || term.length < MIN_SEARCH_CHARS) {
      setAppliedSearch('');
      setPage(1);
      return;
    }
    searchDebounceRef.current = setTimeout(() => {
      setAppliedSearch(term);
      setPage(1);
    }, 300);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchInput]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const rangeStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalCount);

  // Statistics
  const stats = useMemo(() => {
    const filled = alumniData.length;
    const bekerja = alumniData.filter(d => d.status === 'bekerja').length;
    const wirausaha = alumniData.filter(d => d.status === 'wirausaha').length;
    const studi = alumniData.filter(d => d.status === 'studi').length;
    const mencari = alumniData.filter(d => d.status === 'mencari').length;
    return { filled, bekerja, wirausaha, studi, mencari };
  }, [alumniData]);

  const handleAdminDataChanged = useCallback(async () => {
    await refreshData();
    await fetchStudentsList();
  }, [refreshData, fetchStudentsList]);

  const selectedAlumniDetail = useMemo(() => {
    if (!selectedAlumniId) return null;
    const master = masterData.find(m => m.id === selectedAlumniId);
    const filled = alumniData.find(d => d.alumniMasterId === selectedAlumniId);
    return master ? { ...master, filledData: filled } : null;
  }, [selectedAlumniId, masterData, alumniData]);

  const handleExport = useCallback(async () => {
    const params: Record<string, string | number> = { limit: 10000, offset: 0 };
    const res = await getStudentsListFromAPI(params);
    const list = res.success && res.data ? res.data : [];
    const rows = list.map((s) => ({
      nama: s.nama,
      nim: s.nim,
      email: s.email || '-',
      nomor: s.no_hp || '-',
      tahunMasuk: Number(s.tahun_masuk),
      tahunLulus: s.tahun_lulus != null ? Number(s.tahun_lulus) : Number(s.tahun_masuk) + 4,
      password: s.nim,
    }));

    await exportStudentsToExcel(rows, {
      filename: 'data-mahasiswa.xlsx',
      title: 'DATA MAHASISWA',
    });
  }, []);

  /** Ekspor hanya baris yang dipilih ke Excel (dari batch toolbar). */
  const handleExportSelected = useCallback(async () => {
    if (selectedIds.length === 0) return;
    const selectedRows = studentList.filter((row) => selectedIds.includes(row.id));
    const rows = selectedRows.map((row) => ({
      nama: row.nama,
      nim: row.nim,
      email: row.email || '',
      nomor: row.noHp || '',
      tahunMasuk: row.tahunMasuk,
      tahunLulus: row.tahunLulus,
    }));
    await exportStudentsToExcel(rows, {
      filename: `data-mahasiswa-terpilih-${selectedIds.length}.xlsx`,
      title: 'DATA MAHASISWA TERPILIH',
    });
  }, [selectedIds, studentList]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'bekerja': return 'Bekerja';
      case 'mencari': return 'Mencari Kerja';
      case 'wirausaha': return 'Wirausaha';
      case 'studi': return 'Melanjutkan Studi';
      default: return '-';
    }
  };

  // Handle add student account
  const handleAddStudent = async (data: StudentAccountInput) => {
    const result = await addStudentAccount(data);
    if (result.success) {
      await handleAdminDataChanged();
    }
    return result;
  };

  // Handle delete student account
  const handleDeleteStudent = async () => {
    if (!deleteTarget) return;
    
    setIsDeleting(true);
    try {
      await deleteStudentAccount(deleteTarget.id);
      await handleAdminDataChanged();
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Get existing NIMs for validation
  const existingNims = useMemo(() => {
    return studentAccounts.map(s => s.nim);
  }, [studentAccounts]);

  // Step 1: baca file & siapkan preview (tanpa menyimpan ke DB) — dipakai oleh input file dan drag-and-drop
  const processImportFile = useCallback(async (file: File) => {
    if (!file?.name.toLowerCase().endsWith('.xlsx')) {
      setPreviewError('Hanya file .xlsx yang didukung.');
      return;
    }
    setIsReadingFile(true);
    setPreviewError(null);
    setPendingImportAccounts([]);
    setPreviewWarnings([]);
    setImportSummary(null);
    setSelectedFileName(file.name);

    try {
      const { accounts, warnings } = await parseStudentAccountsFromExcel(file);
      setPendingImportAccounts(accounts);
      setPreviewWarnings(warnings);
    } catch (error) {
      setPreviewError(
        error instanceof Error
          ? `Gagal membaca file: ${error.message}`
          : 'Gagal membaca file Excel'
      );
    } finally {
      setIsReadingFile(false);
    }
  }, []);

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    await processImportFile(file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (isReadingFile || isImporting) return;
      const file = e.dataTransfer.files?.[0];
      if (file) processImportFile(file);
    },
    [isReadingFile, isImporting, processImportFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDownloadImportTemplate = async () => {
    await exportStudentImportTemplate();
  };

  // Step 2: konfirmasi & simpan via API (state + backend, URL dari .env)
  const handleConfirmImport = async () => {
    if (pendingImportAccounts.length === 0) return;

    setIsImporting(true);
    setImportSummary(null);

    try {
      let success = 0;
      let failed = 0;
      const errorMessages: string[] = [];

      for (const account of pendingImportAccounts) {
        // Skip jika NIM sudah ada di state saat ini
        if (existingNims.includes(account.nim)) {
          failed++;
          errorMessages.push(`NIM ${account.nim} sudah terdaftar, baris di-skip.`);
          continue;
        }

        const result = await addStudentAccount(account);
        if (result.success) {
          success++;
        } else {
          failed++;
          errorMessages.push(`NIM ${account.nim}: ${result.error || 'Gagal membuat akun'}`);
        }
      }

      if (success > 0) {
        await handleAdminDataChanged();
      }

      setImportSummary({
        success,
        failed,
        warnings: [...previewWarnings, ...errorMessages],
      });
      // Setelah selesai, kosongkan data pending agar tidak ter-import dua kali
      setPendingImportAccounts([]);
    } finally {
      setIsImporting(false);
    }
  };

  const tableColumns = [
    { key: 'nama', header: 'Nama', sortable: true },
    { key: 'nim', header: 'NIM', sortable: true },
    {
      key: 'email',
      header: 'Email',
      hideOnMobile: true,
      accessor: (row: StudentTableRow) => row.email || '-',
      className: 'text-sm',
    },
    {
      key: 'noHp',
      header: 'Nomor',
      hideOnMobile: true,
      accessor: (row: StudentTableRow) => row.noHp || '-',
      className: 'text-sm',
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (row: StudentTableRow) => {
        const statusLabels: Record<string, string> = {
          active: 'Aktif',
          alumni: 'Alumni',
          on_leave: 'Cuti',
          dropout: 'Dropout',
        };
        return (
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              row.status === 'alumni' ? 'bg-primary/10 text-primary' :
              row.status === 'active' ? 'bg-success/10 text-success' :
              row.status === 'on_leave' ? 'bg-warning/10 text-warning' :
              'bg-muted text-muted-foreground'
            }`}
          >
            {statusLabels[row.status] || row.status}
          </span>
        );
      },
    },
    { key: 'tahunMasuk', header: 'Tahun Masuk', sortable: true, hideOnMobile: true },
    { key: 'tahunLulus', header: 'Tahun Lulus', sortable: true, hideOnMobile: true },
    {
      key: 'aksi',
      header: 'Aksi',
      className: 'w-[80px] text-center',
      accessor: (row: StudentTableRow) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1"
          onClick={(e) => {
            e.stopPropagation();
            setEditStudent(rowToStudentProfile(row));
          }}
          aria-label={`Edit ${row.nama}`}
        >
          <Pencil className="w-4 h-4" />
          Edit
        </Button>
      ),
    },
  ];

  const handleBatchDelete = useCallback(async () => {
    if (selectedIds.length === 0) return;
    setIsBatchDeleting(true);
    try {
      const res = await deleteStudentsBatch(selectedIds);
      if (res.success) {
        setShowBatchDeleteModal(false);
        setSelectedIds([]);
        await refreshData();
        await fetchStudentsList();
      }
    } finally {
      setIsBatchDeleting(false);
    }
  }, [selectedIds, refreshData, fetchStudentsList]);

  const handleBatchResetPassword = useCallback(
    async (password: string) => {
      if (selectedIds.length === 0 || !password) return;
      setIsBatchResetting(true);
      try {
        const res = await resetPasswordBatch(selectedIds, password);
        if (res.success) {
          setShowBatchResetModal(false);
          setBatchResetPassword('');
          setBatchResetPasswordConfirm('');
          setSelectedIds([]);
          await refreshData();
          await fetchStudentsList();
        }
      } finally {
        setIsBatchResetting(false);
      }
    },
    [selectedIds, refreshData, fetchStudentsList]
  );

  const submitBatchReset = useCallback(() => {
    if (batchResetPassword.length < 6) return;
    if (batchResetPassword !== batchResetPasswordConfirm) return;
    void handleBatchResetPassword(batchResetPassword);
  }, [batchResetPassword, batchResetPasswordConfirm, handleBatchResetPassword]);

  // Derive simple step state for import modal UI
  const hasPreview = pendingImportAccounts.length > 0;
  const hasResult = !!importSummary;
  const currentStep = hasResult ? 3 : hasPreview ? 2 : 1;

  return (
    <>
      <main className="pb-12 sm:pb-16">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Import Akun Modal */}
          <Dialog
            open={isImportModalOpen}
            onOpenChange={(open) => {
              setIsImportModalOpen(open);
              if (!open) {
                setPendingImportAccounts([]);
                setPreviewWarnings([]);
                setPreviewError(null);
                setSelectedFileName(null);
                setIsReadingFile(false);
                setIsImporting(false);
              }
            }}
          >
            <DialogContent className="max-w-3xl rounded-3xl border border-border/60 bg-background/95 shadow-2xl transition-all duration-200">
              <DialogHeader>
                <DialogTitle className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
                  Import Akun Mahasiswa
                </DialogTitle>
                <p className="mt-1 text-sm text-muted-foreground max-w-xl">
                  Upload file Excel, cek preview data, lalu konfirmasi untuk menyimpan akun mahasiswa ke sistem.
                </p>

                {/* Visual steps indicator */}
                <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
                  <div className={cn(
                    "flex items-center gap-1",
                    currentStep >= 1 && "text-primary"
                  )}>
                    <div className={cn(
                      "h-5 w-5 rounded-full border flex items-center justify-center text-[10px]",
                      currentStep >= 1
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-muted-foreground/40"
                    )}>
                      1
                    </div>
                    <span>Upload</span>
                  </div>
                  <div className="h-px flex-1 bg-border" />
                  <div className={cn(
                    "flex items-center gap-1",
                    currentStep >= 2 && "text-primary"
                  )}>
                    <div className={cn(
                      "h-5 w-5 rounded-full border flex items-center justify-center text-[10px]",
                      currentStep >= 2
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-muted-foreground/40"
                    )}>
                      2
                    </div>
                    <span>Preview</span>
                  </div>
                  <div className="h-px flex-1 bg-border" />
                  <div className={cn(
                    "flex items-center gap-1",
                    currentStep >= 3 && "text-primary"
                  )}>
                    <div className={cn(
                      "h-5 w-5 rounded-full border flex items-center justify-center text-[10px]",
                      currentStep >= 3
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-muted-foreground/40"
                    )}>
                      3
                    </div>
                    <span>Import</span>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-5 text-sm">
                {/* Step 1: Upload */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Langkah 1 · Upload file Excel
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Wajib: NIM &amp; Nama · Password opsional
                    </span>
                  </div>

                  {/* Template download helper */}
                  <div className="rounded-2xl border border-border/60 bg-muted/40 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="cursor-pointer w-fit"
                      disabled={isReadingFile || isImporting}
                      onClick={handleDownloadImportTemplate}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Template Excel
                    </Button>
                    <p className="text-[11px] text-muted-foreground sm:text-right">
                      Gunakan template resmi agar format data sesuai sistem dan proses import berjalan lancar.
                    </p>
                  </div>

                  <div
                    className={cn(
                      "rounded-2xl border border-dashed p-6 flex flex-col gap-3 cursor-pointer transition-all duration-200",
                      "bg-muted/40 hover:bg-muted/70 hover:border-primary/60",
                      (isReadingFile || isImporting) && "opacity-70 cursor-not-allowed",
                      isDragOver && "border-primary bg-primary/10"
                    )}
                    onClick={() => {
                      if (!isReadingFile && !isImporting) {
                        fileInputRef.current?.click();
                      }
                    }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background shadow-sm">
                          <Download className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {isReadingFile ? 'Membaca file…' : 'Seret & letakkan file Excel di sini'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Format file <span className="font-medium">.xlsx</span>. Atau gunakan tombol pilih file.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:self-start">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".xlsx"
                          className="hidden"
                          onChange={handleImportExcel}
                          disabled={isReadingFile || isImporting}
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="cursor-pointer"
                          disabled={isReadingFile || isImporting}
                        >
                          Pilih File
                        </Button>
                      </div>
                    </div>
                    {selectedFileName && (
                      <p className="text-xs text-muted-foreground mt-2">
                        File terpilih: <span className="font-medium">{selectedFileName}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Feedback error */}
                {previewError && (
                  <div className="rounded-2xl border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive transition-opacity duration-200">
                    {previewError}
                  </div>
                )}

                {/* Step 2: Preview */}
                {hasPreview && (
                  <div className="space-y-3 animate-fade-up">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Langkah 2 · Preview data
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Cek 10 baris pertama sebelum import.
                      </span>
                    </div>

                    <div className="rounded-2xl border border-border overflow-hidden bg-background/60 backdrop-blur-sm">
                      <div className="max-h-64 overflow-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-muted/70 sticky top-0 z-10 backdrop-blur-sm">
                            <tr className="border-b border-border/60">
                              <th className="px-3 py-2 text-left font-semibold">Nama</th>
                              <th className="px-3 py-2 text-left font-semibold">NIM</th>
                              <th className="px-3 py-2 text-left font-semibold">Email</th>
                              <th className="px-3 py-2 text-left font-semibold">Nomor</th>
                              <th className="px-3 py-2 text-left font-semibold">Tahun Masuk</th>
                              <th className="px-3 py-2 text-left font-semibold">Tahun Lulus</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pendingImportAccounts.slice(0, 10).map((acc, idx) => (
                              <tr
                                key={`${acc.nim}-${idx}`}
                                className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/40'}
                              >
                                <td className="px-3 py-1.5">{acc.nama}</td>
                                <td className="px-3 py-1.5 font-mono text-[11px]">{acc.nim}</td>
                                <td className="px-3 py-1.5">{acc.email || '-'}</td>
                                <td className="px-3 py-1.5">{acc.noHp || '-'}</td>
                                <td className="px-3 py-1.5">{acc.tahunMasuk}</td>
                                <td className="px-3 py-1.5">{acc.tahunLulus ?? '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="border-t border-border px-3 py-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Total baris terbaca: {pendingImportAccounts.length}</span>
                        <span>Menampilkan maksimal 10 baris pertama</span>
                      </div>
                    </div>

                    {previewWarnings.length > 0 && (
                      <div className="rounded-2xl border border-warning/40 bg-warning/5 px-3 py-2 text-xs text-warning-foreground max-h-32 overflow-auto transition-all duration-200">
                        <p className="font-semibold mb-1">Catatan validasi:</p>
                        <ul className="list-disc pl-4 space-y-0.5">
                          {previewWarnings.map((msg, idx) => (
                            <li key={idx}>{msg}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Ringkasan import */}
                {importSummary && (
                  <div className="space-y-2 animate-fade-up">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Langkah 3 · Hasil import
                      </span>
                    </div>
                    <div className="rounded-2xl bg-muted/60 border border-border px-3 py-2 text-xs">
                      <p className="font-semibold mb-1">Ringkasan:</p>
                      <p className="text-muted-foreground mb-1">
                        Berhasil: {importSummary.success} · Gagal: {importSummary.failed}
                      </p>
                      {importSummary.warnings.length > 0 && (
                        <ul className="text-muted-foreground list-disc pl-4 space-y-0.5 max-h-24 overflow-y-auto">
                          {importSummary.warnings.map((msg, idx) => (
                            <li key={idx}>{msg}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer actions */}
                <div className="flex justify-between items-center pt-3">
                  <p className="text-[11px] text-muted-foreground">
                    Data akan disimpan setelah{' '}
                    <span className="font-semibold">Konfirmasi Import</span>.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsImportModalOpen(false)}
                      disabled={isImporting}
                    >
                      Batal
                    </Button>
                    {hasPreview && (
                      <Button
                        type="button"
                        size="sm"
                        disabled={isReadingFile || isImporting}
                        onClick={handleConfirmImport}
                      >
                        {isImporting ? 'Mengimpor...' : 'Konfirmasi Import'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 animate-fade-up md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Pengelola Mahasiswa</h1>
              <p className="text-muted-foreground">Kelola dan analisis data alumni ABT Polines.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button size="lg" variant="outline" onClick={() => setShowAddModal(true)} className="w-full sm:w-auto">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Tambah Mahasiswa
                </Button>
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  className="w-full cursor-pointer sm:w-auto"
                  onClick={() => {
                    setIsImportModalOpen(true);
                    setPreviewError(null);
                    setPendingImportAccounts([]);
                    setPreviewWarnings([]);
                    setImportSummary(null);
                    setSelectedFileName(null);
                  }}
                >
                  <span className="flex items-center">
                    <Download className="w-5 h-5 mr-2" />
                    Import Excel Akun
                  </span>
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid grid-cols-1 gap-4 animate-fade-up sm:grid-cols-2 xl:grid-cols-5">
            <StatCard title="Total Pengisi" value={stats.filled} icon={Users2} color="primary" />
            <StatCard title="Bekerja" value={stats.bekerja} icon={Briefcase} color="primary" />
            <StatCard title="Wirausaha" value={stats.wirausaha} icon={Rocket} color="success" />
            <StatCard title="Studi Lanjut" value={stats.studi} icon={BookOpen} color="destructive" />
            <StatCard title="Mencari Kerja" value={stats.mencari} icon={Search} color="warning" />
          </div>

          {/* Toolbar: Cari nama, Checklist, Filter; aksi tampil di bawah saat ada baris terpilih */}
          <div className="mb-4 animate-fade-up">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <Input
                  type="text"
                  placeholder="Cari nama atau NIM (min. 3 karakter, NIM boleh dengan/tanpa titik)..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="h-11 w-full border-2 border-input sm:w-56"
                  autoComplete="off"
                />
              </div>
              <Button
                size="lg"
                variant={showChecklist ? 'default' : 'outline'}
                className="w-full gap-2 border-2 border-input sm:w-auto"
                onClick={() => {
                  setShowChecklist((v) => !v);
                  if (showChecklist) setSelectedIds([]);
                }}
              >
                <CheckSquare className="w-5 h-5" />
                Checklist
              </Button>
              <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button size="lg" variant="outline" className="w-full gap-2 border-2 border-input sm:w-auto">
                    <Filter className="w-5 h-5" />
                    Filter
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 rounded-xl border border-border bg-card shadow-sm" align="start" side="right" sideOffset={8}>
                  <div className="space-y-3.5">
                    <h4 className="text-sm font-semibold text-foreground">Filter Mahasiswa</h4>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Tahun Masuk (range)</Label>
                      <div className="flex items-center gap-2">
                        <Select value={filterTahunMasukFrom || 'all'} onValueChange={(v) => setFilterTahunMasukFrom(v === 'all' ? '' : v)}>
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="Dari" />
                          </SelectTrigger>
                          <SelectContent className="max-h-72">
                            <SelectItem value="all">Dari</SelectItem>
                            {filterYearOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-xs text-muted-foreground shrink-0">–</span>
                        <Select value={filterTahunMasukTo || 'all'} onValueChange={(v) => setFilterTahunMasukTo(v === 'all' ? '' : v)}>
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="Sampai" />
                          </SelectTrigger>
                          <SelectContent className="max-h-72">
                            <SelectItem value="all">Sampai</SelectItem>
                            {filterYearOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Tahun Lulus (range)</Label>
                      <div className="flex items-center gap-2">
                        <Select value={filterTahunLulusFrom || 'all'} onValueChange={(v) => setFilterTahunLulusFrom(v === 'all' ? '' : v)}>
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="Dari" />
                          </SelectTrigger>
                          <SelectContent className="max-h-72">
                            <SelectItem value="all">Dari</SelectItem>
                            {filterYearOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-xs text-muted-foreground shrink-0">–</span>
                        <Select value={filterTahunLulusTo || 'all'} onValueChange={(v) => setFilterTahunLulusTo(v === 'all' ? '' : v)}>
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="Sampai" />
                          </SelectTrigger>
                          <SelectContent className="max-h-72">
                            <SelectItem value="all">Sampai</SelectItem>
                            {filterYearOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Kelas</Label>
                      <Select value={filterKelas || 'all'} onValueChange={(v) => setFilterKelas(v === 'all' ? '' : v)}>
                        <SelectTrigger className="h-9 text-xs" id="filter-kelas">
                          <SelectValue placeholder="Semua kelas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua kelas</SelectItem>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                          <SelectItem value="D">D</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 pt-1 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8 text-xs"
                        onClick={() => {
                          setFilterTahunMasukFrom('');
                          setFilterTahunMasukTo('');
                          setFilterTahunLulusFrom('');
                          setFilterTahunLulusTo('');
                          setFilterKelas('');
                          setPage(1);
                        }}
                      >
                        Reset
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 h-8 text-xs"
                        onClick={() => {
                          setPage(1);
                          setFilterPopoverOpen(false);
                        }}
                      >
                        Terapkan
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            {/* Toolbar aksi: tampil ketika mode checklist aktif dan ada baris yang dipilih */}
            <div
              className={cn(
                'overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                showChecklist && selectedIds.length > 0 ? 'max-h-32 opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'
              )}
            >
               <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/40 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                 <span className="text-sm text-muted-foreground">
                   {selectedIds.length} dipilih
                 </span>
                 <div className="flex flex-col gap-2 sm:flex-row">
                   <Button
                     variant="outline"
                     size="sm"
                     className="w-full sm:w-auto"
                     onClick={handleExportSelected}
                   >
                    <Download className="w-4 h-4 mr-2" />
                    Eksport Data
                  </Button>
                   <Button
                     variant="outline"
                     size="sm"
                     className="w-full sm:w-auto"
                     onClick={() => setShowBatchDeleteModal(true)}
                   >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Hapus
                  </Button>
                   <Button
                     variant="outline"
                     size="sm"
                     className="w-full sm:w-auto"
                     onClick={() => setShowBatchResetModal(true)}
                   >
                    <KeyRound className="w-4 h-4 mr-2" />
                    Reset Password
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Pagination above table */}
          <div className="mb-4 flex flex-col gap-4 rounded-t-2xl border border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-end">
            <span className="text-sm text-muted-foreground order-2 sm:order-1 mr-auto">
              Menampilkan {rangeStart}–{rangeEnd} dari {totalCount} data
            </span>
            <div className="flex items-center gap-3 order-1 sm:order-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Per halaman:</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}
                >
                  <SelectTrigger className="w-20 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 25, 50, 100].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div
            key={`table-${filterTahunMasukFrom}-${filterTahunMasukTo}-${filterTahunLulusFrom}-${filterTahunLulusTo}-${filterKelas}-${page}`}
            className="animate-fade-up-smooth"
          >
            {importSummary && (
              <div className="mb-4 p-4 rounded-2xl bg-muted/60 border border-border">
                <p className="font-semibold text-sm mb-1">
                  Hasil import akun mahasiswa:
                </p>
                <p className="text-xs text-muted-foreground mb-2">
                  Berhasil: {importSummary.success} | Gagal: {importSummary.failed}
                </p>
                {importSummary.warnings.length > 0 && (
                  <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5 max-h-32 overflow-y-auto">
                    {importSummary.warnings.map((msg, idx) => (
                      <li key={idx}>{msg}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {isListLoading ? (
              <div className="p-8 text-center text-muted-foreground">Memuat data...</div>
            ) : (
              <>
                <DataTable<StudentTableRow>
                  data={studentList}
                  columns={tableColumns}
                  onRowClick={(row) => setSelectedAlumniId(row.id)}
                  onExport={handleExport}
                  emptyMessage="Tidak ada data mahasiswa ditemukan"
                  paginationMode="external"
                  hideToolbar
                  mobileRenderMode="auto"
                  selectionMode={showChecklist ? { rowIdKey: 'id', selectedIds, onSelectionChange: setSelectedIds } : undefined}
                />
                {/* Pagination control */}
                <div className="flex flex-col gap-4 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-muted-foreground order-2 sm:order-1">
                    Menampilkan {rangeStart}–{rangeEnd} dari {totalCount} data
                  </span>
                  <div className="flex items-center gap-3 order-1 sm:order-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground whitespace-nowrap">Per halaman:</span>
                      <Select
                        value={String(pageSize)}
                        onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}
                      >
                        <SelectTrigger className="w-20 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[10, 25, 50, 100].map((n) => (
                            <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 w-9 p-0"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 w-9 p-0"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Batch move-to-recycle confirmation modal */}
          <Dialog open={showBatchDeleteModal} onOpenChange={setShowBatchDeleteModal}>
            <DialogContent className="max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle>Pindahkan ke Recycle Bin</DialogTitle>
              </DialogHeader>
              <p className="text-muted-foreground">
                Apakah Anda yakin ingin memindahkan {selectedIds.length} akun mahasiswa ke Recycle Bin?
              </p>
              <p className="text-sm text-muted-foreground">
                Akun tetap dapat dipulihkan. Sistem akan auto-purge akun recycle setelah 30 hari.
              </p>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowBatchDeleteModal(false)} disabled={isBatchDeleting}>
                  Batal
                </Button>
                <Button variant="destructive" onClick={handleBatchDelete} disabled={isBatchDeleting}>
                  {isBatchDeleting ? 'Memindahkan...' : 'Ya, Pindahkan'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Batch reset password modal */}
          <Dialog
            open={showBatchResetModal}
            onOpenChange={(open) => {
              setShowBatchResetModal(open);
              if (!open) {
                setBatchResetPassword('');
                setBatchResetPasswordConfirm('');
              }
            }}
          >
            <DialogContent className="max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle>Reset Password ({selectedIds.length} akun)</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground mb-4">
                Masukkan password baru yang akan dipakai untuk semua akun terpilih.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Password baru</label>
                  <Input
                    type="password"
                    placeholder="Password baru untuk semua akun terpilih"
                    value={batchResetPassword}
                    onChange={(e) => setBatchResetPassword(e.target.value)}
                    className="h-11 rounded-xl"
                    autoComplete="new-password"
                  />
                  {batchResetPassword.length > 0 && batchResetPassword.length < 6 && (
                    <p className="text-xs text-destructive mt-1">Password minimal 6 karakter</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Konfirmasi password</label>
                  <Input
                    type="password"
                    placeholder="Ulangi password"
                    value={batchResetPasswordConfirm}
                    onChange={(e) => setBatchResetPasswordConfirm(e.target.value)}
                    className="h-11 rounded-xl"
                    autoComplete="new-password"
                  />
                  {batchResetPasswordConfirm.length > 0 && batchResetPassword !== batchResetPasswordConfirm && (
                    <p className="text-xs text-destructive mt-1">Password tidak cocok</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowBatchResetModal(false);
                    setBatchResetPassword('');
                    setBatchResetPasswordConfirm('');
                  }}
                  disabled={isBatchResetting}
                >
                  Batal
                </Button>
                <Button
                  onClick={submitBatchReset}
                  disabled={
                    isBatchResetting ||
                    batchResetPassword.length < 6 ||
                    batchResetPassword !== batchResetPasswordConfirm
                  }
                >
                  {isBatchResetting ? 'Mereset...' : 'Ya, Reset'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Detail Dialog */}
          <Dialog open={!!selectedAlumniId} onOpenChange={() => setSelectedAlumniId(null)}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  Detail Alumni
                </DialogTitle>
              </DialogHeader>
              
              {selectedAlumniDetail && (
                <div className="space-y-6 mt-4">
                  {/* Profile Info */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Nama</p>
                      <p className="font-semibold text-foreground">{selectedAlumniDetail.nama}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">NIM</p>
                      <p className="font-semibold text-foreground">{selectedAlumniDetail.nim}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Jurusan</p>
                      <p className="font-semibold text-foreground">{selectedAlumniDetail.jurusan}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Prodi</p>
                      <p className="font-semibold text-foreground text-sm">{selectedAlumniDetail.prodi}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Tahun Lulus</p>
                      <p className="font-semibold text-foreground">{selectedAlumniDetail.tahunLulus}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Status</p>
                      {selectedAlumniDetail.filledData ? (
                        <StatusBadge status={selectedAlumniDetail.filledData.status} size="md" showIcon />
                      ) : (
                        <span className="text-muted-foreground">Belum mengisi</span>
                      )}
                    </div>
                  </div>

                  {/* Filled Data Details */}
                  {selectedAlumniDetail.filledData && (
                    <>
                      <div className="border-t border-border pt-4">
                        <h4 className="font-semibold text-foreground mb-4">Detail Status</h4>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          {selectedAlumniDetail.filledData.status === 'bekerja' && (() => {
                            const detailRow = studentList.find((r) => r.id === selectedAlumniId);
                            const bulanLabels: Record<number, string> = {
                              1: 'Januari', 2: 'Februari', 3: 'Maret', 4: 'April', 5: 'Mei', 6: 'Juni',
                              7: 'Juli', 8: 'Agustus', 9: 'September', 10: 'Oktober', 11: 'November', 12: 'Desember',
                            };
                            const bulanMasuk = selectedAlumniDetail.filledData.bulanMulaiKerja;
                            return (
                              <>
                                <div className="flex items-center gap-3">
                                  <Building2 className="w-4 h-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">Perusahaan</p>
                                    <p className="text-sm font-medium">{selectedAlumniDetail.filledData.namaPerusahaan}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">Jabatan</p>
                                    <p className="text-sm font-medium">{selectedAlumniDetail.filledData.jabatan}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <MapPin className="w-4 h-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">Lokasi</p>
                                    <p className="text-sm font-medium">{selectedAlumniDetail.filledData.lokasiPerusahaan}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">Tahun Masuk</p>
                                    <p className="text-sm font-medium">{detailRow?.tahunMasuk ?? '–'}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">Bulan Masuk Kerja</p>
                                    <p className="text-sm font-medium">
                                      {bulanMasuk != null && bulanLabels[bulanMasuk] ? bulanLabels[bulanMasuk] : '–'}
                                    </p>
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                          {selectedAlumniDetail.filledData.status === 'wirausaha' && (
                            <>
                              <div className="flex items-center gap-3">
                                <Rocket className="w-4 h-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Nama Usaha</p>
                                  <p className="text-sm font-medium">{selectedAlumniDetail.filledData.namaUsaha}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Building2 className="w-4 h-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Jenis Usaha</p>
                                  <p className="text-sm font-medium">{selectedAlumniDetail.filledData.jenisUsaha}</p>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-border pt-4">
                        <h4 className="font-semibold text-foreground mb-4">Kontak</h4>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Email</p>
                              <p className="text-sm font-medium">{selectedAlumniDetail.filledData.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">No. HP</p>
                              <p className="text-sm font-medium">{selectedAlumniDetail.filledData.noHp}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Add Student Modal */}
          <StudentAccountModal
            open={showAddModal}
            onOpenChange={setShowAddModal}
            onSubmit={handleAddStudent}
            existingNims={existingNims}
          />

          {/* Delete Student Dialog */}
          {deleteTarget && (
            <DeleteStudentDialog
              open={!!deleteTarget}
              onOpenChange={(open) => !open && setDeleteTarget(null)}
              studentName={deleteTarget.nama}
              studentNim={deleteTarget.nim}
              onConfirm={handleDeleteStudent}
              isDeleting={isDeleting}
            />
          )}

          {/* Edit Student Modal */}
          <AdminStudentEditModal
            open={!!editStudent}
            onOpenChange={(open) => !open && setEditStudent(null)}
            student={editStudent}
            existingNims={existingNims}
            onUpdateProfile={updateStudentAccount}
            onResetPassword={resetStudentPassword}
            onDataChanged={handleAdminDataChanged}
          />
        </div>
      </main>
    </>
  );
}
