import {
  BarChart3,
  ClipboardCheck,
  History,
  LayoutDashboard,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { FloatingIconPopup } from '@/components/admin/FloatingIconPopup';
import { LongPressIconButton } from '@/components/admin/LongPressIconButton';
import { isNavParent, type AdminNavItem } from '@/components/admin/admin-nav.types';

export type AdminMobilePopupId = string | 'profile' | 'demo' | null;

interface AdminBottomNavProps {
  mode: 'mahasiswa' | 'dosen';
  items: AdminNavItem[];
  pathname: string;
  activeTopLevelId: string;
  openPopupId: AdminMobilePopupId;
  onPopupChange: (id: AdminMobilePopupId) => void;
  onNavigate: (path: string) => void;
}

const MAHASISWA_ICONS: Record<string, LucideIcon> = {
  'admin-dashboard': LayoutDashboard,
  'insight-dashboard': Users,
  'ai-insight': BarChart3,
  'evaluasi-lulusan': ClipboardCheck,
  'history-logbook': History,
};

const MAHASISWA_LABELS: Record<string, string> = {
  'insight-dashboard': 'Pengelolaan Mahasiswa',
};

const MOBILE_NAV_DISPLAY_LABELS: Record<string, string> = {
  'admin-dashboard': 'Dashboard',
  'insight-dashboard': 'Mahasiswa',
  'ai-insight': 'Insight',
  'evaluasi-lulusan': 'Evaluasi',
  'history-logbook': 'Riwayat',
  'dosen-dashboard': 'Dashboard',
  'dosen-pengelolaan': 'Kelola Dosen',
  'dosen-kontribusi': 'Kontribusi',
  'dosen-waktu-mengajar': 'Jam Ajar',
  'dosen-tenaga-kependidikan': 'Tendik',
  'dosen-luaran-penelitian-pkm': 'Luaran',
};

const SUBMENU_DISPLAY_LABELS: Record<string, string> = {
  'dashboard-all': 'Overview',
  'dashboard-student-achievements': 'Prestasi',
  'dashboard-study-period': 'Masa Studi',
  'dashboard-waiting-time': 'Waktu Tunggu',
  'dashboard-work-coverage': 'Cakupan Kerja',
  'dashboard-user-satisfaction': 'Kepuasan',
  'dashboard-publications': 'Diseminasi',
  'dashboard-active-students': 'Mhs Aktif',
  'dashboard-student-products': 'Produk Mhs',
  'dashboard-research-outputs': 'Luaran Riset',
  'dosen-kontribusi-pengajaran': 'Pengajaran',
  'dosen-kontribusi-penelitian': 'Penelitian',
  'dosen-kontribusi-pengabdian': 'Pengabdian',
};

function pathMatches(currentPath: string, itemPath: string): boolean {
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

function resolveActiveChildId(item: AdminNavItem, pathname: string): string | undefined {
  if (!isNavParent(item)) return undefined;
  return [...item.children]
    .sort((a, b) => b.path.length - a.path.length)
    .find((child) => pathMatches(pathname, child.path))?.id;
}

export function AdminBottomNav({
  mode,
  items,
  pathname,
  activeTopLevelId,
  openPopupId,
  onPopupChange,
  onNavigate,
}: AdminBottomNavProps) {
  return (
    <nav
      aria-label={`Navigasi admin ${mode === 'mahasiswa' ? 'mahasiswa' : 'dosen'}`}
      className="fixed inset-x-0 bottom-0 z-[190] border-t border-border/70 bg-card/95 px-1.5 pt-1.5 shadow-[0_-10px_32px_hsl(var(--background)/0.28)] backdrop-blur-xl pb-[max(env(safe-area-inset-bottom),0.375rem)] md:hidden"
    >
      <div
        className="mx-auto grid w-full max-w-xl"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item) => {
          const Icon = mode === 'mahasiswa'
            ? (MAHASISWA_ICONS[item.id] ?? item.icon ?? LayoutDashboard)
            : (item.icon ?? LayoutDashboard);
          const mobileLabel = mode === 'mahasiswa'
            ? (MAHASISWA_LABELS[item.id] ?? item.label)
            : item.label;
          const displayLabel = MOBILE_NAV_DISPLAY_LABELS[item.id] ?? mobileLabel;
          const active = activeTopLevelId === item.id;

          if (isNavParent(item)) {
            const open = openPopupId === item.id;
            const activeChildId = resolveActiveChildId(item, pathname);
            return (
              <FloatingIconPopup
                key={item.id}
                open={open}
                onOpenChange={(nextOpen) => onPopupChange(nextOpen ? item.id : null)}
                ariaLabel={`Menu ${mobileLabel}`}
                columns={mode === 'mahasiswa' ? 4 : 3}
                side="top"
                align="center"
                sideOffset={8}
                compact
                className={mode === 'mahasiswa'
                  ? 'w-[15.5rem] max-w-[calc(100vw-24px)] p-2.5'
                  : 'w-[12.5rem] max-w-[calc(100vw-24px)] p-2.5'}
                trigger={
                  <LongPressIconButton
                    label={mobileLabel}
                    visibleLabel={displayLabel}
                    icon={<Icon className="h-[1.35rem] w-[1.35rem]" aria-hidden="true" />}
                    active={active}
                    aria-current={active ? 'page' : undefined}
                    aria-haspopup="menu"
                    aria-expanded={open}
                    className="mx-auto h-14 w-full max-w-14 rounded-xl"
                  />
                }
                items={item.children.map((child) => ({
                  id: child.id,
                  label: child.label,
                  displayLabel: SUBMENU_DISPLAY_LABELS[child.id] ?? child.label,
                  icon: child.icon ?? item.icon,
                  active: child.id === activeChildId,
                  onSelect: () => onNavigate(child.path),
                }))}
              />
            );
          }

          return (
            <LongPressIconButton
              key={item.id}
              label={mobileLabel}
              visibleLabel={displayLabel}
              icon={<Icon className="h-[1.35rem] w-[1.35rem]" aria-hidden="true" />}
              active={active}
              aria-current={active ? 'page' : undefined}
              className="mx-auto h-14 w-full max-w-14 rounded-xl"
              onActivate={() => onNavigate(item.path)}
            />
          );
        })}
      </div>
    </nav>
  );
}
