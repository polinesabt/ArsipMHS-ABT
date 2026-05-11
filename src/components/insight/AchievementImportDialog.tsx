import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Download, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  downloadAchievementImportTemplateViaAPI,
  getAchievementImportLogDetailViaAPI,
  importAchievementsFromExcelViaAPI,
  type AchievementImportCategory,
  type AchievementImportRowError,
  type AchievementImportSummary,
} from '@/repositories/api-student.repository';
import {
  ACHIEVEMENT_IMPORT_CATEGORY_META,
  ACADEMIC_IMPORT_CATEGORIES,
  NON_ACADEMIC_IMPORT_CATEGORIES,
  RESEARCH_OUTPUT_IMPORT_CATEGORIES,
  resolveImportCategoriesByScope,
  type AchievementImportScope,
} from '@/constants/achievement-import.constants';

interface AchievementImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scope: AchievementImportScope;
  onImportCompleted?: (payload: {
    summary: AchievementImportSummary;
    details: AchievementImportRowError[];
  }) => void;
}

const ROW_STATUS_META: Record<AchievementImportRowError['status'], { label: string; className: string }> = {
  error: { label: 'Error', className: 'bg-red-100 text-red-700' },
  duplicate: { label: 'Duplikat', className: 'bg-amber-100 text-amber-700' },
  skipped_empty: { label: 'Kosong', className: 'bg-slate-100 text-slate-700' },
  inserted: { label: 'Berhasil', className: 'bg-emerald-100 text-emerald-700' },
};

const SCOPE_LABEL: Record<AchievementImportScope, string> = {
  all: 'Semua Prestasi',
  academic: 'Prestasi Akademik',
  nonAcademic: 'Prestasi Non Akademik',
  productOnly: 'Produk Mahasiswa',
  researchOutputs: 'Luaran Penelitian',
  researchOutputsHki: 'Luaran Penelitian - HKI',
  researchOutputsTechnology: 'Luaran Penelitian - Teknologi Tepat Guna',
  researchOutputsBooks: 'Luaran Penelitian - Buku',
  publicationsJurnal: 'Diseminasi Jurnal',
  publicationsSeminar: 'Diseminasi Seminar',
  publicationsPagelaran: 'Diseminasi Pagelaran/Presentasi',
};

const PUBLICATIONS_SCOPE_META: Record<
  'publicationsJurnal' | 'publicationsSeminar' | 'publicationsPagelaran',
  {
    title: string;
    description: string;
    category: AchievementImportCategory;
    importActionLabel: string;
  }
> = {
  publicationsJurnal: {
    title: 'Unggah Jurnal Excel',
    description: 'Kategori otomatis: Jurnal. Unduh template jurnal, lalu unggah file Excel.',
    category: 'jurnal',
    importActionLabel: 'Import Jurnal',
  },
  publicationsSeminar: {
    title: 'Unggah Publikasi Seminar Excel',
    description: 'Kategori otomatis: Publikasi di Seminar. Unduh template seminar, lalu unggah file Excel.',
    category: 'seminar',
    importActionLabel: 'Import Publikasi Seminar',
  },
  publicationsPagelaran: {
    title: 'Unggah Pagelaran/Presentasi Excel',
    description: 'Kategori otomatis: Pagelaran / Presentasi. Unduh template pagelaran, lalu unggah file Excel.',
    category: 'pagelaran',
    importActionLabel: 'Import Pagelaran/Presentasi',
  },
};

const RESEARCH_OUTPUT_SCOPE_META: Record<
  'researchOutputs' | 'researchOutputsHki' | 'researchOutputsTechnology' | 'researchOutputsBooks',
  {
    title: string;
    description: string;
    category?: AchievementImportCategory;
    importActionLabel: string;
  }
> = {
  researchOutputs: {
    title: 'Unggah Luaran Penelitian Excel',
    description: 'Pilih template HKI, Teknologi Tepat Guna, atau Buku kemudian unggah file Excel.',
    importActionLabel: 'Import Luaran Penelitian',
  },
  researchOutputsHki: {
    title: 'Unggah Luaran Penelitian - HKI',
    description: 'Kategori otomatis: Luaran Penelitian - HKI.',
    category: 'research_output_hki',
    importActionLabel: 'Import Luaran HKI',
  },
  researchOutputsTechnology: {
    title: 'Unggah Luaran Penelitian - Teknologi',
    description: 'Kategori otomatis: Luaran Penelitian - Teknologi Tepat Guna.',
    category: 'research_output_technology',
    importActionLabel: 'Import Luaran Teknologi',
  },
  researchOutputsBooks: {
    title: 'Unggah Luaran Penelitian - Buku',
    description: 'Kategori otomatis: Luaran Penelitian - Buku.',
    category: 'research_output_books',
    importActionLabel: 'Import Luaran Buku',
  },
};

