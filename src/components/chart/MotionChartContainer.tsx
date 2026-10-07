import { Children, cloneElement, isValidElement, useEffect, useMemo, useRef, useState, type FocusEvent, type MouseEvent, type ReactElement, type ReactNode } from 'react';
import { AnimatePresence, m, useInView, useReducedMotion } from 'framer-motion';
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer as RechartsResponsiveContainer, Tooltip } from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';
import { ActivePieSector, BarHoverGuide, categoryColor, createPieCalloutLabel, formatPiePercent, piePercent } from './chart-interactions';

type ContainerProps = React.ComponentProps<typeof RechartsResponsiveContainer> & {
  /** Keeps a mounted chart visually available while removing every interaction surface. */
  interactive?: boolean;
  /** Overrides the shared Recharts duration for chart-specific transitions. */
  chartAnimationDuration?: number;
  /** Allows a composed transition to temporarily own the plotted geometry. */
  animateGeometry?: boolean;
  /** Overrides the delay between series; use zero when stacked segments must move as one bar. */
  chartAnimationStagger?: number;
};
type ElementProps = Record<string, unknown> & { children?: ReactNode };
type ChartContext = { kind: 'bar' | 'pie' | 'area' | null; layout: 'horizontal' | 'vertical'; rows: Record<string, unknown>[]; singleSeries: boolean };
type FocusedPieSlice = { index: number; name: string; value: number; total: number };
const EMPTY_CONTEXT: ChartContext = { kind: null, layout: 'horizontal', rows: [], singleSeries: false };

function withChartMotion(
  node: ReactNode,
  reduced: boolean,
  mobile: boolean,
  dismissed: boolean,
  series: { current: number },
  focusedPie: FocusedPieSlice | null,
  setFocusedPie: (slice: FocusedPieSlice | null) => void,
  interactive: boolean,
  chartAnimationDuration?: number,
  animateGeometry = true,
  chartAnimationStagger?: number,
  context: ChartContext = EMPTY_CONTEXT,
): ReactNode {
  if (!isValidElement(node)) return node;

  const element = node as ReactElement<ElementProps>;
  const original = element.props;
  const duration = reduced ? 0 : chartAnimationDuration ?? (mobile ? 650 : 800);
  const patch: ElementProps = {};
  let nextContext = context;

  if (element.type === BarChart || element.type === PieChart || element.type === AreaChart) {
    patch.accessibilityLayer = interactive;
    nextContext = {
      kind: element.type === BarChart ? 'bar' : element.type === PieChart ? 'pie' : 'area',
      layout: original.layout === 'vertical' ? 'vertical' : 'horizontal',
      rows: Array.isArray(original.data) ? original.data as Record<string, unknown>[] : [],
      singleSeries: Children.toArray(original.children).filter((child) => isValidElement(child) && child.type === Bar).length === 1,
    };
  } else if (element.type === Bar) {
    patch.isAnimationActive = !reduced && animateGeometry;
    const stagger = chartAnimationStagger ?? (mobile ? 25 : 40);
    patch.animationBegin = reduced ? 0 : Math.min(series.current++ * stagger, 300);
    patch.animationDuration = duration;
    patch.animationEasing = 'ease-out';
    if (context.kind === 'bar' && context.layout === 'vertical' && context.singleSeries && !Children.toArray(original.children).some((child) => isValidElement(child) && child.type === Cell)) {
      patch.children = [original.children, ...context.rows.map((row, index) => {
        const category = row.name ?? row.category ?? row.label ?? row.aspect_name ?? row.year ?? row.tahun ?? index;
        return <Cell key={`category-${String(category)}`} fill={categoryColor(String(category))} />;
      })];
    }
  } else if (element.type === Pie) {
    patch.isAnimationActive = !reduced && animateGeometry;
    patch.animationBegin = 0;
    patch.animationDuration = duration;
    patch.animationEasing = 'ease-out';
    patch.startAngle = original.startAngle === 0 ? 90 : original.startAngle;
    patch.endAngle = original.endAngle === 360 ? -270 : original.endAngle;
    if (mobile && typeof original.outerRadius === 'number' && original.outerRadius > 75) {
      patch.outerRadius = 75;
      if (typeof original.innerRadius === 'number') {
        patch.innerRadius = Math.max(0, original.innerRadius - (original.outerRadius - 75));
      }
    }
    patch.activeShape = original.activeShape ?? ActivePieSector;
    patch.rootTabIndex = interactive ? 0 : -1;
    const rows = Array.isArray(original.data) ? original.data as Record<string, unknown>[] : [];
    const dataKey = typeof original.dataKey === 'string' ? original.dataKey : 'value';
    const nameKey = typeof original.nameKey === 'string' ? original.nameKey : 'name';
    const labelData = rows.map((row, index) => ({
      name: String(row[nameKey] ?? row.displayLabel ?? row.label ?? row.category ?? index + 1),
      value: Number(row[dataKey] ?? 0),
    }));
    const total = labelData.reduce((sum, row) => sum + Math.max(0, row.value), 0);
    const focusSlice = (index: number) => {
      const slice = labelData[index];
      if (slice) setFocusedPie({ index, ...slice, total });
    };
    patch.label = createPieCalloutLabel(labelData, Number(patch.startAngle), Number(patch.endAngle), Number(original.paddingAngle ?? 0));
    patch.labelLine = false;
    if (focusedPie) patch.activeIndex = focusedPie.index;
    patch.onFocus = (entry: unknown, index: number, event: FocusEvent<SVGGElement>) => {
      (original.onFocus as ((data: unknown, index: number, event: FocusEvent<SVGGElement>) => void) | undefined)?.(entry, index, event);
      focusSlice(index);
    };
    patch.onBlur = (entry: unknown, index: number, event: FocusEvent<SVGGElement>) => {
      (original.onBlur as ((data: unknown, index: number, event: FocusEvent<SVGGElement>) => void) | undefined)?.(entry, index, event);
      setFocusedPie(null);
    };
    patch.onMouseEnter = (entry: unknown, index: number, event: MouseEvent<SVGGElement>) => {
      (original.onMouseEnter as ((data: unknown, index: number, event: MouseEvent<SVGGElement>) => void) | undefined)?.(entry, index, event);
      if (focusedPie) setFocusedPie(null);
    };
    patch.onClick = (entry: unknown, index: number, event: MouseEvent<SVGGElement>) => {
      focusSlice(index);
      (original.onClick as ((data: unknown, index: number, event: MouseEvent<SVGGElement>) => void) | undefined)?.(entry, index, event);
    };
  } else if (element.type === Area) {
    patch.isAnimationActive = !reduced && animateGeometry;
    patch.animationBegin = 0;
    patch.animationDuration = duration;
    patch.animationEasing = 'ease-out';
  } else if (element.type === Tooltip) {
    patch.accessibilityLayer = true;
    patch.isAnimationActive = !reduced;
    patch.animationDuration = reduced ? 0 : 160;
    patch.animationEasing = 'ease-out';
    patch.allowEscapeViewBox = { x: false, y: false };
    patch.trigger = mobile ? 'click' : 'hover';
    if (!interactive || (mobile && dismissed)) patch.active = false;
    patch.wrapperStyle = { ...(original.wrapperStyle as object | undefined), pointerEvents: 'none', zIndex: 20 };
    if (context.kind === 'bar' && (original.cursor === undefined || original.cursor === true)) patch.cursor = <BarHoverGuide layout={context.layout} />;
    if (mobile) patch.position = { x: 8, y: 8 };
  }

  if (patch.children !== undefined || original.children !== undefined) {
    patch.children = Children.map(patch.children ?? original.children, (child) => withChartMotion(child, reduced, mobile, dismissed, series, focusedPie, setFocusedPie, interactive, chartAnimationDuration, animateGeometry, chartAnimationStagger, nextContext));
  }

  return cloneElement(element, patch);
}

