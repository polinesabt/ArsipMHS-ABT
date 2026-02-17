import React, { useState, type MouseEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, PanelLeft, PanelLeftClose } from 'lucide-react';
import type { AdminNavItem, AdminNavItemLeaf } from '@/components/admin/admin-nav.types';
import { isNavParent } from '@/components/admin/admin-nav.types';
import { cn } from '@/lib/utils';

const DASHBOARD_PARENT_ID = 'admin-dashboard';
const STORAGE_KEY = 'admin-sidebar-dashboard-expanded';

/** Softer easing for all sidebar motion */
const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;
const WIDTH_SPRING = { type: 'spring' as const, stiffness: 280, damping: 28 };
const WIDTH_DURATION_MS = 280;
const TEXT_REVEAL_DURATION_MS = 200;
const TEXT_REVEAL_DELAY_MS = 90;
const HEADER_TEXT_DELAY_MS = 100;
const ICON_CROSSFADE_MS = 200;

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

function getActiveChildForParent(
  pathname: string,
  children: AdminNavItemLeaf[]
): { activeChild: AdminNavItemLeaf | null; parentHasActiveChild: boolean } {
  const activeChild =
    children.find(
      (c) =>
        pathname === c.path ||
        (c.path !== '/admin' && pathname.startsWith(c.path))
    ) ?? null;
  return {
    activeChild,
    parentHasActiveChild: activeChild !== null,
  };
}