const GROUP_TAB_TRIGGER_CLASS: Record<'academic' | 'non_academic', string> = {
  academic:
    '!h-10 !rounded-lg !border !border-transparent !bg-transparent !text-sm !font-semibold !text-foreground hover:!bg-muted data-[state=active]:!border-[#3B82F6] data-[state=active]:!bg-[#2563EB] data-[state=active]:!text-white data-[state=active]:!shadow-sm',
  non_academic:
    '!h-10 !rounded-lg !border !border-transparent !bg-transparent !text-sm !font-semibold !text-foreground hover:!bg-muted data-[state=active]:!border-[#14B8A6] data-[state=active]:!bg-[#0D9488] data-[state=active]:!text-white data-[state=active]:!shadow-sm',
};

const CATEGORY_BUTTON_CLASS: Record<
  AchievementImportCategory,
  { active: string; inactive: string }
> = {
  publikasi: {
    inactive: '!border-[#C7D2FE] !bg-[#F8FAFF] !text-[#1E3A8A] hover:!bg-[#EEF4FF]',
    active: '!border-[#60A5FA] !bg-[#CFE4FD] !text-[#1E3A8A] !ring-2 !ring-[#93C5FD]/75 !shadow-sm hover:!bg-[#C4DFFC]',
  },
  jurnal: {
    inactive: '!border-[#B6D4FE] !bg-[#F4F8FF] !text-[#1E40AF] hover:!bg-[#EAF2FF]',
    active: '!border-[#3B82F6] !bg-[#CFE2FF] !text-[#1E3A8A] !ring-2 !ring-[#93C5FD]/75 !shadow-sm hover:!bg-[#C4DBFF]',
  },
  portofolio: {
    inactive: '!border-[#DDD6FE] !bg-[#FAF8FF] !text-[#5B21B6] hover:!bg-[#F3EEFF]',
    active: '!border-[#A78BFA] !bg-[#E4DEFD] !text-[#4C1D95] !ring-2 !ring-[#C4B5FD]/75 !shadow-sm hover:!bg-[#DDD4FC]',
  },
  lomba: {
    inactive: '!border-[#FED7AA] !bg-[#FFFAF4] !text-[#9A3412] hover:!bg-[#FFF2E3]',
    active: '!border-[#FB923C] !bg-[#FFE2C2] !text-[#7C2D12] !ring-2 !ring-[#FDBA74]/75 !shadow-sm hover:!bg-[#FFD7AD]',
  },
  kekayaan_intelektual: {
    inactive: '!border-[#BAE6FD] !bg-[#F5FBFF] !text-[#075985] hover:!bg-[#EAF6FF]',
    active: '!border-[#38BDF8] !bg-[#D2ECFD] !text-[#0C4A6E] !ring-2 !ring-[#7DD3FC]/75 !shadow-sm hover:!bg-[#C6E7FC]',
  },
  research_output_hki: {
    inactive: '!border-[#C7D2FE] !bg-[#F7F9FF] !text-[#1E3A8A] hover:!bg-[#EEF2FF]',
    active: '!border-[#6366F1] !bg-[#DBDEFF] !text-[#312E81] !ring-2 !ring-[#A5B4FC]/75 !shadow-sm hover:!bg-[#D2D7FF]',
  },
  research_output_technology: {
    inactive: '!border-[#A7F3D0] !bg-[#F3FFF9] !text-[#065F46] hover:!bg-[#E8FFF3]',
    active: '!border-[#10B981] !bg-[#C9F7E3] !text-[#064E3B] !ring-2 !ring-[#6EE7B7]/75 !shadow-sm hover:!bg-[#B8F2D8]',
  },
  research_output_books: {
    inactive: '!border-[#FDE68A] !bg-[#FFFDF5] !text-[#854D0E] hover:!bg-[#FFF7DF]',
    active: '!border-[#F59E0B] !bg-[#FCE9B2] !text-[#78350F] !ring-2 !ring-[#FCD34D]/75 !shadow-sm hover:!bg-[#F9DF9A]',
  },
  magang: {
    inactive: '!border-[#99F6E4] !bg-[#F4FFFC] !text-[#115E59] hover:!bg-[#E7FBF6]',
    active: '!border-[#2DD4BF] !bg-[#B9F7EA] !text-[#134E4A] !ring-2 !ring-[#5EEAD4]/75 !shadow-sm hover:!bg-[#A5F2E1]',
  },
  produk_mahasiswa: {
    inactive: '!border-[#BAE6FD] !bg-[#F4FAFF] !text-[#0C4A6E] hover:!bg-[#EAF6FF]',
    active: '!border-[#38BDF8] !bg-[#CBEAFE] !text-[#0C4A6E] !ring-2 !ring-[#7DD3FC]/75 !shadow-sm hover:!bg-[#BDE4FC]',
  },
  wirausaha: {
    inactive: '!border-[#FDE68A] !bg-[#FFFDF5] !text-[#92400E] hover:!bg-[#FFF7DD]',
    active: '!border-[#F59E0B] !bg-[#FCE9B2] !text-[#78350F] !ring-2 !ring-[#FCD34D]/75 !shadow-sm hover:!bg-[#F9DF9A]',
  },
  pengembangan_diri: {
    inactive: '!border-[#BBF7D0] !bg-[#F6FFF9] !text-[#166534] hover:!bg-[#EAFCF0]',
    active: '!border-[#4ADE80] !bg-[#CCF8DB] !text-[#14532D] !ring-2 !ring-[#86EFAC]/75 !shadow-sm hover:!bg-[#BAF3CD]',
  },
  organisasi: {
    inactive: '!border-[#BAE6FD] !bg-[#F5FBFF] !text-[#155E75] hover:!bg-[#E9F7FF]',
    active: '!border-[#38BDF8] !bg-[#D2ECFD] !text-[#0C4A6E] !ring-2 !ring-[#7DD3FC]/75 !shadow-sm hover:!bg-[#C6E7FC]',
  },
  seminar: {
    inactive: '!border-[#CBD5E1] !bg-[#FAFBFD] !text-[#334155] hover:!bg-[#F3F6FA]',
    active: '!border-[#94A3B8] !bg-[#D8E0EA] !text-[#1E293B] !ring-2 !ring-[#B6C2D1]/75 !shadow-sm hover:!bg-[#CED8E3]',
  },
  pagelaran: {
    inactive: '!border-[#BFDBFE] !bg-[#F4F9FF] !text-[#1E3A8A] hover:!bg-[#E8F3FF]',
    active: '!border-[#60A5FA] !bg-[#D6EAFE] !text-[#1E3A8A] !ring-2 !ring-[#93C5FD]/75 !shadow-sm hover:!bg-[#C9E3FD]',
  },
};

