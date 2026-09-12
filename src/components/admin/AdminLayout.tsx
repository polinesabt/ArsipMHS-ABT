import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { domAnimation, LazyMotion } from 'framer-motion';
import { SidebarNav } from '@/components/admin/SidebarNav';
import { ADMIN_NAV_ITEMS, DOSEN_NAV_ITEMS } from '@/components/admin/admin-nav.config';
import { isNavParent } from '@/components/admin/admin-nav.types';
import type { AdminNavItem, AdminNavItemLeaf } from '@/components/admin/admin-nav.types';
import { AdminBottomNav, type AdminMobilePopupId } from '@/components/admin/AdminBottomNav';
import { MobileAdminTopBar } from '@/components/admin/MobileAdminTopBar';
import { useAlumni } from '@/contexts/AlumniContext';
import { AdminSidebarProvider, useAdminSidebar } from '@/contexts/AdminSidebarContext';
import { AdminErrorBoundary } from '@/components/auth/AdminErrorBoundary';
import { DemoModeBanner } from '@/components/sandbox/DemoModeBanner';

const SIDEBAR_COLLAPSED_WIDTH = 80;
const SIDEBAR_EXPANDED_WIDTH = 260;

function pathMatches(currentPath: string, itemPath: string): boolean {
  if (itemPath.includes('#')) return currentPath === itemPath;
  const pathnameOnly = currentPath.split('#', 1)[0];
  return pathnameOnly === itemPath || pathnameOnly.startsWith(`${itemPath}/`);
}

function resolveActiveTopLevel(
  items: AdminNavItem[],
  pathname: string,
  hash: string,
  isDosenMode: boolean,
): AdminNavItem {
  if (!isDosenMode && (pathname.startsWith('/admin/mahasiswa/kustom-form') || pathname.startsWith('/admin/mahasiswa/evaluasi'))) {
    return items.find((item) => item.id === 'evaluasi-lulusan') ?? items[0];
  }

  if (!isDosenMode && (pathname === '/admin' || pathname === '/admin/mahasiswa' || pathname === '/admin/mahasiswa/dashboard')) {
    return items.find((item) => item.id === 'admin-dashboard') ?? items[0];
  }

  const currentPath = `${pathname}${hash}`;
  const parentMatch = items.find(
    (item) => isNavParent(item) && item.children.some((child) => pathMatches(currentPath, child.path)),
  );
  if (parentMatch) return parentMatch;

  return [...items]
    .filter((item): item is AdminNavItemLeaf => !isNavParent(item))
    .sort((a, b) => b.path.length - a.path.length)
    .find((item) => pathMatches(currentPath, item.path)) ?? items[0];
}

function resolveActiveLeaf(
  activeTopLevel: AdminNavItem,
  pathname: string,
  hash: string,
): AdminNavItemLeaf | null {
  if (!isNavParent(activeTopLevel)) return activeTopLevel;

  const currentPath = `${pathname}${hash}`;
  return [...activeTopLevel.children]
    .sort((a, b) => b.path.length - a.path.length)
    .find((child) => pathMatches(currentPath, child.path)) ?? activeTopLevel.children[0] ?? null;
}

