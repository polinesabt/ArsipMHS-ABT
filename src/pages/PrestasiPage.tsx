import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAlumni } from '@/contexts/AlumniContext';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from '@/components/shared';
import { AchievementFormModal } from '@/components/shared/AchievementFormModal';
import { 
  CategorySidebar, 
  AchievementTimelineView, 
  StudentProfileHeader,
  type CategoryFilter 
} from '@/components/prestasi';
import {
  ChevronLeft, Plus, X, Check, Paperclip, CalendarIcon
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Achievement,
  AchievementCategory,
  ACHIEVEMENT_CATEGORIES,
  STUDENT_PRODUCT_CATEGORIES,
  STUDENT_PRODUCT_CATEGORY_LABELS,
} from '@/types/achievement.types';
import {
  createAchievementViaAPI,
  deleteAchievementAttachmentViaAPI,
  deleteAchievementViaAPI,
  getAchievementsFromAPI,
  uploadAchievementAttachmentViaAPI,
  updateAchievementViaAPI,
} from '@/repositories/api-student.repository';
import { mapApiAchievementToUi, mapUiAchievementToApiPayload } from '@/lib/achievement-api-mapper';
import { getAchievementTypeFromUiCategory, getAchievementTypeLabel } from '@/lib/achievement-classification';
import { isValidHttpUrl } from '@/lib/chart-record-link-utils';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const VALID_CATEGORY_FILTERS = new Set<CategoryFilter>([
  'all',
  'unggulan',
  'lomba',
  'seminar',
  'pagelaran',
  'publikasi',
  'haki',
  'luaran_penelitian',
  'magang',
  'portofolio',
  'produk_mahasiswa',
  'wirausaha',
  'pengembangan',
  'organisasi',
]);

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  lomba: 'Lomba',
  seminar: 'Publikasi di Seminar',
  pagelaran: 'Pagelaran / Presentasi',
  publikasi: 'Karya Ilmiah & Publikasi',
  haki: 'Kekayaan Intelektual',
  luaran_penelitian: 'Luaran Penelitian',
  magang: 'Pengalaman Magang',
  portofolio: 'Portofolio Praktikum Kelas',
  produk_mahasiswa: 'Produk Mahasiswa',
  wirausaha: 'Pengalaman Wirausaha',
  pengembangan: 'Program Pengembangan Diri',
  organisasi: 'Organisasi & Kepemimpinan',
};

const ACADEMIC_CATEGORY_ORDER: AchievementCategory[] = ['publikasi', 'portofolio'];

const NON_ACADEMIC_CATEGORY_ORDER: AchievementCategory[] = [
  'lomba',
  'haki',
  'luaran_penelitian',
  'magang',
  'produk_mahasiswa',
  'wirausaha',
  'pengembangan',
  'organisasi',
  'seminar',
  'pagelaran',
];

function isValidCategoryFilter(value: string | null): value is CategoryFilter {
  return !!value && VALID_CATEGORY_FILTERS.has(value as CategoryFilter);
}

