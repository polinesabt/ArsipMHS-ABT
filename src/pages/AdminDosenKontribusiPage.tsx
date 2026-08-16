import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpenText,
  BookOpen,
  Users,
  Search,
  Award,
  GraduationCap,
  ChevronDown,
  Library,
  FileText,
  Sparkles,
  X,
  ChevronsUpDown,
  ChevronsDownUp,
  Pencil,
  Trash2,
  Plus,
  Save,
  AlertCircle
} from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { useDosen } from '@/contexts/DosenContext';
import {
  type KontribusiDosenItem,
  getDosenOverallAvgNum,
  getDosenOverallAvgStr
} from '@/data/mockKontribusiDosenData';

export default function AdminDosenKontribusiPage() {
  const { toast } = useToast();
  const { kontribusiPengajaranList: dosenList, updateKontribusiPengajaran } = useDosen();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNidns, setExpandedNidns] = useState<Set<string>>(new Set());

  // State: Slide-over Edit Sidebar
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editingDosen, setEditingDosen] = useState<KontribusiDosenItem | null>(null);
  const [formData, setFormData] = useState<KontribusiDosenItem | null>(null);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  // Toggle individual card expansion
  const toggleCard = (nidn: string) => {
    setExpandedNidns((prev) => {
      const next = new Set(prev);
      if (next.has(nidn)) {
        next.delete(nidn);
      } else {
        next.add(nidn);
      }
      return next;
    });
  };

  // Open Edit Sidebar Modal
  const openEditModal = (dosen: KontribusiDosenItem) => {
    setEditingDosen(dosen);
    // Deep clone to prevent direct state mutation
    setFormData(JSON.parse(JSON.stringify(dosen)));
    setIsEditSheetOpen(true);
  };

  // Check if form is dirty (has unsaved modifications)
  const isDirty = useMemo(() => {
    if (!formData || !editingDosen) return false;
    return JSON.stringify(formData) !== JSON.stringify(editingDosen);
  }, [formData, editingDosen]);

  // Handle Sheet Open Change with Unsaved Warning
  const handleSheetOpenChange = (open: boolean) => {
    if (!open) {
      if (isDirty) {
        setShowUnsavedDialog(true);
        return;
      }
      setIsEditSheetOpen(false);
      setEditingDosen(null);
      setFormData(null);
    } else {
      setIsEditSheetOpen(true);
    }
  };

  // Discard changes and close sheet
  const handleDiscardChanges = () => {
    setIsEditSheetOpen(false);
    setEditingDosen(null);
    setFormData(null);
    setShowUnsavedDialog(false);
  };

  // Form Handlers: Matkul ABT
  const handleAddMatkulABT = () => {
    if (!formData) return;
    const newId = `abt-custom-${Date.now()}`;
    setFormData({
      ...formData,
      matkulABT: [...formData.matkulABT, { id: newId, nama: '', sks: 3 }],
    });
  };

  const handleUpdateMatkulABT = (id: string, field: 'nama' | 'sks', val: string | number) => {
    if (!formData) return;
    setFormData({
      ...formData,
      matkulABT: formData.matkulABT.map((mk) =>
        mk.id === id ? { ...mk, [field]: val } : mk
      ),
    });
  };

  const handleDeleteMatkulABT = (id: string) => {
    if (!formData) return;
    setFormData({
      ...formData,
      matkulABT: formData.matkulABT.filter((mk) => mk.id !== id),
    });
  };

  // Form Handlers: Matkul PS Lain
  const handleAddMatkulPSLain = () => {
    if (!formData) return;
    const newId = `psl-custom-${Date.now()}`;
    setFormData({
      ...formData,
      matkulPSLain: [
        ...formData.matkulPSLain,
        { id: newId, nama: '', prodi: 'D4 Akuntansi Manajerial', sks: 3 },
      ],
    });
  };

  const handleUpdateMatkulPSLain = (
    id: string,
    field: 'nama' | 'prodi' | 'sks',
    val: string | number
  ) => {
    if (!formData) return;
    setFormData({
      ...formData,
      matkulPSLain: formData.matkulPSLain.map((mk) =>
        mk.id === id ? { ...mk, [field]: val } : mk
      ),
    });
  };

  const handleDeleteMatkulPSLain = (id: string) => {
    if (!formData) return;
    setFormData({
      ...formData,
      matkulPSLain: formData.matkulPSLain.filter((mk) => mk.id !== id),
    });
  };

  // Form Handlers: Bahan Ajar
  const handleAddBahanAjar = () => {
    if (!formData) return;
    setFormData({
      ...formData,
      bahanAjar: [...formData.bahanAjar, ''],
    });
  };

  const handleUpdateBahanAjar = (index: number, val: string) => {
    if (!formData) return;
    const updated = [...formData.bahanAjar];
    updated[index] = val;
    setFormData({
      ...formData,
      bahanAjar: updated,
    });
  };

  const handleDeleteBahanAjar = (index: number) => {
    if (!formData) return;
    setFormData({
      ...formData,
      bahanAjar: formData.bahanAjar.filter((_, i) => i !== index),
    });
  };

  // Form Handlers: Rekognisi (Multiple Dynamic List)
  const handleAddRekognisi = () => {
    if (!formData) return;
    setFormData({
      ...formData,
      rekognisi: [...formData.rekognisi, ''],
    });
  };

  const handleUpdateRekognisi = (index: number, val: string) => {
    if (!formData) return;
    const updated = [...formData.rekognisi];
    updated[index] = val;
    setFormData({
      ...formData,
      rekognisi: updated,
    });
  };

  const handleDeleteRekognisi = (index: number) => {
    if (!formData) return;
    setFormData({
      ...formData,
      rekognisi: formData.rekognisi.filter((_, i) => i !== index),
    });
  };

  // Form Handlers: Bimbingan Mahasiswa
  const handleUpdateBimbingan = (
    psType: 'psABT' | 'psLain',
    field: 'ps' | 'ps1' | 'ps2',
    val: number
  ) => {
    if (!formData) return;
    setFormData({
      ...formData,
      bimbingan: {
        ...formData.bimbingan,
        [psType]: {
          ...formData.bimbingan[psType],
          [field]: Math.max(0, val),
        },
      },
    });
  };

  // Save changes to state and toast
  const handleSave = () => {
    if (!formData) return;

    // Clean up blank rows
    const cleanedABT = formData.matkulABT.filter((mk) => mk.nama.trim() !== '');
    const cleanedPSLain = formData.matkulPSLain.filter((mk) => mk.nama.trim() !== '');
    const cleanedBahanAjar = formData.bahanAjar.filter((b) => b.trim() !== '');
    const cleanedRekognisi = formData.rekognisi.filter((r) => r.trim() !== '');

    const finalData: KontribusiDosenItem = {
      ...formData,
      matkulABT: cleanedABT,
      matkulPSLain: cleanedPSLain,
      bahanAjar: cleanedBahanAjar,
      rekognisi: cleanedRekognisi,
      rataBimbingan: getDosenOverallAvgNum(formData),
    };

    updateKontribusiPengajaran(finalData.nidn, finalData);

    setIsEditSheetOpen(false);
    setEditingDosen(null);
    setFormData(null);
    setShowUnsavedDialog(false);

    toast({
      title: 'Data Berhasil Diperbarui',
      description: `Kontribusi intelektual untuk ${finalData.nama} telah tersimpan.`,
    });
  };

  // Universal Search across multiple fields
  const filteredData = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return dosenList;

    return dosenList.filter((dosen) => {
      // Check Nama & NIDN
      if (dosen.nama.toLowerCase().includes(q) || dosen.nidn.includes(q)) return true;

      // Check Rekognisi list
      const matchRekognisi = dosen.rekognisi.some((r) => r.toLowerCase().includes(q));
      if (matchRekognisi) return true;

      // Check Matkul ABT
      const matchMatkulABT = dosen.matkulABT.some((mk) =>
        mk.nama.toLowerCase().includes(q)
      );
      if (matchMatkulABT) return true;

      // Check Matkul PS Lain
      const matchMatkulLain = dosen.matkulPSLain.some(
        (mk) =>
          mk.nama.toLowerCase().includes(q) ||
          mk.prodi.toLowerCase().includes(q)
      );
      if (matchMatkulLain) return true;

      // Check Bahan Ajar
      const matchBahanAjar = dosen.bahanAjar.some((ba) => ba.toLowerCase().includes(q));
      if (matchBahanAjar) return true;

      return false;
    });
  }, [dosenList, searchTerm]);

  // Check if all filtered cards are expanded
  const isAllExpanded = useMemo(() => {
    return (
      filteredData.length > 0 &&
      filteredData.every((d) => expandedNidns.has(d.nidn))
    );
  }, [filteredData, expandedNidns]);

  // Single toggle function for Expand All / Collapse All
  const handleToggleAll = () => {
    if (isAllExpanded) {
      setExpandedNidns(new Set());
    } else {
      setExpandedNidns(new Set(filteredData.map((d) => d.nidn)));
    }
  };

  // Helper function to calculate row average: (PS + PS-1 + PS-2) / 3
  const calcRowAvg = (ps: number, ps1: number, ps2: number): string => {
    const val = (ps + ps1 + ps2) / 3;
    return Number.isInteger(val) ? val.toString() : val.toFixed(1);
  };

  return (
    <div className="space-y-6 pb-14 font-sans selection:bg-primary/20 selection:text-primary">
      {/* MAIN TOOLBAR & CONTROLS */}
      <div className="glass-card rounded-2xl p-5 border border-border/70 bg-card shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">Kontribusi Intelektual Dosen ABT</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                {filteredData.length} Dosen
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Rincian mata kuliah diampu pada Program Studi yang Diakreditasi (ABT) & PS Lain, bahan ajar diterbitkan, bimbingan mahasiswa, dan rekognisi keahlian.
            </p>
          </div>

          {/* Universal Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama, NIDN/NIDK, matkul, buku, rekognisi..."
              className="pl-9 pr-8 h-10 bg-background rounded-xl border-border/70 text-xs focus:ring-1 focus:ring-primary transition-colors"
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
        </div>
      </div>

      {/* 3. CARD LIST HEADER WITH SINGLE EXPAND/COLLAPSE ICON */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
          <span>
            Menampilkan <strong className="text-foreground">{filteredData.length}</strong> dari <strong className="text-foreground">{dosenList.length}</strong> Dosen
          </span>
        </div>

        {/* Single Expand & Collapse Icon Button */}
        <button
          type="button"
          onClick={handleToggleAll}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card hover:bg-muted border border-border/70 text-xs font-semibold text-foreground shadow-xs hover:border-primary/40 transition-colors"
          title={isAllExpanded ? 'Tutup Semua Dosen' : 'Buka Semua Dosen'}
        >
          {isAllExpanded ? (
            <>
              <ChevronsDownUp className="w-4 h-4 text-primary" />
              <span>Tutup Semua</span>
            </>
          ) : (
            <>
              <ChevronsUpDown className="w-4 h-4 text-primary" />
              <span>Buka Semua</span>
            </>
          )}
        </button>
      </div>

      {/* 4. INTERACTIVE COLLAPSIBLE CARD LIST (Native Crisp DOM Rendering) */}
      <div className="space-y-3.5">
        {filteredData.length > 0 ? (
          filteredData.map((dosen, index) => {
            const isExpanded = expandedNidns.has(dosen.nidn);
            const initial =
              dosen.nama
                .replace(
                  /(Dr\.|Ir\.|Prof\.|S\.E\.|M\.M\.|M\.T\.|M\.B\.A\.|M\.Kom\.|M\.Si\.|Ph\.D\.|,|\.)/g,
                  ''
                )
                .trim()
                .charAt(0) || 'D';

            // Preview chips: strictly first 2 courses when collapsed for 1-line symmetry
            const previewChips = dosen.matkulABT.slice(0, 2);
            const remainingCount = dosen.matkulABT.length - 2;

            return (
              <div
                key={dosen.nidn}
                className={`glass-card rounded-2xl border transition-all duration-200 overflow-hidden shadow-soft ${isExpanded
                    ? 'border-primary/60 bg-card ring-1 ring-primary/20'
                    : 'border-border/70 bg-card hover:border-border/90'
                  }`}
              >
                {/* TOP HEADER / SUMMARY ROW (Always Clickable) */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleCard(dosen.nidn)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleCard(dosen.nidn);
                    }
                  }}
                  className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  {/* Left: Avatar & Dosen Info (Fixed Width & Vertical Divider on Large Screens for Crisp Column Alignment) */}
                  <div className="flex items-center gap-3.5 w-full lg:w-72 xl:w-80 shrink-0 lg:pr-4 lg:border-r lg:border-border/60">
                    <div
                      className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${dosen.avatarColor} text-white font-bold text-base flex items-center justify-center shadow-md shadow-primary/10 shrink-0`}
                    >
                      {initial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/60 shrink-0">
                          #{index + 1}
                        </span>
                        <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors leading-tight truncate" title={dosen.nama}>
                          {dosen.nama}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono text-muted-foreground truncate">
                          NIDN/NIDK: {dosen.nidn}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Matkul Preview Chips (Aligned Column, Auto Sizing & Smooth Crossfade) */}
                  <div className="flex-1 min-w-0 flex items-center lg:px-4 min-h-[36px]">
                    <AnimatePresence mode="wait" initial={false}>
                      {!isExpanded ? (
                        <motion.div
                          key="collapsed-matkul-chips"
                          initial={{ opacity: 0, y: -3 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 3 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                          className="flex flex-wrap items-center gap-2"
                        >
                          {previewChips.map((mk) => (
                            <span
                              key={mk.id}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 shadow-xs max-w-[180px] sm:max-w-[220px] xl:max-w-[260px]"
                              title={mk.nama}
                            >
                              <BookOpen className="w-3 h-3 text-primary/70 shrink-0" />
                              <span className="truncate">{mk.nama}</span>
                            </span>
                          ))}

                          {/* +X Lainnya Overflow Chip */}
                          {remainingCount > 0 && (
                            <span
                              className="inline-flex items-center px-2 py-1 rounded-lg text-[11px] font-semibold bg-muted text-muted-foreground border border-border/60 whitespace-nowrap shrink-0"
                            >
                              +{remainingCount} matkul lainnya
                            </span>
                          )}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="expanded-matkul-hint"
                          initial={{ opacity: 0, y: -3 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 3 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                          className="flex items-center gap-1.5 text-xs text-primary font-medium"
                        >
                          <Sparkles className="w-3.5 h-3.5 shrink-0" />
                          <span>Detail kontribusi akademik aktif</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Right: Quick Metric Badges, Edit Button, & Top Chevron Toggle */}
                  <div className="flex items-center gap-2.5 self-end lg:self-center flex-shrink-0">
                    {/* Badge 1: Matkul PS ABT */}
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-semibold whitespace-nowrap"
                      title="Jumlah mata kuliah diampu pada PS ABT"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>{dosen.matkulABT.length} Matkul PS ABT</span>
                    </div>

                    {/* Badge 2: Matkul PS Lain */}
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-xs font-semibold whitespace-nowrap"
                      title="Jumlah mata kuliah diampu pada PS Lain"
                    >
                      <Library className="w-3 h-3" />
                      <span>{dosen.matkulPSLain.length} Matkul PS Lain</span>
                    </div>

                    {/* Badge 3: Bahan Ajar */}
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold whitespace-nowrap"
                      title="Jumlah bahan ajar yang diterbitkan"
                    >
                      <BookOpenText className="w-3 h-3" />
                      <span>{dosen.bahanAjar.length} Bahan Ajar</span>
                    </div>

                    {/* Quick Pencil Edit Button on Closed Card */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(dosen);
                      }}
                      className="w-8 h-8 rounded-xl bg-card hover:bg-primary/15 text-muted-foreground hover:text-primary border border-border/70 hover:border-primary/40 flex items-center justify-center transition-colors shadow-xs"
                      title={`Edit data kontribusi ${dosen.nama}`}
                      aria-label="Edit data dosen"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {/* Top Chevron Rotating Button */}
                    <div
                      className={`w-8 h-8 rounded-xl bg-muted border border-border/70 flex items-center justify-center text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-primary/10 text-primary border-primary/20' : ''
                        }`}
                      title={isExpanded ? 'Tutup Detail' : 'Buka Detail'}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* EXPANDED DETAIL CONTENT (ANIMATED WITH FRAMER MOTION) */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key={`content-${dosen.nidn}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden border-t border-border/60 bg-muted/20"
                    >
                      {/* 2-Column Detail Layout */}
                      <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* ==================================================== */}
                        {/* KOLOM KIRI: PENGAJARAN & BAHAN AJAR (7 / 12 COLS)    */}
                        {/* ==================================================== */}
                        <div className="lg:col-span-7 space-y-5">
                          {/* 1. Mata Kuliah pada Program Studi yang Diakreditasi (ABT) */}
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                                <BookOpen className="w-4 h-4 text-primary" />
                                <span>Mata Kuliah pada Program Studi yang Diakreditasi (ABT)</span>
                              </div>
                              <span className="text-[11px] font-mono text-muted-foreground">
                                {dosen.matkulABT.length} Mata Kuliah
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {dosen.matkulABT.map((mk) => (
                                <div
                                  key={mk.id}
                                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/25 text-primary text-xs font-medium shadow-xs"
                                >
                                  <BookOpen className="w-3.5 h-3.5 text-primary/70" />
                                  <span>{mk.nama}</span>
                                  {mk.sks && (
                                    <span className="text-[10px] opacity-75 font-semibold">
                                      ({mk.sks} SKS)
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 2. Mata Kuliah PS Lain (With SKS displayed) */}
                          <div className="space-y-2.5 pt-2 border-t border-border/60">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                                <Library className="w-4 h-4 text-cyan-500" />
                                <span>Mata Kuliah pada Program Studi Lain</span>
                              </div>
                              <span className="text-[11px] font-mono text-muted-foreground">
                                {dosen.matkulPSLain.length} Mata Kuliah
                              </span>
                            </div>

                            {dosen.matkulPSLain.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {dosen.matkulPSLain.map((mk) => (
                                  <div
                                    key={mk.id}
                                    className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-xs font-medium"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <Library className="w-3.5 h-3.5 text-cyan-500/70" />
                                      <span>{mk.nama}</span>
                                      {mk.sks && (
                                        <span className="text-[10px] opacity-75 font-semibold">
                                          ({mk.sks} SKS)
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 font-semibold border border-cyan-500/30">
                                      {mk.prodi}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-3 rounded-xl bg-muted/30 border border-border/60 text-xs text-muted-foreground italic flex items-center gap-2">
                                <span>- Tidak mengampu mata kuliah di luar program studi ABT.</span>
                              </div>
                            )}
                          </div>

                          {/* 3. Daftar Judul Bahan Ajar */}
                          <div className="space-y-2.5 pt-2 border-t border-border/60">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                                <FileText className="w-4 h-4 text-indigo-500" />
                                <span>Daftar Judul Bahan Ajar (Buku & Modul)</span>
                              </div>
                              <span className="text-[11px] font-mono text-muted-foreground">
                                {dosen.bahanAjar.length} Diterbitkan
                              </span>
                            </div>

                            <div className="space-y-2">
                              {dosen.bahanAjar.map((item, baIdx) => (
                                <div
                                  key={baIdx}
                                  className="p-3 rounded-xl bg-card border border-border/70 hover:border-primary/40 transition-colors flex items-start gap-3 shadow-xs"
                                >
                                  <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                                    {baIdx + 1}
                                  </div>
                                  <div className="text-xs text-foreground font-medium leading-relaxed">
                                    {item}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* ==================================================== */}
                        {/* KOLOM KANAN: BIMBINGAN & REKOGNISI (5 / 12 COLS)     */}
                        {/* ==================================================== */}
                        <div className="lg:col-span-5 space-y-5">
                          {/* 1. Tabel Bimbingan Mahasiswa */}
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                                <Users className="w-4 h-4 text-emerald-500" />
                                <span>Tabel Bimbingan Mahasiswa</span>
                              </div>
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                Rata-rata: {getDosenOverallAvgStr(dosen)} Mahasiswa bimbingan
                              </span>
                            </div>

                            <div className="rounded-xl border border-border/70 overflow-hidden bg-card shadow-xs">
                              <table className="w-full text-xs text-left">
                                <thead>
                                  <tr className="bg-muted/60 border-b border-border/60 text-[11px] font-semibold text-muted-foreground uppercase">
                                    <th className="py-2.5 px-3">Program Studi (PS)</th>
                                    <th className="py-2.5 px-2 text-center" title="Pembimbing Utama">PS</th>
                                    <th className="py-2.5 px-2 text-center" title="Pendamping 1">PS-1</th>
                                    <th className="py-2.5 px-2 text-center" title="Pendamping 2">PS-2</th>
                                    <th className="py-2.5 px-3 text-right font-bold">Rata-rata</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50 font-mono">
                                  {/* PS ABT */}
                                  <tr className="hover:bg-muted/30">
                                    <td className="py-2.5 px-3 font-sans font-medium text-foreground flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                                      PS ABT
                                    </td>
                                    <td className="py-2.5 px-2 text-center text-muted-foreground">{dosen.bimbingan.psABT.ps}</td>
                                    <td className="py-2.5 px-2 text-center text-muted-foreground">{dosen.bimbingan.psABT.ps1}</td>
                                    <td className="py-2.5 px-2 text-center text-muted-foreground">{dosen.bimbingan.psABT.ps2}</td>
                                    <td className="py-2.5 px-3 text-right font-bold text-primary">
                                      {calcRowAvg(
                                        dosen.bimbingan.psABT.ps,
                                        dosen.bimbingan.psABT.ps1,
                                        dosen.bimbingan.psABT.ps2
                                      )}
                                    </td>
                                  </tr>

                                  {/* PS Lain */}
                                  <tr className="hover:bg-muted/30">
                                    <td className="py-2.5 px-3 font-sans font-medium text-foreground flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                                      PS Lain
                                    </td>
                                    <td className="py-2.5 px-2 text-center text-muted-foreground">{dosen.bimbingan.psLain.ps}</td>
                                    <td className="py-2.5 px-2 text-center text-muted-foreground">{dosen.bimbingan.psLain.ps1}</td>
                                    <td className="py-2.5 px-2 text-center text-muted-foreground">{dosen.bimbingan.psLain.ps2}</td>
                                    <td className="py-2.5 px-3 text-right font-bold text-cyan-600 dark:text-cyan-400">
                                      {calcRowAvg(
                                        dosen.bimbingan.psLain.ps,
                                        dosen.bimbingan.psLain.ps1,
                                        dosen.bimbingan.psLain.ps2
                                      )}
                                    </td>
                                  </tr>
                                </tbody>
                                <tfoot>
                                  <tr className="bg-muted/50 border-t border-border/60 font-semibold text-foreground">
                                    <td colSpan={4} className="py-2.5 px-3 font-sans text-xs">
                                      Rata-rata Keseluruhan
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                      {getDosenOverallAvgStr(dosen)}
                                    </td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </div>

                          {/* 2. Rekognisi Bidang Keahlian & Pengajaran (Dynamic Multi-item) */}
                          <div className="space-y-2.5 pt-2 border-t border-border/60">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                                <Award className="w-4 h-4 text-amber-500" />
                                <span>Rekognisi Bidang & Pengajaran</span>
                              </div>
                              <span className="text-[11px] font-mono text-muted-foreground">
                                {dosen.rekognisi.length} Rekognisi
                              </span>
                            </div>

                            {dosen.rekognisi.length > 0 ? (
                              <div className="space-y-2">
                                {dosen.rekognisi.map((item, rIdx) => (
                                  <div
                                    key={rIdx}
                                    className="p-3.5 rounded-xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex items-start gap-2.5 shadow-xs"
                                  >
                                    <div className="w-5 h-5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                                      <Sparkles className="w-3.5 h-3.5" />
                                    </div>
                                    <p className="text-xs text-foreground/95 leading-relaxed font-medium">
                                      {item}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-3 rounded-xl bg-muted/30 border border-border/60 text-xs text-muted-foreground italic">
                                Belum ada rekognisi keahlian yang tercatat.
                              </div>
                            )}
                          </div>
                        </div>

                      </div>

                      {/* BOTTOM FOOTER ACTION BAR */}
                      <div className="border-t border-border/60 bg-muted/30 px-5 py-3 flex items-center justify-between">
                        <div className="text-xs text-muted-foreground flex items-center gap-2 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          <span>{dosen.nama} &bull; NIDN/NIDK: {dosen.nidn}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(dosen)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit Data Dosen</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleCard(dosen.nidn)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card hover:bg-muted text-foreground border border-border/70 text-xs font-semibold shadow-xs hover:border-primary/40 transition-colors"
                          >
                            <span>Tutup Detail Dosen</span>
                            <ChevronDown className="w-3.5 h-3.5 rotate-180 text-primary" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        ) : (
          <div className="glass-card rounded-2xl p-12 text-center border border-border/70 bg-card">
            <GraduationCap className="w-10 h-10 text-muted-foreground mx-auto mb-3 stroke-[1.5]" />
            <h4 className="text-base font-bold text-foreground">Tidak Ada Data Dosen Ditemukan</h4>
            <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
              Tidak ada data kontribusi intelektual dosen yang sesuai dengan kata kunci pencarian &ldquo;{searchTerm}&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="mt-4 px-4 py-2 text-xs font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Reset Pencarian
            </button>
          </div>
        )}
      </div>

      {/* 5. BOTTOM CARD LIST FOOTER WITH SINGLE EXPAND/COLLAPSE ICON */}
      {filteredData.length > 0 && (
        <div className="flex items-center justify-between px-1 pt-1">
          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
            <span>
              Menampilkan <strong className="text-foreground">{filteredData.length}</strong> dari <strong className="text-foreground">{dosenList.length}</strong> Dosen
            </span>
          </div>

          {/* Single Expand & Collapse Icon Button (Bottom) */}
          <button
            type="button"
            onClick={handleToggleAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card hover:bg-muted border border-border/70 text-xs font-semibold text-foreground shadow-xs hover:border-primary/40 transition-colors"
            title={isAllExpanded ? 'Tutup Semua Dosen' : 'Buka Semua Dosen'}
          >
            {isAllExpanded ? (
              <>
                <ChevronsDownUp className="w-4 h-4 text-primary" />
                <span>Tutup Semua</span>
              </>
            ) : (
              <>
                <ChevronsUpDown className="w-4 h-4 text-primary" />
                <span>Buka Semua</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. SLIDE-OVER EDIT SIDEBAR (SHEET DARI SISI KANAN DENGAN SCROLL LOCKING)  */}
      {/* ========================================================================= */}
      <Sheet open={isEditSheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl overflow-y-auto p-0 flex flex-col bg-background border-l border-border/70 shadow-2xl"
        >
          {formData && (
            <>
              {/* Sheet Header */}
              <div className="p-6 border-b border-border/60 bg-muted/20 sticky top-0 z-10 backdrop-blur-md">
                <SheetHeader className="text-left space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                    <SheetTitle className="text-lg font-bold text-foreground">
                      Edit Kontribusi Intelektual Dosen
                    </SheetTitle>
                  </div>
                  <SheetDescription className="text-xs text-muted-foreground">
                    Perbarui mata kuliah, bahan ajar, bimbingan mahasiswa, dan rekognisi keahlian untuk <strong>{formData.nama}</strong>.
                  </SheetDescription>
                </SheetHeader>
              </div>

              {/* Sheet Body: Form Sections */}
              <div className="p-6 space-y-6 flex-1">
                {/* 1. Informasi Dosen */}
                <div className="p-4 rounded-xl bg-card border border-border/70 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    <span>Identitas Dosen</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Nama Lengkap & Gelar</label>
                      <Input
                        value={formData.nama}
                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                        className="h-9 text-xs rounded-xl"
                        placeholder="Nama Dosen..."
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">NIDN / NIDK</label>
                      <Input
                        value={formData.nidn}
                        onChange={(e) => setFormData({ ...formData, nidn: e.target.value })}
                        className="h-9 text-xs font-mono rounded-xl"
                        placeholder="Nomor NIDN..."
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Mata Kuliah pada Program Studi yang Diakreditasi (ABT) */}
                <div className="p-4 rounded-xl bg-card border border-border/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                      <BookOpen className="w-4 h-4 text-primary" />
                      <span>Mata Kuliah PS ABT</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddMatkulABT}
                      className="h-7 text-xs px-2.5 rounded-lg border-primary/40 text-primary hover:bg-primary/10"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Matkul
                    </Button>
                  </div>

                  <div className="space-y-2.5">
                    {formData.matkulABT.map((mk, idx) => (
                      <div
                        key={mk.id}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/50"
                      >
                        <span className="w-5 h-5 rounded-md bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <Input
                          value={mk.nama}
                          onChange={(e) => handleUpdateMatkulABT(mk.id, 'nama', e.target.value)}
                          placeholder="Nama Mata Kuliah ABT..."
                          className="h-8 text-xs flex-1 rounded-lg"
                        />
                        <div className="flex items-center gap-1 w-24 flex-shrink-0">
                          <Input
                            type="number"
                            min={1}
                            max={6}
                            value={mk.sks || 3}
                            onChange={(e) =>
                              handleUpdateMatkulABT(mk.id, 'sks', parseInt(e.target.value) || 0)
                            }
                            className="h-8 text-xs text-center rounded-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            title="Jumlah SKS"
                          />
                          <span className="text-[11px] font-semibold text-muted-foreground">SKS</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMatkulABT(mk.id)}
                          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 rounded-lg flex-shrink-0"
                          title="Hapus mata kuliah"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                    {formData.matkulABT.length === 0 && (
                      <p className="text-xs text-muted-foreground italic text-center py-2">
                        Belum ada mata kuliah PS ABT yang ditambahkan.
                      </p>
                    )}
                  </div>
                </div>

                {/* 3. Mata Kuliah pada Program Studi Lain */}
                <div className="p-4 rounded-xl bg-card border border-border/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                      <Library className="w-4 h-4 text-cyan-500" />
                      <span>Mata Kuliah PS Lain</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddMatkulPSLain}
                      className="h-7 text-xs px-2.5 rounded-lg border-cyan-500/40 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Matkul PS Lain
                    </Button>
                  </div>

                  <div className="space-y-2.5">
                    {formData.matkulPSLain.map((mk, idx) => (
                      <div
                        key={mk.id}
                        className="space-y-2 p-2.5 rounded-xl bg-muted/40 border border-border/50"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                            {idx + 1}
                          </span>
                          <Input
                            value={mk.nama}
                            onChange={(e) => handleUpdateMatkulPSLain(mk.id, 'nama', e.target.value)}
                            placeholder="Nama Mata Kuliah..."
                            className="h-8 text-xs flex-1 rounded-lg"
                          />
                          <div className="flex items-center gap-1 w-24 flex-shrink-0">
                            <Input
                              type="number"
                              min={1}
                              max={6}
                              value={mk.sks || 2}
                              onChange={(e) =>
                                handleUpdateMatkulPSLain(
                                  mk.id,
                                  'sks',
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="h-8 text-xs text-center rounded-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              title="Jumlah SKS"
                            />
                            <span className="text-[11px] font-semibold text-muted-foreground">SKS</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMatkulPSLain(mk.id)}
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 rounded-lg flex-shrink-0"
                            title="Hapus mata kuliah"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        <div className="pl-7">
                          <Input
                            value={mk.prodi}
                            onChange={(e) =>
                              handleUpdateMatkulPSLain(mk.id, 'prodi', e.target.value)
                            }
                            placeholder="Nama Program Studi (misal: D4 Akuntansi Manajerial)..."
                            className="h-7 text-[11px] rounded-lg"
                          />
                        </div>
                      </div>
                    ))}
                    {formData.matkulPSLain.length === 0 && (
                      <p className="text-xs text-muted-foreground italic text-center py-2">
                        Tidak ada mata kuliah di luar program studi ABT.
                      </p>
                    )}
                  </div>
                </div>

                {/* 4. Daftar Judul Bahan Ajar (Buku & Modul) */}
                <div className="p-4 rounded-xl bg-card border border-border/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                      <FileText className="w-4 h-4 text-indigo-500" />
                      <span>Daftar Judul Bahan Ajar</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddBahanAjar}
                      className="h-7 text-xs px-2.5 rounded-lg border-indigo-500/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Judul
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {formData.bahanAjar.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="w-6 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <Input
                          value={item}
                          onChange={(e) => handleUpdateBahanAjar(idx, e.target.value)}
                          placeholder="Judul Buku / Modul / Diktat Ajar..."
                          className="h-8 text-xs flex-1 rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBahanAjar(idx)}
                          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 rounded-lg flex-shrink-0"
                          title="Hapus judul bahan ajar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                    {formData.bahanAjar.length === 0 && (
                      <p className="text-xs text-muted-foreground italic text-center py-2">
                        Belum ada bahan ajar yang diterbitkan.
                      </p>
                    )}
                  </div>
                </div>

                {/* 5. Tabel Bimbingan Mahasiswa */}
                <div className="p-4 rounded-xl bg-card border border-border/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                      <Users className="w-4 h-4 text-emerald-500" />
                      <span>Rincian Bimbingan Mahasiswa</span>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Rata-rata: {getDosenOverallAvgStr(formData)} Mhs
                    </span>
                  </div>

                  <div className="rounded-xl border border-border/70 overflow-hidden bg-background">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-muted/60 border-b border-border/60 text-[11px] font-semibold text-muted-foreground uppercase">
                          <th className="py-2.5 px-3">Program Studi</th>
                          <th className="py-2.5 px-2 text-center" title="Pembimbing Utama">PS</th>
                          <th className="py-2.5 px-2 text-center" title="Pendamping 1">PS-1</th>
                          <th className="py-2.5 px-2 text-center" title="Pendamping 2">PS-2</th>
                          <th className="py-2.5 px-3 text-right">Rata-rata</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {/* PS ABT */}
                        <tr>
                          <td className="py-2.5 px-3 font-semibold text-foreground">PS ABT</td>
                          <td className="py-2 px-1 text-center">
                            <Input
                              type="number"
                              min={0}
                              value={formData.bimbingan.psABT.ps}
                              onChange={(e) =>
                                handleUpdateBimbingan(
                                  'psABT',
                                  'ps',
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="h-7 w-12 text-center mx-auto text-xs font-mono rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </td>
                          <td className="py-2 px-1 text-center">
                            <Input
                              type="number"
                              min={0}
                              value={formData.bimbingan.psABT.ps1}
                              onChange={(e) =>
                                handleUpdateBimbingan(
                                  'psABT',
                                  'ps1',
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="h-7 w-12 text-center mx-auto text-xs font-mono rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </td>
                          <td className="py-2 px-1 text-center">
                            <Input
                              type="number"
                              min={0}
                              value={formData.bimbingan.psABT.ps2}
                              onChange={(e) =>
                                handleUpdateBimbingan(
                                  'psABT',
                                  'ps2',
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="h-7 w-12 text-center mx-auto text-xs font-mono rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-primary">
                            {calcRowAvg(
                              formData.bimbingan.psABT.ps,
                              formData.bimbingan.psABT.ps1,
                              formData.bimbingan.psABT.ps2
                            )}
                          </td>
                        </tr>

                        {/* PS Lain */}
                        <tr>
                          <td className="py-2.5 px-3 font-semibold text-foreground">PS Lain</td>
                          <td className="py-2 px-1 text-center">
                            <Input
                              type="number"
                              min={0}
                              value={formData.bimbingan.psLain.ps}
                              onChange={(e) =>
                                handleUpdateBimbingan(
                                  'psLain',
                                  'ps',
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="h-7 w-12 text-center mx-auto text-xs font-mono rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </td>
                          <td className="py-2 px-1 text-center">
                            <Input
                              type="number"
                              min={0}
                              value={formData.bimbingan.psLain.ps1}
                              onChange={(e) =>
                                handleUpdateBimbingan(
                                  'psLain',
                                  'ps1',
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="h-7 w-12 text-center mx-auto text-xs font-mono rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </td>
                          <td className="py-2 px-1 text-center">
                            <Input
                              type="number"
                              min={0}
                              value={formData.bimbingan.psLain.ps2}
                              onChange={(e) =>
                                handleUpdateBimbingan(
                                  'psLain',
                                  'ps2',
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="h-7 w-12 text-center mx-auto text-xs font-mono rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-cyan-600 dark:text-cyan-400">
                            {calcRowAvg(
                              formData.bimbingan.psLain.ps,
                              formData.bimbingan.psLain.ps1,
                              formData.bimbingan.psLain.ps2
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 6. Rekognisi Bidang Keahlian & Pengajaran (Dynamic Multi-item List) */}
                <div className="p-4 rounded-xl bg-card border border-border/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span>Rekognisi / Pengakuan Keahlian</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddRekognisi}
                      className="h-7 text-xs px-2.5 rounded-lg border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Rekognisi
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {formData.rekognisi.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="w-6 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <Input
                          value={item}
                          onChange={(e) => handleUpdateRekognisi(idx, e.target.value)}
                          placeholder="Contoh: Asesor Kompetensi LSP BNSP, Reviewer Jurnal Scopus..."
                          className="h-8 text-xs flex-1 rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRekognisi(idx)}
                          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 rounded-lg flex-shrink-0"
                          title="Hapus rekognisi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                    {formData.rekognisi.length === 0 && (
                      <p className="text-xs text-muted-foreground italic text-center py-2">
                        Belum ada rekognisi yang ditambahkan.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sheet Sticky Footer */}
              <div className="p-4 border-t border-border/60 bg-muted/20 sticky bottom-0 z-10 flex items-center justify-end gap-2.5 backdrop-blur-md">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSheetOpenChange(false)}
                  className="h-9 px-4 rounded-xl text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSave}
                  className="h-9 px-5 rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  Simpan Perubahan
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ========================================================================= */}
      {/* 6. UNSAVED CHANGES CONFIRMATION DIALOG                                    */}
      {/* ========================================================================= */}
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
              onClick={handleSave}
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
