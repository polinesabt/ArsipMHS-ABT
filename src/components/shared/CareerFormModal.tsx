/**
 * Shared Career Form Modal
 * Used by both Student (CareerHistoryPage) and Admin (AdminStudentEditModal)
 * Provides full CRUD for all career status types (bekerja/wirausaha/studi/mencari)
 */

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Loader2, X, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import type { AlumniStatus, AlumniData } from '@/types/alumni.types';

// Career status configuration
export const CAREER_STATUS_CONFIG = {
  bekerja: {
    label: 'Bekerja',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  wirausaha: {
    label: 'Wirausaha',
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  studi: {
    label: 'Studi Lanjut',
    color: 'text-info',
    bgColor: 'bg-info/10',
  },
  mencari: {
    label: 'Mencari Kerja',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
};

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 15 }, (_, i) => currentYear - i);

const MONTH_LABELS: Record<number, string> = {
  1: 'Januari', 2: 'Februari', 3: 'Maret', 4: 'April', 5: 'Mei', 6: 'Juni',
  7: 'Juli', 8: 'Agustus', 9: 'September', 10: 'Oktober', 11: 'November', 12: 'Desember',
};
const months = Array.from({ length: 12 }, (_, i) => i + 1);

const WORK_SCOPE_OPTIONS_BEKERJA = [
  { value: 'local', label: 'Lokal/Wilayah' },
  { value: 'national', label: 'Nasional' },
  { value: 'multinational', label: 'Multinasional/ Internasional' },
] as const;

const WORK_SCOPE_OPTIONS_WIRAUSAHA = [
  { value: 'local', label: 'Lokal/Wilayah/ Berwirausaha tidak Berizin' },
  { value: 'national', label: 'Nasional/ Berwirausaha Berizin' },
  { value: 'multinational', label: 'Multinasional/ Internasional' },
] as const;

// Validation schema
const careerFormSchema = z.object({
  status: z.enum(['bekerja', 'wirausaha', 'studi', 'mencari'], {
    required_error: 'Status harus dipilih',
  }),
  tahunPengisian: z.number().min(1990).max(currentYear + 5),
  isActive: z.boolean().optional(),
});

export interface CareerFormData {
  id?: string;
  status: AlumniStatus;
  tahunPengisian: number;
  isActive: boolean;
  // Bekerja fields
  namaPerusahaan?: string;
  jabatan?: string;
  lokasiPerusahaan?: string;
  bidangIndustri?: string;
  tahunMulaiKerja?: number;
  bulanMulaiKerja?: number; // 1-12, untuk kalkulasi waktu tunggu lulusan
  tahunSelesaiKerja?: number;
  masihAktifKerja?: boolean;
  /** Cakupan tempat kerja: local | national | multinational */
  cakupanTempatKerja?: string;
  // Wirausaha fields
  namaUsaha?: string;
  jenisUsaha?: string;
  lokasiUsaha?: string;
  tahunMulaiUsaha?: number;
  bulanMulaiUsaha?: number; // 1-12
  usahaAktif?: boolean;
  // Studi fields
  namaKampus?: string;
  programStudi?: string;
  jenjang?: 'S1' | 'S2' | 'S3';
  lokasiKampus?: string;
  tahunMulaiStudi?: number;
  tahunSelesaiStudi?: number;
  masihAktifStudi?: boolean;
  // Mencari fields
  bidangDiincar?: string;
  lokasiTujuan?: string;
  lamaMencari?: number;
}

interface CareerFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: Partial<AlumniData> | null;
  onSave: (data: CareerFormData) => Promise<void>;
  mode: 'add' | 'edit';
}