export default function PrestasiPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedAlumni } = useAlumni();
  const { toast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [stats, setStats] = useState<Record<AchievementCategory, number>>({
    lomba: 0, seminar: 0, pagelaran: 0, publikasi: 0, haki: 0, luaran_penelitian: 0, magang: 0, portofolio: 0, produk_mahasiswa: 0, wirausaha: 0, pengembangan: 0, organisasi: 0
  });
  const [unggulanCount, setUnggulanCount] = useState(0);
  const [highestLevel, setHighestLevel] = useState<string | null>(null);
  const categoryParam = searchParams.get('category');
  const activeCategory: CategoryFilter = isValidCategoryFilter(categoryParam) ? categoryParam : 'all';

  const getCategorySearchParams = (category: CategoryFilter) => {
    const nextParams = new URLSearchParams(searchParams);
    if (category === 'all') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', category);
    }
    return nextParams;
  };

  const buildCategoryHref = (category: CategoryFilter) => {
    const nextParams = getCategorySearchParams(category);
    const query = nextParams.toString();
    return query ? `${location.pathname}?${query}` : location.pathname;
  };

  const handleCategoryChange = (category: CategoryFilter) => {
    setSearchParams(getCategorySearchParams(category));
    setExpandedId(null);
  };

  const computeStats = (items: Achievement[]) => ({
    lomba: items.filter(a => a.category === 'lomba').length,
    seminar: items.filter(a => a.category === 'seminar').length,
    pagelaran: items.filter(a => a.category === 'pagelaran').length,
    publikasi: items.filter(a => a.category === 'publikasi').length,
    haki: items.filter(a => a.category === 'haki').length,
    luaran_penelitian: items.filter(a => a.category === 'luaran_penelitian').length,
    magang: items.filter(a => a.category === 'magang').length,
    portofolio: items.filter(a => a.category === 'portofolio').length,
    produk_mahasiswa: items.filter(a => a.category === 'produk_mahasiswa').length,
    wirausaha: items.filter(a => a.category === 'wirausaha').length,
    pengembangan: items.filter(a => a.category === 'pengembangan').length,
    organisasi: items.filter(a => a.category === 'organisasi').length,
  });

  const computeHighestLevel = (items: Achievement[]): string | null => {
    const levelHierarchy: Record<string, number> = {
      internasional: 4,
      nasional: 3,
      regional: 2,
      lokal: 1,
    };
    let highestLevel: string | null = null;
    let highestScore = 0;
    items.forEach((achievement) => {
      if (achievement.category === 'lomba') {
        const tingkat = achievement.tingkat;
        const score = levelHierarchy[tingkat] || 0;
        if (score > highestScore) {
          highestScore = score;
          highestLevel = tingkat;
        }
      }
    });
    return highestLevel;
  };

  const refreshData = useCallback(async () => {
    if (!selectedAlumni) return;

    try {
      const response = await getAchievementsFromAPI(selectedAlumni.id, { includeAttachments: true });
      if (!response.success || !response.data) {
        setAchievements([]);
        setStats({
          lomba: 0, seminar: 0, pagelaran: 0, publikasi: 0, haki: 0, luaran_penelitian: 0, magang: 0, portofolio: 0, produk_mahasiswa: 0, wirausaha: 0, pengembangan: 0, organisasi: 0
        });
        setUnggulanCount(0);
        setHighestLevel(null);
        return;
      }

      let apiRows: unknown = response.data;
      if (typeof apiRows === 'string') {
        try {
          const parsed = JSON.parse(apiRows) as { data?: unknown };
          apiRows = parsed.data ?? parsed;
        } catch {
          throw new Error('Format respons prestasi tidak valid.');
        }
      }

      if (!Array.isArray(apiRows)) {
        throw new Error('Data prestasi tidak berbentuk daftar.');
      }

      const mapped = (apiRows as Array<Parameters<typeof mapApiAchievementToUi>[0]>).map(mapApiAchievementToUi);
      setAchievements(mapped);
      setStats(computeStats(mapped));
      setUnggulanCount(mapped.filter(a => a.isUnggulan).length);
      setHighestLevel(computeHighestLevel(mapped));
    } catch (error) {
      console.error('Failed to refresh achievements', error);
      setAchievements([]);
      setStats({
        lomba: 0, seminar: 0, pagelaran: 0, publikasi: 0, haki: 0, luaran_penelitian: 0, magang: 0, portofolio: 0, produk_mahasiswa: 0, wirausaha: 0, pengembangan: 0, organisasi: 0
      });
      setUnggulanCount(0);
      setHighestLevel(null);
      toast({
        title: 'Gagal memuat prestasi',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengambil data prestasi.',
        variant: 'destructive',
      });
    }
  }, [selectedAlumni, toast]);

  useEffect(() => {
    if (!selectedAlumni) {
      navigate('/validasi');
      return;
    }
    void refreshData();
  }, [selectedAlumni, navigate, refreshData]);

  useEffect(() => {
    const handleWindowFocus = () => {
      void refreshData();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void refreshData();
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshData]);

  const handleItemClick = (achievement: Achievement) => {
    setExpandedId(prev => prev === achievement.id ? null : achievement.id);
  };

  const handleEdit = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setIsFormOpen(true);
  };

  const handleDelete = (achievement: Achievement) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus prestasi ini?')) {
      deleteAchievementViaAPI(achievement.id).then((response) => {
        if (!response.success) {
          toast({ title: 'Gagal menghapus prestasi', description: response.error || 'Terjadi kesalahan', variant: 'destructive' });
          return;
        }
        void refreshData();
        setExpandedId(null);
        toast({ title: 'Prestasi berhasil dihapus' });
      });
    }
  };

  const handleToggleFeatured = (achievement: Achievement) => {
    setAchievements(prev => prev.map(a => a.id === achievement.id ? { ...a, isUnggulan: !a.isUnggulan } : a));
    setUnggulanCount(prev => achievement.isUnggulan ? Math.max(prev - 1, 0) : prev + 1);
    toast({ 
      title: achievement.isUnggulan ? 'Dihapus dari unggulan' : 'Ditandai sebagai unggulan' 
    });
  };

  if (!selectedAlumni) return null;

  const filteredAchievements = activeCategory === 'all' 
    ? achievements 
    : activeCategory === 'unggulan'
    ? achievements.filter(a => a.isUnggulan)
    : achievements.filter(a => a.category === activeCategory);
  const totalAchievements = Object.values(stats).reduce((a, b) => a + b, 0);

  // Get category for form (default to lomba if 'all' or 'unggulan' is selected)
  const formCategory: AchievementCategory = activeCategory === 'all' || activeCategory === 'unggulan' ? 'lomba' : activeCategory;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-3 sm:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Back Button + Page Title */}
            <div className="mb-6 flex flex-wrap items-start gap-3 animate-fade-up">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/dashboard')}
                className="flex-shrink-0 -ml-2"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  Prestasi Mahasiswa
                </h1>
                <p className="text-sm text-muted-foreground">
                  Portofolio pencapaian akademik & non-akademik
                </p>
              </div>
              <div className="hidden flex-1 sm:block" />
              <Button onClick={() => { setEditingAchievement(null); setIsFormOpen(true); }} className="hidden sm:flex shadow-soft">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Prestasi
              </Button>
            </div>

            {/* Student Profile Header */}
            <div className="animate-fade-up" style={{ animationDelay: '0.05s' }}>
              <StudentProfileHeader 
                student={selectedAlumni}
                stats={stats}
                studentStatus="alumni"
                unggulanCount={unggulanCount}
                highestLevel={highestLevel}
              />
            </div>

            {/* Two-Column Layout: Sidebar + Main Content */}
            <div className="flex flex-col gap-6 animate-fade-up lg:flex-row" style={{ animationDelay: '0.1s' }}>
              {/* Category Sidebar */}
              <CategorySidebar
                activeCategory={activeCategory}
                stats={stats}
                unggulanCount={unggulanCount}
                onCategoryChange={handleCategoryChange}
                buildCategoryHref={buildCategoryHref}
              />

              {/* Main Content Area */}
              <div className="flex-1 min-w-0">
                {/* Category Header Card */}
                <div className="bg-card border border-border/50 rounded-2xl p-4 sm:p-5 shadow-soft mb-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">
                        {activeCategory === 'all' ? 'Semua Prestasi' : 
                          activeCategory === 'lomba' ? 'Lomba' :
                          activeCategory === 'seminar' ? 'Publikasi di Seminar' :
                          activeCategory === 'pagelaran' ? 'Pagelaran / Presentasi' :
                          activeCategory === 'publikasi' ? 'Karya Ilmiah & Publikasi' :
                          activeCategory === 'haki' ? 'Kekayaan Intelektual' :
                          activeCategory === 'luaran_penelitian' ? 'Luaran Penelitian' :
                          activeCategory === 'magang' ? 'Pengalaman Magang' :
                          activeCategory === 'portofolio' ? 'Portofolio Praktikum Kelas' :
                          activeCategory === 'produk_mahasiswa' ? 'Produk Mahasiswa' :
                          activeCategory === 'wirausaha' ? 'Pengalaman Wirausaha' :
                          activeCategory === 'pengembangan' ? 'Program Pengembangan Diri' :
                          activeCategory === 'organisasi' ? 'Organisasi & Kepemimpinan' :
                          'Prestasi'}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {filteredAchievements.length} pencapaian tercatat
                      </p>
                    </div>
                    <Button 
                      onClick={() => { setEditingAchievement(null); setIsFormOpen(true); }} 
                      size="sm" 
                      className="sm:hidden"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Timeline View */}
                <AchievementTimelineView
                  achievements={filteredAchievements}
                  category={activeCategory}
                  expandedId={expandedId}
                  onItemClick={handleItemClick}
                  onAddNew={() => { setEditingAchievement(null); setIsFormOpen(true); }}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleFeatured={handleToggleFeatured}
                />
              </div>
            </div>

            {/* Mobile FAB */}
            <Button
              onClick={() => { setEditingAchievement(null); setIsFormOpen(true); }}
              className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-elevated sm:hidden"
              size="icon"
            >
              <Plus className="w-6 h-6" />
            </Button>

            {/* Form Modal */}
            {isFormOpen && (
              <AchievementFormModal
                masterId={selectedAlumni.id}
                category={editingAchievement?.category || formCategory}
                editData={editingAchievement}
                onClose={() => {
                  setIsFormOpen(false);
                  setEditingAchievement(null);
                }}
                onSuccess={() => {
                  setIsFormOpen(false);
                  setEditingAchievement(null);
                  void refreshData();
                  toast({ title: editingAchievement ? 'Prestasi berhasil diperbarui!' : 'Prestasi berhasil ditambahkan!' });
                }}
                useApi
                renderMode="modal"
                categoryScope="all"
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Achievement Form Component with Edit Support
function AchievementForm({
  category,
  masterId,
  editData,
  onClose,
  onSuccess,
}: {
  category: AchievementCategory;
  masterId: string;
  editData?: Achievement | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory>(editData?.category || category);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formData, setFormData] = useState<Record<string, any>>(editData || {});
  type FormAttachmentCandidate = {
    id?: string;
    attachmentId?: string;
    file?: File;
    fileName?: string;
  };

  const { toast } = useToast();

  const getAttachmentId = (attachment: FormAttachmentCandidate): string =>
    attachment.attachmentId?.trim() || attachment.id?.trim() || '';

  const isPendingUploadAttachment = (
    attachment: FormAttachmentCandidate
  ): attachment is FormAttachmentCandidate & { file: File } => attachment.file instanceof File;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation for Organisasi category
    if (selectedCategory === 'organisasi') {
      // tanggalMulai is required
      if (!formData.tanggalMulai) {
        toast({
          title: 'Validasi gagal',
          description: 'Tanggal masuk organisasi wajib diisi.',
          variant: 'destructive',
        });
        return;
      }

      // tanggalSelesai required when masihAktif is false
      if (formData.masihAktif === false && !formData.tanggalSelesai) {
        toast({
          title: 'Validasi gagal',
          description: 'Tanggal selesai keanggotaan wajib diisi jika keanggotaan sudah berakhir.',
          variant: 'destructive',
        });
        return;
      }

      // tanggalMulai cannot be after tanggalSelesai
      if (formData.masihAktif === false && formData.tanggalMulai && formData.tanggalSelesai) {
        const startDate = new Date(formData.tanggalMulai);
        const endDate = new Date(formData.tanggalSelesai);
        if (startDate > endDate) {
          toast({
            title: 'Validasi gagal',
            description: 'Tanggal masuk tidak boleh setelah tanggal selesai keanggotaan.',
            variant: 'destructive',
          });
          return;
        }
      }
    }

    // Validation for Portofolio category: mataKuliahCustom required when mataKuliah is 'other'
    if (selectedCategory === 'portofolio' && formData.mataKuliah === 'other' && (!formData.mataKuliahCustom || !formData.mataKuliahCustom.trim())) {
      toast({
        title: 'Validasi gagal',
        description: 'Nama mata kuliah lainnya wajib diisi.',
        variant: 'destructive',
      });
      return;
    }

    if (selectedCategory === 'seminar') {
      const judulPublikasi = String(formData.judulPublikasi || formData.namaSeminar || '').trim();
      const levelSeminar = String(formData.levelSeminar || '').trim();
      const jenisPerolehan = String(formData.jenisPerolehan || 'mandiri').trim();
      const tanggalPublikasi = String(formData.tanggalPublikasi || formData.tanggalSeminar || '').trim();

      if (judulPublikasi === '') {
        toast({
          title: 'Validasi gagal',
          description: 'Judul publikasi seminar wajib diisi.',
          variant: 'destructive',
        });
        return;
      }

      if (!['local', 'national', 'international'].includes(levelSeminar)) {
        toast({
          title: 'Validasi gagal',
          description: 'Level kegiatan wajib dipilih.',
          variant: 'destructive',
        });
        return;
      }

      if (!['mandiri', 'kolaborasi_dosen'].includes(jenisPerolehan)) {
        toast({
          title: 'Validasi gagal',
          description: 'Jenis perolehan wajib dipilih.',
          variant: 'destructive',
        });
        return;
      }

      if (jenisPerolehan === 'kolaborasi_dosen' && (!formData.namaDosen || !String(formData.namaDosen).trim())) {
        toast({
          title: 'Validasi gagal',
          description: 'Nama dosen wajib diisi jika perolehan kolaborasi dosen.',
          variant: 'destructive',
        });
        return;
      }

      if (tanggalPublikasi === '') {
        toast({
          title: 'Validasi gagal',
          description: 'Tanggal kegiatan wajib diisi.',
          variant: 'destructive',
        });
        return;
      }
    }

    if (selectedCategory === 'pagelaran') {
      const judulPublikasi = String(formData.judulPublikasi || formData.namaSeminar || '').trim();
      const levelSeminar = String(formData.levelSeminar || '').trim();
      const tanggalPublikasi = String(formData.tanggalPublikasi || formData.tanggalSeminar || '').trim();
      const jenisKegiatan = String(formData.jenisKegiatan || '').trim();

      if (judulPublikasi === '') {
        toast({
          title: 'Validasi gagal',
          description: 'Judul kegiatan pagelaran/presentasi wajib diisi.',
          variant: 'destructive',
        });
        return;
      }

      if (jenisKegiatan === '') {
        toast({
          title: 'Validasi gagal',
          description: 'Jenis kegiatan pagelaran/presentasi wajib dipilih.',
          variant: 'destructive',
        });
        return;
      }

      if (!['local', 'national', 'international'].includes(levelSeminar)) {
        toast({
          title: 'Validasi gagal',
          description: 'Level kegiatan wajib dipilih.',
          variant: 'destructive',
        });
        return;
      }

      if (tanggalPublikasi === '') {
        toast({
          title: 'Validasi gagal',
          description: 'Tanggal kegiatan wajib diisi.',
          variant: 'destructive',
        });
        return;
      }
    }

    if (selectedCategory === 'produk_mahasiswa') {
      if (!formData.namaProduk || !String(formData.namaProduk).trim()) {
        toast({
          title: 'Validasi gagal',
          description: 'Nama produk wajib diisi.',
          variant: 'destructive',
        });
        return;
      }
      if (!formData.kategoriProduk || !String(formData.kategoriProduk).trim()) {
        toast({
          title: 'Validasi gagal',
          description: 'Kategori produk wajib dipilih.',
          variant: 'destructive',
        });
        return;
      }
      if (
        formData.kategoriProduk === 'lainnya'
        && (!formData.kategoriProdukLainnya || !String(formData.kategoriProdukLainnya).trim())
      ) {
        toast({
          title: 'Validasi gagal',
          description: 'Kategori produk lainnya wajib diisi.',
          variant: 'destructive',
        });
        return;
      }
      if (!formData.tanggalAdopsi || !String(formData.tanggalAdopsi).trim()) {
        toast({
          title: 'Validasi gagal',
          description: 'Tanggal adopsi wajib diisi.',
          variant: 'destructive',
        });
        return;
      }
      const linkProduk = String(formData.linkProduk || '').trim();
      if (linkProduk !== '' && !isValidHttpUrl(linkProduk)) {
        toast({
          title: 'Validasi gagal',
          description: 'Link produk harus berupa URL valid (http/https).',
          variant: 'destructive',
        });
        return;
      }
    }
    
    const payload = mapUiAchievementToApiPayload(masterId, selectedCategory, formData);
    try {
      let achievementId = editData?.id ?? '';
      if (editData) {
        const response = await updateAchievementViaAPI(editData.id, payload);
        if (!response.success) {
          throw new Error(response.error || 'Gagal memperbarui prestasi');
        }
      } else {
        const response = await createAchievementViaAPI(payload);
        if (!response.success) {
          throw new Error(response.error || 'Gagal menambahkan prestasi');
        }
        const createdId =
          (response.data && typeof (response.data as Record<string, unknown>).id === 'string'
            ? ((response.data as Record<string, unknown>).id as string)
            : '') ||
          (typeof (response as unknown as { id?: unknown }).id === 'string'
            ? ((response as unknown as { id?: string }).id as string)
            : '');
        achievementId = createdId;
      }

      if (!achievementId) {
        throw new Error('ID prestasi tidak ditemukan setelah simpan data.');
      }

      const formAttachments = (Array.isArray(formData.attachments) ? formData.attachments : []) as FormAttachmentCandidate[];
      const keptPersistedAttachmentIds = new Set(
        formAttachments
          .filter((attachment) => !isPendingUploadAttachment(attachment))
          .map((attachment) => getAttachmentId(attachment))
          .filter((attachmentId: string) => attachmentId !== '')
      );
      const removedPersistedAttachmentIds = editData
        ? (Array.isArray(editData.attachments) ? editData.attachments : [])
            .map((attachment) => String(attachment.attachmentId || attachment.id || ''))
            .filter((attachmentId: string) => attachmentId !== '' && !keptPersistedAttachmentIds.has(attachmentId))
        : [];

      const failedDeletes: string[] = [];
      for (const attachmentId of removedPersistedAttachmentIds) {
        const deleteRes = await deleteAchievementAttachmentViaAPI(attachmentId);
        if (deleteRes.success) continue;
        failedDeletes.push(`${attachmentId}: ${deleteRes.error || 'Gagal hapus'}`);
      }

      const pendingUploads = formAttachments.filter((attachment) => isPendingUploadAttachment(attachment));
      const failedUploads: string[] = [];
      for (const attachment of pendingUploads) {
        const uploadRes = await uploadAchievementAttachmentViaAPI(achievementId, attachment.file as File);
        if (uploadRes.success) continue;
        const attachmentName = attachment.fileName?.trim() || attachment.file.name || 'File';
        failedUploads.push(`${attachmentName}: ${uploadRes.error || 'Gagal upload'}`);
      }

      if (failedDeletes.length > 0 || failedUploads.length > 0) {
        const failureMessages = [
          ...failedDeletes.map((message) => `Hapus ${message}`),
          ...failedUploads.map((message) => `Upload ${message}`),
        ];
        toast({
          title: 'Sebagian sinkronisasi lampiran gagal',
          description: failureMessages.slice(0, 2).join(' | '),
          variant: 'destructive',
        });
      }
      onSuccess();
    } catch (error) {
      toast({
        title: 'Gagal menyimpan',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan.',
        variant: 'destructive',
      });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateField = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const achievementTypeLabel = getAchievementTypeLabel(getAchievementTypeFromUiCategory(selectedCategory));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-auto bg-card border border-border rounded-2xl shadow-elevated animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {editData ? 'Edit Prestasi' : 'Tambah Prestasi'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="rounded-md border bg-muted/20 px-3 py-2">
            <p className="text-xs text-muted-foreground">Jenis Prestasi (otomatis)</p>
            <p className="text-sm font-medium text-foreground">{achievementTypeLabel}</p>
          </div>

          <div className="space-y-2">
            <Label>Kategori Prestasi</Label>
            <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as AchievementCategory)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Akademik</SelectLabel>
                  {ACADEMIC_CATEGORY_ORDER.map((key) => (
                    <SelectItem key={key} value={key}>{CATEGORY_LABELS[key]}</SelectItem>
                  ))}
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>Non-Akademik</SelectLabel>
                  {NON_ACADEMIC_CATEGORY_ORDER.map((key) => (
                    <SelectItem key={key} value={key}>{CATEGORY_LABELS[key]}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Dynamic Form Fields */}
          {selectedCategory === 'lomba' && <LombaFields formData={formData} updateField={updateField} />}
          {selectedCategory === 'seminar' && <SeminarFields formData={formData} updateField={updateField} />}
          {selectedCategory === 'pagelaran' && <PagelaranFields formData={formData} updateField={updateField} />}
          {selectedCategory === 'publikasi' && <PublikasiFields formData={formData} updateField={updateField} />}
          {selectedCategory === 'haki' && <HakiFields formData={formData} updateField={updateField} />}
          {selectedCategory === 'magang' && <MagangFields formData={formData} updateField={updateField} />}
          {selectedCategory === 'portofolio' && <PortofolioFields formData={formData} updateField={updateField} />}
          {selectedCategory === 'produk_mahasiswa' && <ProdukMahasiswaFields formData={formData} updateField={updateField} />}
          {selectedCategory === 'wirausaha' && <WirausahaFields formData={formData} updateField={updateField} />}
          {selectedCategory === 'pengembangan' && <PengembanganFields formData={formData} updateField={updateField} />}
          {selectedCategory === 'organisasi' && <OrganisasiFields formData={formData} updateField={updateField} />}

          {/* Attachments */}
          <div className="pt-4 border-t border-border">
            <Label className="flex items-center gap-2 mb-3">
              <Paperclip className="w-4 h-4" />
              Lampiran Dokumentasi
            </Label>
            <FileUpload
              value={formData.attachments || []}
              onChange={(attachments) => updateField('attachments', attachments)}
              maxFiles={5}
              maxSizeInMB={2}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Unggah sertifikat, foto dokumentasi, atau dokumen pendukung lainnya (maks. 5 file, 2 MB per file). Penghapusan lampiran lama diproses saat klik Simpan.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Batal
            </Button>
            <Button type="submit" className="flex-1">
              <Check className="w-4 h-4 mr-2" />
              {editData ? 'Simpan Perubahan' : 'Simpan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Form Field Components
interface FieldProps { 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formData: Record<string, any>; 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateField: (k: string, v: any) => void; 
}

function LombaFields({ formData, updateField }: FieldProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Nama Lomba *</Label>
        <Input 
          value={formData.namaLomba || ''} 
          onChange={(e) => updateField('namaLomba', e.target.value)} 
          placeholder="Contoh: Lomba Karya Tulis Ilmiah"
          required 
        />
      </div>
      <div>
        <Label>Penyelenggara *</Label>
        <Input 
          value={formData.penyelenggara || ''} 
          onChange={(e) => updateField('penyelenggara', e.target.value)} 
          placeholder="Contoh: Kemenristekdikti"
          required 
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Tingkat *</Label>
          <Select value={formData.tingkat || ''} onValueChange={(v) => updateField('tingkat', v)}>
            <SelectTrigger><SelectValue placeholder="Pilih tingkat" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="lokal">Lokal</SelectItem>
              <SelectItem value="regional">Regional</SelectItem>
              <SelectItem value="nasional">Nasional</SelectItem>
              <SelectItem value="internasional">Internasional</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Peran *</Label>
          <Select value={formData.peran || ''} onValueChange={(v) => updateField('peran', v)}>
            <SelectTrigger><SelectValue placeholder="Pilih peran" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="peserta">Peserta</SelectItem>
              <SelectItem value="juara">Juara</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Peringkat</Label>
          <Input 
            value={formData.peringkat || ''} 
            onChange={(e) => updateField('peringkat', e.target.value)} 
            placeholder="Contoh: Juara 1, Finalis"
          />
        </div>
        <div>
          <Label>Tahun *</Label>
          <Input 
            type="number" 
            value={formData.tahun || ''} 
            onChange={(e) => updateField('tahun', parseInt(e.target.value))} 
            placeholder="2024"
            required 
          />
        </div>
      </div>
      <div>
        <Label>Deskripsi</Label>
        <Textarea 
          value={formData.deskripsi || ''} 
          onChange={(e) => updateField('deskripsi', e.target.value)} 
          placeholder="Ceritakan pengalaman Anda..."
          rows={3}
        />
      </div>
    </div>
  );
}

function SeminarFields({ formData, updateField }: FieldProps) {
  const jenisPerolehan = formData.jenisPerolehan || 'mandiri';

  const handleJenisPerolehanChange = (value: string) => {
    updateField('jenisPerolehan', value);
    if (value !== 'kolaborasi_dosen') {
      updateField('namaDosen', undefined);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Judul Publikasi Seminar *</Label>
        <Input
          value={formData.judulPublikasi || ''}
          onChange={(e) => updateField('judulPublikasi', e.target.value)}
          placeholder="Contoh: Strategi Adopsi UMKM Berbasis Data"
          required
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Level Seminar *</Label>
          <Select value={formData.levelSeminar || ''} onValueChange={(v) => updateField('levelSeminar', v)}>
            <SelectTrigger><SelectValue placeholder="Pilih level seminar" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="local">Lokal/Wilayah/Perguruan Tinggi</SelectItem>
              <SelectItem value="national">Nasional</SelectItem>
              <SelectItem value="international">Internasional</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Perolehan Publikasi *</Label>
          <Select value={jenisPerolehan} onValueChange={handleJenisPerolehanChange}>
            <SelectTrigger><SelectValue placeholder="Pilih status perolehan" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="mandiri">Mandiri</SelectItem>
              <SelectItem value="kolaborasi_dosen">Bersama Dosen</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-out',
          jenisPerolehan === 'kolaborasi_dosen' ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="pt-1">
          <Label>Nama Dosen *</Label>
          <Input
            value={formData.namaDosen || ''}
            onChange={(e) => updateField('namaDosen', e.target.value)}
            placeholder="Contoh: Dr. Budi Santoso"
            required={jenisPerolehan === 'kolaborasi_dosen'}
          />
        </div>
      </div>
      <div>
        <Label>Tanggal Publikasi *</Label>
        <Input
          type="date"
          value={formData.tanggalPublikasi || ''}
          onChange={(e) => updateField('tanggalPublikasi', e.target.value)}
          required
        />
      </div>
      <div>
        <Label>Penulis</Label>
        <Input
          value={formData.penulis || ''}
          onChange={(e) => updateField('penulis', e.target.value)}
          placeholder="Nama penulis (pisahkan dengan koma)"
        />
      </div>
      <div>
        <Label>Nama Seminar / Konferensi</Label>
        <Input
          value={formData.namaSeminarKonferensi || ''}
          onChange={(e) => updateField('namaSeminarKonferensi', e.target.value)}
          placeholder="Contoh: Seminar Nasional Manajemen Terapan"
        />
      </div>
      <div>
        <Label>Penyelenggara</Label>
        <Input
          value={formData.penyelenggara || ''}
          onChange={(e) => updateField('penyelenggara', e.target.value)}
          placeholder="Contoh: Politeknik Negeri Semarang"
        />
      </div>
      <div>
        <Label>Link Publikasi (URL)</Label>
        <Input
          type="url"
          value={formData.urlPublikasi || ''}
          onChange={(e) => updateField('urlPublikasi', e.target.value)}
          placeholder="https://..."
        />
      </div>
      <div>
        <Label>Deskripsi</Label>
        <Textarea
          value={formData.deskripsi || ''}
          onChange={(e) => updateField('deskripsi', e.target.value)}
          placeholder="Ringkas isi publikasi seminar Anda..."
          rows={3}
        />
      </div>
    </div>
  );
}

function PagelaranFields({ formData, updateField }: FieldProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Judul Kegiatan *</Label>
        <Input
          value={formData.judulPublikasi || ''}
          onChange={(e) => updateField('judulPublikasi', e.target.value)}
          placeholder="Contoh: Presentasi Inovasi Bisnis Mahasiswa"
          required
        />
      </div>
      <div>
        <Label>Jenis Kegiatan *</Label>
        <Select value={formData.jenisKegiatan || ''} onValueChange={(v) => updateField('jenisKegiatan', v)}>
          <SelectTrigger><SelectValue placeholder="Pilih jenis kegiatan" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="conference">Presentasi Konferensi</SelectItem>
            <SelectItem value="presentasi">Presentasi Ilmiah</SelectItem>
            <SelectItem value="oral_presentation">Presentasi Lisan</SelectItem>
            <SelectItem value="poster_presentation">Presentasi Poster</SelectItem>
            <SelectItem value="pagelaran">Pagelaran</SelectItem>
            <SelectItem value="pameran">Pameran</SelectItem>
            <SelectItem value="expo">Expo</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Level Kegiatan *</Label>
        <Select value={formData.levelSeminar || ''} onValueChange={(v) => updateField('levelSeminar', v)}>
          <SelectTrigger><SelectValue placeholder="Pilih level kegiatan" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="local">Lokal/Wilayah/Perguruan Tinggi</SelectItem>
            <SelectItem value="national">Nasional</SelectItem>
            <SelectItem value="international">Internasional</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Tanggal Kegiatan *</Label>
        <Input
          type="date"
          value={formData.tanggalPublikasi || ''}
          onChange={(e) => updateField('tanggalPublikasi', e.target.value)}
          required
        />
      </div>
      <div>
        <Label>Penulis</Label>
        <Input
          value={formData.penulis || ''}
          onChange={(e) => updateField('penulis', e.target.value)}
          placeholder="Nama penulis (opsional)"
        />
      </div>
      <div>
        <Label>Nama Acara / Konferensi</Label>
        <Input
          value={formData.namaSeminarKonferensi || ''}
          onChange={(e) => updateField('namaSeminarKonferensi', e.target.value)}
          placeholder="Contoh: Festival Inovasi Kampus"
        />
      </div>
      <div>
        <Label>Mitra Kegiatan (jika ada)</Label>
        <Input
          value={formData.penyelenggara || ''}
          onChange={(e) => updateField('penyelenggara', e.target.value)}
          placeholder="Contoh: KADIN Jawa Tengah"
        />
      </div>
      <div>
        <Label>Link Dokumentasi (URL)</Label>
        <Input
          type="url"
          value={formData.urlPublikasi || ''}
          onChange={(e) => updateField('urlPublikasi', e.target.value)}
          placeholder="https://..."
        />
      </div>
      <div>
        <Label>Deskripsi</Label>
        <Textarea
          value={formData.deskripsi || ''}
          onChange={(e) => updateField('deskripsi', e.target.value)}
          placeholder="Ringkas kegiatan pagelaran/presentasi Anda..."
          rows={3}
        />
      </div>
    </div>
  );
}

function OrganisasiFields({ formData, updateField }: FieldProps) {
  const masihAktif = formData.masihAktif ?? true;
  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);

  const handleMasihAktifChange = (checked: boolean) => {
    updateField('masihAktif', checked);
    if (checked) {
      updateField('tanggalSelesai', undefined);
    }
  };

  const todayStr = () => new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      <div>
        <Label>Nama Organisasi *</Label>
        <Input 
          value={formData.namaOrganisasi || ''} 
          onChange={(e) => updateField('namaOrganisasi', e.target.value)} 
          placeholder="Nama organisasi"
          required 
        />
      </div>

      {/* Jenis Organisasi - Required */}
      <div>
        <Label>Jenis Organisasi *</Label>
        <Select 
          value={formData.jenisOrganisasi || ''} 
          onValueChange={(v) => updateField('jenisOrganisasi', v)}
        >
          <SelectTrigger><SelectValue placeholder="Pilih jenis organisasi" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="kampus">
              <span className="flex flex-col items-start">
                <span>Organisasi Kampus</span>
                <span className="text-xs text-muted-foreground">Himpunan / BEM / UKM</span>
              </span>
            </SelectItem>
            <SelectItem value="luar_kampus">
              <span className="flex flex-col items-start">
                <span>Organisasi Luar Kampus</span>
                <span className="text-xs text-muted-foreground">Komunitas / NGO / Profesional</span>
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Jabatan / Peran *</Label>
        <Input 
          value={formData.jabatan || ''} 
          onChange={(e) => updateField('jabatan', e.target.value)} 
          placeholder="Contoh: Ketua, Sekretaris"
          required 
        />
      </div>

      {/* Membership Status Toggle */}
      <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-muted/30">
        <div className="space-y-0.5">
          <Label className="text-base">Masih menjadi anggota</Label>
          <p className="text-sm text-muted-foreground">
            {masihAktif ? 'Keanggotaan masih aktif hingga saat ini' : 'Keanggotaan sudah berakhir'}
          </p>
        </div>
        <Switch 
          checked={masihAktif} 
          onCheckedChange={handleMasihAktifChange}
        />
      </div>

      {/* Start Date - Always visible */}
      <div className="space-y-1.5">
        <Label>Tanggal Masuk Organisasi *</Label>
        <Popover open={openStart} onOpenChange={setOpenStart}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal h-10 rounded-md border border-input bg-background shadow-sm hover:bg-accent/50 hover:border-primary/20 transition-colors",
                !formData.tanggalMulai && "text-muted-foreground"
              )}
              aria-label="Pilih tanggal masuk organisasi"
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
              {formData.tanggalMulai 
                ? format(new Date(formData.tanggalMulai), 'd MMMM yyyy', { locale: idLocale })
                : <span>Pilih tanggal mulai</span>
              }
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 rounded-lg border bg-popover shadow-lg" align="start">
            <Calendar
              mode="single"
              locale={idLocale}
              selected={formData.tanggalMulai ? new Date(formData.tanggalMulai) : undefined}
              onSelect={(date) => {
                updateField('tanggalMulai', date?.toISOString().split('T')[0]);
                setOpenStart(false);
              }}
              initialFocus
              className="p-3 pointer-events-auto"
            />
            <div className="flex items-center justify-between border-t px-3 py-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => {
                  updateField('tanggalMulai', undefined);
                  setOpenStart(false);
                }}
              >
                Hapus
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  updateField('tanggalMulai', todayStr());
                  setOpenStart(false);
                }}
              >
                Hari ini
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* End Date - Conditional with smooth animation */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-out ${
          !masihAktif 
            ? 'max-h-40 opacity-100' 
            : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pt-1 space-y-1.5">
          <Label>Tanggal Selesai Keanggotaan *</Label>
          <p className="text-xs text-muted-foreground">Tidak boleh sebelum tanggal masuk.</p>
          <Popover open={openEnd} onOpenChange={setOpenEnd}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-10 rounded-md border border-input bg-background shadow-sm hover:bg-accent/50 hover:border-primary/20 transition-colors",
                  !formData.tanggalSelesai && "text-muted-foreground"
                )}
                aria-label="Pilih tanggal selesai keanggotaan"
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                {formData.tanggalSelesai 
                  ? format(new Date(formData.tanggalSelesai), 'd MMMM yyyy', { locale: idLocale })
                  : <span>Pilih tanggal selesai</span>
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-lg border bg-popover shadow-lg" align="start">
              <Calendar
                mode="single"
                locale={idLocale}
                selected={formData.tanggalSelesai ? new Date(formData.tanggalSelesai) : undefined}
                onSelect={(date) => {
                  updateField('tanggalSelesai', date?.toISOString().split('T')[0]);
                  setOpenEnd(false);
                }}
                disabled={(date) => 
                  formData.tanggalMulai ? date < new Date(formData.tanggalMulai) : false
                }
                initialFocus
                className="p-3 pointer-events-auto"
              />
              <div className="flex items-center justify-between border-t px-3 py-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    updateField('tanggalSelesai', undefined);
                    setOpenEnd(false);
                  }}
                >
                  Hapus
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    updateField('tanggalSelesai', todayStr());
                    setOpenEnd(false);
                  }}
                >
                  Hari ini
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div>
        <Label>Deskripsi</Label>
        <Textarea 
          value={formData.deskripsi || ''} 
          onChange={(e) => updateField('deskripsi', e.target.value)} 
          placeholder="Jelaskan peran dan kontribusi Anda..."
          rows={3}
        />
      </div>
    </div>
  );
}

