import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useAlumni } from '@/contexts/AlumniContext';
import {
  deleteTracerStudyViaAPI,
  updateTracerStudyViaAPI,
  type CreateTracerStudyPayload,
} from '@/repositories/api-student.repository';
import { 
  Briefcase, Rocket, GraduationCap, Search, ChevronLeft, 
  MapPin, Calendar, Building2, User, Plus, Pencil, Trash2, Clock,
  AlertTriangle, Loader2, Filter, ArrowUpDown, X, CheckCircle2, XCircle
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { isCareerHistoryVisible } from '@/lib/student-utils';
import type { StudentStatus } from '@/types/student.types';
import type { AlumniData } from '@/types/alumni.types';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';

// Filter and Sort Types
type StatusFilter = 'all' | 'bekerja' | 'wirausaha' | 'studi' | 'mencari';
type SortOption = 'year-desc' | 'year-asc' | 'status';

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Semua Status' },
  { value: 'bekerja', label: 'Bekerja' },
  { value: 'wirausaha', label: 'Wirausaha' },
  { value: 'studi', label: 'Studi Lanjut' },
  { value: 'mencari', label: 'Mencari Kerja' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'year-desc', label: 'Tahun (Terbaru)' },
  { value: 'year-asc', label: 'Tahun (Terlama)' },
  { value: 'status', label: 'Status' },
];

// Validation schema for edit form
const editFormSchema = z.object({
  status: z.enum(['bekerja', 'wirausaha', 'studi', 'mencari'], {
    required_error: 'Status harus dipilih',
  }),
  title: z.string()
    .trim()
    .min(1, 'Field ini wajib diisi')
    .max(100, 'Maksimal 100 karakter'),
  subtitle: z.string()
    .trim()
    .min(1, 'Field ini wajib diisi')
    .max(100, 'Maksimal 100 karakter'),
  location: z.string()
    .trim()
    .max(100, 'Maksimal 100 karakter')
    .optional()
    .or(z.literal('')),
  industry: z.string()
    .trim()
    .max(100, 'Maksimal 100 karakter')
    .optional()
    .or(z.literal('')),
  year: z.number()
    .min(1990, 'Tahun minimal 1990')
    .max(new Date().getFullYear() + 5, `Tahun maksimal ${new Date().getFullYear() + 5}`),
});

type EditFormErrors = Partial<Record<keyof z.infer<typeof editFormSchema>, string>>;

// Career status configuration
const STATUS_CONFIG = {
  bekerja: {
    icon: Briefcase,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
    nodeColor: 'bg-primary',
    label: 'Bekerja',
  },
  wirausaha: {
    icon: Rocket,
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
    nodeColor: 'bg-success',
    label: 'Wirausaha',
  },
  studi: {
    icon: GraduationCap,
    color: 'text-info',
    bgColor: 'bg-info/10',
    borderColor: 'border-info/30',
    nodeColor: 'bg-info',
    label: 'Studi Lanjut',
  },
  mencari: {
    icon: Search,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
    nodeColor: 'bg-warning',
    label: 'Mencari Kerja',
  },
};

interface CareerItem {
  id: string;
  year: number;
  status: 'bekerja' | 'wirausaha' | 'studi' | 'mencari';
  title: string;
  subtitle?: string;
  location?: string;
  industry?: string;
  period?: string;
  isActive?: boolean;
}

const WORK_SCOPE_OPTIONS_BEKERJA: { value: string; label: string }[] = [
  { value: '', label: 'Pilih cakupan' },
  { value: 'local', label: 'Lokal/Wilayah' },
  { value: 'national', label: 'Nasional' },
  { value: 'multinational', label: 'Multinasional/ Internasional' },
];

const WORK_SCOPE_OPTIONS_WIRAUSAHA: { value: string; label: string }[] = [
  { value: '', label: 'Pilih level wirausaha' },
  { value: 'local', label: 'Lokal/Wilayah/ Berwirausaha tidak Berizin' },
  { value: 'national', label: 'Nasional/ Berwirausaha Berizin' },
  { value: 'multinational', label: 'Multinasional/ Internasional' },
];

interface EditFormData {
  status: 'bekerja' | 'wirausaha' | 'studi' | 'mencari';
  title: string;
  subtitle: string;
  location: string;
  industry: string;
  year: number;
  isActive: boolean;
  workScope: string;
}

