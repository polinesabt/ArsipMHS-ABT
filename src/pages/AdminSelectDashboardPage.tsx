import { useNavigate } from 'react-router-dom';
import { useAlumni } from '@/contexts/AlumniContext';
import { DemoModeBanner } from '@/components/sandbox/DemoModeBanner';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, 
  LogOut, 
  UserCheck, 
  ShieldCheck,
  ArrowRight,
  Code
} from 'lucide-react';

export default function AdminSelectDashboardPage() {
  const navigate = useNavigate();
  const { loggedInAdmin, logoutAdmin, dosenModuleEnabled, isDemoMode } = useAlumni();

  const handleSelect = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <DemoModeBanner />
      {/* Subtle background ambient gradients */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/6 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 z-10">
        <div className="w-full max-w-5xl">
          {/* Header */}
          <div className="text-center mb-10 animate-fade-up">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4 shadow-xs text-primary">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Portal Admin & Pengelola
            </h1>
            <p className="mt-2.5 text-muted-foreground max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
              Selamat datang kembali, <span className="font-semibold text-foreground">{loggedInAdmin?.nama || 'Administrator'}</span>.
              <span className="block mt-0.5 text-xs sm:text-sm">Pilih modul dashboard yang ingin Anda kelola.</span>
            </p>
          </div>

          {/* Cards Grid */}
          <div className={`grid gap-6 mx-auto animate-scale-in ${
            isDemoMode
              ? 'grid-cols-1 md:grid-cols-3 max-w-5xl'
              : dosenModuleEnabled
              ? 'grid-cols-1 md:grid-cols-2 max-w-3xl'
              : 'grid-cols-1 max-w-md'
          }`}>
            {/* Card 1: Mahasiswa & Alumni */}
            <div 
              onClick={() => handleSelect('/admin/mahasiswa/dashboard/all')}
              className="group relative cursor-pointer rounded-2xl p-6 sm:p-8 border border-border/80 bg-card hover:border-primary/50 shadow-card hover:shadow-elevated transition-all duration-200 flex flex-col justify-between min-h-[260px]"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-200 mb-2">
                  Mahasiswa & Alumni
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Kelola data administrasi mahasiswa, riwayat prestasi, tracer study alumni, status keaktifan, dan evaluasi hasil lulusan.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-primary">
                <span>Masuk ke Dashboard</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Card 2: Dosen (Only shown when module is enabled or demo mode) */}
            {(dosenModuleEnabled || isDemoMode) && (
              <div 
                onClick={() => handleSelect('/admin/dosen/dashboard')}
                className="group relative cursor-pointer rounded-2xl p-6 sm:p-8 border border-border/80 bg-card hover:border-info/50 shadow-card hover:shadow-elevated transition-all duration-200 flex flex-col justify-between min-h-[260px]"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-info/10 text-info flex items-center justify-center mb-5 group-hover:bg-info group-hover:text-white transition-colors duration-200">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-info transition-colors duration-200 mb-2">
                    Dashboard Dosen & Tendik
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Kelola metrik performa tridharma perguruan tinggi, publikasi ilmiah dosen, beban waktu mengajar, dan pengabdian masyarakat.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-info">
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            )}

            {/* Card 3: Developer Dashboard (Shortcut for Demo Users) */}
            {isDemoMode && (
              <div 
                onClick={() => handleSelect('/developer/dashboard')}
                className="group relative cursor-pointer rounded-2xl p-6 sm:p-8 border border-purple-500/30 bg-card hover:border-purple-500/70 shadow-card hover:shadow-elevated transition-all duration-200 flex flex-col justify-between min-h-[260px]"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-200">
                    <Code className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200">
                      Developer Dashboard
                    </h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-300">
                      Demo Access
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Akses kontrol developer, audit log error sistem, inspeksi status database, dan manajemen konfigurasi server.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400">
                  <span>Masuk ke Developer</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="text-center mt-10 animate-fade-up">
            <Button
              variant="ghost"
              onClick={logoutAdmin}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors font-medium text-xs sm:text-sm"
            >
              <LogOut className="w-4 h-4" />
              Keluar Sesi Admin
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