function PublikasiFields({ formData, updateField }: FieldProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Judul Karya *</Label>
        <Input 
          value={formData.judul || ''} 
          onChange={(e) => updateField('judul', e.target.value)} 
          placeholder="Judul lengkap publikasi"
          required 
        />
      </div>
      <div>
        <Label>Jenis Publikasi *</Label>
        <Select value={formData.jenisPublikasi || ''} onValueChange={(v) => updateField('jenisPublikasi', v)}>
          <SelectTrigger><SelectValue placeholder="Pilih jenis" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="artikel_jurnal">Artikel Jurnal</SelectItem>
            <SelectItem value="prosiding">Prosiding</SelectItem>
            <SelectItem value="buku">Buku</SelectItem>
            <SelectItem value="book_chapter">Book Chapter</SelectItem>
            <SelectItem value="lainnya">Lainnya</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Penulis *</Label>
        <Input 
          value={formData.penulis || ''} 
          onChange={(e) => updateField('penulis', e.target.value)} 
          placeholder="Nama penulis (pisahkan dengan koma)"
          required 
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Nama Jurnal / Konferensi</Label>
          <Input 
            value={formData.namaJurnal || ''} 
            onChange={(e) => updateField('namaJurnal', e.target.value)} 
            placeholder="Nama jurnal atau konferensi"
          />
        </div>
        <div>
          <Label>Tahun Terbit *</Label>
          <Input 
            type="number" 
            value={formData.tahun || ''} 
            onChange={(e) => updateField('tahun', parseInt(e.target.value))} 
            placeholder="2024"
            required 
          />
        </div>
      </div>
      <div>
        <Label>Link Publikasi (URL)</Label>
        <Input 
          value={formData.url || ''} 
          onChange={(e) => updateField('url', e.target.value)} 
          placeholder="https://..."
          type="url"
        />
      </div>
    </div>
  );
}

