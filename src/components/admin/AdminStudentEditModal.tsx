/**
 * Admin Student Edit Modal
 * Comprehensive modal for editing student data including:
 * - Profile information
 * - Career history (with full status types: bekerja/wirausaha/studi/mencari)
 * - Achievements (with all 9 categories)
 */

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { 
  User, Briefcase, Trophy, Eye, EyeOff, Save, Trash2, Plus, 
  AlertCircle, CheckCircle2, Pencil, Building2, MapPin, Calendar,
  Rocket, GraduationCap, Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StudentProfile, StudentStatus, StudentStatusMode } from '@/types/student.types';
import type { Achievement } from '@/types/achievement.types';
import { ACHIEVEMENT_CATEGORIES } from '@/types/achievement.types';
import type { AlumniData } from '@/types/alumni.types';
// Data now fetched via API for admin modal CRUD
import {
  getAchievementsFromAPI,
  deleteAchievementViaAPI,
  getTracerStudyFromAPI,
  createTracerStudyViaAPI,
  updateTracerStudyViaAPI,
  deleteTracerStudyViaAPI,
  type TracerStudy as ApiTracerStudy,
} from '@/repositories/api-student.repository';
import { mapApiAchievementToUi } from '@/lib/achievement-api-mapper';
import { AchievementFormModal, CareerFormModal, CAREER_STATUS_CONFIG, type CareerFormData } from '@/components/shared';
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

interface AdminStudentEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentProfile | null;
  existingNims: string[];
  onUpdateProfile: (studentId: string, updates: Partial<StudentProfile>) => Promise<{ success: boolean; error?: string }>;
  onResetPassword: (studentId: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  onDataChanged?: () => void | Promise<void>;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 15 }, (_, i) => currentYear - i);

const statusOptions: { value: StudentStatus; label: string }[] = [
  { value: 'active', label: 'Mahasiswa Aktif' },
  { value: 'alumni', label: 'Alumni' },
  { value: 'on_leave', label: 'Cuti' },
  { value: 'dropout', label: 'Dropout' },
];

const NIM_PATTERN = /^(?=.{4,20}$)[0-9.]+$/;

function computeEffectiveStudentStatus(
  statusMode: StudentStatusMode,
  statusManual: StudentStatus,
  tahunMasuk: number,
  tahunLulus?: number
): StudentStatus {
  if (statusMode === 'manual') return statusManual;
  const nowYear = new Date().getFullYear();
  if (tahunLulus && tahunLulus <= nowYear) return 'alumni';
  if (!tahunLulus && nowYear >= tahunMasuk + 4) return 'alumni';
  return 'active';
}

// Career status icons
const STATUS_ICONS = {
  bekerja: Briefcase,
  wirausaha: Rocket,
  studi: GraduationCap,
  mencari: Search,
};

