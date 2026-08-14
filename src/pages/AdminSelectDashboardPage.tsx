import { useNavigate } from 'react-router-dom';
import { useAlumni } from '@/contexts/AlumniContext';
import { Button } from '@/components/ui/button';
import { 
  Users2, 
  GraduationCap, 
  LogOut, 
  User, 
  ShieldCheck,
  Lock
} from 'lucide-react';


export default function AdminSelectDashboardPage() {
  const navigate = useNavigate();
  const { loggedInAdmin, logoutAdmin, dosenModuleEnabled } = useAlumni();

  const handleSelect = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Decorative background blur objects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-info/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 z-10">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-10 animate-fade-up">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4 shadow-sm">
              <ShieldCheck className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight sm:text-4xl">
              Portal Admin
            </h1>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-base leading-relaxed">
              Selamat datang kembali, <span className="font-semibold text-foreground">{loggedInAdmin?.nama || 'Administrator'}</span>.
              <span className="block mt-1">Silakan pilih dashboard yang ingin Anda kelola hari ini.</span>
            </p>
          </div>

          {/* Cards Grid */}
          <div className={`grid gap-6 mx-auto animate-scale-in ${
            dosenModuleEnabled ? 'grid-cols-1 md:grid-cols-2 max-w-3xl' : 'grid-cols-1 max-w-md'
          }`}>
            {/* Card 1: Mahasiswa & Alumni */}
            <div 
              onClick={() => handleSelect('/admin/mahasiswa/dashboard/all')}
              className="group relative cursor-pointer glass-card rounded-3xl p-8 border border-border/50 bg-card/60 backdrop-blur-xl hover:bg-card/90 shadow-soft hover:shadow-glow transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between min-h-[260px] overflow-hidden"
            >
              {/* Card Accent Gradient */}
              <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-primary/60 to-info/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 mb-6">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-200 mb-2">
                  Mahasiswa & Alumni
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Kelola data administrasi mahasiswa, riwayat prestasi mahasiswa, tracer study alumni, status keaktifan, dan evaluasi hasil lulusan.
                </p>
              </div>

              <div className="mt-6 flex items-center text-xs font-semibold text-primary group-hover:underline">
                Masuk ke Dashboard &rarr;
              </div>
            </div>

            {/* Card 2: Dosen (Only shown when module is enabled) */}
            {dosenModuleEnabled && (
              <div 
                onClick={() => handleSelect('/admin/dosen/dashboard')}
                className="group relative cursor-pointer glass-card rounded-3xl p-8 border border-border/50 bg-card/60 backdrop-blur-xl hover:bg-card/90 shadow-soft hover:shadow-glow transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between min-h-[260px] overflow-hidden"
              >
                {/* Card Accent Gradient */}
                <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-info/60 to-emerald-500/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div>
                  <div className="w-14 h-14 rounded-2xl bg-info/10 flex items-center justify-center text-info group-hover:bg-info group-hover:text-white transition-all duration-300 mb-6">
                    <User className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground group-hover:text-info transition-colors duration-200 mb-2">
                    Dosen
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Kelola metrik performa tridharma perguruan tinggi, riwayat publikasi ilmiah dosen, kinerja pengajaran, dan pengabdian masyarakat.
                  </p>
                </div>

                <div className="mt-6 flex items-center text-xs font-semibold text-info group-hover:underline">
                  Masuk ke Dashboard &rarr;
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="text-center mt-10 animate-fade-up">
            <Button
              variant="ghost"
              onClick={logoutAdmin}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-muted-foreground hover:text-red-500 hover:bg-red-500/5 transition-all duration-300 font-medium text-sm border border-transparent hover:border-red-500/20"
            >
              <LogOut className="w-4 h-4" />
              Keluar Sesi / Log Out
            </Button>
          </div>
        </div>
      </main>

    </div>
  );
}
