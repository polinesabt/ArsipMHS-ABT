// Achievement Service - Business Logic Layer

import { 
  Achievement, 
  AchievementCategory,
  LombaAchievement,
  SeminarAchievement,
  PublikasiAchievement,
  HakiAchievement,
  MagangAchievement,
  PortofolioAchievement,
  WirausahaAchievement,
  PengembanganAchievement,
  OrganisasiAchievement
} from '@/types/achievement.types';
// In-memory storage (replace with API in production)
let achievements: Achievement[] = [];

// Generate unique ID
const generateId = (): string => {
  return `ach_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get all achievements
export const getAllAchievements = (): Achievement[] => {
  return [...achievements];
};

// Get all achievements for a student
export const getAchievementsByMasterId = (masterId: string): Achievement[] => {
  return achievements.filter(a => a.masterId === masterId);
};

// Get achievements by category
export const getAchievementsByCategory = (masterId: string, category: AchievementCategory): Achievement[] => {
  return achievements.filter(a => a.masterId === masterId && a.category === category);
};

// Get achievement by ID
export const getAchievementById = (id: string): Achievement | undefined => {
  return achievements.find(a => a.id === id);
};

// Create new achievement
export const createAchievement = <T extends Achievement>(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): T => {
  const now = new Date().toISOString();
  const achievement = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  } as T;
  
  achievements.push(achievement);
  return achievement;
};

// Update achievement
export const updateAchievement = <T extends Achievement>(id: string, data: Partial<T>): T | undefined => {
  const index = achievements.findIndex(a => a.id === id);
  if (index === -1) return undefined;
  
  achievements[index] = {
    ...achievements[index],
    ...data,
    updatedAt: new Date().toISOString(),
  } as T;
  
  return achievements[index] as T;
};

// Delete achievement
export const deleteAchievement = (id: string): boolean => {
  const index = achievements.findIndex(a => a.id === id);
  if (index === -1) return false;
  
  achievements.splice(index, 1);
  return true;
};

// Get achievement statistics for a student
export const getAchievementStats = (masterId: string): Record<AchievementCategory, number> => {
  const studentAchievements = getAchievementsByMasterId(masterId);
  
  return {
    lomba: studentAchievements.filter(a => a.category === 'lomba').length,
    seminar: studentAchievements.filter(a => a.category === 'seminar').length,
    pagelaran: studentAchievements.filter(a => a.category === 'pagelaran').length,
    publikasi: studentAchievements.filter(a => a.category === 'publikasi').length,
    haki: studentAchievements.filter(a => a.category === 'haki').length,
    luaran_penelitian: studentAchievements.filter(a => a.category === 'luaran_penelitian').length,
    magang: studentAchievements.filter(a => a.category === 'magang').length,
    portofolio: studentAchievements.filter(a => a.category === 'portofolio').length,
    produk_mahasiswa: studentAchievements.filter(a => a.category === 'produk_mahasiswa').length,
    wirausaha: studentAchievements.filter(a => a.category === 'wirausaha').length,
    pengembangan: studentAchievements.filter(a => a.category === 'pengembangan').length,
    organisasi: studentAchievements.filter(a => a.category === 'organisasi').length,
  };
};

// Get featured (unggulan) achievements count for a student
export const getFeaturedAchievementsCount = (masterId: string): number => {
  return achievements.filter(a => a.masterId === masterId && a.isUnggulan).length;
};

// Get featured achievements for a student
export const getFeaturedAchievements = (masterId: string): Achievement[] => {
  return achievements.filter(a => a.masterId === masterId && a.isUnggulan);
};

// Toggle featured status
export const toggleFeaturedAchievement = (id: string): Achievement | undefined => {
  const index = achievements.findIndex(a => a.id === id);
  if (index === -1) return undefined;
  
  achievements[index] = {
    ...achievements[index],
    isUnggulan: !achievements[index].isUnggulan,
    updatedAt: new Date().toISOString(),
  };
  
  return achievements[index];
};

// Get highest level achieved by a student
export const getHighestAchievementLevel = (masterId: string): string | null => {
  const studentAchievements = getAchievementsByMasterId(masterId);
  const levelHierarchy: Record<string, number> = {
    'internasional': 4,
    'nasional': 3,
    'regional': 2,
    'lokal': 1,
  };
  
  let highestLevel: string | null = null;
  let highestScore = 0;
  
  for (const achievement of studentAchievements) {
    if (achievement.category === 'lomba') {
      const tingkat = (achievement as any).tingkat;
      const score = levelHierarchy[tingkat] || 0;
      if (score > highestScore) {
        highestScore = score;
        highestLevel = tingkat;
      }
    }
  }
  
  return highestLevel;
};

// Get global achievement statistics (for admin dashboard)
export const getGlobalAchievementStats = (): { 
  total: number; 
  byCategory: Record<AchievementCategory, number>;
  topCategories: { category: AchievementCategory; count: number; label: string }[];
} => {
  const byCategory: Record<AchievementCategory, number> = {
    lomba: achievements.filter(a => a.category === 'lomba').length,
    seminar: achievements.filter(a => a.category === 'seminar').length,
    pagelaran: achievements.filter(a => a.category === 'pagelaran').length,
    publikasi: achievements.filter(a => a.category === 'publikasi').length,
    haki: achievements.filter(a => a.category === 'haki').length,
    luaran_penelitian: achievements.filter(a => a.category === 'luaran_penelitian').length,
    magang: achievements.filter(a => a.category === 'magang').length,
    portofolio: achievements.filter(a => a.category === 'portofolio').length,
    produk_mahasiswa: achievements.filter(a => a.category === 'produk_mahasiswa').length,
    wirausaha: achievements.filter(a => a.category === 'wirausaha').length,
    pengembangan: achievements.filter(a => a.category === 'pengembangan').length,
    organisasi: achievements.filter(a => a.category === 'organisasi').length,
  };

  const categoryLabels: Record<AchievementCategory, string> = {
    lomba: 'Lomba',
    seminar: 'Publikasi di Seminar',
    pagelaran: 'Pagelaran / Presentasi',
    publikasi: 'Publikasi',
    haki: 'HAKI',
    luaran_penelitian: 'Luaran Penelitian',
    magang: 'Magang',
    portofolio: 'Portofolio',
    produk_mahasiswa: 'Produk Mahasiswa',
    wirausaha: 'Wirausaha',
    pengembangan: 'Pengembangan',
    organisasi: 'Organisasi',
  };

  const topCategories = (Object.entries(byCategory) as [AchievementCategory, number][])
    .map(([category, count]) => ({ category, count, label: categoryLabels[category] }))
    .sort((a, b) => b.count - a.count);

  return {
    total: achievements.length,
    byCategory,
    topCategories,
  };
};

// Get unique students with achievements
export const getStudentsWithAchievements = (): string[] => {
  return [...new Set(achievements.map(a => a.masterId))];
};

// Get total achievement count
export const getTotalAchievements = (masterId: string): number => {
  return getAchievementsByMasterId(masterId).length;
};

// ============ Admin Functions ============

// Get achievements by student ID (alias for admin)
export const getAchievementsByStudentId = (studentId: string): Achievement[] => {
  return getAchievementsByMasterId(studentId);
};

// Delete all achievements for a student (cascade delete)
export const deleteAchievementsByStudentId = (studentId: string): number => {
  const studentAchievements = achievements.filter(a => a.masterId === studentId);
  const count = studentAchievements.length;
  achievements = achievements.filter(a => a.masterId !== studentId);
  return count;
};

// Export for testing/seeding
export const seedAchievements = (data: Achievement[]): void => {
  achievements = [...achievements, ...data];
};

export const clearAchievements = (): void => {
  achievements = [];
};

export const resetToSeedData = (): void => {
  achievements = [];
};