function HakiFields({ formData, updateField }: FieldProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Judul KI *</Label>
        <Input 
          value={formData.judul || ''} 
          onChange={(e) => updateField('judul', e.target.value)} 
          placeholder="Judul kekayaan intelektual"
          required 
        />
      </div>
      <div>
        <Label>Pemegang *</Label>
        <Input 
          value={formData.pemegang || ''} 
          onChange={(e) => updateField('pemegang', e.target.value)} 
          placeholder="Nama pemegang hak"
          required 
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Jenis KI *</Label>
          <Select value={formData.jenisHaki || ''} onValueChange={(v) => updateField('jenisHaki', v)}>
            <SelectTrigger><SelectValue placeholder="Pilih jenis" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="hak_cipta">Hak Cipta</SelectItem>
              <SelectItem value="paten">Paten</SelectItem>
              <SelectItem value="merek">Merek</SelectItem>
              <SelectItem value="desain_industri">Desain Industri</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Status *</Label>
          <Select value={formData.status || ''} onValueChange={(v) => updateField('status', v)}>
            <SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="terdaftar">Terdaftar</SelectItem>
              <SelectItem value="granted">Granted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Nomor Pendaftaran</Label>
          <Input 
            value={formData.nomorPendaftaran || ''} 
            onChange={(e) => updateField('nomorPendaftaran', e.target.value)} 
            placeholder="Nomor pendaftaran"
          />
        </div>
        <div>
          <Label>Tahun Pengajuan *</Label>
          <Input 
            type="number" 
            value={formData.tahunPengajuan || ''} 
            onChange={(e) => updateField('tahunPengajuan', parseInt(e.target.value))} 
            placeholder="2024"
            required 
          />
        </div>
      </div>
    </div>
  );
}

