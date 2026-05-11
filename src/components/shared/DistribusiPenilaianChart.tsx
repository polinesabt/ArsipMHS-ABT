import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import type { Props as YAxisTickProps } from 'recharts/types/cartesian/CartesianAxis';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

const MAX_CHARS_PER_LINE = 30;
const TICK_FONT_SIZE = 15;
const TICK_LINE_HEIGHT = 1.2;
const Y_AXIS_WIDTH = 280;
const Y_LABEL_INSET = 12;
const SEGMENT_LABEL_FONT_SIZE = 12;
const SEGMENT_LABEL_MIN_WIDTH = 40;
const SEGMENT_LABEL_STROKE_WIDTH = 2;

type RGB = { r: number; g: number; b: number };

function parseHexColor(hexColor: string): RGB | null {
  const raw = (hexColor || '').trim();
  if (!raw.startsWith('#')) return null;

  const hex = raw.slice(1);
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    if ([r, g, b].some((v) => Number.isNaN(v))) return null;
    return { r, g, b };
  }

  if (hex.length === 6) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    if ([r, g, b].some((v) => Number.isNaN(v))) return null;
    return { r, g, b };
  }

  return null;
}

function relativeLuminance({ r, g, b }: RGB): number {
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };

  const R = toLinear(r);
  const G = toLinear(g);
  const B = toLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function getSegmentLabelPaint(segmentFill?: string) {
  const rgb = typeof segmentFill === 'string' ? parseHexColor(segmentFill) : null;
  const luminance = rgb ? relativeLuminance(rgb) : null;
  const isLight = luminance != null ? luminance > 0.55 : false;

  return isLight
    ? {
        fill: 'rgba(15, 23, 42, 0.82)',
        stroke: 'rgba(255, 255, 255, 0.30)',
      }
    : {
        fill: 'rgba(255, 255, 255, 0.86)',
        stroke: 'rgba(0, 0, 0, 0.20)',
      };
}

function wrapLabel(text: string): string[] {
  const t = (text || '').trim();
  if (!t || t.length <= MAX_CHARS_PER_LINE) return [t];
  const words = t.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    const next = current ? `${current} ${w}` : w;
    if (next.length <= MAX_CHARS_PER_LINE) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = w.length > MAX_CHARS_PER_LINE ? w.slice(0, MAX_CHARS_PER_LINE) : w;
      if (w.length > MAX_CHARS_PER_LINE) {
        let rest = w.slice(MAX_CHARS_PER_LINE);
        while (rest.length > MAX_CHARS_PER_LINE) {
          lines.push(rest.slice(0, MAX_CHARS_PER_LINE));
          rest = rest.slice(MAX_CHARS_PER_LINE);
        }
        if (rest) current = rest;
      }
    }
  }
  if (current) lines.push(current);
  return lines;
}

