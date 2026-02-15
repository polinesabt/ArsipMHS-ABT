import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Year } from '@/data/insightMockData';

interface InsightDashboardContextType {
  selectedYear: Year | 'all';
  setSelectedYear: (year: Year | 'all') => void;
  presentationMode: boolean;
  setPresentationMode: (mode: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
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

  return (
    <InsightDashboardContext.Provider
      value={{
        selectedYear,
        setSelectedYear,
        presentationMode,
        setPresentationMode,
        sidebarCollapsed,
        setSidebarCollapsed,
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