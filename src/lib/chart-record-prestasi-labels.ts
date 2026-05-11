/**
 * Helpers untuk menampilkan label Prestasi Mahasiswa di chart records (Pengaturan Lanjutan).
 * Menggunakan payload dari menu_student_achievements_records.
 */

import { ACHIEVEMENT_IMPORT_CATEGORY_META } from '@/constants/achievement-import.constants';
import type { AchievementImportCategory } from '@/repositories/api-student.repository';
import { getAchievementTypeLabel, normalizeAchievementType } from '@/lib/achievement-classification';
import {
  RESEARCH_OUTPUT_BOOK_SUBTYPES,
  RESEARCH_OUTPUT_HAKI_SUBTYPES,
  RESEARCH_OUTPUT_TECHNOLOGY_SUBTYPES,
  STUDENT_PRODUCT_CATEGORIES,
} from '@/types/achievement.types';

const PRODUCT_CATEGORY_SET = new Set<string>(STUDENT_PRODUCT_CATEGORIES);
const RESEARCH_OUTPUT_HAKI_SET = new Set<string>(RESEARCH_OUTPUT_HAKI_SUBTYPES);
const RESEARCH_OUTPUT_TECHNOLOGY_SET = new Set<string>(RESEARCH_OUTPUT_TECHNOLOGY_SUBTYPES);
const RESEARCH_OUTPUT_BOOK_SET = new Set<string>(RESEARCH_OUTPUT_BOOK_SUBTYPES);

/** Map category+subcategory (backend) -> key untuk ACHIEVEMENT_IMPORT_CATEGORY_META */
function payloadToImportCategoryKey(category?: unknown, subcategory?: unknown): AchievementImportCategory {
  const cat = typeof category === 'string' ? category.trim().toLowerCase() : '';
  const sub = typeof subcategory === 'string' ? subcategory.trim().toLowerCase() : '';
  if (cat === 'event_participation' && sub === 'competition') return 'lomba';
  if (cat === 'event_participation' && sub === 'seminar') return 'seminar';
  if (cat === 'self_development' && sub === 'volunteer') return 'organisasi';
  if (cat === 'applied_academic' && sub === 'internship') return 'magang';
  if (cat === 'applied_academic' && sub === 'course_portfolio') return 'portofolio';
  if (cat === 'applied_academic' && PRODUCT_CATEGORY_SET.has(sub)) return 'produk_mahasiswa';
  if (cat === 'applied_academic') return 'produk_mahasiswa';
  if (cat === 'scientific_work') return 'publikasi';
  if (cat === 'intellectual_property') return 'kekayaan_intelektual';
  if (cat === 'research_output') {
    if (RESEARCH_OUTPUT_BOOK_SET.has(sub)) return 'research_output_books';
    if (RESEARCH_OUTPUT_TECHNOLOGY_SET.has(sub)) return 'research_output_technology';
    if (RESEARCH_OUTPUT_HAKI_SET.has(sub)) return 'research_output_hki';
    return 'research_output_hki';
  }
  if (cat === 'entrepreneurship') return 'wirausaha';
  if (cat === 'self_development') return 'pengembangan_diri';
  return 'seminar';
}

export function getPrestasiJenisKey(payload: Record<string, unknown>): AchievementImportCategory {
  return payloadToImportCategoryKey(payload.category, payload.subcategory);
}

/**
 * Label jenis prestasi (Lomba, Kekayaan Intelektual, Pengalaman Magang, dll).
 */
export function getPrestasiJenisLabel(payload: Record<string, unknown>): string {
  const key = getPrestasiJenisKey(payload);
  return ACHIEVEMENT_IMPORT_CATEGORY_META[key]?.label ?? 'Prestasi';
}

/**
 * Label kategori (Prestasi Akademik / Prestasi Non Akademik).
 */
export function getPrestasiKategoriLabel(payload: Record<string, unknown>): string {
  const type = typeof payload.achievement_type === 'string' ? payload.achievement_type : '';
  return getAchievementTypeLabel(normalizeAchievementType(type));
}

/**
 * Nama prestasi yang diinput (dari payload.title, diisi backend saat sync).
 */
export function getPrestasiNama(payload: Record<string, unknown>): string {
  const title = payload.title;
  if (typeof title === 'string' && title.trim()) return title.trim();
  return '';
}
