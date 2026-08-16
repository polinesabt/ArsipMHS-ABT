import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  User,
  GraduationCap,
  Award,
  FileText,
  Pencil,
  Save,
  X,
  Plus,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  INITIAL_TENAGA_KEPENDIDIKAN_DATA,
  type TenagaKependidikanItem
} from '@/data/mockTenagaKependidikanData';
import { useToast } from '@/hooks/use-toast';

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

export default function AdminTenagaKependidikanPage() {
  const { toast } = useToast();

  const [tendikList, setTendikList] = useState<TenagaKependidikanItem[]>(INITIAL_TENAGA_KEPENDIDIKAN_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTendik, setSelectedTendik] = useState<TenagaKependidikanItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<TenagaKependidikanItem | null>(null);
  const [newCertInput, setNewCertInput] = useState('');

  // Unsaved changes confirmation dialog state
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingCloseTarget, setPendingCloseTarget] = useState<'sheet' | 'edit-mode' | null>(null);

  // Check if current form has unsaved modifications
  const isFormDirty = useMemo(() => {
    if (!isEditing || !selectedTendik || !editFormData) return false;
    return (
      editFormData.nama !== selectedTendik.nama ||
      editFormData.nip !== selectedTendik.nip ||
      editFormData.status !== selectedTendik.status ||
      editFormData.jabatan !== selectedTendik.jabatan ||
      (editFormData.pendidikanD3 || '') !== (selectedTendik.pendidikanD3 || '') ||
      (editFormData.pendidikanS1 || '') !== (selectedTendik.pendidikanS1 || '') ||
      (editFormData.pendidikanS2 || '') !== (selectedTendik.pendidikanS2 || '') ||
      (editFormData.pendidikanS3 || '') !== (selectedTendik.pendidikanS3 || '') ||
      JSON.stringify(editFormData.sertifikatKompetensi) !== JSON.stringify(selectedTendik.sertifikatKompetensi)
    );
  }, [isEditing, selectedTendik, editFormData]);

  // Filtered Tendik data
  const filteredTendik = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return tendikList;

    return tendikList.filter((item) => {
      return (
        item.nama.toLowerCase().includes(q) ||
        item.nip.includes(q) ||
        item.jabatan.toLowerCase().includes(q) ||
        (item.pendidikanD3 && item.pendidikanD3.toLowerCase().includes(q)) ||
        (item.pendidikanS1 && item.pendidikanS1.toLowerCase().includes(q)) ||
        (item.pendidikanS2 && item.pendidikanS2.toLowerCase().includes(q)) ||
        (item.pendidikanS3 && item.pendidikanS3.toLowerCase().includes(q)) ||
        item.sertifikatKompetensi.some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [tendikList, searchTerm]);

  const EMPTY_TENDIK: TenagaKependidikanItem = {
    id: '',
    nama: '',
    nip: '',
    status: 'Tetap',
    jabatan: '',
    pendidikanD3: '',
    pendidikanS1: '',
    pendidikanS2: '',
    pendidikanS3: '',
    sertifikatKompetensi: [],
  };

  const handleOpenCreate = () => {
    const fresh = { ...EMPTY_TENDIK };
    setSelectedTendik(null);
    setEditFormData(fresh);
    setIsEditing(true);
    setIsDetailOpen(true);
  };

  const handleOpenView = (item: TenagaKependidikanItem) => {
    setSelectedTendik(item);
    setEditFormData(JSON.parse(JSON.stringify(item)));
    setIsEditing(false);
    setIsDetailOpen(true);
  };

  const handleOpenEdit = (item: TenagaKependidikanItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedTendik(item);
    setEditFormData(JSON.parse(JSON.stringify(item)));
    setIsEditing(true);
    setIsDetailOpen(true);
  };

  const handleAddCertificate = () => {
    const trimmed = newCertInput.trim();
    if (!trimmed || !editFormData) return;
    if (editFormData.sertifikatKompetensi.includes(trimmed)) {
      setNewCertInput('');
      return;
    }
    setEditFormData({
      ...editFormData,
      sertifikatKompetensi: [...editFormData.sertifikatKompetensi, trimmed],
    });
    setNewCertInput('');
  };

  const handleRemoveCertificate = (index: number) => {
    if (!editFormData) return;
    setEditFormData({
      ...editFormData,
      sertifikatKompetensi: editFormData.sertifikatKompetensi.filter((_, i) => i !== index),
    });
  };

  const handleSaveEdit = (closeSheetAfter = false) => {
    if (!editFormData) return;
    if (!editFormData.id) {
      const newTendik: TenagaKependidikanItem = {
        ...editFormData,
        id: `tendik-${Date.now()}`,
      };
      setTendikList((prev) => [newTendik, ...prev]);
      setSelectedTendik(newTendik);
      toast({
        title: 'Tenaga Kependidikan Ditambahkan',
        description: `Data profil ${newTendik.nama || 'baru'} berhasil ditambahkan.`,
      });
    } else {
      setTendikList((prev) =>
        prev.map((item) => (item.id === editFormData.id ? editFormData : item))
      );
      setSelectedTendik(editFormData);
      toast({
        title: 'Perubahan Disimpan',
        description: `Data profil tenaga kependidikan ${editFormData.nama} berhasil diperbarui.`,
      });
    }
    setIsEditing(false);
    setShowUnsavedDialog(false);
    if (closeSheetAfter) {
      setIsDetailOpen(false);
    }
  };

  const handleRequestCancel = () => {
    if (isFormDirty) {
      setPendingCloseTarget('edit-mode');
      setShowUnsavedDialog(true);
    } else {
      if (selectedTendik) {
        setEditFormData(JSON.parse(JSON.stringify(selectedTendik)));
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
    if (selectedTendik) {
      setEditFormData(JSON.parse(JSON.stringify(selectedTendik)));
    }
    setIsEditing(false);
    setShowUnsavedDialog(false);
    if (pendingCloseTarget === 'sheet') {
      setIsDetailOpen(false);
    }
  };

  return (
    <div className="space-y-6 pb-14 font-sans selection:bg-primary/20 selection:text-primary">
      {/* Main Interactive Table Section */}
      <div className="glass-card rounded-2xl border border-border/70 bg-card shadow-soft overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-border/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h4 className="text-lg font-bold text-foreground flex items-center gap-2">
              Daftar Profil Tenaga Kependidikan
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                {filteredTendik.length} Tendik
              </span>
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Kelola profil, jabatan, kualifikasi pendidikan, dan sertifikasi kompetensi tenaga kependidikan
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari tenaga kependidikan, NIP/NITK/NIDK, jabatan..."
                className="pl-9 pr-8 bg-background/50 rounded-xl border-border/70 text-xs focus:ring-1 focus:ring-primary transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <Button
              type="button"
              size="sm"
              onClick={handleOpenCreate}
              className="rounded-xl text-xs font-semibold h-9 px-3.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Tendik</span>
            </Button>
          </div>
        </div>

        {/* Desktop Matrix Table (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="border-b border-border/40 bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-2 text-center w-10">No</th>
                <th className="py-3 px-3">Nama Tendik</th>
                <th className="py-3 px-2 text-center w-24">Status</th>
                <th className="py-3 px-3">Jabatan</th>
                <th className="py-3 px-3">Pendidikan Ditempuh</th>
                <th className="py-3 px-3">Sertifikat Kompetensi</th>
                <th className="py-3 px-2 text-center w-14">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 text-sm">
              {filteredTendik.length > 0 ? (
                filteredTendik.map((tendik, index) => {
                  const rawDegrees = [
                    tendik.pendidikanD3 && tendik.pendidikanD3 !== '-' ? tendik.pendidikanD3 : null,
                    tendik.pendidikanS1 && tendik.pendidikanS1 !== '-' ? tendik.pendidikanS1 : null,
                    tendik.pendidikanS2 && tendik.pendidikanS2 !== '-' ? tendik.pendidikanS2 : null,
                    tendik.pendidikanS3 && tendik.pendidikanS3 !== '-' ? tendik.pendidikanS3 : null,
                  ].filter(Boolean) as string[];

                  const activeDegrees = [...rawDegrees].reverse();
                  const displayedDegrees = activeDegrees.slice(0, 2);
                  const remainingDegreesCount = activeDegrees.length - displayedDegrees.length;

                  const displayedCerts = (tendik.sertifikatKompetensi || []).slice(0, 2);
                  const remainingCertsCount = (tendik.sertifikatKompetensi || []).length - displayedCerts.length;

                  return (
                    <tr
                      key={tendik.id}
                      onClick={() => handleOpenView(tendik)}
                      className="hover:bg-muted/10 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-2 text-center text-muted-foreground font-medium text-xs">
                        {index + 1}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {tendik.nama ? tendik.nama.charAt(0) : 'T'}
                          </div>
                          <div>
                            <span className="font-semibold text-foreground block text-xs leading-snug group-hover:text-primary transition-colors">
                              {tendik.nama}
                            </span>
                            <span className="text-[11px] font-mono text-muted-foreground block mt-0.5">
                              NIP/NIDN: {tendik.nip}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${tendik.status === 'Tetap'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          }`}>
                          {tendik.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground font-medium text-xs leading-snug">
                        {tendik.jabatan}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-0.5 text-xs">
                          {activeDegrees.length > 0 ? (
                            <>
                              {displayedDegrees.map((deg, i) => (
                                <span key={i} className="text-foreground/90 font-normal leading-snug">
                                  &bull; {deg}
                                </span>
                              ))}
                              {remainingDegreesCount > 0 && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="inline-flex items-center text-[10px] font-semibold text-primary hover:underline cursor-pointer mt-0.5 w-fit">
                                        +{remainingDegreesCount} data lainnya
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-xs text-xs space-y-1 p-2.5">
                                      <p className="font-semibold text-[11px] text-foreground mb-1">Riwayat Pendidikan Lengkap:</p>
                                      {activeDegrees.map((deg, idx) => (
                                        <div key={idx} className="text-[11px] text-muted-foreground">&bull; {deg}</div>
                                      ))}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </>
                          ) : (
                            <span className="text-muted-foreground italic">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap items-center gap-1">
                          {tendik.sertifikatKompetensi.length > 0 ? (
                            <>
                              {displayedCerts.map((cert, i) => (
                                <span
                                  key={i}
                                  className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 leading-tight"
                                >
                                  {cert}
                                </span>
                              ))}
                              {remainingCertsCount > 0 && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-muted/80 text-muted-foreground hover:text-foreground border border-border/50 cursor-pointer">
                                        +{remainingCertsCount} data lainnya
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-xs text-xs space-y-1 p-2.5">
                                      <p className="font-semibold text-[11px] text-foreground mb-1">Sertifikat Kompetensi Lainnya:</p>
                                      {tendik.sertifikatKompetensi.slice(2).map((cert, idx) => (
                                        <div key={idx} className="text-[11px] text-muted-foreground">&bull; {cert}</div>
                                      ))}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </>
                          ) : (
                            <span className="text-muted-foreground text-xs italic">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleOpenEdit(tendik, e)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all"
                          title="Edit Data Tenaga Kependidikan"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-muted-foreground text-xs">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground">
                        <Users className="w-6 h-6 opacity-60" />
                      </div>
                      <p className="font-semibold text-foreground text-sm mt-1">Belum Ada Data Tenaga Kependidikan</p>
                      <p className="text-xs text-muted-foreground">
                        {searchTerm 
                          ? `Tidak ada data tenaga kependidikan yang sesuai dengan pencarian "${searchTerm}".`
                          : 'Belum ada data tenaga kependidikan terdaftar. Klik tombol di bawah untuk menambah data pertama.'}
                      </p>
                      {!searchTerm && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleOpenCreate}
                          className="mt-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          <Plus className="w-4 h-4 mr-1.5" />
                          Tambah Tenaga Kependidikan
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Vertical Card Stack (< md) */}
        <div className="block md:hidden divide-y divide-border/40">
          {filteredTendik.length > 0 ? (
            filteredTendik.map((tendik) => {
              const rawDegrees = [
                tendik.pendidikanD3 && tendik.pendidikanD3 !== '-' ? tendik.pendidikanD3 : null,
                tendik.pendidikanS1 && tendik.pendidikanS1 !== '-' ? tendik.pendidikanS1 : null,
                tendik.pendidikanS2 && tendik.pendidikanS2 !== '-' ? tendik.pendidikanS2 : null,
                tendik.pendidikanS3 && tendik.pendidikanS3 !== '-' ? tendik.pendidikanS3 : null,
              ].filter(Boolean) as string[];

              return (
                <div
                  key={tendik.id}
                  onClick={() => handleOpenView(tendik)}
                  className="p-4 space-y-3 active:bg-muted/15 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20">
                        {tendik.nama ? tendik.nama.charAt(0) : 'T'}
                      </div>
                      <div>
                        <h5 className="font-semibold text-foreground text-sm leading-snug">
                          {tendik.nama}
                        </h5>
                        <p className="text-xs font-mono text-muted-foreground mt-0.5">
                          NIP: {tendik.nip}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${
                      tendik.status === 'Tetap' 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}>
                      {tendik.status}
                    </span>
                  </div>

                  <div className="rounded-xl bg-muted/20 p-2.5 space-y-1.5 text-xs border border-border/30">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="font-medium">Jabatan:</span>
                      <span className="text-foreground font-semibold text-right">{tendik.jabatan}</span>
                    </div>
                    {rawDegrees.length > 0 && (
                      <div className="flex items-start justify-between text-muted-foreground pt-1 border-t border-border/20">
                        <span className="font-medium shrink-0">Pendidikan:</span>
                        <span className="text-foreground text-right truncate max-w-[200px]">
                          {rawDegrees[rawDegrees.length - 1]}
                        </span>
                      </div>
                    )}
                    {tendik.sertifikatKompetensi.length > 0 && (
                      <div className="flex items-center justify-between text-muted-foreground pt-1 border-t border-border/20">
                        <span className="font-medium">Sertifikat:</span>
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          {tendik.sertifikatKompetensi.length} Sertifikat
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenView(tendik);
                      }}
                      className="touch-target-sm rounded-xl text-xs font-medium h-9 px-3"
                    >
                      Buka Detail
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(tendik, e);
                      }}
                      className="touch-target-sm rounded-xl text-xs font-semibold h-9 px-3.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20"
                    >
                      <Pencil className="w-3.5 h-3.5 mr-1.5" />
                      Edit Profil
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-muted-foreground text-xs">
              <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground">
                  <Users className="w-6 h-6 opacity-60" />
                </div>
                <p className="font-semibold text-foreground text-sm mt-1">Belum Ada Data Tendik</p>
                <p className="text-xs text-muted-foreground">
                  {searchTerm 
                    ? `Tidak ada data tenaga kependidikan yang sesuai dengan pencarian "${searchTerm}".`
                    : 'Belum ada data tenaga kependidikan terdaftar.'}
                </p>
                {!searchTerm && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleOpenCreate}
                    className="mt-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Tambah Tenaga Kependidikan
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Side Sheet View / Edit Mode */}
      <Sheet open={isDetailOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent className="sm:max-w-lg overflow-y-auto bg-card/95 backdrop-blur-xl border-l border-border/40 text-foreground flex flex-col justify-between">
          <div>
            <SheetHeader className="pb-5 border-b border-border/30">
              <div className="flex items-center justify-between pr-6">
                <SheetTitle className="text-xl font-bold text-foreground">
                  {isEditing ? 'Edit Profil Tenaga Kependidikan' : 'Detail Profil Tenaga Kependidikan'}
                </SheetTitle>

                {/* Animated Header Button */}
                <AnimatePresence mode="wait" initial={false}>
                  {!isEditing && selectedTendik ? (
                    <motion.button
                      key="btn-edit-action"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.16 }}
                      onClick={() => {
                        setEditFormData(JSON.parse(JSON.stringify(selectedTendik)));
                        setIsEditing(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 transition-all shadow-sm"
                      title="Edit Profil"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit Profil</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      key="btn-cancel-action"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.16 }}
                      onClick={handleRequestCancel}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/30 transition-all shadow-sm"
                      title="Batalkan Edit"
                    >
                      <X className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Batal</span>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
              <SheetDescription className="text-muted-foreground text-xs">
                {isEditing
                  ? 'Sesuaikan informasi kepegawaian, kualifikasi pendidikan, dan sertifikasi kompetensi.'
                  : 'Informasi lengkap dan kualifikasi tenaga kependidikan.'}
              </SheetDescription>
            </SheetHeader>

            {/* ANIMATED VIEW / EDIT MODE TRANSITION */}
            <AnimatePresence mode="wait" initial={false}>
              {/* VIEW MODE */}
              {!isEditing && selectedTendik ? (
                <motion.div
                  key="view-mode"
                  variants={contentVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-6 pt-6"
                >
                  {/* Header profile info */}
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/30">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground leading-snug text-base">{selectedTendik.nama}</h4>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">NIP/NITK: {selectedTendik.nip}</p>
                    </div>
                  </div>

                  {/* Section 1: Profil Status Kepegawaian */}
                  <div className="space-y-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-primary/80">
                      Profil Status Kepegawaian
                    </h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Status Tendik</p>
                        <div>
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${selectedTendik.status === 'Tetap'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            }`}>
                            {selectedTendik.status}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1 col-span-2">
                        <p className="text-xs text-muted-foreground">Jabatan (termasuk Golongan)</p>
                        <p className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
                          <Award className="w-4 h-4 text-amber-500 shrink-0" />
                          {selectedTendik.jabatan}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Kualifikasi Pendidikan */}
                  <div className="space-y-4 pt-4 border-t border-border/30">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-primary/80">
                      Kualifikasi Pendidikan
                    </h5>

                    <div className="space-y-2.5 text-xs">
                      {/* D3 */}
                      <div className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-muted/20 border border-border/30">
                        <span className="font-medium text-muted-foreground w-32 shrink-0">Diploma 3 (D3)</span>
                        <span className="font-semibold text-foreground text-right">
                          {selectedTendik.pendidikanD3 && selectedTendik.pendidikanD3 !== '-' ? selectedTendik.pendidikanD3 : <span className="text-muted-foreground font-normal italic">-</span>}
                        </span>
                      </div>

                      {/* S1 / D4 */}
                      <div className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-muted/20 border border-border/30">
                        <span className="font-medium text-muted-foreground w-32 shrink-0">Sarjana / Terapan (S1/D4)</span>
                        <span className="font-semibold text-foreground text-right">
                          {selectedTendik.pendidikanS1 && selectedTendik.pendidikanS1 !== '-' ? selectedTendik.pendidikanS1 : <span className="text-muted-foreground font-normal italic">-</span>}
                        </span>
                      </div>

                      {/* S2 / S2 Terapan */}
                      <div className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-muted/20 border border-border/30">
                        <span className="font-medium text-muted-foreground w-32 shrink-0">Magister / Terapan (S2)</span>
                        <span className="font-semibold text-foreground text-right">
                          {selectedTendik.pendidikanS2 && selectedTendik.pendidikanS2 !== '-' ? selectedTendik.pendidikanS2 : <span className="text-muted-foreground font-normal italic">-</span>}
                        </span>
                      </div>

                      {/* S3 */}
                      <div className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-muted/20 border border-border/30">
                        <span className="font-medium text-muted-foreground w-32 shrink-0">Doktor (S3)</span>
                        <span className="font-semibold text-foreground text-right">
                          {selectedTendik.pendidikanS3 && selectedTendik.pendidikanS3 !== '-' ? selectedTendik.pendidikanS3 : <span className="text-muted-foreground font-normal italic">-</span>}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Sertifikat Kompetensi */}
                  <div className="space-y-4 pt-4 border-t border-border/30">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-primary/80">
                      Sertifikat Kompetensi
                    </h5>

                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {selectedTendik.sertifikatKompetensi.length > 0 ? (
                        selectedTendik.sertifikatKompetensi.map((cert, idx) => (
                          <span
                            key={idx}
                            className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          >
                            {cert}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Belum ada sertifikat kompetensi terdaftar</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : isEditing && editFormData ? (
                /* EDIT MODE FORM */
                <motion.div
                  key="edit-mode"
                  variants={contentVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-6 pt-6 text-sm"
                >
                  {/* Basic Identity Inputs */}
                  <div className="p-4 rounded-2xl bg-muted/20 border border-border/40 space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">
                        Nama Tenaga Kependidikan Beserta Gelar
                      </label>
                      <Input
                        value={editFormData.nama}
                        onChange={(e) => setEditFormData({ ...editFormData, nama: e.target.value })}
                        placeholder="Contoh: Agus Setiawan, A.Md.Kom."
                        className="bg-background rounded-xl text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">
                        NIDN / NIDK / NIP / NITK
                      </label>
                      <Input
                        value={editFormData.nip}
                        onChange={(e) => setEditFormData({ ...editFormData, nip: e.target.value })}
                        placeholder="Contoh: 198805122014041001"
                        className="bg-background rounded-xl font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* Section 1: Profil Status Kepegawaian (Edit) */}
                  <div className="space-y-4 pt-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-primary/80">
                      Profil Status Kepegawaian
                    </h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5 col-span-2 sm:col-span-1">
                        <label className="text-xs font-medium text-muted-foreground">Status Tendik</label>
                        <select
                          value={editFormData.status}
                          onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as 'Tetap' | 'Tidak Tetap' })}
                          className="w-full h-10 px-3 text-xs bg-background border border-border/70 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                        >
                          <option value="Tetap">Tetap</option>
                          <option value="Tidak Tetap">Tidak Tetap</option>
                        </select>
                      </div>

                      <div className="space-y-1.5 col-span-2">
                        <label className="text-xs font-medium text-muted-foreground">
                          Jabatan (termasuk Golongan)
                        </label>
                        <Input
                          value={editFormData.jabatan}
                          onChange={(e) => setEditFormData({ ...editFormData, jabatan: e.target.value })}
                          placeholder="Contoh: Teknisi Lab Gol. III/b, Arsiparis Ahli Muda Gol. III/c"
                          className="bg-background rounded-xl text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Kualifikasi Pendidikan (Edit) */}
                  <div className="space-y-4 pt-4 border-t border-border/30">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-primary/80">
                      Pendidikan Ditempuh
                    </h5>

                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                          Diploma 3 (D3)
                        </label>
                        <Input
                          value={editFormData.pendidikanD3 || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, pendidikanD3: e.target.value })}
                          placeholder="Contoh: D3 Teknik Telekomunikasi atau '-' jika tidak ada"
                          className="bg-background rounded-xl text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                          Sarjana / Sarjana Terapan (S1 / D4)
                        </label>
                        <Input
                          value={editFormData.pendidikanS1 || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, pendidikanS1: e.target.value })}
                          placeholder="Contoh: S1 Sistem Informasi atau '-' jika tidak ada"
                          className="bg-background rounded-xl text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                          Magister / Magister Terapan (S2 / S2 Terapan)
                        </label>
                        <Input
                          value={editFormData.pendidikanS2 || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, pendidikanS2: e.target.value })}
                          placeholder="Contoh: S2 Manajemen Sumber Daya Manusia atau '-' jika tidak ada"
                          className="bg-background rounded-xl text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                          Doktor (S3)
                        </label>
                        <Input
                          value={editFormData.pendidikanS3 || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, pendidikanS3: e.target.value })}
                          placeholder="Contoh: Doktor Ilmu Komputer atau '-' jika tidak ada"
                          className="bg-background rounded-xl text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Sertifikat Kompetensi (Edit with Multi-tag manager) */}
                  <div className="space-y-4 pt-4 border-t border-border/30">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-primary/80">
                      Sertifikat Kompetensi
                    </h5>

                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          value={newCertInput}
                          onChange={(e) => setNewCertInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCertificate();
                            }
                          }}
                          placeholder="Ketik nama sertifikat dan tekan Enter..."
                          className="bg-background rounded-xl text-xs"
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleAddCertificate}
                          className="rounded-xl px-3 bg-primary text-primary-foreground shrink-0 text-xs flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tambah</span>
                        </Button>
                      </div>

                      {/* Active Tag Badges */}
                      <div className="flex flex-wrap gap-1.5 pt-1 min-h-[36px] p-2 rounded-xl bg-muted/20 border border-border/30">
                        {editFormData.sertifikatKompetensi.length > 0 ? (
                          editFormData.sertifikatKompetensi.map((cert, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/15 text-purple-300 border border-purple-500/30"
                            >
                              <span>{cert}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveCertificate(index)}
                                className="hover:text-rose-400 p-0.5 rounded-full hover:bg-rose-500/10 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground italic self-center">
                            Belum ada sertifikat ditambahkan
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Footer Actions (Only in Edit Mode: Simpan Perubahan Button) */}
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
                  Simpan Perubahan
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
              Terdapat perubahan pada data profil tenaga kependidikan yang belum disimpan. Apakah Anda ingin menyimpan perubahan tersebut atau membuangnya?
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
