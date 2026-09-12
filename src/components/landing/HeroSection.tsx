import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, LayoutDashboard } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden hero-gradient">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Ambient background wash */}
        <div className="absolute -top-24 left-1/2 h-[350px] w-[min(700px,150vw)] -translate-x-1/2 rounded-full bg-primary/8 blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-[250px] w-[min(400px,100vw)] rounded-full bg-info/5 blur-[80px] sm:right-10" />
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px'
          }}
        />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-10 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header content */}
          <div className="text-center">
            {/* Institution Badge */}
            <div className="mb-6 inline-flex max-w-full items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 shadow-sm animate-fade-up sm:mb-8 sm:gap-3 sm:rounded-full sm:px-4">
              <div className="w-7 h-7 rounded-full flex items-center justify-center bg-background/80 p-0.5">
                <img
                  src={`${import.meta.env.BASE_URL}logo.png`}
                  alt="Logo Politeknik Negeri Semarang"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-left">
                <span className="text-[11px] text-muted-foreground block leading-tight font-medium">Politeknik Negeri Semarang</span>
                <span className="block text-[11px] font-semibold leading-tight text-primary sm:text-xs">Program Studi Administrasi Bisnis Terapan</span>
              </div>
            </div>

            {/* Main Title */}
            <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-foreground animate-fade-up sm:text-5xl md:text-6xl" style={{ animationDelay: '0.1s' }}>
              <span className="gradient-text">ARSIP MAHASISWA</span>
            </h1>
            
            <h2 className="mb-5 text-lg font-semibold text-foreground/90 animate-fade-up sm:text-2xl md:text-3xl" style={{ animationDelay: '0.15s' }}>
              Program Studi Administrasi Bisnis Terapan
            </h2>
            
            <p className="mx-auto mb-8 max-w-2xl text-sm leading-relaxed text-muted-foreground text-balance animate-fade-up sm:mb-10 sm:text-lg" style={{ animationDelay: '0.2s' }}>
              Sistem arsip digital terintegrasi untuk pengelolaan data mahasiswa, pencatatan prestasi, riwayat karir alumni, dan evaluasi hasil lulusan.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3.5 justify-center animate-fade-up" style={{ animationDelay: '0.25s' }}>
              <Button asChild size="lg" className="group h-12 w-full rounded-xl px-7 font-semibold shadow-soft hover:shadow-elevated sm:w-auto">
                <Link to="/validasi">
                  Mulai Input Data
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 w-full rounded-xl border-border/80 px-7 font-semibold hover:bg-muted/80 sm:w-auto">
                <Link to="/admin">
                  <LayoutDashboard className="w-4 h-4 mr-2 text-muted-foreground" />
                  Lihat Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