function AdminLayoutShell() {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const {
    loggedInAdmin,
    loggedInDemo,
    isDemoMode,
    darkMode,
    toggleDarkMode,
    logoutAdmin,
    logoutDemo,
    dosenModuleEnabled,
  } = useAlumni();
  const { collapsed, toggleCollapsed } = useAdminSidebar();
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 768;
  });
  const [openPopupId, setOpenPopupId] = useState<AdminMobilePopupId>(null);

  const isDosenMode = pathname.startsWith('/admin/dosen');

  useEffect(() => {
    if (isDosenMode && !dosenModuleEnabled) {
      navigate('/admin/select-dashboard', { replace: true });
    }
  }, [isDosenMode, dosenModuleEnabled, navigate]);

  const navItems = isDosenMode ? DOSEN_NAV_ITEMS : ADMIN_NAV_ITEMS;

  const activeTopLevel = useMemo(
    () => resolveActiveTopLevel(navItems, pathname, hash, isDosenMode),
    [navItems, pathname, hash, isDosenMode],
  );
  const activeLeaf = useMemo(
    () => resolveActiveLeaf(activeTopLevel, pathname, hash),
    [activeTopLevel, pathname, hash],
  );
  const activePageTitle = activeLeaf?.label ?? activeTopLevel.label;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const onChange = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches);
      if (event.matches) setOpenPopupId(null);
    };

    setIsDesktop(mediaQuery.matches);
    mediaQuery.addEventListener('change', onChange);

    return () => {
      mediaQuery.removeEventListener('change', onChange);
    };
  }, []);

  useEffect(() => {
    setOpenPopupId(null);
  }, [pathname, hash, isDosenMode]);

  const handleSelect = (item: AdminNavItem) => {
    if ('path' in item && item.path && item.path !== pathname) {
      navigate(item.path);
    }
  };

  const handleMobileNavigate = (path: string) => {
    setOpenPopupId(null);
    if (path !== `${pathname}${hash}` && path !== pathname) navigate(path);
  };

  const handlePortal = () => {
    setOpenPopupId(null);
    navigate('/admin/select-dashboard');
  };

  const handleLogout = () => {
    setOpenPopupId(null);
    if (isDemoMode) logoutDemo();
    else logoutAdmin();
    navigate('/validasi');
  };

  const effectiveCollapsed = isDesktop ? collapsed : false;
  const contentOffset = isDesktop
    ? (effectiveCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH)
    : 0;
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [pathname, hash]);

  return (
    <LazyMotion features={domAnimation}>
    <div className="min-h-[100dvh] bg-background overflow-x-hidden">
      {isDesktop && (
        <SidebarNav
          items={navItems}
          activeId={activeTopLevel.id}
          collapsed={effectiveCollapsed}
          onToggle={toggleCollapsed}
          canToggle={isDesktop}
          onSelect={handleSelect}
          title={isDosenMode ? "Dosen Panel" : "Admin Panel"}
          collapsedWidth={SIDEBAR_COLLAPSED_WIDTH}
          expandedWidth={SIDEBAR_EXPANDED_WIDTH}
        />
      )}

      <div
        className="min-h-[100dvh] min-w-0 relative flex flex-col box-border"
        style={{
          marginLeft: `${contentOffset}px`,
          boxSizing: 'border-box',
        }}
      >
        {isDesktop && <DemoModeBanner />}
        {!isDesktop && (
          <MobileAdminTopBar
            title={activePageTitle}
            adminName={loggedInAdmin?.nama ?? loggedInDemo?.nama ?? 'Admin'}
            darkMode={darkMode}
            isDemoMode={isDemoMode}
            openPopupId={openPopupId}
            onPopupChange={setOpenPopupId}
            onPortal={handlePortal}
            onToggleTheme={toggleDarkMode}
            onLogout={handleLogout}
          />
        )}
        {isDesktop && <div className="h-14 sm:h-16 border-b border-border/50 bg-card/80 backdrop-blur-xl shadow-sm px-3 sm:px-6 flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <h1 className="text-base sm:text-lg font-semibold text-foreground truncate pr-2">
              {activeTopLevel.label}
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {loggedInAdmin && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
                <span className="text-sm font-medium text-foreground">
                  {loggedInAdmin.nama}
                </span>
              </div>
            )}
          </div>
        </div>}

        <div className="flex-1 min-w-0 px-3 sm:px-6 pt-4 sm:pt-6 pb-24 md:pb-0">
          <div className="min-w-0">
            <AdminErrorBoundary>
              <Outlet />
            </AdminErrorBoundary>
          </div>
        </div>
      </div>
      {!isDesktop && (
        <AdminBottomNav
          mode={isDosenMode ? 'dosen' : 'mahasiswa'}
          items={navItems}
          pathname={pathname}
          activeTopLevelId={activeTopLevel.id}
          openPopupId={openPopupId}
          onPopupChange={setOpenPopupId}
          onNavigate={handleMobileNavigate}
        />
      )}
    </div>
    </LazyMotion>
  );
}

export function AdminLayout() {
  return (
    <AdminSidebarProvider>
      <AdminLayoutShell />
    </AdminSidebarProvider>
  );
}
