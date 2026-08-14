import React, { useState, useEffect, useCallback } from 'react';
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
  X,
  Clock,
  GraduationCap,
  Shield,
  Globe,
  FileCode,
  Zap,
  Filter
} from 'lucide-react';

export default function DeveloperDashboardPage() {
  const navigate = useNavigate();
  const { loggedInDeveloper, logoutDeveloper } = useLoggedInDeveloper();
  const { dosenModuleEnabled, updateDosenModuleEnabled, refreshSystemSettings } = useAlumni();
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

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
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchLogs = useCallback(async () => {
    setIsLoadingLogs(true);
    try {
      const data = await getErrorLogs({
        role: roleFilter === 'all' ? undefined : roleFilter,
        search: searchQuery.trim() || undefined,
        limit: 100,
      });
      setLogs(data.logs);
      setStats(data.stats);
    } catch (e) {
      console.error('Error fetching logs:', e);
    } finally {
      setIsLoadingLogs(false);
    }
  }, [roleFilter, searchQuery]);

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  const handleToggleDosenModule = async () => {
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

  const handleClearLogs = async () => {
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

  const handleTestSimulateError = async () => {
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

  const handleLogout = () => {
    logoutDeveloper();
    navigate('/validasi');
  };

  const formatRelativeTime = (dateString: string) => {
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white relative overflow-hidden font-sans">
      {/* Background Glows & Patterns */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-violet-600/15 rounded-full blur-[128px] pointer-events-none" />

      {/* Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 text-slate-950 shadow-lg shadow-indigo-500/20">
              <Terminal className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Developer Control Center
              </h1>
              <p className="text-xs text-slate-400 font-mono">Arsip Mahasiswa ABT v2.0</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/60 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-medium">{loggedInDeveloper?.nama || 'Developer'}</span>
            </div>
            <button
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
        {/* Toast Notification */}
        {toastMessage && (
          <div
            className={`p-4 rounded-xl border backdrop-blur-lg shadow-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200 shadow-emerald-950/50'
                : 'bg-rose-950/80 border-rose-500/40 text-rose-200 shadow-rose-950/50'
            }`}
          >
            <div className="flex items-center gap-3">
              {toastMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              )}
              <span className="text-sm font-medium">{toastMessage.text}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-xs opacity-70 hover:opacity-100"
            >
              Tutup
            </button>
          </div>
        )}

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
                Panel ini digunakan untuk mengontrol fitur dinamis sistem, mengelola modul aplikasi, dan memantau status operasional platform secara realtime.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  void refreshSystemSettings();
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

        {/* Error Stats Cards Grid */}
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

        {/* Feature Management Grid */}
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
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span>Database Settings Table</span>
                </div>
                <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  system_settings
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-slate-300">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Error Logger Table</span>
                </div>
                <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  system_error_logs
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

        {/* SECTION: DEBUG VIEW & SYSTEM ERROR LOGS */}
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
                onClick={handleTestSimulateError}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/20 transition-all flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                Simulasi Test Error
              </button>

              <button
                onClick={() => void fetchLogs()}
                disabled={isLoadingLogs}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                Refresh Logs
              </button>

              <button
                onClick={handleClearLogs}
                disabled={isClearing || logs.length === 0}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
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
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Role Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setRoleFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                  roleFilter === 'all'
                    ? 'bg-slate-800 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Semua Role
              </button>
              <button
                onClick={() => setRoleFilter('admin')}
                className={`px-3 py-1.5 rounded-lg transition-all font-medium flex items-center gap-1 ${
                  roleFilter === 'admin'
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shield className="w-3 h-3 text-indigo-400" />
                Admin
              </button>
              <button
                onClick={() => setRoleFilter('student')}
                className={`px-3 py-1.5 rounded-lg transition-all font-medium flex items-center gap-1 ${
                  roleFilter === 'student'
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <GraduationCap className="w-3 h-3 text-emerald-400" />
                Student
              </button>
              <button
                onClick={() => setRoleFilter('guest')}
                className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
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
          <div className="rounded-xl border border-slate-800/80 overflow-hidden bg-slate-950/40">
            {isLoadingLogs ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                <span className="text-xs">Memuat data log error sistem...</span>
              </div>
            ) : logs.length === 0 ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                <CheckCircle className="w-8 h-8 text-emerald-500/60 stroke-[1.5]" />
                <span className="text-sm font-medium text-slate-300">Tidak Ada Log Error Ditemukan</span>
                <p className="text-xs text-slate-500 max-w-sm">
                  Sistem berjalan bersih atau tidak ada log error yang cocok dengan filter pencarian Anda.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 hover:bg-slate-900/50 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
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
                        onClick={() => setSelectedLog(log)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5"
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
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
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
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
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
