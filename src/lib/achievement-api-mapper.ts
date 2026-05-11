import { getApiBaseUrl } from '@/lib/api-client';
import {
  RESEARCH_OUTPUT_BOOK_SUBTYPES,
  RESEARCH_OUTPUT_HAKI_SUBTYPES,
  RESEARCH_OUTPUT_TECHNOLOGY_SUBTYPES,
  STUDENT_PRODUCT_CATEGORIES,
  type ResearchOutputSubtype,
} from '@/types/achievement.types';
import type {
  Achievement,
  AchievementAttachment,
  AchievementCategory,
  StudentProductCategory,
} from '@/types/achievement.types';
import type { Achievement as ApiAchievement, CreateAchievementPayload } from '@/repositories/api-student.repository';
import { getAchievementTypeFromDb, getAchievementTypeFromUiCategory, normalizeAchievementType } from '@/lib/achievement-classification';

const PRODUCT_CATEGORY_SET = new Set<string>(STUDENT_PRODUCT_CATEGORIES);

function normalizeProductCategory(value: unknown): StudentProductCategory {
  const raw = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return PRODUCT_CATEGORY_SET.has(raw) ? (raw as StudentProductCategory) : 'makanan_minuman';
}

function normalizeJournalLevel(value: unknown):
  | 'national_non_accredited'
  | 'national_accredited'
  | 'international'
  | 'reputable_international'
  | undefined {
  if (typeof value !== 'string') return undefined;
  const raw = value.trim().toLowerCase();
  if (raw === '') return undefined;
  const token = raw.replace(/-+/g, '_').replace(/\s+/g, '_');

  if (['national_non_accredited', 'nasional_tidak_terakreditasi'].includes(token)) {
    return 'national_non_accredited';
  }
  if (['national_accredited', 'nasional_terakreditasi'].includes(token)) {
    return 'national_accredited';
  }
  if (['reputable_international', 'internasional_bereputasi', 'international_reputable'].includes(token)) {
    return 'reputable_international';
  }
  if (['international', 'internasional'].includes(token)) {
    return 'international';
  }
  if (['national', 'nasional'].includes(token)) {
    return 'national_non_accredited';
  }
  return undefined;
}

function mapJournalLevelToTingkat(
  level: 'national_non_accredited' | 'national_accredited' | 'international' | 'reputable_international' | undefined
): 'nasional' | 'internasional' | undefined {
  if (!level) return undefined;
  if (level === 'international' || level === 'reputable_international') {
    return 'internasional';
  }
  return 'nasional';
}

function normalizeSeminarLevel(value: unknown): 'local' | 'national' | 'international' | undefined {
  if (typeof value !== 'string') return undefined;
  const raw = value.trim().toLowerCase();
  if (raw === '') return undefined;
  const token = raw.replace(/-+/g, '_').replace(/\s+/g, '_');

  if (['local', 'lokal', 'regional', 'wilayah', 'perguruan_tinggi', 'kampus', 'pt'].includes(token)) {
    return 'local';
  }
  if (['national', 'nasional'].includes(token)) {
    return 'national';
  }
  if (['international', 'internasional'].includes(token)) {
    return 'international';
  }
  return undefined;
}

function mapSeminarLevelToTingkat(
  level: 'local' | 'national' | 'international' | undefined
): 'lokal' | 'nasional' | 'internasional' | undefined {
  if (!level) return undefined;
  if (level === 'international') return 'internasional';
  if (level === 'national') return 'nasional';
  return 'lokal';
}

const PAGELARAN_SUBCATEGORIES = [
  'conference',
  'presentasi',
  'presentation',
  'oral_presentation',
  'poster_presentation',
  'expo',
  'exhibition',
  'pameran',
  'pagelaran',
] as const;

