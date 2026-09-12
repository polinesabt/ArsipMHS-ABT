import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { LogOut, Moon, Sun } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export interface StaffPortalNavItem {
  to: string;
  label: string;
  description: string;
  icon: LucideIcon;
  group?: string;
  sectionId?: string;
}

interface StaffPortalShellProps {
  portalLabel: string;
  personName?: string;
  identityLabel: string;
  identityValue?: string;
  roleDescription: string;
  navItems: StaffPortalNavItem[];
  darkMode: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
  children?: ReactNode;
}

function getDestination(item: StaffPortalNavItem): string {
  return item.sectionId ? `${item.to}#${item.sectionId}` : item.to;
}

function isItemActive(item: StaffPortalNavItem, pathname: string, hash: string): boolean {
  if (pathname !== item.to) return false;
  if (!item.sectionId) return true;
  const currentSection = hash.replace(/^#/, '') || 'profil';
  return currentSection === item.sectionId;
}

function StaffNavigation({
  items,
  portalLabel,
}: {
  items: StaffPortalNavItem[];
  portalLabel: string;
}) {
  const { pathname, hash } = useLocation();

  return (
    <nav className="grid w-full min-w-0 grid-cols-3 items-center gap-1 sm:flex sm:min-w-max sm:snap-x sm:snap-mandatory" aria-label={`Navigasi ${portalLabel}`}>
      {items.map((item) => {
        const Icon = item.icon;
        const active = isItemActive(item, pathname, hash);
        return (
          <Link
            key={`${item.to}-${item.sectionId || item.label}`}
            to={getDestination(item)}
            title={item.description}
            aria-current={active ? 'page' : undefined}
            className={`inline-flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-px sm:h-10 sm:shrink-0 sm:snap-start sm:flex-row sm:gap-2 sm:whitespace-nowrap sm:px-3.5 sm:text-xs ${
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
            <span className="sr-only">: {item.description}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function StaffPortalShell({
  portalLabel,
  personName,
  identityLabel,
  identityValue,
  roleDescription,
  navItems,
  darkMode,
  onToggleTheme,
  onLogout,
  children,
}: StaffPortalShellProps) {
  return (
    <div className="min-h-[100dvh] min-w-0 overflow-x-clip bg-[hsl(var(--surface-subtle))] text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-card/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <Link to="/" className="group flex min-w-0 items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:gap-3" aria-label="Kembali ke beranda">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background p-1.5 transition-colors group-hover:border-primary/40">
                <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Logo Politeknik Negeri Semarang" className="h-full w-full object-contain" />
              </div>
              <div className="min-w-0">
                <p className="max-w-[9rem] truncate text-[11px] font-bold leading-tight min-[380px]:max-w-[12rem] sm:max-w-none sm:text-[15px]">Arsip Akademik Prodi ABT</p>
                <p className="max-w-[9rem] truncate text-[10px] text-muted-foreground min-[380px]:max-w-[12rem] sm:max-w-none sm:text-[11px]">{portalLabel}</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="mr-1 hidden text-right md:block" title={roleDescription}>
              <p className="max-w-56 truncate text-xs font-semibold">{personName}</p>
              <p className="font-mono text-[10px] text-muted-foreground">{identityLabel} {identityValue}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleTheme}
              aria-label={darkMode ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
              className="h-9 w-9 rounded-lg text-muted-foreground active:translate-y-px"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={onLogout} className="hidden h-9 rounded-lg px-3 active:translate-y-px sm:flex">
              <LogOut className="mr-2 h-4 w-4" />Keluar
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onLogout}
              className="h-9 w-9 rounded-lg active:translate-y-px sm:hidden"
              aria-label="Keluar"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {navItems.length > 0 && (
        <div className="sticky top-16 z-30 border-b border-border/80 bg-card/95 backdrop-blur-md">
          <div className="no-scrollbar touch-scroll mx-auto max-w-[1440px] overflow-hidden px-3 py-1.5 sm:overflow-x-auto sm:overscroll-x-contain sm:px-6 sm:py-2 lg:px-8">
            <StaffNavigation items={navItems} portalLabel={portalLabel} />
          </div>
        </div>
      )}

      <div className="mx-auto min-w-0 w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <main id="main-content" className="min-w-0 pb-8 sm:pb-10">
          {children || <Outlet />}
        </main>
      </div>

      <footer className="border-t border-border/70 bg-card pb-safe">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-1 px-4 py-5 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>Program Studi Administrasi Bisnis Terapan</p>
          <p>Politeknik Negeri Semarang</p>
        </div>
      </footer>
    </div>
  );
}