/** Preserves the native Recharts elements while applying one motion policy to every chart. */
export function MotionChartContainer({ children, interactive = true, chartAnimationDuration, animateGeometry = true, chartAnimationStagger, ...props }: ContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { amount: 0.2, once: true });
  const reduced = Boolean(useReducedMotion());
  const mobile = useIsMobile();
  const [dismissed, setDismissed] = useState(false);
  const [focusedPie, setFocusedPie] = useState<FocusedPieSlice | null>(null);
  const chart = useMemo(
    () => withChartMotion(children, reduced, mobile, dismissed, { current: 0 }, focusedPie, setFocusedPie, interactive, chartAnimationDuration, animateGeometry, chartAnimationStagger),
    [children, reduced, mobile, dismissed, focusedPie, interactive, chartAnimationDuration, animateGeometry, chartAnimationStagger],
  );

  useEffect(() => {
    if (!interactive) {
      setDismissed(true);
      setFocusedPie(null);
    }
  }, [interactive]);

  useEffect(() => {
    if (!mobile) return;
    const dismissOutside = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setDismissed(true);
        setFocusedPie(null);
      }
    };
    document.addEventListener('pointerdown', dismissOutside);
    return () => document.removeEventListener('pointerdown', dismissOutside);
  }, [mobile]);

  return (
    <div
      ref={ref}
      className={`chart-plot ${interactive ? '' : 'pointer-events-none select-none'}`}
      aria-busy={!visible}
      aria-hidden={!interactive}
      onPointerDownCapture={() => { if (interactive) setDismissed(false); }}
      onKeyDownCapture={(event) => { if (interactive && event.key === 'Escape') setFocusedPie(null); }}
    >
      <AnimatePresence initial={false} mode="wait">
        {visible ? (
          <m.div key="chart" className="chart-plot-content" initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : 0.2 }}>
            <RechartsResponsiveContainer {...props}>{chart as ReactElement}</RechartsResponsiveContainer>
          </m.div>
        ) : (
          <m.div key="skeleton" className="chart-plot-placeholder" exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.16 }} aria-hidden="true" />
        )}
      </AnimatePresence>
      {focusedPie && (
        <div className="chart-focus-detail" role="status">
          <span className="font-medium">{focusedPie.name}</span>
          <span>{focusedPie.value.toLocaleString('id-ID')} · {formatPiePercent(piePercent(focusedPie.value, focusedPie.total))}</span>
        </div>
      )}
    </div>
  );
}
