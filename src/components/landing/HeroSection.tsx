import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, TrendingUp, Globe, Building2 } from 'lucide-react';
import { StatCard } from '@/components/shared';

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center hero-gradient overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-info/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header content */}
          <div className="text-center mb-16">
            {/* Institution Badge */}
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-up">
              <div className="w-8 h-8 rounded-full flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="Logo Politeknik Negeri Semarang"
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div className="text-left">
                <span className="text-xs text-muted-foreground block">Politeknik Negeri Semarang</span>
                <span className="text-sm font-semibold text-primary">Program Studi Administrasi Bisnis Terapan</span>
              </div>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <span className="gradient-text">ARISP DAVINA</span>
            </h1>
            
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-4 animate-fade-up" style={{ animationDelay: '0.15s' }}>
              Prodi Studi Administrasi Bisnis Terapan
            </h2>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-up text-balance" style={{ animationDelay: '0.2s' }}>
              Sistem Arsip Digital Terintegrasi Data Mahasiswa Program Studi Administrasi Bisnis Terapan Politeknik Negeri Semarang
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <Button asChild size="xl" className="group">
                <Link to="/validasi">
                  Mulai Input Data
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl">
                <Link to="/admin">
                  Lihat Dashboard
                </Link>
              </Button>
            </div>
          </div>

          {/* (Stats grid and feature tags section removed as requested) */}
        </div>
      </div>
    </section>
  );
}
