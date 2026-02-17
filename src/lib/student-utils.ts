import type { StudentStatus } from '@/types/student.types';

/**
 * Hanya alumni yang dapat melihat dan mengedit riwayat karir.
 */
export function isCareerHistoryVisible(status: StudentStatus): boolean {
  return status === 'alumni';
}