const PAGELARAN_SUBCATEGORY_SET = new Set<string>(PAGELARAN_SUBCATEGORIES);
const SCIENTIFIC_PRESENTATION_SUBCATEGORY_SET = new Set<string>([
  'conference',
  'presentasi',
  'presentation',
  'oral_presentation',
  'poster_presentation',
]);
const RESEARCH_OUTPUT_SUBTYPE_SET = new Set<string>([
  ...RESEARCH_OUTPUT_HAKI_SUBTYPES,
  ...RESEARCH_OUTPUT_TECHNOLOGY_SUBTYPES,
  ...RESEARCH_OUTPUT_BOOK_SUBTYPES,
]);

function normalizeSubcategoryToken(value: unknown): string {
  if (typeof value !== 'string') return '';
  const raw = value.trim().toLowerCase();
  if (raw === '') return '';
  return raw.replace(/-+/g, '_').replace(/\s+/g, '_');
}

function normalizePagelaranSubcategory(value: unknown): (typeof PAGELARAN_SUBCATEGORIES)[number] {
  const token = normalizeSubcategoryToken(value);
  if (token === 'presentation') return 'presentasi';
  if (token === 'exhibition') return 'pameran';
  if (PAGELARAN_SUBCATEGORY_SET.has(token)) {
    return token as (typeof PAGELARAN_SUBCATEGORIES)[number];
  }
  return 'pagelaran';
}

function normalizeResearchOutputSubtype(value: unknown): ResearchOutputSubtype {
  const token = normalizeSubcategoryToken(value);
  const aliases: Record<string, ResearchOutputSubtype> = {
    merek: 'trademark',
    merek_dagang: 'trademark',
    paten: 'patent',
    paten_sederhana: 'simple_patent',
    simple_patent: 'simple_patent',
    desain_industri: 'industrial_design',
    hak_cipta: 'copyright',
    copyright: 'copyright',
    indikasi_geografis: 'geographical_indication',
    rahasia_dagang: 'trade_secret',
    desain_tata_letak_sirkuit_terpadu: 'circuit_layout',
    pengembangan_software: 'software_development',
    software: 'software_development',
    software_development: 'software_development',
    produk: 'technology_product',
    teknologi_tepat_guna: 'technology_product',
    produk_terstandarisasi: 'standardized_product',
    produk_tersertifikasi: 'certified_product',
    rekayasa_sosial: 'social_engineering',
    konsultasi: 'consulting_mentoring',
    pendampingan: 'consulting_mentoring',
    konsultasi_pendampingan: 'consulting_mentoring',
    buku_ber_isbn: 'isbn_book',
    buku_isbn: 'isbn_book',
    isbn_book: 'isbn_book',
    book_chapter: 'book_chapter',
    bab_buku: 'book_chapter',
  };
  const resolved = aliases[token] ?? token;
  if (RESEARCH_OUTPUT_SUBTYPE_SET.has(resolved)) {
    return resolved as ResearchOutputSubtype;
  }
  return 'patent';
}

const UI_TO_DB_CATEGORY: Record<AchievementCategory, { category: string; subcategory: string }> = {
  lomba: { category: 'event_participation', subcategory: 'competition' },
  seminar: { category: 'event_participation', subcategory: 'seminar' },
  pagelaran: { category: 'event_participation', subcategory: 'pagelaran' },
  publikasi: { category: 'scientific_work', subcategory: 'journal_publication' },
  haki: { category: 'intellectual_property', subcategory: 'patent' },
  luaran_penelitian: { category: 'research_output', subcategory: 'patent' },
  magang: { category: 'applied_academic', subcategory: 'internship' },
  portofolio: { category: 'applied_academic', subcategory: 'course_portfolio' },
  produk_mahasiswa: { category: 'applied_academic', subcategory: 'makanan_minuman' },
  wirausaha: { category: 'entrepreneurship', subcategory: 'active_business' },
  pengembangan: { category: 'self_development', subcategory: 'workshop' },
  organisasi: { category: 'self_development', subcategory: 'volunteer' },
};

