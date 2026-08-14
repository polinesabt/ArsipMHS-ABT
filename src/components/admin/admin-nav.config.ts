import {
  Award,
  BookOpen,
  CalendarClock,
  ClipboardCheck,
  Clock,
  FlaskConical,
  History,
  LayoutDashboard,
  Package,
  PieChart,
  Sparkles,
  Smile,
  Users,
} from 'lucide-react';
import type { AdminNavItem, AdminNavItemLeaf } from '@/components/admin/admin-nav.types';

const DASHBOARD_SUB_MENU: AdminNavItemLeaf[] = [
  { id: 'dashboard-all', label: 'Overview', index: 0, path: '/admin/mahasiswa-dashboard/all', icon: LayoutDashboard },
  { id: 'dashboard-student-achievements', label: 'Prestasi Mahasiswa', index: 1, path: '/admin/mahasiswa-dashboard/student-achievements', icon: Award },
  { id: 'dashboard-study-period', label: 'Masa Studi', index: 2, path: '/admin/mahasiswa-dashboard/study-period', icon: CalendarClock },
  { id: 'dashboard-waiting-time', label: 'Waktu Tunggu', index: 3, path: '/admin/mahasiswa-dashboard/waiting-time', icon: Clock },
  { id: 'dashboard-work-coverage', label: 'Cakupan Kerja', index: 4, path: '/admin/mahasiswa-dashboard/work-coverage', icon: PieChart },
  { id: 'dashboard-user-satisfaction', label: 'Kepuasan Pengguna', index: 5, path: '/admin/mahasiswa-dashboard/user-satisfaction', icon: Smile },
  { id: 'dashboard-publications', label: 'Diseminasi Ilmiah Mahasiswa', index: 6, path: '/admin/mahasiswa-dashboard/publications', icon: BookOpen },
  { id: 'dashboard-active-students', label: 'Mahasiswa Aktif', index: 7, path: '/admin/mahasiswa-dashboard/active-students', icon: Users },
  { id: 'dashboard-student-products', label: 'Produk Mahasiswa', index: 8, path: '/admin/mahasiswa-dashboard/student-products', icon: Package },
  { id: 'dashboard-research-outputs', label: 'Luaran Penelitian', index: 9, path: '/admin/mahasiswa-dashboard/research-outputs', icon: FlaskConical },
];

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    id: 'admin-dashboard',
    label: 'Dashboard Mahasiswa',
    icon: LayoutDashboard,
    index: 0,
    path: '/admin',
    children: DASHBOARD_SUB_MENU,
  },
  {
    id: 'insight-dashboard',
    label: 'Pengelola Mahasiswa',
    icon: PieChart,
    index: 1,
    path: '/admin/mahasiswa/pengelola',
  },
  {
    id: 'ai-insight',
    label: 'Insight',
    icon: Sparkles,
    index: 2,
    path: '/admin/mahasiswa/ai-insight',
  },
  /* Submenu "Kustom Formulir" (Atur Template Form Kepuasan) disembunyikan. Lihat docs/FEATURE-TEMPLATE-FORM-KEPUASAN-HIDDEN.md */
  {
    id: 'evaluasi-lulusan',
    label: 'Evaluasi Lulusan',
    icon: ClipboardCheck,
    index: 3,
    path: '/admin/mahasiswa/evaluasi',
  },
  {
    id: 'history-logbook',
    label: 'Riwayat Logbook',
    icon: History,
    index: 4,
    path: '/admin/mahasiswa/history-logbook',
  },
];

export const DOSEN_NAV_ITEMS: AdminNavItem[] = [
  {
    id: 'dosen-dashboard',
    label: 'Dashboard Dosen',
    icon: LayoutDashboard,
    index: 0,
    path: '/admin/dosen/dashboard',
  },
  {
    id: 'dosen-pengelolaan',
    label: 'Pengelolaan Dosen',
    icon: Users,
    index: 1,
    path: '/admin/dosen/pengelolaan',
  },
  {
    id: 'dosen-kontribusi',
    label: 'Kontribusi Intelektual',
    icon: BookOpen,
    index: 2,
    path: '/admin/dosen/kontribusi',
  },
];

