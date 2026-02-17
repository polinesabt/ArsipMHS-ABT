/**
 * Tipe dan konstanta untuk fitur Insight/Presentasi.
 * Hanya daftar tahun filter UI – data chart dari API/DB nanti.
 */

export const INSIGHT_YEARS = [2021, 2022, 2023, 2024, 2025, 2026] as const;
export type Year = (typeof INSIGHT_YEARS)[number];
