import type { AchievementCategory, AchievementType } from '@/types/achievement.types';

const UI_CATEGORY_TO_TYPE: Record<AchievementCategory, AchievementType> = {
  publikasi: 'academic',
  portofolio: 'academic',
  lomba: 'non_academic',
  haki: 'non_academic',
  luaran_penelitian: 'non_academic',
  seminar: 'non_academic',
  pagelaran: 'non_academic',
  magang: 'non_academic',
  produk_mahasiswa: 'non_academic',
  wirausaha: 'non_academic',
  pengembangan: 'non_academic',
  organisasi: 'non_academic',
};

export function normalizeAchievementType(value: string | null | undefined): AchievementType {
  return value === 'academic' ? 'academic' : 'non_academic';
}

export function getAchievementTypeFromUiCategory(category: AchievementCategory): AchievementType {
  return UI_CATEGORY_TO_TYPE[category] ?? 'non_academic';
}

export function getAchievementTypeFromDb(
  category: string | null | undefined,
  subcategory: string | null | undefined
): AchievementType {
  const normalizedCategory = (category ?? '').trim().toLowerCase();
  const normalizedSubcategory = (subcategory ?? '').trim().toLowerCase();
  const bookSubtypes = new Set(['isbn_book', 'book_chapter']);

  if (normalizedCategory === 'research_output') {
    return bookSubtypes.has(normalizedSubcategory) ? 'academic' : 'non_academic';
  }

  if (normalizedCategory === 'scientific_work') return 'academic';
  if (normalizedCategory === 'applied_academic' && normalizedSubcategory === 'course_portfolio') return 'academic';

  return 'non_academic';
}

export function getAchievementTypeLabel(type: AchievementType): string {
  return type === 'academic' ? 'Prestasi Akademik' : 'Prestasi Non Akademik';
}
