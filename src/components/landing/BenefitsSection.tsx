import { Shield, Zap, BarChart3, Users2, Database, FileCheck, Award, Brain } from 'lucide-react';

const benefits = [
  {
    icon: Shield,
    title: 'Data Tervalidasi',
    description: 'Sistem validasi otomatis memastikan hanya mahasiswa & alumni ABT terverifikasi yang dapat mengakses.',
    color: 'primary',
  },
  {
    icon: Zap,
    title: 'Proses Cepat',
    description: 'Pengisian data hanya 3-5 menit dengan form interaktif bergaya kuesioner yang engaging.',
    color: 'warning',
  },
  {
    icon: Database,
    title: 'Database Terintegrasi',
    description: 'Satu database besar untuk semua data mahasiswa aktif, cuti, dropout, dan alumni.',
    color: 'info',
  },
  {
    icon: Brain,
    title: 'Insight',
    description: 'Analisis cerdas menghasilkan laporan naratif otomatis untuk kebutuhan akreditasi.',
    color: 'success',
  },
  {
    icon: Award,
    title: 'Rekam Prestasi',
    description: 'Pencatatan prestasi akademik dan non-akademik: lomba, publikasi, HAKI, magang, dan lainnya.',
    color: 'destructive',
  },
  {
    icon: FileCheck,
    title: 'Pendukung Akreditasi',
    description: 'Data terstruktur siap export untuk kebutuhan pelaporan dan penilaian akreditasi.',
    color: 'primary',
  },
];

const colorClasses: Record<string, { bg: string; text: string; hover: string }> = {
  primary: { bg: 'bg-primary/10', text: 'text-primary', hover: 'group-hover:bg-primary' },
  success: { bg: 'bg-success/10', text: 'text-success', hover: 'group-hover:bg-success' },
  warning: { bg: 'bg-warning/10', text: 'text-warning', hover: 'group-hover:bg-warning' },
  destructive: { bg: 'bg-destructive/10', text: 'text-destructive', hover: 'group-hover:bg-destructive' },
  info: { bg: 'bg-info/10', text: 'text-info', hover: 'group-hover:bg-info' },
};

export function BenefitsSection() {
  return (
    <section className="py-24 bg-card relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Manfaat Utama
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Mengapa ARSIP MAHASISWA ABT?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sistem terintegrasi yang dirancang khusus untuk mengelola dan menganalisis 
            data mahasiswa & alumni Program Studi ABT Polines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => {
            const colors = colorClasses[benefit.color];
            return (
              <div
                key={benefit.title}
                className="group p-6 rounded-2xl bg-background border border-border hover:border-primary/30 hover:shadow-elevated transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-14 h-14 rounded-xl ${colors.bg} flex items-center justify-center mb-5 ${colors.hover} group-hover:scale-110 transition-all duration-300`}>
                  <benefit.icon className={`w-7 h-7 ${colors.text} group-hover:text-primary-foreground transition-colors`} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
