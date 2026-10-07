import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAlumni } from '@/contexts/AlumniContext';
import { invalidateInsightCache } from '@/lib/insight-cache-event';
import {
  DEMO_DUMMY_DATA_ADDED_EVENT,
  generateDemoDummyData,
  resolveDemoDummyTarget,
  type DemoDummyGenerationResult,
  type DemoDummyTarget,
  type DemoDummyTargetId,
  type DemoDummyVariant,
} from '@/lib/sandbox';

interface DemoDummyDataContextValue {
  target: DemoDummyTarget | null;
  activeVariant?: DemoDummyVariant;
  activeYear?: number;
  isGenerating: boolean;
  setTargetVariant: (targetId: DemoDummyTargetId, variant?: DemoDummyVariant) => void;
  setTargetYear: (targetId: DemoDummyTargetId, year?: number) => void;
  generate: () => Promise<DemoDummyGenerationResult>;
}

const DemoDummyDataContext = createContext<DemoDummyDataContextValue | null>(null);

export function DemoDummyDataProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { isDemoMode } = useAlumni();
  const [isGenerating, setIsGenerating] = useState(false);
  const [variantByTarget, setVariantByTarget] = useState<Partial<Record<DemoDummyTargetId, DemoDummyVariant>>>({});
  const [yearByTarget, setYearByTarget] = useState<Partial<Record<DemoDummyTargetId, number>>>({});

  const resolvedTarget = useMemo(() => resolveDemoDummyTarget(pathname), [pathname]);
  const target = isDemoMode ? resolvedTarget : null;
  const activeVariant = target ? variantByTarget[target.id] ?? target.defaultVariant : undefined;
  const activeYear = target ? yearByTarget[target.id] : undefined;

  const setTargetVariant = useCallback((targetId: DemoDummyTargetId, variant?: DemoDummyVariant) => {
    setVariantByTarget((current) => {
      if (!variant) {
        const next = { ...current };
        delete next[targetId];
        return next;
      }
      if (current[targetId] === variant) return current;
      return { ...current, [targetId]: variant };
    });
  }, []);

  const setTargetYear = useCallback((targetId: DemoDummyTargetId, year?: number) => {
    setYearByTarget((current) => {
      if (!year) {
        if (current[targetId] === undefined) return current;
        const next = { ...current };
        delete next[targetId];
        return next;
      }
      if (current[targetId] === year) return current;
      return { ...current, [targetId]: year };
    });
  }, []);

  const generate = useCallback(async () => {
    if (!target) throw new Error('Modul ini tidak mendukung penambahan data dummy.');
    if (isGenerating) throw new Error('Penambahan data dummy masih berlangsung.');
    setIsGenerating(true);
    try {
      const generated = await generateDemoDummyData(target, activeVariant, activeYear);
      invalidateInsightCache();
      window.dispatchEvent(new CustomEvent(DEMO_DUMMY_DATA_ADDED_EVENT, {
        detail: { ...generated, variant: activeVariant },
      }));
      if (target.id.startsWith('dosen-') || target.id === 'tendik') {
        window.dispatchEvent(new Event('dosen:refresh'));
      }
      return generated;
    } finally {
      setIsGenerating(false);
    }
  }, [activeVariant, activeYear, isGenerating, target]);

  const value = useMemo<DemoDummyDataContextValue>(() => ({
    target,
    activeVariant,
    activeYear,
    isGenerating,
    setTargetVariant,
    setTargetYear,
    generate,
  }), [activeVariant, activeYear, generate, isGenerating, setTargetVariant, setTargetYear, target]);

  return <DemoDummyDataContext.Provider value={value}>{children}</DemoDummyDataContext.Provider>;
}

export function useDemoDummyData(): DemoDummyDataContextValue {
  const context = useContext(DemoDummyDataContext);
  if (!context) throw new Error('useDemoDummyData must be used within DemoDummyDataProvider');
  return context;
}

export function useOptionalDemoDummyData(): DemoDummyDataContextValue | null {
  return useContext(DemoDummyDataContext);
}
