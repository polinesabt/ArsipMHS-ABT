/**
 * AlumniStatusCard Component
 * Displays aggregated alumni status computed from active career entries
 * 
 * BEHAVIOR:
 * - For Alumni: Shows computed status from career entries
 * - For Non-Alumni: Shows locked state with educational message
 */

import { Briefcase, Lock, ArrowRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  hasCareerAccess, 
  getLockedCareerMessage,
  aggregateAlumniStatus,
  getEmptyCareerMessage,
  CAREER_STATUS_COLORS,
  type AggregatedCareerStatus,
} from '@/lib/role-utils';
import type { StudentStatus } from '@/types/student.types';
import type { AlumniData } from '@/types/alumni.types';

interface AlumniStatusCardProps {
  studentStatus: StudentStatus;
  careerHistory: AlumniData[];
  onUpdateStatus?: () => void;
  className?: string;
}

export function AlumniStatusCard({
  studentStatus,
  careerHistory,
  onUpdateStatus,
  className,
}: AlumniStatusCardProps) {
  const hasAccess = hasCareerAccess(studentStatus);
  
  // Non-Alumni: Panel tetap ditampilkan, disabled (opacity 50%, cursor not-allowed), badge, tanpa tombol
  if (!hasAccess) {
    const lockedMessage = getLockedCareerMessage(studentStatus);

    return (
      <div
        className={cn(
          'glass-card flex flex-col rounded-2xl p-5 opacity-50 cursor-not-allowed pointer-events-none select-none sm:p-6',
          className
        )}
        aria-disabled="true"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
            <Lock className="w-6 h-6 text-muted-foreground" />
          </div>
        </div>

        <h3 className="font-semibold text-foreground mb-4">Status Alumni Saat Ini</h3>

        <div className="flex-1 flex flex-col justify-center py-4">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto">
              <Briefcase className="w-7 h-7 text-muted-foreground/60" />
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
  
  // Alumni: Show Aggregated Status
  const aggregatedStatus = aggregateAlumniStatus(careerHistory);
  
  // Alumni with no career data
  if (!aggregatedStatus.hasActiveCareer) {
    const emptyMessage = getEmptyCareerMessage();
    
    return (
      <div className={cn('glass-card flex flex-col rounded-2xl p-5 sm:p-6', className)}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-primary" />
          </div>
        </div>
        
        <h3 className="font-semibold text-foreground mb-4">Status Alumni Saat Ini</h3>
        
        {/* Empty State */}
        <div className="flex-1 flex flex-col justify-center py-4">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto">
              <Briefcase className="w-7 h-7 text-muted-foreground/60" />
            </div>
            <div className="space-y-2 max-w-xs mx-auto">
              <p className="text-sm font-medium text-foreground">
                {emptyMessage.title}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {emptyMessage.message}
              </p>
            </div>
          </div>
        </div>
        
        {/* CTA */}
        {onUpdateStatus && (
          <Button onClick={onUpdateStatus} className="w-full mt-4">
            {emptyMessage.ctaLabel}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    );
  }
  
  // Alumni with active career data
  return (
    <div className={cn('glass-card flex flex-col rounded-2xl p-5 sm:p-6', className)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Briefcase className="w-6 h-6 text-primary" />
        </div>
      </div>
      
      <h3 className="font-semibold text-foreground mb-4">Status Alumni Saat Ini</h3>
      
      {/* Aggregated Status Content */}
      <div className="flex-1 space-y-4">
        {/* Primary Status Text - LinkedIn Style */}
        <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
          <p className="font-semibold text-foreground text-lg leading-snug">
            {aggregatedStatus.primaryText}
          </p>
        </div>
        
        {/* Status Details */}
        {aggregatedStatus.details.length > 0 && (
          <div className="space-y-2">
            {aggregatedStatus.details.map((detail, index) => (
              <div 
                key={index}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 flex-shrink-0" />
                <span>{detail}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Hint Text */}
        <div className="flex items-start gap-2 pt-2">
          <Info className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground italic">
            Status dihitung otomatis dari riwayat karir aktif.
          </p>
        </div>
      </div>
      
      {/* CTA */}
      {onUpdateStatus && (
        <Button variant="outline" onClick={onUpdateStatus} className="w-full mt-4">
          Perbarui Status
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  );
}
