import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { Year } from '@/types/insight';

interface InsightDashboardContextType {
  selectedYear: Year | 'all';
  setSelectedYear: (year: Year | 'all') => void;
  presentationMode: boolean;
  setPresentationMode: (mode: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  // New: Cache invalidation trigger
  refreshTrigger: number;
  invalidateCache: () => void;
}

interface InsightDashboardProviderProps {
  children: ReactNode;
  initialSelectedYear?: Year | 'all';
  initialPresentationMode?: boolean;
  initialSidebarCollapsed?: boolean;
}

const InsightDashboardContext = createContext<InsightDashboardContextType | undefined>(undefined);

export function InsightDashboardProvider({
  children,
  initialSelectedYear = 'all',
  initialPresentationMode = false,
  initialSidebarCollapsed = false,
}: InsightDashboardProviderProps) {
  const [selectedYear, setSelectedYear] = useState<Year | 'all'>(initialSelectedYear);
  const [presentationMode, setPresentationMode] = useState(initialPresentationMode);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(initialSidebarCollapsed);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const invalidateCache = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <InsightDashboardContext.Provider
      value={{
        selectedYear,
        setSelectedYear,
        presentationMode,
        setPresentationMode,
        sidebarCollapsed,
        setSidebarCollapsed,
        refreshTrigger,
        invalidateCache,
      }}
    >
      {children}
    </InsightDashboardContext.Provider>
  );
}

export function useInsightDashboard() {
  const context = useContext(InsightDashboardContext);
  if (context === undefined) {
    throw new Error('useInsightDashboard must be used within an InsightDashboardProvider');
  }
  return context;
}
