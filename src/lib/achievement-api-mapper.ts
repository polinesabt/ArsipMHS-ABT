import type { Achievement, AchievementCategory } from '@/types/achievement.types';
import type { Achievement as ApiAchievement, CreateAchievementPayload } from '@/repositories/api-student.repository';

const UI_TO_DB_CATEGORY: Record<AchievementCategory, { category: string; subcategory: string }> = {
  lomba: { category: 'event_participation', subcategory: 'competition' },
  seminar: { category: 'event_participation', subcategory: 'seminar' },
  publikasi: { category: 'scientific_work', subcategory: 'journal_publication' },
  haki: { category: 'intellectual_property', subcategory: 'patent' },
  magang: { category: 'applied_academic', subcategory: 'internship' },
  portofolio: { category: 'applied_academic', subcategory: 'course_portfolio' },
  wirausaha: { category: 'entrepreneurship', subcategory: 'active_business' },
  pengembangan: { category: 'self_development', subcategory: 'workshop' },
  organisasi: { category: 'self_development', subcategory: 'volunteer' },
};

const DB_TO_UI_CATEGORY: Record<string, AchievementCategory> = {
  event_participation: 'seminar',
  scientific_work: 'publikasi',
  intellectual_property: 'haki',
  applied_academic: 'portofolio',
  entrepreneurship: 'wirausaha',
  self_development: 'pengembangan',
};

function mapDbToUiCategory(category?: string, subcategory?: string): AchievementCategory {
  if (category === 'event_participation' && subcategory === 'competition') return 'lomba';
  if (category === 'event_participation' && subcategory === 'seminar') return 'seminar';
  if (category === 'self_development' && subcategory === 'volunteer') return 'organisasi';
  if (category === 'applied_academic' && subcategory === 'internship') return 'magang';
  if (category === 'applied_academic' && subcategory === 'course_portfolio') return 'portofolio';
  if (category && DB_TO_UI_CATEGORY[category]) return DB_TO_UI_CATEGORY[category];
  return 'seminar';
}

function yearToDateString(year?: number): string | undefined {
  if (!year || Number.isNaN(year)) return undefined;
  return `${year}-01-01`;
}

export function mapApiAchievementToUi(achievement: ApiAchievement): Achievement {
  const uiCategory = mapDbToUiCategory(achievement.category, achievement.subcategory);
  const createdAt = achievement.created_at || new Date().toISOString();
  const updatedAt = achievement.updated_at || createdAt;
  const tanggal = achievement.tanggal || yearToDateString(undefined);
  const year = achievement.tanggal ? new Date(achievement.tanggal).getFullYear() : undefined;

  const base = {
    id: achievement.id,
    masterId: achievement.student_id,
    category: uiCategory,
    createdAt,
    updatedAt,
    isUnggulan: false,
  };

  switch (uiCategory) {
    case 'lomba':
      return {
        ...base,
        category: 'lomba',
        namaLomba: achievement.title || 'Lomba',
        penyelenggara: achievement.penyelenggara || '-',
        tingkat: (achievement.tingkat as any) || 'lokal',
        peran: 'peserta',
        peringkat: achievement.peringkat || undefined,
        bidang: undefined,
        tahun: year || new Date().getFullYear(),
        deskripsi: achievement.description || undefined,
      };
    case 'seminar':
      return {
        ...base,
        category: 'seminar',
        namaSeminar: achievement.title || 'Seminar',
        penyelenggara: achievement.penyelenggara || '-',
        peran: 'peserta',
        mode: 'offline',
        tahun: year || new Date().getFullYear(),
        deskripsi: achievement.description || undefined,
      };
    case 'publikasi':
      return {
        ...base,
        category: 'publikasi',
        jenisPublikasi: 'artikel_jurnal',
        judul: achievement.title || 'Publikasi',
        penulis: '-',
        tahun: year || new Date().getFullYear(),
        deskripsi: achievement.description || undefined,
      } as Achievement;
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
        namaSeminar: achievement.title || 'Prestasi',
        penyelenggara: achievement.penyelenggara || '-',
        peran: 'peserta',
        mode: 'offline',
        tahun: year || new Date().getFullYear(),
        deskripsi: achievement.description || undefined,
      };
  }
}

function getYearFromFormData(formData: Record<string, any>): number | undefined {
  if (formData.tahun) return Number(formData.tahun);
  if (formData.tahunMulai) return Number(formData.tahunMulai);
  if (formData.tahunPengajuan) return Number(formData.tahunPengajuan);
  if (formData.tahunMulaiStudi) return Number(formData.tahunMulaiStudi);
  return undefined;
}

function getDateFromFormData(formData: Record<string, any>): string | undefined {
  if (formData.tanggalMulai) return formData.tanggalMulai;
  if (formData.tanggal) return formData.tanggal;
  const year = getYearFromFormData(formData);
  return year ? yearToDateString(year) : undefined;
}

export function mapUiAchievementToApiPayload(
  masterId: string,
  category: AchievementCategory,
  formData: Record<string, any>
): CreateAchievementPayload {
  const mapping = UI_TO_DB_CATEGORY[category];
  const tanggal = getDateFromFormData(formData);
  const title =
    formData.namaLomba ||
    formData.namaSeminar ||
    formData.judul ||
    formData.judulProyek ||
    formData.namaUsaha ||
    formData.namaProgram ||
    formData.namaOrganisasi ||
    formData.namaPerusahaan ||
    'Prestasi';
  const description =
    formData.deskripsi ||
    formData.deskripsiProyek ||
    formData.deskripsiUsaha ||
    formData.deskripsiTugas ||
    formData.deskripsiOrganisasi ||
    formData.description ||
    '';
  const penyelenggara =
    formData.penyelenggara ||
    formData.namaPerusahaan ||
    formData.namaUsaha ||
    formData.namaOrganisasi ||
    undefined;
  const tingkat = formData.tingkat || undefined;
  const peringkat = formData.peringkat || undefined;

  return {
    student_id: masterId,
    title,
    category: mapping.category,
    subcategory: mapping.subcategory,
    description,
    tanggal,
    lokasi: formData.lokasi || undefined,
    penyelenggara,
    tingkat,
    peringkat,
    verified: Boolean(formData.verified),
  };
}

