/**
 * CareerHistoryCard Component
 * Displays career timeline or locked state based on role
 * 
 * BEHAVIOR:
 * - For Alumni: Shows career timeline with active toggle
 * - For Non-Alumni: Shows locked state with educational message
 */

import { Briefcase, Lock, Clock, Plus, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  hasCareerAccess, 
  getLockedCareerHistoryMessage,
  CAREER_STATUS_LABELS,
  CAREER_STATUS_COLORS,
} from '@/lib/role-utils';
import type { StudentStatus } from '@/types/student.types';
import type { AlumniData } from '@/types/alumni.types';
import { CareerTimeline } from './CareerTimeline';

interface CareerTimelineItem {
  id: string;
  year: number;
  status: 'bekerja' | 'wirausaha' | 'studi' | 'mencari';
  title: string;
  subtitle?: string;
  location?: string;
  isActive?: boolean;
}

interface CareerHistoryCardProps {
  studentStatus: StudentStatus;
  careerHistory: AlumniData[];
  onViewAll?: () => void;
  onAddNew?: () => void;
  className?: string;
}

function transformToTimelineItems(history: AlumniData[]): CareerTimelineItem[] {
  return history.map((data) => {
    let title = '';
    let subtitle = '';
    let location = '';

    if (data.status === 'bekerja') {
      title = data.namaPerusahaan || 'Perusahaan';
      subtitle = data.jabatan || 'Karyawan';
      location = data.lokasiPerusahaan || '';
    } else if (data.status === 'wirausaha') {
      title = data.namaUsaha || 'Usaha';
      subtitle = data.jenisUsaha || 'Bisnis';
      location = data.lokasiUsaha || '';
    } else if (data.status === 'studi') {
      title = data.namaKampus || 'Kampus';
      subtitle = `${data.jenjang || ''} ${data.programStudi || ''}`.trim();
      location = data.lokasiKampus || '';
    } else if (data.status === 'mencari') {
      title = 'Mencari Pekerjaan';
      subtitle = `Target: ${data.bidangDiincar || 'Berbagai bidang'}`;
      location = data.lokasiTujuan || '';
    }

    return {
      id: data.id,
      year: data.tahunPengisian,
      status: data.status as 'bekerja' | 'wirausaha' | 'studi' | 'mencari',
      title,
      subtitle,
      location,
      isActive: data.isActive,
    };
  });
}

export function CareerHistoryCard({
  studentStatus,
  careerHistory,
  onViewAll,
  onAddNew,
  className,
}: CareerHistoryCardProps) {
  const hasAccess = hasCareerAccess(studentStatus);
  
  // Non-Alumni: Panel tetap ditampilkan, disabled (opacity 50%, cursor not-allowed), badge, tanpa tombol
  if (!hasAccess) {
    const lockedMessage = getLockedCareerHistoryMessage();

    return (
      <div
        className={cn(
          'glass-card flex flex-col rounded-2xl p-5 opacity-50 cursor-not-allowed pointer-events-none select-none sm:p-6',
          className
        )}
        aria-disabled="true"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
            <Lock className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Riwayat Karir</h3>
            <p className="text-sm text-muted-foreground">Riwayat karir Anda</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center py-8">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto">
              <Clock className="w-7 h-7 text-muted-foreground/60" />
            </div>
            <div className="space-y-2 max-w-xs mx-auto">
              <p className="text-sm font-medium text-foreground">{lockedMessage.title}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{lockedMessage.message}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-3 px-3 py-2 rounded-lg bg-muted/50 border border-border/50">
              🔒 Fitur ini hanya tersedia untuk mahasiswa dengan status Alumni.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Alumni with no career history
  if (careerHistory.length === 0) {
    return (
      <div className={cn('glass-card flex flex-col rounded-2xl p-5 sm:p-6', className)}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Riwayat Karir</h3>
            <p className="text-sm text-muted-foreground">Riwayat karir Anda</p>
          </div>
        </div>
        
        {/* Empty State */}
        <div className="flex-1 flex flex-col justify-center py-8">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto">
              <Clock className="w-7 h-7 text-muted-foreground/60" />
            </div>
            <div className="space-y-2 max-w-xs mx-auto">
              <h4 className="font-semibold text-foreground">Belum Ada Riwayat</h4>
              <p className="text-sm text-muted-foreground">
                Mulai isi form status alumni untuk membangun timeline karir Anda.
              </p>
            </div>
          </div>
        </div>
        
        {/* CTA */}
        {onAddNew && (
          <Button onClick={onAddNew} className="w-full mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Isi Form Status
          </Button>
        )}
      </div>
    );
  }
  
  // Alumni with career history - use the CareerTimeline component
  const timelineItems = transformToTimelineItems(careerHistory);
  
  return (
    <CareerTimeline
      items={timelineItems}
      maxItems={4}
      contextText={`Menampilkan ${Math.min(timelineItems.length, 4)} dari ${timelineItems.length} riwayat karir`}
      onViewAll={onViewAll}
      onAddNew={onAddNew}
      className={className}
    />
  );
}