function MagangFields({ formData, updateField }: FieldProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Nama Perusahaan / Institusi *</Label>
        <Input 
          value={formData.namaPerusahaan || ''} 
          onChange={(e) => updateField('namaPerusahaan', e.target.value)} 
          placeholder="Nama perusahaan atau institusi"
          required 
        />
      </div>
      <div>
        <Label>Posisi / Peran *</Label>
        <Input 
          value={formData.posisi || ''} 
          onChange={(e) => updateField('posisi', e.target.value)} 
          placeholder="Contoh: Software Developer Intern"
          required 
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Lokasi *</Label>
          <Input 
            value={formData.lokasi || ''} 
            onChange={(e) => updateField('lokasi', e.target.value)} 
            placeholder="Kota, Negara"
            required 
          />
        </div>
        <div>
          <Label>Industri *</Label>
          <Input 
            value={formData.industri || ''} 
            onChange={(e) => updateField('industri', e.target.value)} 
            placeholder="Contoh: Teknologi"
            required 
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Tanggal Mulai *</Label>
          <Input 
            type="date" 
            value={formData.tanggalMulai || ''} 
            onChange={(e) => updateField('tanggalMulai', e.target.value)} 
            required 
          />
        </div>
        <div>
          <Label>Tanggal Selesai</Label>
          <Input 
            type="date" 
            value={formData.tanggalSelesai || ''} 
            onChange={(e) => updateField('tanggalSelesai', e.target.value)}
            disabled={formData.sedangBerjalan}
          />
        </div>
      </div>
      <div>
        <Label>Deskripsi Tugas</Label>
        <Textarea 
          value={formData.deskripsiTugas || ''} 
          onChange={(e) => updateField('deskripsiTugas', e.target.value)} 
          placeholder="Jelaskan tugas dan tanggung jawab Anda..."
          rows={3}
        />
      </div>
    </div>
  );
}

