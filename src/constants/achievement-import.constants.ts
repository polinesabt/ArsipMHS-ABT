import type { AchievementImportCategory } from '@/repositories/api-student.repository';
import type { PublicationsTab, StudentAchievementsTab } from '@/types/insight-tabs';

export type AchievementImportScope =
  | 'all'
  | 'academic'
  | 'nonAcademic'
  | 'productOnly'
  | 'researchOutputs'
  | 'researchOutputsHki'
  | 'researchOutputsTechnology'
  | 'researchOutputsBooks'
  | 'publicationsJurnal'
  | 'publicationsSeminar'
  | 'publicationsPagelaran';
export type AchievementImportCategoryGroup = 'academic' | 'non_academic';

export interface AchievementImportCategoryMeta {
  label: string;
  group: AchievementImportCategoryGroup;
}

export const ACHIEVEMENT_IMPORT_CATEGORY_META: Record<AchievementImportCategory, AchievementImportCategoryMeta> = {
  publikasi: { label: 'Karya Ilmiah & Publikasi', group: 'academic' },
  jurnal: { label: 'Jurnal', group: 'academic' },
  portofolio: { label: 'Portofolio Praktikum Kelas', group: 'academic' },
  lomba: { label: 'Lomba', group: 'non_academic' },
  kekayaan_intelektual: { label: 'Kekayaan Intelektual', group: 'non_academic' },
  research_output_hki: { label: 'Luaran Penelitian - HKI', group: 'non_academic' },
  research_output_technology: { label: 'Luaran Penelitian - Teknologi Tepat Guna', group: 'non_academic' },
  research_output_books: { label: 'Luaran Penelitian - Buku', group: 'academic' },
  magang: { label: 'Pengalaman Magang', group: 'non_academic' },
  produk_mahasiswa: { label: 'Produk Mahasiswa', group: 'non_academic' },
  wirausaha: { label: 'Pengalaman Wirausaha', group: 'non_academic' },
  pengembangan_diri: { label: 'Program Pengembangan Diri', group: 'non_academic' },
  organisasi: { label: 'Organisasi & Kepemimpinan', group: 'non_academic' },
  seminar: { label: 'Publikasi di Seminar', group: 'non_academic' },
  pagelaran: { label: 'Pagelaran / Presentasi', group: 'non_academic' },
};

export const ACADEMIC_IMPORT_CATEGORIES: AchievementImportCategory[] = ['publikasi', 'portofolio'];

export const NON_ACADEMIC_IMPORT_CATEGORIES: AchievementImportCategory[] = [
  'lomba',
  'kekayaan_intelektual',
  'magang',
  'produk_mahasiswa',
  'wirausaha',
  'pengembangan_diri',
  'organisasi',
  'seminar',
];

export const RESEARCH_OUTPUT_IMPORT_CATEGORIES: AchievementImportCategory[] = [
  'research_output_hki',
  'research_output_technology',
  'research_output_books',
];

export const STUDENT_ACHIEVEMENT_FILTER_CATEGORIES: AchievementImportCategory[] = [
  'publikasi',
  'portofolio',
  'lomba',
  'kekayaan_intelektual',
  'research_output_hki',
  'research_output_technology',
  'research_output_books',
  'magang',
  'produk_mahasiswa',
  'wirausaha',
  'pengembangan_diri',
  'organisasi',
  'seminar',
];

const STUDENT_ACHIEVEMENT_FILTER_ACADEMIC_CATEGORIES = STUDENT_ACHIEVEMENT_FILTER_CATEGORIES.filter(
  (category) => ACHIEVEMENT_IMPORT_CATEGORY_META[category].group === 'academic'
);

const STUDENT_ACHIEVEMENT_FILTER_NON_ACADEMIC_CATEGORIES = STUDENT_ACHIEVEMENT_FILTER_CATEGORIES.filter(
  (category) => ACHIEVEMENT_IMPORT_CATEGORY_META[category].group === 'non_academic'
);

export function resolveImportCategoriesByScope(scope: AchievementImportScope): AchievementImportCategory[] {
  if (scope === 'academic') return ACADEMIC_IMPORT_CATEGORIES;
  if (scope === 'nonAcademic') return NON_ACADEMIC_IMPORT_CATEGORIES;
  if (scope === 'productOnly') return ['produk_mahasiswa'];
  if (scope === 'researchOutputs') return RESEARCH_OUTPUT_IMPORT_CATEGORIES;
  if (scope === 'researchOutputsHki') return ['research_output_hki'];
  if (scope === 'researchOutputsTechnology') return ['research_output_technology'];
  if (scope === 'researchOutputsBooks') return ['research_output_books'];
  if (scope === 'publicationsJurnal') return ['jurnal'];
  if (scope === 'publicationsSeminar') return ['seminar'];
  if (scope === 'publicationsPagelaran') return ['pagelaran'];
  return [...ACADEMIC_IMPORT_CATEGORIES, ...NON_ACADEMIC_IMPORT_CATEGORIES];
}

export function resolveScopeFromStudentAchievementTab(
  tab?: StudentAchievementsTab | string | null
): AchievementImportScope {
  if (tab === 'academic') return 'academic';
  if (tab === 'nonAcademic') return 'nonAcademic';
  return 'all';
}

export function resolveStudentAchievementFilterCategoriesByTab(
  tab?: StudentAchievementsTab | string | null
): AchievementImportCategory[] {
  if (tab === 'academic') return [...STUDENT_ACHIEVEMENT_FILTER_ACADEMIC_CATEGORIES];
  if (tab === 'nonAcademic') return [...STUDENT_ACHIEVEMENT_FILTER_NON_ACADEMIC_CATEGORIES];
  return [...STUDENT_ACHIEVEMENT_FILTER_CATEGORIES];
}

export function resolveScopeFromPublicationsTab(
  tab?: PublicationsTab | string | null
): AchievementImportScope {
  if (tab === 'seminar') return 'publicationsSeminar';
  if (tab === 'pagelaran') return 'publicationsPagelaran';
  return 'publicationsJurnal';
}

export function resolveScopeFromResearchOutputsTab(
  tab?: string | null
): AchievementImportScope {
  if (tab === 'haki') return 'researchOutputsHki';
  if (tab === 'technology') return 'researchOutputsTechnology';
  if (tab === 'other') return 'researchOutputsBooks';
  return 'researchOutputs';
}