export function CareerFormModal({
  open,
  onOpenChange,
  editData,
  onSave,
  mode,
}: CareerFormModalProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  
  // Initialize form data
  const [formData, setFormData] = useState<CareerFormData>(() => getInitialFormData(editData));
  const [originalFormData, setOriginalFormData] = useState<CareerFormData>(() => getInitialFormData(editData));

  // Reset form when modal opens or editData changes
  useEffect(() => {
    if (open) {
      const initial = getInitialFormData(editData);
      setFormData(initial);
      setOriginalFormData(initial);
    }
  }, [open, editData]);

  // Check for unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(originalFormData);
  }, [formData, originalFormData]);

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setDiscardDialogOpen(true);
    } else {
      onOpenChange(false);
    }
  };

  const handleSave = async () => {
    // Basic validation
    const result = careerFormSchema.safeParse(formData);
    if (!result.success) {
      toast({
        title: 'Validasi gagal',
        description: 'Mohon lengkapi semua field yang wajib diisi.',
        variant: 'destructive',
      });
      return;
    }

    // Status-specific validation
    if (formData.status === 'bekerja' && (!formData.namaPerusahaan || !formData.jabatan)) {
      toast({
        title: 'Validasi gagal',
        description: 'Nama perusahaan dan jabatan wajib diisi.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.status === 'wirausaha' && (!formData.namaUsaha || !formData.jenisUsaha)) {
      toast({
        title: 'Validasi gagal',
        description: 'Nama usaha dan jenis usaha wajib diisi.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.status === 'studi' && (!formData.namaKampus || !formData.programStudi)) {
      toast({
        title: 'Validasi gagal',
        description: 'Nama kampus dan program studi wajib diisi.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      await onSave(formData);
      toast({
        title: mode === 'add' ? 'Berhasil ditambahkan' : 'Berhasil diperbarui',
        description: 'Data riwayat karir telah disimpan.',
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Gagal menyimpan',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan data.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = <K extends keyof CareerFormData>(key: K, value: CareerFormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {mode === 'add' ? 'Tambah Riwayat Karir' : 'Edit Riwayat Karir'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'add' 
                ? 'Tambahkan informasi karir baru' 
                : 'Perbarui informasi karir yang ada'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Status Selection */}
            <div className="space-y-2">
              <Label>Status Karir *</Label>
              <Select 
                value={formData.status} 
                onValueChange={(v) => updateField('status', v as AlumniStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CAREER_STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <span className={config.color}>{config.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tahun Pengisian */}
            <div className="space-y-2">
              <Label>Tahun Pencatatan *</Label>
              <Select 
                value={formData.tahunPengisian.toString()} 
                onValueChange={(v) => updateField('tahunPengisian', parseInt(v))}
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

            {/* Dynamic Fields based on Status */}
            {formData.status === 'bekerja' && (
              <BekerjaFields formData={formData} updateField={updateField} />
            )}
            {formData.status === 'wirausaha' && (
              <WirausahaFields formData={formData} updateField={updateField} />
            )}
            {formData.status === 'studi' && (
              <StudiFields formData={formData} updateField={updateField} />
            )}
            {formData.status === 'mencari' && (
              <MencariFields formData={formData} updateField={updateField} />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row">
            <Button variant="outline" onClick={handleClose} className="flex-1" disabled={isSaving}>
              Batal
            </Button>
            <Button onClick={handleSave} className="flex-1" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Discard Changes Dialog */}
      <AlertDialog open={discardDialogOpen} onOpenChange={setDiscardDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Perubahan belum disimpan</AlertDialogTitle>
            <AlertDialogDescription>
              Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin menutup?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Kembali</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setDiscardDialogOpen(false); onOpenChange(false); }}>
              Buang Perubahan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Helper to get initial form data
function getInitialFormData(editData?: Partial<AlumniData> | null): CareerFormData {
  if (editData) {
    return {
      id: editData.id,
      status: editData.status || 'bekerja',
      tahunPengisian: editData.tahunPengisian || currentYear,
      isActive: editData.isActive ?? true,
      // Bekerja
      namaPerusahaan: editData.namaPerusahaan,
      jabatan: editData.jabatan,
      lokasiPerusahaan: editData.lokasiPerusahaan,
      bidangIndustri: editData.bidangIndustri,
      tahunMulaiKerja: editData.tahunMulaiKerja,
      bulanMulaiKerja: editData.bulanMulaiKerja,
      tahunSelesaiKerja: editData.tahunSelesaiKerja,
      masihAktifKerja: editData.masihAktifKerja ?? true,
      cakupanTempatKerja: editData.cakupanTempatKerja,
      // Wirausaha
      namaUsaha: editData.namaUsaha,
      jenisUsaha: editData.jenisUsaha,
      lokasiUsaha: editData.lokasiUsaha,
      tahunMulaiUsaha: editData.tahunMulaiUsaha,
      bulanMulaiUsaha: editData.bulanMulaiUsaha,
      usahaAktif: editData.usahaAktif ?? true,
      // Studi
      namaKampus: editData.namaKampus,
      programStudi: editData.programStudi,
      jenjang: editData.jenjang,
      lokasiKampus: editData.lokasiKampus,
      tahunMulaiStudi: editData.tahunMulaiStudi,
      tahunSelesaiStudi: editData.tahunSelesaiStudi,
      masihAktifStudi: editData.masihAktifStudi ?? true,
      // Mencari
      bidangDiincar: editData.bidangDiincar,
      lokasiTujuan: editData.lokasiTujuan,
      lamaMencari: editData.lamaMencari,
    };
  }
  return {
    status: 'bekerja',
    tahunPengisian: currentYear,
    isActive: true,
    masihAktifKerja: true,
    usahaAktif: true,
    masihAktifStudi: true,
  };
}

// ============ Field Components ============

interface FieldProps {
  formData: CareerFormData;
  updateField: <K extends keyof CareerFormData>(key: K, value: CareerFormData[K]) => void;
}

function BekerjaFields({ formData, updateField }: FieldProps) {
  const masihAktif = formData.masihAktifKerja ?? true;

  return (
    <div className="space-y-4 p-4 rounded-lg bg-muted/30 border border-border">
      <h4 className="font-medium text-sm text-muted-foreground">Detail Pekerjaan</h4>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Nama Perusahaan *</Label>
          <Input
            value={formData.namaPerusahaan || ''}
            onChange={(e) => updateField('namaPerusahaan', e.target.value)}
            placeholder="PT Contoh Indonesia"
          />
        </div>
        <div className="space-y-2">
          <Label>Jabatan *</Label>
          <Input
            value={formData.jabatan || ''}
            onChange={(e) => updateField('jabatan', e.target.value)}
            placeholder="Software Engineer"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Lokasi</Label>
          <Input
            value={formData.lokasiPerusahaan || ''}
            onChange={(e) => updateField('lokasiPerusahaan', e.target.value)}
            placeholder="Jakarta"
          />
        </div>
        <div className="space-y-2">
          <Label>Bidang Industri</Label>
          <Input
            value={formData.bidangIndustri || ''}
            onChange={(e) => updateField('bidangIndustri', e.target.value)}
            placeholder="Teknologi"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Cakupan tempat kerja</Label>
        <Select
          value={formData.cakupanTempatKerja || ''}
          onValueChange={(v) => updateField('cakupanTempatKerja', v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih cakupan" />
          </SelectTrigger>
          <SelectContent>
            {WORK_SCOPE_OPTIONS_BEKERJA.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Lokal/Wilayah; Nasional; atau Multinasional/Internasional (untuk statistik Cakupan Kerja tab Bekerja)
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Tahun Mulai *</Label>
          <Select 
            value={formData.tahunMulaiKerja?.toString() || ''} 
            onValueChange={(v) => updateField('tahunMulaiKerja', parseInt(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih tahun" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Bulan Mulai Bekerja</Label>
          <Select 
            value={formData.bulanMulaiKerja?.toString() || ''} 
            onValueChange={(v) => updateField('bulanMulaiKerja', parseInt(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih bulan" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m} value={m.toString()}>{MONTH_LABELS[m]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Untuk perhitungan waktu tunggu lulusan lebih akurat</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Tahun Selesai - Conditional */}
        <div className={cn(
          "space-y-2 transition-opacity duration-200",
          masihAktif ? "opacity-50 pointer-events-none" : "opacity-100"
        )}>
          <Label>Tahun Selesai</Label>
          <Select 
            value={formData.tahunSelesaiKerja?.toString() || ''} 
            onValueChange={(v) => updateField('tahunSelesaiKerja', v ? parseInt(v) : undefined)}
            disabled={masihAktif}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih tahun" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Masih Aktif Toggle */}
      <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-background">
        <div className="space-y-0.5">
          <Label className="text-sm">Masih bekerja di sini</Label>
          <p className="text-xs text-muted-foreground">
            {masihAktif ? 'Posisi saat ini masih aktif' : 'Posisi sudah berakhir'}
          </p>
        </div>
        <Switch 
          checked={masihAktif} 
          onCheckedChange={(checked) => {
            updateField('masihAktifKerja', checked);
            updateField('isActive', checked);
            if (checked) {
              updateField('tahunSelesaiKerja', undefined);
            }
          }}
        />
      </div>
    </div>
  );
}

function WirausahaFields({ formData, updateField }: FieldProps) {
  const usahaAktif = formData.usahaAktif ?? true;

  return (
    <div className="space-y-4 p-4 rounded-lg bg-muted/30 border border-border">
      <h4 className="font-medium text-sm text-muted-foreground">Detail Wirausaha</h4>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Nama Usaha *</Label>
          <Input
            value={formData.namaUsaha || ''}
            onChange={(e) => updateField('namaUsaha', e.target.value)}
            placeholder="Nama bisnis/usaha"
          />
        </div>
        <div className="space-y-2">
          <Label>Jenis Usaha *</Label>
          <Input
            value={formData.jenisUsaha || ''}
            onChange={(e) => updateField('jenisUsaha', e.target.value)}
            placeholder="F&B, Fashion, Teknologi"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Lokasi</Label>
          <Input
            value={formData.lokasiUsaha || ''}
            onChange={(e) => updateField('lokasiUsaha', e.target.value)}
            placeholder="Kota operasional"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Level Wirausaha</Label>
        <Select
          value={formData.cakupanTempatKerja || ''}
          onValueChange={(v) => updateField('cakupanTempatKerja', v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih level wirausaha" />
          </SelectTrigger>
          <SelectContent>
            {WORK_SCOPE_OPTIONS_WIRAUSAHA.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Untuk statistik Cakupan Kerja tab Wirausaha
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Tahun Mulai *</Label>
          <Select 
            value={formData.tahunMulaiUsaha?.toString() || ''} 
            onValueChange={(v) => updateField('tahunMulaiUsaha', parseInt(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih tahun" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Bulan Mulai Usaha</Label>
          <Select 
            value={formData.bulanMulaiUsaha?.toString() || ''} 
            onValueChange={(v) => updateField('bulanMulaiUsaha', parseInt(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih bulan" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m} value={m.toString()}>{MONTH_LABELS[m]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Untuk perhitungan waktu tunggu lulusan lebih akurat</p>
        </div>
      </div>

      {/* Usaha Aktif Toggle */}
      <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-background">
        <div className="space-y-0.5">
          <Label className="text-sm">Usaha masih aktif</Label>
          <p className="text-xs text-muted-foreground">
            {usahaAktif ? 'Usaha masih beroperasi' : 'Usaha sudah tidak beroperasi'}
          </p>
        </div>
        <Switch 
          checked={usahaAktif} 
          onCheckedChange={(checked) => {
            updateField('usahaAktif', checked);
            updateField('isActive', checked);
          }}
        />
      </div>
    </div>
  );
}

function StudiFields({ formData, updateField }: FieldProps) {
  const masihAktif = formData.masihAktifStudi ?? true;

  return (
    <div className="space-y-4 p-4 rounded-lg bg-muted/30 border border-border">
      <h4 className="font-medium text-sm text-muted-foreground">Detail Studi Lanjut</h4>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Nama Kampus *</Label>
          <Input
            value={formData.namaKampus || ''}
            onChange={(e) => updateField('namaKampus', e.target.value)}
            placeholder="Universitas/Institut"
          />
        </div>
        <div className="space-y-2">
          <Label>Program Studi *</Label>
          <Input
            value={formData.programStudi || ''}
            onChange={(e) => updateField('programStudi', e.target.value)}
            placeholder="Teknik Informatika"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Jenjang *</Label>
          <Select 
            value={formData.jenjang || ''} 
            onValueChange={(v) => updateField('jenjang', v as 'S1' | 'S2' | 'S3')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih jenjang" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="S1">S1</SelectItem>
              <SelectItem value="S2">S2</SelectItem>
              <SelectItem value="S3">S3</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Lokasi Kampus</Label>
          <Input
            value={formData.lokasiKampus || ''}
            onChange={(e) => updateField('lokasiKampus', e.target.value)}
            placeholder="Kota, Negara"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Tahun Mulai *</Label>
          <Select 
            value={formData.tahunMulaiStudi?.toString() || ''} 
            onValueChange={(v) => updateField('tahunMulaiStudi', parseInt(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih tahun" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className={cn(
          "space-y-2 transition-opacity duration-200",
          masihAktif ? "opacity-50 pointer-events-none" : "opacity-100"
        )}>
          <Label>Tahun Selesai</Label>
          <Select 
            value={formData.tahunSelesaiStudi?.toString() || ''} 
            onValueChange={(v) => updateField('tahunSelesaiStudi', v ? parseInt(v) : undefined)}
            disabled={masihAktif}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih tahun" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Masih Studi Toggle */}
      <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-background">
        <div className="space-y-0.5">
          <Label className="text-sm">Masih menempuh studi</Label>
          <p className="text-xs text-muted-foreground">
            {masihAktif ? 'Studi masih berlangsung' : 'Studi sudah selesai'}
          </p>
        </div>
        <Switch 
          checked={masihAktif} 
          onCheckedChange={(checked) => {
            updateField('masihAktifStudi', checked);
            updateField('isActive', checked);
            if (checked) {
              updateField('tahunSelesaiStudi', undefined);
            }
          }}
        />
      </div>
    </div>
  );
}

function MencariFields({ formData, updateField }: FieldProps) {
  return (
    <div className="space-y-4 p-4 rounded-lg bg-muted/30 border border-border">
      <h4 className="font-medium text-sm text-muted-foreground">Detail Pencarian Kerja</h4>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Bidang yang Diincar</Label>
          <Input
            value={formData.bidangDiincar || ''}
            onChange={(e) => updateField('bidangDiincar', e.target.value)}
            placeholder="IT, Marketing, Finance"
          />
        </div>
        <div className="space-y-2">
          <Label>Lokasi Tujuan</Label>
          <Input
            value={formData.lokasiTujuan || ''}
            onChange={(e) => updateField('lokasiTujuan', e.target.value)}
            placeholder="Jakarta, Surabaya"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Lama Mencari (bulan)</Label>
        <Input
          type="number"
          value={formData.lamaMencari || ''}
          onChange={(e) => updateField('lamaMencari', parseInt(e.target.value) || undefined)}
          placeholder="Berapa bulan sudah mencari"
          min={0}
        />
      </div>
    </div>
  );
}
