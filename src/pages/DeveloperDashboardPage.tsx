import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlumni, useLoggedInDeveloper } from '@/contexts/AlumniContext';
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
  Settings
} from 'lucide-react';

export default function DeveloperDashboardPage() {
  const navigate = useNavigate();
  const { loggedInDeveloper, logoutDeveloper } = useLoggedInDeveloper();
  const { dosenModuleEnabled, updateDosenModuleEnabled, refreshSystemSettings } = useAlumni();
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

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

  const handleLogout = () => {
    logoutDeveloper();
    navigate('/validasi');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white relative overflow-hidden font-sans">
      {/* Background Glows & Patterns */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-[128px] pointer-events-none" />
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
                onClick={() => void refreshSystemSettings()}
                className="px-4 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-2"
              >
                <Activity className="w-4 h-4 text-cyan-400" />
                Sync Settings
              </button>
            </div>
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
      </main>
    </div>
  );
}
