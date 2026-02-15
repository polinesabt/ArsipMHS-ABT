/**
 * Shared Achievement Form Modal
 * Used by both Student (PrestasiPage) and Admin (AdminStudentEditModal)
 * Provides full CRUD for all achievement categories
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { FileUpload } from '@/components/shared/FileUpload';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  X, Check, Paperclip, CalendarIcon
} from 'lucide-react';
import {
  Achievement,
  AchievementCategory,
} from '@/types/achievement.types';
import { createAchievementViaAPI, updateAchievementViaAPI } from '@/repositories/api-student.repository';
import { mapUiAchievementToApiPayload } from '@/lib/achievement-api-mapper';
import { createAchievement, updateAchievement } from '@/services/achievement.service';
import { useToast } from '@/hooks/use-toast';

interface AchievementFormModalProps {
  masterId: string;
  category?: AchievementCategory;
  editData?: Achievement | null;
  onClose: () => void;
  onSuccess: () => void;
  useApi?: boolean;
  /**
   * Rendering mode:
   * - "fixed": full-viewport overlay (default; used on PrestasiPage)
   * - "absolute": fill parent container (used when opened inside Admin DialogContent)
   */
  layout?: 'fixed' | 'absolute';
}

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  lomba: 'Lomba',
  seminar: 'Seminar',
  publikasi: 'Karya Ilmiah & Publikasi',
  haki: 'Kekayaan Intelektual',
  magang: 'Pengalaman Magang',
  portofolio: 'Portofolio Praktikum Kelas',
  wirausaha: 'Pengalaman Wirausaha',
  pengembangan: 'Program Pengembangan Diri',
  organisasi: 'Organisasi & Kepemimpinan',
};

export function AchievementFormModal({
  masterId,
  category = 'lomba',
  editData,
  onClose,
  onSuccess,
  layout = 'fixed',
  useApi = false,
}: AchievementFormModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory>(editData?.category || category);
  const [formData, setFormData] = useState<Record<string, any>>(editData || {});
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation for Organisasi category
    if (selectedCategory === 'organisasi') {
      if (!formData.tanggalMulai) {
        toast({
          title: 'Validasi gagal',
          description: 'Tanggal masuk organisasi wajib diisi.',
          variant: 'destructive',
        });
        return;
      }

      if (formData.masihAktif === false && !formData.tanggalSelesai) {
        toast({
          title: 'Validasi gagal',
          description: 'Tanggal selesai keanggotaan wajib diisi jika keanggotaan sudah berakhir.',
          variant: 'destructive',
        });
        return;
      }

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

    // Validation for Portofolio category
    if (selectedCategory === 'portofolio' && formData.mataKuliah === 'other' && (!formData.mataKuliahCustom || !formData.mataKuliahCustom.trim())) {
      toast({
        title: 'Validasi gagal',
        description: 'Nama mata kuliah lainnya wajib diisi.',
        variant: 'destructive',
      });
      return;
    }
    
    if (useApi) {
      const payload = mapUiAchievementToApiPayload(masterId, selectedCategory, formData);
      if (editData) {
        const response = await updateAchievementViaAPI(editData.id, payload);
        if (!response.success) {
          toast({
            title: 'Gagal menyimpan',
            description: response.error || 'Terjadi kesalahan saat menyimpan.',
            variant: 'destructive',
          });
          return;
        }
      } else {
        const response = await createAchievementViaAPI(payload);
        if (!response.success) {
          toast({
            title: 'Gagal menyimpan',
            description: response.error || 'Terjadi kesalahan saat menyimpan.',
            variant: 'destructive',
          });
          return;
        }
      }
    } else {
      if (editData) {
        updateAchievement(editData.id, { ...formData, category: selectedCategory });
      } else {
        createAchievement({ ...formData, masterId, category: selectedCategory });
      }
    }
    onSuccess();
  };

  const updateField = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const isAbsolute = layout === 'absolute';
  const modalContent = (
    <div
      className={cn(
        isAbsolute
          ? 'absolute inset-0 z-[60] flex items-center justify-center p-4'
          : 'fixed inset-0 z-[100] flex items-center justify-center p-4',
        'bg-background/80 backdrop-blur-sm animate-fade-in pointer-events-auto',
      )}
    >
      <div
        className={cn(
          'w-full max-w-2xl overflow-y-auto overscroll-contain touch-pan-y bg-card border border-border rounded-2xl shadow-elevated animate-scale-in pointer-events-auto',
          isAbsolute ? 'h-full max-h-full' : 'max-h-[90vh]',
        )}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {editData ? 'Edit Prestasi' : 'Tambah Prestasi'}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Category Selector (only for new achievements) */}
          {!editData && (
            <div className="space-y-2">
              <Label>Kategori Prestasi</Label>
              <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as AchievementCategory)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent className="z-[200]" position="popper">
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Dynamic Form Fields */}
          {selectedCategory === 'lomba' && <LombaFields formData={formData} updateField={updateField} />}
          {selectedCategory === 'seminar' && <SeminarFields formData={formData} updateField={updateField} />}
          {selectedCategory === 'publikasi' && <PublikasiFields formData={formData} updateField={updateField} />}
          {selectedCategory === 'haki' && <HakiFields formData={formData} updateField={updateField} />}
          {selectedCategory === 'magang' && <MagangFields formData={formData} updateField={updateField} />}
          {selectedCategory === 'portofolio' && <PortofolioFields formData={formData} updateField={updateField} />}
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
              maxSizeInMB={5}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Unggah sertifikat, foto dokumentasi, atau dokumen pendukung lainnya (maks. 5 file)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
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

  // IMPORTANT: Do not portal to document.body.
  // When this modal is opened from inside the Admin Radix Dialog,
  // the parent Dialog's modal layer can disable pointer events for "outside" content.
  // Rendering inline keeps this modal interactive (scroll, inputs, Select outside-click close).
  return modalContent;
}

