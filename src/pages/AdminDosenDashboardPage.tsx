import React, { useState, useMemo } from 'react';
import {
  Users,
  BookOpen,
  Search,
  User,
  GraduationCap,
  Award,
  FileText,
  Building,
  Pencil,
  Save,
  X,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  Archive,
  RotateCcw,
  Clock,
  Sparkles,
  AlertTriangle,
  History,
  Info,
  KeyRound,
  FlaskConical,
  HeartHandshake,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { type DosenItem } from '@/data/mockDosenData';
import { useToast } from '@/hooks/use-toast';
import { useDosen, getRemainingDays, type RecoveryMatchResult, type ArchivedDosenItem } from '@/contexts/DosenContext';
import { DosenImportButton } from '@/components/admin/DosenImportButton';
import { DosenImportLogsButton } from '@/components/admin/DosenImportLogsButton';

const OPSI_PENDIDIKAN_PASCA_SARJANA = [
  'Magister (S2)',
  'Doktor (S3)',
  'Magister Terapan (S2 Terapan)',
  'Doktor Terapan (S3 Terapan)',
  'Spesialis (Sp-1)'
];

const OPSI_JABATAN = [
  'Profesor / Guru Besar',
  'Lektor Kepala',
  'Lektor',
  'Asisten Ahli'
];

const contentVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.22,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
    }
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: {
      duration: 0.15,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
    }
  }
};

const footerVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
    }
  },
  exit: {
    opacity: 0,
    y: 12,
    transition: {
      duration: 0.15,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
    }
  }
};

const EMPTY_FORM: Partial<DosenItem> = {
  nama: '',
  nidn: '',
  statusDosen: 'Tetap',
  jabatan: 'Asisten Ahli',
  peran: 'Akademisi',
  institusi: 'Politeknik Negeri Semarang',
  pendidikanPascaSarjana: ['Magister (S2)'],
  bidangKeahlian: '',
  sertifikatPendidik: '-',
  sertifikatKompetensi: '-',
  email: '',
  telepon: '',
};

