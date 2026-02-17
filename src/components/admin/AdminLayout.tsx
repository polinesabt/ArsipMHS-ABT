import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, useAnimationControls } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { SidebarNav } from '@/components/admin/SidebarNav';
import { ADMIN_NAV_ITEMS } from '@/components/admin/admin-nav.config';
import { isNavParent } from '@/components/admin/admin-nav.types';
import type { AdminNavItem } from '@/components/admin/admin-nav.types';
import { useAlumni } from '@/contexts/AlumniContext';
import { AdminSidebarProvider, useAdminSidebar } from '@/contexts/AdminSidebarContext';
import { Button } from '@/components/ui/button';

const SIDEBAR_COLLAPSED_WIDTH = 80;
const SIDEBAR_EXPANDED_WIDTH = 260;
const EASE_PREMIUM = [0.16, 1, 0.3, 1] as const;

function AdminLayoutShell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { loggedInAdmin, logoutAdmin } = useAlumni();
  const { collapsed, toggleCollapsed } = useAdminSidebar();
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 1024;
  });

  const activeItem = useMemo((): AdminNavItem => {
    if (pathname === '/admin' || pathname.startsWith('/admin/dashboard')) {
      const dashboard = ADMIN_NAV_ITEMS.find((item) => item.id === 'admin-dashboard');
      return dashboard ?? ADMIN_NAV_ITEMS[0];
    }
    const withPath = ADMIN_NAV_ITEMS.filter((item): item is AdminNavItem & { path: string } =>
      !isNavParent(item) && !!item.path
    );
    const sorted = [...withPath].sort((a, b) => (b.path?.length ?? 0) - (a.path?.length ?? 0));
    return sorted.find((item) => pathname.startsWith(item.path)) ?? ADMIN_NAV_ITEMS[0];
  }, [pathname]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const onChange = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches);
    };

    setIsDesktop(mediaQuery.matches);
    mediaQuery.addEventListener('change', onChange);

    return () => {
      mediaQuery.removeEventListener('change', onChange);
    };
  }, []);

  const handleSelect = (item: AdminNavItem) => {
    if ('path' in item && item.path && item.path !== pathname) {
      navigate(item.path);
    }
  };

  const effectiveCollapsed = isDesktop ? collapsed : true;
  const contentOffset = effectiveCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;
  const routeTransition = { duration: 0.26, ease: EASE_PREMIUM } as const;
  const layoutShiftControls = useAnimationControls();
  const previousOffsetRef = useRef(contentOffset);

  useEffect(() => {
    const previousOffset = previousOffsetRef.current;
    if (previousOffset === contentOffset) return;

    const delta = contentOffset - previousOffset;
    previousOffsetRef.current = contentOffset;

    layoutShiftControls.stop();
    layoutShiftControls.set({ x: -delta });
    void     layoutShiftControls.start({
      x: 0,
      transition: { duration: 0.22, ease: EASE_PREMIUM },
    });
  }, [contentOffset, layoutShiftControls]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SidebarNav
        items={ADMIN_NAV_ITEMS}
        activeId={activeItem.id}
        collapsed={effectiveCollapsed}
        onToggle={toggleCollapsed}
        canToggle={isDesktop}
        onSelect={handleSelect}
        title="Admin Panel"
        collapsedWidth={SIDEBAR_COLLAPSED_WIDTH}
        expandedWidth={SIDEBAR_EXPANDED_WIDTH}
      />

      <div
        className="min-h-screen min-w-0 relative flex flex-col box-border"
        style={{
          marginLeft: `${contentOffset}px`,
          boxSizing: 'border-box',
        }}
      >
        <div className="h-14 sm:h-16 border-b border-border/80 bg-[rgba(255,255,255,0.75)] backdrop-blur-[6px] shadow-sm px-3 sm:px-6 flex items-center justify-between dark:bg-[rgba(15,23,42,0.72)]">
          <h1 className="text-base sm:text-lg font-semibold text-foreground truncate pr-2">
            {activeItem.label}
          </h1>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {loggedInAdmin && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
                <span className="text-sm font-medium text-foreground">
                  {loggedInAdmin.nama}
                </span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={logoutAdmin}
              className="gap-1 sm:gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </Button>
          </div>
        </div>

        <div className="flex-1 min-w-0 px-3 sm:px-6 pt-4 sm:pt-6 pb-0">
          <motion.div animate={layoutShiftControls} className="min-w-0 will-change-transform">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={routeTransition}
              className="min-w-0"
            >
              <Outlet />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function AdminLayout() {
  return (
    <AdminSidebarProvider>
      <AdminLayoutShell />
    </AdminSidebarProvider>
  );
}
