import { UserCheck, FormInput, CheckCircle2, BarChart3 } from 'lucide-react';

const steps = [
  {
    icon: UserCheck,
    number: '01',
    title: 'Validasi Identitas',
    description: 'Masukkan identitas alumni untuk mengakses profil dan data akademik yang terdaftar.',
  },
  {
    icon: FormInput,
    number: '02',
    title: 'Lengkapi Data',
    description: 'Isi kuesioner tracer study dan riwayat karir secara terstruktur sesuai kondisi terkini.',
  },
  {
    icon: CheckCircle2,
    number: '03',
    title: 'Pencatatan Permanen',
    description: 'Data tersimpan aman dalam arsip permanen dan tersinkronisasi dengan dashboard pribadi.',
  },
  {
    icon: BarChart3,
    number: '04',
    title: 'Analisis & Pelaporan',
    description: 'Data diolah menjadi visualisasi statistik dan analitik capaian untuk kebutuhan prodi & akreditasi.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="relative border-t border-border/40 bg-background py-14 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center sm:mb-16">
          <span className="inline-block px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide mb-3">
            Alur Penggunaan
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight">
            Cara Kerja Arsip Mahasiswa ABT
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Empat langkah sederhana untuk pencatatan dan pengelolaan data mahasiswa serta alumni.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Desktop Layout */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative animate-fade-up"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="absolute top-10 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 pointer-events-none">
                    <div className="h-full bg-gradient-to-r from-primary/30 to-border rounded-full" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary/40" />
                  </div>
                )}

                <div className="relative h-full p-6 rounded-2xl bg-card border border-border/80 hover:border-primary/40 hover:shadow-card transition-all duration-200 text-center flex flex-col justify-between">
                  {/* Step Number Badge */}
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold bg-primary text-primary-foreground shadow-sm">
                    {step.number}
                  </div>

                  <div>
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5 mt-2">
                      <step.icon className="w-7 h-7" />
                    </div>

                    <h3 className="text-base font-semibold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile/Tablet Layout */}
          <div className="lg:hidden space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="flex gap-3 animate-fade-up sm:gap-4"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                {/* Left side - number and line */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-primary text-primary-foreground shrink-0 shadow-sm">
                    {step.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-0.5 flex-1 bg-border/80 my-2" />
                  )}
                </div>

                {/* Right side - content */}
                <div className="flex-1 pb-4">
                  <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <step.icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-semibold text-foreground text-sm sm:text-base">{step.title}</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{step.description}</p>
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
