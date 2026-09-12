/**
 * Alumni Context (Refactored)
 * State management for alumni data with NIM + password authentication
 * Supports both admin and student roles
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AlumniMaster, AlumniData } from '@/types';
import type { StudentProfile, StudentAccountInput, AdminProfile, DeveloperProfile, StudentStatus, StudentStatusMode, UserRole, DosenProfile, TendikProfile } from '@/types/student.types';
import { loginAdmin, loginStudent, login as apiLogin, logout as apiLogout } from '@/services/api-auth.service';
import { getSystemSettings, updateSystemSetting } from '@/services/settings.service';
import {
  getAllStudentsFromAPI,
  getTracerStudyFromAPI,
  createStudentViaAPI,
  updateStudentViaAPI,
  deleteStudentViaAPI,
  resetStudentPasswordViaAPI,
  type Student as ApiStudent,
  type TracerStudy as ApiTracerStudy,
} from '@/repositories/api-student.repository';
import {
  sandboxSession,
  setupSandboxSync,
  teardownSandboxSync,
  syncDemoFromProduction,
  resetDemoChanges,
  type DemoSessionState,
  type SandboxConflictEvent,
} from '@/lib/sandbox';

// ============ Context Types ============

interface AlumniContextState {
  // Selected alumni (validation flow - legacy)
  selectedAlumni: AlumniMaster | null;
  
  // Logged in student (new NIM + password flow)
  loggedInStudent: StudentProfile | null;
  
  // Logged in admin
  loggedInAdmin: AdminProfile | null;
  
  // Logged in developer
  loggedInDeveloper: DeveloperProfile | null;

  // Logged in demo mode
  loggedInDemo: AdminProfile | null;
  isDemoMode: boolean;
  demoSyncState: DemoSessionState;

  // Logged in dosen
  loggedInDosen: DosenProfile | null;

  // Logged in tendik
  loggedInTendik: TendikProfile | null;

  // Session hydration status
  sessionHydrated: boolean;
  
  // Student accounts (for admin management)
  studentAccounts: StudentProfile[];
  
  // Data stores
  alumniData: AlumniData[];
  masterData: AlumniMaster[];
  
  // Theme
  darkMode: boolean;
  
  // Loading states
  isLoading: boolean;

  // System settings
  dosenModuleEnabled: boolean;
}

interface AlumniContextActions {
  // Alumni selection (legacy)
  setSelectedAlumni: (alumni: AlumniMaster | null) => void;
  
  // Student authentication
  loginWithCredentials: (nim: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  
  // Admin authentication
  loginAsAdmin: (username: string, password: string) => Promise<AuthResult>;
  logoutAdmin: () => void;

  // Developer authentication
  logoutDeveloper: () => void;

  // Demo mode authentication & sync
  logoutDemo: () => void;
  syncDemoFromProduction: (force?: boolean) => Promise<{ success: boolean; conflicts: SandboxConflictEvent[]; error?: string }>;
  resetDemoChanges: () => Promise<void>;

  // Dosen authentication & profile
  logoutDosen: () => void;
  mergeLoggedInDosen: (updates: Partial<DosenProfile>) => void;

  // Tendik authentication & profile
  logoutTendik: () => void;
  mergeLoggedInTendik: (updates: Partial<TendikProfile>) => void;
  
  /** Login satu form: identifier (username/NIM, huruf/angka, case-insensitive), redirect by role */
  login: (identifier: string, password: string) => Promise<AuthResult>;
  
  // Student account management (admin)
  addStudentAccount: (data: StudentAccountInput) => Promise<{ success: boolean; error?: string }>;
  deleteStudentAccount: (studentId: string) => Promise<{ success: boolean; error?: string }>;
  updateStudentAccount: (studentId: string, updates: Partial<StudentProfile>) => Promise<{ success: boolean; error?: string }>;
  resetStudentPassword: (studentId: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  
  // Data operations
  addAlumniData: (data: AlumniData) => void;
  updateAlumniData: (id: string, data: Partial<AlumniData>) => void;
  deleteAlumniData: (id: string) => void;
  getAlumniDataByMasterId: (masterId: string) => AlumniData[];
  searchAlumni: (nama: string, tahunLulus: number) => AlumniMaster[];
  refreshData: () => Promise<void>;
  /** Merge updates into the logged-in student (e.g. after email verification) and persist to session */
  mergeLoggedInStudent: (updates: Partial<StudentProfile>) => void;

  // Theme
  toggleDarkMode: () => void;

  // Settings
  refreshSystemSettings: () => Promise<void>;
  updateDosenModuleEnabled: (enabled: boolean) => Promise<boolean>;
}

