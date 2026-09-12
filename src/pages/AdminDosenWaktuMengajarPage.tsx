import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Pencil,
  Check,
  X,
  BookOpen,
  FlaskConical,
  HeartHandshake,
  Briefcase,
  Sparkles,
  Building2,
  School,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useDosen } from '@/contexts/DosenContext';
import { DosenImportButton } from '@/components/admin/DosenImportButton';
import { DosenImportLogsButton } from '@/components/admin/DosenImportLogsButton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  type WaktuMengajarItem,
  calculatePendidikanTotal,
  calculateTotalSks,
  calculateAvgSks,
} from '@/data/mockWaktuMengajarData';

export default function AdminDosenWaktuMengajarPage() {
  const { toast } = useToast();
  const { waktuMengajarList: dosenList, dosenList: masterDosenList, updateWaktuMengajar, deleteWaktuMengajar } = useDosen();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | 'Tetap' | 'Tidak Tetap'>('Semua');

  // Map for quick master dosen lookup (jabatan, statusDosen fallback)
  const dosenMasterMap = useMemo(() => {
    const map = new Map<string, (typeof masterDosenList)[0]>();
    (masterDosenList || []).forEach((d) => map.set(d.nidn, d));
    return map;
  }, [masterDosenList]);

  // State: In-place edit drafts for active editing cards (keyed by NIDN)
  const [editingCards, setEditingCards] = useState<Record<string, WaktuMengajarItem>>({});

  // Filtered lecturers list
  const filteredList = useMemo(() => {
    return dosenList.filter((item) => {
      const master = dosenMasterMap.get(item.nidn);
      const jabatan = item.jabatan || master?.jabatan || '';
      const statusDosen = item.statusDosen || master?.statusDosen || 'Tetap';

      const matchSearch =
        item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nidn.includes(searchTerm) ||
        jabatan.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'Semua' || statusDosen === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [dosenList, dosenMasterMap, searchTerm, statusFilter]);

  // Handle entering edit mode for a card
  const handleStartEdit = (item: WaktuMengajarItem) => {
    const key = `${item.nidn}:${item.tahunAkademik || ''}`;
    setEditingCards((prev) => ({
      ...prev,
      [key]: { ...item },
    }));
  };

  // Handle cancelling edit mode for a card
  const handleCancelEdit = (key: string) => {
    setEditingCards((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  // Handle changing numeric values inside an in-place editing card
  const handleFieldChange = (
    key: string,
    field: keyof Omit<WaktuMengajarItem, 'nidn' | 'nama' | 'jabatan' | 'statusDosen' | 'avatarColor'>,
    value: string
  ) => {
    const numericValue = value === '' ? 0 : Math.max(0, parseFloat(value) || 0);
    setEditingCards((prev) => {
      if (!prev[key]) return prev;
      return {
        ...prev,
        [key]: {
          ...prev[key],
          [field]: numericValue,
        },
      };
    });
  };

  // Handle saving the modified card data
  const handleSaveEdit = async (key: string, nidn: string) => {
    const draft = editingCards[key];
    if (!draft) return;

    await updateWaktuMengajar(nidn, draft);

    // Remove from active editing
    setEditingCards((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

    toast({
      title: 'Data EWMP Berhasil Disimpan',
      description: `Beban waktu mengajar untuk ${draft.nama} berhasil diperbarui.`,
    });
  };

  const handleDelete = async (item: WaktuMengajarItem) => {
    if (!item.tahunAkademik || !window.confirm(`Hapus EWMP ${item.tahunAkademik} milik ${item.nama}?`)) return;
    const success = await deleteWaktuMengajar(item.nidn, item.tahunAkademik);
    toast({ title: success ? 'Data EWMP dihapus' : 'Gagal menghapus EWMP', variant: success ? 'default' : 'destructive' });
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex justify-end gap-2"><DosenImportLogsButton /><DosenImportButton module="waktu_mengajar" title="Waktu Mengajar" /></div>
      {/* Filter, Search Bar & Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama dosen, NIDN, atau jabatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 rounded-xl bg-card border-border/60 focus-visible:ring-indigo-500/30 text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {(['Semua', 'Tetap', 'Tidak Tetap'] as const).map((filter) => (
            <Button
              key={filter}
              variant={statusFilter === filter ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(filter)}
              className={`rounded-xl text-xs px-3.5 h-9 transition-all ${statusFilter === filter
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                  : 'bg-card border-border/60 hover:bg-accent text-muted-foreground'
                }`}
            >
              {filter === 'Semua' ? 'Semua Status' : `Dosen ${filter}`}
            </Button>
          ))}
        </div>
      </div>

      {/* Dosen Cards Grid */}
      {filteredList.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-border/50 bg-card/40">
          <div className="w-12 h-12 rounded-2xl bg-muted/80 mx-auto flex items-center justify-center text-muted-foreground mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Tidak Ada Data Dosen</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Tidak ditemukan dosen dengan kata kunci &ldquo;{searchTerm}&rdquo; pada filter status yang dipilih.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredList.map((dosen) => {
              const recordKey = `${dosen.nidn}:${dosen.tahunAkademik || ''}`;
              const isEditing = Boolean(editingCards[recordKey]);
              const currentData = isEditing ? editingCards[recordKey] : dosen;

              const master = dosenMasterMap.get(dosen.nidn);
              const jabatan = dosen.jabatan || master?.jabatan || 'Dosen Pengajar';
              const statusDosen = dosen.statusDosen || master?.statusDosen || 'Tetap';

              const pendidikanTotal = calculatePendidikanTotal(currentData);
              const totalSks = calculateTotalSks(currentData);
              const avgSks = calculateAvgSks(currentData);

              return (
                <motion.div
                  key={recordKey}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`relative rounded-2xl transition-all duration-300 ${isEditing
                      ? 'ring-2 ring-indigo-500/60 shadow-xl bg-card border-indigo-500/40 dark:bg-slate-900/90'
                      : 'border border-border/60 hover:border-indigo-500/40 bg-card/80 hover:shadow-lg backdrop-blur-sm'
                    }`}
                >
                  {/* Card Header */}
                  <div className="p-5 pb-4 border-b border-border/50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${dosen.avatarColor || 'from-indigo-600 to-blue-600'
                            } text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0`}
                        >
                          {dosen.nama
                            .replace(/^(Dr\.|Prof\.|Ir\.|Dra\.|Drs\.)\s+/gi, '')
                            .charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm md:text-base font-bold text-foreground truncate" title={dosen.nama}>
                            {dosen.nama}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-xs font-mono text-muted-foreground">
                              NIDN: {dosen.nidn}
                            </span>
                            <span className="text-muted-foreground/40 text-xs">&bull;</span>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">
                              {dosen.tahunAkademik}
                            </Badge>
                            <span className="text-muted-foreground/40 text-xs">&bull;</span>
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 rounded font-normal ${statusDosen === 'Tetap'
                                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                }`}
                            >
                              {statusDosen}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {jabatan}
                          </p>
                        </div>
                      </div>

                      {/* Top Right Action Buttons */}
                      <div className="shrink-0 flex items-center gap-1.5">
                        {isEditing ? (
                          <>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleCancelEdit(recordKey)}
                                    className="w-8 h-8 rounded-lg text-rose-600 hover:bg-rose-500/10 hover:text-rose-700 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p className="text-xs">Batalkan Edit</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    onClick={() => handleSaveEdit(recordKey, dosen.nidn)}
                                    className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p className="text-xs">Simpan Perubahan</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </>
                        ) : (
                          <div className="flex gap-1"><TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleStartEdit(dosen)}
                                  className="w-8 h-8 rounded-lg text-muted-foreground hover:text-indigo-600 hover:bg-indigo-500/10 transition-colors"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="text-xs">Edit In-Place EWMP</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <Button size="icon" variant="ghost" onClick={() => void handleDelete(dosen)} className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button></div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Body: 4 Main Workload Sections */}
                  <div className="p-5 space-y-4 text-xs">
                    {/* 1. Pendidikan (Pembelajaran & Pembimbingan) */}
                    <div className="rounded-xl p-3.5 bg-muted/40 border border-border/40 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-semibold text-foreground">
                          <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>1. Pendidikan (Pembelajaran &amp; Pembimbingan)</span>
                        </div>
                        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                          Subtotal: {pendidikanTotal} SKS
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2 pt-1">
                        {/* Sub-item A: PT ABT */}
                        <div className="flex items-center justify-between gap-2 bg-card/60 p-2 rounded-lg border border-border/30">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <School className="w-3 h-3 text-indigo-500" />
                            <span className="text-[11px]">PT ABT</span>
                          </div>
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                min="0"
                                step="0.5"
                                value={currentData.sksPendidikanPS}
                                onChange={(e) =>
                                  handleFieldChange(recordKey, 'sksPendidikanPS', e.target.value)
                                }
                                className="w-16 h-7 text-right text-xs px-2 py-1 rounded-md font-semibold bg-background border-indigo-300 dark:border-indigo-700 focus-visible:ring-indigo-500"
                              />
                              <span className="text-[10px] text-muted-foreground">SKS</span>
                            </div>
                          ) : (
                            <span className="font-semibold text-foreground bg-background/80 px-2 py-0.5 rounded border border-border/40">
                              {currentData.sksPendidikanPS} SKS
                            </span>
                          )}
                        </div>

                        {/* Sub-item B: PS Lain (Internal PT) */}
                        <div className="flex items-center justify-between gap-2 bg-card/60 p-2 rounded-lg border border-border/30">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Building2 className="w-3 h-3 text-blue-500" />
                            <span className="text-[11px]">PS Lain (Internal PT)</span>
                          </div>
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                min="0"
                                step="0.5"
                                value={currentData.sksPendidikanPSLain}
                                onChange={(e) =>
                                  handleFieldChange(recordKey, 'sksPendidikanPSLain', e.target.value)
                                }
                                className="w-16 h-7 text-right text-xs px-2 py-1 rounded-md font-semibold bg-background border-indigo-300 dark:border-indigo-700 focus-visible:ring-indigo-500"
                              />
                              <span className="text-[10px] text-muted-foreground">SKS</span>
                            </div>
                          ) : (
                            <span className="font-semibold text-foreground bg-background/80 px-2 py-0.5 rounded border border-border/40">
                              {currentData.sksPendidikanPSLain} SKS
                            </span>
                          )}
                        </div>

                        {/* Sub-item C: PT Lain (Eksternal PT) */}
                        <div className="flex items-center justify-between gap-2 bg-card/60 p-2 rounded-lg border border-border/30">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <ExternalLink className="w-3 h-3 text-teal-500" />
                            <span className="text-[11px]">PT Lain (Eksternal PT)</span>
                          </div>
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                min="0"
                                step="0.5"
                                value={currentData.sksPendidikanPTLain}
                                onChange={(e) =>
                                  handleFieldChange(recordKey, 'sksPendidikanPTLain', e.target.value)
                                }
                                className="w-16 h-7 text-right text-xs px-2 py-1 rounded-md font-semibold bg-background border-indigo-300 dark:border-indigo-700 focus-visible:ring-indigo-500"
                              />
                              <span className="text-[10px] text-muted-foreground">SKS</span>
                            </div>
                          ) : (
                            <span className="font-semibold text-foreground bg-background/80 px-2 py-0.5 rounded border border-border/40">
                              {currentData.sksPendidikanPTLain} SKS
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 2. Penelitian */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <FlaskConical className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-semibold text-foreground text-[11px] block">2. Penelitian</span>
                          <span className="text-[10px] text-muted-foreground">Riset &amp; Publikasi</span>
                        </div>
                      </div>
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min="0"
                            step="0.5"
                            value={currentData.sksPenelitian}
                            onChange={(e) =>
                              handleFieldChange(recordKey, 'sksPenelitian', e.target.value)
                            }
                            className="w-16 h-7 text-right text-xs px-2 py-1 rounded-md font-semibold bg-background border-indigo-300 dark:border-indigo-700 focus-visible:ring-indigo-500"
                          />
                          <span className="text-[10px] text-muted-foreground">SKS</span>
                        </div>
                      ) : (
                        <span className="font-semibold text-foreground bg-background/80 px-2.5 py-1 rounded-lg border border-border/40 text-xs">
                          {currentData.sksPenelitian} SKS
                        </span>
                      )}
                    </div>

                    {/* 3. PKM (Pengabdian Kepada Masyarakat) */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          <HeartHandshake className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-semibold text-foreground text-[11px] block">3. PKM (Pengabdian)</span>
                          <span className="text-[10px] text-muted-foreground">Pengabdian Masyarakat</span>
                        </div>
                      </div>
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min="0"
                            step="0.5"
                            value={currentData.sksPengabdian}
                            onChange={(e) =>
                              handleFieldChange(recordKey, 'sksPengabdian', e.target.value)
                            }
                            className="w-16 h-7 text-right text-xs px-2 py-1 rounded-md font-semibold bg-background border-indigo-300 dark:border-indigo-700 focus-visible:ring-indigo-500"
                          />
                          <span className="text-[10px] text-muted-foreground">SKS</span>
                        </div>
                      ) : (
                        <span className="font-semibold text-foreground bg-background/80 px-2.5 py-1 rounded-lg border border-border/40 text-xs">
                          {currentData.sksPengabdian} SKS
                        </span>
                      )}
                    </div>

                    {/* 4. Tugas Tambahan dan/atau Penunjang */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                          <Briefcase className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-semibold text-foreground text-[11px] block">4. Tugas Tambahan / Penunjang</span>
                          <span className="text-[10px] text-muted-foreground">Manajerial &amp; Panitia</span>
                        </div>
                      </div>
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min="0"
                            step="0.5"
                            value={currentData.sksTugasTambahan}
                            onChange={(e) =>
                              handleFieldChange(recordKey, 'sksTugasTambahan', e.target.value)
                            }
                            className="w-16 h-7 text-right text-xs px-2 py-1 rounded-md font-semibold bg-background border-indigo-300 dark:border-indigo-700 focus-visible:ring-indigo-500"
                          />
                          <span className="text-[10px] text-muted-foreground">SKS</span>
                        </div>
                      ) : (
                        <span className="font-semibold text-foreground bg-background/80 px-2.5 py-1 rounded-lg border border-border/40 text-xs">
                          {currentData.sksTugasTambahan} SKS
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: 5. Kalkulasi Otomatis (Total SKS & Rata-rata/Semester) */}
                  <div className="p-4 bg-gradient-to-r from-muted/60 via-muted/40 to-muted/60 border-t border-border/50 rounded-b-2xl">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                          <span>Total Beban EWMP</span>
                          {isEditing && (
                            <span className="text-[10px] font-normal text-indigo-500 dark:text-indigo-400 flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" /> Live
                            </span>
                          )}
                        </div>
                        <div className="text-lg font-extrabold text-foreground tracking-tight mt-0.5">
                          {totalSks}{' '}
                          <span className="text-xs font-medium text-muted-foreground">SKS/thn</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Rata-rata/Semester
                        </div>
                        <div className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-lg mt-0.5">
                          <span>{avgSks}</span>
                          <span className="text-[10px] font-normal opacity-80">SKS/smt</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
