/**
 * Alumni Repository
 * Data access layer for alumni data
 * 
 * ARCHITECTURE NOTE:
 * This repository abstracts data access, currently using in-memory data.
 * In production with Prisma/PostgreSQL, replace implementations with:
 * - prisma.alumniMaster.findMany()
 * - prisma.alumniData.create()
 * etc.
 */

import type {
  AlumniMaster,
  AlumniData,
  AlumniFilterCriteria,
  AlumniMergedView,
} from '@/types';

// ============ In-Memory Storage (Replace with API in production) ============

let masterDataStore: AlumniMaster[] = [];
let filledDataStore: AlumniData[] = [];

// ============ Master Data Operations ============

/**
 * Get all alumni master records
 */
export const getAllMasterData = async (): Promise<AlumniMaster[]> => {
  // Production: return prisma.alumniMaster.findMany();
  return masterDataStore;
};

/**
 * Get master record by ID
 */
export const getMasterById = async (id: string): Promise<AlumniMaster | null> => {
  // Production: return prisma.alumniMaster.findUnique({ where: { id } });
  return masterDataStore.find((m) => m.id === id) ?? null;
};

/**
 * Search master data by name and graduation year
 */
export const searchMasterData = async (
  nama: string,
  tahunLulus: number
): Promise<AlumniMaster[]> => {
  // Production: return prisma.alumniMaster.findMany({
  //   where: {
  //     nama: { contains: nama, mode: 'insensitive' },
  //     tahunLulus: tahunLulus
  //   }
  // });
  const namaLower = nama.toLowerCase().trim();
  return masterDataStore.filter(
    (alumni) =>
      alumni.nama.toLowerCase().includes(namaLower) &&
      alumni.tahunLulus === tahunLulus
  );
};

// ============ Filled Data Operations ============

/**
 * Get all filled alumni data records
 */
export const getAllFilledData = async (): Promise<AlumniData[]> => {
  // Production: return prisma.alumniData.findMany();
  return filledDataStore;
};

/**
 * Get filled data by master ID
 */
export const getFilledDataByMasterId = async (
  masterId: string
): Promise<AlumniData[]> => {
  // Production: return prisma.alumniData.findMany({
  //   where: { alumniMasterId: masterId }
  // });
  return filledDataStore.filter((d) => d.alumniMasterId === masterId);
};

/**
 * Get single filled data by master ID (latest)
 */
export const getLatestFilledDataByMasterId = async (
  masterId: string
): Promise<AlumniData | null> => {
  // Production: return prisma.alumniData.findFirst({
  //   where: { alumniMasterId: masterId },
  //   orderBy: { createdAt: 'desc' }
  // });
  const records = filledDataStore
    .filter((d) => d.alumniMasterId === masterId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return records[0] ?? null;
};

/**
 * Create new filled data record
 */
export const createFilledData = async (
  data: Omit<AlumniData, 'id' | 'createdAt'>
): Promise<AlumniData> => {
  // Production: return prisma.alumniData.create({ data });
  const newRecord: AlumniData = {
    ...data,
    id: `f${Date.now()}`,
    createdAt: new Date(),
  };
  filledDataStore.push(newRecord);
  return newRecord;
};

// ============ Merged Data Operations ============

/**
 * Get merged view of master and filled data
 */
export const getMergedAlumniData = async (): Promise<AlumniMergedView[]> => {
  const masterData = await getAllMasterData();
  const filledData = await getAllFilledData();

  return masterData.map((master) => ({
    ...master,
    filledData: filledData.find((d) => d.alumniMasterId === master.id),
  }));
};

/**
 * Get filtered merged data
 */
export const getFilteredMergedData = async (
  criteria: AlumniFilterCriteria
): Promise<AlumniMergedView[]> => {
  const mergedData = await getMergedAlumniData();

  return mergedData.filter((alumni) => {
    const matchSearch =
      !criteria.searchQuery ||
      alumni.nama.toLowerCase().includes(criteria.searchQuery.toLowerCase()) ||
      alumni.nim.includes(criteria.searchQuery);

    const matchTahun =
      criteria.tahunLulus === 'all' ||
      criteria.tahunLulus === undefined ||
      alumni.tahunLulus === criteria.tahunLulus;

    const matchJurusan =
      criteria.jurusan === 'all' ||
      criteria.jurusan === undefined ||
      alumni.jurusan === criteria.jurusan;

    const matchProdi =
      criteria.prodi === 'all' ||
      criteria.prodi === undefined ||
      alumni.prodi === criteria.prodi;

    return matchSearch && matchTahun && matchJurusan && matchProdi;
  });
};

// ============ Reset (for testing) ============

export const resetDataStore = (): void => {
  masterDataStore = [];
  filledDataStore = [];
};
