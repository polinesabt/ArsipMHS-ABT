import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const SIDEBAR_STORAGE_KEY = 'sipal-admin-sidebar-collapsed';

interface AdminSidebarContextValue {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
}

interface AdminSidebarProviderProps {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}

const AdminSidebarContext = createContext<AdminSidebarContextValue | undefined>(undefined);

function getInitialCollapsed(defaultCollapsed: boolean) {
  if (typeof window === 'undefined') {
    return defaultCollapsed;
  }

  const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
  if (stored === null) {
    return defaultCollapsed;
  }

  return stored === 'true';
}

export function AdminSidebarProvider({ children, defaultCollapsed = true }: AdminSidebarProviderProps) {
  const [collapsed, setCollapsed] = useState<boolean>(() => getInitialCollapsed(defaultCollapsed));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({
      collapsed,
      setCollapsed,
      toggleCollapsed,
    }),
    [collapsed, setCollapsed, toggleCollapsed]
  );

  return (
    <AdminSidebarContext.Provider value={value}>
      {children}
    </AdminSidebarContext.Provider>
  );
}

export function useAdminSidebar() {
  const context = useContext(AdminSidebarContext);
  if (!context) {
    throw new Error('useAdminSidebar must be used within AdminSidebarProvider');
  }
  return context;
}