const DB_TO_UI_CATEGORY: Record<string, AchievementCategory> = {
  event_participation: 'seminar',
  scientific_work: 'publikasi',
  intellectual_property: 'haki',
  research_output: 'luaran_penelitian',
  applied_academic: 'produk_mahasiswa',
  entrepreneurship: 'wirausaha',
  self_development: 'pengembangan',
};

function mapDbToUiCategory(category?: string, subcategory?: string): AchievementCategory {
  const categoryValue = (category ?? '').trim().toLowerCase();
  const subcategoryValue = normalizeSubcategoryToken(subcategory);

  if (categoryValue === 'event_participation' && subcategoryValue === 'competition') return 'lomba';
  if (categoryValue === 'event_participation' && subcategoryValue === 'seminar') return 'seminar';
  if (categoryValue === 'event_participation' && PAGELARAN_SUBCATEGORY_SET.has(subcategoryValue)) return 'pagelaran';
  if (categoryValue === 'scientific_work' && SCIENTIFIC_PRESENTATION_SUBCATEGORY_SET.has(subcategoryValue)) return 'pagelaran';
  if (categoryValue === 'research_output') return 'luaran_penelitian';
  if (categoryValue === 'self_development' && subcategoryValue === 'volunteer') return 'organisasi';
  if (categoryValue === 'applied_academic' && subcategoryValue === 'internship') return 'magang';
  if (categoryValue === 'applied_academic' && subcategoryValue === 'course_portfolio') return 'portofolio';
  if (categoryValue === 'applied_academic' && PRODUCT_CATEGORY_SET.has(subcategoryValue)) return 'produk_mahasiswa';
  if (categoryValue === 'applied_academic') return 'produk_mahasiswa';
  if (categoryValue && DB_TO_UI_CATEGORY[categoryValue]) return DB_TO_UI_CATEGORY[categoryValue];
  return 'seminar';
}

function yearToDateString(year?: number): string | undefined {
  if (!year || Number.isNaN(year)) return undefined;
  return `${year}-01-01`;
}

function mapAttachments(achievement: ApiAchievement): AchievementAttachment[] {
  if (!Array.isArray(achievement.attachments)) return [];
  return achievement.attachments.map((attachment) => ({
    id: attachment.id,
    attachmentId: attachment.id,
    fileName: attachment.file_name,
    fileType: attachment.file_type,
    fileSize: attachment.file_size,
    fileUrl: `${getApiBaseUrl()}/achievements/attachments/serve.php?id=${encodeURIComponent(attachment.id)}`,
    uploadedAt: attachment.uploaded_at ?? new Date().toISOString(),
    isPersisted: true,
  }));
}

