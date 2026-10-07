/* eslint-disable react-refresh/only-export-components -- Shared chart geometry and render callbacks belong together. */
import type { ComponentProps } from 'react';
import { Rectangle, Sector } from 'recharts';

export const CATEGORY_COLORS = [
  'hsl(var(--chart-series-teal))',
  'hsl(var(--chart-series-navy))',
  'hsl(var(--chart-series-rose))',
  'hsl(var(--chart-series-amber))',
  'hsl(var(--chart-series-cyan))',
  'hsl(var(--chart-series-indigo))',
  'hsl(var(--chart-series-orange))',
  'hsl(var(--chart-series-navy-light))',
];

/** Category identity, rather than array position, determines the color. */
export function categoryColor(category: string): string {
  let hash = 0;
  for (const character of category) hash = (Math.imul(hash, 31) + character.charCodeAt(0)) | 0;
  return CATEGORY_COLORS[(hash >>> 0) % CATEGORY_COLORS.length];
}

export function piePercent(value: number, total: number): number {
  return total > 0 && Number.isFinite(value) ? (value / total) * 100 : 0;
}

export function formatPiePercent(value: number): string {
  return `${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(value)}%`;
}

export interface PieCalloutPosition {
  index: number;
  side: -1 | 1;
  y: number;
}

/** Place labels independently on each side, then spread neighbors apart. */
export function layoutPieCallouts(
  values: number[],
  centerY: number,
  radius: number,
  startAngle = 90,
  endAngle = -270,
  paddingAngle = 0,
  minGap = 38,
): PieCalloutPosition[] {
  const total = values.reduce((sum, value) => sum + Math.max(0, value), 0);
  if (total <= 0) return [];
  const visible = values.filter((value) => value > 0).length;
  const sweep = Math.sign(endAngle - startAngle) * Math.min(Math.abs(endAngle - startAngle), 360);
  const available = Math.abs(sweep) - (Math.abs(sweep) >= 360 ? visible : visible - 1) * paddingAngle;
  let angle = startAngle;
  const positions: PieCalloutPosition[] = [];

  values.forEach((value, index) => {
    if (value <= 0) return;
    const length = sweep < 0 ? -(value / total) * available : (value / total) * available;
    const midAngle = angle + length / 2;
    const radians = -midAngle * Math.PI / 180;
    positions.push({ index, side: Math.cos(radians) >= 0 ? 1 : -1, y: centerY + Math.sin(radians) * (radius + 23) });
    angle += length + Math.sign(sweep) * paddingAngle;
  });

  const halfHeight = Math.max(radius + 24, Math.ceil(visible / 2) * minGap / 2 + 16);
  for (const side of [-1, 1] as const) {
    const entries = positions.filter((position) => position.side === side).sort((a, b) => a.y - b.y);
    if (!entries.length) continue;
    const low = centerY - halfHeight;
    const high = centerY + halfHeight;
    entries.forEach((entry, index) => {
      entry.y = Math.max(low + index * minGap, entry.y);
    });
    const overflow = entries[entries.length - 1].y - high;
    if (overflow > 0) entries.forEach((entry) => { entry.y -= overflow; });
    for (let index = entries.length - 2; index >= 0; index--) {
      entries[index].y = Math.min(entries[index].y, entries[index + 1].y - minGap);
    }
  }
  return positions.sort((a, b) => a.index - b.index);
}

export function ActivePieSector(props: ComponentProps<typeof Sector> & { midAngle?: number }) {
  const angle = -(props.midAngle ?? ((props.startAngle ?? 0) + (props.endAngle ?? 0)) / 2) * Math.PI / 180;
  const offset = 3;
  return (
    <g className="chart-active-sector">
      <Sector
        {...props}
        cx={(props.cx ?? 0) + Math.cos(angle) * offset}
        cy={(props.cy ?? 0) + Math.sin(angle) * offset}
        outerRadius={(props.outerRadius ?? 0) + 5}
      />
    </g>
  );
}

interface PieLabelDatum {
  name: string;
  value: number;
}

