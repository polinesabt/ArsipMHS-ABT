import { ClipboardCheck, LayoutDashboard, PieChart, Sparkles } from 'lucide-react';
import type { AdminNavItem, AdminNavItemLeaf } from '@/components/admin/admin-nav.types';

const DASHBOARD_SUB_MENU: AdminNavItemLeaf[] = [
  { id: 'dashboard-presentasi', label: 'Presentasi', index: 0, path: '/admin' },
  { id: 'dashboard-overview', label: 'Overview', index: 1, path: '/admin/dashboard/overview' },
  { id: 'dashboard-student-achievements', label: 'Student Achievements', index: 2, path: '/admin/dashboard/student-achievements' },
  { id: 'dashboard-study-period', label: 'Study Period', index: 3, path: '/admin/dashboard/study-period' },
  { id: 'dashboard-waiting-time', label: 'Waiting Time', index: 4, path: '/admin/dashboard/waiting-time' },
  { id: 'dashboard-job-relevance', label: 'Job Relevance', index: 5, path: '/admin/dashboard/job-relevance' },
  { id: 'dashboard-work-coverage', label: 'Work Coverage', index: 6, path: '/admin/dashboard/work-coverage' },
  { id: 'dashboard-user-satisfaction', label: 'User Satisfaction', index: 7, path: '/admin/dashboard/user-satisfaction' },
  { id: 'dashboard-publications', label: 'Publications', index: 8, path: '/admin/dashboard/publications' },
  { id: 'dashboard-active-students', label: 'Active Students', index: 9, path: '/admin/dashboard/active-students' },
  { id: 'dashboard-student-products', label: 'Student Products', index: 10, path: '/admin/dashboard/student-products' },
  { id: 'dashboard-research-outputs', label: 'Research Outputs', index: 11, path: '/admin/dashboard/research-outputs' },
];

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    id: 'admin-dashboard',
    label: 'Dashboard Admin',
    icon: LayoutDashboard,
    index: 0,
    children: DASHBOARD_SUB_MENU,
  },
  {
    id: 'insight-dashboard',
    label: 'Pengelola Mahasiswa',
    icon: PieChart,
    index: 1,
    path: '/admin/pengelola-mahasiswa',
  },
  {
    id: 'ai-insight',
    label: 'AI Insight',
    icon: Sparkles,
    index: 2,
    path: '/admin/ai-insight',
  },
  {
    id: 'evaluasi-lulusan',
    label: 'Evaluasi Lulusan',
    icon: ClipboardCheck,
    index: 3,
    path: '/admin/evaluasi-lulusan',
  },
];
