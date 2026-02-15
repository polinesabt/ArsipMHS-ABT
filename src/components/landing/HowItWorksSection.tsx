import { UserCheck, FormInput, CheckCircle, BarChart } from 'lucide-react';

const steps = [
  {
    icon: UserCheck,
    number: '01',
    title: 'Validasi Identitas',
    description: 'Masukkan nama dan tahun lulus. Sistem akan menampilkan daftar alumni yang cocok untuk dipilih.',
    color: 'primary',
  },
  {
    icon: FormInput,
    number: '02',
    title: 'Isi Data dengan Mudah',
    description: 'Form interaktif bergaya kuesioner. Pilih status, jawab pertanyaan dinamis sesuai kondisi Anda.',
    color: 'info',
  },
  {
    icon: CheckCircle,
    number: '03',
    title: 'Data Tersimpan',
    description: 'Data tersimpan sebagai arsip permanen. Lihat timeline riwayat karir Anda di dashboard.',
    color: 'success',
  },
  {
    icon: BarChart,
    number: '04',
    title: 'Analisis & Insight',
    description: 'Admin dapat melihat statistik, grafik, dan AI Insight untuk kebutuhan pelaporan.',
    color: 'warning',
  },
];

const colorClasses: Record<string, string> = {
  primary: 'bg-primary text-primary-foreground',
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
  info: 'bg-info text-info-foreground',
};

const bgColorClasses: Record<string, string> = {
  primary: 'bg-primary/10',
  success: 'bg-success/10',
  warning: 'bg-warning/10',
  info: 'bg-info/10',
};

const textColorClasses: Record<string, string> = {
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  info: 'text-info',
};

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-background relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-info/10 text-info text-sm font-medium mb-4">
            Alur Penggunaan
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Cara Kerja ARSIP MAHASISWA ABT
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Empat langkah sederhana untuk mengelola data alumni Anda.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Desktop Layout */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="absolute top-10 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5">
                    <div className="h-full bg-gradient-to-r from-border to-border/50 rounded-full" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-border" />
                  </div>
                )}

                <div className="relative p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-elevated transition-all duration-300 text-center">
                  {/* Step Number Badge */}
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-sm font-bold shadow-soft ${colorClasses[step.color]}`}>
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl ${bgColorClasses[step.color]} flex items-center justify-center mx-auto mb-5 mt-2`}>
                    <step.icon className={`w-8 h-8 ${textColorClasses[step.color]}`} />
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile/Tablet Layout */}
          <div className="lg:hidden space-y-6">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="flex gap-4 animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Left side - number and line */}
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${colorClasses[step.color]}`}>
                    {step.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-0.5 flex-1 bg-border mt-4" />
                  )}
                </div>

                {/* Right side - content */}
                <div className="flex-1 pb-8">
                  <div className="glass-card rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg ${bgColorClasses[step.color]} flex items-center justify-center`}>
                        <step.icon className={`w-5 h-5 ${textColorClasses[step.color]}`} />
                      </div>
                      <h3 className="font-semibold text-foreground">{step.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