export function SidebarNav({
  items,
  activeId,
  collapsed,
  onToggle,
  canToggle = true,
  onSelect,
  title,
  collapsedWidth = 80,
  expandedWidth = 260,
}: SidebarNavProps) {
  const { pathname } = useLocation();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [subHoveredId, setSubHoveredId] = useState<string | null>(null);

  const [dashboardExpanded, setDashboardExpanded] = useState(false);

  const toggleDashboard = () => {
    setDashboardExpanded((prev) => {
      const next = !prev;
      writeStoredDashboardExpanded(next);
      return next;
    });
  };

  const isParentExpanded = (item: AdminNavItem) =>
    item.id === DASHBOARD_PARENT_ID && dashboardExpanded;

  const widthTransition = {
    type: 'tween' as const,
    duration: WIDTH_DURATION_MS / 1000,
    ease: EASE_PREMIUM,
  };
  const widthSpringTransition = WIDTH_SPRING;

  const navTransition = {
    type: 'tween' as const,
    duration: TEXT_REVEAL_DURATION_MS / 1000,
    ease: EASE_PREMIUM,
  };

  const currentWidth = collapsed ? collapsedWidth : expandedWidth;

  return (
    <motion.aside
      className="fixed left-0 top-0 z-30 h-screen flex flex-col overflow-hidden shrink-0"
      initial={false}
      animate={{ width: currentWidth }}
      transition={widthSpringTransition}
      style={{
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        backgroundColor: 'hsl(var(--sidebar-bg) / 0.92)',
        borderRight: '1px solid hsl(var(--sidebar-border) / 0.6)',
        boxShadow:
          'inset 1px 0 0 0 hsl(0 0% 100% / 0.04), 4px 0 24px -4px rgba(0,0,0,0.2), 8px 0 32px -8px rgba(0,0,0,0.12)',
      }}
    >
      {/* Header: blue dashboard icon = only toggle; collapsed = logo only, expanded = logo + title */}
      <header
        className={`h-14 sm:h-16 flex items-center flex-shrink-0 border-b border-[hsl(var(--sidebar-border)/0.5)] ${
          collapsed ? 'justify-center px-0' : 'pl-3 pr-4'
        }`}
      >
        <div
          className={`flex items-center min-w-0 ${collapsed ? 'justify-center' : 'flex-1'}`}
        >
          <motion.button
            type="button"
            onClick={canToggle ? onToggle : undefined}
            disabled={!canToggle}
            className={cn(
              'flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--sidebar-bg))] cursor-pointer disabled:cursor-default disabled:opacity-90',
              collapsed
                ? 'bg-emerald-500/15 text-emerald-400/95 hover:bg-emerald-500/25 focus-visible:ring-emerald-500/50'
                : 'bg-red-500/15 text-red-400/95 hover:bg-red-500/25 focus-visible:ring-red-500/50'
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className="relative w-5 h-5 flex items-center justify-center">
              <AnimatePresence mode="wait" initial={false}>
                {collapsed ? (
                  <motion.span
                    key="open"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: ICON_CROSSFADE_MS / 1000, ease: EASE_PREMIUM }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <PanelLeft className="w-5 h-5" aria-hidden />
                  </motion.span>
                ) : (
                  <motion.span
                    key="close"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: ICON_CROSSFADE_MS / 1000, ease: EASE_PREMIUM }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <PanelLeftClose className="w-5 h-5" aria-hidden />
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </motion.button>
          <motion.span
            className="text-xs font-bold tracking-wide text-[hsl(var(--sidebar-fg))] whitespace-nowrap ml-0"
            animate={{
              opacity: collapsed ? 0 : 1,
              width: collapsed ? 0 : 'auto',
              x: collapsed ? -8 : 0,
              marginLeft: collapsed ? 0 : 10,
            }}
            transition={{
              opacity: { duration: TEXT_REVEAL_DURATION_MS / 1000, ease: EASE_PREMIUM, delay: collapsed ? 0 : HEADER_TEXT_DELAY_MS / 1000 },
              width: widthTransition,
              x: { duration: TEXT_REVEAL_DURATION_MS / 1000, ease: EASE_PREMIUM, delay: collapsed ? 0 : HEADER_TEXT_DELAY_MS / 1000 },
              marginLeft: widthTransition,
            }}
            style={{
              overflow: 'hidden',
              pointerEvents: collapsed ? 'none' : 'auto',
            }}
            aria-hidden={collapsed}
          >
            {title}
          </motion.span>
        </div>
      </header>

      <nav className="px-2 py-3 overflow-y-auto overflow-x-hidden flex-1 min-h-0">
        <ul className="space-y-1">
          {items.map((item, index) => {
            if (isNavParent(item)) {
              const { activeChild, parentHasActiveChild } = getActiveChildForParent(
                pathname,
                item.children
              );
              return (
                <ParentNavItem
                  key={item.id}
                  item={item}
                  index={index}
                  activeId={activeId}
                  activeChild={activeChild}
                  parentHasActiveChild={parentHasActiveChild}
                  collapsed={collapsed}
                  hoveredId={hoveredId}
                  subHoveredId={subHoveredId}
                  setHoveredId={setHoveredId}
                  setSubHoveredId={setSubHoveredId}
                  isParentExpanded={isParentExpanded(item)}
                  onToggleDashboard={toggleDashboard}
                  pathname={pathname}
                  onSelect={onSelect}
                  widthTransition={widthTransition}
                  navTransition={navTransition}
                  textRevealDelay={(index + 1) * (TEXT_REVEAL_DELAY_MS / 1000)}
                />
              );
            }
            return (
              <LeafNavItem
                key={item.id}
                item={item as AdminNavItem & { path: string }}
                index={index}
                activeId={activeId}
                collapsed={collapsed}
                hoveredId={hoveredId}
                setHoveredId={setHoveredId}
                onSelect={onSelect}
                widthTransition={widthTransition}
                navTransition={navTransition}
                textRevealDelay={(index + 1) * (TEXT_REVEAL_DELAY_MS / 1000)}
              />
            );
          })}
        </ul>
      </nav>
    </motion.aside>
  );
}

function isModifiedEventInner(event: MouseEvent<HTMLAnchorElement>) {
  return event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;
}

function LeafNavItem({
  item,
  index,
  activeId,
  collapsed,
  hoveredId,
  setHoveredId,
  onSelect,
  widthTransition,
  navTransition,
  textRevealDelay,
}: {
  item: AdminNavItem & { path: string };
  index: number;
  activeId: string;
  collapsed: boolean;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  onSelect: (item: AdminNavItem) => void;
  widthTransition: { type: 'tween'; duration: number; ease: readonly number[] };
  navTransition: { type: 'tween'; duration: number; ease: readonly number[] };
  textRevealDelay: number;
}) {
  const isActive = activeId === item.id;
  const isHovered = hoveredId === item.id;

  return (
    <li>
      <motion.a
        href={item.path}
        onClick={(e) => {
          if (isModifiedEventInner(e)) return;
          e.preventDefault();
          onSelect(item);
        }}
        whileTap={{ scale: 0.985 }}
        onMouseEnter={() => setHoveredId(item.id)}
        onMouseLeave={() => setHoveredId(null)}
        className="relative w-full flex items-center rounded-lg py-2.5 overflow-hidden cursor-pointer"
      >
        {/* Hover background (scaleX left → right) */}
        <motion.div
          className="absolute inset-0 rounded-lg bg-[hsl(var(--sidebar-hover)/0.6)] origin-left"
          initial={false}
          animate={{ scaleX: isHovered && !isActive ? 1 : 0 }}
          transition={navTransition}
          style={{ transformOrigin: 'left' }}
        />
        {/* Active indicator rail: always visible, beside icon */}
        {isActive && (
          <motion.div
            layoutId="sidebar-active-rail"
            className="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r-full bg-[hsl(var(--sidebar-primary))] origin-top"
            initial={false}
            transition={{
              layout: { duration: 0.24, ease: EASE_PREMIUM },
              scaleY: { duration: 0.18, ease: EASE_PREMIUM },
            }}
          />
        )}
        <span
          className={`relative flex items-center w-full min-w-0 ${
            collapsed ? 'justify-center px-0 gap-0' : 'gap-3 px-3'
          }`}
        >
          <motion.div
            className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
            animate={{
              scale: isHovered || isActive ? 1.05 : 1,
              backgroundColor: isActive
                ? 'hsl(var(--sidebar-primary) / 0.25)'
                : isHovered
                  ? 'rgba(255,255,255,0.05)'
                  : 'transparent',
            }}
            transition={navTransition}
          >
            <motion.div
              className="flex items-center justify-center"
              animate={{
                x: isHovered && !isActive ? 4 : 0,
                color: isActive ? 'hsl(0 0% 100%)' : 'hsl(var(--sidebar-fg))',
              }}
              transition={navTransition}
            >
              <item.icon className="w-5 h-5" />
            </motion.div>
          </motion.div>
          <motion.span
            className="text-sm font-medium whitespace-nowrap text-[hsl(var(--sidebar-fg))]"
            animate={{
              opacity: collapsed ? 0 : isActive || isHovered ? 1 : 0.7,
              width: collapsed ? 0 : 'auto',
              x: collapsed ? -8 : 0,
            }}
            transition={{
              opacity: {
                duration: TEXT_REVEAL_DURATION_MS / 1000,
                ease: EASE_PREMIUM,
                delay: collapsed ? 0 : textRevealDelay,
              },
              width: widthTransition,
              x: { duration: widthTransition.duration, ease: EASE_PREMIUM },
            }}
            style={{
              overflow: 'hidden',
              pointerEvents: collapsed ? 'none' : 'auto',
            }}
            aria-hidden={collapsed}
          >
            {item.label}
          </motion.span>
        </span>
        <AnimatePresence>
          {collapsed && isHovered && (
            <motion.div
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={navTransition}
              className="absolute left-full top-1/2 -translate-y-1/2 ml-2 rounded-md shadow-lg px-2.5 py-1.5 text-xs font-medium z-50"
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
}

function ParentNavItem({
  item,
  index,
  activeId,
  activeChild,
  parentHasActiveChild,
  collapsed,
  hoveredId,
  subHoveredId,
  setHoveredId,
  setSubHoveredId,
  isParentExpanded,
  onToggleDashboard,
  pathname,
  onSelect,
  widthTransition,
  navTransition,
  textRevealDelay,
}: {
  item: AdminNavItem & { children: AdminNavItemLeaf[] };
  index: number;
  activeId: string;
  activeChild: AdminNavItemLeaf | null;
  parentHasActiveChild: boolean;
  collapsed: boolean;
  hoveredId: string | null;
  subHoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  setSubHoveredId: (id: string | null) => void;
  isParentExpanded: boolean;
  onToggleDashboard: () => void;
  pathname: string;
  onSelect: (item: AdminNavItem) => void;
  widthTransition: { type: 'tween'; duration: number; ease: readonly number[] };
  navTransition: { type: 'tween'; duration: number; ease: readonly number[] };
  textRevealDelay: number;
}) {
  const isParentExactActive = activeId === item.id;
  const isParentActive = isParentExactActive || parentHasActiveChild;
  const isHovered = hoveredId === item.id;
  const ChildIcon = activeChild ? (activeChild.icon ?? item.icon) : item.icon;

  const parentPath = 'path' in item ? item.path : undefined;

  const handleParentClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isModifiedEventInner(e.nativeEvent as MouseEvent<HTMLAnchorElement>)) return;
    e.preventDefault();
    if (collapsed) {
      if (parentPath) onSelect(item as AdminNavItem);
    } else {
      onToggleDashboard();
    }
  };

  return (
    <li>
      <div
        className="relative w-full flex items-center rounded-lg overflow-hidden font-medium"
        onMouseEnter={() => setHoveredId(item.id)}
        onMouseLeave={() => setHoveredId(null)}
      >
        {isParentExactActive && (
          <motion.div
            layoutId="sidebar-active-rail"
            className="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r-full bg-[hsl(var(--sidebar-primary))] origin-top"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{
              layout: { duration: 0.22, ease: EASE_PREMIUM },
              scaleY: { duration: 0.2, ease: EASE_PREMIUM },
            }}
          />
        )}
        {parentHasActiveChild && !isParentExactActive && (
          <motion.div
            className="absolute left-0 top-[22%] bottom-[22%] w-[2px] rounded-r-full bg-[hsl(var(--sidebar-primary)/0.6)] origin-top"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.18, ease: EASE_PREMIUM }}
            aria-hidden
          />
        )}
        <motion.div
          className="absolute inset-0 rounded-lg origin-left"
          initial={false}
          animate={{
            scaleX: isHovered ? 1 : 0,
            backgroundColor: isHovered
              ? 'hsl(var(--sidebar-hover) / 0.5)'
              : isParentActive
                ? 'hsl(var(--sidebar-primary) / 0.15)'
                : 'transparent',
          }}
          transition={navTransition}
          style={{ transformOrigin: 'left' }}
        />
        <motion.a
          href={collapsed && parentPath ? parentPath : '#'}
          onClick={handleParentClick}
          className={cn(
            'relative flex flex-1 items-center min-w-0 py-2.5 cursor-pointer',
            collapsed ? 'justify-center px-0 gap-0' : 'pl-3 gap-3'
          )}
          aria-expanded={!collapsed ? isParentExpanded : undefined}
          aria-label={
            collapsed
              ? `Buka ${item.label}`
              : isParentExpanded
                ? 'Tutup submenu Dashboard Admin'
                : 'Buka submenu Dashboard Admin'
          }
        >
          <motion.div
            className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
            animate={{
              scale: isHovered ? 1.05 : 1,
              backgroundColor: isHovered
                ? 'rgba(255,255,255,0.05)'
                : isParentActive
                  ? 'hsl(var(--sidebar-primary) / 0.2)'
                  : 'transparent',
            }}
            transition={navTransition}
          >
            <motion.div
              className="flex items-center justify-center text-[hsl(var(--sidebar-fg))]"
              animate={{ x: isHovered ? 4 : 0 }}
              transition={navTransition}
            >
              <item.icon className="w-5 h-5" />
            </motion.div>
          </motion.div>
          <motion.span
            className="text-sm whitespace-nowrap text-[hsl(var(--sidebar-fg))] min-w-0"
            animate={{
              opacity: collapsed ? 0 : 1,
              width: collapsed ? 0 : 'auto',
              x: collapsed ? -8 : 0,
            }}
            transition={{
              opacity: {
                duration: TEXT_REVEAL_DURATION_MS / 1000,
                ease: EASE_PREMIUM,
                delay: collapsed ? 0 : textRevealDelay,
              },
              width: widthTransition,
              x: { duration: widthTransition.duration, ease: EASE_PREMIUM },
            }}
            style={{
              overflow: 'hidden',
              pointerEvents: collapsed ? 'none' : 'auto',
            }}
            aria-hidden={collapsed}
          >
            {item.label}
          </motion.span>
          {!collapsed && (
            <motion.span
              className="ml-auto flex-shrink-0 text-[hsl(var(--sidebar-fg))]"
              animate={{ rotate: isParentExpanded ? 90 : 0 }}
              transition={navTransition}
            >
              <ChevronRight className="h-4 w-4" />
            </motion.span>
          )}
        </motion.a>
        <AnimatePresence>
          {collapsed && isHovered && (
            <motion.div
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={navTransition}
              className="absolute left-full top-1/2 -translate-y-1/2 ml-2 rounded-md shadow-lg px-2.5 py-1.5 text-xs font-medium z-50 pointer-events-none"
              style={{
                backgroundColor: 'hsl(var(--foreground))',
                color: 'hsl(var(--background))',
              }}
            >
              {item.label}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Expanded: full children list */}
      {!collapsed && (
        <motion.div
          initial={false}
          animate={{
            height: isParentExpanded ? 'auto' : 0,
            opacity: isParentExpanded ? 1 : 0,
          }}
          transition={{
            height: { duration: 0.2, ease: EASE_PREMIUM },
            opacity: { duration: 0.18, ease: EASE_PREMIUM },
          }}
          className="overflow-hidden"
        >
          <motion.ul
            initial={false}
            animate={{ y: isParentExpanded ? 0 : -4 }}
            transition={{ duration: 0.18, ease: EASE_PREMIUM }}
            className="space-y-0.5 pt-0.5"
          >
            {item.children.map((child) => {
              const isChildActive =
                pathname === child.path ||
                (child.path !== '/admin' && pathname.startsWith(child.path));
              const isChildHovered = subHoveredId === child.id;
              const subBg = isChildActive
                ? 'hsl(var(--sidebar-active) / 0.9)'
                : isChildHovered
                  ? 'hsl(var(--sidebar-hover) / 0.5)'
                  : 'transparent';
              const subFg = isChildActive ? 'hsl(0 0% 100%)' : 'hsl(var(--sidebar-fg))';
              const ChildIconComponent = child.icon ?? item.icon;

              return (
                <li key={child.id}>
                  <motion.a
                    href={child.path}
                    onClick={(e) => {
                      if (isModifiedEventInner(e.nativeEvent as MouseEvent<HTMLAnchorElement>)) return;
                      e.preventDefault();
                      onSelect(child as AdminNavItem);
                    }}
                    whileTap={{ scale: 0.985 }}
                    onMouseEnter={() => setSubHoveredId(child.id)}
                    onMouseLeave={() => setSubHoveredId(null)}
                    animate={{ backgroundColor: subBg, color: subFg }}
                    transition={navTransition}
                    className="relative flex items-center gap-3 rounded-lg py-2 pl-9 pr-3 text-sm w-full overflow-hidden cursor-pointer"
                  >
                    {/* Hover background (scaleX left → right), sama seperti tombol lain */}
                    <motion.div
                      className="absolute inset-0 rounded-lg bg-[hsl(var(--sidebar-hover)/0.6)] origin-left"
                      initial={false}
                      animate={{ scaleX: isChildHovered && !isChildActive ? 1 : 0 }}
                      transition={navTransition}
                      style={{ transformOrigin: 'left' }}
                    />
                    {isChildActive && (
                      <span
                        className="absolute left-0 top-[18%] bottom-[18%] w-[3px] rounded-r-full bg-[hsl(var(--sidebar-primary))]"
                        aria-hidden
                      />
                    )}
                    <motion.span
                      className="relative flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                      animate={{
                        scale: isChildHovered || isChildActive ? 1.05 : 1,
                        backgroundColor: isChildActive
                          ? 'hsl(var(--sidebar-primary) / 0.3)'
                          : isChildHovered
                            ? 'rgba(255,255,255,0.05)'
                            : 'hsl(var(--sidebar-hover) / 0.3)',
                      }}
                      transition={navTransition}
                    >
                      <motion.div
                        className="flex items-center justify-center"
                        animate={{
                          x: isChildHovered && !isChildActive ? 4 : 0,
                          color: isChildActive ? 'hsl(0 0% 100%)' : 'hsl(var(--sidebar-fg))',
                        }}
                        transition={navTransition}
                      >
                        <ChildIconComponent className="w-4 h-4" />
                      </motion.div>
                    </motion.span>
                    <span className="relative font-medium truncate">{child.label}</span>
                  </motion.a>
                </li>
              );
            })}
          </motion.ul>
        </motion.div>
      )}

      {/* Collapsed: only active child, icon-only, indented */}
      {collapsed && (
        <AnimatePresence mode="wait">
          {activeChild ? (
            <motion.div
              key={activeChild.id}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: EASE_PREMIUM }}
              className="overflow-hidden"
            >
              <motion.a
                href={activeChild.path}
                onClick={(e) => {
                  if (isModifiedEventInner(e.nativeEvent as MouseEvent<HTMLAnchorElement>)) return;
                  e.preventDefault();
                  onSelect(activeChild as AdminNavItem);
                }}
                whileTap={{ scale: 0.985 }}
                onMouseEnter={() => setSubHoveredId(activeChild.id)}
                onMouseLeave={() => setSubHoveredId(null)}
                className="relative flex items-center justify-center rounded-lg py-2 mt-0.5 ml-3 w-9 h-9 min-h-[2.25rem] bg-[hsl(var(--sidebar-active)/0.9)] text-[hsl(0_0%_100%)] cursor-pointer"
                title={activeChild.label}
              >
                <ChildIcon className="w-5 h-5 shrink-0" />
              </motion.a>
            </motion.div>
          ) : null}
        </AnimatePresence>
      )}
    </li>
  );
}