// ============ Field Components ============

interface FieldProps { 
  formData: Record<string, any>; 
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
      <div className="grid grid-cols-2 gap-4">
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
      <div className="grid grid-cols-2 gap-4">
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
  return (
    <div className="space-y-4">
      <div>
        <Label>Nama Seminar *</Label>
        <Input 
          value={formData.namaSeminar || ''} 
          onChange={(e) => updateField('namaSeminar', e.target.value)} 
          placeholder="Contoh: Seminar Nasional Teknologi"
          required 
        />
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
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Peran *</Label>
          <Select value={formData.peran || ''} onValueChange={(v) => updateField('peran', v)}>
            <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="peserta">Peserta</SelectItem>
              <SelectItem value="pembicara">Pembicara</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Mode *</Label>
          <Select value={formData.mode || ''} onValueChange={(v) => updateField('mode', v)}>
            <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
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

function OrganisasiFields({ formData, updateField }: FieldProps) {
  const masihAktif = formData.masihAktif ?? true;

  const handleMasihAktifChange = (checked: boolean) => {
    updateField('masihAktif', checked);
    if (checked) {
      updateField('tanggalSelesai', undefined);
    }
  };

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

      <div>
        <Label>Tanggal Masuk Organisasi *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.tanggalMulai && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.tanggalMulai 
                ? format(new Date(formData.tanggalMulai), 'd MMMM yyyy', { locale: idLocale })
                : <span>Pilih tanggal mulai</span>
              }
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formData.tanggalMulai ? new Date(formData.tanggalMulai) : undefined}
              onSelect={(date) => updateField('tanggalMulai', date?.toISOString().split('T')[0])}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div 
        className={`overflow-hidden transition-all duration-300 ease-out ${
          !masihAktif 
            ? 'max-h-32 opacity-100' 
            : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pt-1">
          <Label>Tanggal Selesai Keanggotaan *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.tanggalSelesai && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.tanggalSelesai 
                  ? format(new Date(formData.tanggalSelesai), 'd MMMM yyyy', { locale: idLocale })
                  : <span>Pilih tanggal selesai</span>
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.tanggalSelesai ? new Date(formData.tanggalSelesai) : undefined}
                onSelect={(date) => updateField('tanggalSelesai', date?.toISOString().split('T')[0])}
                disabled={(date) => 
                  formData.tanggalMulai ? date < new Date(formData.tanggalMulai) : false
                }
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
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
      <div className="grid grid-cols-2 gap-4">
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
      <div className="grid grid-cols-2 gap-4">
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
      <div className="grid grid-cols-2 gap-4">
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
      <div className="grid grid-cols-2 gap-4">
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
      <div className="grid grid-cols-2 gap-4">
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

      <div className="grid grid-cols-2 gap-4">
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
      <div className="grid grid-cols-2 gap-4">
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
            <SelectItem value="pelatihan">Pelatihan</SelectItem>
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
      <div className="grid grid-cols-2 gap-4">
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
      <div className="grid grid-cols-2 gap-4">
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
          value={formData.output || ''} 
          onChange={(e) => updateField('output', e.target.value)} 
          placeholder="Contoh: Sertifikat, Best Participant"
        />
      </div>
    </div>
  );
}