function DistribusiPenilaianYAxisTick({ x, y, payload }: YAxisTickProps) {
  if (!payload?.value) return null;
  const lines = wrapLabel(String(payload.value));
  const fill = 'hsl(var(--muted-foreground))';
  const lineHeight = TICK_FONT_SIZE * TICK_LINE_HEIGHT;
  const firstLineDy = lines.length > 1 ? (lines.length - 1) * lineHeight * -0.5 : 0;
  const labelX = -Y_AXIS_WIDTH + Y_LABEL_INSET;
  return (
    <g transform={`translate(${x},${y})`}>
      <text fill={fill} fontSize={TICK_FONT_SIZE} textAnchor="start" x={labelX} dominantBaseline="middle">
        {lines.map((line, i) => (
          <tspan key={i} x={labelX} dy={i === 0 ? firstLineDy : lineHeight}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

export interface DistribusiPenilaianRow {
  aspect_name: string;
  sangat_baik: number;
  baik: number;
  cukup_baik: number;
  kurang_baik: number;
  tidak_baik: number;
  total?: number;
}

type RatingKey = 'sangat_baik' | 'baik' | 'cukup_baik' | 'kurang_baik' | 'tidak_baik';

type DistribusiPenilaianChartRow = DistribusiPenilaianRow & {
  total_count: number;
  sangat_baik_pct: number;
  baik_pct: number;
  cukup_baik_pct: number;
  kurang_baik_pct: number;
  tidak_baik_pct: number;
};

const RATING_CONFIG: Array<{ key: RatingKey; pctKey: keyof DistribusiPenilaianChartRow; name: string; fill: string }> = [
  { key: 'sangat_baik', pctKey: 'sangat_baik_pct', name: 'Sangat Baik', fill: '#15803d' },
  { key: 'baik', pctKey: 'baik_pct', name: 'Baik', fill: '#0ea5e9' },
  { key: 'cukup_baik', pctKey: 'cukup_baik_pct', name: 'Cukup Baik', fill: '#eab308' },
  { key: 'kurang_baik', pctKey: 'kurang_baik_pct', name: 'Kurang Baik', fill: '#f97316' },
  { key: 'tidak_baik', pctKey: 'tidak_baik_pct', name: 'Tidak Baik', fill: '#ef4444' },
];

function resolveTotalCount(row: DistribusiPenilaianRow): number {
  const totalFromFields =
    (row.sangat_baik ?? 0) +
    (row.baik ?? 0) +
    (row.cukup_baik ?? 0) +
    (row.kurang_baik ?? 0) +
    (row.tidak_baik ?? 0);
  const totalFromPayload = Number(row.total ?? 0);

  if (totalFromFields <= 0 && totalFromPayload > 0) return totalFromPayload;
  if (totalFromFields > 0 && totalFromPayload > 0 && Math.abs(totalFromPayload - totalFromFields) <= 1) {
    return totalFromPayload;
  }
  return totalFromFields;
}

function toPercent(count: number, total: number): number {
  if (!total) return 0;
  return (count / total) * 100;
}

function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

interface DistribusiPenilaianSegmentLabelProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number | string;
  fill?: string;
}

function DistribusiPenilaianSegmentLabel({ x, y, width, height, value, fill }: DistribusiPenilaianSegmentLabelProps) {
  const safeX = Number(x ?? 0);
  const safeY = Number(y ?? 0);
  const safeWidth = Number(width ?? 0);
  const safeHeight = Number(height ?? 0);
  const rounded = Math.round(Number(value ?? 0));

  if (
    !Number.isFinite(safeX) ||
    !Number.isFinite(safeY) ||
    !Number.isFinite(safeWidth) ||
    !Number.isFinite(safeHeight)
  ) {
    return null;
  }
  if (safeWidth < SEGMENT_LABEL_MIN_WIDTH) return null;
  if (rounded <= 0) return null;

  const paint = getSegmentLabelPaint(fill);

  return (
    <text
      x={safeX + safeWidth / 2}
      y={safeY + safeHeight / 2}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={SEGMENT_LABEL_FONT_SIZE}
      fontWeight={600}
      fill={paint.fill}
      stroke={paint.stroke}
      strokeWidth={SEGMENT_LABEL_STROKE_WIDTH}
      paintOrder="stroke"
      pointerEvents="none"
    >
      {`${rounded}%`}
    </text>
  );
}

function DistribusiPenilaianTooltip({ active, payload }: TooltipProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;

  const row = payload[0]?.payload as DistribusiPenilaianChartRow | undefined;
  if (!row) return null;

  return (
    <div className="rounded-md border bg-background p-3 shadow-md min-w-[220px]">
      <p className="mb-2 text-sm font-semibold">{row.aspect_name}</p>
      <div className="space-y-1.5">
        {RATING_CONFIG.map((rating) => {
          const count = row[rating.key] ?? 0;
          const percent = row[rating.pctKey] ?? 0;
          if (count <= 0) return null;
          return (
            <div key={rating.key} className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: rating.fill }} />
                <span>{rating.name}</span>
              </div>
              <span className="font-medium whitespace-nowrap">
                {formatPercent(percent)} ({count}/{row.total_count})
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface DistribusiPenilaianChartProps {
  data: DistribusiPenilaianRow[];
  /** Tinggi container; default: Math.max(280, data.length * 58) */
  height?: number;
  /** Custom class untuk wrapper div */
  className?: string;
}

export function DistribusiPenilaianChart({
  data,
  height = Math.max(280, data.length * 58),
  className,
}: DistribusiPenilaianChartProps) {
  const chartData: DistribusiPenilaianChartRow[] = data.map((row) => {
    const total = resolveTotalCount(row);
    return {
      ...row,
      total_count: total,
      sangat_baik_pct: toPercent(row.sangat_baik ?? 0, total),
      baik_pct: toPercent(row.baik ?? 0, total),
      cukup_baik_pct: toPercent(row.cukup_baik ?? 0, total),
      kurang_baik_pct: toPercent(row.kurang_baik ?? 0, total),
      tidak_baik_pct: toPercent(row.tidak_baik ?? 0, total),
    };
  });

  return (
    <div className={className} style={{ width: '100%', minHeight: 280, height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 12, right: 12, left: 24, bottom: 12 }}
          barSize={30}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
          <XAxis
            type="number"
            allowDecimals
            domain={[0, 100]}
            ticks={[0, 20, 40, 60, 80, 100]}
            tickFormatter={(value) => formatPercent(Number(value))}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 15 }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            hide
          />
          <YAxis
            type="category"
            dataKey="aspect_name"
            tick={<DistribusiPenilaianYAxisTick />}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            width={Y_AXIS_WIDTH}
            tickMargin={10}
            interval={0}
          />
          <Tooltip content={<DistribusiPenilaianTooltip />} />
          <Legend wrapperStyle={{ paddingTop: 8 }} formatter={(v) => <span className="text-lg text-muted-foreground">{v}</span>} />
          <Bar
            activeBar
            dataKey="sangat_baik_pct"
            name="Sangat Baik"
            stackId="a"
            fill="#15803d"
            radius={[0, 0, 0, 0]}
          >
            <LabelList dataKey="sangat_baik_pct" content={DistribusiPenilaianSegmentLabel} />
          </Bar>
          <Bar
            activeBar
            dataKey="baik_pct"
            name="Baik"
            stackId="a"
            fill="#0ea5e9"
            radius={[0, 0, 0, 0]}
          >
            <LabelList dataKey="baik_pct" content={DistribusiPenilaianSegmentLabel} />
          </Bar>
          <Bar
            activeBar
            dataKey="cukup_baik_pct"
            name="Cukup Baik"
            stackId="a"
            fill="#eab308"
            radius={[0, 0, 0, 0]}
          >
            <LabelList dataKey="cukup_baik_pct" content={DistribusiPenilaianSegmentLabel} />
          </Bar>
          <Bar
            activeBar
            dataKey="kurang_baik_pct"
            name="Kurang Baik"
            stackId="a"
            fill="#f97316"
            radius={[0, 0, 0, 0]}
          >
            <LabelList dataKey="kurang_baik_pct" content={DistribusiPenilaianSegmentLabel} />
          </Bar>
          <Bar
            activeBar
            dataKey="tidak_baik_pct"
            name="Tidak Baik"
            stackId="a"
            fill="#ef4444"
            radius={[0, 4, 4, 0]}
          >
            <LabelList dataKey="tidak_baik_pct" content={DistribusiPenilaianSegmentLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