function parseJsonField<T = Record<string, unknown>>(value: unknown): T | undefined {
  if (!value) return undefined;
  if (typeof value === 'object') return value as T;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function mapCareerStatus(status?: string): AlumniData['status'] {
  switch (status) {
    case 'working':
      return 'bekerja';
    case 'job_seeking':
      return 'mencari';
    case 'entrepreneur':
      return 'wirausaha';
    case 'further_study':
      return 'studi';
    default:
      return 'mencari';
  }
}

function mapTracerToAlumniData(tracer: ApiTracerStudy): AlumniData {
  const status = mapCareerStatus(tracer.career_status);
  const employment = parseJsonField<Record<string, unknown>>(tracer.employment_data);
  const jobSeeking = parseJsonField<Record<string, unknown>>(tracer.job_seeking_data);
  const entrepreneurship = parseJsonField<Record<string, unknown>>(tracer.entrepreneurship_data);
  const furtherStudy = parseJsonField<Record<string, unknown>>(tracer.further_study_data);
  
  const base: AlumniData = {
    id: tracer.id,
    alumniMasterId: tracer.student_id,
    status,
    tahunPengisian: tracer.tahun_pengisian ? Number(tracer.tahun_pengisian) : new Date().getFullYear(),
    email: tracer.email || '',
    noHp: tracer.no_hp || '',
    mediaSosial: tracer.media_sosial || undefined,
    linkedin: tracer.linkedin || undefined,
    bersediaDihubungi: Boolean(tracer.bersedia_dihubungi),
    saranKomentar: tracer.saran_komentar || undefined,
    createdAt: tracer.created_at ? new Date(tracer.created_at) : new Date(),
  };
  
  if (status === 'bekerja' && employment) {
    return {
      ...base,
      namaPerusahaan: employment['nama_perusahaan'] as string | undefined,
      lokasiPerusahaan: employment['lokasi_perusahaan'] as string | undefined,
      bidangIndustri: employment['bidang_industri'] as string | undefined,
      jabatan: employment['jabatan'] as string | undefined,
      tahunMulaiKerja: employment['tahun_mulai_kerja'] as number | undefined,
      bulanMulaiKerja: employment['bulan_mulai_kerja'] as number | undefined,
      tahunSelesaiKerja: employment['tahun_selesai_kerja'] as number | undefined,
      masihAktifKerja: employment['masih_aktif_kerja'] as boolean | undefined,
      kontakProfesional: employment['kontak_profesional'] as string | undefined,
      cakupanTempatKerja: employment['work_scope'] as string | undefined,
    };
  }
  
  if (status === 'wirausaha' && entrepreneurship) {
    const sosial = entrepreneurship['sosial_media_usaha'];
    return {
      ...base,
      namaUsaha: entrepreneurship['nama_usaha'] as string | undefined,
      jenisUsaha: entrepreneurship['jenis_usaha'] as string | undefined,
      lokasiUsaha: entrepreneurship['lokasi_usaha'] as string | undefined,
      tahunMulaiUsaha: entrepreneurship['tahun_mulai_usaha'] as number | undefined,
      bulanMulaiUsaha: entrepreneurship['bulan_mulai_usaha'] as number | undefined,
      punyaKaryawan: entrepreneurship['punya_karyawan'] as boolean | undefined,
      jumlahKaryawan: entrepreneurship['jumlah_karyawan'] as number | undefined,
      usahaAktif: entrepreneurship['usaha_aktif'] as boolean | undefined,
      cakupanTempatKerja: entrepreneurship['work_scope'] as string | undefined,
      sosialMediaUsaha: Array.isArray(sosial) ? (sosial as string[]) : undefined,
    };
  }
  
  if (status === 'studi' && furtherStudy) {
    return {
      ...base,
      namaKampus: furtherStudy['nama_kampus'] as string | undefined,
      programStudi: furtherStudy['program_studi'] as string | undefined,
      jenjang: furtherStudy['jenjang'] as AlumniData['jenjang'] | undefined,
      lokasiKampus: furtherStudy['lokasi_kampus'] as string | undefined,
      tahunMulaiStudi: furtherStudy['tahun_mulai_studi'] as number | undefined,
      tahunSelesaiStudi: furtherStudy['tahun_selesai_studi'] as number | undefined,
      masihAktifStudi: furtherStudy['masih_aktif_studi'] as boolean | undefined,
    };
  }
  
  if (status === 'mencari' && jobSeeking) {
    return {
      ...base,
      lokasiTujuan: jobSeeking['lokasi_tujuan'] as string | undefined,
      bidangDiincar: jobSeeking['bidang_diincar'] as string | undefined,
      lamaMencari: jobSeeking['lama_mencari'] as number | undefined,
    };
  }
  
  return base;
}

export function AdminStudentEditModal({
  open,
  onOpenChange,
  student,
  existingNims,
  onUpdateProfile,
  onResetPassword,
  onDataChanged,
}: AdminStudentEditModalProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    nama: '',
    nim: '',
    email: '',
    noHp: '',
    statusManual: 'active' as StudentStatus,
    statusMode: 'auto' as StudentStatusMode,
    tahunMasuk: currentYear,
    tahunLulus: undefined as number | undefined,
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  // Password reset state
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Career history state
  const [careerHistory, setCareerHistory] = useState<AlumniData[]>([]);
  const [careerFormOpen, setCareerFormOpen] = useState(false);
  const [editingCareer, setEditingCareer] = useState<AlumniData | null>(null);
  const [deleteCareerDialogOpen, setDeleteCareerDialogOpen] = useState(false);
  const [careerToDelete, setCareerToDelete] = useState<string | null>(null);

  // Achievements state
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [achievementFormOpen, setAchievementFormOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [deleteAchievementDialogOpen, setDeleteAchievementDialogOpen] = useState(false);
  const [achievementToDelete, setAchievementToDelete] = useState<string | null>(null);

  const refreshCareerData = useCallback(async () => {
    if (!student) return;
    const response = await getTracerStudyFromAPI(student.id);
    if (response.success && response.data) {
      setCareerHistory(response.data.map(mapTracerToAlumniData));
    } else {
      setCareerHistory([]);
    }
  }, [student]);

  const refreshAchievementData = useCallback(async () => {
    if (!student) return;
    const response = await getAchievementsFromAPI(student.id, { includeAttachments: true });
    if (response.success && response.data) {
      setAchievements(response.data.map(mapApiAchievementToUi));
    } else {
      setAchievements([]);
    }
  }, [student]);

  // Load data when student changes
  useEffect(() => {
    if (student) {
      setProfileForm({
        nama: student.nama,
        nim: student.nim,
        email: student.email || '',
        noHp: student.noHp || '',
        statusManual: student.statusManual ?? student.status,
        statusMode: student.statusMode ?? 'manual',
        tahunMasuk: student.tahunMasuk,
        tahunLulus: student.tahunLulus,
      });
      refreshCareerData();
      refreshAchievementData();
      setProfileErrors({});
      setSaveResult(null);
      setShowPasswordReset(false);
      setNewPassword('');
      setConfirmPassword('');
      setAchievementFormOpen(false);
      setEditingAchievement(null);
    }
  }, [student, refreshCareerData, refreshAchievementData]);

  // Validate profile
  const validateProfile = (): boolean => {
    const errors: Record<string, string> = {};

    if (!profileForm.nama.trim() || profileForm.nama.length < 3) {
      errors.nama = 'Nama minimal 3 karakter';
    }

    if (!NIM_PATTERN.test(profileForm.nim.trim())) {
      errors.nim = 'NIM hanya boleh berisi angka dan titik, 4-20 karakter';
    } else if (profileForm.nim !== student?.nim && existingNims.includes(profileForm.nim)) {
      errors.nim = 'NIM sudah digunakan';
    }

    if (profileForm.statusMode === 'manual' && profileForm.statusManual === 'alumni' && !profileForm.tahunLulus) {
      errors.tahunLulus = 'Tahun lulus wajib diisi untuk alumni';
    }

    if (profileForm.tahunLulus && profileForm.tahunLulus < profileForm.tahunMasuk) {
      errors.tahunLulus = 'Tahun lulus tidak boleh sebelum tahun masuk';
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save profile
  const handleSaveProfile = async () => {
    if (!student || !validateProfile()) return;

    setIsSaving(true);
    setSaveResult(null);

    try {
      const result = await onUpdateProfile(student.id, {
        nama: profileForm.nama,
        nim: profileForm.nim,
        email: profileForm.email || undefined,
        noHp: profileForm.noHp || undefined,
        statusMode: profileForm.statusMode,
        statusManual: profileForm.statusManual,
        tahunMasuk: profileForm.tahunMasuk,
        tahunLulus: profileForm.tahunLulus,
      });

      if (result.success) {
        setSaveResult({ success: true, message: 'Profil berhasil diperbarui!' });
        await onDataChanged?.();
      } else {
        setSaveResult({ success: false, message: result.error || 'Gagal memperbarui profil' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Reset password
  const handleResetPassword = async () => {
    if (!student) return;

    if (newPassword.length < 6) {
      setSaveResult({ success: false, message: 'Password minimal 6 karakter' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setSaveResult({ success: false, message: 'Konfirmasi password tidak cocok' });
      return;
    }

    setIsSaving(true);
    setSaveResult(null);

    try {
      const result = await onResetPassword(student.id, newPassword);

      if (result.success) {
        setSaveResult({ success: true, message: 'Password berhasil direset!' });
        setShowPasswordReset(false);
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setSaveResult({ success: false, message: result.error || 'Gagal mereset password' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Career handlers
  const handleSaveCareer = async (data: CareerFormData) => {
    if (!student) return;
    
    const statusMap: Record<string, string> = {
      bekerja: 'working',
      wirausaha: 'entrepreneur',
      studi: 'further_study',
      mencari: 'job_seeking',
    };

    const payload = {
      student_id: student.id,
      career_status: statusMap[data.status] || 'job_seeking',
      email: student.email || '',
      no_hp: student.noHp || '',
      media_sosial: undefined,
      linkedin: undefined,
      tahun_pengisian: data.tahunPengisian,
      employment_data: data.status === 'bekerja' ? {
        nama_perusahaan: data.namaPerusahaan,
        lokasi_perusahaan: data.lokasiPerusahaan,
        bidang_industri: data.bidangIndustri,
        jabatan: data.jabatan,
        tahun_mulai_kerja: data.tahunMulaiKerja,
        bulan_mulai_kerja: data.bulanMulaiKerja,
        tahun_selesai_kerja: data.tahunSelesaiKerja,
        masih_aktif_kerja: data.masihAktifKerja,
        work_scope: data.cakupanTempatKerja || undefined,
      } : undefined,
      entrepreneurship_data: data.status === 'wirausaha' ? {
        nama_usaha: data.namaUsaha,
        jenis_usaha: data.jenisUsaha,
        lokasi_usaha: data.lokasiUsaha,
        tahun_mulai_usaha: data.tahunMulaiUsaha,
        bulan_mulai_usaha: data.bulanMulaiUsaha,
        usaha_aktif: data.usahaAktif,
        work_scope: data.cakupanTempatKerja || undefined,
      } : undefined,
      further_study_data: data.status === 'studi' ? {
        nama_kampus: data.namaKampus,
        program_studi: data.programStudi,
        jenjang: data.jenjang,
        lokasi_kampus: data.lokasiKampus,
        tahun_mulai_studi: data.tahunMulaiStudi,
        tahun_selesai_studi: data.tahunSelesaiStudi,
        masih_aktif_studi: data.masihAktifStudi,
      } : undefined,
      job_seeking_data: data.status === 'mencari' ? {
        bidang_diincar: data.bidangDiincar,
        lokasi_tujuan: data.lokasiTujuan,
        lama_mencari: data.lamaMencari,
      } : undefined,
    };

    let savedTracer: ApiTracerStudy | null = null;
    let tracerId = data.id;

    // tracer_study currently enforces one row per student via UNIQUE(student_id),
    // so admin save must fall back to update whenever a record already exists.
    if (!tracerId) {
      tracerId = careerHistory.find((item) => item.alumniMasterId === student.id)?.id;
    }

    if (!tracerId) {
      const existingTracer = await getTracerStudyFromAPI(student.id);
      if (!existingTracer.success) {
        throw new Error(existingTracer.error || 'Gagal memeriksa tracer study yang sudah ada');
      }
      tracerId = existingTracer.data?.[0]?.id;
    }

    if (tracerId) {
      const response = await updateTracerStudyViaAPI(tracerId, payload);
      if (!response.success) {
        throw new Error(response.error || 'Gagal memperbarui tracer study');
      }
      if (response.data) savedTracer = response.data;
    } else {
      const response = await createTracerStudyViaAPI(payload);
      if (!response.success) {
        throw new Error(response.error || 'Gagal menambahkan tracer study');
      }
      if (response.data) savedTracer = response.data;
    }
    // Optimistic update: tampilkan perubahan di UI meskipun refetch gagal (mis. 500)
    if (savedTracer) {
      const newEntry = mapTracerToAlumniData(savedTracer);
      setCareerHistory((prev) => {
        if (tracerId) {
          const existingIndex = prev.findIndex((career) => career.id === tracerId);
          if (existingIndex >= 0) {
            return prev.map((career) => (career.id === tracerId ? newEntry : career));
          }
        }
        return [newEntry, ...prev];
      });
    }
    try {
      await refreshCareerData();
    } catch {
      // Refetch gagal (mis. 500); UI sudah di-update di atas
    }
    await onDataChanged?.();
  };

  const handleDeleteCareer = async () => {
    if (careerToDelete) {
      const response = await deleteTracerStudyViaAPI(careerToDelete);
      if (response.success) {
        await refreshCareerData();
        await onDataChanged?.();
      }
      setCareerToDelete(null);
    }
    setDeleteCareerDialogOpen(false);
  };

  const handleCareerFormOpenChange = (nextOpen: boolean) => {
    setCareerFormOpen(nextOpen);
    if (!nextOpen) {
      setEditingCareer(null);
    }
  };

  // Achievement handlers
  const handleDeleteAchievement = async () => {
    if (achievementToDelete) {
      const response = await deleteAchievementViaAPI(achievementToDelete);
      if (response.success) {
        await refreshAchievementData();
        await onDataChanged?.();
      }
      setAchievementToDelete(null);
    }
    setDeleteAchievementDialogOpen(false);
  };

  if (!student) return null;

  // Helper to get career display info
  const getCareerDisplay = (career: AlumniData) => {
    const config = CAREER_STATUS_CONFIG[career.status];
    const StatusIcon = STATUS_ICONS[career.status];
    
    let title = '';
    let subtitle = '';
    let location = '';
    
    if (career.status === 'bekerja') {
      title = career.namaPerusahaan || 'Perusahaan';
      subtitle = career.jabatan || 'Karyawan';
      location = career.lokasiPerusahaan || '';
    } else if (career.status === 'wirausaha') {
      title = career.namaUsaha || 'Usaha';
      subtitle = career.jenisUsaha || 'Bisnis';
      location = career.lokasiUsaha || '';
    } else if (career.status === 'studi') {
      title = career.namaKampus || 'Kampus';
      subtitle = `${career.jenjang || ''} ${career.programStudi || ''}`.trim();
      location = career.lokasiKampus || '';
    } else if (career.status === 'mencari') {
      title = 'Mencari Pekerjaan';
      subtitle = `Target: ${career.bidangDiincar || 'Berbagai bidang'}`;
      location = career.lokasiTujuan || '';
    }
    
    return { config, StatusIcon, title, subtitle, location };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[90vh] flex min-h-0 flex-col sm:max-w-3xl",
          achievementFormOpen ? "overflow-visible" : "overflow-hidden"
        )}
        onInteractOutside={(event) => {
          if (achievementFormOpen) {
            event.preventDefault();
          }
        }}
        onEscapeKeyDown={(event) => {
          if (achievementFormOpen) {
            event.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span>Edit Data Mahasiswa</span>
              <p className="text-sm font-normal text-muted-foreground mt-0.5">
                {student.nama} • {student.nim}
              </p>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Form untuk mengedit profil, riwayat karir, dan prestasi mahasiswa
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <TabsList className="grid h-auto w-full grid-cols-3 gap-1">
            <TabsTrigger value="profile" className="gap-1.5 px-2 text-xs sm:gap-2 sm:text-sm">
              <User className="w-4 h-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="career" className="gap-1.5 px-2 text-xs sm:gap-2 sm:text-sm">
              <Briefcase className="w-4 h-4" />
              Karir ({careerHistory.length})
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-1.5 px-2 text-xs sm:gap-2 sm:text-sm">
              <Trophy className="w-4 h-4" />
              Prestasi ({achievements.length})
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="mt-4 h-[calc(90vh-14rem)] min-h-0 sm:h-[calc(90vh-16rem)]">
            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-0 space-y-4 pb-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Nama */}
                <div className="space-y-2">
                  <Label>Nama Lengkap *</Label>
                  <Input
                    value={profileForm.nama}
                    onChange={(e) => setProfileForm({ ...profileForm, nama: e.target.value })}
                    className={profileErrors.nama ? 'border-destructive' : ''}
                  />
                  {profileErrors.nama && <p className="text-xs text-destructive">{profileErrors.nama}</p>}
                </div>

                {/* NIM */}
                <div className="space-y-2">
                  <Label>NIM *</Label>
                  <Input
                    value={profileForm.nim}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        nim: e.target.value.replace(/[^0-9.]/g, '').slice(0, 20),
                      })
                    }
                    className={profileErrors.nim ? 'border-destructive' : ''}
                    maxLength={20}
                  />
                  {profileErrors.nim && <p className="text-xs text-destructive">{profileErrors.nim}</p>}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  />
                </div>

                {/* No HP */}
                <div className="space-y-2">
                  <Label>No. HP</Label>
                  <Input
                    value={profileForm.noHp}
                    onChange={(e) => setProfileForm({ ...profileForm, noHp: e.target.value.replace(/\D/g, '').slice(0, 13) })}
                  />
                </div>

                {/* Status (Auto + Manual) */}
                <div className="space-y-2 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label>Status Otomatis</Label>
                    <Switch
                      checked={profileForm.statusMode === 'auto'}
                      onCheckedChange={(checked) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          statusMode: checked ? 'auto' : 'manual',
                          statusManual:
                            checked && (prev.statusManual === 'on_leave' || prev.statusManual === 'dropout')
                              ? 'active'
                              : prev.statusManual,
                        }))
                      }
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Jika aktif, sistem menentukan status efektif (Aktif/Alumni) berdasarkan Tahun Masuk/Lulus (estimasi 4 tahun).
                    Mode manual diperlukan untuk Cuti/Dropout atau override khusus.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(() => {
                      const effective = computeEffectiveStudentStatus(
                        profileForm.statusMode,
                        profileForm.statusManual,
                        profileForm.tahunMasuk,
                        profileForm.tahunLulus
                      );
                      const label = statusOptions.find((o) => o.value === effective)?.label || effective;
                      return (
                        <>
                          Status efektif saat ini: <span className="font-semibold text-foreground">{label}</span>
                        </>
                      );
                    })()}
                  </p>

                  <Label>Status Mahasiswa (Manual) *</Label>
                  <Select
                    value={profileForm.statusManual}
                    onValueChange={(v) => setProfileForm({ ...profileForm, statusManual: v as StudentStatus })}
                    disabled={profileForm.statusMode === 'auto'}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tahun Masuk */}
                <div className="space-y-2">
                  <Label>Tahun Masuk *</Label>
                  <Select
                    value={profileForm.tahunMasuk.toString()}
                    onValueChange={(v) => setProfileForm({ ...profileForm, tahunMasuk: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((y) => (
                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tahun Lulus */}
                <div className="space-y-2 sm:col-span-2">
                  <Label>
                    Tahun Lulus {profileForm.statusMode === 'manual' && profileForm.statusManual === 'alumni' && '*'}
                  </Label>
                  <Select
                    value={profileForm.tahunLulus?.toString() || ''}
                    onValueChange={(v) => setProfileForm({ ...profileForm, tahunLulus: v ? parseInt(v) : undefined })}
                  >
                    <SelectTrigger className={profileErrors.tahunLulus ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Pilih tahun" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((y) => (
                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {profileErrors.tahunLulus && <p className="text-xs text-destructive">{profileErrors.tahunLulus}</p>}
                </div>
              </div>

              {/* Password Reset */}
              <div className="border-t border-border pt-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Reset Password</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPasswordReset(!showPasswordReset)}
                  >
                    {showPasswordReset ? 'Batal' : 'Reset Password'}
                  </Button>
                </div>

                {showPasswordReset && (
                  <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                    <div className="space-y-2">
                      <Label>Password Baru *</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Minimal 6 karakter"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Konfirmasi Password *</Label>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi password"
                      />
                    </div>
                    <Button onClick={handleResetPassword} disabled={isSaving} size="sm">
                      {isSaving ? 'Menyimpan...' : 'Reset Password'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Save Profile Button */}
              <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                <Button onClick={handleSaveProfile} disabled={isSaving} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Menyimpan...' : 'Simpan Profil'}
                </Button>
              </div>
            </TabsContent>

            {/* Career Tab */}
            <TabsContent value="career" className="mt-0 space-y-4 pb-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h4 className="font-medium">Riwayat Karir</h4>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingCareer(null);
                    setCareerFormOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Tambah
                </Button>
              </div>

              {/* Career List */}
              {careerHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Belum ada riwayat karir
                </div>
              ) : (
                <div className="space-y-3">
                  {careerHistory.map((career) => {
                    const { config, StatusIcon, title, subtitle, location } = getCareerDisplay(career);
                    return (
                      <div
                        key={career.id}
                        className="p-4 rounded-lg border border-border hover:border-primary/30 transition-colors"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "px-2 py-0.5 rounded-full text-xs flex items-center gap-1",
                                config.bgColor,
                                config.color
                              )}>
                                <StatusIcon className="w-3 h-3" />
                                {config.label}
                              </span>
                              <span className={cn(
                                "px-2 py-0.5 rounded-full text-xs",
                                career.isActive 
                                  ? "bg-success/10 text-success" 
                                  : "bg-muted text-muted-foreground"
                              )}>
                                {career.isActive ? 'Aktif' : 'Selesai'}
                              </span>
                            </div>
                            <h5 className="font-medium">{title}</h5>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5" />
                                {subtitle}
                              </span>
                              {location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {location}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {career.tahunPengisian}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1 self-start sm:self-auto">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingCareer(career);
                                setCareerFormOpen(true);
                              }}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                setCareerToDelete(career.id);
                                setDeleteCareerDialogOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="mt-0 space-y-4 pb-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h4 className="font-medium">Prestasi Mahasiswa</h4>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingAchievement(null);
                    setAchievementFormOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Tambah
                </Button>
              </div>

              {achievements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Belum ada prestasi tercatat
                </div>
              ) : (
                <div className="space-y-3">
                  {achievements.map((achievement) => {
                    const categoryInfo = ACHIEVEMENT_CATEGORIES[achievement.category];
                    return (
                      <div
                        key={achievement.id}
                        className="p-4 rounded-lg border border-border hover:border-primary/30 transition-colors"
                      >
                        <div className="flex justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "px-2 py-0.5 rounded-full text-xs",
                                categoryInfo?.color || 'text-primary',
                                "bg-primary/10"
                              )}>
                                {categoryInfo?.label || achievement.category}
                              </span>
                              {achievement.isUnggulan && (
                                <span className="px-2 py-0.5 rounded-full text-xs bg-warning/10 text-warning">
                                  Unggulan
                                </span>
                              )}
                            </div>
                            <h5 className="font-medium">
                              {(achievement as any).namaLomba || 
                               (achievement as any).judulPublikasi ||
                               (achievement as any).namaSeminar || 
                               (achievement as any).judul || 
                               (achievement as any).namaPerusahaan ||
                               (achievement as any).namaUsaha ||
                               (achievement as any).namaProgram ||
                               (achievement as any).namaOrganisasi ||
                               (achievement as any).judulProyek ||
                               'Prestasi'}
                            </h5>
                            <p className="text-sm text-muted-foreground">
                              {(achievement as any).penyelenggara || 
                               (achievement as any).posisi ||
                               (achievement as any).jabatan ||
                               (achievement as any).mataKuliah ||
                               ''}
                              {(achievement as any).tahun && ` • ${(achievement as any).tahun}`}
                              {(achievement as any).tahunPengajuan && ` • ${(achievement as any).tahunPengajuan}`}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingAchievement(achievement);
                                setAchievementFormOpen(true);
                              }}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                setAchievementToDelete(achievement.id);
                                setDeleteAchievementDialogOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </ScrollArea>

          {/* Save Result */}
          {saveResult && (
            <div className={cn(
              "p-3 rounded-lg flex items-center gap-2 mt-4",
              saveResult.success 
                ? 'bg-success/10 text-success' 
                : 'bg-destructive/10 text-destructive'
            )}>
              {saveResult.success ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-sm">{saveResult.message}</span>
            </div>
          )}
          {/* Achievement Form Modal */}
          {achievementFormOpen && (
            <AchievementFormModal
              masterId={student.id}
              category={editingAchievement?.category}
              editData={editingAchievement}
              layout="fixed"
              useApi
              onClose={() => {
                setAchievementFormOpen(false);
                setEditingAchievement(null);
              }}
              onSuccess={() => {
                setAchievementFormOpen(false);
                setEditingAchievement(null);
                refreshAchievementData();
                onDataChanged?.();
              }}
            />
          )}
        </Tabs>
      </DialogContent>

      {/* Career Form Modal */}
      <CareerFormModal
        open={careerFormOpen}
        onOpenChange={handleCareerFormOpenChange}
        editData={editingCareer}
        onSave={handleSaveCareer}
        mode={editingCareer ? 'edit' : 'add'}
      />


      {/* Delete Career Dialog */}
      <AlertDialog open={deleteCareerDialogOpen} onOpenChange={setDeleteCareerDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Riwayat Karir</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus riwayat karir ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCareer} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Achievement Dialog */}
      <AlertDialog open={deleteAchievementDialogOpen} onOpenChange={setDeleteAchievementDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Prestasi</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus prestasi ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAchievement} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
