import { GraduationCap, Building2, Calendar } from 'lucide-react';
import { StudentStatus } from '@/types/student.types';
import { aggregateAlumniStatus } from '@/lib/role-utils';
import type { AlumniData } from '@/types/alumni.types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StudentIdentityHeaderProps {
  nama: string;
  nim: string;
  prodi: string;
  jurusan: string;
  tahunLulus?: number;
  studentStatus: StudentStatus;
  /** Career history for computing aggregated alumni status */
  careerHistory?: AlumniData[];
}

export function StudentIdentityHeader({
  nama,
  nim,
  prodi,
  jurusan,
  tahunLulus,
  studentStatus,
  careerHistory = [],
}: StudentIdentityHeaderProps) {
  // Compute aggregated status for alumni
  const aggregatedStatus = studentStatus === 'alumni' 
    ? aggregateAlumniStatus(careerHistory) 
    : null;

  return (
    <TooltipProvider>
      <div className="animate-fade-up">
        {/* Greeting Section */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-1 tracking-wide">
            Hai, Selamat datang!
          </p>
          
          {/* Name */}
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
              {nama}
            </h1>
          </div>
          
          {/* Aggregated Alumni Status (LinkedIn-style) - Only for Alumni with career data */}
          {studentStatus === 'alumni' && aggregatedStatus?.hasActiveCareer && (
            <p className="text-base text-muted-foreground mt-2 font-medium">
              {aggregatedStatus.primaryText}
            </p>
          )}
        </div>

        {/* Identity Info Bar */}
        <div className="flex flex-wrap items-center gap-2 text-sm sm:gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 rounded-full bg-muted/50 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted sm:px-3 sm:text-sm">
                <span className="font-semibold text-foreground">NIM:</span>
                <span>{nim}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Nomor Induk Mahasiswa</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 rounded-full bg-muted/50 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted sm:px-3 sm:text-sm">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{prodi}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Program Studi</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 rounded-full bg-muted/50 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted sm:px-3 sm:text-sm">
                <Building2 className="w-3.5 h-3.5" />
                <span>{jurusan}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Jurusan</p>
            </TooltipContent>
          </Tooltip>
          
          {tahunLulus && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 rounded-full bg-muted/50 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted sm:px-3 sm:text-sm">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Lulus {tahunLulus}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tahun Lulus</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
