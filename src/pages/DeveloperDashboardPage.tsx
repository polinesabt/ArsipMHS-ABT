import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlumni, useLoggedInDeveloper } from '@/contexts/AlumniContext';
import { 
  getErrorLogs, 
  clearErrorLogs, 
  logSystemError, 
  type SystemErrorLogItem, 
  type ErrorLogStats 
} from '@/services/error-logger.service';
import {
  getAdminAccounts,
  createAdminAccount,
  updateAdminPermissions,
  deleteAdminAccount,
} from '@/services/admin-management.service';
import type { AdminAccountItem } from '@/types/student.types';
import { 
  ShieldCheck, 
  Power, 
  LogOut, 
  Terminal, 
  Cpu, 
  Database, 
  CheckCircle, 
  XCircle, 
  ToggleLeft, 
  ToggleRight,
  Server,
  Activity,
  Layers,
  Settings,
  AlertTriangle,
  Search,
  RefreshCw,
  Trash2,
  Eye,
  EyeOff,
  X,
  Clock,
  GraduationCap,
  Shield,
  Globe,
  FileCode,
  Zap,
  Users,
  UserPlus,
  Lock,
  User,
  KeyRound,
  Check,
  BookOpen,
  UserCheck
} from 'lucide-react';

export default function DeveloperDashboardPage() {
  const navigate = useNavigate();
  const { loggedInDeveloper, logoutDeveloper } = useLoggedInDeveloper();
  const { dosenModuleEnabled, updateDosenModuleEnabled, refreshSystemSettings } = useAlumni();
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Admin Management States
  const [admins, setAdmins] = useState<AdminAccountItem[]>([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [updatingAdminId, setUpdatingAdminId] = useState<string | null>(null);
  const [adminToDelete, setAdminToDelete] = useState<AdminAccountItem | null>(null);
  const [isDeletingAdmin, setIsDeletingAdmin] = useState(false);

  const [newAdmin, setNewAdmin] = useState({
    username: '',
    nama: '',
    password: '',
    can_edit_dosen: true,
    can_edit_mahasiswa: true,
  });

  // Debug View & Error Logs States
  const [logs, setLogs] = useState<SystemErrorLogItem[]>([]);
  const [stats, setStats] = useState<ErrorLogStats>({ total: 0, admin: 0, student: 0, today: 0 });
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<SystemErrorLogItem | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 3500);
  };

  const fetchAdmins = useCallback(async () => {
    setIsLoadingAdmins(true);
    try {
      const data = await getAdminAccounts();
      setAdmins(data);
    } catch (e) {
      console.error('Error fetching admin accounts:', e);
    } finally {
      setIsLoadingAdmins(false);
    }
  }, []);

  // Fetch all logs once in background; filtering is done instantaneously in memory
  const fetchLogs = useCallback(async () => {
    setIsLoadingLogs(true);
    try {
      const data = await getErrorLogs({ limit: 200 });
      setLogs(data.logs);
      setStats(data.stats);
    } catch (e) {
      console.error('Error fetching logs:', e);
    } finally {
      setIsLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    void fetchAdmins();
  }, [fetchAdmins]);

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  // Instant in-memory filtering for zero-latency switching without layout shifts or height collapse
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (roleFilter !== 'all' && log.role !== roleFilter) return false;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        log.feature_name.toLowerCase().includes(q) ||
        log.error_message.toLowerCase().includes(q) ||
        (log.username && log.username.toLowerCase().includes(q)) ||
        (log.url && log.url.toLowerCase().includes(q))
      );
    });
  }, [logs, roleFilter, searchQuery]);

  const handleToggleDosenModule = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const nextState = !dosenModuleEnabled;
    setIsUpdating(true);
    try {
      const ok = await updateDosenModuleEnabled(nextState);
      if (ok) {
        showToast(
          `Modul Dosen berhasil ${nextState ? 'DIAKTIFKAN' : 'DINONAKTIFKAN'}`,
          'success'
        );
      } else {
        showToast('Gagal memperbarui pengaturan modul dosen', 'error');
      }
    } catch (e) {
      showToast('Terjadi kesalahan saat memperbarui fitur', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin.username.trim() || !newAdmin.nama.trim() || !newAdmin.password) {
      showToast('Mohon lengkapi username, nama lengkap, dan password', 'error');
      return;
    }

    if (newAdmin.password.length < 6) {
      showToast('Password minimal 6 karakter', 'error');
      return;
    }

    setIsCreatingAdmin(true);
    try {
      const res = await createAdminAccount({
        username: newAdmin.username.trim(),
        nama: newAdmin.nama.trim(),
        password: newAdmin.password,
        can_edit_dosen: newAdmin.can_edit_dosen,
        can_edit_mahasiswa: newAdmin.can_edit_mahasiswa,
      });

      if (res.success && res.data) {
        showToast(`Akun Admin "${res.data.username}" berhasil dibuat!`, 'success');
        setNewAdmin({
          username: '',
          nama: '',
          password: '',
          can_edit_dosen: true,
          can_edit_mahasiswa: true,
        });
        void fetchAdmins();
      } else {
        showToast(res.error || 'Gagal membuat akun admin', 'error');
      }
    } catch (e) {
      showToast('Terjadi kesalahan saat membuat akun admin', 'error');
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleTogglePermission = async (
    e: React.MouseEvent,
    admin: AdminAccountItem,
    type: 'can_edit_dosen' | 'can_edit_mahasiswa'
  ) => {
    e.preventDefault();
    const nextVal = !admin[type];
    setUpdatingAdminId(admin.id);
    try {
      const res = await updateAdminPermissions(admin.id, { [type]: nextVal });
      if (res.success) {
        const moduleName = type === 'can_edit_dosen' ? 'Modul Dosen' : 'Modul Mahasiswa';
        showToast(
          `Izin ${moduleName} untuk "${admin.username}" ${nextVal ? 'Diberikan' : 'Dinonaktifkan'}`,
          'success'
        );
        setAdmins((prev) =>
          prev.map((a) => (a.id === admin.id ? { ...a, [type]: nextVal } : a))
        );
      } else {
        showToast(res.error || 'Gagal memperbarui hak akses admin', 'error');
      }
    } catch (e) {
      showToast('Terjadi kesalahan saat memperbarui hak akses', 'error');
    } finally {
      setUpdatingAdminId(null);
    }
  };

  const handleConfirmDeleteAdmin = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!adminToDelete) return;
    setIsDeletingAdmin(true);
    try {
      const res = await deleteAdminAccount(adminToDelete.id);
      if (res.success) {
        showToast(`Akun Admin "${adminToDelete.username}" berhasil dihapus`, 'success');
        setAdmins((prev) => prev.filter((a) => a.id !== adminToDelete.id));
        setAdminToDelete(null);
      } else {
        showToast(res.error || 'Gagal menghapus akun admin', 'error');
      }
    } catch (e) {
      showToast('Terjadi kesalahan saat menghapus akun admin', 'error');
    } finally {
      setIsDeletingAdmin(false);
    }
  };

  const handleClearLogs = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!window.confirm('Apakah Anda yakin ingin menghapus seluruh riwayat log error sistem?')) return;
    setIsClearing(true);
    try {
      const ok = await clearErrorLogs();
      if (ok) {
        showToast('Riwayat log error berhasil dibersihkan', 'success');
        void fetchLogs();
      } else {
        showToast('Gagal menghapus log error', 'error');
      }
    } finally {
      setIsClearing(false);
    }
  };

  const handleTestSimulateError = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const testFeatures = ['Modul Dosen', 'Evaluasi Lulusan', 'Tracer Study', 'Login System', 'Import Prestasi'];
    const randomFeature = testFeatures[Math.floor(Math.random() * testFeatures.length)];
    const roles: ('admin' | 'student')[] = ['admin', 'student'];
    const randomRole = roles[Math.floor(Math.random() * roles.length)];

    const ok = await logSystemError({
      feature_name: randomFeature,
      error_message: `Simulasi Test Error pada ${randomFeature}: Unexpected token or API timeout.`,
      stack_trace: `Error: SimulatedException in ${randomFeature}\n    at DeveloperDashboardPage.handleTestSimulateError (DeveloperDashboardPage.tsx:95:10)`,
      url: window.location.href,
      role: randomRole,
    });

    if (ok) {
      showToast(`Berhasil merekam simulasi error untuk [${randomFeature}]`, 'success');
      void fetchLogs();
    } else {
      showToast('Gagal mengirim simulasi error', 'error');
    }
  };

  const handleLogout = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    logoutDeveloper();
    navigate('/validasi');
  };

  const formatRelativeTime = (dateString?: string | null) => {
    if (!dateString) return 'Belum pernah';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffSec < 60) return 'Baru saja';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m yang lalu`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}j yang lalu`;
      return date.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const filteredAdmins = admins.filter((a) => {
    const q = adminSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      a.username.toLowerCase().includes(q) ||
      a.nama.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white relative font-sans">
      {/* Background Glows & Patterns (Isolated overflow container to prevent window scroll jitter) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-[128px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-violet-600/15 rounded-full blur-[128px]" />
      </div>

      {/* FLOATING TOAST NOTIFICATION (Fixed overlay to eliminate layout shifts & scroll jumps) */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-md w-full animate-in fade-in slide-in-from-top-3 duration-200 pointer-events-auto shadow-2xl">
          <div
            className={`p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center justify-between ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/95 border-emerald-500/50 text-emerald-200 shadow-emerald-950/60'
                : 'bg-rose-950/95 border-rose-500/50 text-rose-200 shadow-rose-950/60'
            }`}
          >
            <div className="flex items-center gap-3">
              {toastMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              )}
              <span className="text-xs sm:text-sm font-medium">{toastMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-xs opacity-70 hover:opacity-100 text-slate-300 ml-3 p-1 rounded hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 text-slate-950 shadow-lg shadow-indigo-500/20">
              <Terminal className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Developer Control Center
              </h1>
              <p className="text-xs text-slate-400 font-mono">Arsip Mahasiswa ABT</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/60 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-medium">{loggedInDeveloper?.nama || 'Developer'}</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all duration-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 z-10">
        {/* Developer Info Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-indigo-950/40 border border-slate-800 backdrop-blur-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                SYSTEM DEVELOPER ROLE
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Selamat Datang, {loggedInDeveloper?.nama || 'Developer'}
              </h2>
              <p className="text-sm text-slate-400 max-w-xl">
                Panel ini digunakan untuk mengontrol fitur dinamis sistem, mengelola modul aplikasi, membuat akun Admin dan mengatur hak aksesnya, serta memantau log operasional platform secara realtime.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  void refreshSystemSettings();
                  void fetchAdmins();
                  void fetchLogs();
                }}
                className="px-4 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-2"
              >
                <Activity className="w-4 h-4 text-cyan-400" />
                Sync System Data
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 1: FEATURE MANAGEMENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feature Toggle Card */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">Kontrol Fitur Dynamic Modules</h3>
                  <p className="text-xs text-slate-400">Aktifkan atau matikan modul secara global</p>
                </div>
              </div>
              <Settings className="w-5 h-5 text-slate-500 animate-spin-slow" />
            </div>

            {/* Feature Row: Modul Dosen */}
            <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 hover:border-slate-700">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-100">Modul Dosen (Select Dashboard Portal)</span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                      dosenModuleEnabled
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    }`}
                  >
                    {dosenModuleEnabled ? 'AKTIF' : 'NONAKTIF'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                  Mengontrol ketersediaan portal dashboard Dosen di halaman <code className="text-cyan-400 bg-slate-900 px-1 py-0.5 rounded">/admin/select-dashboard</code> dan akses rute dosen.
                </p>
              </div>

              <button
                type="button"
                onClick={handleToggleDosenModule}
                disabled={isUpdating}
                className={`relative inline-flex items-center gap-3 px-5 py-2.5 rounded-xl font-medium text-xs transition-all duration-300 ${
                  dosenModuleEnabled
                    ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 shadow-lg shadow-emerald-950/50'
                    : 'bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-750'
                } disabled:opacity-50`}
              >
                {dosenModuleEnabled ? (
                  <>
                    <ToggleRight className="w-6 h-6 text-emerald-400" />
                    <span>Modul Aktif</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-6 h-6 text-slate-500" />
                    <span>Modul Nonaktif</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sidebar System Overview */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">System Diagnostics</h3>
                <p className="text-xs text-slate-400">Status & Lingkungan Sistem</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-slate-300">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>Akun Admin Aktif</span>
                </div>
                <span className="font-mono text-indigo-300 font-semibold">{admins.length} Akun</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-slate-300">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Database Table Admins</span>
                </div>
                <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  admins
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-slate-300">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Role Autentikasi</span>
                </div>
                <span className="font-mono text-cyan-400 font-semibold">developer</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-slate-300">
                  <Power className="w-4 h-4 text-emerald-400" />
                  <span>Environment</span>
                </div>
                <span className="font-mono text-slate-400">Production / Local XAMPP</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: MANAJEMEN AKUN ADMIN & HAK AKSES MODUL */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-6">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">Manajemen Akun Admin & Hak Akses Modul</h3>
                <p className="text-xs text-slate-400">
                  Buat akun Admin baru dan atur hak akses edit untuk Modul Dosen serta Modul Mahasiswa
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  void fetchAdmins();
                }}
                disabled={isLoadingAdmins}
                className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoadingAdmins ? 'animate-spin' : ''}`} />
                Refresh Data Admin
              </button>
            </div>
          </div>

          {/* Sub-grid: Form Tambah Admin */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-950/80 to-slate-900/40 border border-slate-800/80 space-y-5">
            <div className="flex items-center gap-2.5 text-slate-200 font-semibold text-sm">
              <UserPlus className="w-4 h-4 text-indigo-400" />
              <span>Formulir Pembuatan Akun Admin Baru</span>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4" autoComplete="off">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Username */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Username Akun <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="admin_create_username"
                    id="admin_create_username"
                    required
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    data-lpignore="true"
                    data-form-type="other"
                    placeholder="contoh: admin_dosen"
                    value={newAdmin.username}
                    onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                    style={{ backgroundColor: '#020617', color: '#f8fafc', colorScheme: 'dark' }}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono transition-colors duration-150"
                  />
                  <p className="text-[10px] text-slate-500">Huruf, angka, strip, atau underscore (min. 3 karakter)</p>
                </div>

                {/* Nama Lengkap */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    Nama Lengkap / Jabatan <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="admin_create_fullname"
                    id="admin_create_fullname"
                    required
                    autoComplete="off"
                    data-lpignore="true"
                    placeholder="contoh: Admin Modul Dosen ABT"
                    value={newAdmin.nama}
                    onChange={(e) => setNewAdmin({ ...newAdmin, nama: e.target.value })}
                    style={{ backgroundColor: '#020617', color: '#f8fafc', colorScheme: 'dark' }}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-150"
                  />
                  <p className="text-[10px] text-slate-500">Nama representasi administrator</p>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="admin_create_password"
                      id="admin_create_password"
                      required
                      autoComplete="new-password"
                      data-lpignore="true"
                      data-form-type="other"
                      placeholder="Minimal 6 karakter"
                      value={newAdmin.password}
                      onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                      style={{ backgroundColor: '#020617', color: '#f8fafc', colorScheme: 'dark' }}
                      className="w-full pl-3.5 pr-10 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono transition-colors duration-150"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500">Isi password yang akan digunakan untuk login akun admin ini (min. 6 karakter)</p>
                </div>
              </div>

              {/* Hak Akses Modul Switches */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-cyan-400" />
                  <span>Pengaturan Hak Akses Edit Modul:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Akses Modul Dosen */}
                  <button
                    type="button"
                    onClick={() => setNewAdmin({ ...newAdmin, can_edit_dosen: !newAdmin.can_edit_dosen })}
                    className={`w-full p-3.5 rounded-xl border text-left cursor-pointer select-none transition-colors duration-150 flex items-start gap-3 ${
                      newAdmin.can_edit_dosen
                        ? 'bg-indigo-950/30 border-indigo-500/40 text-indigo-200'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                        newAdmin.can_edit_dosen
                          ? 'bg-indigo-500 border-indigo-400 text-white'
                          : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      {newAdmin.can_edit_dosen && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                        Hak Akses Modul Dosen
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Admin dapat mengelola data profil dosen, publikasi, penelitian, dan pengabdian.
                      </p>
                    </div>
                  </button>

                  {/* Akses Modul Mahasiswa */}
                  <button
                    type="button"
                    onClick={() => setNewAdmin({ ...newAdmin, can_edit_mahasiswa: !newAdmin.can_edit_mahasiswa })}
                    className={`w-full p-3.5 rounded-xl border text-left cursor-pointer select-none transition-colors duration-150 flex items-start gap-3 ${
                      newAdmin.can_edit_mahasiswa
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                        newAdmin.can_edit_mahasiswa
                          ? 'bg-emerald-500 border-emerald-400 text-white'
                          : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      {newAdmin.can_edit_mahasiswa && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                        Hak Akses Modul Mahasiswa
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Admin dapat mengedit data arsip mahasiswa, verifikasi prestasi, tracer study, dan evaluasi.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isCreatingAdmin}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-indigo-950/50 flex items-center gap-2 transition-colors duration-150 disabled:opacity-50"
                >
                  {isCreatingAdmin ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Menyimpan Akun Admin...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 text-white" />
                      <span>Buat Akun Admin Baru</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Sub-grid: Daftar Akun Admin Aktif */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-white">Daftar Akun Admin Terdaftar</h4>
                <span className="px-2 py-0.5 text-xs rounded-full bg-slate-800 text-indigo-300 font-mono font-medium">
                  {admins.length} Total
                </span>
              </div>

              {/* Search admin */}
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari admin..."
                  value={adminSearchQuery}
                  onChange={(e) => setAdminSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors duration-150"
                />
                {adminSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setAdminSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Admin Accounts Table / Card List */}
            <div className="rounded-xl border border-slate-800/80 overflow-hidden bg-slate-950/40 min-h-[140px]">
              {isLoadingAdmins && admins.length === 0 ? (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                  <span className="text-xs">Memuat daftar akun admin...</span>
                </div>
              ) : filteredAdmins.length === 0 ? (
                <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                  <Users className="w-8 h-8 text-slate-600 stroke-[1.5]" />
                  <span className="text-sm font-medium text-slate-300">Tidak Ada Akun Admin Ditemukan</span>
                  <p className="text-xs text-slate-500 max-w-sm">
                    {adminSearchQuery
                      ? 'Tidak ada akun admin yang sesuai dengan kata kunci pencarian Anda.'
                      : 'Belum ada akun admin terdaftar. Buat akun pertama menggunakan form di atas.'}
                  </p>
                </div>
              ) : (
                <div className={`overflow-x-auto transition-opacity duration-150 ${isLoadingAdmins ? 'opacity-70' : 'opacity-100'}`}>
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-medium">
                      <tr>
                        <th className="py-3 px-4">Admin Profile</th>
                        <th className="py-3 px-4">Username</th>
                        <th className="py-3 px-4 text-center">Hak Akses Modul Dosen</th>
                        <th className="py-3 px-4 text-center">Hak Akses Modul Mahasiswa</th>
                        <th className="py-3 px-4">Login Terakhir</th>
                        <th className="py-3 px-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredAdmins.map((admin) => (
                        <tr key={admin.id} className="hover:bg-slate-900/40 transition-colors">
                          {/* Nama & Status */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600/30 to-violet-600/30 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300 text-xs">
                                {admin.nama ? admin.nama.charAt(0).toUpperCase() : 'A'}
                              </div>
                              <div>
                                <div className="font-semibold text-white">{admin.nama || admin.username}</div>
                                <div className="text-[10px] text-slate-500 font-mono">
                                  ID: {admin.id.substring(0, 8)}...
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Username */}
                          <td className="py-3.5 px-4">
                            <span className="font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-900/50 px-2 py-0.5 rounded text-[11px]">
                              @{admin.username}
                            </span>
                          </td>

                          {/* Toggle Modul Dosen */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={(e) => handleTogglePermission(e, admin, 'can_edit_dosen')}
                              disabled={updatingAdminId === admin.id}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border transition-colors duration-150 ${
                                admin.can_edit_dosen
                                  ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/25'
                                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                              } disabled:opacity-50`}
                              title="Klik untuk mengubah hak akses Modul Dosen"
                            >
                              {admin.can_edit_dosen ? (
                                <>
                                  <Check className="w-3 h-3 text-indigo-400 stroke-[3]" />
                                  <span>Dosen: Aktif</span>
                                </>
                              ) : (
                                <>
                                  <X className="w-3 h-3 text-slate-500" />
                                  <span>Dosen: Nonaktif</span>
                                </>
                              )}
                            </button>
                          </td>

                          {/* Toggle Modul Mahasiswa */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={(e) => handleTogglePermission(e, admin, 'can_edit_mahasiswa')}
                              disabled={updatingAdminId === admin.id}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border transition-colors duration-150 ${
                                admin.can_edit_mahasiswa
                                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                              } disabled:opacity-50`}
                              title="Klik untuk mengubah hak akses Modul Mahasiswa"
                            >
                              {admin.can_edit_mahasiswa ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                                  <span>Mhs: Aktif</span>
                                </>
                              ) : (
                                <>
                                  <X className="w-3 h-3 text-slate-500" />
                                  <span>Mhs: Nonaktif</span>
                                </>
                              )}
                            </button>
                          </td>

                          {/* Last Login */}
                          <td className="py-3.5 px-4">
                            <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {formatRelativeTime(admin.last_login)}
                            </span>
                          </td>

                          {/* Action Delete */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setAdminToDelete(admin)}
                              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
                              title="Hapus akun admin"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: ERROR STATS CARDS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Total Error Log</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">{stats.total}</div>
            <p className="text-[10px] text-slate-500">Semua riwayat terakumulasi</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Error Admin Role</span>
              <Shield className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-indigo-300 font-mono">{stats.admin}</div>
            <p className="text-[10px] text-slate-500">Terjadi pada sesi admin</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Error Student Role</span>
              <GraduationCap className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-300 font-mono">{stats.student}</div>
            <p className="text-[10px] text-slate-500">Terjadi pada sesi mahasiswa</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Error Hari Ini</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-300 font-mono">{stats.today}</div>
            <p className="text-[10px] text-slate-500">Log 24 jam terakhir</p>
          </div>
        </div>

        {/* SECTION 4: DEBUG VIEW & SYSTEM ERROR LOGS */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-6">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">System Debug View & Error Logs</h3>
                <p className="text-xs text-slate-400">Riwayat dan pencatatan error di bagian User & Admin secara realtime</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleTestSimulateError}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/20 transition-colors flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                Simulasi Test Error
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  void fetchLogs();
                }}
                disabled={isLoadingLogs}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                Refresh Logs
              </button>

              <button
                type="button"
                onClick={handleClearLogs}
                disabled={isClearing || logs.length === 0}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Bersihkan Log
              </button>
            </div>
          </div>

          {/* Filter & Search Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama fitur, pesan error, username, atau URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-150"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Role Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setRoleFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors duration-150 font-medium ${
                  roleFilter === 'all'
                    ? 'bg-slate-800 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Semua Role
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('admin')}
                className={`px-3 py-1.5 rounded-lg transition-colors duration-150 font-medium flex items-center gap-1 ${
                  roleFilter === 'admin'
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shield className="w-3 h-3 text-indigo-400" />
                Admin
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('student')}
                className={`px-3 py-1.5 rounded-lg transition-colors duration-150 font-medium flex items-center gap-1 ${
                  roleFilter === 'student'
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <GraduationCap className="w-3 h-3 text-emerald-400" />
                Student
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('guest')}
                className={`px-3 py-1.5 rounded-lg transition-colors duration-150 font-medium ${
                  roleFilter === 'guest'
                    ? 'bg-slate-800 text-slate-200'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Guest
              </button>
            </div>
          </div>

          {/* Log Table / List Container */}
          <div className="rounded-xl border border-slate-800/80 overflow-hidden bg-slate-950/40 min-h-[160px]">
            {isLoadingLogs && logs.length === 0 ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                <span className="text-xs">Memuat data log error sistem...</span>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                <CheckCircle className="w-8 h-8 text-emerald-500/60 stroke-[1.5]" />
                <span className="text-sm font-medium text-slate-300">Tidak Ada Log Error Ditemukan</span>
                <p className="text-xs text-slate-500 max-w-sm">
                  {searchQuery || roleFilter !== 'all'
                    ? 'Tidak ada log error yang sesuai dengan filter pencarian atau role yang dipilih.'
                    : 'Sistem berjalan bersih. Belum ada log error yang tercatat.'}
                </p>
              </div>
            ) : (
              <div className="max-h-[560px] overflow-y-auto divide-y divide-slate-800/60 transition-opacity duration-150">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 hover:bg-slate-900/50 transition-colors duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Role Badge */}
                        <span
                          className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md border ${
                            log.role === 'admin'
                              ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                              : log.role === 'student'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                              : log.role === 'developer'
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}
                        >
                          {log.role}
                        </span>

                        {/* Feature Tag */}
                        <span className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-800/80 border border-slate-700/80 text-cyan-300">
                          {log.feature_name}
                        </span>

                        {/* User info if available */}
                        {log.username && (
                          <span className="text-[11px] font-mono text-slate-400">
                            User: <strong className="text-slate-200">{log.username}</strong>
                          </span>
                        )}

                        {/* Timestamp */}
                        <span className="text-[10px] text-slate-500 ml-auto md:ml-0 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {formatRelativeTime(log.created_at)}
                        </span>
                      </div>

                      {/* Error Message */}
                      <p className="text-xs font-mono text-rose-300/90 line-clamp-2 break-all group-hover:text-rose-200">
                        {log.error_message}
                      </p>

                      {/* URL context */}
                      {log.url && (
                        <p className="text-[10px] text-slate-500 font-mono truncate flex items-center gap-1">
                          <Globe className="w-3 h-3 text-slate-600" />
                          {log.url}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Detail Log</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL: DELETE ADMIN CONFIRMATION */}
      {adminToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Konfirmasi Hapus Akun Admin</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus akun admin{' '}
              <strong className="text-white font-mono bg-slate-800 px-1.5 py-0.5 rounded">
                @{adminToDelete.username}
              </strong>{' '}
              ({adminToDelete.nama})? Tindakan ini akan mencabut seluruh hak akses admin tersebut.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAdminToDelete(null)}
                disabled={isDeletingAdmin}
                className="px-4 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAdmin}
                disabled={isDeletingAdmin}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50 flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isDeletingAdmin ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Akun</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL ERROR LOG MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base">Detail Record Log Error</h3>
                  <p className="text-xs text-slate-400 font-mono">ID: {selectedLog.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">Peran User (Role)</span>
                  <span className="font-semibold uppercase text-indigo-300 font-mono">{selectedLog.role}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">Fitur Terkait</span>
                  <span className="font-semibold text-cyan-300">{selectedLog.feature_name}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">User ID / Username</span>
                  <span className="font-mono text-slate-300">{selectedLog.username || selectedLog.user_id || 'Guest / Anonim'}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">Waktu Kejadian</span>
                  <span className="font-mono text-slate-300">{new Date(selectedLog.created_at).toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Error Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Pesan Error (Error Message)
                </label>
                <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/40 text-rose-200 font-mono break-all leading-relaxed">
                  {selectedLog.error_message}
                </div>
              </div>

              {/* URL */}
              {selectedLog.url && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    URL / Endpoint Terkait
                  </label>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-slate-300 break-all">
                    {selectedLog.url}
                  </div>
                </div>
              )}

              {/* Technical Stack Trace */}
              {selectedLog.stack_trace && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-violet-400" />
                    Technical Stack Trace / Exception Details
                  </label>
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono overflow-x-auto text-[11px] leading-relaxed whitespace-pre-wrap max-h-60">
                    {selectedLog.stack_trace}
                  </pre>
                </div>
              )}

              {/* Client Specs */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Detail Klien (User Agent & IP)</label>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 font-mono text-[10px] text-slate-400 space-y-1">
                  <div>IP Address: <span className="text-slate-300">{selectedLog.ip_address || 'Tidak Diketahui'}</span></div>
                  <div className="truncate">User Agent: <span className="text-slate-300">{selectedLog.user_agent || '-'}</span></div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