export function AchievementImportDialog({ open, onOpenChange, scope, onImportCompleted }: AchievementImportDialogProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isProductOnlyScope = scope === 'productOnly';
  const isResearchOutputScope = scope === 'researchOutputs' || scope === 'researchOutputsHki' || scope === 'researchOutputsTechnology' || scope === 'researchOutputsBooks';
  const researchScopeMeta = isResearchOutputScope
    ? RESEARCH_OUTPUT_SCOPE_META[scope as keyof typeof RESEARCH_OUTPUT_SCOPE_META]
    : null;
  const isPublicationsScope = scope === 'publicationsJurnal' || scope === 'publicationsSeminar' || scope === 'publicationsPagelaran';
  const publicationScopeMeta = isPublicationsScope ? PUBLICATIONS_SCOPE_META[scope] : null;
  const fixedScopeCategory = publicationScopeMeta?.category
    ?? researchScopeMeta?.category
    ?? (isProductOnlyScope ? 'produk_mahasiswa' : null);

  const [activeGroup, setActiveGroup] = useState<'academic' | 'non_academic'>('academic');
  const [activeCategory, setActiveCategory] = useState<AchievementImportCategory | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [summary, setSummary] = useState<AchievementImportSummary | null>(null);
  const [rowDetails, setRowDetails] = useState<AchievementImportRowError[]>([]);
  const isFixedSingleCategoryScope = isProductOnlyScope
    || isPublicationsScope
    || scope === 'researchOutputsHki'
    || scope === 'researchOutputsTechnology'
    || scope === 'researchOutputsBooks';

  const scopeCategories = useMemo(() => resolveImportCategoriesByScope(scope), [scope]);

  const visibleCategories = useMemo(() => {
    if (fixedScopeCategory) return [fixedScopeCategory];
    if (scope === 'researchOutputs') return RESEARCH_OUTPUT_IMPORT_CATEGORIES;
    if (scope === 'all') {
      return activeGroup === 'academic' ? ACADEMIC_IMPORT_CATEGORIES : NON_ACADEMIC_IMPORT_CATEGORIES;
    }
    return resolveImportCategoriesByScope(scope);
  }, [activeGroup, fixedScopeCategory, scope]);

  const resolvedCategory = activeCategory ?? fixedScopeCategory;
  const dialogTitle = isProductOnlyScope
    ? 'Unggah Produk Mahasiswa Excel'
    : (researchScopeMeta?.title ?? (publicationScopeMeta?.title ?? 'Unggah Prestasi Excel'));
  const dialogDescription = isProductOnlyScope
    ? 'Kategori otomatis: Produk Mahasiswa. Unduh template, lalu unggah file Excel produk mahasiswa.'
    : (researchScopeMeta?.description ?? (publicationScopeMeta?.description ?? `Scope aktif: ${SCOPE_LABEL[scope]}. Pilih kategori, unduh template, lalu unggah file Excel.`));

  useEffect(() => {
    if (scope === 'researchOutputs') {
      setActiveGroup('non_academic');
      setActiveCategory('research_output_hki');
      return;
    }
    if (scope === 'researchOutputsHki') {
      setActiveGroup('non_academic');
      setActiveCategory('research_output_hki');
      return;
    }
    if (scope === 'researchOutputsTechnology') {
      setActiveGroup('non_academic');
      setActiveCategory('research_output_technology');
      return;
    }
    if (scope === 'researchOutputsBooks') {
      setActiveGroup('academic');
      setActiveCategory('research_output_books');
      return;
    }
  }, [scope]);

  useEffect(() => {
    if (scope === 'researchOutputs' || scope === 'researchOutputsHki' || scope === 'researchOutputsTechnology' || scope === 'researchOutputsBooks') {
      return;
    }
    if (scope === 'academic') {
      setActiveGroup('academic');
      setActiveCategory(null);
      return;
    }
    if (scope === 'nonAcademic') {
      setActiveGroup('non_academic');
      setActiveCategory(null);
      return;
    }
    if (scope === 'productOnly') {
      setActiveGroup('non_academic');
      setActiveCategory('produk_mahasiswa');
      return;
    }
    if (scope === 'publicationsJurnal') {
      setActiveGroup('academic');
      setActiveCategory('jurnal');
      return;
    }
    if (scope === 'publicationsSeminar') {
      setActiveGroup('non_academic');
      setActiveCategory('seminar');
      return;
    }
    if (scope === 'publicationsPagelaran') {
      setActiveGroup('non_academic');
      setActiveCategory('pagelaran');
    }
  }, [scope]);

  useEffect(() => {
    if (scope === 'researchOutputs') {
      if (activeCategory == null) {
        setActiveCategory('research_output_hki');
      }
    }
  }, [activeCategory, scope]);


  useEffect(() => {
    if (fixedScopeCategory) return;
    setActiveCategory(null);
  }, [activeGroup, fixedScopeCategory]);

  useEffect(() => {
    if (scopeCategories.length === 0) return;
    if (activeCategory !== null && !scopeCategories.includes(activeCategory)) {
      setActiveCategory(scopeCategories[0]);
    }
  }, [activeCategory, scopeCategories]);

  useEffect(() => {
    if (visibleCategories.length === 0) return;
    if (activeCategory !== null && !visibleCategories.includes(activeCategory)) {
      setActiveCategory(visibleCategories[0]);
    }
  }, [activeCategory, visibleCategories]);

  useEffect(() => {
    if (!open) {
      setSelectedFile(null);
      setSummary(null);
      setRowDetails([]);
      setIsDragOver(false);
      setIsDownloading(false);
      setIsImporting(false);
      setIsLoadingDetails(false);
    } else {
      setActiveCategory(fixedScopeCategory);
    }
  }, [fixedScopeCategory, open]);

  const processPickedFile = useCallback((file: File | null) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      toast({
        title: 'Format file tidak didukung',
        description: 'Hanya file .xlsx yang dapat diunggah.',
        variant: 'destructive',
      });
      return;
    }
    setSelectedFile(file);
  }, [toast]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    if (isDownloading || isImporting) return;
    processPickedFile(event.dataTransfer.files?.[0] ?? null);
  }, [isDownloading, isImporting, processPickedFile]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDownloadTemplate = async () => {
    if (!resolvedCategory) return;
    setIsDownloading(true);
    try {
      const response = await downloadAchievementImportTemplateViaAPI(resolvedCategory);
      if (!response.success) {
        toast({
          title: 'Download template gagal',
          description: response.error ?? 'Unknown error',
          variant: 'destructive',
        });
        return;
      }
      toast({ title: 'Template berhasil diunduh' });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleImport = async () => {
    if (!resolvedCategory) return;
    if (!selectedFile) {
      toast({
        title: 'File belum dipilih',
        description: 'Silakan pilih file .xlsx untuk diimport.',
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true);
    setSummary(null);
    setRowDetails([]);

    let importedSummary: AchievementImportSummary | null = null;
    let nonInsertedDetails: AchievementImportRowError[] = [];

    try {
      const importResponse = await importAchievementsFromExcelViaAPI(resolvedCategory, selectedFile);
      if (!importResponse.success || !importResponse.data) {
        toast({
          title: 'Import gagal',
          description: importResponse.error ?? 'Unknown error',
          variant: 'destructive',
        });
        return;
      }

      importedSummary = importResponse.data;
      setSummary(importedSummary);
      setSelectedFile(null);
      toast({
        title: 'Import selesai',
        description: `Sukses ${importedSummary.success_rows} baris, duplikat ${importedSummary.duplicate_rows}, error ${importedSummary.error_rows}.`,
      });

      setIsLoadingDetails(true);
      const detailResponse = await getAchievementImportLogDetailViaAPI(importedSummary.import_log_id);
      if (!detailResponse.success || !detailResponse.data) {
        toast({
          title: 'Gagal memuat detail baris',
          description: detailResponse.error ?? 'Summary tetap tersedia.',
          variant: 'destructive',
        });
      } else {
        nonInsertedDetails = detailResponse.data.details.filter((detail) => detail.status !== 'inserted');
        setRowDetails(nonInsertedDetails);
      }
    } finally {
      setIsLoadingDetails(false);
      setIsImporting(false);
    }

    if (importedSummary && onImportCompleted) {
      onImportCompleted({
        summary: importedSummary,
        details: nonInsertedDetails,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-foreground">{dialogTitle}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {dialogDescription}
          </p>
        </DialogHeader>

        <div className="space-y-5">
          {scope === 'all' && (
            <section className="space-y-2 rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Kelompok Prestasi
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Tabs value={activeGroup} onValueChange={(next) => setActiveGroup(next as 'academic' | 'non_academic')}>
                  <TabsList className="grid h-auto w-full max-w-xl grid-cols-2 rounded-lg border border-border bg-muted/50 p-1">
                    <TabsTrigger value="academic" className={GROUP_TAB_TRIGGER_CLASS.academic}>Akademik</TabsTrigger>
                    <TabsTrigger value="non_academic" className={GROUP_TAB_TRIGGER_CLASS.non_academic}>Non Akademik</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleDownloadTemplate()}
                  disabled={!resolvedCategory || isDownloading || isImporting}
                  className="shrink-0 opacity-100 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isDownloading ? 'Mengunduh...' : resolvedCategory ? `Download Template ${ACHIEVEMENT_IMPORT_CATEGORY_META[resolvedCategory].label}` : 'Download Template'}
                </Button>
              </div>
            </section>
          )}

          <section className="space-y-2 rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {isFixedSingleCategoryScope
                  ? 'Kategori Import'
                  : (scope === 'researchOutputs'
                    ? 'Pilih Template Luaran'
                    : (scope === 'all' ? 'Kategori Prestasi' : 'Pilih Kategori Prestasi'))
                  }
              </p>
              {scope !== 'all' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleDownloadTemplate()}
                  disabled={!resolvedCategory || isDownloading || isImporting}
                  className="shrink-0 opacity-100 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isDownloading ? 'Mengunduh...' : resolvedCategory ? `Download Template ${ACHIEVEMENT_IMPORT_CATEGORY_META[resolvedCategory].label}` : 'Download Template'}
                </Button>
              )}
            </div>
            {isFixedSingleCategoryScope ? (
              <div className="inline-flex h-10 items-center rounded-lg border border-[#38BDF8] bg-[#CBEAFE] px-4 text-sm font-semibold text-[#0C4A6E] shadow-sm">
                {resolvedCategory ? ACHIEVEMENT_IMPORT_CATEGORY_META[resolvedCategory].label : '-'}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {visibleCategories.map((category) => {
                  const isActive = category === activeCategory;
                  return (
                    <Button
                      key={category}
                      type="button"
                      variant="outline"
                      className={cn(
                        'h-10 rounded-lg px-4 text-sm font-semibold shadow-none transition-all duration-200',
                        isActive && '-translate-y-px',
                        isActive ? CATEGORY_BUTTON_CLASS[category].active : CATEGORY_BUTTON_CLASS[category].inactive,
                        'dark:!border-border dark:!bg-muted/40 dark:!text-foreground dark:hover:!bg-muted/60',
                        isActive && 'dark:!border-primary dark:!bg-primary/30 dark:!text-primary-foreground dark:hover:!bg-primary/40'
                      )}
                      onClick={() => setActiveCategory(category)}
                    >
                      {ACHIEVEMENT_IMPORT_CATEGORY_META[category].label}
                    </Button>
                  );
                })}
              </div>
            )}
          </section>

          <div
            role="button"
            tabIndex={0}
            className={cn(
              'rounded-xl border-2 border-dashed p-8 text-center transition-colors',
              isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/20',
              (isImporting || isDownloading) && 'pointer-events-none opacity-80'
            )}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                fileInputRef.current?.click();
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={(event) => {
                processPickedFile(event.target.files?.[0] ?? null);
                event.target.value = '';
              }}
            />
            <div className="mx-auto flex max-w-xl flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <UploadCloud className="h-6 w-6 text-primary" />
              </div>
              <p className="font-medium text-foreground">Drag & drop file Excel atau klik untuk memilih</p>
              <p className="text-xs text-muted-foreground">Format yang didukung: .xlsx</p>
              {selectedFile && (
                <p className="text-sm text-foreground">
                  File terpilih: <span className="font-medium">{selectedFile.name}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              onClick={() => void handleImport()}
              disabled={!resolvedCategory || !selectedFile || isImporting || isDownloading}
            >
              {isImporting
                ? 'Mengimpor...'
                : (isProductOnlyScope
                  ? 'Import Produk Mahasiswa'
                  : (researchScopeMeta?.importActionLabel ?? (publicationScopeMeta?.importActionLabel ?? 'Import Prestasi')))}
            </Button>
          </div>

          {summary && (
            <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">Ringkasan Hasil Import</h3>
                <p className="text-xs text-muted-foreground">
                  Kategori: {ACHIEVEMENT_IMPORT_CATEGORY_META[summary.kategori]?.label ?? summary.kategori}
                </p>
              </div>
              <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div>Total baris: <span className="font-semibold">{summary.total_rows}</span></div>
                <div>Baris valid: <span className="font-semibold">{summary.valid_rows}</span></div>
                <div>Baris kosong: <span className="font-semibold">{summary.empty_rows}</span></div>
                <div>Baris error: <span className="font-semibold">{summary.error_rows}</span></div>
                <div>Baris duplikat: <span className="font-semibold">{summary.duplicate_rows}</span></div>
                <div>Baris sukses: <span className="font-semibold">{summary.success_rows}</span></div>
                <div>Mahasiswa terdampak: <span className="font-semibold">{summary.affected_students}</span></div>
                <div>Log ID: <span className="font-mono text-xs">{summary.import_log_id}</span></div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Detail baris non-inserted (error/duplikat/kosong):</p>
                {isLoadingDetails ? (
                  <p className="text-sm text-muted-foreground">Memuat detail baris...</p>
                ) : rowDetails.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Tidak ada baris bermasalah.</p>
                ) : (
                  <div className="overflow-x-auto rounded-md border bg-background">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/30 text-left">
                          <th className="px-3 py-2">Baris</th>
                          <th className="px-3 py-2">NIM</th>
                          <th className="px-3 py-2">Status</th>
                          <th className="px-3 py-2">Pesan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rowDetails.map((detail) => (
                          <tr key={detail.id} className="border-b last:border-0">
                            <td className="px-3 py-2 align-top">{detail.row_number}</td>
                            <td className="px-3 py-2 align-top">{detail.nim_raw || '-'}</td>
                            <td className="px-3 py-2 align-top">
                              <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', ROW_STATUS_META[detail.status].className)}>
                                {ROW_STATUS_META[detail.status].label}
                              </span>
                            </td>
                            <td className="px-3 py-2 align-top">{detail.message || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
