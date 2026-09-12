import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical,
  Search,
  Award,
  ChevronDown,
  Sparkles,
  X,
  ChevronsUpDown,
  ChevronsDownUp,
  Pencil,
  Trash2,
  Plus,
  Save,
  AlertCircle,
  Building2,
  Calendar,
  Layers,
  FileSpreadsheet
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
import { DosenImportButton } from '@/components/admin/DosenImportButton';
import { DosenImportLogsButton } from '@/components/admin/DosenImportLogsButton';
import {
  type KontribusiPenelitianDosenItem,
  type PenelitianItem
} from '@/data/mockPenelitianDosenData';

export default function AdminDosenPenelitianPage() {
  const { toast } = useToast();
  const { kontribusiPenelitianList: dosenList, updateKontribusiPenelitian } = useDosen();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNidns, setExpandedNidns] = useState<Set<string>>(new Set());

  // State: Slide-over Edit Sidebar
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editingDosen, setEditingDosen] = useState<KontribusiPenelitianDosenItem | null>(null);
  const [formData, setFormData] = useState<KontribusiPenelitianDosenItem | null>(null);
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
  const openEditModal = (dosen: KontribusiPenelitianDosenItem) => {
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

  // Form Handlers: Penelitian & Kerjasama Instansi
  const handleAddPenelitian = () => {
    if (!formData) return;
    const newId = `penelitian-custom-${Date.now()}`;
    const newPenelitian: PenelitianItem = {
      id: newId,
      judul: '',
      kerjasamaInstansi: '',
      tahun: new Date().getFullYear().toString(),
      skema: 'Riset Terapan',
    };
    setFormData({
      ...formData,
      penelitian: [...formData.penelitian, newPenelitian],
    });

    // Auto-scroll to the newly created research box & focus the first input (Judul Penelitian)
    setTimeout(() => {
      const box = document.getElementById(newId);
      if (box) {
        box.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const input = box.querySelector<HTMLInputElement>('input');
        if (input) {
          input.focus();
        }
      }
    }, 60);
  };

  const handleUpdatePenelitian = (
    id: string,
    field: keyof PenelitianItem,
    val: string
  ) => {
    if (!formData) return;
    setFormData({
      ...formData,
      penelitian: formData.penelitian.map((p) =>
        p.id === id ? { ...p, [field]: val } : p
      ),
    });
  };

  const handleDeletePenelitian = (id: string) => {
    if (!formData) return;
    setFormData({
      ...formData,
      penelitian: formData.penelitian.filter((p) => p.id !== id),
    });
  };

  // Form Handlers: Rekognisi (Multiple Dynamic List)
  const handleAddRekognisi = () => {
    if (!formData) return;
    const newIndex = formData.rekognisi.length;
    setFormData({
      ...formData,
      rekognisi: [...formData.rekognisi, ''],
    });

    // Auto-scroll and focus the newly added rekognisi input
    setTimeout(() => {
      const input = document.getElementById(`rekognisi-input-${newIndex}`) as HTMLInputElement | null;
      if (input) {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        input.focus();
      }
    }, 60);
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

  // Save changes to state and toast
  const handleSave = async () => {
    if (!formData) return;

    // Clean up blank rows
    const cleanedPenelitian = formData.penelitian.filter((p) => p.judul.trim() !== '');
    const cleanedRekognisi = formData.rekognisi.filter((r) => r.trim() !== '');

    const finalData: KontribusiPenelitianDosenItem = {
      ...formData,
      penelitian: cleanedPenelitian,
      rekognisi: cleanedRekognisi,
    };

    await updateKontribusiPenelitian(finalData.nidn, finalData);

    setIsEditSheetOpen(false);
    setEditingDosen(null);
    setFormData(null);
    setShowUnsavedDialog(false);

    toast({
      title: 'Data Berhasil Diperbarui',
      description: `Kontribusi penelitian untuk ${finalData.nama} telah tersimpan.`,
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

      // Check Penelitian Judul, Instansi, Skema
      const matchPenelitian = dosen.penelitian.some(
        (p) =>
          p.judul.toLowerCase().includes(q) ||
          p.kerjasamaInstansi.toLowerCase().includes(q) ||
          (p.skema && p.skema.toLowerCase().includes(q)) ||
          (p.tahun && p.tahun.includes(q))
      );
      if (matchPenelitian) return true;

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

  return (
    <div className="space-y-6 pb-14 font-sans selection:bg-primary/20 selection:text-primary">
      <div className="flex justify-end gap-2"><DosenImportLogsButton /><DosenImportButton module="penelitian" title="Kontribusi Penelitian" /></div>
      {/* 1. MAIN TOOLBAR & CONTROLS */}
      <div className="glass-card rounded-2xl p-5 border border-border/70 bg-card shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">Kontribusi Penelitian Dosen ABT</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                {filteredData.length} Dosen
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Rincian judul penelitian dosen, kerjasama dengan instansi/organisasi mitra, serta rekognisi dan kepakaran dosen Administrasi Bisnis Terapan.
            </p>
          </div>

          {/* Universal Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama, NIDN/NIDK, judul penelitian, mitra, rekognisi..."
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

      {/* 2. CARD LIST HEADER WITH SINGLE EXPAND/COLLAPSE ICON */}
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

      {/* 3. INTERACTIVE COLLAPSIBLE CARD LIST (Native Crisp DOM Rendering) */}
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

            // Preview chips: first 2 research titles when collapsed for symmetrical 1-line preview
            const previewChips = dosen.penelitian.slice(0, 2);
            const remainingCount = dosen.penelitian.length - 2;

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
                  className="p-4 sm:p-5 flex flex-col gap-3 cursor-pointer select-none"
                >
                  {/* Top Tier: Left (Avatar & Dosen Info) + Right (Badges, Edit Button, Chevron) */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
                    {/* Left: Avatar & Dosen Info */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
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

                    {/* Right: Quick Metric Badges, Edit Button, & Top Chevron Toggle */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0 self-start lg:self-center">
                      <div
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-semibold whitespace-nowrap"
                        title="Jumlah penelitian dosen"
                      >
                        <FlaskConical className="w-3 h-3" />
                        <span>{dosen.penelitian.length} Penelitian</span>
                      </div>

                      <div
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-semibold whitespace-nowrap"
                        title="Jumlah rekognisi kepakaran dosen"
                      >
                        <Award className="w-3 h-3" />
                        <span>{dosen.rekognisi.length} Rekognisi</span>
                      </div>

                      {/* Quick Pencil Edit Button on Closed Card */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(dosen);
                        }}
                        className="w-8 h-8 rounded-xl bg-card hover:bg-primary/15 text-muted-foreground hover:text-primary border border-border/70 hover:border-primary/40 flex items-center justify-center transition-colors shadow-xs"
                        title={`Edit data penelitian ${dosen.nama}`}
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

                  {/* Bottom Tier: Penelitian Preview Chips (When Collapsed) */}
                  <AnimatePresence mode="wait" initial={false}>
                    {!isExpanded ? (
                      <motion.div
                        key="collapsed-penelitian-chips"
                        initial={{ opacity: 0, y: -3 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 3 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40"
                      >
                        <span className="text-[11px] font-medium text-muted-foreground mr-1 flex items-center gap-1 shrink-0">
                          <FlaskConical className="w-3 h-3 text-muted-foreground/80" />
                          Topik Penelitian:
                        </span>
                        {previewChips.map((p) => (
                          <span
                            key={p.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 shadow-xs max-w-[240px] sm:max-w-[320px]"
                            title={p.judul}
                          >
                            <span className="truncate">{p.judul}</span>
                          </span>
                        ))}

                        {/* +X Lainnya Overflow Chip */}
                        {remainingCount > 0 && (
                          <span
                            className="inline-flex items-center px-2 py-1 rounded-lg text-[11px] font-semibold bg-muted text-muted-foreground border border-border/60 whitespace-nowrap shrink-0"
                          >
                            +{remainingCount} penelitian lainnya
                          </span>
                        )}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>

                {/* EXPANDED CONTENT DETAILS (ANIMATED WITH FRAMER MOTION) */}
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
                      <div className="p-4 sm:p-6 space-y-6">
                        {/* BAGIAN 1: TABEL PENELITIAN & KERJASAMA INSTANSI */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                <FlaskConical className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="text-xs sm:text-sm font-bold text-foreground">
                                  1. Judul Penelitian & Kerjasama Instansi/Organisasi
                                </h4>
                                <p className="text-[11px] text-muted-foreground">
                                  Karya riset dan rekam jejak kemitraan dengan instansi eksternal / industri
                                </p>
                              </div>
                            </div>
                            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/60">
                              {dosen.penelitian.length} Judul Riset
                            </span>
                          </div>

                          <div className="rounded-xl border border-border/70 overflow-hidden bg-card shadow-xs">
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs text-left">
                                <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border/70">
                                  <tr>
                                    <th className="px-3.5 py-2.5 w-10 text-center font-mono">#</th>
                                    <th className="px-3.5 py-2.5 min-w-[280px]">Judul Penelitian</th>
                                    <th className="px-3.5 py-2.5 min-w-[220px]">Kerjasama Instansi / Organisasi</th>
                                    <th className="px-3.5 py-2.5 w-32 text-center">Tahun / Skema</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50 font-normal">
                                  {dosen.penelitian.length > 0 ? (
                                    dosen.penelitian.map((p, pIdx) => {
                                      const hasPartner = p.kerjasamaInstansi && p.kerjasamaInstansi.trim() !== '' && !p.kerjasamaInstansi.toLowerCase().includes('mandiri');

                                      return (
                                        <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                                          <td className="px-3.5 py-3 text-center font-mono text-muted-foreground">
                                            {pIdx + 1}
                                          </td>
                                          <td className="px-3.5 py-3">
                                            <div className="flex items-start gap-2.5">
                                              <FlaskConical className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                              <span className="font-semibold text-foreground leading-snug">
                                                {p.judul}
                                              </span>
                                            </div>
                                          </td>
                                          <td className="px-3.5 py-3">
                                            <div className="flex items-start gap-2">
                                              <Building2 className={`w-4 h-4 shrink-0 mt-0.5 ${hasPartner ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                                              <div>
                                                <span className={`font-medium ${hasPartner ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                  {p.kerjasamaInstansi || 'Mandiri / Internal PT'}
                                                </span>
                                                {hasPartner && (
                                                  <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                                    Mitra Kerjasama
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </td>
                                          <td className="px-3.5 py-3 text-center">
                                            <div className="inline-flex flex-col items-center gap-0.5">
                                              {p.tahun && (
                                                <span className="font-mono font-semibold text-foreground px-2 py-0.5 rounded bg-muted/60 text-[11px] border border-border/60">
                                                  {p.tahun}
                                                </span>
                                              )}
                                              {p.skema && (
                                                <span className="text-[10px] text-muted-foreground">
                                                  {p.skema}
                                                </span>
                                              )}
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })
                                  ) : (
                                    <tr>
                                      <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                                        Belum ada data penelitian yang dicatat untuk dosen ini.
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>

                        {/* BAGIAN 2: REKOGNISI DOSEN (HORIZONTAL WRAP TILES) */}
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                <Award className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="text-xs sm:text-sm font-bold text-foreground">
                                  2. Rekognisi & Kepakaran Dosen
                                </h4>
                                <p className="text-[11px] text-muted-foreground">
                                  Pengakuan kepakaran, reviewer jurnal, asesor, juri, atau pembicara nasional/internasional
                                </p>
                              </div>
                            </div>
                            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                              {dosen.rekognisi.length} Rekognisi
                            </span>
                          </div>

                          {/* Horizontal wrapping chips representation */}
                          <div className="flex flex-wrap gap-2.5 p-4 rounded-xl border border-border/70 bg-card shadow-xs">
                            {dosen.rekognisi.length > 0 ? (
                              dosen.rekognisi.map((rek, rIdx) => (
                                <div
                                  key={rIdx}
                                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-gradient-to-r from-purple-500/10 via-primary/5 to-transparent text-foreground border border-purple-500/20 shadow-xs hover:border-purple-500/40 transition-colors"
                                >
                                  <div className="w-5 h-5 rounded-md bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                                    <Award className="w-3 h-3" />
                                  </div>
                                  <span>{rek}</span>
                                </div>
                              ))
                            ) : (
                              <div className="w-full py-4 text-center text-xs text-muted-foreground">
                                Belum ada rekognisi keahlian yang tercatat.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        ) : (
          <div className="glass-card rounded-2xl p-12 text-center border border-border/70 bg-card shadow-soft space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-foreground">Tidak Ada Data Dosen yang Sesuai</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Tidak ditemukan data penelitian dosen dengan kata kunci &quot;<strong className="text-foreground">{searchTerm}</strong>&quot;. Silakan periksa kembali ejaan pencarian Anda.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchTerm('')}
              className="rounded-xl border-border/70 text-xs mt-2"
            >
              Reset Pencarian
            </Button>
          </div>
        )}
      </div>

      {/* 4. SLIDE-OVER EDIT SHEET (DRAWER FROM RIGHT) */}
      <Sheet open={isEditSheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl p-0 flex flex-col bg-card border-l border-border/70 font-sans shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-border/70 bg-muted/30 flex-shrink-0">
            <SheetHeader className="text-left space-y-1">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-lg font-bold text-foreground">
                  Edit Kontribusi Penelitian Dosen
                </SheetTitle>
                {isDirty && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse">
                    Belum Disimpan
                  </span>
                )}
              </div>
              <SheetDescription className="text-xs text-muted-foreground">
                Perbarui daftar judul penelitian, instansi kerjasama, dan rekognisi keahlian untuk dosen ini.
              </SheetDescription>
            </SheetHeader>

            {formData && (
              <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-background border border-border/70">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${formData.avatarColor} text-white font-bold text-sm flex items-center justify-center shadow-xs flex-shrink-0`}
                >
                  {formData.nama.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-foreground truncate">{formData.nama}</h4>
                  <p className="text-xs font-mono text-muted-foreground">NIDN/NIDK: {formData.nidn}</p>
                </div>
              </div>
            )}
          </div>

          {/* Form Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {formData && (
              <>
                {/* SECTION A: KELOLA PENELITIAN & KERJASAMA INSTANSI */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FlaskConical className="w-4 h-4 text-primary" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Daftar Judul Penelitian & Kerjasama Instansi
                      </h4>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddPenelitian}
                      className="h-8 rounded-lg border-dashed border-primary/40 text-primary hover:bg-primary/10 text-xs font-semibold gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Penelitian</span>
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {formData.penelitian.map((p, idx) => {
                      const isNew = p.id.startsWith('penelitian-custom-');

                      return (
                        <div
                          key={p.id}
                          id={p.id}
                          className={`p-4 rounded-xl space-y-3 relative group transition-all duration-200 ${isNew
                              ? 'border-2 border-primary/50 bg-primary/[0.04] ring-1 ring-primary/20 shadow-md shadow-primary/5'
                              : 'border border-border/70 bg-background/60 hover:border-border/90'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${isNew
                                    ? 'bg-primary text-primary-foreground shadow-xs'
                                    : 'bg-primary/10 text-primary'
                                  }`}
                              >
                                Penelitian #{idx + 1}
                              </span>
                              {isNew && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 animate-fade-in">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  <span>Baru Ditambahkan</span>
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeletePenelitian(p.id)}
                              className="text-muted-foreground hover:text-destructive p-1 rounded-lg hover:bg-destructive/10 transition-colors"
                              title="Hapus baris penelitian"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Judul Penelitian */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-foreground flex items-center justify-between">
                              <span>Judul Penelitian</span>
                              {isNew && (
                                <span className="text-[10px] text-primary font-medium">
                                  (Ketik judul di sini)
                                </span>
                              )}
                            </label>
                            <Input
                              placeholder="Masukkan judul penelitian lengkap..."
                              value={p.judul}
                              onChange={(e) => handleUpdatePenelitian(p.id, 'judul', e.target.value)}
                              className={`h-9 text-xs bg-background rounded-lg focus:ring-1 focus:ring-primary ${isNew ? 'border-primary/50' : 'border-border/70'
                                }`}
                            />
                          </div>

                          {/* Kerjasama Instansi/Organisasi */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                                <Building2 className="w-3 h-3 text-muted-foreground" />
                                <span>Kerjasama Instansi / Organisasi</span>
                              </label>
                              <Input
                                placeholder="Nama mitra (misal: PT Telkom, Mandiri / Internal)..."
                                value={p.kerjasamaInstansi}
                                onChange={(e) => handleUpdatePenelitian(p.id, 'kerjasamaInstansi', e.target.value)}
                                className="h-9 text-xs bg-background rounded-lg border-border/70 focus:ring-1 focus:ring-primary"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-muted-foreground" />
                                  <span>Tahun</span>
                                </label>
                                <Input
                                  placeholder="2024"
                                  value={p.tahun || ''}
                                  onChange={(e) => handleUpdatePenelitian(p.id, 'tahun', e.target.value)}
                                  className="h-9 text-xs bg-background rounded-lg border-border/70 focus:ring-1 focus:ring-primary text-center font-mono"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                                  <Layers className="w-3 h-3 text-muted-foreground" />
                                  <span>Skema</span>
                                </label>
                                <Input
                                  placeholder="Hibah / Terapan"
                                  value={p.skema || ''}
                                  onChange={(e) => handleUpdatePenelitian(p.id, 'skema', e.target.value)}
                                  className="h-9 text-xs bg-background rounded-lg border-border/70 focus:ring-1 focus:ring-primary"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {formData.penelitian.length === 0 && (
                      <div className="p-6 text-center border border-dashed border-border/70 rounded-xl text-muted-foreground text-xs">
                        Belum ada penelitian. Klik tombol &quot;+ Tambah Penelitian&quot; di atas untuk menambahkan.
                      </div>
                    )}
                  </div>
                </div>

                {/* SECTION B: KELOLA REKOGNISI DOSEN */}
                <div className="space-y-3 pt-4 border-t border-border/70">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Rekognisi & Kepakaran Dosen
                      </h4>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddRekognisi}
                      className="h-8 rounded-lg border-dashed border-purple-500/40 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 text-xs font-semibold gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Rekognisi</span>
                    </Button>
                  </div>

                  <div className="space-y-2.5">
                    {formData.rekognisi.map((rek, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </div>
                        <Input
                          id={`rekognisi-input-${idx}`}
                          placeholder="Nama rekognisi/penghargaan (misal: Reviewer Jurnal Scopus, Asesor BNSP)..."
                          value={rek}
                          onChange={(e) => handleUpdateRekognisi(idx, e.target.value)}
                          className="h-9 text-xs bg-background rounded-lg border-border/70 focus:ring-1 focus:ring-purple-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteRekognisi(idx)}
                          className="text-muted-foreground hover:text-destructive p-2 rounded-lg hover:bg-destructive/10 transition-colors shrink-0"
                          title="Hapus rekognisi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {formData.rekognisi.length === 0 && (
                      <div className="p-6 text-center border border-dashed border-border/70 rounded-xl text-muted-foreground text-xs">
                        Belum ada rekognisi. Klik tombol &quot;+ Tambah Rekognisi&quot; di atas untuk menambahkan.
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-border/70 bg-muted/30 flex items-center justify-between gap-3 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSheetOpenChange(false)}
              className="rounded-xl border-border/70 text-xs font-semibold"
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={!isDirty}
              className="rounded-xl text-xs font-semibold gap-2 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Perubahan</span>
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* 5. UNSAVED CHANGES CONFIRMATION DIALOG */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent className="rounded-2xl border-border/70 bg-card font-sans">
          <AlertDialogHeader>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
              <AlertCircle className="w-5 h-5" />
            </div>
            <AlertDialogTitle className="text-base font-bold text-foreground">
              Tutup Tanpa Menyimpan Perubahan?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Ada perubahan data penelitian atau rekognisi yang belum disimpan. Jika ditutup sekarang, seluruh perubahan akan dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl border-border/70 text-xs font-semibold">
              Kembali Mengedit
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDiscardChanges}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-semibold"
            >
              Buang Perubahan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
