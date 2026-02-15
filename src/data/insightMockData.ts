// Data contoh untuk Arsip Mahasiswa ABT

export const years = [2021, 2022, 2023, 2024, 2025, 2026] as const;
export type Year = typeof years[number];

// Bagian 1: Prestasi Mahasiswa
export const achievementsData = {
  academic: {
    total: 245,
    breakdown: {
      local: 85,
      national: 110,
      international: 50,
    },
  },
  nonAcademic: {
    total: 178,
    breakdown: {
      local: 72,
      national: 68,
      international: 38,
    },
  },
};

export const achievementsByYear: Record<Year, typeof achievementsData> = {
  2021: {
    academic: { total: 180, breakdown: { local: 65, national: 80, international: 35 } },
    nonAcademic: { total: 120, breakdown: { local: 50, national: 45, international: 25 } },
  },
  2022: {
    academic: { total: 198, breakdown: { local: 70, national: 88, international: 40 } },
    nonAcademic: { total: 135, breakdown: { local: 55, national: 52, international: 28 } },
  },
  2023: {
    academic: { total: 220, breakdown: { local: 78, national: 95, international: 47 } },
    nonAcademic: { total: 155, breakdown: { local: 62, national: 60, international: 33 } },
  },
  2024: {
    academic: { total: 245, breakdown: { local: 85, national: 110, international: 50 } },
    nonAcademic: { total: 178, breakdown: { local: 72, national: 68, international: 38 } },
  },
  2025: {
    academic: { total: 268, breakdown: { local: 90, national: 120, international: 58 } },
    nonAcademic: { total: 195, breakdown: { local: 78, national: 75, international: 42 } },
  },
  2026: {
    academic: { total: 290, breakdown: { local: 95, national: 132, international: 63 } },
    nonAcademic: { total: 210, breakdown: { local: 82, national: 82, international: 46 } },
  },
};

// Bagian 2: Masa Studi Lulusan
export const graduationData: Record<Year, { admitted: number; graduated: number }> = {
  2021: { admitted: 450, graduated: 385 },
  2022: { admitted: 478, graduated: 402 },
  2023: { admitted: 502, graduated: 425 },
  2024: { admitted: 520, graduated: 448 },
  2025: { admitted: 545, graduated: 470 },
  2026: { admitted: 568, graduated: 495 },
};

// Bagian 3: Masa Tunggu Lulusan
export const waitingTimeData: Record<Year, {
  total: number;
  tracked: number;
  lessThan3Months: number;
  between3And6Months: number;
  moreThan6Months: number;
}> = {
  2021: { total: 385, tracked: 320, lessThan3Months: 180, between3And6Months: 95, moreThan6Months: 45 },
  2022: { total: 402, tracked: 345, lessThan3Months: 200, between3And6Months: 100, moreThan6Months: 45 },
  2023: { total: 425, tracked: 375, lessThan3Months: 225, between3And6Months: 105, moreThan6Months: 45 },
  2024: { total: 448, tracked: 398, lessThan3Months: 250, between3And6Months: 108, moreThan6Months: 40 },
  2025: { total: 470, tracked: 420, lessThan3Months: 275, between3And6Months: 110, moreThan6Months: 35 },
  2026: { total: 495, tracked: 450, lessThan3Months: 300, between3And6Months: 115, moreThan6Months: 35 },
};

// Bagian 4: Kesesuaian Bidang Kerja
export const jobRelevanceData: Record<Year, { relevant: number; notRelevant: number; tracked: number }> = {
  2021: { relevant: 268, notRelevant: 52, tracked: 320 },
  2022: { relevant: 293, notRelevant: 52, tracked: 345 },
  2023: { relevant: 322, notRelevant: 53, tracked: 375 },
  2024: { relevant: 346, notRelevant: 52, tracked: 398 },
  2025: { relevant: 370, notRelevant: 50, tracked: 420 },
  2026: { relevant: 400, notRelevant: 50, tracked: 450 },
};

// Bagian 5: Cakupan Tempat Kerja Lulusan
export const workCoverageData: Record<Year, {
  localUnlicensed: number;
  nationalLicensed: number;
  multinational: number;
}> = {
  2021: { localUnlicensed: 145, nationalLicensed: 130, multinational: 45 },
  2022: { localUnlicensed: 152, nationalLicensed: 142, multinational: 51 },
  2023: { localUnlicensed: 158, nationalLicensed: 160, multinational: 57 },
  2024: { localUnlicensed: 162, nationalLicensed: 175, multinational: 61 },
  2025: { localUnlicensed: 168, nationalLicensed: 188, multinational: 64 },
  2026: { localUnlicensed: 175, nationalLicensed: 205, multinational: 70 },
};

// Bagian 6: Kepuasan Pengguna
export const satisfactionIndicators = [
  'Etika',
  'Kompetensi Inti',
  'Kemampuan Bahasa Asing',
  'Penggunaan Teknologi Informasi',
  'Kemampuan Komunikasi',
  'Kerja Sama Tim',
  'Pengembangan Diri',
] as const;

