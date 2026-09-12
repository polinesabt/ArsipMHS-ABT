/**
 * Role System Utilities
 * Centralized role-based logic for the student dashboard
 * 
 * ARCHITECTURE:
 * - Role is the PRIMARY identity (not just a form field)
 * - Status Alumni is COMPUTED from active career entries
 * - All logic is exportable and framework-agnostic
 */

import type { StudentStatus, CareerStatus } from '@/types/student.types';
import type { AlumniData, AlumniStatus } from '@/types/alumni.types';

// ============ Role Configuration ============

/**
 * Role badge configuration with semantic colors
 * Following Polines academic identity
 */
export const ROLE_CONFIG: Record<StudentStatus, {
  label: string;
  labelShort: string;
  color: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
  description: string;
}> = {
  alumni: {
    label: 'Alumni',
    labelShort: 'Alumni',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
    dotColor: 'bg-primary',
    description: 'Lulusan Politeknik Negeri Semarang',
  },
  active: {
    label: 'Mahasiswa Aktif',
    labelShort: 'Aktif',
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
    dotColor: 'bg-success',
    description: 'Mahasiswa terdaftar aktif',
  },
  on_leave: {
    label: 'Mahasiswa Cuti',
    labelShort: 'Cuti',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
    dotColor: 'bg-warning',
    description: 'Mahasiswa dalam status cuti akademik',
  },
  dropout: {
    label: 'Mahasiswa Dropout',
    labelShort: 'Dropout',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    borderColor: 'border-muted-foreground/30',
    dotColor: 'bg-muted-foreground',
    description: 'Mahasiswa yang tidak lagi terdaftar',
  },
};

// ============ Career Status Labels ============

export const CAREER_STATUS_LABELS: Record<AlumniStatus, string> = {
  bekerja: 'Bekerja',
  wirausaha: 'Wirausaha',
  studi: 'Melanjutkan Studi',
  mencari: 'Mencari Kerja',
};

export const CAREER_STATUS_COLORS: Record<AlumniStatus, {
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  bekerja: {
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
  },
  wirausaha: {
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
  },
  studi: {
    color: 'text-info',
    bgColor: 'bg-info/10',
    borderColor: 'border-info/30',
  },
  mencari: {
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
  },
};

// ============ Status Aggregation Types ============

export interface AggregatedCareerStatus {
  primaryText: string;
  details: string[];
  hasActiveCareer: boolean;
  activeEntries: AlumniData[];
}

// ============ Access Control ============

/**
 * Check if a role has access to career/tracer study features
 */
export function hasCareerAccess(status: StudentStatus): boolean {
  return status === 'alumni';
}

/**
 * Check if a role can edit achievements
 */
export function canEditAchievements(status: StudentStatus): boolean {
  return status !== 'dropout';
}

/**
 * Get locked message for non-alumni users
 */
export function getLockedCareerMessage(status: StudentStatus): {
  title: string;
  message: string;
} {
  const roleLabel = ROLE_CONFIG[status].label;
  
  return {
    title: `Anda saat ini berstatus ${roleLabel}`,
    message: 'Fitur riwayat karir alumni akan terbuka setelah Anda menjadi Alumni Politeknik Negeri Semarang.',
  };
}

/**
 * Get locked message for career history (non-alumni)
 */
export function getLockedCareerHistoryMessage(): {
  title: string;
  message: string;
} {
  return {
    title: 'Riwayat karir hanya tersedia untuk Alumni.',
    message: 'Setelah Anda lulus, Anda dapat mulai membangun profil profesional Anda di sini.',
  };
}

// ============ Status Aggregation Logic ============

/**
 * Aggregate alumni status from active career entries
 * RULES:
 * - Status is derived ONLY from career entries marked as active
 * - Multiple active roles are allowed
 * - Display format is LinkedIn-style (text only)
 */
