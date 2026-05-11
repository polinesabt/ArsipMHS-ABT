import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { 
  Trophy, BookOpen, Shield, Briefcase, Rocket, Sprout, Mic2, Users2, FolderOpen,
  Package, FlaskConical,
  Paperclip, Plus, ChevronDown, Building2, MapPin, Calendar,
  User, Award, FileText, ExternalLink, Download, X, ZoomIn,
  Edit3, Trash2, Image as ImageIcon, HelpCircle, Star, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { 
  Achievement, 
  AchievementAttachment,
  AchievementCategory,
  LombaAchievement,
  SeminarAchievement,
  PagelaranAchievement,
  PublikasiAchievement,
  HakiAchievement,
  MagangAchievement,
  PortofolioAchievement,
  ProdukMahasiswaAchievement,
  RESEARCH_OUTPUT_SUBTYPE_LABELS,
  STUDENT_PRODUCT_CATEGORY_LABELS,
  WirausahaAchievement,
  PengembanganAchievement,
  OrganisasiAchievement
} from '@/types/achievement.types';
import { CategoryFilter } from './CategorySidebar';
import { downloadAttachment, fetchAttachmentBlobUrl } from '@/lib/attachment-file';

interface AchievementTimelineViewProps {
  achievements: Achievement[];
  category: CategoryFilter;
  expandedId: string | null;
  onItemClick: (achievement: Achievement) => void;
  onAddNew: () => void;
  onEdit?: (achievement: Achievement) => void;
  onDelete?: (achievement: Achievement) => void;
  onToggleFeatured?: (achievement: Achievement) => void;
}

const CATEGORY_CONFIG: Record<string, { 
  icon: React.ElementType; 
  color: string; 
  nodeColor: string;
  bgColor: string;
  borderColor: string;
}> = {
  lomba: { 
    icon: Trophy, 
    color: 'text-warning', 
    nodeColor: 'bg-warning', 
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30'
  },
  seminar: { 
    icon: FileText, 
    color: 'text-purple-500', 
    nodeColor: 'bg-purple-500', 
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30'
  },
  pagelaran: {
    icon: Mic2,
    color: 'text-fuchsia-500',
    nodeColor: 'bg-fuchsia-500',
    bgColor: 'bg-fuchsia-500/10',
    borderColor: 'border-fuchsia-500/30'
  },
  publikasi: { 
    icon: BookOpen, 
    color: 'text-primary', 
    nodeColor: 'bg-primary', 
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30'
  },
  haki: { 
    icon: Shield, 
    color: 'text-success', 
    nodeColor: 'bg-success', 
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30'
  },
  luaran_penelitian: {
    icon: FlaskConical,
    color: 'text-indigo-500',
    nodeColor: 'bg-indigo-500',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30'
  },
  magang: { 
    icon: Briefcase, 
    color: 'text-info', 
    nodeColor: 'bg-info', 
    bgColor: 'bg-info/10',
    borderColor: 'border-info/30'
  },
  portofolio: { 
    icon: FolderOpen, 
    color: 'text-orange-500', 
    nodeColor: 'bg-orange-500', 
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30'
  },
  produk_mahasiswa: {
    icon: Package,
    color: 'text-cyan-500',
    nodeColor: 'bg-cyan-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30'
  },
  wirausaha: { 
    icon: Rocket, 
    color: 'text-destructive', 
    nodeColor: 'bg-destructive', 
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/30'
  },
  pengembangan: { 
    icon: Sprout, 
    color: 'text-emerald-500', 
    nodeColor: 'bg-emerald-500', 
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30'
  },
  organisasi: { 
    icon: Users2, 
    color: 'text-sky-500', 
    nodeColor: 'bg-sky-500', 
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30'
  },
  // Legacy support
  kegiatan: {
    icon: Trophy,
    color: 'text-warning',
    nodeColor: 'bg-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
  },
};

const DEFAULT_CONFIG = {
  icon: HelpCircle,
  color: 'text-muted-foreground',
  nodeColor: 'bg-muted-foreground',
  bgColor: 'bg-muted/30',
  borderColor: 'border-border',
};

function getPagelaranTypeLabel(jenisKegiatan: string | undefined): string {
  const token = String(jenisKegiatan || '').trim().toLowerCase().replace(/-+/g, '_').replace(/\s+/g, '_');
  if (token === 'conference') return 'Presentasi Konferensi';
  if (token === 'presentasi' || token === 'presentation') return 'Presentasi Ilmiah';
  if (token === 'oral_presentation') return 'Presentasi Lisan';
  if (token === 'poster_presentation') return 'Presentasi Poster';
  if (token === 'expo' || token === 'exhibition' || token === 'pameran') return 'Pameran / Expo';
  if (token === 'pagelaran') return 'Pagelaran';
  return 'Pagelaran / Presentasi';
}

function getAchievementDetails(achievement: Achievement): { 
  title: string; 
  subtitle: string; 
  year: number;
  level?: string;
  result?: string;
} {
  switch (achievement.category) {
    case 'lomba': {
      const a = achievement as LombaAchievement;
      return {
        title: a.namaLomba,
        subtitle: a.penyelenggara,
        year: a.tahun,
        level: a.tingkat === 'internasional' ? 'Internasional' : 
               a.tingkat === 'nasional' ? 'Nasional' : 
               a.tingkat === 'regional' ? 'Regional' : 'Lokal',
        result: a.peringkat,
      };
    }
    case 'seminar': {
      const a = achievement as SeminarAchievement;
      const levelLabel = a.levelSeminar === 'international'
        ? 'Internasional'
        : a.levelSeminar === 'national'
          ? 'Nasional'
          : 'Lokal/Wilayah/PT';
      const perolehanLabel = a.jenisPerolehan === 'kolaborasi_dosen'
        ? `Kolaborasi Dosen${a.namaDosen ? ` (${a.namaDosen})` : ''}`
        : 'Mandiri';
      const subtitleBase = a.namaSeminarKonferensi || a.penyelenggara || 'Publikasi di Seminar';
      return {
        title: a.judulPublikasi,
        subtitle: `${subtitleBase} - ${levelLabel} - ${perolehanLabel}`,
        year: a.tahun,
        level: levelLabel,
      };
    }
    case 'pagelaran': {
      const a = achievement as PagelaranAchievement;
      const levelLabel = a.levelSeminar === 'international'
        ? 'Internasional'
        : a.levelSeminar === 'national'
          ? 'Nasional'
          : 'Lokal/Wilayah/PT';
      const mitraLabel = a.penyelenggara ? ` - Mitra: ${a.penyelenggara}` : '';
      return {
        title: a.judulPublikasi,
        subtitle: `${getPagelaranTypeLabel(a.jenisKegiatan)} - ${levelLabel}${mitraLabel}`,
        year: a.tahun,
        level: levelLabel,
      };
    }
    case 'publikasi': {
      const a = achievement as PublikasiAchievement;
      return {
        title: a.judul,
        subtitle: a.namaJurnal || a.penerbit || 'Publikasi',
        year: a.tahun,
      };
    }
    case 'haki': {
      const a = achievement as HakiAchievement;
      return {
        title: a.judul,
        subtitle: a.pemegang,
        year: a.tahunPengajuan,
        level: a.jenisHaki.replace('_', ' '),
        result: a.status,
      };
    }
    case 'luaran_penelitian': {
      const a = achievement as any;
      const subtype = String(a.jenisLuaran || '');
      const subtypeLabel = RESEARCH_OUTPUT_SUBTYPE_LABELS[subtype as keyof typeof RESEARCH_OUTPUT_SUBTYPE_LABELS]
        || subtype.replace(/_/g, ' ');
      return {
        title: a.judul || 'Luaran Penelitian',
        subtitle: a.jenisPerolehan === 'kolaborasi_dosen'
          ? `${subtypeLabel} - Kolaborasi Dosen${a.namaDosen ? ` (${a.namaDosen})` : ''}`
          : `${subtypeLabel} - Mandiri`,
        year: a.tahun || new Date(a.tanggalLuaran || Date.now()).getFullYear(),
        level: subtypeLabel,
      };
    }
    case 'magang': {
      const a = achievement as MagangAchievement;
      return {
        title: `${a.posisi} di ${a.namaPerusahaan}`,
        subtitle: `${a.industri} - ${a.lokasi}`,
        year: new Date(a.tanggalMulai).getFullYear(),
      };
    }
    case 'portofolio': {
      const a = achievement as PortofolioAchievement;
      return {
        title: a.judulProyek,
        subtitle: a.mataKuliah || 'Proyek',
        year: a.tahun,
        result: a.nilai ? `Nilai: ${a.nilai}` : undefined,
      };
    }
    case 'produk_mahasiswa': {
      const a = achievement as ProdukMahasiswaAchievement;
      return {
        title: a.namaProduk,
        subtitle: `${a.mitraAdopsi || 'Produk Mahasiswa'}${a.lokasi ? ` - ${a.lokasi}` : ''}`,
        year: new Date(a.tanggalAdopsi).getFullYear(),
        level: a.tingkat,
      };
    }
    case 'wirausaha': {
      const a = achievement as WirausahaAchievement;
      return {
        title: a.namaUsaha,
        subtitle: `${a.jenisUsaha} - ${a.lokasi}`,
        year: a.tahunMulai,
        result: a.masihAktif ? 'Masih Aktif' : 'Tidak Aktif',
      };
    }
    case 'pengembangan': {
      const a = achievement as PengembanganAchievement;
      return {
        title: a.namaProgram,
        subtitle: a.penyelenggara + (a.negara ? ` - ${a.negara}` : ''),
        year: new Date(a.tanggalMulai).getFullYear(),
        result: a.output,
      };
    }
    case 'organisasi': {
      const a = achievement as OrganisasiAchievement;
      return {
        title: `${a.jabatan} - ${a.namaOrganisasi}`,
        subtitle: a.jenisOrganisasi === 'kampus' ? 'Organisasi Kampus' : 'Organisasi Luar Kampus',
        year: new Date(a.tanggalMulai).getFullYear(),
        result: a.masihAktif ? 'Masih Aktif' : 'Selesai',
      };
    }
    default: {
      // Legacy/unknown achievement shapes (e.g., old seed data category: 'kegiatan')
      const anyA = achievement as any;
      const year = anyA?.tahun ?? (typeof anyA?.year === 'number' ? anyA.year : new Date().getFullYear());
      return {
        title: anyA?.namaKegiatan || anyA?.title || anyA?.judul || 'Prestasi',
        subtitle: anyA?.penyelenggara || anyA?.subtitle || 'Dokumentasi prestasi',
        year,
        level: anyA?.tingkat,
        result: anyA?.prestasi,
      };
    }
  }
}

// Category-specific detail fields
function getCategoryDetailFields(achievement: Achievement): { label: string; value: string; icon?: React.ElementType }[] {
  switch (achievement.category) {
    case 'lomba': {
      const a = achievement as LombaAchievement;
      return [
        { label: 'Tingkat', value: a.tingkat?.charAt(0).toUpperCase() + a.tingkat?.slice(1), icon: Award },
        { label: 'Peran', value: a.peran?.charAt(0).toUpperCase() + a.peran?.slice(1), icon: User },
        { label: 'Peringkat / Hasil', value: a.peringkat || '-', icon: Trophy },
        ...(a.bidang ? [{ label: 'Bidang', value: a.bidang, icon: FileText }] : []),
      ].filter(f => f.value && f.value !== '-');
    }
    case 'seminar': {
      const a = achievement as SeminarAchievement;
      const levelLabel = a.levelSeminar === 'international'
        ? 'Internasional'
        : a.levelSeminar === 'national'
          ? 'Nasional'
          : 'Lokal/Wilayah/Perguruan Tinggi';
      const perolehanLabel = a.jenisPerolehan === 'kolaborasi_dosen'
        ? 'Kolaborasi dengan Dosen'
        : 'Mandiri';
      return [
        { label: 'Level Seminar', value: levelLabel, icon: Award },
        { label: 'Jenis Perolehan', value: perolehanLabel, icon: User },
        { label: 'Nama Dosen', value: a.jenisPerolehan === 'kolaborasi_dosen' ? (a.namaDosen || '-') : '-', icon: User },
        { label: 'Nama Seminar / Konferensi', value: a.namaSeminarKonferensi || '-', icon: Building2 },
        { label: 'Penyelenggara', value: a.penyelenggara || '-', icon: Building2 },
        { label: 'Tanggal Publikasi', value: a.tanggalPublikasi || '-', icon: Calendar },
        { label: 'Tahun', value: a.tahun?.toString(), icon: Calendar },
      ].filter((f) => f.value && f.value !== '-');
    }
    case 'pagelaran': {
      const a = achievement as PagelaranAchievement;
      const levelLabel = a.levelSeminar === 'international'
        ? 'Internasional'
        : a.levelSeminar === 'national'
          ? 'Nasional'
          : 'Lokal/Wilayah/Perguruan Tinggi';
      return [
        { label: 'Jenis Kegiatan', value: getPagelaranTypeLabel(a.jenisKegiatan), icon: Award },
        { label: 'Level Kegiatan', value: levelLabel, icon: Award },
        ...(a.penyelenggara ? [{ label: 'Mitra Kegiatan', value: a.penyelenggara, icon: Building2 }] : []),
        { label: 'Nama Acara / Konferensi', value: a.namaSeminarKonferensi || '-', icon: Building2 },
        { label: 'Tanggal Kegiatan', value: a.tanggalPublikasi || '-', icon: Calendar },
        { label: 'Tahun', value: a.tahun?.toString(), icon: Calendar },
      ].filter((f) => f.value && f.value !== '-');
    }
    case 'magang': {
      const a = achievement as MagangAchievement;
      return [
        { label: 'Nama Perusahaan', value: a.namaPerusahaan, icon: Building2 },
        { label: 'Posisi', value: a.posisi, icon: User },
        { label: 'Lokasi', value: a.lokasi, icon: MapPin },
        { label: 'Industri', value: a.industri, icon: Briefcase },
        { label: 'Periode', value: `${a.tanggalMulai} - ${a.sedangBerjalan ? 'Sekarang' : a.tanggalSelesai || 'Selesai'}`, icon: Calendar },
      ].filter(f => f.value);
    }
    case 'publikasi': {
      const a = achievement as PublikasiAchievement;
      return [
        { label: 'Jenis Publikasi', value: a.jenisPublikasi?.replace('_', ' '), icon: BookOpen },
        { label: 'Penulis', value: a.penulis, icon: User },
        { label: 'Nama Jurnal / Konferensi', value: a.namaJurnal || a.penerbit || '-', icon: Building2 },
        { label: 'Tahun Terbit', value: a.tahun?.toString(), icon: Calendar },
        ...(a.url ? [{ label: 'Link Publikasi', value: a.url, icon: ExternalLink }] : []),
      ].filter(f => f.value && f.value !== '-');
    }
    case 'haki': {
      const a = achievement as HakiAchievement;
      return [
        { label: 'Jenis KI', value: a.jenisHaki?.replace('_', ' '), icon: Shield },
        { label: 'Nomor Pendaftaran', value: a.nomorPendaftaran || '-', icon: FileText },
        { label: 'Status', value: a.status === 'granted' ? 'Granted' : a.status === 'terdaftar' ? 'Terdaftar' : a.status, icon: Award },
      ].filter(f => f.value && f.value !== '-');
    }
    case 'luaran_penelitian': {
      const a = achievement as any;
      const subtype = String(a.jenisLuaran || '');
      const subtypeLabel = RESEARCH_OUTPUT_SUBTYPE_LABELS[subtype as keyof typeof RESEARCH_OUTPUT_SUBTYPE_LABELS]
        || subtype.replace(/_/g, ' ');
      return [
        { label: 'Jenis Luaran', value: subtypeLabel, icon: FlaskConical },
        { label: 'Jenis Perolehan', value: a.jenisPerolehan === 'kolaborasi_dosen' ? 'Kolaborasi Dosen' : 'Mandiri', icon: User },
        ...(a.namaDosen ? [{ label: 'Nama Dosen', value: a.namaDosen, icon: User }] : []),
        { label: 'Tanggal Luaran', value: a.tanggalLuaran || '-', icon: Calendar },
        { label: 'Tahun', value: String(a.tahun || '-'), icon: Calendar },
      ].filter((f) => f.value && f.value !== '-');
    }
    case 'wirausaha': {
      const a = achievement as WirausahaAchievement;
      return [
        { label: 'Nama Usaha', value: a.namaUsaha, icon: Rocket },
        { label: 'Bidang Usaha', value: a.jenisUsaha, icon: Briefcase },
        { label: 'Peran', value: a.peran || 'Founder', icon: User },
        { label: 'Status Usaha', value: a.masihAktif ? 'Aktif' : 'Tidak Aktif', icon: Award },
      ].filter(f => f.value);
    }
    case 'pengembangan': {
      const a = achievement as PengembanganAchievement;
      return [
        { label: 'Jenis Aktivitas', value: a.jenisProgram?.replace('_', ' '), icon: Sprout },
        { label: 'Penyelenggara', value: a.penyelenggara, icon: Building2 },
        ...(a.peranMahasiswa ? [{ label: 'Peran', value: a.peranMahasiswa, icon: User }] : []),
        { label: 'Output', value: a.output || 'Sertifikat', icon: Award },
      ].filter(f => f.value);
    }
    case 'portofolio': {
      const a = achievement as PortofolioAchievement;
      return [
        { label: 'Mata Kuliah', value: a.mataKuliah, icon: BookOpen },
        { label: 'Semester', value: `${a.semester?.charAt(0).toUpperCase()}${a.semester?.slice(1)} ${a.tahun}`, icon: Calendar },
        ...(a.output ? [{ label: 'Output', value: a.output, icon: FileText }] : []),
        ...(a.nilai ? [{ label: 'Nilai', value: a.nilai, icon: Award }] : []),
      ].filter(f => f.value);
    }
    case 'produk_mahasiswa': {
      const a = achievement as ProdukMahasiswaAchievement;
      return [
        { label: 'Nama Produk', value: a.namaProduk, icon: Package },
        { label: 'Kategori Produk', value: STUDENT_PRODUCT_CATEGORY_LABELS[a.kategoriProduk] || a.kategoriProduk.replace(/_/g, ' '), icon: Award },
        { label: 'Tanggal Adopsi', value: a.tanggalAdopsi, icon: Calendar },
        ...(a.mitraAdopsi ? [{ label: 'Mitra Adopsi', value: a.mitraAdopsi, icon: Building2 }] : []),
        ...(a.lokasi ? [{ label: 'Lokasi', value: a.lokasi, icon: MapPin }] : []),
        ...(a.tingkat ? [{ label: 'Tingkat', value: a.tingkat, icon: Trophy }] : []),
      ].filter(f => f.value);
    }
    case 'organisasi': {
      const a = achievement as OrganisasiAchievement;
      const formatPeriod = () => {
        const start = format(new Date(a.tanggalMulai), 'd MMM yyyy', { locale: idLocale });
        if (a.masihAktif) return `${start} - Sekarang`;
        return a.tanggalSelesai 
          ? `${start} - ${format(new Date(a.tanggalSelesai), 'd MMM yyyy', { locale: idLocale })}`
          : `${start} - Selesai`;
      };
      return [
        { label: 'Nama Organisasi', value: a.namaOrganisasi, icon: Users2 },
        { label: 'Jenis Organisasi', value: a.jenisOrganisasi === 'kampus' ? 'Kampus' : 'Luar Kampus', icon: Building2 },
        { label: 'Jabatan / Peran', value: a.jabatan, icon: User },
        { label: 'Status Keanggotaan', value: a.masihAktif ? 'Aktif' : 'Selesai', icon: CheckCircle2 },
        { label: 'Periode Keanggotaan', value: formatPeriod(), icon: Calendar },
      ].filter(f => f.value);
    }
    default:
      return [];
  }
}

// Image Lightbox Component
function ImageLightbox({ 
  images, 
  currentIndex, 
  onClose, 
  onNavigate 
}: { 
  images: { fileUrl: string; fileName: string }[]; 
  currentIndex: number; 
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const currentImage = images[currentIndex];
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh] w-full mx-4" onClick={e => e.stopPropagation()}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>

        {/* Image */}
        <div className="relative rounded-2xl overflow-hidden bg-muted">
          <img 
            src={currentImage.fileUrl} 
            alt={currentImage.fileName}
            className="w-full h-auto max-h-[75vh] object-contain"
          />
        </div>

        {/* Navigation Dots */}
        {images.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => onNavigate(idx)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  idx === currentIndex 
                    ? 'bg-primary w-6' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                )}
              />
            ))}
          </div>
        )}

        {/* Download Button */}
        <div className="flex justify-center mt-4">
          <Button variant="outline" size="sm" asChild>
            <a href={currentImage.fileUrl} download={currentImage.fileName}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AchievementTimelineView({ 
  achievements, 
  category, 
  expandedId,
  onItemClick, 
  onAddNew,
  onEdit,
  onDelete,
  onToggleFeatured
}: AchievementTimelineViewProps) {
  const [lightboxState, setLightboxState] = useState<{ images: any[]; index: number } | null>(null);
  const [resolvedAttachmentUrls, setResolvedAttachmentUrls] = useState<Record<string, string>>({});
  const resolvingAttachmentIdsRef = useRef<Set<string>>(new Set());
  const resolvedUrlsRef = useRef<Record<string, string>>({});

  const openLightbox = useCallback((images: any[], index: number) => {
    setLightboxState({ images, index });
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxState(null);
  }, []);

  const persistedAttachments = useMemo(
    () =>
      achievements.flatMap((achievement) =>
        (achievement.attachments || []).filter((attachment) => {
          const attachmentId = attachment.attachmentId || attachment.id;
          return Boolean(attachment.isPersisted && attachmentId);
        })
      ),
    [achievements]
  );

  useEffect(() => {
    resolvedUrlsRef.current = resolvedAttachmentUrls;
  }, [resolvedAttachmentUrls]);

  useEffect(() => {
    return () => {
      Object.values(resolvedUrlsRef.current).forEach((url) => URL.revokeObjectURL(url));
      resolvedUrlsRef.current = {};
      resolvingAttachmentIdsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const activeIds = new Set(
      persistedAttachments
        .map((attachment) => attachment.attachmentId || attachment.id)
        .filter((attachmentId): attachmentId is string => Boolean(attachmentId))
    );

    setResolvedAttachmentUrls((previous) => {
      let changed = false;
      const next = { ...previous };
      Object.entries(previous).forEach(([attachmentId, url]) => {
        if (activeIds.has(attachmentId)) return;
        URL.revokeObjectURL(url);
        delete next[attachmentId];
        changed = true;
      });
      return changed ? next : previous;
    });

    persistedAttachments.forEach((attachment) => {
      const attachmentId = attachment.attachmentId || attachment.id;
      if (!attachmentId) return;
      if (resolvedAttachmentUrls[attachmentId]) return;
      if (resolvingAttachmentIdsRef.current.has(attachmentId)) return;
      resolvingAttachmentIdsRef.current.add(attachmentId);

      void fetchAttachmentBlobUrl(attachmentId)
        .then((url) => {
          setResolvedAttachmentUrls((previous) => ({
            ...previous,
            [attachmentId]: url,
          }));
        })
        .catch(() => {
          // Keep UI usable even when one attachment fails to resolve.
        })
        .finally(() => {
          resolvingAttachmentIdsRef.current.delete(attachmentId);
        });
    });
  }, [persistedAttachments, resolvedAttachmentUrls]);

  const resolveAttachmentUrl = useCallback(
    (attachment: AchievementAttachment): string => {
      const attachmentId = attachment.attachmentId || attachment.id;
      if (attachment.isPersisted && attachmentId) {
        return resolvedAttachmentUrls[attachmentId] || '';
      }
      return attachment.fileUrl;
    },
    [resolvedAttachmentUrls]
  );

  const handleDocumentDownload = useCallback((attachment: AchievementAttachment) => {
    if (attachment.isPersisted) {
      const attachmentId = attachment.attachmentId || attachment.id;
      if (!attachmentId) return;
      void downloadAttachment(attachmentId, attachment.fileName).catch(() => {
        const fallback = attachment.fileUrl;
        if (!fallback) return;
        window.open(fallback, '_blank', 'noopener,noreferrer');
      });
      return;
    }

    const anchor = document.createElement('a');
    anchor.href = attachment.fileUrl;
    anchor.download = attachment.fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }, []);

  // Group achievements by year
  const groupedByYear = achievements.reduce((acc, achievement) => {
    let details: ReturnType<typeof getAchievementDetails>;
    try {
      details = getAchievementDetails(achievement);
    } catch {
      details = {
        title: 'Prestasi',
        subtitle: 'Dokumentasi prestasi',
        year: new Date().getFullYear(),
      };
    }

    const year = details?.year ?? new Date().getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push({ achievement, details });
    return acc;
  }, {} as Record<number, { achievement: Achievement; details: ReturnType<typeof getAchievementDetails> }[]>);

  // Sort years descending
  const sortedYears = Object.keys(groupedByYear).map(Number).sort((a, b) => b - a);

  // Empty State Configuration
  const getEmptyStateConfig = () => {
    if (category === 'unggulan') {
      return {
        icon: Award,
        iconColor: 'text-amber-500',
        bgGradient: 'from-amber-500/10 to-amber-500/5',
        title: 'Belum ada Prestasi Unggulan',
        description: 'Tandai prestasi terbaikmu sebagai unggulan dengan mengklik ikon bintang pada setiap prestasi.',
        showAddButton: false,
      };
    }
    
    const categoryConfig: Record<string, { icon: React.ElementType; iconColor: string; bgGradient: string; title: string; description: string }> = {
      all: {
        icon: Trophy,
        iconColor: 'text-primary/60',
        bgGradient: 'from-primary/10 to-primary/5',
        title: 'Belum ada prestasi',
        description: 'Yuk, tambahkan pencapaianmu. Dokumentasikan setiap prestasi yang kamu raih selama perjalanan akademik.',
      },
      lomba: {
        icon: Trophy,
        iconColor: 'text-warning',
        bgGradient: 'from-warning/10 to-warning/5',
        title: 'Belum ada prestasi lomba',
        description: 'Tambahkan pencapaian kompetisi dan perlombaan yang pernah kamu ikuti.',
      },
      seminar: {
        icon: FileText,
        iconColor: 'text-info',
        bgGradient: 'from-info/10 to-info/5',
        title: 'Belum ada publikasi di seminar',
        description: 'Tambahkan publikasi seminar yang pernah kamu presentasikan atau terbitkan.',
      },
      pagelaran: {
        icon: Mic2,
        iconColor: 'text-fuchsia-500',
        bgGradient: 'from-fuchsia-500/10 to-fuchsia-500/5',
        title: 'Belum ada data pagelaran/presentasi',
        description: 'Tambahkan kegiatan pagelaran, pameran, atau presentasi ilmiah yang pernah kamu ikuti.',
      },
      publikasi: {
        icon: BookOpen,
        iconColor: 'text-success',
        bgGradient: 'from-success/10 to-success/5',
        title: 'Belum ada publikasi ilmiah',
        description: 'Tambahkan jurnal, paper, atau publikasi ilmiah yang pernah kamu terbitkan.',
      },
      haki: {
        icon: Shield,
        iconColor: 'text-violet-500',
        bgGradient: 'from-violet-500/10 to-violet-500/5',
        title: 'Belum ada Hak Kekayaan Intelektual',
        description: 'Dokumentasikan paten, hak cipta, atau kekayaan intelektual lainnya.',
      },
      luaran_penelitian: {
        icon: FlaskConical,
        iconColor: 'text-indigo-500',
        bgGradient: 'from-indigo-500/10 to-indigo-500/5',
        title: 'Belum ada luaran penelitian',
        description: 'Tambahkan luaran penelitian/PKM seperti HKI, teknologi tepat guna, atau buku.',
      },
      magang: {
        icon: Briefcase,
        iconColor: 'text-sky-500',
        bgGradient: 'from-sky-500/10 to-sky-500/5',
        title: 'Belum ada pengalaman magang',
        description: 'Tambahkan pengalaman magang atau kerja praktik yang pernah kamu jalani.',
      },
      startup: {
        icon: Rocket,
        iconColor: 'text-orange-500',
        bgGradient: 'from-orange-500/10 to-orange-500/5',
        title: 'Belum ada pengalaman startup',
        description: 'Dokumentasikan startup atau bisnis yang pernah kamu bangun atau ikuti.',
      },
      portofolio: {
        icon: FolderOpen,
        iconColor: 'text-rose-500',
        bgGradient: 'from-rose-500/10 to-rose-500/5',
        title: 'Belum ada portofolio',
        description: 'Tambahkan karya atau proyek yang menunjukkan kemampuanmu.',
      },
      produk_mahasiswa: {
        icon: Package,
        iconColor: 'text-cyan-500',
        bgGradient: 'from-cyan-500/10 to-cyan-500/5',
        title: 'Belum ada produk mahasiswa',
        description: 'Tambahkan produk mahasiswa yang sudah diadopsi oleh pihak eksternal.',
      },
      volunteer: {
        icon: Sprout,
        iconColor: 'text-emerald-500',
        bgGradient: 'from-emerald-500/10 to-emerald-500/5',
        title: 'Belum ada kegiatan volunteer',
        description: 'Dokumentasikan kegiatan sosial dan sukarela yang pernah kamu ikuti.',
      },
      organisasi: {
        icon: Users2,
        iconColor: 'text-purple-500',
        bgGradient: 'from-purple-500/10 to-purple-500/5',
        title: 'Belum ada pengalaman organisasi',
        description: 'Tambahkan pengalaman berorganisasi dan kepemimpinanmu.',
      },
    };

    return {
      ...categoryConfig[category] || categoryConfig.all,
      showAddButton: true,
    };
  };

  // Empty State
  if (achievements.length === 0) {
    const config = getEmptyStateConfig();
    const IconComponent = config.icon;
    
    return (
      <div className="text-center py-16 px-4">
        {/* Illustration */}
        <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${config.bgGradient} flex items-center justify-center mx-auto mb-6 shadow-soft`}>
          <IconComponent className={`w-12 h-12 ${config.iconColor}`} />
        </div>
        
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {config.title}
        </h3>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
          {config.description}
        </p>
        
        {config.showAddButton && (
          <Button onClick={onAddNew} size="lg" className="shadow-soft">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Prestasi
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        {/* Timeline Line (Desktop) */}
        <div className="absolute left-[23px] top-8 bottom-4 w-0.5 bg-gradient-to-b from-border via-border to-transparent hidden md:block" />

        <div className="space-y-8">
          {sortedYears.map((year) => (
            <div key={year} className="relative">
              {/* Year Marker */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center z-10 relative shadow-soft">
                  <span className="font-bold text-foreground text-sm">{year}</span>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
              </div>

              {/* Achievements for this year */}
              <div className="md:pl-16 space-y-3">
                {groupedByYear[year].map(({ achievement, details }) => {
                  const config = CATEGORY_CONFIG[achievement.category] || DEFAULT_CONFIG;
                  const Icon = config.icon;
                  const hasAttachments = achievement.attachments && achievement.attachments.length > 0;
                  const attachmentCount = achievement.attachments?.length || 0;
                  const isExpanded = expandedId === achievement.id;
                  const isFeatured = achievement.isUnggulan;
                  const detailFields = getCategoryDetailFields(achievement);
                  const rawImageAttachments = achievement.attachments?.filter(a => a.fileType.startsWith('image/')) || [];
                  const imageAttachments = rawImageAttachments
                    .map((attachment) => {
                      const fileUrl = resolveAttachmentUrl(attachment);
                      if (!fileUrl) return null;
                      return { ...attachment, fileUrl };
                    })
                    .filter((attachment): attachment is AchievementAttachment => attachment !== null);
                  const isResolvingImages = rawImageAttachments.length > 0 && imageAttachments.length === 0;
                  const documentAttachments = achievement.attachments?.filter(a => !a.fileType.startsWith('image/')) || [];

                  return (
                    <div key={achievement.id} className="relative">
                      {/* Timeline Node (Desktop) */}
                      <div className={cn(
                        'hidden md:flex absolute -left-[52px] top-6 w-4 h-4 rounded-full items-center justify-center',
                        config.nodeColor,
                        'ring-4 ring-background'
                      )}>
                        <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
                      </div>

                      {/* Main Achievement Card */}
                      <div
                        className={cn(
                          'relative p-5 rounded-2xl transition-all duration-300',
                          'bg-card border shadow-soft',
                          isExpanded 
                            ? cn('border-2', config.borderColor, 'shadow-elevated') 
                            : 'border-border/50 hover:shadow-elevated hover:-translate-y-0.5 hover:border-border',
                          isFeatured && 'ring-2 ring-primary/30',
                          'group'
                        )}
                      >
                        <div className="flex items-start gap-4">
                          {/* Category Icon */}
                          <div className={cn(
                            'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105',
                            config.bgColor
                          )}>
                            <Icon className={cn('w-5 h-5', config.color)} />
                          </div>

                          {/* Content - Clickable Area */}
                          <div 
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => onItemClick(achievement)}
                          >
                            <div className="flex items-start justify-between gap-3 mb-1.5">
                              <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                                {details.title}
                              </h4>
                            </div>
                            
                            <p className="text-sm text-muted-foreground">
                              {details.subtitle}
                            </p>

                            {/* Badges Row */}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              {/* Attachment Badge */}
                              {hasAttachments && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted/80 px-2 py-0.5 rounded-full">
                                  <Paperclip className="w-3 h-3" />
                                  {attachmentCount}
                                </span>
                              )}

                              {/* Featured Badge */}
                              {isFeatured && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                  <Star className="w-3 h-3 fill-primary" />
                                  Unggulan
                                </span>
                              )}
                              
                              {/* Level Badge */}
                              {details.level && (
                                <span className={cn(
                                  'text-xs font-medium px-2 py-0.5 rounded-full capitalize',
                                  config.bgColor,
                                  config.color
                                )}>
                                  {details.level}
                                </span>
                              )}

                              {/* Result Badge */}
                              {details.result && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground bg-muted px-2 py-0.5 rounded-full">
                                  <Award className="w-3 h-3 text-warning" />
                                  {details.result}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Zone - Always Visible */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {/* Star Toggle */}
                            {onToggleFeatured && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleFeatured(achievement);
                                }}
                                className={cn(
                                  'p-2 rounded-lg transition-all duration-200',
                                  isFeatured 
                                    ? 'text-primary bg-primary/10 hover:bg-primary/20' 
                                    : 'text-muted-foreground/50 hover:text-primary hover:bg-primary/10'
                                )}
                                title={isFeatured ? 'Hapus dari unggulan' : 'Tandai sebagai unggulan'}
                                aria-label={isFeatured ? 'Hapus dari unggulan' : 'Tandai sebagai unggulan'}
                              >
                                <Star className={cn('w-5 h-5', isFeatured && 'fill-primary')} />
                              </button>
                            )}

                            {/* Expand/Collapse Toggle */}
                            <button
                              onClick={() => onItemClick(achievement)}
                              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                              title={isExpanded ? 'Tutup detail' : 'Lihat detail'}
                              aria-label={isExpanded ? 'Tutup detail' : 'Lihat detail'}
                            >
                              <ChevronDown className={cn(
                                'w-5 h-5 transition-transform duration-200',
                                isExpanded && 'rotate-180'
                              )} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Inline Dropdown */}
                      {isExpanded && (
                        <div className="mt-3 rounded-2xl border border-border bg-card overflow-hidden animate-scale-in shadow-soft">
                          {/* Documentation Section */}
                          <div className="p-5 border-b border-border">
                            <h5 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                              <ImageIcon className="w-4 h-4 text-primary" />
                              Dokumentasi
                            </h5>

                            {imageAttachments.length > 0 ? (
                              <div className="flex gap-3 overflow-x-auto pb-2 -mb-2">
                                {imageAttachments.map((img, idx) => (
                                  <div 
                                    key={img.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openLightbox(imageAttachments, idx);
                                    }}
                                    className="relative w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-muted cursor-pointer group/img"
                                  >
                                    <img
                                      src={img.fileUrl}
                                      alt={img.fileName}
                                      className="w-full h-full object-cover transition-transform duration-200 group-hover/img:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-foreground/0 group-hover/img:bg-foreground/20 transition-colors flex items-center justify-center">
                                      <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover/img:opacity-100 transition-opacity" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : isResolvingImages ? (
                              <div className="flex items-center gap-3 py-4 px-4 rounded-xl bg-muted/50 text-muted-foreground">
                                <ImageIcon className="w-5 h-5" />
                                <span className="text-sm">Memuat dokumentasi...</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 py-4 px-4 rounded-xl bg-muted/50 text-muted-foreground">
                                <ImageIcon className="w-5 h-5" />
                                <span className="text-sm">Dokumentasi belum diunggah</span>
                              </div>
                            )}

                            {/* Document Attachments */}
                            {documentAttachments.length > 0 && (
                              <div className="mt-4 space-y-2">
                                {documentAttachments.map((doc) => (
                                  <button
                                    key={doc.id}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDocumentDownload(doc);
                                    }}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors group/doc"
                                  >
                                    <FileText className="w-5 h-5 text-primary" />
                                    <span className="text-sm font-medium text-foreground flex-1 truncate">
                                      {doc.fileName}
                                    </span>
                                    <Download className="w-4 h-4 text-muted-foreground group-hover/doc:text-primary transition-colors" />
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Detail Information Section */}
                          <div className="p-5 bg-muted/30">
                            <h5 className="text-sm font-semibold text-foreground mb-4">
                              Informasi Detail
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {detailFields.map((field, index) => {
                                const FieldIcon = field.icon;
                                const isLink = field.label.includes('Link');
                                
                                return (
                                  <div key={index} className="flex items-start gap-3">
                                    {FieldIcon && (
                                      <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                                        <FieldIcon className="w-4 h-4 text-muted-foreground" />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs text-muted-foreground mb-0.5">{field.label}</p>
                                      {isLink ? (
                                        <a 
                                          href={field.value}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          className="text-sm font-medium text-primary hover:underline"
                                        >
                                          Lihat Publikasi
                                        </a>
                                      ) : (
                                        <p className="text-sm font-medium text-foreground capitalize">
                                          {field.value}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Description if available */}
                            {((achievement as any).deskripsi || (achievement as any).deskripsiTugas || (achievement as any).deskripsiProyek || (achievement as any).deskripsiUsaha) && (
                              <div className="mt-5 pt-5 border-t border-border">
                                <p className="text-xs text-muted-foreground mb-2">Deskripsi</p>
                                <p className="text-sm text-foreground leading-relaxed">
                                  {(achievement as any).deskripsi || (achievement as any).deskripsiTugas || (achievement as any).deskripsiProyek || (achievement as any).deskripsiUsaha}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="p-4 border-t border-border bg-background/50 flex items-center justify-end gap-2">
                            {onEdit && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit(achievement);
                                }}
                              >
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit Prestasi
                              </Button>
                            )}
                            {onDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(achievement);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Lightbox */}
      {lightboxState && (
        <ImageLightbox
          images={lightboxState.images}
          currentIndex={lightboxState.index}
          onClose={closeLightbox}
          onNavigate={(index) => setLightboxState(prev => prev ? { ...prev, index } : null)}
        />
      )}
    </>
  );
}

