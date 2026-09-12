import React from 'react';
import {
  DosenOverviewBanner,
  DosenDemografiSection,
  DosenKontribusiSection,
  DosenWaktuMengajarSection,
  DosenTendikSection,
  DosenLuaranSection
} from '@/components/dosen-insight/sections';

export default function AdminDosenMainDashboardPage() {
  return (
    <div className="space-y-6 pb-20 font-sans selection:bg-primary/20 selection:text-primary">
      {/* Main KPI Overview Banner */}
      <div>
        <DosenOverviewBanner />
      </div>

      {/* Section Divider */}
      <div className="border-t border-border/60 my-6" />

      {/* Section 1: Pengelolaan Dosen & Demografi */}
      <div>
        <DosenDemografiSection />
      </div>

      {/* Section Divider */}
      <div className="border-t border-border/60 my-6" />

      {/* Section 2: Kontribusi Intelektual Tridharma */}
      <div>
        <DosenKontribusiSection />
      </div>

      {/* Section Divider */}
      <div className="border-t border-border/60 my-6" />

      {/* Section 3: Waktu Mengajar (EWMP) */}
      <div>
        <DosenWaktuMengajarSection />
      </div>

      {/* Section Divider */}
      <div className="border-t border-border/60 my-6" />

      {/* Section 4: Tenaga Kependidikan */}
      <div>
        <DosenTendikSection />
      </div>

      {/* Section Divider */}
      <div className="border-t border-border/60 my-6" />

      {/* Section 5: Luaran Penelitian & PKM */}
      <div>
        <DosenLuaranSection />
      </div>
    </div>
  );
}
