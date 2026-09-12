/**
 * Dosen Context (SSOT - Single Source of Truth)
 * Central state management for all Dosen entities, Tridharma sub-modules,
 * 20-Day Soft Delete Archival, and OR-Recovery Logic.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { INITIAL_DOSEN_DATA, type DosenItem } from '@/data/mockDosenData';
import { INITIAL_KONTRIBUSI_DOSEN_DATA, type KontribusiDosenItem } from '@/data/mockKontribusiDosenData';
import { INITIAL_PENELITIAN_DOSEN_DATA, type KontribusiPenelitianDosenItem } from '@/data/mockPenelitianDosenData';
import { INITIAL_PENGABDIAN_DOSEN_DATA, type KontribusiPengabdianDosenItem } from '@/data/mockPengabdianDosenData';
import { INITIAL_WAKTU_MENGAJAR_DATA, type WaktuMengajarItem } from '@/data/mockWaktuMengajarData';
import { INITIAL_DOSEN_LUARAN_DATA, type DosenLuaranItem } from '@/data/mockLuaranPenelitianPkmData';
import { INITIAL_TENAGA_KEPENDIDIKAN_DATA, type TenagaKependidikanItem } from '@/data/mockTenagaKependidikanData';
import { dosenRepository } from '@/repositories/dosen.repository';
import { useAlumni } from '@/contexts/AlumniContext';

// Local storage keys
const STORAGE_KEYS = {
  MASTER: 'arsipmhs_ssot_dosen_master',
  PENGAJARAN: 'arsipmhs_ssot_dosen_pengajaran',
  PENELITIAN: 'arsipmhs_ssot_dosen_penelitian',
  PENGABDIAN: 'arsipmhs_ssot_dosen_pengabdian',
  WAKTU_MENGAJAR: 'arsipmhs_ssot_dosen_waktu_mengajar',
  LUARAN: 'arsipmhs_ssot_dosen_luaran',
  TENDIK: 'arsipmhs_ssot_tendik_master',
  ARCHIVE: 'arsipmhs_ssot_dosen_archives',
};

const PURGE_FLAG_KEY = 'arsipmhs_dataset_populated_v7';

// Automatically sync rich initial dataset on startup
if (typeof window !== 'undefined') {
  try {
    if (localStorage.getItem(PURGE_FLAG_KEY) !== 'true') {
      Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
      localStorage.removeItem('tendik_master_data');
      localStorage.setItem(PURGE_FLAG_KEY, 'true');
    }
  } catch (e) {
    // Ignore storage access errors
  }
}


export interface ArchivedDosenItem {
  id: string; // archive id
  dosen: DosenItem;
  kontribusiPengajaran?: KontribusiDosenItem;
  kontribusiPenelitian?: KontribusiPenelitianDosenItem;
  kontribusiPengabdian?: KontribusiPengabdianDosenItem;
  waktuMengajar?: WaktuMengajarItem;
  luaran?: DosenLuaranItem;
  deletedAt: string; // ISO String
  expiresAt: string; // ISO String (deletedAt + 20 days)
}

export interface RecoveryMatchResult {
  match: boolean;
  matchedBy: 'both' | 'nidn' | 'nama';
  item: ArchivedDosenItem;
}

export function getRemainingDays(expiresAt: string): number {
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
}

const AVATAR_PALETTE = [
  'from-blue-600 to-indigo-600',
  'from-emerald-600 to-teal-600',
  'from-violet-600 to-purple-600',
  'from-amber-600 to-orange-600',
  'from-cyan-600 to-blue-600',
  'from-rose-600 to-pink-600',
  'from-fuchsia-600 to-purple-600',
];

interface DosenContextState {
  dosenList: DosenItem[];
  kontribusiPengajaranList: KontribusiDosenItem[];
  kontribusiPenelitianList: KontribusiPenelitianDosenItem[];
  kontribusiPengabdianList: KontribusiPengabdianDosenItem[];
  waktuMengajarList: WaktuMengajarItem[];
  luaranList: DosenLuaranItem[];
  tendikList: TenagaKependidikanItem[];
  archivedDosenList: ArchivedDosenItem[];
  isLoading: boolean;
  isDbConnected: boolean | null;
}

interface DosenContextActions {
  // Master SSOT Operations
  refreshFromDatabase: () => Promise<void>;
  addDosen: (dosenInput: Partial<DosenItem>) => Promise<{ success: boolean; isRestored?: boolean; message?: string }>;
  updateDosenProfile: (nidn: string, updated: Partial<DosenItem>) => Promise<void>;
  deleteDosen: (nidn: string) => Promise<void>;
  
  // Archival & Recovery Operations
  restoreDosen: (nidn: string, overrideData?: Partial<DosenItem>) => Promise<void>;
  permanentlyDeleteArchivedDosen: (nidn: string) => Promise<void>;
  checkArchiveRecovery: (nama: string, nidn: string) => RecoveryMatchResult | null;

  // Sub-module Direct Setters
  setDosenList: React.Dispatch<React.SetStateAction<DosenItem[]>>;
  updateKontribusiPengajaran: (nidn: string, data: KontribusiDosenItem) => Promise<void>;
  updateKontribusiPenelitian: (nidn: string, data: KontribusiPenelitianDosenItem) => Promise<void>;
  updateKontribusiPengabdian: (nidn: string, data: KontribusiPengabdianDosenItem) => Promise<void>;
  updateWaktuMengajar: (nidn: string, data: WaktuMengajarItem) => Promise<void>;
  deleteWaktuMengajar: (nidn: string, tahunAkademik: string) => Promise<boolean>;
  updateLuaran: (nidn: string, data: DosenLuaranItem) => Promise<void>;

  // Tenaga Kependidikan Operations
  addTendik: (tendik: Partial<TenagaKependidikanItem>) => Promise<void>;
  updateTendik: (id: string, updated: Partial<TenagaKependidikanItem>) => Promise<void>;
  deleteTendik: (id: string) => Promise<void>;
  setTendikList: React.Dispatch<React.SetStateAction<TenagaKependidikanItem[]>>;

  // Reset to initial mock dataset
  resetAllDosenData: () => void;
}

type DosenContextType = DosenContextState & DosenContextActions;

const DosenContext = createContext<DosenContextType | undefined>(undefined);

// Helper for storage load with fallback
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.warn(`Failed to read localStorage for key ${key}:`, err);
  }
  return fallback;
}

// Clean name helper for recovery matching
function cleanNameForMatch(name: string): string {
  return name
    .toLowerCase()
    .replace(/^(dr\.|prof\.|ir\.|dra\.|drs\.)\s+/gi, '')
    .replace(/,\s*[a-z.\s]+$/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

export const DosenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loggedInAdmin } = useAlumni();
  const [isLoading, setIsLoading] = useState(true);
  const [isDbConnected, setIsDbConnected] = useState<boolean | null>(null);

  const [dosenList, setDosenList] = useState<DosenItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.MASTER, INITIAL_DOSEN_DATA)
  );

  const [kontribusiPengajaranList, setKontribusiPengajaranList] = useState<KontribusiDosenItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.PENGAJARAN, INITIAL_KONTRIBUSI_DOSEN_DATA)
  );

  const [kontribusiPenelitianList, setKontribusiPenelitianList] = useState<KontribusiPenelitianDosenItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.PENELITIAN, INITIAL_PENELITIAN_DOSEN_DATA)
  );

  const [kontribusiPengabdianList, setKontribusiPengabdianList] = useState<KontribusiPengabdianDosenItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.PENGABDIAN, INITIAL_PENGABDIAN_DOSEN_DATA)
  );

  const [waktuMengajarList, setWaktuMengajarList] = useState<WaktuMengajarItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.WAKTU_MENGAJAR, INITIAL_WAKTU_MENGAJAR_DATA)
  );

  const [luaranList, setLuaranList] = useState<DosenLuaranItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.LUARAN, INITIAL_DOSEN_LUARAN_DATA)
  );

  const [tendikList, setTendikList] = useState<TenagaKependidikanItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.TENDIK, INITIAL_TENAGA_KEPENDIDIKAN_DATA)
  );

  const [archivedDosenList, setArchivedDosenList] = useState<ArchivedDosenItem[]>(() => {
    const raw = loadFromStorage<ArchivedDosenItem[]>(STORAGE_KEYS.ARCHIVE, []);
    // Filter out expired archives on init (Auto-purge > 20 days)
    return raw.filter((item) => new Date(item.expiresAt).getTime() > Date.now());
  });

  // Fetch live SSOT data directly from MySQL database
  const refreshFromDatabase = useCallback(async () => {
    try {
      const res = await dosenRepository.getAllDosenData();
      if (res.success && res.data) {
        setIsDbConnected(true);
        setDosenList(res.data.dosenList ?? []);
        setKontribusiPengajaranList(res.data.kontribusiPengajaranList ?? []);
        setKontribusiPenelitianList(res.data.kontribusiPenelitianList ?? []);
        setKontribusiPengabdianList(res.data.kontribusiPengabdianList ?? []);
        setWaktuMengajarList(res.data.waktuMengajarList ?? []);
        setLuaranList(res.data.luaranList ?? []);
        setTendikList(res.data.tendikList ?? []);
        setArchivedDosenList(res.data.archivedDosenList ?? []);
      } else {
        setIsDbConnected(false);
      }
    } catch (e) {
      console.warn('Database fetch failed, keeping local state:', e);
      setIsDbConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load from MySQL Database
  useEffect(() => {
    if (loggedInAdmin) void refreshFromDatabase();
  }, [loggedInAdmin, refreshFromDatabase]);

  useEffect(() => {
    const refresh = () => { if (loggedInAdmin) void refreshFromDatabase(); };
    window.addEventListener('dosen:refresh', refresh);
    return () => window.removeEventListener('dosen:refresh', refresh);
  }, [loggedInAdmin, refreshFromDatabase]);

  // 1. ADD DOSEN (Master SSOT) & Auto-Sync Clean State to all sub-modules
  const addDosen = useCallback(
    async (dosenInput: Partial<DosenItem>): Promise<{ success: boolean; isRestored?: boolean; message?: string }> => {
      const nidn = (dosenInput.nidn || '').trim();
      const nama = (dosenInput.nama || '').trim();

      if (!nidn || !nama) {
        return { success: false, message: 'Nama dan NIDN wajib diisi.' };
      }

      // Check if NIDN already exists in active list
      const existing = dosenList.find((d) => d.nidn === nidn);
      if (existing) {
        return { success: false, message: `Dosen dengan NIDN ${nidn} sudah terdaftar aktif.` };
      }

      // Pick random avatar color
      const avatarColor = AVATAR_PALETTE[Math.floor(Math.random() * AVATAR_PALETTE.length)];

      const newDosen: DosenItem = {
        nidn,
        nama,
        statusDosen: dosenInput.statusDosen || 'Tetap',
        jabatan: dosenInput.jabatan || 'Asisten Ahli',
        peran: dosenInput.peran || 'Akademisi',
        institusi: dosenInput.institusi || 'Politeknik Negeri Semarang',
        pendidikanPascaSarjana: dosenInput.pendidikanPascaSarjana || ['Magister (S2)'],
        bidangKeahlian: dosenInput.bidangKeahlian || 'Administrasi Bisnis',
        sertifikatPendidik: dosenInput.sertifikatPendidik || '-',
        sertifikatKompetensi: dosenInput.sertifikatKompetensi || '-',
        email: dosenInput.email || `${nidn}@polines.ac.id`,
        telepon: dosenInput.telepon || '081234567890',
        pengajaran: 0,
        penelitian: 0,
        pengabdian: 0,
      };

      // 1. Master List
      setDosenList((prev) => [newDosen, ...prev]);

      // 2. Kontribusi Pengajaran (Clean State)
      setKontribusiPengajaranList((prev) => [
        {
          nidn,
          nama,
          avatarColor,
          matkulABT: [],
          matkulPSLain: [],
          bahanAjar: [],
          bimbingan: {
            psABT: { ps: 0, ps1: 0, ps2: 0 },
            psLain: { ps: 0, ps1: 0, ps2: 0 },
          },
          rataBimbingan: 0,
          rekognisi: [],
        },
        ...prev,
      ]);

      // 3. Kontribusi Penelitian (Clean State)
      setKontribusiPenelitianList((prev) => [
        {
          nidn,
          nama,
          avatarColor,
          penelitian: [],
          rekognisi: [],
        },
        ...prev,
      ]);

      // 4. Kontribusi Pengabdian (Clean State)
      setKontribusiPengabdianList((prev) => [
        {
          nidn,
          nama,
          avatarColor,
          pkm: [],
          rekognisi: [],
        },
        ...prev,
      ]);

      // 5. Waktu Mengajar / EWMP (Clean State)
      setWaktuMengajarList((prev) => [
        {
          nidn,
          nama,
          jabatan: newDosen.jabatan,
          statusDosen: newDosen.statusDosen,
          avatarColor,
          tahunAkademik: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
          sksPendidikanPS: 0,
          sksPendidikanPSLain: 0,
          sksPendidikanPTLain: 0,
          sksPenelitian: 0,
          sksPengabdian: 0,
          sksTugasTambahan: 0,
        },
        ...prev,
      ]);

      // 6. Luaran Penelitian/PKM (Clean State)
      setLuaranList((prev) => [
        {
          nidn,
          nama,
          avatarColor,
          luaran: [],
        },
        ...prev,
      ]);

      // If this NIDN existed in archives, remove it
      setArchivedDosenList((prev) => prev.filter((a) => a.dosen.nidn !== nidn));

      const result = await dosenRepository.syncDosenData('create_dosen', newDosen);
      if (!result.success) {
        await refreshFromDatabase();
        return { success: false, message: result.error || 'Gagal menyimpan dosen ke database.' };
      }

      return { success: true, message: `Dosen ${nama} berhasil ditambahkan ke master data.` };
    },
    [dosenList, refreshFromDatabase]
  );

  // 2. UPDATE DOSEN PROFILE (Master SSOT) & Synchronize across sub-modules
  const updateDosenProfile = useCallback(async (nidn: string, updated: Partial<DosenItem>) => {
    const targetNidn = (updated.nidn && updated.nidn.trim()) ? updated.nidn.trim() : nidn;

    setDosenList((prev) =>
      prev.map((d) => (d.nidn === nidn ? { ...d, ...updated, nidn: targetNidn } : d))
    );

    // Sync updated NIDN, name, status, and jabatan to all sub-modules
    setKontribusiPengajaranList((prev) =>
      prev.map((item) =>
        item.nidn === nidn
          ? { ...item, nidn: targetNidn, nama: updated.nama || item.nama }
          : item
      )
    );

    setKontribusiPenelitianList((prev) =>
      prev.map((item) =>
        item.nidn === nidn
          ? { ...item, nidn: targetNidn, nama: updated.nama || item.nama }
          : item
      )
    );

    setKontribusiPengabdianList((prev) =>
      prev.map((item) =>
        item.nidn === nidn
          ? { ...item, nidn: targetNidn, nama: updated.nama || item.nama }
          : item
      )
    );

    setLuaranList((prev) =>
      prev.map((item) =>
        item.nidn === nidn
          ? { ...item, nidn: targetNidn, nama: updated.nama || item.nama }
          : item
      )
    );

    setWaktuMengajarList((prev) =>
      prev.map((item) => {
        if (item.nidn === nidn) {
          return {
            ...item,
            nidn: targetNidn,
            nama: updated.nama || item.nama,
            jabatan: updated.jabatan || item.jabatan,
            statusDosen: updated.statusDosen || item.statusDosen,
          };
        }
        return item;
      })
    );
    const result = await dosenRepository.syncDosenData('update_dosen', { ...dosenList.find((item) => item.nidn === nidn), ...updated, nidn: targetNidn }, nidn);
    if (!result.success) await refreshFromDatabase();
  }, [dosenList, refreshFromDatabase]);

  // 3. DELETE DOSEN (Soft Delete 20 Days Archival)
  const deleteDosen = useCallback(
    async (nidn: string) => {
      const dosen = dosenList.find((d) => d.nidn === nidn);
      if (!dosen) return;

      const pengajaran = kontribusiPengajaranList.find((d) => d.nidn === nidn);
      const penelitian = kontribusiPenelitianList.find((d) => d.nidn === nidn);
      const pengabdian = kontribusiPengabdianList.find((d) => d.nidn === nidn);
      const waktuMengajar = waktuMengajarList.find((d) => d.nidn === nidn);
      const luaran = luaranList.find((d) => d.nidn === nidn);

      const now = new Date();
      const expires = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000); // 20 days

      const archivedItem: ArchivedDosenItem = {
        id: `arch-${nidn}-${Date.now()}`,
        dosen: { ...dosen },
        kontribusiPengajaran: pengajaran ? JSON.parse(JSON.stringify(pengajaran)) : undefined,
        kontribusiPenelitian: penelitian ? JSON.parse(JSON.stringify(penelitian)) : undefined,
        kontribusiPengabdian: pengabdian ? JSON.parse(JSON.stringify(pengabdian)) : undefined,
        waktuMengajar: waktuMengajar ? JSON.parse(JSON.stringify(waktuMengajar)) : undefined,
        luaran: luaran ? JSON.parse(JSON.stringify(luaran)) : undefined,
        deletedAt: now.toISOString(),
        expiresAt: expires.toISOString(),
      };

      // Add to archive
      setArchivedDosenList((prev) => [archivedItem, ...prev.filter((a) => a.dosen.nidn !== nidn)]);

      // Remove from active lists
      setDosenList((prev) => prev.filter((d) => d.nidn !== nidn));
      setKontribusiPengajaranList((prev) => prev.filter((d) => d.nidn !== nidn));
      setKontribusiPenelitianList((prev) => prev.filter((d) => d.nidn !== nidn));
      setKontribusiPengabdianList((prev) => prev.filter((d) => d.nidn !== nidn));
      setWaktuMengajarList((prev) => prev.filter((d) => d.nidn !== nidn));
      setLuaranList((prev) => prev.filter((d) => d.nidn !== nidn));
      const result = await dosenRepository.syncDosenData('delete_dosen', {}, nidn);
      if (!result.success) await refreshFromDatabase();
    },
    [dosenList, kontribusiPengajaranList, kontribusiPenelitianList, kontribusiPengabdianList, waktuMengajarList, luaranList, refreshFromDatabase]
  );

  // 4. RESTORE DOSEN (Recovery)
  const restoreDosen = useCallback(
    async (nidn: string, overrideData?: Partial<DosenItem>) => {
      const archived = archivedDosenList.find((a) => a.dosen.nidn === nidn);
      if (!archived) return;

      const restoredDosen: DosenItem = {
        ...archived.dosen,
        ...(overrideData || {}),
      };

      // Restore to master and sub-modules
      setDosenList((prev) => [restoredDosen, ...prev.filter((d) => d.nidn !== nidn)]);

      if (archived.kontribusiPengajaran) {
        setKontribusiPengajaranList((prev) => [
          { ...archived.kontribusiPengajaran!, nama: restoredDosen.nama },
          ...prev.filter((d) => d.nidn !== nidn),
        ]);
      }

      if (archived.kontribusiPenelitian) {
        setKontribusiPenelitianList((prev) => [
          { ...archived.kontribusiPenelitian!, nama: restoredDosen.nama },
          ...prev.filter((d) => d.nidn !== nidn),
        ]);
      }

      if (archived.kontribusiPengabdian) {
        setKontribusiPengabdianList((prev) => [
          { ...archived.kontribusiPengabdian!, nama: restoredDosen.nama },
          ...prev.filter((d) => d.nidn !== nidn),
        ]);
      }

      if (archived.waktuMengajar) {
        setWaktuMengajarList((prev) => [
          {
            ...archived.waktuMengajar!,
            nama: restoredDosen.nama,
            jabatan: restoredDosen.jabatan,
            statusDosen: restoredDosen.statusDosen,
          },
          ...prev.filter((d) => d.nidn !== nidn),
        ]);
      }

      if (archived.luaran) {
        setLuaranList((prev) => [
          { ...archived.luaran!, nama: restoredDosen.nama },
          ...prev.filter((d) => d.nidn !== nidn),
        ]);
      }

      // Remove from archives
      setArchivedDosenList((prev) => prev.filter((a) => a.dosen.nidn !== nidn));
      const result = await dosenRepository.syncDosenData('restore_dosen', restoredDosen, nidn);
      if (!result.success) await refreshFromDatabase();
    },
    [archivedDosenList, refreshFromDatabase]
  );

  // 5. PERMANENTLY DELETE FROM ARCHIVE
  const permanentlyDeleteArchivedDosen = useCallback(async (nidn: string) => {
    setArchivedDosenList((prev) => prev.filter((a) => a.dosen.nidn !== nidn));
    const result = await dosenRepository.syncDosenData('permanent_delete_dosen', {}, nidn);
    if (!result.success) await refreshFromDatabase();
  }, [refreshFromDatabase]);

  // 6. CHECK ARCHIVE RECOVERY (Evaluation "OR" Logic)
  const checkArchiveRecovery = useCallback(
    (inputNama: string, inputNidn: string): RecoveryMatchResult | null => {
      const cleanNidn = inputNidn.trim();
      const cleanNama = cleanNameForMatch(inputNama);

      if (!cleanNidn && !cleanNama) return null;

      // Find active archived item (< 20 days)
      for (const item of archivedDosenList) {
        const isStillValid = new Date(item.expiresAt).getTime() > Date.now();
        if (!isStillValid) continue;

        const archNidn = item.dosen.nidn.trim();
        const archNama = cleanNameForMatch(item.dosen.nama);

        const matchNidn = cleanNidn.length > 0 && cleanNidn === archNidn;
        const matchNama = cleanNama.length > 0 && cleanNama === archNama;

        if (matchNidn && matchNama) {
          return { match: true, matchedBy: 'both', item };
        }
        if (matchNidn) {
          return { match: true, matchedBy: 'nidn', item };
        }
        if (matchNama) {
          return { match: true, matchedBy: 'nama', item };
        }
      }

      return null;
    },
    [archivedDosenList]
  );

  // 7. SUB-MODULE DIRECT SETTERS
  const updateKontribusiPengajaran = useCallback(async (nidn: string, data: KontribusiDosenItem) => {
    setKontribusiPengajaranList((prev) =>
      prev.map((item) => (item.nidn === nidn ? data : item))
    );
    const result = await dosenRepository.syncDosenData('update_pengajaran', data, nidn);
    if (!result.success) await refreshFromDatabase();
  }, [refreshFromDatabase]);

  const updateKontribusiPenelitian = useCallback(async (nidn: string, data: KontribusiPenelitianDosenItem) => {
    setKontribusiPenelitianList((prev) =>
      prev.map((item) => (item.nidn === nidn ? data : item))
    );
    const result = await dosenRepository.syncDosenData('update_penelitian', data, nidn);
    if (!result.success) await refreshFromDatabase();
  }, [refreshFromDatabase]);

  const updateKontribusiPengabdian = useCallback(async (nidn: string, data: KontribusiPengabdianDosenItem) => {
    setKontribusiPengabdianList((prev) =>
      prev.map((item) => (item.nidn === nidn ? data : item))
    );
    const result = await dosenRepository.syncDosenData('update_pengabdian', data, nidn);
    if (!result.success) await refreshFromDatabase();
  }, [refreshFromDatabase]);

  const updateWaktuMengajar = useCallback(async (nidn: string, data: WaktuMengajarItem) => {
    setWaktuMengajarList((prev) =>
      prev.map((item) => (item.nidn === nidn && item.tahunAkademik === data.tahunAkademik ? data : item))
    );
    const result = await dosenRepository.syncDosenData('update_waktu_mengajar', data, nidn);
    if (!result.success) await refreshFromDatabase();
  }, [refreshFromDatabase]);

  const deleteWaktuMengajar = useCallback(async (nidn: string, tahunAkademik: string): Promise<boolean> => {
    const result = await dosenRepository.syncDosenData('delete_waktu_mengajar', { tahunAkademik }, nidn);
    await refreshFromDatabase();
    return result.success;
  }, [refreshFromDatabase]);

  const updateLuaran = useCallback(async (nidn: string, data: DosenLuaranItem) => {
    setLuaranList((prev) =>
      prev.map((item) => (item.nidn === nidn ? data : item))
    );
    const result = await dosenRepository.syncDosenData('update_luaran', data, nidn);
    if (!result.success) await refreshFromDatabase();
  }, [refreshFromDatabase]);

  // 8. TENAGA KEPENDIDIKAN ACTIONS
  const addTendik = useCallback(async (tendikInput: Partial<TenagaKependidikanItem>) => {
    const newTendik: TenagaKependidikanItem = {
      id: tendikInput.id || `tendik-${Date.now()}`,
      nama: tendikInput.nama || '',
      nip: tendikInput.nip || '',
      status: tendikInput.status || 'Tetap',
      jabatan: tendikInput.jabatan || '',
      golongan: tendikInput.golongan || '-',
      pendidikanD3: tendikInput.pendidikanD3 || '',
      pendidikanS1: tendikInput.pendidikanS1 || '',
      pendidikanS2: tendikInput.pendidikanS2 || '',
      pendidikanS3: tendikInput.pendidikanS3 || '',
      sertifikatKompetensi: tendikInput.sertifikatKompetensi || [],
    };
    setTendikList((prev) => [newTendik, ...prev]);
    const result = await dosenRepository.syncDosenData('create_tendik', newTendik);
    if (!result.success) await refreshFromDatabase();
  }, [refreshFromDatabase]);

  const updateTendik = useCallback(async (id: string, updated: Partial<TenagaKependidikanItem>) => {
    setTendikList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
    const current = tendikList.find((item) => item.id === id);
    const result = await dosenRepository.syncDosenData('update_tendik', { ...current, ...updated, id });
    if (!result.success) await refreshFromDatabase();
  }, [tendikList, refreshFromDatabase]);

  const deleteTendik = useCallback(async (id: string) => {
    setTendikList((prev) => prev.filter((item) => item.id !== id));
    const result = await dosenRepository.syncDosenData('delete_tendik', { id });
    if (!result.success) await refreshFromDatabase();
  }, [refreshFromDatabase]);

  // 9. RESET ALL DOSEN DATA (Debug / Development helper)
  const resetAllDosenData = useCallback(() => {
    setDosenList(INITIAL_DOSEN_DATA);
    setKontribusiPengajaranList(INITIAL_KONTRIBUSI_DOSEN_DATA);
    setKontribusiPenelitianList(INITIAL_PENELITIAN_DOSEN_DATA);
    setKontribusiPengabdianList(INITIAL_PENGABDIAN_DOSEN_DATA);
    setWaktuMengajarList(INITIAL_WAKTU_MENGAJAR_DATA);
    setLuaranList(INITIAL_DOSEN_LUARAN_DATA);
    setTendikList(INITIAL_TENAGA_KEPENDIDIKAN_DATA);
    setArchivedDosenList([]);
    localStorage.removeItem(STORAGE_KEYS.MASTER);
    localStorage.removeItem(STORAGE_KEYS.PENGAJARAN);
    localStorage.removeItem(STORAGE_KEYS.PENELITIAN);
    localStorage.removeItem(STORAGE_KEYS.PENGABDIAN);
    localStorage.removeItem(STORAGE_KEYS.WAKTU_MENGAJAR);
    localStorage.removeItem(STORAGE_KEYS.LUARAN);
    localStorage.removeItem(STORAGE_KEYS.TENDIK);
    localStorage.removeItem(STORAGE_KEYS.ARCHIVE);
  }, []);

  const value = useMemo(
    () => ({
      dosenList,
      kontribusiPengajaranList,
      kontribusiPenelitianList,
      kontribusiPengabdianList,
      waktuMengajarList,
      luaranList,
      tendikList,
      archivedDosenList,
      isLoading,
      isDbConnected,
      refreshFromDatabase,
      addDosen,
      updateDosenProfile,
      deleteDosen,
      restoreDosen,
      permanentlyDeleteArchivedDosen,
      checkArchiveRecovery,
      setDosenList,
      updateKontribusiPengajaran,
      updateKontribusiPenelitian,
      updateKontribusiPengabdian,
      updateWaktuMengajar,
      deleteWaktuMengajar,
      updateLuaran,
      addTendik,
      updateTendik,
      deleteTendik,
      setTendikList,
      resetAllDosenData,
    }),
    [
      dosenList,
      kontribusiPengajaranList,
      kontribusiPenelitianList,
      kontribusiPengabdianList,
      waktuMengajarList,
      luaranList,
      tendikList,
      archivedDosenList,
      isLoading,
      isDbConnected,
      refreshFromDatabase,
      addDosen,
      updateDosenProfile,
      deleteDosen,
      restoreDosen,
      permanentlyDeleteArchivedDosen,
      checkArchiveRecovery,
      updateKontribusiPengajaran,
      updateKontribusiPenelitian,
      updateKontribusiPengabdian,
      updateWaktuMengajar,
      deleteWaktuMengajar,
      updateLuaran,
      addTendik,
      updateTendik,
      deleteTendik,
      resetAllDosenData,
    ]
  );

  return <DosenContext.Provider value={value}>{children}</DosenContext.Provider>;
};

export const useDosen = (): DosenContextType => {
  const context = useContext(DosenContext);
  if (!context) {
    throw new Error('useDosen must be used within a DosenProvider');
  }
  return context;
};