function PortofolioFields({ formData, updateField }: FieldProps) {
  const isOtherMataKuliah = formData.mataKuliah === 'other';

  // Clear custom field when switching away from 'other'
  const handleMataKuliahChange = (value: string) => {
    updateField('mataKuliah', value);
    if (value !== 'other') {
      updateField('mataKuliahCustom', undefined);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Judul Proyek *</Label>
        <Input 
          value={formData.judulProyek || ''} 
          onChange={(e) => updateField('judulProyek', e.target.value)} 
          placeholder="Nama proyek"
          required 
        />
      </div>
      <div>
        <Label>Mata Kuliah *</Label>
        <Select value={formData.mataKuliah || ''} onValueChange={handleMataKuliahChange}>
          <SelectTrigger><SelectValue placeholder="Pilih mata kuliah" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="kwu">KWU</SelectItem>
            <SelectItem value="ecommerce">E-Commerce</SelectItem>
            <SelectItem value="msdm_ocai">MSDM/OCAI</SelectItem>
            <SelectItem value="other">Mata Kuliah Lain</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Custom Mata Kuliah Field - Only visible when 'other' is selected */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isOtherMataKuliah 
            ? 'max-h-24 opacity-100' 
            : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pt-1">
          <Label>Nama Mata Kuliah (Lainnya) *</Label>
          <Input 
            value={formData.mataKuliahCustom || ''} 
            onChange={(e) => updateField('mataKuliahCustom', e.target.value.slice(0, 100))} 
            placeholder="Contoh: Enterprise Resource Planning"
            maxLength={100}
            required={isOtherMataKuliah}
          />
          <p className="text-xs text-muted-foreground mt-1">Masukkan nama mata kuliah yang tidak ada dalam daftar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Tahun *</Label>
          <Input 
            type="number" 
            value={formData.tahun || ''} 
            onChange={(e) => updateField('tahun', parseInt(e.target.value))} 
            placeholder="2024"
            required 
          />
        </div>
        <div>
          <Label>Semester *</Label>
          <Select value={formData.semester || ''} onValueChange={(v) => updateField('semester', v)}>
            <SelectTrigger><SelectValue placeholder="Pilih semester" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ganjil">Ganjil</SelectItem>
              <SelectItem value="genap">Genap</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Deskripsi Proyek *</Label>
        <Textarea 
          value={formData.deskripsiProyek || ''} 
          onChange={(e) => updateField('deskripsiProyek', e.target.value)} 
          placeholder="Jelaskan proyek Anda..."
          rows={3}
          required
        />
      </div>
    </div>
  );
}

function ProdukMahasiswaFields({ formData, updateField }: FieldProps) {
  const isOtherProductCategory = formData.kategoriProduk === 'lainnya';

  const handleKategoriProdukChange = (value: string) => {
    updateField('kategoriProduk', value);
    if (value !== 'lainnya') {
      updateField('kategoriProdukLainnya', undefined);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Nama Produk *</Label>
        <Input
          value={formData.namaProduk || ''}
          onChange={(e) => updateField('namaProduk', e.target.value)}
          placeholder="Contoh: Aplikasi Kasir UMKM"
          required
        />
      </div>
      <div>
        <Label>Kategori Produk *</Label>
        <Select value={formData.kategoriProduk || ''} onValueChange={handleKategoriProdukChange}>
          <SelectTrigger><SelectValue placeholder="Pilih kategori produk" /></SelectTrigger>
          <SelectContent className="!max-h-48">
            {STUDENT_PRODUCT_CATEGORIES.map((key) => (
              <SelectItem key={key} value={key}>
                {STUDENT_PRODUCT_CATEGORY_LABELS[key]}
              </SelectItem>
            ))}
            <SelectItem value="lainnya">Lainnya</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-out',
          isOtherProductCategory ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="pt-1">
          <Label>Kategori Produk (Lainnya) *</Label>
          <Input
            value={formData.kategoriProdukLainnya || ''}
            onChange={(e) => updateField('kategoriProdukLainnya', e.target.value.slice(0, 100))}
            placeholder="Contoh: Agritech"
            maxLength={100}
            required={isOtherProductCategory}
          />
        </div>
      </div>
      <div>
        <Label>Tanggal Adopsi *</Label>
        <Input
          type="date"
          value={formData.tanggalAdopsi || ''}
          onChange={(e) => updateField('tanggalAdopsi', e.target.value)}
          required
        />
      </div>
      <div>
        <Label>Mitra Adopsi (jika ada)</Label>
        <Input
          value={formData.mitraAdopsi || ''}
          onChange={(e) => updateField('mitraAdopsi', e.target.value)}
          placeholder="Contoh: Dinas Koperasi Kota Semarang"
        />
      </div>
      <div>
        <Label>Link Produk (URL)</Label>
        <Input
          type="url"
          value={formData.linkProduk || ''}
          onChange={(e) => updateField('linkProduk', e.target.value)}
          placeholder="https://..."
        />
      </div>
      <div>
        <Label>Lokasi</Label>
        <Input
          value={formData.lokasi || ''}
          onChange={(e) => updateField('lokasi', e.target.value)}
          placeholder="Contoh: Semarang"
        />
      </div>
      <div>
        <Label>Deskripsi</Label>
        <Textarea
          value={formData.deskripsi || ''}
          onChange={(e) => updateField('deskripsi', e.target.value)}
          placeholder="Ceritakan detail produk mahasiswa yang diadopsi..."
          rows={3}
        />
      </div>
    </div>
  );
}

function WirausahaFields({ formData, updateField }: FieldProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Nama Usaha *</Label>
        <Input 
          value={formData.namaUsaha || ''} 
          onChange={(e) => updateField('namaUsaha', e.target.value)} 
          placeholder="Nama usaha atau bisnis"
          required 
        />
      </div>
      <div>
        <Label>Bidang Usaha *</Label>
        <Input 
          value={formData.jenisUsaha || ''} 
          onChange={(e) => updateField('jenisUsaha', e.target.value)} 
          placeholder="Contoh: F&B, Teknologi, Fashion"
          required 
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Lokasi *</Label>
          <Input 
            value={formData.lokasi || ''} 
            onChange={(e) => updateField('lokasi', e.target.value)} 
            placeholder="Kota operasional"
            required 
          />
        </div>
        <div>
          <Label>Tahun Mulai *</Label>
          <Input 
            type="number" 
            value={formData.tahunMulai || ''} 
            onChange={(e) => updateField('tahunMulai', parseInt(e.target.value))} 
            placeholder="2024"
            required 
          />
        </div>
      </div>
      <div>
        <Label>Deskripsi Usaha *</Label>
        <Textarea 
          value={formData.deskripsiUsaha || ''} 
          onChange={(e) => updateField('deskripsiUsaha', e.target.value)} 
          placeholder="Jelaskan usaha Anda..."
          rows={3}
          required
        />
      </div>
    </div>
  );
}

function PengembanganFields({ formData, updateField }: FieldProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Nama Program / Kegiatan *</Label>
        <Input 
          value={formData.namaProgram || ''} 
          onChange={(e) => updateField('namaProgram', e.target.value)} 
          placeholder="Nama program atau kegiatan"
          required 
        />
      </div>
      <div>
        <Label>Jenis Aktivitas *</Label>
        <Select value={formData.jenisProgram || ''} onValueChange={(v) => updateField('jenisProgram', v)}>
          <SelectTrigger><SelectValue placeholder="Pilih jenis" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pertukaran_mahasiswa">Pertukaran Mahasiswa</SelectItem>
            <SelectItem value="beasiswa">Beasiswa</SelectItem>
            <SelectItem value="volunteer">Volunteer</SelectItem>
            <SelectItem value="organisasi">Organisasi</SelectItem>
            <SelectItem value="lainnya">Lainnya</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Penyelenggara *</Label>
        <Input 
          value={formData.penyelenggara || ''} 
          onChange={(e) => updateField('penyelenggara', e.target.value)} 
          placeholder="Nama institusi penyelenggara"
          required 
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Lokasi</Label>
          <Input 
            value={formData.lokasi || ''} 
            onChange={(e) => updateField('lokasi', e.target.value)} 
            placeholder="Kota"
          />
        </div>
        <div>
          <Label>Negara</Label>
          <Input 
            value={formData.negara || ''} 
            onChange={(e) => updateField('negara', e.target.value)} 
            placeholder="Negara"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Tanggal Mulai *</Label>
          <Input 
            type="date" 
            value={formData.tanggalMulai || ''} 
            onChange={(e) => updateField('tanggalMulai', e.target.value)} 
            required 
          />
        </div>
        <div>
          <Label>Tanggal Selesai</Label>
          <Input 
            type="date" 
            value={formData.tanggalSelesai || ''} 
            onChange={(e) => updateField('tanggalSelesai', e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label>Output / Prestasi</Label>
        <Input 
          value={formData.prestasi || ''} 
          onChange={(e) => updateField('prestasi', e.target.value)} 
          placeholder="Contoh: Sertifikat, Best Participant"
        />
      </div>
    </div>
  );
}