export type SatisfactionIndicator = typeof satisfactionIndicators[number];

export const satisfactionData: Record<SatisfactionIndicator, {
  veryGood: number;
  good: number;
  fair: number;
  poor: number;
}> = {
  'Etika': { veryGood: 45, good: 38, fair: 12, poor: 5 },
  'Kompetensi Inti': { veryGood: 42, good: 40, fair: 14, poor: 4 },
  'Kemampuan Bahasa Asing': { veryGood: 28, good: 35, fair: 28, poor: 9 },
  'Penggunaan Teknologi Informasi': { veryGood: 48, good: 36, fair: 12, poor: 4 },
  'Kemampuan Komunikasi': { veryGood: 40, good: 42, fair: 14, poor: 4 },
  'Kerja Sama Tim': { veryGood: 52, good: 35, fair: 10, poor: 3 },
  'Pengembangan Diri': { veryGood: 38, good: 44, fair: 14, poor: 4 },
};

// Bagian 7: Publikasi & Presentasi
export const publicationsData: Record<Year, {
  nationalNonAccredited: number;
  nationalAccredited: number;
  international: number;
  reputableInternational: number;
  localSeminars: number;
  nationalSeminars: number;
  internationalSeminars: number;
  exhibitions: number;
}> = {
  2021: {
    nationalNonAccredited: 45, nationalAccredited: 28, international: 12, reputableInternational: 5,
    localSeminars: 35, nationalSeminars: 22, internationalSeminars: 8, exhibitions: 15,
  },
  2022: {
    nationalNonAccredited: 52, nationalAccredited: 32, international: 15, reputableInternational: 7,
    localSeminars: 42, nationalSeminars: 28, internationalSeminars: 10, exhibitions: 18,
  },
  2023: {
    nationalNonAccredited: 58, nationalAccredited: 38, international: 18, reputableInternational: 9,
    localSeminars: 48, nationalSeminars: 32, internationalSeminars: 12, exhibitions: 22,
  },
  2024: {
    nationalNonAccredited: 65, nationalAccredited: 45, international: 22, reputableInternational: 12,
    localSeminars: 55, nationalSeminars: 38, internationalSeminars: 15, exhibitions: 25,
  },
  2025: {
    nationalNonAccredited: 72, nationalAccredited: 52, international: 28, reputableInternational: 15,
    localSeminars: 62, nationalSeminars: 45, internationalSeminars: 18, exhibitions: 28,
  },
  2026: {
    nationalNonAccredited: 80, nationalAccredited: 60, international: 32, reputableInternational: 18,
    localSeminars: 70, nationalSeminars: 52, internationalSeminars: 22, exhibitions: 32,
  },
};

// Bagian 8: Mahasiswa Aktif
export const activeStudentsData: Record<Year, {
  oddSemester: number;
  evenSemester: number;
  pdDikti: number;
}> = {
  2021: { oddSemester: 1850, evenSemester: 1780, pdDikti: 1820 },
  2022: { oddSemester: 1920, evenSemester: 1850, pdDikti: 1890 },
  2023: { oddSemester: 2010, evenSemester: 1940, pdDikti: 1980 },
  2024: { oddSemester: 2100, evenSemester: 2020, pdDikti: 2070 },
  2025: { oddSemester: 2180, evenSemester: 2100, pdDikti: 2150 },
  2026: { oddSemester: 2260, evenSemester: 2180, pdDikti: 2230 },
};

// Bagian 9: Produk Mahasiswa
export const studentProductCategories = [
  'Makanan & Minuman',
  'Fesyen & Gaya Hidup',
  'Teknologi Bisnis Terapan',
  'Pendidikan',
  'Investasi & Keuangan',
  'Transportasi & Logistik',
  'Pariwisata',
  'Jasa Profesional',
  'Layanan Digital',
  'Waralaba',
  'Bisnis Hijau',
] as const;

export type ProductCategory = typeof studentProductCategories[number];

export const studentProductsData: Record<ProductCategory, number> = {
  'Makanan & Minuman': 45,
  'Fesyen & Gaya Hidup': 32,
  'Teknologi Bisnis Terapan': 28,
  'Pendidikan': 22,
  'Investasi & Keuangan': 15,
  'Transportasi & Logistik': 12,
  'Pariwisata': 18,
  'Jasa Profesional': 25,
  'Layanan Digital': 38,
  'Waralaba': 8,
  'Bisnis Hijau': 20,
};

// Bagian 10: Luaran Riset & Pengabdian
export const researchOutputsData = {
  intellectualProperty: {
    trademarks: 25,
    patents: 8,
    simplePatents: 12,
    industrialDesigns: 15,
    copyrights: 45,
    geographicalIndications: 3,
    tradeSecrets: 5,
    integratedCircuitLayouts: 2,
  },
  appropriateTechnology: {
    softwareDevelopment: 35,
    products: 28,
  },
  standardizedProducts: 18,
  certifiedProducts: 12,
  socialEngineering: 22,
  consultingMentoring: 30,
  books: {
    isbnBooks: 15,
    bookChapters: 25,
  },
};