interface PieLabelGeometry {
  cx: number;
  cy: number;
  outerRadius: number;
  midAngle: number;
  index: number;
  fill?: string;
}

function wrapPieName(name: string, maxChars: number): string[] {
  if (name.length <= maxChars) return [name];
  const words = name.split(/\s+/);
  const lines: string[] = [''];
  for (const word of words) {
    const line = lines[lines.length - 1];
    if (!line || `${line} ${word}`.length <= maxChars) lines[lines.length - 1] = line ? `${line} ${word}` : word;
    else lines.push(word);
  }
  if (lines.length <= 2 && lines.every((line) => line.length <= maxChars)) return lines;
  return [lines[0].slice(0, maxChars), `${lines.slice(1).join(' ').slice(0, Math.max(1, maxChars - 1))}…`];
}

export function createPieCalloutLabel(data: PieLabelDatum[], startAngle = 90, endAngle = -270, paddingAngle = 0) {
  const values = data.map((row) => row.value);
  const total = values.reduce((sum, value) => sum + Math.max(0, value), 0);
  return (props: PieLabelGeometry) => {
    const row = data[props.index];
    if (!row || row.value <= 0) return null;
    const positions = layoutPieCallouts(values, props.cy, props.outerRadius, startAngle, endAngle, paddingAngle);
    const position = positions.find((item) => item.index === props.index);
    if (!position) return null;
    const { side, y } = position;
    const angle = -props.midAngle * Math.PI / 180;
    const x1 = props.cx + Math.cos(angle) * (props.outerRadius + 3);
    const y1 = props.cy + Math.sin(angle) * (props.outerRadius + 3);
    const x2 = props.cx + side * (props.outerRadius + 15);
    const x3 = props.cx + side * (props.outerRadius + 26);
    const xText = x3 + side * 3;
    const maxChars = Math.max(3, Math.min(24, Math.floor((props.cx - props.outerRadius - 34) / 6)));
    const nameLines = wrapPieName(row.name, maxChars);

    return (
      <g className="chart-pie-callout" aria-hidden="true">
        <polyline points={`${x1},${y1} ${x2},${y} ${x3},${y}`} fill="none" stroke={props.fill || 'hsl(var(--chart-label-line))'} strokeWidth={1.25} />
        <text x={xText} y={y - (nameLines.length > 1 ? 11 : 4)} textAnchor={side === 1 ? 'start' : 'end'} className="chart-pie-callout-name">
          {nameLines.map((line, index) => <tspan key={`${props.index}-${index}`} x={xText} dy={index === 0 ? 0 : 12}>{line}</tspan>)}
        </text>
        <text x={xText} y={y + 13} textAnchor={side === 1 ? 'start' : 'end'} className="chart-pie-callout-value">{formatPiePercent(piePercent(row.value, total))}</text>
      </g>
    );
  };
}

interface GuideProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  layout: 'horizontal' | 'vertical';
}

export function BarHoverGuide({ x = 0, y = 0, width = 0, height = 0, layout }: GuideProps) {
  if (layout === 'vertical') {
    const centerY = y + height / 2;
    return <line className="chart-bar-guide" x1={x} x2={x + width} y1={centerY} y2={centerY} />;
  }
  const centerX = x + width / 2;
  return <line className="chart-bar-guide" x1={centerX} x2={centerX} y1={y} y2={y + height} />;
}

/** Item tooltips do not render Recharts' cursor; draw the guide with the active bar. */
export function ActiveBarWithGuide(props: Record<string, unknown>) {
  const x = Number(props.x ?? 0);
  const y = Number(props.y ?? 0);
  const width = Number(props.width ?? 0);
  const height = Number(props.height ?? 0);
  return (
    <g>
      <Rectangle {...props} fillOpacity={0.8} stroke="hsl(var(--foreground) / 0.45)" strokeWidth={1} />
      <line className="chart-bar-guide" x1={x} x2={x + width + 16} y1={y + height / 2} y2={y + height / 2} />
    </g>
  );
}