type AlumniContextType = AlumniContextState & AlumniContextActions;

interface AuthResult {
  success: boolean;
  student?: StudentProfile;
  admin?: AdminProfile;
  developer?: DeveloperProfile;
  demo?: AdminProfile;
  dosen?: DosenProfile;
  tendik?: TendikProfile;
  role?: UserRole;
  error?: string;
}

// ============ Context Creation ============

const AlumniContext = createContext<AlumniContextType | undefined>(undefined);
const ADMIN_SESSION_KEY = 'sipal-admin-session';
const STUDENT_SESSION_KEY = 'sipal-student-session';
const DEV_SESSION_KEY = 'sipal-dev-session';
const DEMO_SESSION_KEY = 'sipal-demo-session';
const DOSEN_SESSION_KEY = 'sipal-dosen-session';
const TENDIK_SESSION_KEY = 'sipal-tendik-session';
const AUTH_TOKEN_KEY = 'authToken';

// ============ Provider Component ============

interface AlumniProviderProps {
  children: React.ReactNode;
}

function parseJsonField<T = Record<string, unknown>>(value: unknown): T | undefined {
  if (!value) return undefined;
  if (typeof value === 'object') return value as T;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function mapCareerStatus(status?: string): AlumniData['status'] {
  switch (status) {
    case 'working':
      return 'bekerja';
    case 'job_seeking':
      return 'mencari';
    case 'entrepreneur':
      return 'wirausaha';
    case 'further_study':
      return 'studi';
    default:
      return 'mencari';
  }
}

function mapStudentToProfile(student: ApiStudent): StudentProfile {
  const statusManual = (student.status || 'active') as StudentStatus;
  const statusModeRaw = (student.status_mode || 'manual') as string;
  const statusMode: StudentStatusMode = statusModeRaw === 'auto' ? 'auto' : 'manual';
  const statusEffectiveRaw = (student.status_effective || student.status || 'active') as string;
  const statusEffective = statusEffectiveRaw as StudentStatus;

  return {
    id: student.id,
    nama: student.nama,
    nim: student.nim,
    jurusan: (student.jurusan || 'Administrasi Bisnis') as StudentProfile['jurusan'],
    prodi: (student.prodi || 'Administrasi Bisnis Terapan') as StudentProfile['prodi'],
    status: statusEffective,
    statusMode,
    statusManual,
    tahunMasuk: Number(student.tahun_masuk),
    tahunLulus: student.tahun_lulus ? Number(student.tahun_lulus) : undefined,
    email: student.email || undefined,
    loginEmail: student.login_email || undefined,
    pendingLoginEmail: student.pending_login_email || undefined,
    isEmailLoginEnabled: Boolean(student.is_email_login_enabled),
    emailVerifiedAt: student.email_verified_at ? new Date(student.email_verified_at) : undefined,
    isFirstLogin: Boolean(student.is_first_login),
    noHp: student.no_hp || undefined,
    alamat: student.alamat || undefined,
    hasCredentials: Boolean(student.has_credentials),
    lastLogin: student.last_login ? new Date(student.last_login) : undefined,
    createdAt: student.created_at ? new Date(student.created_at) : new Date(),
    updatedAt: student.updated_at ? new Date(student.updated_at) : new Date(),
  };
}

function mapStudentToMaster(student: ApiStudent): AlumniMaster {
  const tahunMasuk = Number(student.tahun_masuk);
  return {
    id: student.id,
    nama: student.nama,
    nim: student.nim,
    jurusan: student.jurusan || 'Administrasi Bisnis',
    prodi: student.prodi || 'Administrasi Bisnis Terapan',
    tahunLulus: student.tahun_lulus ? Number(student.tahun_lulus) : tahunMasuk + 4,
  };
}

function mapTracerToAlumniData(tracer: ApiTracerStudy): AlumniData {
  const status = mapCareerStatus(tracer.career_status);
  const employment = parseJsonField<Record<string, unknown>>(tracer.employment_data);
  const jobSeeking = parseJsonField<Record<string, unknown>>(tracer.job_seeking_data);
  const entrepreneurship = parseJsonField<Record<string, unknown>>(tracer.entrepreneurship_data);
  const furtherStudy = parseJsonField<Record<string, unknown>>(tracer.further_study_data);
  
  const base: AlumniData = {
    id: tracer.id,
    alumniMasterId: tracer.student_id,
    status,
    tahunPengisian: tracer.tahun_pengisian ? Number(tracer.tahun_pengisian) : new Date().getFullYear(),
    email: tracer.email || '',
    noHp: tracer.no_hp || '',
    mediaSosial: tracer.media_sosial || undefined,
    linkedin: tracer.linkedin || undefined,
    bersediaDihubungi: Boolean(tracer.bersedia_dihubungi),
    saranKomentar: tracer.saran_komentar || undefined,
    createdAt: tracer.created_at ? new Date(tracer.created_at) : new Date(),
  };
  
  if (status === 'bekerja' && employment) {
    return {
      ...base,
      namaPerusahaan: employment['nama_perusahaan'] as string | undefined,
      lokasiPerusahaan: employment['lokasi_perusahaan'] as string | undefined,
      bidangIndustri: employment['bidang_industri'] as string | undefined,
      jabatan: employment['jabatan'] as string | undefined,
      tahunMulaiKerja: employment['tahun_mulai_kerja'] as number | undefined,
      bulanMulaiKerja: employment['bulan_mulai_kerja'] as number | undefined,
      masihAktifKerja: employment['masih_aktif_kerja'] as boolean | undefined,
      kontakProfesional: employment['kontak_profesional'] as string | undefined,
      cakupanTempatKerja: employment['work_scope'] as string | undefined,
    };
  }
  
  if (status === 'wirausaha' && entrepreneurship) {
    const sosial = entrepreneurship['sosial_media_usaha'];
    return {
      ...base,
      namaUsaha: entrepreneurship['nama_usaha'] as string | undefined,
      jenisUsaha: entrepreneurship['jenis_usaha'] as string | undefined,
      lokasiUsaha: entrepreneurship['lokasi_usaha'] as string | undefined,
      tahunMulaiUsaha: entrepreneurship['tahun_mulai_usaha'] as number | undefined,
      bulanMulaiUsaha: entrepreneurship['bulan_mulai_usaha'] as number | undefined,
      punyaKaryawan: entrepreneurship['punya_karyawan'] as boolean | undefined,
      jumlahKaryawan: entrepreneurship['jumlah_karyawan'] as number | undefined,
      usahaAktif: entrepreneurship['usaha_aktif'] as boolean | undefined,
      cakupanTempatKerja: entrepreneurship['work_scope'] as string | undefined,
      sosialMediaUsaha: Array.isArray(sosial) ? (sosial as string[]) : undefined,
    };
  }
  
  if (status === 'studi' && furtherStudy) {
    return {
      ...base,
      namaKampus: furtherStudy['nama_kampus'] as string | undefined,
      programStudi: furtherStudy['program_studi'] as string | undefined,
      jenjang: furtherStudy['jenjang'] as AlumniData['jenjang'] | undefined,
      lokasiKampus: furtherStudy['lokasi_kampus'] as string | undefined,
      tahunMulaiStudi: furtherStudy['tahun_mulai_studi'] as number | undefined,
      masihAktifStudi: furtherStudy['masih_aktif_studi'] as boolean | undefined,
    };
  }
  
  if (status === 'mencari' && jobSeeking) {
    return {
      ...base,
      lokasiTujuan: jobSeeking['lokasi_tujuan'] as string | undefined,
      bidangDiincar: jobSeeking['bidang_diincar'] as string | undefined,
      lamaMencari: jobSeeking['lama_mencari'] as number | undefined,
    };
  }
  
  return base;
}

function getInitialStoredSession<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  const hasToken = Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
  if (!hasToken) return null;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

export function AlumniProvider({ children }: AlumniProviderProps) {
  // State with synchronous hydration from localStorage
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniMaster | null>(() => {
    const student = getInitialStoredSession<StudentProfile>(STUDENT_SESSION_KEY);
    if (student) {
      return {
        id: student.id,
        nama: student.nama,
        nim: student.nim,
        jurusan: student.jurusan,
        prodi: student.prodi,
        tahunLulus: student.tahunLulus ?? student.tahunMasuk + 4,
      };
    }
    return null;
  });
  const [loggedInStudent, setLoggedInStudent] = useState<StudentProfile | null>(() =>
    getInitialStoredSession<StudentProfile>(STUDENT_SESSION_KEY)
  );
  const [loggedInAdmin, setLoggedInAdmin] = useState<AdminProfile | null>(() => {
    const demo = getInitialStoredSession<AdminProfile>(DEMO_SESSION_KEY);
    if (demo) return demo;
    return getInitialStoredSession<AdminProfile>(ADMIN_SESSION_KEY);
  });
  const [loggedInDeveloper, setLoggedInDeveloper] = useState<DeveloperProfile | null>(() =>
    getInitialStoredSession<DeveloperProfile>(DEV_SESSION_KEY)
  );
  const [loggedInDemo, setLoggedInDemo] = useState<AdminProfile | null>(() =>
    getInitialStoredSession<AdminProfile>(DEMO_SESSION_KEY)
  );
  const [loggedInDosen, setLoggedInDosen] = useState<DosenProfile | null>(() =>
    getInitialStoredSession<DosenProfile>(DOSEN_SESSION_KEY)
  );
  const [loggedInTendik, setLoggedInTendik] = useState<TendikProfile | null>(() =>
    getInitialStoredSession<TendikProfile>(TENDIK_SESSION_KEY)
  );
  const [sessionHydrated, setSessionHydrated] = useState<boolean>(true);
  const [demoSyncState, setDemoSyncState] = useState<DemoSessionState>(sandboxSession.getState());
  const [studentAccounts, setStudentAccounts] = useState<StudentProfile[]>([]);
  const [masterData, setMasterData] = useState<AlumniMaster[]>([]);
  const [alumniData, setAlumniData] = useState<AlumniData[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('sipal-dark-mode') === 'true';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [dosenModuleEnabled, setDosenModuleEnabled] = useState<boolean>(true);

  useEffect(() => {
    return sandboxSession.subscribe((state) => {
      setDemoSyncState(state);
    });
  }, []);

  const clearSessionState = useCallback(() => {
    setLoggedInStudent(null);
    setLoggedInAdmin(null);
    setLoggedInDeveloper(null);
    setLoggedInDemo(null);
    setLoggedInDosen(null);
    setLoggedInTendik(null);
    setSelectedAlumni(null);
    localStorage.removeItem(STUDENT_SESSION_KEY);
    localStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem(DEV_SESSION_KEY);
    localStorage.removeItem(DEMO_SESSION_KEY);
    localStorage.removeItem(DOSEN_SESSION_KEY);
    localStorage.removeItem(TENDIK_SESSION_KEY);
    teardownSandboxSync();
    void sandboxSession.endSession();
  }, []);

  const refreshSystemSettings = useCallback(async () => {
    const settings = await getSystemSettings();
    if (settings && typeof settings.dosen_module_enabled !== 'undefined') {
      setDosenModuleEnabled(settings.dosen_module_enabled === 'true' || settings.dosen_module_enabled === '1');
    }
  }, []);

  const updateDosenModuleEnabled = useCallback(async (enabled: boolean): Promise<boolean> => {
    const val = enabled ? 'true' : 'false';
    const ok = await updateSystemSetting('dosen_module_enabled', val);
    if (ok) {
      setDosenModuleEnabled(enabled);
    }
    return ok;
  }, []);

  // Initialize dark mode class, settings, and demo sync from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('sipal-dark-mode');
    if (savedDarkMode === 'true') {
      document.documentElement.classList.add('dark');
    }

    refreshSystemSettings();
    
    const hasToken = Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
    if (!hasToken) {
      clearSessionState();
      setSessionHydrated(true);
      return;
    }

    const savedDemo = getInitialStoredSession<AdminProfile>(DEMO_SESSION_KEY);
    if (savedDemo) {
      setupSandboxSync();
    }
    setSessionHydrated(true);
  }, [clearSessionState, refreshSystemSettings]);

  useEffect(() => {
    const handleUnauthorized = (_event: Event) => {
      clearSessionState();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [clearSessionState]);

  useEffect(() => {
    if (!loggedInAdmin && !loggedInStudent && !loggedInDeveloper && !loggedInDemo && !loggedInDosen && !loggedInTendik) return;

    const hasToken = Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
    if (!hasToken) {
      clearSessionState();
    }
  }, [loggedInAdmin, loggedInStudent, loggedInDeveloper, loggedInDemo, loggedInDosen, loggedInTendik, clearSessionState]);

  // Theme toggle
  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('sipal-dark-mode', String(next));
      
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      return next;
    });
  }, []);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [studentsRes, tracerRes] = await Promise.all([
        getAllStudentsFromAPI(),
        getTracerStudyFromAPI(),
      ]);
      
      if (studentsRes.success && studentsRes.data) {
        const students = studentsRes.data.map(mapStudentToProfile);
        setStudentAccounts(students);
        setMasterData(studentsRes.data.map(mapStudentToMaster));
      } else {
        setStudentAccounts([]);
        setMasterData([]);
      }
      
      if (tracerRes.success && tracerRes.data) {
        setAlumniData(tracerRes.data.map(mapTracerToAlumniData));
      } else {
        setAlumniData([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load initial data (students + tracer) when admin OR student is logged in.
  // Admin: needed for admin dashboard. Student: needed so riwayat karir appears on dashboard and persists after refresh.
  useEffect(() => {
    if (!loggedInAdmin && !loggedInStudent) return;
    loadInitialData();
  }, [loggedInAdmin, loggedInStudent, loadInitialData]);

  // ============ Student Authentication Functions ============

  /**
   * Login with NIM and password (student)
   */
  const loginWithCredentials = useCallback(
    async (nim: string, password: string): Promise<AuthResult> => {
      setIsLoading(true);
      
      try {
        const response = await loginStudent(nim, password);
        
        if (!response.success || !response.data) {
          return {
            success: false,
            error: response.error || 'Login gagal'
          };
        }
        
        const studentData = response.data.user?.student as ApiStudent | null | undefined;
        if (!studentData) {
          return {
            success: false,
            error: 'Data mahasiswa tidak ditemukan'
          };
        }
        
        const studentProfile = mapStudentToProfile(studentData);
        const updatedStudent = { ...studentProfile, lastLogin: new Date() };
        setLoggedInStudent(updatedStudent);
        
        // Save session to localStorage
        localStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(updatedStudent));
        
        // Set selectedAlumni for compatibility
        const masterMatch = masterData.find(m => m.nim === nim) || mapStudentToMaster(studentData);
        setSelectedAlumni(masterMatch);
        
        return {
          success: true,
          student: updatedStudent,
          role: 'student'
        };
      } finally {
        setIsLoading(false);
      }
    },
    [masterData]
  );

  /**
   * Logout current student
   */
  const logout = useCallback(() => {
    setLoggedInStudent(null);
    setSelectedAlumni(null);
    apiLogout();
    localStorage.removeItem(STUDENT_SESSION_KEY);
  }, []);

  // ============ Admin Authentication Functions ============

  /**
   * Login as admin
   */
  const loginAsAdmin = useCallback(
    async (username: string, password: string): Promise<AuthResult> => {
      setIsLoading(true);
      
      try {
        const response = await loginAdmin(username, password);
        
        if (!response.success || !response.data) {
          return {
            success: false,
            error: response.error || 'Login admin gagal'
          };
        }
        
        const user = response.data.user;
        const adminProfile: AdminProfile = {
          id: user.id,
          username: user.username,
          nama: user.nama || user.name || user.username,
          passwordHash: '',
          role: 'admin',
          createdAt: new Date(),
          lastLogin: new Date(),
          canEditDosen: user.can_edit_dosen !== undefined ? Boolean(user.can_edit_dosen) : true,
          canEditMahasiswa: user.can_edit_mahasiswa !== undefined ? Boolean(user.can_edit_mahasiswa) : true,
        };
        
        setLoggedInAdmin(adminProfile);
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminProfile));
        
        return {
          success: true,
          admin: adminProfile,
          role: 'admin'
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Logout admin
   */
  const logoutAdmin = useCallback(() => {
    setLoggedInAdmin(null);
    apiLogout();
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }, []);

  const logoutDeveloper = useCallback(() => {
    setLoggedInDeveloper(null);
    apiLogout();
    localStorage.removeItem(DEV_SESSION_KEY);
  }, []);

  const logoutDemo = useCallback(() => {
    clearSessionState();
    apiLogout();
  }, [clearSessionState]);

  const logoutDosen = useCallback(() => {
    setLoggedInDosen(null);
    apiLogout();
    localStorage.removeItem(DOSEN_SESSION_KEY);
  }, []);

  const logoutTendik = useCallback(() => {
    setLoggedInTendik(null);
    apiLogout();
    localStorage.removeItem(TENDIK_SESSION_KEY);
  }, []);

  /**
   * Login satu form: identifier (username atau NIM, huruf/angka, case-insensitive).
   * Backend mengembalikan role; redirect ditangani di halaman (admin → /admin, student → /dashboard, developer → /developer/dashboard, demo → /admin/select-dashboard).
   */
  const login = useCallback(
    async (identifier: string, password: string): Promise<AuthResult> => {
      setIsLoading(true);
      try {
        const response = await apiLogin(identifier.trim(), password);
        if (!response.success || !response.data) {
          return {
            success: false,
            error: response.error || 'Username/NIM atau password salah',
          };
        }
        const user = response.data.user;
        const role = (user?.role ?? response.data.role) as UserRole;

        if (role === 'demo') {
          const sid = (response.data as any)?.sid || (response.data as any)?.user?.demo_session_id || `demo_${Date.now()}`;
          const demoProfile: AdminProfile = {
            id: user.id || 'demo-user',
            username: user.username || 'demo',
            nama: user.nama || user.name || 'Demo Administrator',
            passwordHash: '',
            role: 'demo' as any,
            createdAt: new Date(),
            lastLogin: new Date(),
            canEditDosen: true,
            canEditMahasiswa: true,
          };
          await sandboxSession.startSession(sid, demoProfile);
          setLoggedInDemo(demoProfile);
          setLoggedInAdmin(demoProfile);
          localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoProfile));
          setupSandboxSync();
          void syncDemoFromProduction(true);
          return { success: true, admin: demoProfile, demo: demoProfile, role: 'demo' };
        }

        if (role === 'developer') {
          const devProfile: DeveloperProfile = {
            id: user.id,
            username: user.username,
            nama: user.nama || user.name || user.username,
            role: 'developer',
            createdAt: new Date(),
            lastLogin: new Date(),
          };
          setLoggedInDeveloper(devProfile);
          localStorage.setItem(DEV_SESSION_KEY, JSON.stringify(devProfile));
          return { success: true, developer: devProfile, role: 'developer' };
        }

        if (role === 'admin') {
          const adminProfile: AdminProfile = {
            id: user.id,
            username: user.username,
            nama: user.nama || user.name || user.username,
            passwordHash: '',
            role: 'admin',
            createdAt: new Date(),
            lastLogin: new Date(),
            canEditDosen: user.can_edit_dosen !== undefined ? Boolean(user.can_edit_dosen) : true,
            canEditMahasiswa: user.can_edit_mahasiswa !== undefined ? Boolean(user.can_edit_mahasiswa) : true,
          };
          setLoggedInAdmin(adminProfile);
          localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminProfile));
          return { success: true, admin: adminProfile, role: 'admin' };
        }

        if (role === 'student') {
          const studentData = user?.student as ApiStudent | null | undefined;
          if (!studentData) {
            return { success: false, error: 'Data mahasiswa tidak ditemukan' };
          }
          const studentProfile = mapStudentToProfile(studentData);
          const updatedStudent = { ...studentProfile, lastLogin: new Date() };
          setLoggedInStudent(updatedStudent);
          localStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(updatedStudent));
          const masterMatch = masterData.find(m => m.nim === studentData.nim) || mapStudentToMaster(studentData);
          setSelectedAlumni(masterMatch);
          return { success: true, student: updatedStudent, role: 'student' };
        }

        if (role === 'dosen') {
          const dosenProfile = (user?.dosen || (response.data as any)?.user?.dosen) as DosenProfile | undefined;
          if (!dosenProfile) {
            return { success: false, error: 'Data dosen tidak ditemukan' };
          }
          setLoggedInDosen(dosenProfile);
          localStorage.setItem(DOSEN_SESSION_KEY, JSON.stringify(dosenProfile));
          return { success: true, dosen: dosenProfile, role: 'dosen' };
        }

        if (role === 'tendik') {
          const tendikProfile = (user?.tendik || (response.data as any)?.user?.tendik) as TendikProfile | undefined;
          if (!tendikProfile) {
            return { success: false, error: 'Data tenaga kependidikan tidak ditemukan' };
          }
          setLoggedInTendik(tendikProfile);
          localStorage.setItem(TENDIK_SESSION_KEY, JSON.stringify(tendikProfile));
          return { success: true, tendik: tendikProfile, role: 'tendik' };
        }

        return { success: false, error: 'Role tidak dikenali' };
      } finally {
        setIsLoading(false);
      }
    },
    [clearSessionState, masterData]
  );

  // ============ Admin Functions ============

  /**
   * Add new student account (admin only)
   */
  const addStudentAccount = useCallback(
    async (data: StudentAccountInput): Promise<{ success: boolean; error?: string }> => {
      const payload = {
        nim: data.nim,
        nama: data.nama,
        password: data.password,
        status: data.status,
        status_mode: data.statusMode,
        tahun_masuk: data.tahunMasuk,
        tahun_lulus: data.tahunLulus,
        email: data.email,
        no_hp: data.noHp,
        jurusan: 'Administrasi Bisnis',
        prodi: 'Administrasi Bisnis Terapan',
      };
      
      const response = await createStudentViaAPI(payload);
      if (!response.success || !response.data) {
        return { success: false, error: response.error || 'Gagal menambahkan mahasiswa' };
      }
      
      const newStudent = mapStudentToProfile(response.data);
      setStudentAccounts(prev => [...prev, newStudent]);
      setMasterData(prev => [...prev, mapStudentToMaster(response.data)]);
      
      return { success: true };
    },
    []
  );

  /**
   * Delete student account (admin only)
   */
  const deleteStudentAccount = useCallback(
    async (studentId: string): Promise<{ success: boolean; error?: string }> => {
      const response = await deleteStudentViaAPI(studentId);
      if (!response.success) {
        return { success: false, error: response.error || 'Gagal memindahkan mahasiswa ke Recycle Bin' };
      }
      
      setStudentAccounts(prev => prev.filter(s => s.id !== studentId));
      setMasterData(prev => prev.filter(m => m.id !== studentId));
      
      if (loggedInStudent?.id === studentId) {
        logout();
      }
      
      return { success: true };
    },
    [loggedInStudent, logout]
  );

  /**
   * Update student account (admin only)
   */
  const updateStudentAccount = useCallback(
    async (studentId: string, updates: Partial<StudentProfile>): Promise<{ success: boolean; error?: string }> => {
      const statusManual = (updates.statusManual ?? updates.status) as unknown as StudentStatus | undefined;
      const payload = {
        nim: updates.nim,
        nama: updates.nama,
        status: statusManual,
        status_mode: updates.statusMode,
        tahun_masuk: updates.tahunMasuk,
        tahun_lulus: updates.tahunLulus,
        email: updates.email,
        no_hp: updates.noHp,
        alamat: updates.alamat,
        jurusan: updates.jurusan,
        prodi: updates.prodi,
      };
      
      const response = await updateStudentViaAPI(studentId, payload);
      if (!response.success || !response.data) {
        return { success: false, error: response.error || 'Gagal memperbarui mahasiswa' };
      }
      
      const updatedStudent = mapStudentToProfile(response.data);
      
      setStudentAccounts(prev => prev.map(s => s.id === studentId ? updatedStudent : s));
      setMasterData(prev => prev.map(m => m.id === studentId ? mapStudentToMaster(response.data) : m));
      
      if (loggedInStudent?.id === studentId) {
        setLoggedInStudent(updatedStudent);
        localStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(updatedStudent));
      }
      
      return { success: true };
    },
    [loggedInStudent]
  );

  /**
   * Reset student password (admin only)
   */
  const resetStudentPassword = useCallback(
    async (studentId: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
      const response = await resetStudentPasswordViaAPI(studentId, newPassword);
      if (!response.success) {
        return { success: false, error: response.error || 'Gagal mereset password' };
      }
      
      return { success: true };
    },
    []
  );

  // ============ Legacy Functions ============

  // Add alumni data
  const addAlumniData = useCallback((data: AlumniData) => {
    setAlumniData((prev) => [...prev, data]);
  }, []);

  // Update alumni data
  const updateAlumniData = useCallback((id: string, updates: Partial<AlumniData>) => {
    setAlumniData((prev) => 
      prev.map((item) => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
  }, []);

  // Delete alumni data
  const deleteAlumniData = useCallback((id: string) => {
    setAlumniData((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Get alumni data by master ID
  const getAlumniDataByMasterId = useCallback(
    (masterId: string): AlumniData[] => {
      return alumniData.filter((d) => d.alumniMasterId === masterId);
    },
    [alumniData]
  );

  const mergeLoggedInStudent = useCallback((updates: Partial<StudentProfile>) => {
    setLoggedInStudent((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  const mergeLoggedInDosen = useCallback((updates: Partial<DosenProfile>) => {
    setLoggedInDosen((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem(DOSEN_SESSION_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  const mergeLoggedInTendik = useCallback((updates: Partial<TendikProfile>) => {
    setLoggedInTendik((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem(TENDIK_SESSION_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  // Search alumni
  const searchAlumni = useCallback(
    (nama: string, tahunLulus: number): AlumniMaster[] => {
      const namaLower = nama.toLowerCase().trim();
      return masterData.filter(
        (alumni) =>
          alumni.nama.toLowerCase().includes(namaLower) &&
          alumni.tahunLulus === tahunLulus
      );
    },
    [masterData]
  );

  // Context value
  const contextValue: AlumniContextType = {
    // State
    selectedAlumni,
    loggedInStudent,
    loggedInAdmin,
    loggedInDeveloper,
    loggedInDemo,
    loggedInDosen,
    loggedInTendik,
    sessionHydrated,
    isDemoMode: Boolean(loggedInDemo || demoSyncState.isActive),
    demoSyncState,
    studentAccounts,
    alumniData,
    masterData,
    darkMode,
    isLoading,
    dosenModuleEnabled,
    
    // Actions
    setSelectedAlumni,
    loginWithCredentials,
    logout,
    loginAsAdmin,
    logoutAdmin,
    logoutDeveloper,
    logoutDemo,
    logoutDosen,
    logoutTendik,
    syncDemoFromProduction,
    resetDemoChanges,
    login,
    addStudentAccount,
    deleteStudentAccount,
    updateStudentAccount,
    resetStudentPassword,
    addAlumniData,
    updateAlumniData,
    deleteAlumniData,
    getAlumniDataByMasterId,
    searchAlumni,
    toggleDarkMode,
    refreshData: loadInitialData,
    mergeLoggedInStudent,
    mergeLoggedInDosen,
    mergeLoggedInTendik,
    refreshSystemSettings,
    updateDosenModuleEnabled,
  };

  return (
    <AlumniContext.Provider value={contextValue}>
      {children}
    </AlumniContext.Provider>
  );
}

// ============ Custom Hook ============

export function useAlumni(): AlumniContextType {
  const context = useContext(AlumniContext);
  
  if (context === undefined) {
    throw new Error('useAlumni must be used within AlumniProvider');
  }
  
  return context;
}

/**
 * Hook for logged in developer
 */
export function useLoggedInDeveloper() {
  const { loggedInDeveloper, logoutDeveloper } = useAlumni();
  return { loggedInDeveloper, logoutDeveloper };
}

/**
 * Hook for demo mode
 */
export function useLoggedInDemo() {
  const {
    loggedInDemo,
    logoutDemo,
    isDemoMode,
    demoSyncState,
    syncDemoFromProduction,
    resetDemoChanges,
  } = useAlumni();
  return {
    loggedInDemo,
    logoutDemo,
    isDemoMode,
    demoSyncState,
    syncDemoFromProduction,
    resetDemoChanges,
  };
}

// ============ Selector Hooks (for performance optimization) ============

/**
 * Hook for selected alumni only
 */
export function useSelectedAlumni() {
  const { selectedAlumni, setSelectedAlumni } = useAlumni();
  return { selectedAlumni, setSelectedAlumni };
}

/**
 * Hook for logged in student
 */
export function useLoggedInStudent() {
  const { loggedInStudent, logout } = useAlumni();
  return { loggedInStudent, logout };
}

/**
 * Hook for logged in admin
 */
export function useLoggedInAdmin() {
  const { loggedInAdmin, logoutAdmin } = useAlumni();
  return { loggedInAdmin, logoutAdmin };
}

/**
 * Hook for logged in dosen
 */
export function useLoggedInDosen() {
  const { loggedInDosen, logoutDosen, mergeLoggedInDosen } = useAlumni();
  return { loggedInDosen, logoutDosen, mergeLoggedInDosen };
}

/**
 * Hook for logged in tendik
 */
export function useLoggedInTendik() {
  const { loggedInTendik, logoutTendik, mergeLoggedInTendik } = useAlumni();
  return { loggedInTendik, logoutTendik, mergeLoggedInTendik };
}

/**
 * Hook for theme only
 */
export function useTheme() {
  const { darkMode, toggleDarkMode } = useAlumni();
  return { darkMode, toggleDarkMode };
}

/**
 * Hook for alumni data operations
 */
export function useAlumniData() {
  const { alumniData, addAlumniData, getAlumniDataByMasterId } = useAlumni();
  return { alumniData, addAlumniData, getAlumniDataByMasterId };
}

/**
 * Hook for student account management (admin)
 */
export function useStudentAccounts() {
  const { studentAccounts, addStudentAccount, deleteStudentAccount } = useAlumni();
  return { studentAccounts, addStudentAccount, deleteStudentAccount };
}
