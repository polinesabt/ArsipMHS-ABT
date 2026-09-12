import { DemoModeOverflowMenu } from '@/components/admin/DemoModeOverflowMenu';
import { ProfilePopup } from '@/components/admin/ProfilePopup';
import type { AdminMobilePopupId } from '@/components/admin/AdminBottomNav';

interface MobileAdminTopBarProps {
  title: string;
  adminName: string;
  darkMode: boolean;
  isDemoMode: boolean;
  openPopupId: AdminMobilePopupId;
  onPopupChange: (id: AdminMobilePopupId) => void;
  onPortal: () => void;
  onToggleTheme: () => void;
  onLogout: () => void;
}

export function MobileAdminTopBar({
  title,
  adminName,
  darkMode,
  isDemoMode,
  openPopupId,
  onPopupChange,
  onPortal,
  onToggleTheme,
  onLogout,
}: MobileAdminTopBarProps) {
  return (
    <header className="sticky top-0 z-[190] flex h-14 items-center justify-between gap-3 border-b border-border/60 bg-card/90 px-3 shadow-sm backdrop-blur-xl md:hidden">
      <h1 className="min-w-0 flex-1 truncate text-base font-semibold text-foreground">{title}</h1>
      <div className="flex shrink-0 items-center gap-2">
        {isDemoMode && (
          <DemoModeOverflowMenu
            open={openPopupId === 'demo'}
            onOpenChange={(open) => onPopupChange(open ? 'demo' : null)}
          />
        )}
        <ProfilePopup
          open={openPopupId === 'profile'}
          onOpenChange={(open) => onPopupChange(open ? 'profile' : null)}
          adminName={adminName}
          darkMode={darkMode}
          isDemoMode={isDemoMode}
          onPortal={onPortal}
          onToggleTheme={onToggleTheme}
          onLogout={onLogout}
        />
      </div>
    </header>
  );
}
