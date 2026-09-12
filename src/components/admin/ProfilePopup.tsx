import { LayoutGrid, LogOut, Moon, Sun } from 'lucide-react';
import { FloatingIconPopup } from '@/components/admin/FloatingIconPopup';
import { LongPressIconButton } from '@/components/admin/LongPressIconButton';

interface ProfilePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adminName: string;
  darkMode: boolean;
  isDemoMode: boolean;
  onPortal: () => void;
  onToggleTheme: () => void;
  onLogout: () => void;
}

function getInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  return initials || 'A';
}

export function ProfilePopup({
  open,
  onOpenChange,
  adminName,
  darkMode,
  isDemoMode,
  onPortal,
  onToggleTheme,
  onLogout,
}: ProfilePopupProps) {
  const ThemeIcon = darkMode ? Sun : Moon;
  const themeLabel = darkMode ? 'Gunakan mode terang' : 'Gunakan mode gelap';

  return (
    <FloatingIconPopup
      open={open}
      onOpenChange={onOpenChange}
      ariaLabel="Aksi akun"
      columns={3}
      side="bottom"
      align="end"
      sideOffset={10}
      className="w-[12.75rem]"
      trigger={
        <LongPressIconButton
          label={`Buka aksi akun ${adminName}`}
          tooltipSide="bottom"
          icon={
            <span aria-hidden="true" className="text-xs font-bold tracking-tight">
              {getInitials(adminName)}
            </span>
          }
          aria-haspopup="menu"
          aria-expanded={open}
          className="h-10 w-10 min-h-10 min-w-10 rounded-xl border border-primary/30 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground"
        />
      }
      items={[
        {
          id: 'back-to-portal',
          label: 'Kembali ke Portal',
          icon: LayoutGrid,
          onSelect: onPortal,
        },
        {
          id: 'toggle-theme',
          label: themeLabel,
          icon: ThemeIcon,
          onSelect: onToggleTheme,
        },
        {
          id: 'logout',
          label: isDemoMode ? 'Keluar dari Demo' : 'Keluar',
          icon: LogOut,
          danger: true,
          onSelect: onLogout,
        },
      ]}
    />
  );
}
