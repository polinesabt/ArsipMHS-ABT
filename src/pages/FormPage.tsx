import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAlumni } from '@/contexts/AlumniContext';
import {
  createTracerStudyViaAPI,
  getTracerStudyFromAPI,
  updateTracerStudyViaAPI,
  type CreateTracerStudyPayload,
} from '@/repositories/api-student.repository';
import { bidangIndustriList } from '@/lib/data';
import { toast } from '@/hooks/use-toast';
import { StepProgress } from '@/components/shared';
import { 
  Briefcase, Search, Rocket, BookOpen, 
  ChevronRight, ChevronLeft, Check, Plus, X,
  Building2, MapPin, Mail, Phone, Linkedin, Instagram,
  User, MessageSquare, Send
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Status = 'bekerja' | 'mencari' | 'wirausaha' | 'studi';

const statusOptions = [
  { value: 'bekerja', label: 'Bekerja', icon: Briefcase, description: 'Saat ini bekerja di perusahaan/instansi', bgColor: 'bg-primary/10', textColor: 'text-primary' },
  { value: 'mencari', label: 'Mencari Kerja', icon: Search, description: 'Sedang aktif mencari pekerjaan', bgColor: 'bg-warning/10', textColor: 'text-warning' },
  { value: 'wirausaha', label: 'Wirausaha', icon: Rocket, description: 'Menjalankan usaha sendiri', bgColor: 'bg-success/10', textColor: 'text-success' },
  { value: 'studi', label: 'Studi Lanjut', icon: BookOpen, description: 'Melanjutkan pendidikan S1/S2/S3', bgColor: 'bg-destructive/10', textColor: 'text-destructive' },
];

const formSteps = [
  { id: 1, title: 'Status', description: 'Pilih status' },
  { id: 2, title: 'Detail', description: 'Isi detail' },
  { id: 3, title: 'Kontak', description: 'Info kontak' },
  { id: 4, title: 'Selesai', description: 'Konfirmasi' },
];

export default function FormPage() {
  const navigate = useNavigate();
  const { selectedAlumni, refreshData } = useAlumni();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [status, setStatus] = useState<Status | null>(null);
  
  // Form fields - Bekerja
  const [namaPerusahaan, setNamaPerusahaan] = useState('');
  const [lokasiPerusahaan, setLokasiPerusahaan] = useState('');
  const [bidangIndustri, setBidangIndustri] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [tahunMulaiKerja, setTahunMulaiKerja] = useState('');
  const [tahunSelesaiKerja, setTahunSelesaiKerja] = useState('');
  const [masihAktifKerja, setMasihAktifKerja] = useState(true);
  const [kontakProfesional, setKontakProfesional] = useState('');

  // Form fields - Mencari
  const [lokasiTujuan, setLokasiTujuan] = useState('');
  const [bidangDiincar, setBidangDiincar] = useState('');
  const [lamaMencari, setLamaMencari] = useState('');

  // Form fields - Wirausaha
  const [namaUsaha, setNamaUsaha] = useState('');
  const [jenisUsaha, setJenisUsaha] = useState('');
  const [lokasiUsaha, setLokasiUsaha] = useState('');
  const [tahunMulaiUsaha, setTahunMulaiUsaha] = useState('');
  const [punyaKaryawan, setPunyaKaryawan] = useState(false);
  const [jumlahKaryawan, setJumlahKaryawan] = useState('');
  const [usahaAktif, setUsahaAktif] = useState(true);
  const [sosialMediaUsaha, setSosialMediaUsaha] = useState<string[]>(['']);

  // Form fields - Studi
  const [namaKampus, setNamaKampus] = useState('');
  const [programStudi, setProgramStudi] = useState('');
  const [jenjang, setJenjang] = useState<'S1' | 'S2' | 'S3' | ''>('');
  const [lokasiKampus, setLokasiKampus] = useState('');
  const [tahunMulaiStudi, setTahunMulaiStudi] = useState('');
  const [tahunSelesaiStudi, setTahunSelesaiStudi] = useState('');
  const [masihAktifStudi, setMasihAktifStudi] = useState(true);

  // Form fields - Kontak
  const [email, setEmail] = useState('');
  const [noHp, setNoHp] = useState('');
  const [mediaSosial, setMediaSosial] = useState('');
  const [linkedin, setLinkedin] = useState('');

  // Form fields - Tambahan
  const [bersediaDihubungi, setBersediaDihubungi] = useState(true);
  const [saranKomentar, setSaranKomentar] = useState('');

  useEffect(() => {
    if (!selectedAlumni) {
      navigate('/validasi');
    }
  }, [selectedAlumni, navigate]);

  if (!selectedAlumni) return null;

  const handleAddSocialMedia = () => {
    setSosialMediaUsaha([...sosialMediaUsaha, '']);
  };

  const handleRemoveSocialMedia = (index: number) => {
    setSosialMediaUsaha(sosialMediaUsaha.filter((_, i) => i !== index));
  };

  const handleSocialMediaChange = (index: number, value: string) => {
    const updated = [...sosialMediaUsaha];
    updated[index] = value;
    setSosialMediaUsaha(updated);
  };

  const handleNext = () => {
    if (currentStep === 1 && !status) {
      toast({ title: 'Pilih status Anda terlebih dahulu', variant: 'destructive' });
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!email || !noHp) {
      toast({ title: 'Email dan No. HP wajib diisi', variant: 'destructive' });
      return;
    }

    // Validate end date is required when not active
    if (status === 'bekerja' && !masihAktifKerja && !tahunSelesaiKerja) {
      toast({ title: 'Tahun selesai bekerja wajib diisi', variant: 'destructive' });
      return;
    }

    if (status === 'studi' && !masihAktifStudi && !tahunSelesaiStudi) {
      toast({ title: 'Tahun selesai studi wajib diisi', variant: 'destructive' });
      return;
    }

    const statusMap: Record<Status, string> = {
      bekerja: 'working',
      mencari: 'job_seeking',
      wirausaha: 'entrepreneur',
      studi: 'further_study',
    };

    const payload: CreateTracerStudyPayload = {
      student_id: selectedAlumni.id,
      career_status: statusMap[status!],
      email,
      no_hp: noHp,
      media_sosial: mediaSosial || undefined,
      linkedin: linkedin || undefined,
      tahun_pengisian: new Date().getFullYear(),
      bersedia_dihubungi: bersediaDihubungi,
      saran_komentar: saranKomentar || undefined,
    };

    if (status === 'bekerja') {
      payload.employment_data = {
        nama_perusahaan: namaPerusahaan,
        lokasi_perusahaan: lokasiPerusahaan,
        bidang_industri: bidangIndustri,
        jabatan,
        tahun_mulai_kerja: parseInt(tahunMulaiKerja),
        tahun_selesai_kerja: !masihAktifKerja && tahunSelesaiKerja ? parseInt(tahunSelesaiKerja) : undefined,
        masih_aktif_kerja: masihAktifKerja,
        kontak_profesional: kontakProfesional || undefined,
      };
    }

    if (status === 'mencari') {
      payload.job_seeking_data = {
        lokasi_tujuan: lokasiTujuan,
        bidang_diincar: bidangDiincar,
        lama_mencari: parseInt(lamaMencari),
      };
    }

    if (status === 'wirausaha') {
      payload.entrepreneurship_data = {
        nama_usaha: namaUsaha,
        jenis_usaha: jenisUsaha,
        lokasi_usaha: lokasiUsaha,
        tahun_mulai_usaha: parseInt(tahunMulaiUsaha),
        punya_karyawan: punyaKaryawan,
        jumlah_karyawan: punyaKaryawan ? parseInt(jumlahKaryawan) : undefined,
        usaha_aktif: usahaAktif,
        sosial_media_usaha: sosialMediaUsaha.filter(s => s.trim()),
      };
    }

    if (status === 'studi') {
      payload.further_study_data = {
        nama_kampus: namaKampus,
        program_studi: programStudi,
        jenjang: jenjang as 'S1' | 'S2' | 'S3',
        lokasi_kampus: lokasiKampus,
        tahun_mulai_studi: parseInt(tahunMulaiStudi),
        tahun_selesai_studi: !masihAktifStudi && tahunSelesaiStudi ? parseInt(tahunSelesaiStudi) : undefined,
        masih_aktif_studi: masihAktifStudi,
      };
    }

    try {
      const existing = await getTracerStudyFromAPI(selectedAlumni.id);
      if (existing.success && existing.data && existing.data.length > 0) {
        const tracerId = existing.data[0].id;
        const updateRes = await updateTracerStudyViaAPI(tracerId, payload);
        if (!updateRes.success) {
          throw new Error(updateRes.error || 'Gagal memperbarui data tracer');
        }
      } else {
        const createRes = await createTracerStudyViaAPI(payload);
        if (!createRes.success) {
          throw new Error(createRes.error || 'Gagal menyimpan data tracer');
        }
      }

      await refreshData();
      toast({
        title: 'Data berhasil disimpan!',
        description: 'Terima kasih telah mengisi form Arsip Mahasiswa Prodi ABT.',
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Gagal menyimpan data',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan data.',
        variant: 'destructive',
      });
    }
  };

  // Step 1: Status Selection
  const renderStatusSelection = () => (
    <div className="space-y-6 animate-fade-up">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Apa status Anda saat ini?
        </h2>
        <p className="text-muted-foreground">
          Pilih salah satu status yang paling sesuai dengan kondisi Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {statusOptions.map((option, index) => (
          <div
            key={option.value}
            onClick={() => setStatus(option.value as Status)}
            className={cn(
              "p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 animate-fade-up",
              status === option.value
                ? `border-primary ${option.bgColor} shadow-elevated`
                : "border-border hover:border-primary/30 bg-card hover:shadow-soft"
            )}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-start gap-4">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", option.bgColor)}>
                <option.icon className={cn("w-6 h-6", option.textColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{option.label}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{option.description}</p>
              </div>
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                status === option.value ? "border-primary bg-primary" : "border-border"
              )}>
                {status === option.value && <Check className="w-4 h-4 text-primary-foreground" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Step 2: Dynamic Form based on status
  const renderStatusForm = () => {
    const selectedOption = statusOptions.find(o => o.value === status);
    if (!selectedOption) return null;

    return (
      <div className="space-y-6 animate-fade-up">
        <div className="text-center mb-8">
          <div className={cn("w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center", selectedOption.bgColor)}>
            <selectedOption.icon className={cn("w-7 h-7", selectedOption.textColor)} />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Detail {selectedOption.label}
          </h2>
          <p className="text-muted-foreground">
            Lengkapi informasi berikut sesuai kondisi Anda.
          </p>
        </div>

        {status === 'bekerja' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <Label className="mb-2 block font-medium">Nama Perusahaan / Instansi *</Label>
              <Input
                placeholder="Contoh: PT Telkom Indonesia"
                value={namaPerusahaan}
                onChange={(e) => setNamaPerusahaan(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
            <div>
              <Label className="mb-2 block font-medium">Lokasi *</Label>
              <Input
                placeholder="Contoh: Jakarta"
                value={lokasiPerusahaan}
                onChange={(e) => setLokasiPerusahaan(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
            <div>
              <Label className="mb-2 block font-medium">Bidang Industri *</Label>
              <Select value={bidangIndustri} onValueChange={setBidangIndustri}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Pilih bidang industri" />
                </SelectTrigger>
                <SelectContent>
                  {bidangIndustriList.map(b => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block font-medium">Jabatan / Posisi *</Label>
              <Input
                placeholder="Contoh: Network Engineer"
                value={jabatan}
                onChange={(e) => setJabatan(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
            <div>
              <Label className="mb-2 block font-medium">Tahun Mulai Bekerja *</Label>
              <Input
                type="number"
                placeholder="2023"
                value={tahunMulaiKerja}
                onChange={(e) => setTahunMulaiKerja(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
            <div>
              <Label className="mb-2 block font-medium">Status Pekerjaan</Label>
              <div className="flex items-center gap-3 h-12 px-4 rounded-xl bg-muted/50">
                <Switch 
                  checked={masihAktifKerja} 
                  onCheckedChange={(checked) => {
                    setMasihAktifKerja(checked);
                    if (checked) {
                      setTahunSelesaiKerja('');
                    }
                  }} 
                />
                <span className="text-sm font-medium">
                  {masihAktifKerja ? 'Masih aktif di sini' : 'Sudah tidak bekerja di sini'}
                </span>
              </div>
            </div>
            {!masihAktifKerja && (
              <div>
                <Label className="mb-2 block font-medium">Tahun Selesai Bekerja *</Label>
                <Input
                  type="number"
                  placeholder="2024"
                  value={tahunSelesaiKerja}
                  onChange={(e) => setTahunSelesaiKerja(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
            )}
          </div>
        )}

        {status === 'mencari' && (
          <div className="space-y-5">
            <div>
              <Label className="mb-2 block font-medium">Lokasi yang Dituju *</Label>
              <Input
                placeholder="Contoh: Semarang, Jakarta, Yogyakarta"
                value={lokasiTujuan}
                onChange={(e) => setLokasiTujuan(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
            <div>
              <Label className="mb-2 block font-medium">Bidang Pekerjaan yang Diincar *</Label>
              <Input
                placeholder="Contoh: IT Support, Marketing, Keuangan"
                value={bidangDiincar}
                onChange={(e) => setBidangDiincar(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
            <div>
              <Label className="mb-2 block font-medium">Sudah Berapa Bulan Mencari? *</Label>
              <Input
                type="number"
                placeholder="Contoh: 3"
                value={lamaMencari}
                onChange={(e) => setLamaMencari(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
          </div>
        )}

        {status === 'wirausaha' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <Label className="mb-2 block font-medium">Nama Usaha *</Label>
              <Input
                placeholder="Contoh: Toko Roti Makmur"
                value={namaUsaha}
                onChange={(e) => setNamaUsaha(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
            <div>
              <Label className="mb-2 block font-medium">Jenis Usaha *</Label>
              <Input
                placeholder="Contoh: F&B, Jasa, Retail"
                value={jenisUsaha}
                onChange={(e) => setJenisUsaha(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
            <div>
              <Label className="mb-2 block font-medium">Lokasi Usaha *</Label>
              <Input
                placeholder="Contoh: Semarang"
                value={lokasiUsaha}
                onChange={(e) => setLokasiUsaha(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
            <div>
              <Label className="mb-2 block font-medium">Tahun Mulai Usaha *</Label>
              <Input
                type="number"
                placeholder="2023"
                value={tahunMulaiUsaha}
                onChange={(e) => setTahunMulaiUsaha(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
            <div>
              <Label className="mb-2 block font-medium">Status Usaha</Label>
              <div className="flex items-center gap-3 h-12 px-4 rounded-xl bg-muted/50">
                <Switch checked={usahaAktif} onCheckedChange={setUsahaAktif} />
                <span className="text-sm">{usahaAktif ? 'Usaha Aktif' : 'Usaha Tidak Aktif'}</span>
              </div>
            </div>
            <div>
              <Label className="mb-2 block font-medium">Memiliki Karyawan?</Label>
              <div className="flex items-center gap-3 h-12 px-4 rounded-xl bg-muted/50">
                <Switch checked={punyaKaryawan} onCheckedChange={setPunyaKaryawan} />
                <span className="text-sm">{punyaKaryawan ? 'Ya' : 'Tidak'}</span>
              </div>
            </div>
            {punyaKaryawan && (
              <div>
                <Label className="mb-2 block font-medium">Jumlah Karyawan *</Label>
                <Input
                  type="number"
                  placeholder="Contoh: 5"
                  value={jumlahKaryawan}
                  onChange={(e) => setJumlahKaryawan(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
            )}
            <div className="md:col-span-2">
              <Label className="mb-2 block font-medium">Sosial Media Usaha</Label>
              <div className="space-y-3">
                {sosialMediaUsaha.map((social, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="@username atau URL"
                      value={social}
                      onChange={(e) => handleSocialMediaChange(index, e.target.value)}
                      className="h-11 rounded-xl flex-1"
                    />
                    {sosialMediaUsaha.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveSocialMedia(index)}
                        className="h-11 w-11 rounded-xl"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={handleAddSocialMedia} className="w-full h-10 rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Sosial Media
                </Button>
              </div>
            </div>
          </div>
        )}

        {status === 'studi' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <Label className="mb-2 block font-medium">Nama Kampus / Universitas *</Label>
              <Input
                placeholder="Contoh: Universitas Diponegoro"
                value={namaKampus}
                onChange={(e) => setNamaKampus(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
            <div>
              <Label className="mb-2 block font-medium">Program Studi *</Label>
              <Input
                placeholder="Contoh: Manajemen"
                value={programStudi}
                onChange={(e) => setProgramStudi(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
            <div>
              <Label className="mb-2 block font-medium">Jenjang *</Label>
              <Select value={jenjang} onValueChange={(v) => setJenjang(v as 'S1' | 'S2' | 'S3')}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Pilih jenjang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="S1">S1 (Sarjana)</SelectItem>
                  <SelectItem value="S2">S2 (Magister)</SelectItem>
                  <SelectItem value="S3">S3 (Doktor)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block font-medium">Lokasi Kampus *</Label>
              <Input
                placeholder="Contoh: Semarang"
                value={lokasiKampus}
                onChange={(e) => setLokasiKampus(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
            <div>
              <Label className="mb-2 block font-medium">Tahun Mulai Studi *</Label>
              <Input
                type="number"
                placeholder="2023"
                value={tahunMulaiStudi}
                onChange={(e) => setTahunMulaiStudi(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
            <div>
              <Label className="mb-2 block font-medium">Status Studi</Label>
              <div className="flex items-center gap-3 h-12 px-4 rounded-xl bg-muted/50">
                <Switch 
                  checked={masihAktifStudi} 
                  onCheckedChange={(checked) => {
                    setMasihAktifStudi(checked);
                    if (checked) {
                      setTahunSelesaiStudi('');
                    }
                  }} 
                />
                <span className="text-sm font-medium">
                  {masihAktifStudi ? 'Masih kuliah di sini' : 'Sudah lulus/tidak melanjutkan'}
                </span>
              </div>
            </div>
            {!masihAktifStudi && (
              <div>
                <Label className="mb-2 block font-medium">Tahun Selesai Studi *</Label>
                <Input
                  type="number"
                  placeholder="2025"
                  value={tahunSelesaiStudi}
                  onChange={(e) => setTahunSelesaiStudi(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Step 3: Contact Information
  const renderContactForm = () => (
    <div className="space-y-6 animate-fade-up">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-xl bg-info/10 mx-auto mb-4 flex items-center justify-center">
          <Mail className="w-7 h-7 text-info" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Informasi Kontak
        </h2>
        <p className="text-muted-foreground">
          Lengkapi kontak Anda agar kami dapat menghubungi jika diperlukan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <Label className="mb-2 block font-medium">Email Aktif *</Label>
          <Input
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-xl"
          />
        </div>
        <div>
          <Label className="mb-2 block font-medium">No. HP / WhatsApp *</Label>
          <Input
            placeholder="08xxxxxxxxxx"
            value={noHp}
            onChange={(e) => setNoHp(e.target.value)}
            className="h-12 rounded-xl"
          />
        </div>
        <div>
          <Label className="mb-2 block font-medium">Media Sosial (Opsional)</Label>
          <Input
            placeholder="@username Instagram/Twitter"
            value={mediaSosial}
            onChange={(e) => setMediaSosial(e.target.value)}
            className="h-12 rounded-xl"
          />
        </div>
        <div>
          <Label className="mb-2 block font-medium">LinkedIn (Opsional)</Label>
          <Input
            placeholder="linkedin.com/in/username"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            className="h-12 rounded-xl"
          />
        </div>
        <div className="md:col-span-2">
          <div className="p-4 rounded-xl bg-muted/50 flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Bersedia dihubungi kampus?</p>
              <p className="text-sm text-muted-foreground">Untuk keperluan alumni gathering, networking, dll.</p>
            </div>
            <Switch checked={bersediaDihubungi} onCheckedChange={setBersediaDihubungi} />
          </div>
        </div>
        <div className="md:col-span-2">
          <Label className="mb-2 block font-medium">Saran & Komentar (Opsional)</Label>
          <Textarea
            placeholder="Tulis saran atau komentar Anda untuk program studi..."
            value={saranKomentar}
            onChange={(e) => setSaranKomentar(e.target.value)}
            className="min-h-[100px] rounded-xl"
          />
        </div>
      </div>
    </div>
  );

  // Step 4: Confirmation
  const renderConfirmation = () => {
    const selectedOption = statusOptions.find(o => o.value === status);
    
    return (
      <div className="space-y-6 animate-fade-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-success/10 mx-auto mb-4 flex items-center justify-center">
            <Check className="w-7 h-7 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Konfirmasi Data
          </h2>
          <p className="text-muted-foreground">
            Pastikan data yang Anda masukkan sudah benar sebelum mengirim.
          </p>
        </div>

        <div className="glass-card rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            {selectedOption && (
              <>
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", selectedOption.bgColor)}>
                  <selectedOption.icon className={cn("w-5 h-5", selectedOption.textColor)} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-semibold text-foreground">{selectedOption.label}</p>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium text-foreground">{email || '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">No. HP</p>
              <p className="font-medium text-foreground">{noHp || '-'}</p>
            </div>
            {status === 'bekerja' && (
              <>
                <div>
                  <p className="text-muted-foreground">Perusahaan</p>
                  <p className="font-medium text-foreground">{namaPerusahaan || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Jabatan</p>
                  <p className="font-medium text-foreground">{jabatan || '-'}</p>
                </div>
              </>
            )}
            {status === 'wirausaha' && (
              <>
                <div>
                  <p className="text-muted-foreground">Nama Usaha</p>
                  <p className="font-medium text-foreground">{namaUsaha || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Jenis Usaha</p>
                  <p className="font-medium text-foreground">{jenisUsaha || '-'}</p>
                </div>
              </>
            )}
            {status === 'studi' && (
              <>
                <div>
                  <p className="text-muted-foreground">Kampus</p>
                  <p className="font-medium text-foreground">{namaKampus || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Jenjang</p>
                  <p className="font-medium text-foreground">{jenjang || '-'}</p>
                </div>
              </>
            )}
            {status === 'mencari' && (
              <>
                <div>
                  <p className="text-muted-foreground">Lokasi Tujuan</p>
                  <p className="font-medium text-foreground">{lokasiTujuan || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Bidang Diincar</p>
                  <p className="font-medium text-foreground">{bidangDiincar || '-'}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Form Tracer Study
              </h1>
              <p className="text-muted-foreground">
                Halo, {selectedAlumni.nama.split(' ')[0]}! Lengkapi data status alumni Anda.
              </p>
            </div>

            {/* Progress Steps */}
            <div className="mb-10">
              <StepProgress steps={formSteps} currentStep={currentStep} />
            </div>

            {/* Form Card */}
            <div className="glass-card rounded-2xl p-6 md:p-8 mb-6">
              {currentStep === 1 && renderStatusSelection()}
              {currentStep === 2 && renderStatusForm()}
              {currentStep === 3 && renderContactForm()}
              {currentStep === 4 && renderConfirmation()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handleBack} className="flex-1 h-12">
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Kembali
                </Button>
              )}
              {currentStep < 4 ? (
                <Button onClick={handleNext} className="flex-1 h-12">
                  Lanjutkan
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="flex-1 h-12">
                  <Send className="w-5 h-5 mr-2" />
                  Kirim Data
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
