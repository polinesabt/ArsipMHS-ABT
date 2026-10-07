import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts';
import { m, useReducedMotion } from 'framer-motion';
import { AnimatedKpiValue } from '@/components/chart/AnimatedKpiValue';
import { MotionChartContainer } from '@/components/chart/MotionChartContainer';
import { ChartTooltip, PieChartTooltip } from '@/components/insight/dashboard/ChartTooltip';
import { InsightDataEmpty } from '@/components/insight/InsightDataEmpty';
import { createFallbackBarRect, type RectGeometry } from './student-achievement-morph-utils';

export type AchievementAnalysisMode = 'all' | 'academic' | 'nonAcademic';
export type AchievementBreakdownLevel = 'local' | 'national' | 'international';

export interface AchievementBreakdownRow {
  key: AchievementBreakdownLevel;
  name: string;
  count: number;
  fill: string;
}

interface AchievementPieRow {
  type: 'academic' | 'non_academic';
  name: string;
  value: number;
  fill: string;
}

interface MorphGeometry {
  id: number;
  direction: 'to-detail' | 'to-all';
  origin: { x: number; y: number };
  targets: RectGeometry[];
}

interface StudentAchievementMorphChartProps {
  mode: AchievementAnalysisMode;
  pieRows: AchievementPieRow[];
  academicRows: AchievementBreakdownRow[];
  nonAcademicRows: AchievementBreakdownRow[];
  total: number;
  isMobile: boolean;
  onModeChange: (mode: AchievementAnalysisMode) => void;
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const LEVEL_KEYS: AchievementBreakdownLevel[] = ['local', 'national', 'international'];

function relativeRect(element: Element | null, container: DOMRect): RectGeometry | null {
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  if (!Number.isFinite(rect.left) || rect.width <= 0) return null;
  return {
    x: rect.left - container.left,
    y: rect.top - container.top,
    width: rect.width,
    height: Math.max(rect.height, 2),
  };
}

function BreakdownChart({
  rows,
  isMobile,
  interactive,
  animateGeometry,
}: {
  rows: AchievementBreakdownRow[];
  isMobile: boolean;
  interactive: boolean;
  animateGeometry: boolean;
}) {
  return (
    <MotionChartContainer
      width="100%"
      height="100%"
      interactive={interactive}
      animateGeometry={animateGeometry}
      chartAnimationDuration={500}
    >
      <BarChart data={rows} margin={isMobile ? { top: 12, right: 8, left: 0, bottom: 0 } : { top: 20, right: 20, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: isMobile ? 10 : 12 }} axisLine={{ stroke: 'hsl(var(--border))' }} />
        <YAxis allowDecimals={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: isMobile ? 10 : 12 }} axisLine={{ stroke: 'hsl(var(--border))' }} />
        <Tooltip content={<ChartTooltip />} />
        <Bar activeBar dataKey="count" name="Jumlah" radius={[6, 6, 0, 0]}>
          {rows.map((row) => (
            <Cell
              key={row.key}
              fill={row.fill}
              className={`achievement-breakdown-bar achievement-breakdown-bar-${row.key}`}
            />
          ))}
        </Bar>
      </BarChart>
    </MotionChartContainer>
  );
}