export function mapApiAchievementToUi(achievement: ApiAchievement): Achievement {
  const uiCategory = mapDbToUiCategory(achievement.category, achievement.subcategory);
  const achievementType = achievement.achievement_type
    ? normalizeAchievementType(achievement.achievement_type)
    : getAchievementTypeFromDb(achievement.category, achievement.subcategory);
  const createdAt = achievement.created_at || new Date().toISOString();
  const updatedAt = achievement.updated_at || createdAt;
  const tanggal = achievement.tanggal || yearToDateString(undefined);
  const year = achievement.tanggal ? new Date(achievement.tanggal).getFullYear() : undefined;
  const attachments = mapAttachments(achievement);

  const base = {
    id: achievement.id,
    masterId: achievement.student_id,
    category: uiCategory,
    achievementType,
    createdAt,
    updatedAt,
    isUnggulan: false,
    attachments,
  };

  switch (uiCategory) {
    case 'lomba': {
      const tingkatLomba = ['lokal', 'regional', 'nasional', 'internasional'].includes(String(achievement.tingkat))
        ? String(achievement.tingkat)
        : 'lokal';
      return {
        ...base,
        category: 'lomba',
        namaLomba: achievement.title || 'Lomba',
        penyelenggara: achievement.penyelenggara || '-',
        tingkat: tingkatLomba as 'lokal' | 'regional' | 'nasional' | 'internasional',
        peran: 'peserta',
        peringkat: achievement.peringkat || undefined,
        bidang: undefined,
        tahun: year || new Date().getFullYear(),
        deskripsi: achievement.description || undefined,
      };
    }
    case 'pagelaran':
      {
        const seminarLevel =
          normalizeSeminarLevel(achievement.level_seminar)
          ?? normalizeSeminarLevel(achievement.level_diseminasi)
          ?? normalizeSeminarLevel(achievement.tingkat);
        const tanggalPublikasi =
          achievement.tanggal_publikasi
          || achievement.tanggal
          || yearToDateString(year || new Date().getFullYear())
          || '';

        return {
          ...base,
          category: 'pagelaran',
          jenisKegiatan: normalizePagelaranSubcategory(achievement.subcategory),
          judulPublikasi: achievement.judul_publikasi || achievement.title || 'Pagelaran / Presentasi',
          levelSeminar: seminarLevel || 'local',
          jenisPerolehan: 'mandiri',
          tanggalPublikasi,
          namaDosen: undefined,
          penulis: typeof achievement.penulis === 'string' ? achievement.penulis : undefined,
          namaSeminarKonferensi: achievement.nama_seminar_konferensi || achievement.nama_seminar || undefined,
          penyelenggara: achievement.penyelenggara || undefined,
          urlPublikasi: achievement.url_publikasi || undefined,
          tahun: year || new Date().getFullYear(),
          deskripsi: achievement.description || undefined,
        } as Achievement;
      }
    case 'seminar':
      {
        const seminarLevel =
          normalizeSeminarLevel(achievement.level_seminar)
          ?? normalizeSeminarLevel(achievement.level_diseminasi)
          ?? normalizeSeminarLevel(achievement.tingkat);
        const jenisPerolehanRaw = typeof achievement.jenis_perolehan === 'string'
          ? achievement.jenis_perolehan.trim().toLowerCase()
          : '';
        const namaDosenRaw =
          typeof achievement.nama_dosen === 'string' && achievement.nama_dosen.trim() !== ''
            ? achievement.nama_dosen.trim()
            : (typeof achievement.peran_penulis === 'string' ? achievement.peran_penulis.trim() : '');
        const jenisPerolehan = (jenisPerolehanRaw === 'kolaborasi_dosen' || namaDosenRaw !== '')
          ? 'kolaborasi_dosen'
          : 'mandiri';
        const tanggalPublikasi =
          achievement.tanggal_publikasi
          || achievement.tanggal
          || yearToDateString(year || new Date().getFullYear())
          || '';

        return {
          ...base,
          category: 'seminar',
          judulPublikasi: achievement.judul_publikasi || achievement.title || 'Publikasi di Seminar',
          levelSeminar: seminarLevel || 'local',
          jenisPerolehan,
          tanggalPublikasi,
          namaDosen: jenisPerolehan === 'kolaborasi_dosen' ? (namaDosenRaw || undefined) : undefined,
          penulis: typeof achievement.penulis === 'string' ? achievement.penulis : undefined,
          namaSeminarKonferensi: achievement.nama_seminar_konferensi || achievement.nama_seminar || undefined,
          penyelenggara: achievement.penyelenggara || undefined,
          urlPublikasi: achievement.url_publikasi || undefined,
          tahun: year || new Date().getFullYear(),
          deskripsi: achievement.description || undefined,
        } as Achievement;
      }
    case 'publikasi':
      {
        const levelJurnal =
          normalizeJournalLevel(achievement.peringkat)
          ?? normalizeJournalLevel(achievement.tingkat);
        const namaDosenRaw =
          typeof achievement.nama_dosen === 'string' && achievement.nama_dosen.trim() !== ''
            ? achievement.nama_dosen.trim()
            : (typeof achievement.peran_penulis === 'string' ? achievement.peran_penulis.trim() : '');
        const jenisPerolehanRaw = typeof achievement.jenis_perolehan === 'string'
          ? achievement.jenis_perolehan.trim().toLowerCase()
          : '';
        const jenisPerolehan = (namaDosenRaw !== '' || jenisPerolehanRaw === 'kolaborasi_dosen')
          ? 'kolaborasi_dosen'
          : 'mandiri';
        const penulisRaw = typeof achievement.penulis === 'string' ? achievement.penulis.trim() : '';
        const publicationUrlRaw = typeof achievement.url_publikasi === 'string' ? achievement.url_publikasi.trim() : '';

        return {
          ...base,
          category: 'publikasi',
          jenisPublikasi: 'artikel_jurnal',
          levelJurnal,
          jenisPerolehan,
          namaDosen: jenisPerolehan === 'kolaborasi_dosen' ? namaDosenRaw || undefined : undefined,
          judul: achievement.title || 'Publikasi',
          penulis: penulisRaw !== '' ? penulisRaw : '-',
          namaJurnal: achievement.penyelenggara || undefined,
          url: publicationUrlRaw !== '' ? publicationUrlRaw : undefined,
          tahun: year || new Date().getFullYear(),
          deskripsi: achievement.description || undefined,
        } as Achievement;
      }
    case 'haki':
      return {
        ...base,
        category: 'haki',
        jenisHaki: 'paten',
        judul: achievement.title || 'HAKI',
        status: 'terdaftar',
        tahunPengajuan: year || new Date().getFullYear(),
        pemegang: achievement.penyelenggara || '-',
        deskripsi: achievement.description || undefined,
      } as Achievement;
    case 'luaran_penelitian': {
      const subtype = normalizeResearchOutputSubtype(achievement.subcategory);
      const tanggalLuaran =
        achievement.tanggal
        || achievement.tanggal_publikasi
        || yearToDateString(year || new Date().getFullYear())
        || '';
      const jenisPerolehanRaw = typeof achievement.jenis_perolehan === 'string'
        ? achievement.jenis_perolehan.trim().toLowerCase()
        : '';
      const namaDosenRaw =
        typeof achievement.nama_dosen === 'string' && achievement.nama_dosen.trim() !== ''
          ? achievement.nama_dosen.trim()
          : (typeof achievement.peran_penulis === 'string' ? achievement.peran_penulis.trim() : '');
      const jenisPerolehan = (jenisPerolehanRaw === 'kolaborasi_dosen' || namaDosenRaw !== '')
        ? 'kolaborasi_dosen'
        : 'mandiri';
      return {
        ...base,
        category: 'luaran_penelitian',
        jenisLuaran: subtype,
        judul: achievement.title || 'Luaran Penelitian',
        jenisPerolehan,
        namaDosen: jenisPerolehan === 'kolaborasi_dosen' ? (namaDosenRaw || undefined) : undefined,
        urlPublikasi: achievement.url_publikasi || undefined,
        tanggalLuaran,
        tahun: new Date(tanggalLuaran).getFullYear() || year || new Date().getFullYear(),
        deskripsi: achievement.description || undefined,
      } as Achievement;
    }
    case 'magang':
      return {
        ...base,
        category: 'magang',
        namaPerusahaan: achievement.penyelenggara || achievement.title || 'Perusahaan',
        posisi: achievement.title || 'Magang',
        lokasi: achievement.lokasi || '-',
        industri: achievement.description || '-',
        tanggalMulai: tanggal || yearToDateString(new Date().getFullYear())!,
        sedangBerjalan: false,
        deskripsiTugas: achievement.description || undefined,
      } as Achievement;
    case 'portofolio':
      return {
        ...base,
        category: 'portofolio',
        mataKuliah: 'other',
        mataKuliahCustom: achievement.subcategory || undefined,
        judulProyek: achievement.title || 'Portofolio',
        deskripsiProyek: achievement.description || '',
        tahun: year || new Date().getFullYear(),
        semester: 'ganjil',
        urlProyek: undefined,
      } as Achievement;
    case 'produk_mahasiswa': {
      const tingkatProduk = ['lokal', 'regional', 'nasional', 'internasional'].includes(String(achievement.tingkat))
        ? String(achievement.tingkat)
        : 'lokal';
      return {
        ...base,
        category: 'produk_mahasiswa',
        namaProduk: achievement.title || 'Produk Mahasiswa',
        kategoriProduk: normalizeProductCategory(achievement.subcategory),
        tanggalAdopsi: tanggal || yearToDateString(new Date().getFullYear())!,
        linkProduk: achievement.link_produk || achievement.url_publikasi || undefined,
        lokasi: achievement.lokasi || undefined,
        mitraAdopsi: achievement.penyelenggara || undefined,
        tingkat: tingkatProduk as 'lokal' | 'regional' | 'nasional' | 'internasional',
        deskripsi: achievement.description || undefined,
      } as Achievement;
    }
    case 'wirausaha':
      return {
        ...base,
        category: 'wirausaha',
        namaUsaha: achievement.title || 'Usaha',
        jenisUsaha: achievement.description || '-',
        deskripsiUsaha: achievement.description || '',
        tahunMulai: year || new Date().getFullYear(),
        masihAktif: true,
        lokasi: achievement.lokasi || '-',
      } as Achievement;
    case 'pengembangan':
      return {
        ...base,
        category: 'pengembangan',
        jenisProgram: 'pelatihan',
        namaProgram: achievement.title || 'Program',
        penyelenggara: achievement.penyelenggara || '-',
        tanggalMulai: tanggal || yearToDateString(new Date().getFullYear())!,
        sedangBerjalan: false,
        deskripsi: achievement.description || undefined,
      } as Achievement;
    case 'organisasi':
      return {
        ...base,
        category: 'organisasi',
        namaOrganisasi: achievement.title || 'Organisasi',
        jenisOrganisasi: 'kampus',
        jabatan: achievement.description || 'Anggota',
        tanggalMulai: tanggal || yearToDateString(new Date().getFullYear())!,
        masihAktif: false,
        deskripsi: achievement.description || undefined,
      } as Achievement;
    default:
      return {
        ...base,
        category: 'seminar',
        judulPublikasi: achievement.title || 'Prestasi',
        levelSeminar: normalizeSeminarLevel(achievement.tingkat) || 'local',
        jenisPerolehan: 'mandiri',
        tanggalPublikasi: achievement.tanggal || yearToDateString(year || new Date().getFullYear()) || '',
        penyelenggara: achievement.penyelenggara || undefined,
        tahun: year || new Date().getFullYear(),
        deskripsi: achievement.description || undefined,
      };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getYearFromFormData(formData: Record<string, any>): number | undefined {
  if (formData.tahun) return Number(formData.tahun);
  if (formData.tahunMulai) return Number(formData.tahunMulai);
  if (formData.tahunPengajuan) return Number(formData.tahunPengajuan);
  if (formData.tahunMulaiStudi) return Number(formData.tahunMulaiStudi);
  return undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDateFromFormData(formData: Record<string, any>): string | undefined {
  if (formData.tanggalLuaran) return formData.tanggalLuaran;
  if (formData.tanggalAdopsi) return formData.tanggalAdopsi;
  if (formData.tanggalPublikasi) return formData.tanggalPublikasi;
  if (formData.tanggalMulai) return formData.tanggalMulai;
  if (formData.tanggal) return formData.tanggal;
  const year = getYearFromFormData(formData);
  return year ? yearToDateString(year) : undefined;
}

export function mapUiAchievementToApiPayload(
  masterId: string,
  category: AchievementCategory,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formData: Record<string, any>
): CreateAchievementPayload {
  const mapping = UI_TO_DB_CATEGORY[category];
  const productSubcategory = normalizeProductCategory(formData.kategoriProduk || formData.subcategory || mapping.subcategory);
  const pagelaranSubcategory = category === 'pagelaran'
    ? normalizePagelaranSubcategory(formData.jenisKegiatan || formData.subcategory || mapping.subcategory)
    : null;
  const researchOutputSubcategory = category === 'luaran_penelitian'
    ? normalizeResearchOutputSubtype(formData.jenisLuaran || formData.subcategory || mapping.subcategory)
    : null;
  const resolvedSubcategory = category === 'produk_mahasiswa'
    ? productSubcategory
    : (category === 'pagelaran'
      ? pagelaranSubcategory
      : (category === 'luaran_penelitian' ? researchOutputSubcategory : mapping.subcategory));
  const tanggal = getDateFromFormData(formData);
  const title =
    formData.namaProduk ||
    formData.namaLomba ||
    formData.judulKegiatan ||
    formData.judulPublikasi ||
    formData.namaSeminar ||
    formData.judul ||
    formData.judulProyek ||
    formData.namaUsaha ||
    formData.namaProgram ||
    formData.namaOrganisasi ||
    formData.namaPerusahaan ||
    'Prestasi';
  const baseDescription =
    formData.deskripsi ||
    formData.deskripsiProyek ||
    formData.deskripsiUsaha ||
    formData.deskripsiTugas ||
    formData.deskripsiOrganisasi ||
    formData.description ||
    '';
  const kategoriProdukLainnya =
    typeof formData.kategoriProdukLainnya === 'string' ? formData.kategoriProdukLainnya.trim() : '';
  const description =
    category === 'produk_mahasiswa' && formData.kategoriProduk === 'lainnya' && kategoriProdukLainnya
      ? `Kategori Produk (Lainnya): ${kategoriProdukLainnya}${baseDescription ? `\n${baseDescription}` : ''}`
      : baseDescription;
  const penyelenggara =
    formData.mitraAdopsi ||
    formData.penyelenggara ||
    formData.namaPerusahaan ||
    formData.namaUsaha ||
    formData.namaOrganisasi ||
    undefined;
  const jenisPublikasi = String(formData.jenisPublikasi || '').trim().toLowerCase();
  const isJurnalPublication = category === 'publikasi' && jenisPublikasi === 'artikel_jurnal';
  const journalLevel = isJurnalPublication
    ? normalizeJournalLevel(formData.levelJurnal || formData.peringkat || formData.tingkat)
    : undefined;
  const seminarLevel = (category === 'seminar' || category === 'pagelaran')
    ? normalizeSeminarLevel(formData.levelSeminar || formData.level_seminar || formData.tingkat)
    : undefined;
  const tingkat = category === 'produk_mahasiswa'
    ? (formData.tingkat || 'lokal')
    : (category === 'seminar' || category === 'pagelaran')
      ? mapSeminarLevelToTingkat(seminarLevel)
    : category === 'publikasi'
      ? mapJournalLevelToTingkat(journalLevel)
      : (formData.tingkat || undefined);
  const peringkat = category === 'publikasi' ? (journalLevel || undefined) : (formData.peringkat || undefined);
  const jenisPerolehanPublikasi = String(formData.jenisPerolehan || 'mandiri').toLowerCase();
  const namaDosenPublikasi =
    typeof formData.namaDosen === 'string' && formData.namaDosen.trim() !== ''
      ? formData.namaDosen.trim()
      : '';
  const peranPenulis = category === 'publikasi'
    ? (jenisPerolehanPublikasi === 'kolaborasi_dosen' ? namaDosenPublikasi : '')
    : (formData.peranPenulis || undefined);
  const isPublikasiKolaborasiDosen = category === 'publikasi' && jenisPerolehanPublikasi === 'kolaborasi_dosen';
  const isSeminarCategory = category === 'seminar';
  const isPagelaranCategory = category === 'pagelaran';
  const isResearchOutputCategory = category === 'luaran_penelitian';
  const isSeminarLikeKolaborasiDosen = isSeminarCategory && jenisPerolehanPublikasi === 'kolaborasi_dosen';
  const isSeminarLikeCategory = category === 'seminar' || category === 'pagelaran';
  const seminarLikeJenisPerolehan = isPagelaranCategory
    ? 'mandiri'
    : (isSeminarLikeKolaborasiDosen ? 'kolaborasi_dosen' : 'mandiri');
  const seminarLikeNamaDosen = isPagelaranCategory
    ? ''
    : (isSeminarLikeKolaborasiDosen ? (namaDosenPublikasi || undefined) : '');
  const seminarLikePeranPenulis = isPagelaranCategory
    ? ''
    : (isSeminarLikeKolaborasiDosen ? (namaDosenPublikasi || '') : '');
  const researchOutputJenisPerolehan = isResearchOutputCategory
    ? (String(formData.jenisPerolehan || 'mandiri').toLowerCase() === 'kolaborasi_dosen' ? 'kolaborasi_dosen' : 'mandiri')
    : undefined;
  const researchOutputNamaDosen = isResearchOutputCategory && researchOutputJenisPerolehan === 'kolaborasi_dosen'
    ? (typeof formData.namaDosen === 'string' && formData.namaDosen.trim() !== '' ? formData.namaDosen.trim() : undefined)
    : undefined;
  const isResearchOutputBook = isResearchOutputCategory
    && researchOutputSubcategory !== null
    && RESEARCH_OUTPUT_BOOK_SUBTYPES.includes(researchOutputSubcategory);
  const resolvedAchievementType = isResearchOutputCategory
    ? (isResearchOutputBook ? 'academic' : 'non_academic')
    : getAchievementTypeFromUiCategory(category);
  const publicationUrlCandidate = category === 'publikasi'
    ? String(formData.url || formData.urlPublikasi || '').trim()
    : '';

  return {
    student_id: masterId,
    title,
    category: mapping.category,
    subcategory: resolvedSubcategory,
    achievement_type: resolvedAchievementType,
    description,
    tanggal,
    lokasi: formData.lokasi || undefined,
    penyelenggara,
    tingkat,
    peringkat,
    peran_penulis: category === 'publikasi'
      ? String(peranPenulis ?? '')
      : (isSeminarLikeCategory
        ? seminarLikePeranPenulis
        : (isResearchOutputCategory ? (researchOutputNamaDosen || '') : peranPenulis)),
    jenis_perolehan: (category === 'publikasi' || isSeminarLikeCategory)
      ? (category === 'publikasi'
        ? (isPublikasiKolaborasiDosen ? 'kolaborasi_dosen' : 'mandiri')
        : seminarLikeJenisPerolehan)
      : (isResearchOutputCategory ? researchOutputJenisPerolehan : undefined),
    nama_dosen: (category === 'publikasi' || isSeminarLikeCategory)
      ? (category === 'publikasi'
        ? (isPublikasiKolaborasiDosen ? (namaDosenPublikasi || undefined) : '')
        : seminarLikeNamaDosen)
      : (isResearchOutputCategory ? researchOutputNamaDosen : undefined),
    judul_publikasi: isSeminarLikeCategory ? String(formData.judulPublikasi || formData.judulKegiatan || title) : undefined,
    level_seminar: isSeminarLikeCategory ? seminarLevel : undefined,
    tanggal_publikasi: isSeminarLikeCategory ? String(formData.tanggalPublikasi || tanggal || '') : undefined,
    nama_seminar_konferensi: isSeminarLikeCategory
      ? (formData.namaSeminarKonferensi || formData.namaSeminar || formData.namaKegiatan || undefined)
      : undefined,
    penulis: (isSeminarLikeCategory || category === 'publikasi') ? (formData.penulis || undefined) : undefined,
    url: category === 'publikasi' && publicationUrlCandidate !== '' ? publicationUrlCandidate : undefined,
    url_publikasi: (isSeminarLikeCategory || isResearchOutputCategory) ? (formData.urlPublikasi || undefined) : undefined,
    link_produk: category === 'produk_mahasiswa'
      ? (formData.linkProduk || formData.link_produk || undefined)
      : undefined,
    verified: Boolean(formData.verified),
  };
}
