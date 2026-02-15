import { useState, useMemo, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAlumni } from '@/contexts/AlumniContext';
import { jurusanList, prodiList, tahunLulusList } from '@/lib/data';
import { StatCard, StatusBadge, DataTable } from '@/components/shared';
import { StudentAccountModal, DeleteStudentDialog, AdminStudentEditModal } from '@/components/admin';
import type { StudentAccountInput, StudentProfile } from '@/types/student.types';
import {
  Search, Download, Filter, Users2, Briefcase, Rocket, BookOpen, TrendingUp,
  User, Mail, Phone, Building2, MapPin, Calendar, ExternalLink, X,
  UserPlus, Trash2, Pencil
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { exportStudentsToExcel, exportStudentImportTemplate } from '@/lib/excel-export';
import { parseStudentAccountsFromExcel } from '@/lib/excel-import';

export default function AdminDashboard() {
  const { masterData, alumniData, studentAccounts, addStudentAccount, deleteStudentAccount, updateStudentAccount, resetStudentPassword, refreshData } = useAlumni();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTahun, setFilterTahun] = useState<string>('all');
  const [filterJurusan, setFilterJurusan] = useState<string>('all');
  const [filterProdi, setFilterProdi] = useState<string>('all');
  const [selectedAlumniId, setSelectedAlumniId] = useState<string | null>(null);
  
  // Modal states for student account management
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; nama: string; nim: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Import Excel state
  const [isImporting, setIsImporting] = useState(false); // confirm import to DB
  const [isReadingFile, setIsReadingFile] = useState(false); // parsing Excel
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [pendingImportAccounts, setPendingImportAccounts] = useState<StudentAccountInput[]>([]);
  const [importSummary, setImportSummary] = useState<{ success: number; failed: number; warnings: string[] } | null>(null);
  const [previewWarnings, setPreviewWarnings] = useState<string[]>([]);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // Edit modal state
  const [editStudent, setEditStudent] = useState<StudentProfile | null>(null);

  // Use studentAccounts as the primary data source for the table
  // This ensures all accounts can be managed (edited/deleted)
  const tableData = useMemo(() => {
    return studentAccounts.map(student => {
      const filled = alumniData.find(d => d.alumniMasterId === student.id);
      return { 
        ...student, 
        filledData: filled,
        // Add tahunLulus for compatibility
        tahunLulus: student.tahunLulus || student.tahunMasuk + 4,
      };
    });
  }, [studentAccounts, alumniData]);

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    return tableData.filter(student => {
      const matchSearch = student.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.nim.includes(searchQuery);
      const matchTahun = filterTahun === 'all' || student.tahunLulus === parseInt(filterTahun);
      const matchJurusan = filterJurusan === 'all' || student.jurusan === filterJurusan;
      const matchProdi = filterProdi === 'all' || student.prodi === filterProdi;
      return matchSearch && matchTahun && matchJurusan && matchProdi;
    });
  }, [tableData, searchQuery, filterTahun, filterJurusan, filterProdi]);

  // Statistics
  const stats = useMemo(() => {
    const filled = alumniData.length;
    const bekerja = alumniData.filter(d => d.status === 'bekerja').length;
    const wirausaha = alumniData.filter(d => d.status === 'wirausaha').length;
    const studi = alumniData.filter(d => d.status === 'studi').length;
    const mencari = alumniData.filter(d => d.status === 'mencari').length;
    return { filled, bekerja, wirausaha, studi, mencari };
  }, [alumniData]);

  const handleAdminDataChanged = async () => {
    await refreshData();
  };

  const selectedAlumniDetail = useMemo(() => {
    if (!selectedAlumniId) return null;
    const master = masterData.find(m => m.id === selectedAlumniId);
    const filled = alumniData.find(d => d.alumniMasterId === selectedAlumniId);
    return master ? { ...master, filledData: filled } : null;
  }, [selectedAlumniId, masterData, alumniData]);

  // Export handler - Excel (.xlsx) with formatted table
  const handleExport = useCallback(async () => {
    const rows = filteredData.map((alumni) => ({
      nama: alumni.nama,
      nim: alumni.nim,
      email: alumni.filledData?.email || '-',
      nomor: alumni.filledData?.noHp || '-',
      tahunMasuk: alumni.tahunMasuk,
      tahunLulus: alumni.tahunLulus,
      // Password disimpan di backend sebagai hash, jadi di sini kita tidak bisa menampilkan password asli.
      // Untuk kebutuhan template import, kita isi password default = NIM.
      password: alumni.nim,
    }));

    await exportStudentsToExcel(rows, {
      filename: 'data-mahasiswa.xlsx',
      title: 'DATA MAHASISWA',
    });
  }, [filteredData]);

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

  // Step 1: baca file & siapkan preview (tanpa menyimpan ke DB)
  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

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
  };

  const handleDownloadImportTemplate = async () => {
    await exportStudentImportTemplate();
  };

  // Step 2: konfirmasi & simpan ke "database" (state + backend)
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

  // Table columns configuration with status and actions (Edit + Delete)
  const tableColumns = [
    { key: 'nama', header: 'Nama', sortable: true },
    { key: 'nim', header: 'NIM', sortable: true },
    { 
      key: 'email', 
      header: 'Email', 
      hideOnMobile: true,
      accessor: (row: typeof filteredData[0]) => row.email || '-',
      className: 'text-sm'
    },
    { 
      key: 'noHp', 
      header: 'Nomor', 
      hideOnMobile: true,
      accessor: (row: typeof filteredData[0]) => row.noHp || '-',
      className: 'text-sm'
    },
    { 
      key: 'status', 
      header: 'Status',
      accessor: (row: typeof filteredData[0]) => {
        // Show student status (active/alumni/etc) instead of career status
        const statusLabels: Record<string, string> = {
          'active': 'Aktif',
          'alumni': 'Alumni',
          'on_leave': 'Cuti',
          'dropout': 'Dropout',
        };
        return (
          <span className={`px-2 py-0.5 rounded-full text-xs ${
            row.status === 'alumni' ? 'bg-primary/10 text-primary' :
            row.status === 'active' ? 'bg-success/10 text-success' :
            row.status === 'on_leave' ? 'bg-warning/10 text-warning' :
            'bg-muted text-muted-foreground'
          }`}>
            {statusLabels[row.status] || row.status}
          </span>
        );
      }
    },
    { key: 'tahunMasuk', header: 'Tahun Masuk', sortable: true, hideOnMobile: true },
    { key: 'tahunLulus', header: 'Tahun Lulus', sortable: true, hideOnMobile: true },
    {
      key: 'actions',
      header: 'Aksi',
      accessor: (row: typeof filteredData[0]) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10"
            onClick={(e) => {
              e.stopPropagation();
              setEditStudent(row);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget({ id: row.id, nama: row.nama, nim: row.nim });
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  ];

  // Derive simple step state for import modal UI
  const hasPreview = pendingImportAccounts.length > 0;
  const hasResult = !!importSummary;
  const currentStep = hasResult ? 3 : hasPreview ? 2 : 1;

  return (
    <>
      <main className="pb-12 sm:pb-16">
        <div className="container mx-auto px-4">
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
                      (isReadingFile || isImporting) && "opacity-70 cursor-not-allowed"
                    )}
                    onClick={() => {
                      if (!isReadingFile && !isImporting) {
                        fileInputRef.current?.click();
                      }
                    }}
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 animate-fade-up">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Pengelola Mahasiswa</h1>
              <p className="text-muted-foreground">Kelola dan analisis data alumni ABT Polines.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex gap-3">
                <Button size="lg" variant="outline" onClick={() => setShowAddModal(true)}>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Tambah Mahasiswa
                </Button>
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  className="cursor-pointer"
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 animate-fade-up">
            <StatCard title="Total Pengisi" value={stats.filled} icon={Users2} color="primary" />
            <StatCard title="Bekerja" value={stats.bekerja} icon={Briefcase} color="primary" />
            <StatCard title="Wirausaha" value={stats.wirausaha} icon={Rocket} color="success" />
            <StatCard title="Studi Lanjut" value={stats.studi} icon={BookOpen} color="destructive" />
            <StatCard title="Mencari Kerja" value={stats.mencari} icon={Search} color="warning" />
          </div>

          {/* Filters */}
          <div className="glass-card rounded-2xl p-6 mb-6 animate-fade-up">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Filter Data</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama atau NIM..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 rounded-xl"
                />
              </div>
              <Select value={filterTahun} onValueChange={setFilterTahun}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Tahun Lulus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tahun</SelectItem>
                  {tahunLulusList.map(t => (
                    <SelectItem key={t} value={t.toString()}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterJurusan} onValueChange={(v) => { setFilterJurusan(v); setFilterProdi('all'); }}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Jurusan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jurusan</SelectItem>
                  {jurusanList.map(j => (
                    <SelectItem key={j} value={j}>{j}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterProdi} onValueChange={setFilterProdi} disabled={filterJurusan === 'all'}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Prodi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Prodi</SelectItem>
                  {filterJurusan !== 'all' && prodiList[filterJurusan]?.map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data Table */}
          <div className="animate-fade-up">
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
            <DataTable
              data={filteredData}
              columns={tableColumns}
              searchPlaceholder="Cari nama atau NIM..."
              searchKeys={['nama', 'nim'] as (keyof typeof filteredData[0])[]}
              onRowClick={(row) => setSelectedAlumniId(row.id)}
              onExport={handleExport}
              pageSize={10}
              emptyMessage="Tidak ada data alumni ditemukan"
            />
          </div>

          {/* Detail Dialog */}
          <Dialog open={!!selectedAlumniId} onOpenChange={() => setSelectedAlumniId(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                  <div className="grid grid-cols-2 gap-4">
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
                        <div className="grid grid-cols-2 gap-4">
                          {selectedAlumniDetail.filledData.status === 'bekerja' && (
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
                            </>
                          )}
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
                        <div className="grid grid-cols-2 gap-4">
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