export default function CareerHistoryPage() {
  const navigate = useNavigate();
  const { selectedAlumni, getAlumniDataByMasterId, refreshData } = useAlumni();
  const { toast } = useToast();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Filter and Sort states
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('year-desc');
  const [yearFilter, setYearFilter] = useState<string>('all');
  
  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<EditFormErrors>({});
  
  // Original form data for comparison
  const [originalFormData, setOriginalFormData] = useState<EditFormData | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    status: 'bekerja',
    title: '',
    subtitle: '',
    location: '',
    industry: '',
    year: new Date().getFullYear(),
    isActive: true,
    workScope: '',
  });

  useEffect(() => {
    if (!selectedAlumni) {
      navigate('/validasi');
      return;
    }
    const studentStatus: StudentStatus = (selectedAlumni as any).status || 'alumni';
    if (!isCareerHistoryVisible(studentStatus)) {
      navigate('/dashboard');
    }
  }, [selectedAlumni, navigate]);

  // Define all derived values and memos before early return to ensure consistent hook order
  const alumniHistory = useMemo(
    () => (selectedAlumni ? getAlumniDataByMasterId(selectedAlumni.id) : []),
    [selectedAlumni, getAlumniDataByMasterId]
  );

  // Transform career history data
  const careerItems: CareerItem[] = useMemo(() => alumniHistory.map((data) => {
    let title = '';
    let subtitle = '';
    let location = '';
    let industry = '';
    let period = '';
    const isActiveStatus = data.isActive !== undefined ? data.isActive : true;

    if (data.status === 'bekerja') {
      title = data.namaPerusahaan || 'Perusahaan';
      subtitle = data.jabatan || 'Karyawan';
      location = data.lokasiPerusahaan || '';
      industry = data.bidangIndustri || '';
      period = data.tahunMulaiKerja ? `${data.tahunMulaiKerja} - ${isActiveStatus ? 'Sekarang' : 'Selesai'}` : '';
    } else if (data.status === 'wirausaha') {
      title = data.namaUsaha || 'Usaha';
      subtitle = data.jenisUsaha || 'Bisnis';
      location = data.lokasiUsaha || '';
      period = data.tahunMulaiUsaha ? `${data.tahunMulaiUsaha} - ${isActiveStatus ? 'Sekarang' : 'Selesai'}` : '';
    } else if (data.status === 'studi') {
      title = data.namaKampus || 'Kampus';
      subtitle = `${data.jenjang || ''} ${data.programStudi || ''}`.trim();
      location = data.lokasiKampus || '';
      period = data.tahunMulaiStudi ? `${data.tahunMulaiStudi} - ${isActiveStatus ? 'Sekarang' : 'Selesai'}` : '';
    } else if (data.status === 'mencari') {
      title = 'Mencari Pekerjaan';
      subtitle = `Target: ${data.bidangDiincar || 'Berbagai bidang'}`;
      location = data.lokasiTujuan || '';
    }

    return {
      id: data.id,
      year: data.tahunPengisian,
      status: data.status as 'bekerja' | 'wirausaha' | 'studi' | 'mencari',
      title,
      subtitle,
      location,
      industry,
      period,
      isActive: data.isActive !== undefined ? data.isActive : true, // Default to true if not set
    };
  }), [alumniHistory]);

  // Check if form has unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    if (!originalFormData) return false;
    return (
      editFormData.status !== originalFormData.status ||
      editFormData.title !== originalFormData.title ||
      editFormData.subtitle !== originalFormData.subtitle ||
      editFormData.location !== originalFormData.location ||
      editFormData.industry !== originalFormData.industry ||
      editFormData.year !== originalFormData.year ||
      editFormData.isActive !== originalFormData.isActive ||
      editFormData.workScope !== originalFormData.workScope
    );
  }, [editFormData, originalFormData]);

  // Get unique years for filter
  const availableYears = useMemo(() => {
    const years = [...new Set(careerItems.map(item => item.year))].sort((a, b) => b - a);
    return years;
  }, [careerItems]);

  // Filter and sort career items
  const filteredAndSortedItems = useMemo(() => {
    let items = [...careerItems];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      items = items.filter(item => item.status === statusFilter);
    }
    
    // Apply year filter
    if (yearFilter !== 'all') {
      items = items.filter(item => item.year === parseInt(yearFilter));
    }
    
    // Apply sorting
    items.sort((a, b) => {
      switch (sortOption) {
        case 'year-desc':
          return b.year - a.year;
        case 'year-asc':
          return a.year - b.year;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
    
    return items;
  }, [careerItems, statusFilter, yearFilter, sortOption]);

  // Check if any filter is active
  const hasActiveFilters = statusFilter !== 'all' || yearFilter !== 'all';

  const clearFilters = () => {
    setStatusFilter('all');
    setYearFilter('all');
  };

  const handleToggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedItemId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedItemId) {
      setIsDeleting(true);
      try {
        const response = await deleteTracerStudyViaAPI(selectedItemId);
        if (!response.success) {
          throw new Error(response.error || 'Gagal menghapus riwayat karir');
        }
        await refreshData();
        toast({
          title: "Riwayat karir dihapus",
          description: "Data riwayat karir berhasil dihapus dari sistem.",
        });
        setExpandedId(null);
      } catch (error) {
        toast({
          title: "Gagal menghapus",
          description: error instanceof Error ? error.message : 'Terjadi kesalahan saat menghapus data.',
          variant: "destructive",
        });
      } finally {
        setIsDeleting(false);
      }
    }
    setDeleteDialogOpen(false);
    setSelectedItemId(null);
  };

  const handleEditClick = (e: React.MouseEvent, item: CareerItem) => {
    e.stopPropagation();
    setSelectedItemId(item.id);
    setFormErrors({});
    const data = alumniHistory.find((d) => d.id === item.id) as AlumniData | undefined;
    const formData = {
      status: item.status,
      title: item.title,
      subtitle: item.subtitle || '',
      location: item.location || '',
      industry: item.industry || '',
      year: item.year,
      isActive: item.isActive ?? true,
      workScope: data?.cakupanTempatKerja || '',
    };
    setEditFormData(formData);
    setOriginalFormData(formData); // Store original for comparison
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    if (hasUnsavedChanges) {
      setDiscardDialogOpen(true);
    } else {
      closeEditDialog();
    }
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedItemId(null);
    setFormErrors({});
    setOriginalFormData(null);
  };

  const handleDiscardConfirm = () => {
    setDiscardDialogOpen(false);
    closeEditDialog();
  };

  const validateForm = (): boolean => {
    const result = editFormSchema.safeParse(editFormData);
    
    if (!result.success) {
      const errors: EditFormErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof EditFormErrors;
        if (!errors[field]) {
          errors[field] = err.message;
        }
      });
      setFormErrors(errors);
      return false;
    }
    
    setFormErrors({});
    return true;
  };

  const handleEditSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Validasi gagal",
        description: "Mohon periksa kembali isian form Anda.",
        variant: "destructive",
      });
      return;
    }

    if (selectedItemId && editFormData) {
      setIsSaving(true);
      try {
        const statusMap: Record<string, string> = {
          bekerja: 'working',
          wirausaha: 'entrepreneur',
          studi: 'further_study',
          mencari: 'job_seeking',
        };

        const existing = alumniHistory.find((d) => d.id === selectedItemId);

        const payload: Partial<CreateTracerStudyPayload> = {
          career_status: statusMap[editFormData.status],
          tahun_pengisian: editFormData.year,
        };

        if (editFormData.status === 'bekerja') {
          payload.employment_data = {
            nama_perusahaan: editFormData.title.trim(),
            jabatan: editFormData.subtitle.trim(),
            lokasi_perusahaan: editFormData.location.trim(),
            bidang_industri: editFormData.industry.trim(),
            tahun_mulai_kerja: existing?.tahunMulaiKerja,
            bulan_mulai_kerja: existing?.bulanMulaiKerja,
            tahun_selesai_kerja: existing?.tahunSelesaiKerja,
            masih_aktif_kerja: editFormData.isActive,
            kontak_profesional: existing?.kontakProfesional,
            work_scope: editFormData.workScope || undefined,
          };
        } else if (editFormData.status === 'wirausaha') {
          payload.entrepreneurship_data = {
            nama_usaha: editFormData.title.trim(),
            jenis_usaha: editFormData.subtitle.trim(),
            lokasi_usaha: editFormData.location.trim(),
            tahun_mulai_usaha: existing?.tahunMulaiUsaha,
            bulan_mulai_usaha: existing?.bulanMulaiUsaha,
            usaha_aktif: editFormData.isActive,
            punya_karyawan: existing?.punyaKaryawan,
            jumlah_karyawan: existing?.jumlahKaryawan,
            sosial_media_usaha: existing?.sosialMediaUsaha,
            work_scope: editFormData.workScope || undefined,
          };
        } else if (editFormData.status === 'studi') {
          payload.further_study_data = {
            nama_kampus: editFormData.title.trim(),
            program_studi: editFormData.subtitle.trim(),
            lokasi_kampus: editFormData.location.trim(),
            tahun_mulai_studi: existing?.tahunMulaiStudi,
            tahun_selesai_studi: existing?.tahunSelesaiStudi,
            masih_aktif_studi: editFormData.isActive,
            jenjang: existing?.jenjang,
          };
        } else if (editFormData.status === 'mencari') {
          payload.job_seeking_data = {
            bidang_diincar: editFormData.subtitle.trim(),
            lokasi_tujuan: editFormData.location.trim(),
            lama_mencari: existing?.lamaMencari,
          };
        }

        const response = await updateTracerStudyViaAPI(selectedItemId, payload);
        if (!response.success) {
          throw new Error(response.error || 'Gagal memperbarui riwayat karir');
        }

        await refreshData();
        toast({
          title: "Riwayat karir diperbarui",
          description: "Perubahan akan langsung terlihat di Dashboard.",
        });
      } catch (error) {
        toast({
          title: "Gagal memperbarui",
          description: error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan perubahan.',
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    }
    closeEditDialog();
  };

  const handleFormChange = (field: keyof EditFormData, value: string | number | boolean) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[field as keyof EditFormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getFieldLabels = (status: string) => {
    switch (status) {
      case 'bekerja':
        return { title: 'Nama Perusahaan', subtitle: 'Jabatan', industry: 'Bidang Industri' };
      case 'wirausaha':
        return { title: 'Nama Usaha', subtitle: 'Jenis Usaha', industry: '' };
      case 'studi':
        return { title: 'Nama Kampus', subtitle: 'Program Studi', industry: '' };
      case 'mencari':
        return { title: 'Status', subtitle: 'Bidang yang Diincar', industry: '' };
      default:
        return { title: 'Judul', subtitle: 'Deskripsi', industry: 'Industri' };
    }
  };

  const selectedItem = careerItems.find(item => item.id === selectedItemId);
  const fieldLabels = getFieldLabels(editFormData.status);
  const workScopeOptions =
    editFormData.status === 'wirausaha'
      ? WORK_SCOPE_OPTIONS_WIRAUSAHA
      : WORK_SCOPE_OPTIONS_BEKERJA;

  if (!selectedAlumni) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <Button 
              variant="ghost" 
              className="mb-6 -ml-2"
              onClick={() => navigate('/dashboard')}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Kembali ke Dashboard
            </Button>

            {/* Page Header */}
            <div className="mb-8 animate-fade-up">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Riwayat Karir Alumni
              </h1>
              <p className="text-muted-foreground">
                Perjalanan profesional setelah masa studi
              </p>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Sidebar - Sticky */}
              <div className="lg:col-span-4 xl:col-span-3">
                <div className="lg:sticky lg:top-28">
                  <div className="glass-card rounded-2xl p-6 animate-fade-up">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <User className="w-8 h-8 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {selectedAlumni.nama}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          NIM: {selectedAlumni.nim}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-border">
                      <div className="flex items-center gap-2 text-sm">
                        <GraduationCap className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">Program Studi:</span>
                        <span className="text-foreground font-medium truncate">
                          {selectedAlumni.prodi}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">Jurusan:</span>
                        <span className="text-foreground font-medium truncate">
                          {selectedAlumni.jurusan}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">Tahun Lulus:</span>
                        <span className="text-foreground font-medium">
                          {selectedAlumni.tahunLulus}
                        </span>
                      </div>
                    </div>

                    {/* Alumni Status Badge */}
                    <div className="mt-6 pt-4 border-t border-border">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                        <User className="w-3.5 h-3.5" />
                        Status: Alumni
                      </span>
                    </div>
                  </div>

                  {/* Add Career Button */}
                  <Button 
                    className="w-full mt-4"
                    onClick={() => navigate('/form')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Karir
                  </Button>
                </div>
              </div>

              {/* Right Content - Career Timeline */}
              <div className="lg:col-span-8 xl:col-span-9 animate-fade-up" style={{ animationDelay: '0.1s' }}>
                {/* Filter & Sort Controls */}
                <div className="glass-card rounded-xl p-4 mb-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Status Filter */}
                    <div className="flex-1">
                      <Select value={statusFilter} onValueChange={(v: StatusFilter) => setStatusFilter(v)}>
                        <SelectTrigger className="w-full">
                          <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-muted-foreground" />
                            <SelectValue placeholder="Filter Status" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_FILTER_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Year Filter */}
                    <div className="flex-1">
                      <Select value={yearFilter} onValueChange={setYearFilter}>
                        <SelectTrigger className="w-full">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <SelectValue placeholder="Filter Tahun" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Tahun</SelectItem>
                          {availableYears.map(year => (
                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sort */}
                    <div className="flex-1">
                      <Select value={sortOption} onValueChange={(v: SortOption) => setSortOption(v)}>
                        <SelectTrigger className="w-full">
                          <div className="flex items-center gap-2">
                            <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                            <SelectValue placeholder="Urutkan" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {SORT_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Active Filters Display */}
                  {hasActiveFilters && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                      <span className="text-xs text-muted-foreground">Filter aktif:</span>
                      {statusFilter !== 'all' && (
                        <Badge variant="secondary" className="text-xs">
                          {STATUS_FILTER_OPTIONS.find(o => o.value === statusFilter)?.label}
                        </Badge>
                      )}
                      {yearFilter !== 'all' && (
                        <Badge variant="secondary" className="text-xs">
                          Tahun {yearFilter}
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={clearFilters}>
                        <X className="w-3 h-3 mr-1" />
                        Hapus Filter
                      </Button>
                    </div>
                  )}

                  {/* Results count */}
                  <p className="text-xs text-muted-foreground mt-3">
                    Menampilkan {filteredAndSortedItems.length} dari {careerItems.length} riwayat karir
                  </p>
                </div>

                {filteredAndSortedItems.length > 0 ? (
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border hidden sm:block" />

                    <div className="space-y-4">
                      {filteredAndSortedItems.map((item) => {
                        const config = STATUS_CONFIG[item.status];
                        const Icon = config.icon;
                        const isExpanded = expandedId === item.id;

                        return (
                          <div key={item.id} className="relative">
                            {/* Timeline node for desktop */}
                            <div className="absolute left-[19px] top-6 w-3 h-3 rounded-full z-10 hidden sm:block"
                              style={{ backgroundColor: `hsl(var(--${item.status === 'bekerja' ? 'primary' : item.status === 'wirausaha' ? 'success' : item.status === 'studi' ? 'info' : 'warning'}))` }}
                            />

                            {/* Content Card */}
                            <div className={cn('sm:ml-14', isExpanded && 'mb-4')}>
                              <div
                                onClick={() => handleToggle(item.id)}
                                className={cn(
                                  'p-5 rounded-xl border transition-all duration-300 cursor-pointer',
                                  'hover:shadow-elevated',
                                  config.bgColor, config.borderColor,
                                  isExpanded && 'shadow-elevated'
                                )}
                              >
                                <div className="flex items-start gap-4">
                                  {/* Icon */}
                                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', config.bgColor)}>
                                    <Icon className={cn('w-6 h-6', config.color)} />
                                  </div>

                                  {/* Main Content */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                      <span className={cn(
                                        'text-xs font-medium px-2.5 py-1 rounded-full',
                                        config.bgColor, config.color
                                      )}>
                                        {config.label}
                                      </span>
                                      <span className="text-xs text-muted-foreground font-medium">
                                        {item.year}
                                      </span>
                                      <span className={cn(
                                        'text-xs px-2 py-0.5 rounded-full font-medium',
                                        item.isActive 
                                          ? 'bg-success/10 text-success' 
                                          : 'bg-destructive/10 text-destructive'
                                      )}>
                                        {item.isActive ? 'Aktif' : 'Selesai'}
                                      </span>
                                    </div>

                                    <h4 className="font-semibold text-foreground text-lg break-words">
                                      {item.title}
                                    </h4>
                                    {item.subtitle && (
                                      <p className="text-muted-foreground mt-1 break-words">
                                        {item.subtitle}
                                      </p>
                                    )}
                                    {item.location && (
                                      <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
                                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span className="break-words">{item.location}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                  <div className="mt-5 pt-5 border-t border-border/50 animate-fade-up">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                                      {item.industry && (
                                        <div>
                                          <p className="text-xs text-muted-foreground mb-1">Industri</p>
                                          <p className="text-sm font-medium text-foreground break-words">{item.industry}</p>
                                        </div>
                                      )}
                                      {item.period && (
                                        <div>
                                          <p className="text-xs text-muted-foreground mb-1">Periode</p>
                                          <p className="text-sm font-medium text-foreground">{item.period}</p>
                                        </div>
                                      )}
                                      {item.location && (
                                        <div>
                                          <p className="text-xs text-muted-foreground mb-1">Lokasi</p>
                                          <p className="text-sm font-medium text-foreground break-words">{item.location}</p>
                                        </div>
                                      )}
                                      <div>
                                        <p className="text-xs text-muted-foreground mb-1">Status</p>
                                        <p className={cn(
                                          'text-sm font-medium',
                                          item.isActive ? 'text-success' : 'text-muted-foreground'
                                        )}>
                                          {item.isActive ? 'Masih aktif' : 'Sudah selesai'}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-wrap gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => handleEditClick(e, item)}
                                      >
                                        <Pencil className="w-3.5 h-3.5 mr-1.5" />
                                        Edit
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={(e) => handleDeleteClick(e, item.id)}
                                      >
                                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                        Hapus
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : careerItems.length > 0 ? (
                  /* No results after filtering */
                  <div className="glass-card rounded-2xl p-10 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
                      <Search className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Tidak Ada Hasil
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Tidak ada riwayat karir yang sesuai dengan filter yang dipilih.
                    </p>
                    <Button variant="outline" onClick={clearFilters}>
                      <X className="w-4 h-4 mr-2" />
                      Hapus Filter
                    </Button>
                  </div>
                ) : (
                  /* Empty State - No data at all */
                  <div className="glass-card rounded-2xl p-10 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
                      <Clock className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Belum Ada Riwayat Karir
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Tambahkan perjalanan profesionalmu setelah lulus untuk membangun rekam jejak karir yang lengkap.
                    </p>
                    <Button onClick={() => navigate('/form')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Karir
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => !isDeleting && setDeleteDialogOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Hapus Riwayat Karir?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus riwayat karir ini? 
              Tindakan ini tidak dapat dibatalkan dan data akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menghapus...
                </>
              ) : (
                'Hapus'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        if (!open) {
          handleCloseEditDialog();
        }
      }}>
        <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => {
          if (hasUnsavedChanges) {
            e.preventDefault();
            handleCloseEditDialog();
          }
        }}>
          <DialogHeader>
            <DialogTitle>Edit Riwayat Karir</DialogTitle>
            <DialogDescription>
              Perbarui informasi riwayat karir Anda. Klik simpan setelah selesai.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Status <span className="text-destructive">*</span></Label>
              <Select
                value={editFormData.status}
                onValueChange={(value: 'bekerja' | 'wirausaha' | 'studi' | 'mencari') => 
                  handleFormChange('status', value)
                }
              >
                <SelectTrigger className={formErrors.status ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bekerja">Bekerja</SelectItem>
                  <SelectItem value="wirausaha">Wirausaha</SelectItem>
                  <SelectItem value="studi">Studi Lanjut</SelectItem>
                  <SelectItem value="mencari">Mencari Kerja</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.status && (
                <p className="text-xs text-destructive">{formErrors.status}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">{fieldLabels.title} <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                value={editFormData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                placeholder={`Masukkan ${fieldLabels.title.toLowerCase()}`}
                className={formErrors.title ? 'border-destructive' : ''}
                maxLength={100}
              />
              {formErrors.title && (
                <p className="text-xs text-destructive">{formErrors.title}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subtitle">{fieldLabels.subtitle} <span className="text-destructive">*</span></Label>
              <Input
                id="subtitle"
                value={editFormData.subtitle}
                onChange={(e) => handleFormChange('subtitle', e.target.value)}
                placeholder={`Masukkan ${fieldLabels.subtitle.toLowerCase()}`}
                className={formErrors.subtitle ? 'border-destructive' : ''}
                maxLength={100}
              />
              {formErrors.subtitle && (
                <p className="text-xs text-destructive">{formErrors.subtitle}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Lokasi</Label>
              <Input
                id="location"
                value={editFormData.location}
                onChange={(e) => handleFormChange('location', e.target.value)}
                placeholder="Masukkan lokasi"
                className={formErrors.location ? 'border-destructive' : ''}
                maxLength={100}
              />
              {formErrors.location && (
                <p className="text-xs text-destructive">{formErrors.location}</p>
              )}
            </div>

            {(editFormData.status === 'bekerja' || editFormData.status === 'wirausaha') && (
              <div className="grid gap-2">
                <Label htmlFor="workScope">
                  {editFormData.status === 'wirausaha' ? 'Level Wirausaha' : 'Cakupan tempat kerja'}
                </Label>
                <Select
                  value={editFormData.workScope || ''}
                  onValueChange={(value) => handleFormChange('workScope', value)}
                >
                  <SelectTrigger id="workScope">
                    <SelectValue placeholder="Pilih cakupan" />
                  </SelectTrigger>
                  <SelectContent>
                    {workScopeOptions.filter((o) => o.value !== '').map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {editFormData.status === 'wirausaha'
                    ? 'Lokal/Wilayah/Berwirausaha tidak berizin; Nasional/Berwirausaha berizin; atau Multinasional/Internasional (untuk statistik Cakupan Kerja tab Wirausaha)'
                    : 'Lokal/Wilayah; Nasional; atau Multinasional/Internasional (untuk statistik Cakupan Kerja tab Bekerja)'}
                </p>
              </div>
            )}

            {fieldLabels.industry && (
              <div className="grid gap-2">
                <Label htmlFor="industry">{fieldLabels.industry}</Label>
                <Input
                  id="industry"
                  value={editFormData.industry}
                  onChange={(e) => handleFormChange('industry', e.target.value)}
                  placeholder={`Masukkan ${fieldLabels.industry.toLowerCase()}`}
                  className={formErrors.industry ? 'border-destructive' : ''}
                  maxLength={100}
                />
                {formErrors.industry && (
                  <p className="text-xs text-destructive">{formErrors.industry}</p>
                )}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="year">Tahun <span className="text-destructive">*</span></Label>
              <Input
                id="year"
                type="number"
                value={editFormData.year}
                onChange={(e) => handleFormChange('year', parseInt(e.target.value) || new Date().getFullYear())}
                placeholder="Tahun"
                min={1990}
                max={new Date().getFullYear() + 5}
                className={formErrors.year ? 'border-destructive' : ''}
              />
              {formErrors.year && (
                <p className="text-xs text-destructive">{formErrors.year}</p>
              )}
            </div>

            <div 
              className={cn(
                "flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all",
                editFormData.isActive 
                  ? "bg-success/10 border-success/30" 
                  : "bg-destructive/10 border-destructive/30"
              )}
              onClick={() => handleFormChange('isActive', !editFormData.isActive)}
            >
              <div className="flex items-center gap-3">
                {editFormData.isActive ? (
                  <CheckCircle2 className="w-5 h-5 text-success transition-colors" />
                ) : (
                  <XCircle className="w-5 h-5 text-destructive transition-colors" />
                )}
                <div>
                  <p className={cn(
                    "font-medium transition-colors",
                    editFormData.isActive ? "text-success" : "text-destructive"
                  )}>
                    {editFormData.isActive ? "Aktif" : "Selesai"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {editFormData.isActive ? "Masih aktif di posisi ini" : "Sudah tidak bekerja di sini"}
                  </p>
                </div>
              </div>
              <div className={cn(
                "w-11 h-6 rounded-full transition-colors relative",
                editFormData.isActive ? "bg-success" : "bg-destructive"
              )}>
                <div className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-background transition-all",
                  editFormData.isActive ? "left-6" : "left-1"
                )} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseEditDialog} disabled={isSaving}>
              Batal
            </Button>
            <Button onClick={handleEditSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Perubahan'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discard Changes Confirmation Dialog */}
      <AlertDialog open={discardDialogOpen} onOpenChange={setDiscardDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Buang Perubahan?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin membatalkan dan kehilangan perubahan tersebut?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDiscardDialogOpen(false)}>
              Kembali Edit
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscardConfirm}>
              Buang Perubahan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
