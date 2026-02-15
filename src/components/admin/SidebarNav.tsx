import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Menu, X } from 'lucide-react';
import type { AdminNavItem, AdminNavItemLeaf } from '@/components/admin/admin-nav.types';
import { isNavParent } from '@/components/admin/admin-nav.types';

const DASHBOARD_PARENT_ID = 'admin-dashboard';
const STORAGE_KEY = 'admin-sidebar-dashboard-expanded';

interface SidebarNavProps {
  items: AdminNavItem[];
  activeId: string;
  collapsed: boolean;
  onToggle: () => void;
  canToggle?: boolean;
  onSelect: (item: AdminNavItem) => void;
  title: string;
  collapsedWidth?: number;
  expandedWidth?: number;
}

type RippleState = {
  id: string;
  x: number;
  y: number;
  key: number;
} | null;

const EASE_STANDARD = [0.22, 1, 0.36, 1] as const;
const EASE_EXPAND = [0.25, 0.1, 0.25, 1] as const;
const DURATION_FAST = 0.18;
const DURATION_CHEVRON = 0.16;
const DURATION_RIPPLE = 0.32;

function isModifiedEvent(event: MouseEvent<HTMLAnchorElement>) {
  return event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;
}

function readStoredDashboardExpanded(): boolean {
  try {
    const v = sessionStorage.getItem(STORAGE_KEY);
    return v === '1';
  } catch {
    return false;
  }
}

function writeStoredDashboardExpanded(value: boolean) {
  try {
    sessionStorage.setItem(STORAGE_KEY, value ? '1' : '0');
  } catch {
    /* ignore */
  }
}