export default function AdminDosenDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // SSOT Context
  const {
    dosenList,
    addDosen,
    updateDosenProfile,
    deleteDosen,
    restoreDosen,
    permanentlyDeleteArchivedDosen,
    checkArchiveRecovery,
    archivedDosenList
  } = useDosen();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDosen, setSelectedDosen] = useState<DosenItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<DosenItem | null>(null);

  // Unsaved changes confirmation dialog state
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingCloseTarget, setPendingCloseTarget] = useState<'sheet' | 'edit-mode' | null>(null);

  // Delete Dosen state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [dosenToDelete, setDosenToDelete] = useState<DosenItem | null>(null);

  // Add Dosen Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState<Partial<DosenItem>>(EMPTY_FORM);
  const [addFormErrors, setAddFormErrors] = useState<Record<string, string>>({});
  const [isAddingDosen, setIsAddingDosen] = useState(false);

  // Archive Drawer state
  const [isArchiveDrawerOpen, setIsArchiveDrawerOpen] = useState(false);

  // Recovery Modal state (OR Logic)
  const [recoveryMatch, setRecoveryMatch] = useState<RecoveryMatchResult | null>(null);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);

  React.useEffect(() => {
    const hash = location.hash;
    if (hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [location.hash]);

  // Check if current form has unsaved modifications
  const isFormDirty = useMemo(() => {
    if (!isEditing || !selectedDosen || !editFormData) return false;
    return (
      editFormData.nama !== selectedDosen.nama ||
      editFormData.nidn !== selectedDosen.nidn ||
      editFormData.statusDosen !== selectedDosen.statusDosen ||
      editFormData.jabatan !== selectedDosen.jabatan ||
      editFormData.peran !== selectedDosen.peran ||
      editFormData.institusi !== selectedDosen.institusi ||
      editFormData.bidangKeahlian !== selectedDosen.bidangKeahlian ||
      editFormData.sertifikatPendidik !== selectedDosen.sertifikatPendidik ||
      editFormData.sertifikatKompetensi !== selectedDosen.sertifikatKompetensi ||
      JSON.stringify(editFormData.pendidikanPascaSarjana) !== JSON.stringify(selectedDosen.pendidikanPascaSarjana)
    );
  }, [isEditing, selectedDosen, editFormData]);

  // Filtered Dosen data
  const filteredDosen = dosenList.filter((dosen) => {
    return (
      dosen.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dosen.nidn.includes(searchTerm) ||
      dosen.jabatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dosen.institusi.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleOpenView = (dosen: DosenItem) => {
    setSelectedDosen(dosen);
    setEditFormData({ ...dosen });
    setIsEditing(false);
    setIsDetailOpen(true);
  };

  const handleOpenEdit = (dosen: DosenItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedDosen(dosen);
    setEditFormData({ ...dosen });
    setIsEditing(true);
    setIsDetailOpen(true);
  };

  const handleTogglePendidikan = (tingkat: string) => {
    if (!editFormData) return;
    const current = editFormData.pendidikanPascaSarjana || [];
    const exists = current.includes(tingkat);
    const updated = exists
      ? current.filter(t => t !== tingkat)
      : [...current, tingkat];
    setEditFormData({ ...editFormData, pendidikanPascaSarjana: updated });
  };

  const handleTogglePendidikanAdd = (tingkat: string) => {
    const current = addFormData.pendidikanPascaSarjana || [];
    const exists = current.includes(tingkat);
    const updated = exists
      ? current.filter(t => t !== tingkat)
      : [...current, tingkat];
    setAddFormData({ ...addFormData, pendidikanPascaSarjana: updated });
  };

  const resetAddDosenForm = () => {
    setAddFormData(EMPTY_FORM);
    setAddFormErrors({});
  };

  const openAddDosenModal = () => {
    resetAddDosenForm();
    setIsAddModalOpen(true);
  };

  const closeAddDosenModal = () => {
    if (isAddingDosen) return;
    setIsAddModalOpen(false);
    resetAddDosenForm();
  };

  const updateAddFormData = (updates: Partial<DosenItem>) => {
    setAddFormData((previous) => ({ ...previous, ...updates }));
    setAddFormErrors((previous) => {
      const next = { ...previous };
      Object.keys(updates).forEach((key) => delete next[key]);
      return next;
    });
  };

  const validateAddDosenForm = () => {
    const errors: Record<string, string> = {};
    const nama = addFormData.nama?.trim() || '';
    const nidn = addFormData.nidn?.trim() || '';
    const email = addFormData.email?.trim() || '';

    if (!nama) errors.nama = 'Nama dosen wajib diisi.';
    else if (nama.length < 3) errors.nama = 'Nama dosen minimal 3 karakter.';
    else if (nama.length > 150) errors.nama = 'Nama dosen maksimal 150 karakter.';

    if (!nidn) errors.nidn = 'NIDN/NIDK wajib diisi.';
    else if (nidn.length > 20 || !(new RegExp('^[A-Za-z0-9./-]+$')).test(nidn)) {
      errors.nidn = 'Gunakan huruf, angka, titik, garis miring, atau tanda hubung.';
    } else if (dosenList.some((dosen) => dosen.nidn.toLowerCase() === nidn.toLowerCase())) {
      errors.nidn = `NIDN/NIDK ${nidn} sudah terdaftar aktif.`;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Format email belum valid.';
    }

    setAddFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveEdit = async (closeSheetAfter = false) => {
    if (!editFormData || !selectedDosen) return;
    await updateDosenProfile(selectedDosen.nidn, editFormData);
    setSelectedDosen(editFormData);
    setIsEditing(false);
    setShowUnsavedDialog(false);
    if (closeSheetAfter) {
      setIsDetailOpen(false);
    }
    toast({
      title: 'Perubahan Disimpan',
      description: `Data profil dosen ${editFormData.nama} berhasil diperbarui di seluruh sistem.`,
    });
  };

  const handleRequestCancel = () => {
    if (isFormDirty) {
      setPendingCloseTarget('edit-mode');
      setShowUnsavedDialog(true);
    } else {
      if (selectedDosen) {
        setEditFormData({ ...selectedDosen });
      }
      setIsEditing(false);
    }
  };

  const handleSheetOpenChange = (open: boolean) => {
    if (!open) {
      if (isEditing && isFormDirty) {
        setPendingCloseTarget('sheet');
        setShowUnsavedDialog(true);
        return;
      }
      setIsEditing(false);
      setIsDetailOpen(false);
    } else {
      setIsDetailOpen(true);
    }
  };

  const handleDiscardChanges = () => {
    if (selectedDosen) {
      setEditFormData({ ...selectedDosen });
    }
    setIsEditing(false);
    setShowUnsavedDialog(false);
    if (pendingCloseTarget === 'sheet') {
      setIsDetailOpen(false);
    }
  };

  // Delete Action Handler (Soft Delete)
  const handleConfirmDelete = () => {
    if (!dosenToDelete) return;
    deleteDosen(dosenToDelete.nidn);
    setShowDeleteDialog(false);
    setIsDetailOpen(false);
    setIsEditing(false);
    toast({
      title: 'Dosen Dipindahkan ke Arsip',
      description: `Data ${dosenToDelete.nama} berhasil dipindahkan ke arsip sistem (retensi 20 hari).`,
    });
    setDosenToDelete(null);
  };

  // Submit Add Dosen with Recovery "OR" Check
  const handleSubmitAddDosen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAddingDosen || !validateAddDosenForm()) return;

    // Run Recovery Logic with "OR" Evaluation
    const recoveryResult = checkArchiveRecovery(addFormData.nama, addFormData.nidn);
    if (recoveryResult) {
      setRecoveryMatch(recoveryResult);
      setIsRecoveryModalOpen(true);
      return;
    }

    // Normal Add Dosen
    setIsAddingDosen(true);
    try {
      const result = await addDosen(addFormData);
      if (result.success) {
        setIsAddModalOpen(false);
        resetAddDosenForm();
        toast({
          title: 'Dosen Baru Ditambahkan',
          description: `Entitas dosen ${addFormData.nama} berhasil didaftarkan dan disinkronkan ke seluruh modul.`,
        });
      } else {
        const message = result.message || 'Terjadi kesalahan saat menyimpan data.';
        setAddFormErrors({ form: message });
        toast({ title: 'Gagal Menambahkan Dosen', description: message, variant: 'destructive' });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan data.';
      setAddFormErrors({ form: message });
      toast({ title: 'Gagal Menambahkan Dosen', description: message, variant: 'destructive' });
    } finally {
      setIsAddingDosen(false);
    }
  };

  // Recovery Choices
  const handleRecoveryRestoreExact = async () => {
    if (!recoveryMatch) return;
    setIsAddingDosen(true);
    try {
      await restoreDosen(recoveryMatch.item.dosen.nidn);
      setIsRecoveryModalOpen(false);
      setIsAddModalOpen(false);
      resetAddDosenForm();
      toast({
        title: 'Data Berhasil Dipulihkan (Restore)',
        description: `Seluruh data profil dan riwayat Tridharma untuk ${recoveryMatch.item.dosen.nama} telah diaktifkan kembali.`,
      });
    } catch (error) {
      toast({ title: 'Gagal Memulihkan Data', description: error instanceof Error ? error.message : 'Data arsip gagal dipulihkan.', variant: 'destructive' });
    } finally {
      setIsAddingDosen(false);
    }
  };

  const handleRecoveryRestoreWithSync = async () => {
    if (!recoveryMatch) return;
    setIsAddingDosen(true);
    try {
      await restoreDosen(recoveryMatch.item.dosen.nidn, addFormData);
      setIsRecoveryModalOpen(false);
      setIsAddModalOpen(false);
      resetAddDosenForm();
      toast({
        title: 'Data Dipulihkan & Disinkronkan',
        description: `Riwayat Tridharma dipulihkan dan data profil diperbarui dengan input baru (${addFormData.nama}).`,
      });
    } catch (error) {
      toast({ title: 'Gagal Memulihkan Data', description: error instanceof Error ? error.message : 'Data arsip gagal dipulihkan.', variant: 'destructive' });
    } finally {
      setIsAddingDosen(false);
    }
  };

  const handleRecoveryCreateFresh = async () => {
    if (!recoveryMatch) return;
    setIsAddingDosen(true);
    try {
      // Remove old archive and create fresh
      await permanentlyDeleteArchivedDosen(recoveryMatch.item.dosen.nidn);
      const res = await addDosen(addFormData);
      if (!res.success) throw new Error(res.message || 'Dosen baru gagal dibuat.');
      setIsRecoveryModalOpen(false);
      setIsAddModalOpen(false);
      resetAddDosenForm();
      toast({
        title: 'Dosen Baru Dibuat',
        description: `Dosen baru ${addFormData.nama} berhasil dibuat sebagai entitas bersih.`,
      });
    } catch (error) {
      toast({ title: 'Gagal Membuat Dosen', description: error instanceof Error ? error.message : 'Dosen baru gagal dibuat.', variant: 'destructive' });
    } finally {
      setIsAddingDosen(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap justify-end gap-2">
        <DosenImportLogsButton />
        <DosenImportButton module="pengelolaan" title="Pengelolaan Dosen" />
        <Button
          type="button"
          size="sm"
          onClick={openAddDosenModal}
          className="h-9 rounded-xl bg-primary text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Tambah Dosen
        </Button>
      </div>
      {/* Main Interactive Table Section */}
      <div className="glass-card rounded-2xl border border-border/70 bg-card shadow-soft overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-border/60 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h4 className="text-lg font-bold text-foreground">Pengelolaan Data Dosen Program Studi ABT</h4>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pusat kendali entitas dosen yang tersinkronisasi otomatis ke seluruh sub-modul Tridharma &amp; Waktu Mengajar
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari dosen, NIDN, jabatan..."
                className="pl-9 h-9 text-xs bg-background/50 rounded-xl border-border/70"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Archive Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsArchiveDrawerOpen(true)}
              className="h-9 rounded-xl text-xs font-medium border-border/70 hover:bg-accent flex items-center gap-1.5"
            >
              <Archive className="w-3.5 h-3.5 text-amber-500" />
              <span>Arsip Dosen</span>
              {archivedDosenList.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                  {archivedDosenList.length}
                </span>
              )}
            </Button>

          </div>
        </div>

        {/* Table Content (Desktop >= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider border-b border-border/50">
              <tr>
                <th className="py-3 px-4 font-semibold">Nama &amp; NIDN</th>
                <th className="py-3 px-4 font-semibold">Status &amp; Jabatan</th>
                <th className="py-3 px-4 font-semibold">Kualifikasi Pascasarjana</th>
                <th className="py-3 px-4 font-semibold">Bidang Keahlian</th>
                <th className="py-3 px-4 font-semibold">Sertifikasi</th>
                <th className="py-3 px-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-xs">
              {filteredDosen.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground">
                        <Users className="w-6 h-6 opacity-60" />
                      </div>
                      <p className="font-semibold text-foreground text-sm mt-1">Belum Ada Data Dosen</p>
                      <p className="text-xs text-muted-foreground">
                        {searchTerm
                          ? `Tidak ada dosen yang sesuai dengan pencarian "${searchTerm}".`
                          : 'Belum ada data dosen terdaftar di dalam sistem. Klik tombol di bawah untuk menambahkan data pertama.'}
                      </p>
                      {!searchTerm && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            openAddDosenModal();
                          }}
                          className="mt-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          <Plus className="w-4 h-4 mr-1.5" />
                          Tambah Dosen Pertama
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDosen.map((dosen) => (
                  <tr
                    key={dosen.nidn}
                    onClick={() => handleOpenView(dosen)}
                    className="hover:bg-muted/30 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">
                        {dosen.nama}
                      </div>
                      <div className="text-[11px] font-mono text-muted-foreground">
                        NIDN: {dosen.nidn}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 rounded font-normal ${dosen.statusDosen === 'Tetap'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                            }`}
                        >
                          {dosen.statusDosen}
                        </Badge>
                        <span className="text-foreground font-medium">{dosen.jabatan}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {dosen.peran} &bull; {dosen.institusi}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {dosen.pendidikanPascaSarjana?.map((p, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded bg-muted/70 text-muted-foreground text-[10px]">
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {dosen.bidangKeahlian}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5 text-[11px]">
                        <div><span className="text-muted-foreground">Serdos:</span> <span className="font-mono">{dosen.sertifikatPendidik}</span></div>
                        <div><span className="text-muted-foreground">Kompetensi:</span> {dosen.sertifikatKompetensi}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleOpenEdit(dosen, e)}
                          className="h-7 w-7 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
                          title="Edit Profil"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDosenToDelete(dosen);
                            setShowDeleteDialog(true);
                          }}
                          className="h-7 w-7 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                          title="Hapus ke Arsip (Soft Delete)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Vertical Card Stack (< md) */}
        <div className="block md:hidden divide-y divide-border/40">
          {filteredDosen.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground">
                  <Users className="w-6 h-6 opacity-60" />
                </div>
                <p className="font-semibold text-foreground text-sm mt-1">Belum Ada Data Dosen</p>
                <p className="text-xs text-muted-foreground">
                  {searchTerm
                    ? `Tidak ada dosen yang sesuai dengan pencarian "${searchTerm}".`
                    : 'Belum ada data dosen terdaftar di dalam sistem.'}
                </p>
                {!searchTerm && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      openAddDosenModal();
                    }}
                    className="mt-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Tambah Dosen Pertama
                  </Button>
                )}
              </div>
            </div>
          ) : (
            filteredDosen.map((dosen) => (
              <div
                key={dosen.nidn}
                onClick={() => handleOpenView(dosen)}
                className="p-4 space-y-3 active:bg-muted/15 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20">
                      {dosen.nama ? dosen.nama.charAt(0) : 'D'}
                    </div>
                    <div>
                      <h5 className="font-semibold text-foreground text-sm leading-snug">
                        {dosen.nama}
                      </h5>
                      <p className="text-xs font-mono text-muted-foreground mt-0.5">
                        NIDN: {dosen.nidn}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${dosen.statusDosen === 'Tetap'
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                      }`}
                  >
                    {dosen.statusDosen}
                  </Badge>
                </div>

                <div className="rounded-xl bg-muted/20 p-2.5 space-y-1.5 text-xs border border-border/30">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="font-medium">Jabatan &amp; Peran:</span>
                    <span className="text-foreground font-semibold text-right">{dosen.jabatan} ({dosen.peran})</span>
                  </div>
                  <div className="flex items-start justify-between text-muted-foreground pt-1 border-t border-border/20">
                    <span className="font-medium shrink-0">Institusi:</span>
                    <span className="text-foreground text-right truncate max-w-[200px]">{dosen.institusi}</span>
                  </div>
                  {dosen.pendidikanPascaSarjana && dosen.pendidikanPascaSarjana.length > 0 && (
                    <div className="flex items-start justify-between text-muted-foreground pt-1 border-t border-border/20">
                      <span className="font-medium shrink-0">Kualifikasi:</span>
                      <span className="text-foreground text-right truncate max-w-[200px]">
                        {dosen.pendidikanPascaSarjana.join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenView(dosen)}
                    className="touch-target-sm rounded-xl text-xs font-medium h-9 px-3"
                  >
                    Detail
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={(e) => handleOpenEdit(dosen, e)}
                    className="touch-target-sm rounded-xl text-xs font-semibold h-9 px-3.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20"
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1.5" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDosenToDelete(dosen);
                      setShowDeleteDialog(true);
                    }}
                    className="touch-target-sm rounded-xl text-xs font-medium h-9 px-2.5 text-rose-500 hover:bg-rose-500/10"
                    title="Arsipkan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal: Tambah Dosen Baru (SSOT Master) */}
      <Dialog open={isAddModalOpen} onOpenChange={closeAddDosenModal}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-2xl border-border/60 bg-card p-6 shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">Tambah Dosen Baru</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Entitas baru akan langsung disinkronkan ke seluruh modul Tridharma dan Waktu Mengajar.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmitAddDosen} className="space-y-4 pt-2" noValidate>
            {addFormErrors.form && (
              <div role="alert" className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{addFormErrors.form}</span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Nama Lengkap */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground">
                  Nama Lengkap (dengan gelar) <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  value={addFormData.nama || ''}
                  onChange={(e) => updateAddFormData({ nama: e.target.value })}
                  placeholder="Contoh: Dr. Ir. Fauzi, M.T."
                  aria-invalid={!!addFormErrors.nama}
                  aria-describedby={addFormErrors.nama ? 'add-dosen-nama-error' : undefined}
                  className={`h-9 rounded-xl bg-background text-xs ${addFormErrors.nama ? 'border-destructive' : ''}`}
                />
                {addFormErrors.nama && <p id="add-dosen-nama-error" className="text-xs text-destructive">{addFormErrors.nama}</p>}
              </div>

              {/* NIDN / NIDK */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  NIDN / NIDK <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  value={addFormData.nidn || ''}
                  onChange={(e) => updateAddFormData({ nidn: e.target.value })}
                  placeholder="Contoh: 0012087501"
                  aria-invalid={!!addFormErrors.nidn}
                  aria-describedby={addFormErrors.nidn ? 'add-dosen-nidn-error' : undefined}
                  className={`h-9 rounded-xl bg-background font-mono text-xs ${addFormErrors.nidn ? 'border-destructive' : ''}`}
                />
                {addFormErrors.nidn && <p id="add-dosen-nidn-error" className="text-xs text-destructive">{addFormErrors.nidn}</p>}
              </div>

              {/* Status Dosen */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Status Dosen</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Tetap', 'Tidak Tetap'] as const).map((status) => (
                    <Button
                      key={status}
                      type="button"
                      variant={addFormData.statusDosen === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateAddFormData({ statusDosen: status })}
                      className="rounded-xl text-xs h-9"
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Jabatan Fungsional */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Jabatan Fungsional</label>
                <select
                  value={addFormData.jabatan || 'Asisten Ahli'}
                  onChange={(e) => updateAddFormData({ jabatan: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-border/70 bg-background text-xs text-foreground focus:ring-1 focus:ring-primary"
                >
                  {OPSI_JABATAN.map((j) => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
              </div>

              {/* Peran */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Peran / Afiliasi</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Akademisi', 'Praktisi'] as const).map((p) => (
                    <Button
                      key={p}
                      type="button"
                      variant={addFormData.peran === p ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateAddFormData({ peran: p })}
                      className="rounded-xl text-xs h-9"
                    >
                      {p}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Institusi */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground">Institusi Asal</label>
                <Input
                  value={addFormData.institusi || ''}
                  onChange={(e) => updateAddFormData({ institusi: e.target.value })}
                  placeholder="Politeknik Negeri Semarang"
                  className="rounded-xl text-xs h-9 bg-background"
                />
              </div>

              {/* Pendidikan Pasca Sarjana */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground">Kualifikasi Pascasarjana</label>
                <div className="flex flex-wrap gap-1.5">
                  {OPSI_PENDIDIKAN_PASCA_SARJANA.map((opsi) => {
                    const isSelected = (addFormData.pendidikanPascaSarjana || []).includes(opsi);
                    return (
                      <button
                        key={opsi}
                        type="button"
                        onClick={() => handleTogglePendidikanAdd(opsi)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${isSelected
                          ? 'bg-primary/10 border-primary text-primary font-medium'
                          : 'bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted/60'
                          }`}
                      >
                        {opsi}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bidang Keahlian */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground">Bidang Keahlian</label>
                <Input
                  value={addFormData.bidangKeahlian || ''}
                  onChange={(e) => updateAddFormData({ bidangKeahlian: e.target.value })}
                  placeholder="Contoh: Manajemen Rekayasa Industri, Pemasaran Digital"
                  className="rounded-xl text-xs h-9 bg-background"
                />
              </div>

              {/* Email & Telepon */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Email Resmi</label>
                <Input
                  type="email"
                  value={addFormData.email || ''}
                  onChange={(e) => updateAddFormData({ email: e.target.value })}
                  placeholder="nama@polines.ac.id"
                  aria-invalid={!!addFormErrors.email}
                  aria-describedby={addFormErrors.email ? 'add-dosen-email-error' : undefined}
                  className={`h-9 rounded-xl bg-background text-xs ${addFormErrors.email ? 'border-destructive' : ''}`}
                />
                {addFormErrors.email && <p id="add-dosen-email-error" className="text-xs text-destructive">{addFormErrors.email}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">No. Telepon / WA</label>
                <Input
                  value={addFormData.telepon || ''}
                  onChange={(e) => updateAddFormData({ telepon: e.target.value })}
                  placeholder="081234567890"
                  className="rounded-xl text-xs h-9 bg-background"
                />
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border/50 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={closeAddDosenModal}
                disabled={isAddingDosen}
                className="rounded-xl text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isAddingDosen}
                className="rounded-xl bg-primary text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                {isAddingDosen ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
                {isAddingDosen ? 'Menyimpan...' : 'Simpan & Daftarkan Dosen'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Recovery Modal (OR Evaluation Logic Triggered) */}
      <Dialog open={isRecoveryModalOpen} onOpenChange={(open) => { if (!isAddingDosen) setIsRecoveryModalOpen(open); }}>
        <DialogContent className="max-w-lg rounded-2xl border-amber-500/40 bg-card p-6 shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Data Dosen Pernah Diarsipkan!
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Sistem mendeteksi kecocokan data arsip aktif (&lt; 20 hari).
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {recoveryMatch && (
            <div className="space-y-3.5 pt-2">
              {/* Badge Condition */}
              <div>
                {recoveryMatch.matchedBy === 'both' && (
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs py-1 px-2.5 inline-flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Data Identik Ditemukan (Nama &amp; NIDN Persis Sama)</span>
                  </Badge>
                )}
                {recoveryMatch.matchedBy === 'nidn' && (
                  <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs py-1 px-2.5 inline-flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>NIDN Terdaftar di Arsip ({recoveryMatch.item.dosen.nidn})</span>
                  </Badge>
                )}
                {recoveryMatch.matchedBy === 'nama' && (
                  <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 text-xs py-1 px-2.5 inline-flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Nama Serupa di Arsip ({recoveryMatch.item.dosen.nama})</span>
                  </Badge>
                )}
              </div>

              {/* Archived Data Summary Card */}
              <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 text-xs space-y-2">
                <div className="font-bold text-foreground text-sm">
                  {recoveryMatch.item.dosen.nama}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-muted-foreground font-mono">
                  <span>NIDN: {recoveryMatch.item.dosen.nidn}</span>
                  <span>&bull;</span>
                  <span>{recoveryMatch.item.dosen.jabatan}</span>
                  <span>&bull;</span>
                  <span>{recoveryMatch.item.dosen.statusDosen}</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold pt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Sisa Retensi: {getRemainingDays(recoveryMatch.item.expiresAt)} Hari Tersisa</span>
                </div>
                <div className="pt-1.5 border-t border-border/40 text-[11px] text-muted-foreground flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-1"><BookOpen className="w-3 h-3 text-primary" /> {recoveryMatch.item.kontribusiPengajaran?.matkulABT.length || 0} Matkul ABT</span>
                  <span className="inline-flex items-center gap-1"><FlaskConical className="w-3 h-3 text-info" /> {recoveryMatch.item.kontribusiPenelitian?.penelitian.length || 0} Penelitian</span>
                  <span className="inline-flex items-center gap-1"><HeartHandshake className="w-3 h-3 text-success" /> {recoveryMatch.item.kontribusiPengabdian?.pkm.length || 0} PKM</span>
                  <span className="inline-flex items-center gap-1"><FileText className="w-3 h-3 text-muted-foreground" /> {recoveryMatch.item.luaran?.luaran.length || 0} Luaran</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Pilih tindakan yang ingin dilakukan terhadap data arsip tersebut:
              </p>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 gap-2 pt-1">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleRecoveryRestoreExact}
                  disabled={isAddingDosen}
                  className="w-full justify-start rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-2" />
                  1. Pulihkan Data Asli (Restore Keseluruhan)
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleRecoveryRestoreWithSync}
                  disabled={isAddingDosen}
                  className="w-full justify-start rounded-xl text-xs font-semibold border-primary/40 text-primary hover:bg-primary/10"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-2" />
                  2. Pulihkan Riwayat &amp; Perbarui Profil Baru
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleRecoveryCreateFresh}
                  disabled={isAddingDosen}
                  className="w-full justify-start rounded-xl text-xs text-muted-foreground hover:text-foreground"
                >
                  <Plus className="w-3.5 h-3.5 mr-2" />
                  3. Buat Sebagai Entitas Baru (Abaikan Riwayat Lama)
                </Button>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsRecoveryModalOpen(false)}
              disabled={isAddingDosen}
              className="rounded-xl text-xs w-full"
            >
              Batal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Drawer: Arsip Dosen (Soft Delete 20 Hari) */}
      <Sheet open={isArchiveDrawerOpen} onOpenChange={setIsArchiveDrawerOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-card p-6">
          <SheetHeader className="pb-4 border-b border-border/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Archive className="w-5 h-5" />
              </div>
              <div>
                <SheetTitle className="text-base font-bold text-foreground">
                  Arsip Dosen (Soft Delete)
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Data yang dihapus disimpan selama 20 hari sebelum dibersihkan permanen otomatis.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="py-4 space-y-3">
            {archivedDosenList.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                <Archive className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-semibold text-foreground">Tidak Ada Dosen di Arsip</p>
                <p className="text-xs mt-1">Saat Anda menghapus dosen dari master data, datanya akan tersimpan di sini selama 20 hari.</p>
              </div>
            ) : (
              archivedDosenList.map((item) => {
                const daysLeft = getRemainingDays(item.expiresAt);
                return (
                  <div
                    key={item.dosen.nidn}
                    className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h5 className="text-sm font-bold text-foreground">{item.dosen.nama}</h5>
                        <div className="text-xs font-mono text-muted-foreground mt-0.5">
                          NIDN: {item.dosen.nidn} &bull; {item.dosen.jabatan}
                        </div>
                      </div>
                      <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[11px] shrink-0 font-medium">
                        <Clock className="w-3 h-3 mr-1" />
                        {daysLeft} Hari Tersisa
                      </Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] bg-card/60 p-2 rounded-lg border border-border/30">
                      <div>
                        <div className="font-bold text-foreground">{item.kontribusiPengajaran?.matkulABT.length || 0}</div>
                        <div className="text-muted-foreground">Matkul</div>
                      </div>
                      <div>
                        <div className="font-bold text-foreground">{item.kontribusiPenelitian?.penelitian.length || 0}</div>
                        <div className="text-muted-foreground">Penelitian</div>
                      </div>
                      <div>
                        <div className="font-bold text-foreground">{item.kontribusiPengabdian?.pkm.length || 0}</div>
                        <div className="text-muted-foreground">PKM</div>
                      </div>
                      <div>
                        <div className="font-bold text-foreground">{item.luaran?.luaran.length || 0}</div>
                        <div className="text-muted-foreground">Luaran</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          permanentlyDeleteArchivedDosen(item.dosen.nidn);
                          toast({
                            title: 'Dihapus Permanen',
                            description: `Data ${item.dosen.nama} telah dimusnahkan permanen dari arsip.`,
                          });
                        }}
                        className="h-8 rounded-lg text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 border-rose-500/30"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Hapus Permanen
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          restoreDosen(item.dosen.nidn);
                          toast({
                            title: 'Data Berhasil Dipulihkan',
                            description: `Dosen ${item.dosen.nama} kembali aktif di master data dan sub-modul.`,
                          });
                        }}
                        className="h-8 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1" />
                        Pulihkan Data
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-2xl border-border/60 bg-card shadow-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
                <Trash2 className="w-5 h-5" />
              </div>
              <AlertDialogTitle className="text-lg font-bold text-foreground">
                Hapus Dosen ke Arsip Sistem?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
              Data profil dan riwayat Tridharma untuk <strong>{dosenToDelete?.nama}</strong> akan dipindahkan ke arsip sistem (retensi 20 hari). Selama masa retensi, data dapat dipulihkan kapan saja.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-3 gap-2">
            <AlertDialogCancel className="rounded-xl text-xs">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
            >
              Pindahkan ke Arsip
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Slide-over Sheet (Detail Profil & Inline Edit) */}
      <Sheet open={isDetailOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-card border-l border-border/70 p-6 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Sheet Header */}
            <SheetHeader className="pb-4 border-b border-border/50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <SheetTitle className="text-lg font-bold text-foreground">
                    {isEditing ? 'Edit Profil Dosen' : 'Detail Profil Dosen'}
                  </SheetTitle>
                  <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                    {isEditing
                      ? 'Perbarui data dosen (otomatis tersinkronisasi ke seluruh sub-modul)'
                      : 'Informasi lengkap dan kualifikasi akademik dosen'}
                  </SheetDescription>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-2">
                  {!isEditing ? (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (selectedDosen) {
                            setDosenToDelete(selectedDosen);
                            setShowDeleteDialog(true);
                          }
                        }}
                        className="h-8 rounded-xl text-xs font-medium text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 border-rose-500/30"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Hapus
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => selectedDosen && handleOpenEdit(selectedDosen)}
                        className="h-8 rounded-xl text-xs font-medium border-border/70 hover:bg-accent"
                      >
                        <Pencil className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                        Edit Profil
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={handleRequestCancel}
                      className="h-8 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3.5 h-3.5 mr-1.5" />
                      Batal
                    </Button>
                  )}
                </div>
              </div>
            </SheetHeader>

            {/* Dynamic Content: View Mode vs Edit Mode */}
            <AnimatePresence mode="wait">
              {!isEditing && selectedDosen ? (
                <motion.div
                  key="view-mode"
                  variants={contentVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-6"
                >
                  {/* Identity Card */}
                  <div className="p-4 rounded-xl bg-muted/40 border border-border/60 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                      {selectedDosen.nama.replace(/^(Dr\.|Prof\.|Ir\.|Dra\.|Drs\.)\s+/gi, '').charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-foreground">{selectedDosen.nama}</h4>
                      <p className="text-xs font-mono text-muted-foreground">NIDN: {selectedDosen.nidn}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="outline" className="text-[10px] bg-background">
                          {selectedDosen.statusDosen}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {selectedDosen.jabatan}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Academic & Affiliation */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Afiliasi &amp; Jabatan</h5>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-background border border-border/60 space-y-1">
                        <div className="text-muted-foreground flex items-center gap-1.5"><Building className="w-3.5 h-3.5" /> Institusi</div>
                        <div className="font-semibold text-foreground">{selectedDosen.institusi}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-background border border-border/60 space-y-1">
                        <div className="text-muted-foreground flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Peran</div>
                        <div className="font-semibold text-foreground">{selectedDosen.peran}</div>
                      </div>
                    </div>
                  </div>

                  {/* Qualifications */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Kualifikasi Akademik</h5>
                    <div className="p-3.5 rounded-xl bg-background border border-border/60 space-y-2.5 text-xs">
                      <div>
                        <div className="text-muted-foreground mb-1">Pendidikan Pascasarjana:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedDosen.pendidikanPascaSarjana?.map((t, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium text-[11px]">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="pt-2 border-t border-border/40">
                        <div className="text-muted-foreground mb-0.5">Bidang Keahlian:</div>
                        <div className="font-semibold text-foreground">{selectedDosen.bidangKeahlian}</div>
                      </div>
                    </div>
                  </div>

                  {/* Certifications */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sertifikasi &amp; Kompetensi</h5>
                    <div className="p-3.5 rounded-xl bg-background border border-border/60 space-y-2 text-xs">
                      <div>
                        <div className="text-muted-foreground">Sertifikat Pendidik (Serdos):</div>
                        <div className="font-mono font-medium text-foreground">{selectedDosen.sertifikatPendidik}</div>
                      </div>
                      <div className="pt-2 border-t border-border/40">
                        <div className="text-muted-foreground">Sertifikat Kompetensi:</div>
                        <div className="font-medium text-foreground">{selectedDosen.sertifikatKompetensi}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : isEditing && editFormData ? (
                <motion.div
                  key="edit-mode"
                  variants={contentVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-5"
                >
                  {/* Form Inputs */}
                  <div className="space-y-4 text-xs">
                    {/* Nama Lengkap */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Nama Lengkap (dengan gelar)</label>
                      <Input
                        value={editFormData.nama}
                        onChange={(e) => setEditFormData({ ...editFormData, nama: e.target.value })}
                        className="bg-background rounded-xl"
                      />
                    </div>

                    {/* NIDN */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">NIDN / NIDK</label>
                      <Input
                        value={editFormData.nidn}
                        onChange={(e) => setEditFormData({ ...editFormData, nidn: e.target.value })}
                        placeholder="Contoh: 0012087501"
                        className="bg-background font-mono rounded-xl"
                      />
                    </div>

                    {/* Status Dosen & Jabatan */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="font-semibold text-foreground">Status Dosen</label>
                        <select
                          value={editFormData.statusDosen}
                          onChange={(e) => setEditFormData({ ...editFormData, statusDosen: e.target.value as 'Tetap' | 'Tidak Tetap' })}
                          className="w-full h-9 px-3 rounded-xl border border-border/70 bg-background text-xs text-foreground"
                        >
                          <option value="Tetap">Tetap</option>
                          <option value="Tidak Tetap">Tidak Tetap</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-semibold text-foreground">Jabatan Fungsional</label>
                        <select
                          value={editFormData.jabatan}
                          onChange={(e) => setEditFormData({ ...editFormData, jabatan: e.target.value })}
                          className="w-full h-9 px-3 rounded-xl border border-border/70 bg-background text-xs text-foreground"
                        >
                          {OPSI_JABATAN.map((j) => (
                            <option key={j} value={j}>{j}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Institusi */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Institusi</label>
                      <Input
                        value={editFormData.institusi}
                        onChange={(e) => setEditFormData({ ...editFormData, institusi: e.target.value })}
                        className="bg-background rounded-xl"
                      />
                    </div>

                    {/* Kualifikasi Pascasarjana */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Kualifikasi Pascasarjana</label>
                      <div className="flex flex-wrap gap-1.5">
                        {OPSI_PENDIDIKAN_PASCA_SARJANA.map((opsi) => {
                          const isSelected = (editFormData.pendidikanPascaSarjana || []).includes(opsi);
                          return (
                            <button
                              key={opsi}
                              type="button"
                              onClick={() => handleTogglePendidikan(opsi)}
                              className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${isSelected
                                ? 'bg-primary/10 border-primary text-primary font-medium'
                                : 'bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted/60'
                                }`}
                            >
                              {opsi}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bidang Keahlian */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Bidang Keahlian</label>
                      <Input
                        value={editFormData.bidangKeahlian}
                        onChange={(e) => setEditFormData({ ...editFormData, bidangKeahlian: e.target.value })}
                        className="bg-background rounded-xl"
                      />
                    </div>

                    {/* Sertifikat Pendidik */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Sertifikat Pendidik (Serdos)</label>
                      <Input
                        value={editFormData.sertifikatPendidik}
                        onChange={(e) => setEditFormData({ ...editFormData, sertifikatPendidik: e.target.value })}
                        className="bg-background rounded-xl font-mono"
                      />
                    </div>

                    {/* Sertifikat Kompetensi */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Sertifikat Kompetensi</label>
                      <Input
                        value={editFormData.sertifikatKompetensi}
                        onChange={(e) => setEditFormData({ ...editFormData, sertifikatKompetensi: e.target.value })}
                        className="bg-background rounded-xl"
                      />
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Footer Actions (Edit Mode: Simpan Perubahan Button) */}
          <AnimatePresence>
            {isEditing && (
              <motion.div
                key="edit-footer-actions"
                variants={footerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="pt-4 border-t border-border/30 flex items-center justify-end sticky bottom-0 bg-card/95 backdrop-blur-md py-4 mt-6 z-10"
              >
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleSaveEdit(false)}
                  className="w-full rounded-xl py-2.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Perubahan SSOT
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </SheetContent>
      </Sheet>

      {/* Confirmation Dialog for Unsaved Changes */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent className="rounded-2xl border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                <AlertCircle className="w-5 h-5" />
              </div>
              <AlertDialogTitle className="text-lg font-bold text-foreground">
                Simpan Perubahan Data?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
              Terdapat perubahan pada data profil dosen yang belum disimpan. Apakah Anda ingin menyimpan perubahan tersebut atau membuangnya?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3">
            <AlertDialogCancel
              onClick={() => setShowUnsavedDialog(false)}
              className="rounded-xl text-xs font-medium border-border/60 hover:bg-muted/60"
            >
              Lanjut Edit
            </AlertDialogCancel>
            <Button
              type="button"
              variant="outline"
              onClick={handleDiscardChanges}
              className="rounded-xl text-xs font-medium text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 border-rose-500/30"
            >
              Buang Perubahan
            </Button>
            <AlertDialogAction
              onClick={() => handleSaveEdit(pendingCloseTarget === 'sheet')}
              className="rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            >
              Simpan Perubahan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