export function StudentAchievementMorphChart({
  mode,
  pieRows,
  academicRows,
  nonAcademicRows,
  total,
  isMobile,
  onModeChange,
}: StudentAchievementMorphChartProps) {
  const reducedMotion = Boolean(useReducedMotion());
  const stageRef = useRef<HTMLDivElement>(null);
  const previousModeRef = useRef<AchievementAnalysisMode>(mode);
  const morphIdRef = useRef(0);
  const morphRef = useRef<MorphGeometry | null>(null);
  const detailTimerRef = useRef<number>();
  const [displayedDetailMode, setDisplayedDetailMode] = useState<'academic' | 'nonAcademic'>(
    mode === 'nonAcademic' ? 'nonAcademic' : 'academic',
  );
  const [morph, setMorph] = useState<MorphGeometry | null>(null);
  const [semanticPending, setSemanticPending] = useState(false);
  const [detailAnimating, setDetailAnimating] = useState(false);
  const [, setStageSize] = useState({ width: 0, height: 0 });

  const detailRows = displayedDetailMode === 'academic' ? academicRows : nonAcademicRows;
  const detailTotal = useMemo(() => detailRows.reduce((sum, row) => sum + row.count, 0), [detailRows]);

  const measureMorph = useCallback((
    direction: MorphGeometry['direction'],
    selectedMode: 'academic' | 'nonAcademic',
    selectedRows: AchievementBreakdownRow[],
  ) => {
    const stage = stageRef.current;
    if (!stage) return;
    const stageRect = stage.getBoundingClientRect();
    const selectedType = selectedMode === 'academic' ? 'academic' : 'non_academic';
    const pieRect = relativeRect(stage.querySelector(`.achievement-pie-sector-${selectedType}`), stageRect);
    const origin = pieRect
      ? { x: pieRect.x + pieRect.width / 2, y: pieRect.y + pieRect.height / 2 }
      : { x: stageRect.width / 2, y: stageRect.height / 2 };
    const maxValue = Math.max(0, ...selectedRows.map((row) => row.count));
    const targets = LEVEL_KEYS.map((key, index) => (
      relativeRect(stage.querySelector(`.achievement-breakdown-bar-${key}`), stageRect)
      ?? createFallbackBarRect(index, selectedRows[index]?.count ?? 0, maxValue, stageRect.width, stageRect.height)
    ));

    const id = ++morphIdRef.current;
    const nextMorph = { id, direction, origin, targets };
    morphRef.current = nextMorph;
    setMorph(nextMorph);
    setSemanticPending(false);
  }, []);

  useLayoutEffect(() => {
    const previousMode = previousModeRef.current;
    if (previousMode === mode) return;
    previousModeRef.current = mode;
    window.clearTimeout(detailTimerRef.current);

    const isSemanticTransition = previousMode === 'all' || mode === 'all';
    const redirectsActiveMorph = Boolean(morphRef.current) && mode !== 'all';
    if (!isSemanticTransition && !redirectsActiveMorph) {
      setDisplayedDetailMode(mode as 'academic' | 'nonAcademic');
      morphRef.current = null;
      setMorph(null);
      setSemanticPending(false);
      setDetailAnimating(!reducedMotion);
      if (!reducedMotion) {
        detailTimerRef.current = window.setTimeout(() => setDetailAnimating(false), 520);
      }
      return;
    }

    const selectedMode = (mode === 'all' ? previousMode : mode) as 'academic' | 'nonAcademic';
    if (mode !== 'all') setDisplayedDetailMode(selectedMode);
    setDetailAnimating(false);
    setSemanticPending(!reducedMotion);

    if (reducedMotion) {
      morphRef.current = null;
      setMorph(null);
      setSemanticPending(false);
      return;
    }

    const selectedRows = selectedMode === 'academic' ? academicRows : nonAcademicRows;
    const sliceAnimations: Animation[] = [];
    const stage = stageRef.current;
    if (previousMode === 'all') {
      const selectedType = selectedMode === 'academic' ? 'academic' : 'non_academic';
      const selectedSlice = stage?.querySelector(`.achievement-pie-sector-${selectedType}`);
      if (selectedSlice && 'animate' in selectedSlice) {
        const selectedStyle = (selectedSlice as SVGElement).style;
        selectedStyle.setProperty('transform-box', 'fill-box');
        selectedStyle.setProperty('transform-origin', 'center');
        sliceAnimations.push(selectedSlice.animate(
          [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(1.045)', opacity: 1 }],
          { duration: 120, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' },
        ));
      }
      stage?.querySelectorAll('.achievement-pie-sector').forEach((slice) => {
        if (slice === selectedSlice || !('animate' in slice)) return;
        sliceAnimations.push(slice.animate(
          [{ opacity: 1 }, { opacity: 0.38 }],
          { duration: 120, easing: 'ease-out', fill: 'forwards' },
        ));
      });
    }

    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        measureMorph(mode === 'all' ? 'to-all' : 'to-detail', selectedMode, selectedRows);
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      sliceAnimations.forEach((animation) => animation.cancel());
      if (previousMode === 'all') {
        stage?.querySelectorAll('.achievement-pie-sector').forEach((slice) => {
          (slice as SVGElement).style.removeProperty('transform-box');
          (slice as SVGElement).style.removeProperty('transform-origin');
        });
      }
    };
  }, [academicRows, measureMorph, mode, nonAcademicRows, reducedMotion]);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setStageSize((current) => current.width === width && current.height === height ? current : { width, height });
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => window.clearTimeout(detailTimerRef.current), []);

  const semanticTransitionPending = previousModeRef.current !== mode
    && (previousModeRef.current === 'all' || mode === 'all');
  const isMorphing = Boolean(morph) || semanticPending || semanticTransitionPending;
  const pieVisible = mode === 'all';
  const barVisible = mode !== 'all';
  const layerDuration = reducedMotion ? 0.08 : 0.22;

  return (
    <div ref={stageRef} className="relative mx-auto h-[300px] w-full max-w-[620px] overflow-hidden sm:h-[320px]">
      <m.div
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: pieVisible ? 1 : 0, scale: pieVisible ? 1 : 0.985 }}
        transition={{ duration: layerDuration, delay: reducedMotion ? 0 : pieVisible ? 0.34 : 0.04, ease: EASE_OUT }}
        style={{ pointerEvents: pieVisible && !isMorphing ? 'auto' : 'none' }}
        aria-hidden={!pieVisible}
      >
        <MotionChartContainer
          width="100%"
          height="100%"
          interactive={pieVisible && !isMorphing}
          animateGeometry={false}
        >
          <PieChart>
            <Pie
              data={pieRows}
              dataKey="value"
              nameKey="name"
              innerRadius={isMobile ? 52 : 62}
              outerRadius={isMobile ? 88 : 102}
              paddingAngle={3}
              onClick={(entry) => {
                if (entry?.type === 'academic') onModeChange('academic');
                if (entry?.type === 'non_academic') onModeChange('nonAcademic');
              }}
            >
              {pieRows.map((entry) => (
                <Cell
                  key={entry.type}
                  fill={entry.fill}
                  className={`cursor-pointer achievement-pie-sector achievement-pie-sector-${entry.type}`}
                />
              ))}
            </Pie>
            <Tooltip content={<PieChartTooltip total={total} />} />
            <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: isMobile ? 10 : 12, lineHeight: 1.4 }} />
          </PieChart>
        </MotionChartContainer>
        <m.div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          initial={false}
          animate={{ opacity: pieVisible ? 1 : 0, scale: pieVisible ? 1 : 0.92 }}
          transition={{ duration: reducedMotion ? 0.08 : 0.2, delay: reducedMotion ? 0 : pieVisible ? 0.4 : 0 }}
        >
          <div className="text-center">
            <p className="text-xl font-bold text-foreground sm:text-2xl"><AnimatedKpiValue value={total} /></p>
            <p className="text-xs text-muted-foreground">Total Prestasi</p>
          </div>
        </m.div>
      </m.div>

      <m.div
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: barVisible ? 1 : 0, scale: barVisible ? 1 : 0.99 }}
        transition={{ duration: layerDuration, delay: reducedMotion ? 0 : barVisible ? 0.18 : 0, ease: EASE_OUT }}
        style={{ pointerEvents: barVisible && !isMorphing ? 'auto' : 'none' }}
        aria-hidden={!barVisible}
      >
        {detailTotal > 0 ? (
          <BreakdownChart
            rows={detailRows}
            isMobile={isMobile}
            interactive={barVisible && !isMorphing}
            animateGeometry={detailAnimating}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <InsightDataEmpty />
          </div>
        )}
      </m.div>

      {morph && LEVEL_KEYS.map((key, index) => {
        const target = morph.targets[index];
        const originX = morph.origin.x - 5;
        const originY = morph.origin.y - 5;
        const toDetail = morph.direction === 'to-detail';
        const row = detailRows[index];
        const delay = toDetail ? 0.1 + index * 0.035 : 0.08 + index * 0.025;

        return (
          <m.div
            key={key}
            className="pointer-events-none absolute z-20 rounded-t-md shadow-sm"
            style={{
              left: 0,
              top: 0,
              width: 1,
              height: 1,
              background: row?.fill,
              transformOrigin: '0 0',
              willChange: 'transform, opacity',
            }}
            initial={toDetail
              ? { x: originX, y: originY, scaleX: 10, scaleY: 10, opacity: 0 }
              : { x: target.x, y: target.y, scaleX: target.width, scaleY: target.height, opacity: 0.95 }}
            animate={toDetail
              ? { x: target.x, y: target.y, scaleX: target.width, scaleY: target.height, opacity: [0, 0.96, 0.96, 0] }
              : { x: originX, y: originY, scaleX: 10, scaleY: 10, opacity: [0.96, 0.96, 0.7, 0] }}
            transition={{
              x: { duration: 0.42, delay, ease: EASE_OUT },
              y: { duration: 0.42, delay, ease: EASE_OUT },
              scaleX: { duration: 0.42, delay, ease: EASE_OUT },
              scaleY: { duration: 0.42, delay, ease: EASE_OUT },
              opacity: { duration: toDetail ? 0.48 : 0.5, delay, times: [0, 0.12, 0.82, 1], ease: EASE_OUT },
            }}
            onAnimationComplete={index === LEVEL_KEYS.length - 1 ? () => {
              const completedId = morph.id;
              setMorph((current) => {
                if (current?.id !== completedId) return current;
                morphRef.current = null;
                return null;
              });
            } : undefined}
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
}