export function aggregateAlumniStatus(careerHistory: AlumniData[]): AggregatedCareerStatus {
  // Filter only active entries based on status-specific active flags
  const activeEntries = careerHistory.filter(entry => {
    switch (entry.status) {
      case 'bekerja':
        return entry.masihAktifKerja !== false; // Default to true if not set
      case 'wirausaha':
        return entry.usahaAktif !== false; // Default to true if not set
      case 'studi':
        return entry.masihAktifStudi !== false; // Default to true if not set
      case 'mencari':
        return true; // Job seekers are always "active"
      default:
        return true;
    }
  });
  
  if (activeEntries.length === 0) {
    return {
      primaryText: 'Belum diisi',
      details: [],
      hasActiveCareer: false,
      activeEntries: [],
    };
  }

  const statusParts: string[] = [];
  const details: string[] = [];

  activeEntries.forEach(entry => {
    const statusLabel = CAREER_STATUS_LABELS[entry.status];
    
    switch (entry.status) {
      case 'bekerja':
        if (entry.namaPerusahaan) {
          statusParts.push(`Bekerja di ${entry.namaPerusahaan}`);
          const periodKerja = formatCareerPeriod(entry.tahunMulaiKerja, entry.masihAktifKerja, entry.tahunSelesaiKerja);
          details.push(
            `${entry.jabatan || 'Karyawan'} di ${entry.namaPerusahaan}` +
            (periodKerja ? ` (${periodKerja})` : '')
          );
        } else {
          statusParts.push('Bekerja');
        }
        break;
        
      case 'wirausaha':
        if (entry.namaUsaha) {
          statusParts.push(`Wirausaha ${entry.namaUsaha}`);
          const periodUsaha = formatCareerPeriod(entry.tahunMulaiUsaha, entry.usahaAktif);
          details.push(
            `${entry.namaUsaha}` +
            (entry.jenisUsaha ? ` – ${entry.jenisUsaha}` : '') +
            (periodUsaha ? ` (${periodUsaha})` : '')
          );
        } else {
          statusParts.push('Wirausaha');
        }
        break;
        
      case 'studi':
        if (entry.namaKampus) {
          statusParts.push(`Studi Lanjut di ${entry.namaKampus}`);
          const periodStudi = formatCareerPeriod(entry.tahunMulaiStudi, entry.masihAktifStudi, entry.tahunSelesaiStudi);
          details.push(
            `${entry.jenjang || ''} ${entry.programStudi || ''}`.trim() +
            ` di ${entry.namaKampus}` +
            (periodStudi ? ` (${periodStudi})` : '')
          );
        } else {
          statusParts.push('Melanjutkan Studi');
        }
        break;
        
      case 'mencari':
        statusParts.push('Mencari Kerja');
        details.push(
          `Mencari peluang di bidang ${entry.bidangDiincar || 'berbagai bidang'}` +
          (entry.lokasiTujuan ? ` (${entry.lokasiTujuan})` : '')
        );
        break;
    }
  });

  // Join with LinkedIn-style separator
  const primaryText = statusParts.join(' · ');

  return {
    primaryText,
    details,
    hasActiveCareer: true,
    activeEntries,
  };
}

/**
 * Get empty state message for alumni without career data
 */
export function getEmptyCareerMessage(): {
  title: string;
  message: string;
  ctaLabel: string;
} {
  return {
    title: 'Belum ada status alumni aktif',
    message: 'Tambahkan riwayat karir untuk membangun profil profesional Anda.',
    ctaLabel: 'Tambah Riwayat Karir',
  };
}

/**
 * Format career period string
 */
export function formatCareerPeriod(startYear?: number, isActive?: boolean, endYear?: number): string {
  if (!startYear) return '';
  
  if (isActive) {
    return `${startYear} – Sekarang`;
  }
  
  return endYear ? `${startYear} – ${endYear}` : `${startYear}`;
}

/**
 * Convert CareerStatus (English) to AlumniStatus (Indonesian)
 */
export function careerStatusToAlumniStatus(status: CareerStatus): AlumniStatus {
  const map: Record<CareerStatus, AlumniStatus> = {
    working: 'bekerja',
    job_seeking: 'mencari',
    entrepreneur: 'wirausaha',
    further_study: 'studi',
  };
  return map[status];
}

/**
 * Convert AlumniStatus (Indonesian) to CareerStatus (English)
 */
export function alumniStatusToCareerStatus(status: AlumniStatus): CareerStatus {
  const map: Record<AlumniStatus, CareerStatus> = {
    bekerja: 'working',
    mencari: 'job_seeking',
    wirausaha: 'entrepreneur',
    studi: 'further_study',
  };
  return map[status];
}
