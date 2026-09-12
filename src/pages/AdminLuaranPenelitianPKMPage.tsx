import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronsDownUp,
  Plus,
  Trash2,
  Edit3,
  X,
  Check,
  FileText,
  FlaskConical,
  HeartHandshake,
  Sparkles,
  Calendar,
  Building2,
  Globe,
  GraduationCap,
  AlertCircle,
  Save,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useDosen } from '@/contexts/DosenContext';
import { DosenImportButton } from '@/components/admin/DosenImportButton';
import { DosenImportLogsButton } from '@/components/admin/DosenImportLogsButton';
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
  type DosenLuaranItem,
  type LuaranItem,
  type KategoriLuaran,
  type SumberPendanaan,
  type JenisPublikasi,
  SUMBER_PENDANAAN_OPTIONS,
  JENIS_PUBLIKASI_GROUPS,
  calculatePenelitianCount,
  calculatePkmCount,
  calculateTotalLuaran,
} from '@/data/mockLuaranPenelitianPkmData';

export default function AdminLuaranPenelitianPKMPage() {
  const { toast } = useToast();
  const { luaranList: dosenList, updateLuaran } = useDosen();
  const [searchTerm, setSearchTerm] = useState('');

  // State: Main page expanded cards tracking (Set of NIDNs)
  const [expandedNidns, setExpandedNidns] = useState<Set<string>>(new Set());

  // State: Active lecturer for Slide-over Drawer / Sheet
  const [activeDosen, setActiveDosen] = useState<DosenLuaranItem | null>(null);
  const [draftLuaran, setDraftLuaran] = useState<LuaranItem[]>([]);
  const [expandedDrawerItemIds, setExpandedDrawerItemIds] = useState<Set<string>>(new Set());
  const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set());

  // State: Unsaved changes dialog
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  // State: Delete item confirmation dialog
  const [itemToDelete, setItemToDelete] = useState<LuaranItem | null>(null);

  // Calculate high-level statistics
  const stats = useMemo(() => {
    let totalPenelitian = 0;
    let totalPkm = 0;
    dosenList.forEach((d) => {
      totalPenelitian += calculatePenelitianCount(d);
      totalPkm += calculatePkmCount(d);
    });
    const totalLuaran = totalPenelitian + totalPkm;
    const avgPerDosen = dosenList.length > 0 ? (totalLuaran / dosenList.length).toFixed(1) : '0';
    return { totalDosen: dosenList.length, totalPenelitian, totalPkm, totalLuaran, avgPerDosen };
  }, [dosenList]);

  // Filtered lecturer list based on search term
  const filteredList = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return dosenList;

    return dosenList.filter((dosen) => {
      const matchLecturer =
        dosen.nama.toLowerCase().includes(term) ||
        dosen.nidn.includes(term);

      const matchLuaran = dosen.luaran.some((l) => {
        const matchTitle = l.judul.toLowerCase().includes(term);
        const matchTahun = l.tahun.includes(term);
        const matchKategori = l.kategori.toLowerCase().includes(term);
        const matchSumber = l.sumberPendanaan.toLowerCase().includes(term);
        const matchJenis = l.jenisPublikasi.toLowerCase().includes(term);
        return matchTitle || matchTahun || matchKategori || matchSumber || matchJenis;
      });

      return matchLecturer || matchLuaran;
    });
  }, [dosenList, searchTerm]);

  // Check if form in drawer has unsaved modifications
  const isDirty = useMemo(() => {
    if (!activeDosen) return false;
    return JSON.stringify(draftLuaran) !== JSON.stringify(activeDosen.luaran);
  }, [draftLuaran, activeDosen]);

  // Toggle single main accordion card
  const toggleMainCard = (nidn: string) => {
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

  // Expand / Collapse all visible main cards
  const allMainExpanded = useMemo(() => {
    if (filteredList.length === 0) return false;
    return filteredList.every((d) => expandedNidns.has(d.nidn));
  }, [filteredList, expandedNidns]);

  const toggleAllMainCards = () => {
    if (allMainExpanded) {
      setExpandedNidns(new Set());
    } else {
      setExpandedNidns(new Set(filteredList.map((d) => d.nidn)));
    }
  };

  // Open Slide-Over Sheet (Default collapsed for all items)
  const handleOpenDrawer = (dosen: DosenLuaranItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveDosen(dosen);
    setDraftLuaran(JSON.parse(JSON.stringify(dosen.luaran)));
    setExpandedDrawerItemIds(new Set()); // Default collapsed
    setNewItemIds(new Set());
  };

  // Request close with dirty check
  const handleRequestCloseDrawer = () => {
    if (isDirty) {
      setShowUnsavedDialog(true);
    } else {
      handleForceCloseDrawer();
    }
  };

  // Force close drawer and discard changes
  const handleForceCloseDrawer = () => {
    setActiveDosen(null);
    setDraftLuaran([]);
    setExpandedDrawerItemIds(new Set());
    setNewItemIds(new Set());
    setShowUnsavedDialog(false);
  };

  // Toggle single item expansion inside drawer
  const toggleDrawerItem = (id: string) => {
    setExpandedDrawerItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Expand / Collapse all items inside drawer
  const allDrawerExpanded = useMemo(() => {
    if (draftLuaran.length === 0) return false;
    return draftLuaran.every((item) => expandedDrawerItemIds.has(item.id));
  }, [draftLuaran, expandedDrawerItemIds]);

  const toggleAllDrawerItems = () => {
    if (allDrawerExpanded) {
      setExpandedDrawerItemIds(new Set());
    } else {
      setExpandedDrawerItemIds(new Set(draftLuaran.map((item) => item.id)));
    }
  };

  // Check if there is any item in draft that has an empty title
  const hasIncompleteItem = useMemo(() => {
    return draftLuaran.some((item) => !item.judul.trim());
  }, [draftLuaran]);

  // Add new Luaran item at the BOTTOM, mark as new, expand, and auto-scroll/focus
  const handleAddLuaran = () => {
    // Validate: prevent spamming new rows if there is already an incomplete/empty item
    const incompleteItem = draftLuaran.find((item) => !item.judul.trim());
    if (incompleteItem) {
      // Ensure the incomplete item is expanded
      setExpandedDrawerItemIds((prev) => new Set(prev).add(incompleteItem.id));

      toast({
        title: 'Selesaikan Pengisian Luaran',
        description: 'Harap lengkapi judul karya pada baris luaran yang masih kosong sebelum menambahkan karya baru.',
        variant: 'destructive',
      });

      // Auto-scroll and focus to the incomplete item
      setTimeout(() => {
        const box = document.getElementById(incompleteItem.id);
        if (box) {
          box.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const inputOrTextarea = box.querySelector<HTMLTextAreaElement | HTMLInputElement>('textarea, input');
          if (inputOrTextarea) {
            inputOrTextarea.focus();
          }
        }
      }, 50);
      return;
    }

    const newId = `luaran-custom-${Date.now()}`;
    const newItem: LuaranItem = {
      id: newId,
      kategori: 'Penelitian',
      judul: '',
      tahun: new Date().getFullYear().toString(),
      sumberPendanaan: 'Perguruan Tinggi / Mandiri',
      jenisPublikasi: 'Jurnal Nasional Terakreditasi',
    };

    // Append to bottom
    setDraftLuaran((prev) => [...prev, newItem]);
    setNewItemIds((prev) => new Set(prev).add(newId));
    // Immediately expand newly created item
    setExpandedDrawerItemIds((prev) => new Set(prev).add(newId));

    // Auto-scroll to newly created element and focus the textarea/input
    setTimeout(() => {
      const box = document.getElementById(newId);
      if (box) {
        box.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const inputOrTextarea = box.querySelector<HTMLTextAreaElement | HTMLInputElement>('textarea, input');
        if (inputOrTextarea) {
          inputOrTextarea.focus();
        }
      }
    }, 80);
  };

  // Update draft item field
  const handleUpdateDraftItem = (
    id: string,
    field: keyof LuaranItem,
    value: string | KategoriLuaran | SumberPendanaan | JenisPublikasi
  ) => {
    setDraftLuaran((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Prompt confirmation dialog before deleting Luaran item
  const handlePromptDeleteItem = (item: LuaranItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setItemToDelete(item);
  };

  // Confirm delete Luaran item from draft
  const handleConfirmDeleteItem = () => {
    if (!itemToDelete) return;
    const targetId = itemToDelete.id;
    setDraftLuaran((prev) => prev.filter((item) => item.id !== targetId));
    setExpandedDrawerItemIds((prev) => {
      const next = new Set(prev);
      next.delete(targetId);
      return next;
    });
    setNewItemIds((prev) => {
      const next = new Set(prev);
      next.delete(targetId);
      return next;
    });
    setItemToDelete(null);
    toast({
      title: 'Item Luaran Dihapus',
      description: 'Item luaran berhasil dihapus dari draf.',
    });
  };

  // Save changes from Slide-Over Sheet
  const handleSaveDrawer = async () => {
    if (!activeDosen) return;

    // Validate that titles are not empty
    const hasEmptyTitle = draftLuaran.some((l) => !l.judul.trim());
    if (hasEmptyTitle) {
      toast({
        title: 'Judul Luaran Wajib Diisi',
        description: 'Pastikan seluruh item luaran telah memiliki judul karya.',
        variant: 'destructive',
      });
      return;
    }

    await updateLuaran(activeDosen.nidn, { ...activeDosen, luaran: draftLuaran });

    toast({
      title: 'Data Luaran Berhasil Disimpan',
      description: `Berhasil memperbarui data luaran untuk ${activeDosen.nama}.`,
    });

    handleForceCloseDrawer();
  };

  // Helper for funding source badge styling
  const getFundingBadgeClass = (sumber: SumberPendanaan) => {
    switch (sumber) {
      case 'Perguruan Tinggi / Mandiri':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/20';
      case 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
      case 'Lembaga Luar Negeri':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/20';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  // Helper for publication type badge styling
  const getPubTypeBadgeClass = (jenis: JenisPublikasi) => {
    if (jenis.includes('Jurnal')) {
      return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20';
    }
    if (jenis.includes('Seminar')) {
      return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
    }
    if (jenis.includes('Media Massa')) {
      return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20';
    }
    return 'bg-pink-500/10 text-pink-300 border-pink-500/20';
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex justify-end gap-2"><DosenImportLogsButton /><DosenImportButton module="luaran" title="Luaran Penelitian/PKM" /></div>
      {/* 1. Key Stats Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Dosen */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">Total Dosen ABT</span>
            <div className="text-2xl font-bold text-white tracking-tight">{stats.totalDosen}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Total Penelitian */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-blue-500/20 backdrop-blur-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-blue-400 font-medium flex items-center gap-1">
              <FlaskConical className="w-3.5 h-3.5" />
              Total Penelitian
            </span>
            <div className="text-2xl font-bold text-blue-300 tracking-tight">{stats.totalPenelitian}</div>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <FlaskConical className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Total PKM */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-500/20 backdrop-blur-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <HeartHandshake className="w-3.5 h-3.5" />
              Total Pengabdian (PKM)
            </span>
            <div className="text-2xl font-bold text-emerald-300 tracking-tight">{stats.totalPkm}</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <HeartHandshake className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Rata-rata Luaran / Dosen */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-amber-500/20 backdrop-blur-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-amber-400 font-medium">Rata-rata per Dosen</span>
            <div className="text-2xl font-bold text-amber-300 tracking-tight">
              {stats.avgPerDosen} <span className="text-xs text-slate-400 font-normal">karya/dosen</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Toolbar: Universal Search & Expand All (Filters cleaned up) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm">
        {/* Universal Search Bar */}
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Cari dosen, NIDN, judul karya, sumber dana, jenis publikasi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 bg-slate-950/60 border-slate-800 text-slate-200 placeholder:text-slate-500 rounded-xl focus-visible:ring-blue-500/40 text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Toggle All Accordion Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleAllMainCards}
          className="h-10 px-4 rounded-xl border-slate-800 bg-slate-950/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-2 shrink-0 transition-colors"
        >
          {allMainExpanded ? (
            <>
              <ChevronsDownUp className="w-4 h-4 text-blue-400" />
              <span>Tutup Semua</span>
            </>
          ) : (
            <>
              <ChevronsUpDown className="w-4 h-4 text-blue-400" />
              <span>Buka Semua</span>
            </>
          )}
        </Button>
      </div>

      {/* 4. Lecturers Interactive Collapsible Cards List */}
      <div className="space-y-3.5">
        {filteredList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-300">
              {searchTerm ? 'Tidak ada data luaran yang sesuai' : 'Belum Ada Data Luaran Terdaftar'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchTerm
                ? 'Coba ubah kata kunci pencarian untuk melihat daftar luaran dosen lainnya.'
                : 'Tambahkan data master dosen pada menu Pengelolaan Dosen untuk mulai mencatat riwayat luaran penelitian & PKM.'}
            </p>
          </div>
        ) : (
          filteredList.map((dosen) => {
            const isExpanded = expandedNidns.has(dosen.nidn);
            const penelitianCount = calculatePenelitianCount(dosen);
            const pkmCount = calculatePkmCount(dosen);
            const totalCount = calculateTotalLuaran(dosen);

            return (
              <div
                key={dosen.nidn}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${isExpanded
                    ? 'bg-slate-900/80 border-slate-700/80 shadow-lg'
                    : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700/60 hover:bg-slate-900/60'
                  }`}
              >
                {/* Collapsed Header Bar */}
                <div
                  onClick={() => toggleMainCard(dosen.nidn)}
                  className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  {/* Left: Avatar + Nama Dosen + NIDN */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${dosen.avatarColor} flex items-center justify-center text-white font-bold text-base shadow-md flex-shrink-0`}
                    >
                      {dosen.nama
                        .split(' ')
                        .filter((p) => !p.startsWith('Dr.') && !p.startsWith('Prof.') && !p.startsWith('Ir.'))
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('') || dosen.nama.substring(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                        {dosen.nama}
                      </h3>
                      <div className="text-xs font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>NIDN: {dosen.nidn}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle & Right: Badge Counter Summary & Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5">
                    {/* Ringkasan Jumlah Saat Ditutup */}
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                        <FlaskConical className="w-3.5 h-3.5" />
                        <span>{penelitianCount} Penelitian</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                        <HeartHandshake className="w-3.5 h-3.5" />
                        <span>{pkmCount} PKM</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium">
                        Total: {totalCount}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 ml-auto sm:ml-2">
                      <button
                        type="button"
                        onClick={(e) => handleOpenDrawer(dosen, e)}
                        className="px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all flex items-center gap-1.5 shadow-sm"
                        title="Kelola Luaran Dosen"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                        <span>Kelola Luaran</span>
                      </button>

                      <div
                        className={`p-1.5 rounded-lg text-slate-400 hover:text-white transition-transform duration-200 ${isExpanded ? 'rotate-180 text-blue-400' : ''
                          }`}
                      >
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Content Section */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-slate-800/80 bg-slate-950/40"
                    >
                      <div className="p-4 md:p-6 space-y-3">
                        {dosen.luaran.length === 0 ? (
                          <div className="py-6 text-center text-slate-400 text-xs">
                            Belum ada karya luaran penelitian/PKM yang tercatat untuk dosen ini.
                            <div className="mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => handleOpenDrawer(dosen, e)}
                                className="h-8 text-xs border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg"
                              >
                                <Plus className="w-3.5 h-3.5 mr-1 text-blue-400" />
                                Tambah Luaran Pertama
                              </Button>
                            </div>
                          </div>
                        ) : (
                          dosen.luaran.map((item, idx) => (
                            <div
                              key={item.id || idx}
                              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/60 transition-colors space-y-2.5"
                            >
                              <div className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                                  {idx + 1}
                                </span>

                                <div className="space-y-2 flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    {item.kategori === 'Penelitian' ? (
                                      <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-semibold py-0.5 px-2 flex items-center gap-1 rounded-md">
                                        <FlaskConical className="w-3 h-3" />
                                        Penelitian
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold py-0.5 px-2 flex items-center gap-1 rounded-md">
                                        <HeartHandshake className="w-3 h-3" />
                                        PKM
                                      </Badge>
                                    )}
                                    <h4 className="text-sm font-semibold text-slate-100 leading-snug">
                                      {item.judul}
                                    </h4>
                                  </div>

                                  {/* Metadata Badges */}
                                  <div className="flex flex-wrap items-center gap-2 text-xs pt-0.5">
                                    {/* Year Badge */}
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-mono text-[11px]">
                                      <Calendar className="w-3 h-3 text-slate-400" />
                                      {item.tahun}
                                    </span>

                                    {/* Funding Badge */}
                                    <span
                                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md border text-[11px] font-medium ${getFundingBadgeClass(
                                        item.sumberPendanaan
                                      )}`}
                                    >
                                      {item.sumberPendanaan === 'Lembaga Luar Negeri' ? (
                                        <Globe className="w-3 h-3" />
                                      ) : (
                                        <Building2 className="w-3 h-3" />
                                      )}
                                      {item.sumberPendanaan}
                                    </span>

                                    {/* Publication Type Badge */}
                                    <span
                                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md border text-[11px] font-medium ${getPubTypeBadgeClass(
                                        item.jenisPublikasi
                                      )}`}
                                    >
                                      <FileText className="w-3 h-3" />
                                      {item.jenisPublikasi}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Slide-Over Sheet (Edit & Kelola Luaran Dosen with Backdrop & Accordion) */}
      {activeDosen && (
        <div
          onClick={handleRequestCloseDrawer}
          className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Sheet Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${activeDosen.avatarColor} flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0`}
                >
                  {activeDosen.nama
                    .split(' ')
                    .filter((p) => !p.startsWith('Dr.') && !p.startsWith('Prof.') && !p.startsWith('Ir.'))
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('') || activeDosen.nama.substring(0, 2)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-white truncate">{activeDosen.nama}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    NIDN: {activeDosen.nidn} &bull; Kelola Daftar Karya Luaran
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRequestCloseDrawer}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Tutup Panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sheet Toolbar / Action Bar */}
            <div className="px-6 py-3.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <span>Total: {draftLuaran.length}</span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-blue-400">
                  {draftLuaran.filter((l) => l.kategori === 'Penelitian').length} Penelitian
                </span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-emerald-400">
                  {draftLuaran.filter((l) => l.kategori === 'PKM').length} PKM
                </span>
              </div>

              <div className="flex items-center gap-2">
                {draftLuaran.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={toggleAllDrawerItems}
                    className="h-8 px-2.5 rounded-xl border-slate-800 bg-slate-950/80 hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-1.5"
                  >
                    {allDrawerExpanded ? (
                      <>
                        <ChevronsDownUp className="w-3.5 h-3.5 text-blue-400" />
                        <span>Tutup Semua</span>
                      </>
                    ) : (
                      <>
                        <ChevronsUpDown className="w-3.5 h-3.5 text-blue-400" />
                        <span>Buka Semua</span>
                      </>
                    )}
                  </Button>
                )}

                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddLuaran}
                  disabled={hasIncompleteItem}
                  title={
                    hasIncompleteItem
                      ? 'Lengkapi judul karya pada baris yang baru sebelum menambah baris lainnya'
                      : 'Tambah Luaran Baru'
                  }
                  className="h-8 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-md shadow-blue-950/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Luaran
                </Button>
              </div>
            </div>

            {/* Sheet Body (Scrollable Accordion Form Items) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
              {draftLuaran.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/30 p-8">
                  <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-300">Belum ada item luaran</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Klik tombol "Tambah Luaran" di atas untuk menambahkan karya penelitian atau PKM baru.
                  </p>
                </div>
              ) : (
                draftLuaran.map((item, idx) => {
                  const isItemExpanded = expandedDrawerItemIds.has(item.id);
                  const isNew = newItemIds.has(item.id);

                  return (
                    <div
                      key={item.id}
                      id={item.id}
                      className={`rounded-2xl transition-all duration-200 overflow-hidden ${isNew
                          ? 'border-2 border-blue-500/50 bg-blue-500/[0.04] ring-1 ring-blue-500/20 shadow-md shadow-blue-950/20'
                          : 'border border-slate-800 bg-slate-950/60 hover:border-slate-700/80'
                        }`}
                    >
                      {/* Accordion Header in Drawer */}
                      <div
                        onClick={() => toggleDrawerItem(item.id)}
                        className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </span>

                          {/* Kategori Badge */}
                          {item.kategori === 'Penelitian' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold shrink-0">
                              <FlaskConical className="w-3 h-3" />
                              Penelitian
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold shrink-0">
                              <HeartHandshake className="w-3 h-3" />
                              PKM
                            </span>
                          )}

                          {/* Judul Luaran Header Preview */}
                          <span className="text-xs font-semibold text-slate-200 truncate flex-1">
                            {item.judul.trim() || (
                              <span className="text-slate-500 italic">
                                {isNew ? '(Ketik judul karya di sini...)' : 'Tanpa judul'}
                              </span>
                            )}
                          </span>

                          {/* Tahun Badge */}
                          {item.tahun && (
                            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-mono shrink-0 hidden sm:inline-block">
                              {item.tahun}
                            </span>
                          )}

                          {/* Baru Ditambahkan Badge */}
                          {isNew && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-300 px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 shrink-0">
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>Baru Ditambahkan</span>
                            </span>
                          )}
                        </div>

                        {/* Action Buttons: Delete & Chevron */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handlePromptDeleteItem(item, e)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Hapus Luaran Ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <div
                            className={`p-1 text-slate-400 hover:text-white transition-transform duration-200 ${isItemExpanded ? 'rotate-180 text-blue-400' : ''
                              }`}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      {/* Accordion Body in Drawer */}
                      <AnimatePresence>
                        {isItemExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="border-t border-slate-800/80 p-4 sm:p-5 space-y-4 bg-slate-950/40"
                          >
                            {/* Category Selection Radios */}
                            <div className="flex items-center gap-2.5">
                              <span className="text-xs font-semibold text-slate-300">Kategori Luaran:</span>
                              <div className="inline-flex rounded-lg bg-slate-900 p-1 border border-slate-800 text-xs">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateDraftItem(item.id, 'kategori', 'Penelitian')}
                                  className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${item.kategori === 'Penelitian'
                                      ? 'bg-blue-600 text-white shadow-sm'
                                      : 'text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                  <FlaskConical className="w-3.5 h-3.5" />
                                  Penelitian
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateDraftItem(item.id, 'kategori', 'PKM')}
                                  className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${item.kategori === 'PKM'
                                      ? 'bg-emerald-600 text-white shadow-sm'
                                      : 'text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                  <HeartHandshake className="w-3.5 h-3.5" />
                                  PKM
                                </button>
                              </div>
                            </div>

                            {/* Judul Luaran */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                                <span>
                                  Judul Luaran / Publikasi <span className="text-rose-400">*</span>
                                </span>
                                {isNew && (
                                  <span className="text-[10px] text-blue-400 font-medium">
                                    (Ketik judul di sini)
                                  </span>
                                )}
                              </label>
                              <textarea
                                rows={2}
                                value={item.judul}
                                onChange={(e) => handleUpdateDraftItem(item.id, 'judul', e.target.value)}
                                placeholder="Contoh: Optimasi Logistik Maritim Tanjung Emas Menggunakan Metode FMEA..."
                                className={`w-full px-3 py-2 bg-slate-900 border rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none ${isNew ? 'border-blue-500/40' : 'border-slate-800'
                                  }`}
                              />
                            </div>

                            {/* Form Grid: Tahun, Sumber Pendanaan, Jenis Publikasi */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {/* Tahun */}
                              <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-300">Tahun</label>
                                <Input
                                  type="text"
                                  value={item.tahun}
                                  onChange={(e) => handleUpdateDraftItem(item.id, 'tahun', e.target.value)}
                                  placeholder="2024"
                                  className="h-9 bg-slate-900 border-slate-800 text-slate-200 text-xs rounded-xl"
                                />
                              </div>

                              {/* Sumber Pendanaan (3 Opsi) */}
                              <div className="space-y-1.5 md:col-span-2">
                                <label className="text-xs font-medium text-slate-300">Sumber Pendanaan</label>
                                <select
                                  value={item.sumberPendanaan}
                                  onChange={(e) =>
                                    handleUpdateDraftItem(item.id, 'sumberPendanaan', e.target.value as SumberPendanaan)
                                  }
                                  className="w-full h-9 px-2.5 bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500/50 truncate"
                                >
                                  {SUMBER_PENDANAAN_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Jenis Publikasi (12 Opsi ber-optgroup) */}
                              <div className="space-y-1.5 md:col-span-3">
                                <label className="text-xs font-medium text-slate-300">Jenis Publikasi</label>
                                <select
                                  value={item.jenisPublikasi}
                                  onChange={(e) =>
                                    handleUpdateDraftItem(item.id, 'jenisPublikasi', e.target.value as JenisPublikasi)
                                  }
                                  className="w-full h-9 px-2.5 bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500/50 truncate"
                                >
                                  {JENIS_PUBLIKASI_GROUPS.map((group) => (
                                    <optgroup
                                      key={group.groupName}
                                      label={group.groupName}
                                      className="bg-slate-900 text-slate-300 font-semibold"
                                    >
                                      {group.options.map((option) => (
                                        <option key={option} value={option} className="text-slate-200">
                                          {option}
                                        </option>
                                      ))}
                                    </optgroup>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>

            {/* Sheet Footer */}
            <div className="p-4 md:p-6 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleRequestCloseDrawer}
                className="px-4 py-2 text-xs rounded-xl border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleSaveDrawer}
                disabled={!isDirty}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-950/60 flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Semua Perubahan</span>
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 6. Unsaved Changes Confirmation AlertDialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent className="rounded-2xl border-slate-800 bg-slate-900 text-slate-100 font-sans shadow-2xl max-w-md">
          <AlertDialogHeader>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
              <AlertCircle className="w-5 h-5" />
            </div>
            <AlertDialogTitle className="text-base font-bold text-white">
              Tutup Tanpa Menyimpan Perubahan?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-400 leading-relaxed">
              Ada perubahan data kegiatan penelitian/PKM yang belum disimpan. Jika ditutup sekarang, seluruh perubahan akan dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-2">
            <AlertDialogCancel className="rounded-xl border-slate-800 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold">
              Kembali Mengedit
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleForceCloseDrawer}
              className="rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-950/50"
            >
              Buang Perubahan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 7. Delete Item Confirmation AlertDialog */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent className="rounded-2xl border-slate-800 bg-slate-900 text-slate-100 font-sans shadow-2xl max-w-md">
          <AlertDialogHeader>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-2">
              <Trash2 className="w-5 h-5" />
            </div>
            <AlertDialogTitle className="text-base font-bold text-white">
              Hapus Item Luaran?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-400 leading-relaxed space-y-2.5">
              <span>Apakah Anda yakin ingin menghapus karya luaran ini dari daftar?</span>
              {itemToDelete && (
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 mt-2 space-y-1.5 text-left">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${itemToDelete.kategori === 'Penelitian'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                    >
                      {itemToDelete.kategori}
                    </span>
                    {itemToDelete.tahun && (
                      <span className="text-[10px] text-slate-400 font-mono">Tahun {itemToDelete.tahun}</span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-100 line-clamp-2">
                    {itemToDelete.judul.trim() || '(Karya Tanpa Judul)'}
                  </p>
                </div>
              )}
              <span className="block text-[11px] text-slate-500 pt-1">
                Tindakan ini akan menghapus karya dari draf luaran dosen ini.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-2">
            <AlertDialogCancel
              onClick={() => setItemToDelete(null)}
              className="rounded-xl border-slate-800 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteItem}
              className="rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-950/50 flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Luaran</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Named alias export for compatibility
export { AdminLuaranPenelitianPKMPage as AdminDosenLuaranPage };
