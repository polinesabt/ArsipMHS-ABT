/**
 * Admin Seed Data
 * Default admin accounts for demo purposes
 */

import type { AdminProfile } from '@/types/student.types';
import { hashPassword } from '@/services/auth.service';

/**
 * Default admin accounts
 * In production, these would be stored in the database
 */
export const adminAccounts: AdminProfile[] = [
  {
    id: 'admin-001',
    username: 'admin',
    nama: 'Administrator ARSIP MAHASISWA ABT',
    passwordHash: hashPassword('admin123'),
    role: 'admin',
    createdAt: new Date('2024-01-01'),
  },
];