export function SidebarNav({
  items,
  activeId,
  collapsed,
  onToggle,
  canToggle = true,
  onSelect,
  title,
  collapsedWidth = 70,
  expandedWidth = 240,
}: SidebarNavProps) {
  const { pathname } = useLocation();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [subHoveredId, setSubHoveredId] = useState<string | null>(null);
  const [ripple, setRipple] = useState<RippleState>(null);
  const [toggleHovered, setToggleHovered] = useState(false);

  const isDashboardRoute = pathname === '/admin' || pathname.startsWith('/admin/dashboard');
  const [dashboardExpanded, setDashboardExpanded] = useState(() =>
    isDashboardRoute ? true : readStoredDashboardExpanded()
  );

  useEffect(() => {
    if (isDashboardRoute) {
      setDashboardExpanded(true);
      writeStoredDashboardExpanded(true);
    }
  }, [isDashboardRoute]);

  const toggleDashboard = () => {
    setDashboardExpanded((prev) => {
      const next = !prev;
      writeStoredDashboardExpanded(next);
      return next;
    });
  };

  useEffect(() => {
    if (!ripple) return;
    const timer = window.setTimeout(() => setRipple(null), 400);
    return () => window.clearTimeout(timer);
  }, [ripple]);

  const width = collapsed ? collapsedWidth : expandedWidth;

  const headerTitle = useMemo(
    () => (
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            key="sidebar-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION_FAST, ease: EASE_STANDARD }}
            className="text-xs font-bold tracking-wide text-[hsl(var(--sidebar-fg))]"
          >
            {title}
          </motion.span>
        )}
      </AnimatePresence>
    ),
    [collapsed, title]
  );

  const isParentExpanded = (item: AdminNavItem) =>
    item.id === DASHBOARD_PARENT_ID && dashboardExpanded;

  const renderLeafItem = (item: AdminNavItem & { path: string }) => {
    const isActive = activeId === item.id;
    const isHovered = hoveredId === item.id;
    const bg = isActive
      ? 'hsl(var(--sidebar-active))'
      : isHovered
        ? 'hsl(var(--sidebar-hover) / 0.6)'
        : 'transparent';
    const fg = isActive ? 'hsl(0 0% 100%)' : 'hsl(var(--sidebar-fg))';
    const textOpacity = isActive ? 1 : isHovered ? 1 : 0.85;

    return (
      <li key={item.id}>
        <motion.a
          href={item.path}
          onClick={(e) => {
            if (isModifiedEvent(e)) return;
            e.preventDefault();
            const rect = e.currentTarget.getBoundingClientRect();
            const isKeyboardClick = e.clientX === 0 && e.clientY === 0;
            const x = isKeyboardClick ? rect.width / 2 : e.clientX - rect.left;
            const y = isKeyboardClick ? rect.height / 2 : e.clientY - rect.top;
            setRipple({ id: item.id, x, y, key: Date.now() });
            onSelect(item);
          }}
          whileTap={{ scale: 0.985 }}
          onMouseEnter={() => setHoveredId(item.id)}
          onMouseLeave={() => setHoveredId(null)}
          animate={{ backgroundColor: bg }}
          transition={{ duration: DURATION_FAST, ease: EASE_STANDARD }}
          className={`relative w-full flex items-center rounded-lg py-2.5 overflow-hidden transition-[background,padding] duration-200 ease-out ${
            collapsed ? 'justify-center px-0' : 'gap-3 px-3'
          }`}
        >
          {isActive && (
            <motion.div
              layoutId="sidebar-accent"
              className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full bg-white"
              transition={{ duration: DURATION_FAST, ease: EASE_STANDARD }}
            />
          )}
          <motion.div
            animate={{
              x: isHovered && !isActive ? 1 : 0,
              color: fg,
              scale: collapsed ? 0.92 : 1,
            }}
            transition={{ duration: DURATION_FAST, ease: EASE_STANDARD }}
            className="flex-shrink-0 overflow-visible"
          >
            <item.icon className="w-5 h-5" />
          </motion.div>
          <motion.span
            animate={{
              opacity: collapsed ? 0 : textOpacity,
              color: fg,
              x: collapsed ? -8 : 0,
            }}
            transition={{
              opacity: { duration: DURATION_FAST, ease: EASE_STANDARD },
              x: { duration: DURATION_FAST, ease: EASE_STANDARD },
            }}
            className={`text-sm font-medium whitespace-nowrap ${collapsed ? 'w-0 overflow-hidden' : 'w-auto'}`}
            aria-hidden={collapsed}
          >
            {item.label}
          </motion.span>
          <AnimatePresence>
            {ripple && ripple.id === item.id && ripple.id === activeId && (
              <motion.span
                key={ripple.key}
                className="absolute h-10 w-10 rounded-full pointer-events-none"
                style={{
                  left: ripple.x - 20,
                  top: ripple.y - 20,
                  backgroundColor: 'hsl(var(--primary) / 0.25)',
                }}
                initial={{ scale: 0, opacity: 0.35 }}
                animate={{ scale: 4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DURATION_RIPPLE, ease: EASE_STANDARD }}
              />
            )}
          </AnimatePresence>
          <AnimatePresence>
            {collapsed && isHovered && (
              <motion.div
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: DURATION_FAST, ease: EASE_STANDARD }}
                className="absolute left-full top-1/2 -translate-y-1/2 ml-2 rounded-md shadow-lg px-2.5 py-1.5 text-xs font-medium"
                style={{
                  backgroundColor: 'hsl(var(--foreground))',
                  color: 'hsl(var(--background))',
                }}
              >
                {item.label}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.a>
      </li>
    );
  };

  const renderParentItem = (item: AdminNavItem & { children: AdminNavItemLeaf[] }) => {
    const isActive = activeId === item.id;
    const isHovered = hoveredId === item.id;
    const expanded = isParentExpanded(item);
    const bg = isHovered ? 'hsl(var(--sidebar-hover) / 0.5)' : 'transparent';
    const fg = 'hsl(var(--sidebar-fg))';

    return (
      <li key={item.id}>
        <motion.button
          type="button"
          onClick={toggleDashboard}
          onMouseEnter={() => setHoveredId(item.id)}
          onMouseLeave={() => setHoveredId(null)}
          animate={{ backgroundColor: bg }}
          transition={{ duration: 0.12, ease: EASE_STANDARD }}
          className={`relative w-full flex items-center rounded-lg py-2.5 overflow-hidden font-medium ${
            collapsed ? 'justify-center px-0' : 'gap-3 px-3'
          }`}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse Dashboard Admin' : 'Expand Dashboard Admin'}
        >
          <motion.div
            animate={{ color: fg, scale: collapsed ? 0.92 : 1 }}
            transition={{ duration: DURATION_FAST, ease: EASE_STANDARD }}
            className="flex-shrink-0 overflow-visible"
          >
            <item.icon className="w-5 h-5" />
          </motion.div>
          <motion.span
            animate={{
              opacity: collapsed ? 0 : 1,
              color: fg,
              x: collapsed ? -8 : 0,
            }}
            transition={{
              opacity: { duration: DURATION_FAST, ease: EASE_STANDARD },
              x: { duration: DURATION_FAST, ease: EASE_STANDARD },
            }}
            className={`text-sm whitespace-nowrap ${collapsed ? 'w-0 overflow-hidden' : 'w-auto'}`}
            aria-hidden={collapsed}
          >
            {item.label}
          </motion.span>
          {!collapsed && (
            <motion.span
              className="ml-auto flex-shrink-0"
              animate={{ rotate: expanded ? 90 : 0 }}
              transition={{ duration: DURATION_CHEVRON, ease: 'easeOut' }}
              style={{ color: fg }}
            >
              <ChevronRight className="h-4 w-4" />
            </motion.span>
          )}
          <AnimatePresence>
            {collapsed && isHovered && (
              <motion.div
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: DURATION_FAST, ease: EASE_STANDARD }}
                className="absolute left-full top-1/2 -translate-y-1/2 ml-2 rounded-md shadow-lg px-2.5 py-1.5 text-xs font-medium"
                style={{
                  backgroundColor: 'hsl(var(--foreground))',
                  color: 'hsl(var(--background))',
                }}
              >
                {item.label}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        <motion.div
          initial={false}
          animate={{
            height: expanded ? 'auto' : 0,
            opacity: expanded ? 1 : 0,
          }}
          transition={{
            height: { duration: 0.18, ease: EASE_EXPAND },
            opacity: { duration: 0.18, ease: EASE_EXPAND },
          }}
          className="overflow-hidden"
        >
          <motion.ul
            initial={false}
            animate={{
              y: expanded ? 0 : -4,
            }}
            transition={{ duration: 0.18, ease: EASE_EXPAND }}
            className="space-y-0.5 pt-0.5"
          >
            {item.children.map((child) => {
              const isChildActive = pathname === child.path || (child.path !== '/admin' && pathname.startsWith(child.path));
              const isChildHovered = subHoveredId === child.id;
              const subBg = isChildActive
                ? 'hsl(var(--sidebar-active) / 0.9)'
                : isChildHovered
                  ? 'hsl(var(--sidebar-hover) / 0.5)'
                  : 'transparent';
              const subFg = isChildActive ? 'hsl(0 0% 100%)' : 'hsl(var(--sidebar-fg))';
              const subOpacity = isChildActive || isChildHovered ? 1 : 0.85;

              return (
                <li key={child.id}>
                  <motion.a
                    href={child.path}
                    onClick={(e) => {
                      if (isModifiedEvent(e)) return;
                      e.preventDefault();
                      onSelect(child as AdminNavItem);
                    }}
                    onMouseEnter={() => setSubHoveredId(child.id)}
                    onMouseLeave={() => setSubHoveredId(null)}
                    animate={{
                      backgroundColor: subBg,
                      color: subFg,
                      opacity: subOpacity,
                    }}
                    transition={{ duration: 0.12 }}
                    className="flex items-center rounded-lg py-2 pl-10 pr-3 text-sm w-full"
                  >
                    {child.label}
                  </motion.a>
                </li>
              );
            })}
          </motion.ul>
        </motion.div>
      </li>
    );
  };

  return (
    <aside
      className="fixed left-0 top-0 z-30 h-screen bg-[hsl(var(--sidebar-bg))] flex flex-col overflow-hidden transition-[width] duration-200 ease-out will-change-[width]"
      style={{ width }}
    >
      <div
        className={`h-14 sm:h-16 flex items-center ${collapsed ? 'justify-center px-0' : 'justify-between px-4'}`}
      >
        {headerTitle}
        {canToggle && (
          <motion.button
            type="button"
            onClick={onToggle}
            whileTap={{ scale: 0.96 }}
            onMouseEnter={() => setToggleHovered(true)}
            onMouseLeave={() => setToggleHovered(false)}
            animate={{ backgroundColor: toggleHovered ? 'hsl(var(--sidebar-hover))' : 'transparent' }}
            transition={{ duration: DURATION_FAST, ease: EASE_STANDARD }}
            className="p-2 rounded-lg text-[hsl(var(--sidebar-fg))]"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </motion.button>
        )}
      </div>

      <nav className="px-2 py-3 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-1">
          {items.map((item) => {
            if (isNavParent(item)) {
              return renderParentItem(item);
            }
            return renderLeafItem(item);
          })}
        </ul>
      </nav>
    </aside>
  );
}
