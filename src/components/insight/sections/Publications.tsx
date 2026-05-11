import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Customized, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DashboardCard } from '@/components/insight/dashboard/DashboardCard';
import { ChartTooltip } from '@/components/insight/dashboard/ChartTooltip';
import { InsightDataEmpty } from '@/components/insight/InsightDataEmpty';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInsightDashboard } from '@/contexts/InsightDashboardContext';
import {
  getInsightStats,
  type InsightStatsResponse,
  type PublicationsData,
  type PublicationsJurnalByYearRow,
  type PublicationsPagelaranByYearRow,
  type PublicationsSeminarByYearRow,
} from '@/repositories/insight.repository';
import { getInsightErrorMessage } from '@/lib/insight-errors';
import { Loader2 } from 'lucide-react';
import { isPublicationsTab, type PublicationsTab } from '@/types/insight-tabs';
import { useIsMobile } from '@/hooks/use-mobile';

interface PublicationsProps {
  activeTab?: PublicationsTab;
  onActiveTabChange?: (tab: PublicationsTab) => void;
}

interface LevelConfig {
  id: string;
  label: string;
  mandiriColor: string;
  kolaborasiColor: string;
  mandiriKey: string;
  kolaborasiKey: string;
}

type PublicationsRow = PublicationsJurnalByYearRow | PublicationsSeminarByYearRow | PublicationsPagelaranByYearRow;

type PublicationsChartOffset = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type PublicationsBarRect = {
  x: number;
  width: number;
};

type PublicationsBarGeometry = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type RGB = { r: number; g: number; b: number };

function parseChartOffset(value: unknown): PublicationsChartOffset | null {
  if (!value || typeof value !== 'object') return null;
  const offset = value as Partial<Record<keyof PublicationsChartOffset, unknown>>;
  if (typeof offset.left !== 'number') return null;
  if (typeof offset.top !== 'number') return null;
  if (typeof offset.width !== 'number') return null;
  if (typeof offset.height !== 'number') return null;
  return { left: offset.left, top: offset.top, width: offset.width, height: offset.height };
}

function extractStackId(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null;
  const item = (value as { item?: unknown }).item;
  if (!item || typeof item !== 'object') return null;
  const props = (item as { props?: unknown }).props;
  if (!props || typeof props !== 'object') return null;
  const stackId = (props as { stackId?: unknown }).stackId;
  return typeof stackId === 'string' ? stackId : null;
}

function extractBarRects(value: unknown): PublicationsBarRect[] | null {
  if (!value || typeof value !== 'object') return null;
  const props = (value as { props?: unknown }).props;
  if (!props || typeof props !== 'object') return null;
  const data = (props as { data?: unknown }).data;
  if (!Array.isArray(data) || data.length === 0) return null;
  const rects: PublicationsBarRect[] = [];
  for (const rect of data) {
    if (!rect || typeof rect !== 'object') return null;
    const x = (rect as { x?: unknown }).x;
    const width = (rect as { width?: unknown }).width;
    if (typeof x !== 'number' || typeof width !== 'number') return null;
    rects.push({ x, width });
  }
  return rects;
}

function extractBarGeometry(value: unknown): PublicationsBarGeometry[] | null {
  if (!value || typeof value !== 'object') return null;
  const props = (value as { props?: unknown }).props;
  if (!props || typeof props !== 'object') return null;
  const data = (props as { data?: unknown }).data;
  if (!Array.isArray(data) || data.length === 0) return null;
  const rects: PublicationsBarGeometry[] = [];
  for (const rect of data) {
    if (!rect || typeof rect !== 'object') return null;
    const x = (rect as { x?: unknown }).x;
    const y = (rect as { y?: unknown }).y;
    const width = (rect as { width?: unknown }).width;
    const height = (rect as { height?: unknown }).height;
    if (typeof x !== 'number' || typeof y !== 'number') return null;
    if (typeof width !== 'number' || typeof height !== 'number') return null;
    rects.push({ x, y, width, height });
  }
  return rects;
}

const SEGMENT_LABEL_STROKE_WIDTH = 2;
const cssVarCache = new Map<string, string>();

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

function resolveCssVarValue(variableName: string): string | null {
  if (typeof window === 'undefined') return null;
  const modeKey = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  const cacheKey = `${modeKey}:${variableName}`;
  if (cssVarCache.has(cacheKey)) {
    const cached = cssVarCache.get(cacheKey);
    return cached ? cached : null;
  }
  const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
  cssVarCache.set(cacheKey, value);
  return value ? value : null;
}

function parseHslComponents(value: string): { h: number; s: number; l: number } | null {
  const raw = (value || '').trim();
  if (!raw) return null;

  const withoutFunc = raw.startsWith('hsl(') && raw.endsWith(')') ? raw.slice(4, -1).trim() : raw;
  const withoutAlpha = withoutFunc.split('/')[0]?.trim() ?? '';
  const parts = withoutAlpha.split(/\s+/).filter(Boolean);
  if (parts.length < 3) return null;

  const h = Number.parseFloat(parts[0]);
  const s = Number.parseFloat(parts[1].replace('%', ''));
  const l = Number.parseFloat(parts[2].replace('%', ''));
  if (!Number.isFinite(h) || !Number.isFinite(s) || !Number.isFinite(l)) return null;

  return { h, s: s / 100, l: l / 100 };
}

function hslToRgb({ h, s, l }: { h: number; s: number; l: number }): RGB {
  const hue = ((h % 360) + 360) % 360;
  const sat = Math.min(1, Math.max(0, s));
  const lig = Math.min(1, Math.max(0, l));

  if (sat === 0) {
    const v = Math.round(lig * 255);
    return { r: v, g: v, b: v };
  }

  const toRgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  const hNorm = hue / 360;
  const q = lig < 0.5 ? lig * (1 + sat) : lig + sat - lig * sat;
  const p = 2 * lig - q;
  const r = toRgb(p, q, hNorm + 1 / 3);
  const g = toRgb(p, q, hNorm);
  const b = toRgb(p, q, hNorm - 1 / 3);
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function parseHslFill(fill: string): RGB | null {
  const raw = (fill || '').trim();
  if (!raw) return null;

  const varMatch = raw.match(/var\((--[a-zA-Z0-9-_]+)\)/);
  if (varMatch) {
    const varValue = resolveCssVarValue(varMatch[1]);
    const hsl = varValue ? parseHslComponents(varValue) : null;
    return hsl ? hslToRgb(hsl) : null;
  }

  const hsl = parseHslComponents(raw);
  return hsl ? hslToRgb(hsl) : null;
}

function getSegmentLabelPaint(segmentFill?: string) {
  const rgb = segmentFill ? parseHexColor(segmentFill) ?? parseHslFill(segmentFill) : null;
  const luminance = rgb ? relativeLuminance(rgb) : null;
  const isLight = luminance != null ? luminance > 0.55 : true;

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

type PublicationsCategoryLabelsProps = {
  formattedGraphicalItems?: unknown;
  offset?: unknown;
};

function PublicationsCategoryLabels({ formattedGraphicalItems, offset }: PublicationsCategoryLabelsProps) {
  const items = Array.isArray(formattedGraphicalItems) ? formattedGraphicalItems : [];
  const chartOffset = parseChartOffset(offset);
  if (!chartOffset || items.length === 0) return null;

  const mandiriRef = items.find((entry) => extractStackId(entry) === 'mandiri');
  const kolaborasiRef = items.find((entry) => extractStackId(entry) === 'kolaborasi');
  const mandiriRects = extractBarRects(mandiriRef);
  const kolaborasiRects = extractBarRects(kolaborasiRef);
  if (!mandiriRects || !kolaborasiRects) return null;

  const labelY = chartOffset.top + chartOffset.height + 8;
  const count = Math.min(mandiriRects.length, kolaborasiRects.length);
  if (count === 0) return null;

  return (
    <g aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => {
        const mandiri = mandiriRects[index];
        const kolaborasi = kolaborasiRects[index];
        if (!mandiri || !kolaborasi) return null;

        return (
          <g key={`publication-category-${index}`}>
            <text
              x={mandiri.x + mandiri.width / 2}
              y={labelY}
              fill="hsl(var(--muted-foreground))"
              textAnchor="middle"
              dominantBaseline="hanging"
              fontSize={10}
              fontWeight={600}
              pointerEvents="none"
            >
              Mandiri
            </text>
            <text
              x={kolaborasi.x + kolaborasi.width / 2}
              y={labelY}
              fill="hsl(var(--muted-foreground))"
              textAnchor="middle"
              dominantBaseline="hanging"
              fontSize={10}
              fontWeight={600}
              pointerEvents="none"
            >
              Kolaborasi
            </text>
          </g>
        );
      })}
    </g>
  );
}

type PublicationsTotalsLabelsProps = {
  formattedGraphicalItems?: unknown;
  offset?: unknown;
  data?: Array<Record<string, number | string>>;
};

function PublicationsTotalsLabels({ formattedGraphicalItems, offset, data }: PublicationsTotalsLabelsProps) {
  const items = Array.isArray(formattedGraphicalItems) ? formattedGraphicalItems : [];
  const chartOffset = parseChartOffset(offset);
  const rows = Array.isArray(data) ? data : [];
  if (!chartOffset || items.length === 0 || rows.length === 0) return null;

  const mandiriItems = items.filter((entry) => extractStackId(entry) === 'mandiri');
  const kolaborasiItems = items.filter((entry) => extractStackId(entry) === 'kolaborasi');
  if (mandiriItems.length === 0 || kolaborasiItems.length === 0) return null;

  const mandiriRectsBySeries = mandiriItems
    .map((entry) => extractBarGeometry(entry))
    .filter((entry): entry is PublicationsBarGeometry[] => Array.isArray(entry) && entry.length > 0);
  const kolaborasiRectsBySeries = kolaborasiItems
    .map((entry) => extractBarGeometry(entry))
    .filter((entry): entry is PublicationsBarGeometry[] => Array.isArray(entry) && entry.length > 0);

  if (mandiriRectsBySeries.length === 0 || kolaborasiRectsBySeries.length === 0) return null;

  const count = Math.min(
    rows.length,
    ...mandiriRectsBySeries.map((rects) => rects.length),
    ...kolaborasiRectsBySeries.map((rects) => rects.length)
  );
  if (count === 0) return null;

  const baselineY = chartOffset.top + chartOffset.height;
  const topClamp = 4;
  const labelOffset = 6;

  const resolveTopY = (rectsBySeries: PublicationsBarGeometry[][], index: number) => {
    const candidates = rectsBySeries
      .map((series) => series[index])
      .filter((rect): rect is PublicationsBarGeometry => Boolean(rect) && rect.height > 0);
    if (!candidates.length) return null;
    return Math.min(...candidates.map((rect) => rect.y));
  };

  const resolveBaseRect = (rectsBySeries: PublicationsBarGeometry[][], index: number) => rectsBySeries[0]?.[index] ?? null;

  return (
    <g aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => {
        const row = rows[index];
        const mandiriTotal = Number(row?.totalMandiri ?? 0);
        const kolaborasiTotal = Number(row?.totalKolaborasi ?? 0);

        const mandiriBase = resolveBaseRect(mandiriRectsBySeries, index);
        const kolaborasiBase = resolveBaseRect(kolaborasiRectsBySeries, index);
        if (!mandiriBase || !kolaborasiBase) return null;

        const mandiriTop = resolveTopY(mandiriRectsBySeries, index);
        const kolaborasiTop = resolveTopY(kolaborasiRectsBySeries, index);

        const mandiriLabelY = Math.max(topClamp, (mandiriTop ?? baselineY) - labelOffset);
        const kolaborasiLabelY = Math.max(topClamp, (kolaborasiTop ?? baselineY) - labelOffset);

        return (
          <g key={`publication-totals-${index}`}>
            <text
              x={mandiriBase.x + mandiriBase.width / 2}
              y={mandiriLabelY}
              fill="hsl(var(--muted-foreground) / 0.85)"
              textAnchor="middle"
              dominantBaseline="auto"
              fontSize={11}
              fontWeight={600}
              pointerEvents="none"
            >
              {Number.isFinite(mandiriTotal) ? mandiriTotal : 0}
            </text>
            <text
              x={kolaborasiBase.x + kolaborasiBase.width / 2}
              y={kolaborasiLabelY}
              fill="hsl(var(--muted-foreground) / 0.85)"
              textAnchor="middle"
              dominantBaseline="auto"
              fontSize={11}
              fontWeight={600}
              pointerEvents="none"
            >
              {Number.isFinite(kolaborasiTotal) ? kolaborasiTotal : 0}
            </text>
          </g>
        );
      })}
    </g>
  );
}

type PublicationsPercentLabelProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: unknown;
  fill?: unknown;
};

function PublicationsPercentLabel({ x, y, width, height, value, fill }: PublicationsPercentLabelProps) {
  if (typeof x !== 'number' || typeof y !== 'number') return null;
  if (typeof width !== 'number' || typeof height !== 'number') return null;
  const numericValue = Number(value ?? 0);
  if (!Number.isFinite(numericValue) || numericValue <= 0) return null;
  if (height < 14 || width < 18) return null;

  const displayValue = numericValue < 1 ? '<1%' : `${Math.round(numericValue)}%`;
  const paint = getSegmentLabelPaint(typeof fill === 'string' ? fill : undefined);

  return (
    <text
      x={x + width / 2}
      y={y + height / 2}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={10}
      fontWeight={600}
      fill={paint.fill}
      stroke={paint.stroke}
      strokeWidth={SEGMENT_LABEL_STROKE_WIDTH}
      paintOrder="stroke"
      pointerEvents="none"
    >
      {displayValue}
    </text>
  );
}

const PUBLICATION_ACTIVE_BAR_STYLE = {
  fillOpacity: 0.8,
  stroke: 'hsl(var(--foreground) / 0.45)',
  strokeWidth: 1,
};

const TAB_LABELS: Record<PublicationsTab, string> = {
  jurnal: 'Jurnal',
  seminar: 'Publikasi di Seminar',
  pagelaran: 'Pagelaran / Presentasi',
};

const MOBILE_TAB_LABELS: Record<PublicationsTab, string> = {
  jurnal: 'Jurnal',
  seminar: 'Seminar',
  pagelaran: 'Pagelaran',
};

const TAB_DESCRIPTIONS: Record<PublicationsTab, string> = {
  jurnal: 'Diseminasi jurnal per tahun (hover untuk melihat rincian level publikasi)',
  seminar: 'Publikasi di seminar per tahun (hover untuk melihat rincian level)',
  pagelaran: 'Diseminasi pagelaran/pameran/presentasi ilmiah per tahun (hover untuk melihat rincian level)',
};

const TAB_INTERPRETATION_LABELS: Record<PublicationsTab, string> = {
  jurnal: 'diseminasi jurnal',
  seminar: 'publikasi di seminar',
  pagelaran: 'diseminasi pagelaran/presentasi',
};

function resolvePublicationPercentage(value: number, total: number) {
  if (!Number.isFinite(value) || !Number.isFinite(total) || total <= 0) return 0;
  return (value / total) * 100;
}

type PublicationsJurnalPercentTooltipProps = {
  active?: boolean;
  payload?: unknown;
  label?: unknown;
  levelConfig: LevelConfig[];
};

function PublicationsJurnalPercentTooltip({ active, payload, levelConfig }: PublicationsJurnalPercentTooltipProps) {
  if (!active || !Array.isArray(payload) || payload.length === 0) return null;
  const first = payload[0];
  if (!first || typeof first !== 'object') return null;

  const dataKey = typeof (first as { dataKey?: unknown }).dataKey === 'string' ? ((first as { dataKey: string }).dataKey as string) : null;
  const row = (first as { payload?: unknown }).payload;
  if (!dataKey || !row || typeof row !== 'object') return null;

  const resolveInfo = () => {
    for (const level of levelConfig) {
      if (dataKey === `${level.mandiriKey}Pct`) {
        return { levelLabel: level.label, categoryLabel: 'Mandiri', countKey: level.mandiriKey, totalKey: 'totalMandiri' as const };
      }
      if (dataKey === `${level.kolaborasiKey}Pct`) {
        return { levelLabel: level.label, categoryLabel: 'Kolaborasi', countKey: level.kolaborasiKey, totalKey: 'totalKolaborasi' as const };
      }
    }
    return null;
  };

  const info = resolveInfo();
  if (!info) return null;

  const rowRecord = row as Record<string, unknown>;
  const count = Number(rowRecord[info.countKey] ?? 0);
  const total = Number(rowRecord[info.totalKey] ?? 0);
  const percentValue = Number(rowRecord[dataKey] ?? 0);
  const displayPercent = percentValue < 1 && percentValue > 0 ? '<1%' : `${Math.round(percentValue)}%`;

  return (
    <div className="chart-tooltip">
      <p className="font-medium text-foreground mb-2">{`${info.levelLabel} (${info.categoryLabel})`}</p>
      <div className="space-y-1 text-sm text-muted-foreground">
        <div>
          <span className="font-medium text-foreground">{Number.isFinite(count) ? count.toLocaleString() : '0'}</span>
          <span> publikasi</span>
        </div>
        <div>
          <span className="font-medium text-foreground">{displayPercent}</span>
          <span>{` dari total ${Number.isFinite(total) ? total.toLocaleString() : '0'} publikasi`}</span>
        </div>
      </div>
    </div>
  );
}

const TAB_LEVELS: Record<PublicationsTab, LevelConfig[]> = {
  jurnal: [
    {
      id: 'nationalNonAccredited',
      label: 'Nasional Tidak Terakreditasi',
      mandiriColor: 'hsl(var(--chart-neutral))',
      kolaborasiColor: 'hsl(var(--chart-neutral-light))',
      mandiriKey: 'mandiriNationalNonAccredited',
      kolaborasiKey: 'kolaborasiNationalNonAccredited',
    },
    {
      id: 'nationalAccredited',
      label: 'Nasional Terakreditasi',
      mandiriColor: 'hsl(var(--chart-success))',
      kolaborasiColor: 'hsl(var(--chart-success-light))',
      mandiriKey: 'mandiriNationalAccredited',
      kolaborasiKey: 'kolaborasiNationalAccredited',
    },
    {
      id: 'international',
      label: 'Internasional',
      mandiriColor: 'hsl(var(--chart-warning))',
      kolaborasiColor: 'hsl(var(--chart-warning-light))',
      mandiriKey: 'mandiriInternational',
      kolaborasiKey: 'kolaborasiInternational',
    },
    {
      id: 'reputableInternational',
      label: 'Internasional Bereputasi',
      mandiriColor: 'hsl(var(--chart-academic))',
      kolaborasiColor: 'hsl(var(--chart-academic-light))',
      mandiriKey: 'mandiriReputableInternational',
      kolaborasiKey: 'kolaborasiReputableInternational',
    },
  ],
  seminar: [
    {
      id: 'local',
      label: 'Publikasi di Seminar Wilayah/Lokal/Perguruan Tinggi',
      mandiriColor: 'hsl(var(--chart-neutral))',
      kolaborasiColor: 'hsl(var(--chart-neutral-light))',
      mandiriKey: 'mandiriLocal',
      kolaborasiKey: 'kolaborasiLocal',
    },
    {
      id: 'national',
      label: 'Publikasi di Seminar Nasional',
      mandiriColor: 'hsl(var(--chart-success))',
      kolaborasiColor: 'hsl(var(--chart-success-light))',
      mandiriKey: 'mandiriNational',
      kolaborasiKey: 'kolaborasiNational',
    },
    {
      id: 'international',
      label: 'Publikasi di Seminar Internasional',
      mandiriColor: 'hsl(var(--chart-academic))',
      kolaborasiColor: 'hsl(var(--chart-academic-light))',
      mandiriKey: 'mandiriInternational',
      kolaborasiKey: 'kolaborasiInternational',
    },
  ],
  pagelaran: [
    {
      id: 'regional',
      label: 'Wilayah',
      mandiriColor: 'hsl(var(--chart-neutral))',
      kolaborasiColor: 'hsl(var(--chart-neutral-light))',
      mandiriKey: 'mandiriRegional',
      kolaborasiKey: 'kolaborasiRegional',
    },
    {
      id: 'national',
      label: 'Nasional',
      mandiriColor: 'hsl(var(--chart-success))',
      kolaborasiColor: 'hsl(var(--chart-success-light))',
      mandiriKey: 'mandiriNational',
      kolaborasiKey: 'kolaborasiNational',
    },
    {
      id: 'international',
      label: 'Internasional',
      mandiriColor: 'hsl(var(--chart-academic))',
      kolaborasiColor: 'hsl(var(--chart-academic-light))',
      mandiriKey: 'mandiriInternational',
      kolaborasiKey: 'kolaborasiInternational',
    },
  ],
};

const MOBILE_LEVEL_LABELS: Record<PublicationsTab, Record<string, string>> = {
  jurnal: {
    nationalNonAccredited: 'Nas. Tdk Terak.',
    nationalAccredited: 'Nas. Terak.',
    international: 'Intl.',
    reputableInternational: 'Intl. Reputasi',
  },
  seminar: {
    local: 'Lokal',
    national: 'Nasional',
    international: 'Intl.',
  },
  pagelaran: {
    regional: 'Wilayah',
    national: 'Nasional',
    international: 'Intl.',
  },
};

function resolveRowsByTab(data: PublicationsData | null, tab: PublicationsTab): PublicationsRow[] {
  if (!data) return [];
  if (tab === 'jurnal') {
    return (data.jurnal?.by_year ?? data.journals?.by_year ?? []) as PublicationsJurnalByYearRow[];
  }
  if (tab === 'seminar') {
    return (data.seminar?.by_year ?? data.seminars?.by_year ?? []) as PublicationsSeminarByYearRow[];
  }
  return (data.pagelaran?.by_year ?? data.performances?.by_year ?? []) as PublicationsPagelaranByYearRow[];
}

function resolveTotalByTab(data: PublicationsData | null, tab: PublicationsTab): number {
  if (!data) return 0;
  if (tab === 'jurnal') return data.jurnal?.total ?? data.journals?.total ?? 0;
  if (tab === 'seminar') return data.seminar?.total ?? data.seminars?.total ?? 0;
  return data.pagelaran?.total ?? data.performances?.total ?? 0;
}

export function Publications({ activeTab, onActiveTabChange }: PublicationsProps = {}) {
  const { selectedYear } = useInsightDashboard();
  const isMobile = useIsMobile();
  const [internalTab, setInternalTab] = useState<PublicationsTab>('jurnal');
  const [data, setData] = useState<PublicationsData | null>(null);
  const [meta, setMeta] = useState<InsightStatsResponse['meta']>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredDataKey, setHoveredDataKey] = useState<string | null>(null);

  const yearParam = selectedYear === 'all' ? undefined : (selectedYear as number);
  const tab = activeTab ?? internalTab;
  const levelConfig = TAB_LEVELS[tab];

  const applyTab = useCallback((nextTab: PublicationsTab) => {
    if (activeTab === undefined) {
      setInternalTab(nextTab);
    }
    if (onActiveTabChange) {
      onActiveTabChange(nextTab);
    }
  }, [activeTab, onActiveTabChange]);

  useLayoutEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getInsightStats('publications', yearParam, tab)
      .then((res) => {
        if (cancelled) return;
        const typed = res as InsightStatsResponse<PublicationsData>;
        if (typed.success && typed.data) {
          setData(typed.data);
          setMeta(typed.meta ?? null);
        } else {
          setError(getInsightErrorMessage(res.error));
        }
      })
      .catch(() => {
        if (!cancelled) setError('Gagal memuat data');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tab, yearParam]);

  const byYearRows = useMemo(() => resolveRowsByTab(data, tab), [data, tab]);
  const totalRecords = resolveTotalByTab(data, tab);
  const usePercentageChart = tab === 'jurnal';

  const chartData = useMemo(
    () =>
      byYearRows.map((row) => {
        const mapped: Record<string, number | string> = { year: String(row.year) };
        let totalMandiri = 0;
        let totalKolaborasi = 0;

        levelConfig.forEach((level) => {
          const mandiriValue = Number((row as Record<string, unknown>)[level.mandiriKey] ?? 0);
          const kolaborasiValue = Number((row as Record<string, unknown>)[level.kolaborasiKey] ?? 0);

          mapped[level.mandiriKey] = mandiriValue;
          mapped[level.kolaborasiKey] = kolaborasiValue;
          totalMandiri += mandiriValue;
          totalKolaborasi += kolaborasiValue;
        });

        mapped.totalMandiri = totalMandiri;
        mapped.totalKolaborasi = totalKolaborasi;

        if (usePercentageChart) {
          levelConfig.forEach((level) => {
            const mandiriValue = Number(mapped[level.mandiriKey] ?? 0);
            const kolaborasiValue = Number(mapped[level.kolaborasiKey] ?? 0);
            mapped[`${level.mandiriKey}Pct`] = resolvePublicationPercentage(mandiriValue, totalMandiri);
            mapped[`${level.kolaborasiKey}Pct`] = resolvePublicationPercentage(kolaborasiValue, totalKolaborasi);
          });
        }

        return mapped;
      }),
    [byYearRows, levelConfig, usePercentageChart]
  );
  const mobileChartMinWidth = useMemo(() => {
    if (!isMobile) return undefined;
    return `${Math.max(560, chartData.length * 108)}px`;
  }, [chartData.length, isMobile]);

  const totalMandiri = useMemo(
    () => chartData.reduce((sum, row) => sum + Number(row.totalMandiri ?? 0), 0),
    [chartData]
  );
  const totalKolaborasi = useMemo(
    () => chartData.reduce((sum, row) => sum + Number(row.totalKolaborasi ?? 0), 0),
    [chartData]
  );

  const yearText = yearParam ? ` tahun ${yearParam}` : '';
  const interpretationLabel = TAB_INTERPRETATION_LABELS[tab];
  const interpretation = totalRecords > 0
    ? `Total ${interpretationLabel}${yearText}: ${totalRecords}. Mandiri: ${totalMandiri}. Kolaborasi dengan dosen: ${totalKolaborasi}.`
    : `Belum ada data ${interpretationLabel}${yearText}.`;

  const handleChartMouseMove = useCallback((state: unknown) => {
    if (!state || typeof state !== 'object') {
      setHoveredDataKey(null);
      return;
    }

    const chartState = state as {
      isTooltipActive?: boolean;
      activePayload?: Array<{ dataKey?: unknown }>;
    };

    if (!chartState.isTooltipActive) {
      setHoveredDataKey(null);
      return;
    }

    const nextDataKey =
      typeof chartState.activePayload?.[0]?.dataKey === 'string'
        ? chartState.activePayload[0].dataKey
        : null;

    setHoveredDataKey((previous) => (previous === nextDataKey ? previous : nextDataKey));
  }, []);

  const getLegendName = useCallback(
    (level: LevelConfig, category: 'Mandiri' | 'Kolaborasi') => {
      if (!isMobile) return `${level.label} (${category})`;
      const shortLevel = MOBILE_LEVEL_LABELS[tab][level.id] ?? level.label;
      return `${shortLevel} (${category === 'Mandiri' ? 'M' : 'K'})`;
    },
    [isMobile, tab]
  );

  return (
    <DashboardCard
      title="Diseminasi Ilmiah Mahasiswa"
      description={TAB_DESCRIPTIONS[tab]}
      interpretation={interpretation}
      chartMeta={meta ?? undefined}
    >
      {error ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center px-4 py-16 text-center text-muted-foreground">
          <p className="font-medium text-destructive">{error}</p>
        </div>
      ) : (
        <Tabs
          value={tab}
          onValueChange={(value) => {
            if (isPublicationsTab(value)) {
              applyTab(value);
            }
          }}
          className="w-full"
        >
          <TabsList className="grid h-auto w-full grid-cols-1 gap-1 bg-muted/60 p-1 sm:grid-cols-3">
            <TabsTrigger value="jurnal" className="h-auto whitespace-normal px-2 py-2 text-center text-xs leading-tight sm:text-sm">
              {isMobile ? MOBILE_TAB_LABELS.jurnal : TAB_LABELS.jurnal}
            </TabsTrigger>
            <TabsTrigger value="seminar" className="h-auto whitespace-normal px-2 py-2 text-center text-xs leading-tight sm:text-sm">
              {isMobile ? MOBILE_TAB_LABELS.seminar : TAB_LABELS.seminar}
            </TabsTrigger>
            <TabsTrigger value="pagelaran" className="h-auto whitespace-normal px-2 py-2 text-center text-xs leading-tight sm:text-sm">
              {isMobile ? MOBILE_TAB_LABELS.pagelaran : TAB_LABELS.pagelaran}
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 min-h-[280px] sm:min-h-[320px]">
            {loading ? (
              <div className="flex h-[240px] items-center justify-center text-muted-foreground sm:h-[280px]">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex min-h-[240px] items-center justify-center sm:min-h-[280px]">
                <InsightDataEmpty />
              </div>
            ) : (
               <div className="w-full">
                 <div className="flex h-[240px] flex-col sm:h-[320px]">
                   {usePercentageChart && (
                     <p className="mb-2 text-xs text-muted-foreground">
                       Distribusi level publikasi per tahun (tinggi bar = 100%, angka di atas menunjukkan total publikasi).
                     </p>
                   )}
                   <div className={usePercentageChart && isMobile ? 'flex-1 overflow-x-auto pb-1' : 'flex-1'}>
                     <div className="h-full" style={{ minWidth: mobileChartMinWidth }}>
                       <ResponsiveContainer width="100%" height="100%">
                         <BarChart
                           data={chartData}
                           margin={isMobile ? { top: 14, right: 8, left: -8, bottom: 10 } : { top: 18, right: 20, left: 6, bottom: 32 }}
                           barCategoryGap={isMobile ? 18 : 24}
                           onMouseMove={handleChartMouseMove}
                           onMouseLeave={() => setHoveredDataKey(null)}
                         >
                         <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                         <XAxis
                           dataKey="year"
                           orientation="top"
                           tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: isMobile ? 10 : 12 }}
                           axisLine={{ stroke: 'hsl(var(--border))' }}
                           tickLine={false}
                           tickMargin={isMobile ? 6 : 10}
                         />
                         <YAxis
                           hide
                           allowDecimals={false}
                           domain={usePercentageChart ? [0, 100] : undefined}
                           padding={usePercentageChart ? { top: isMobile ? 10 : 16 } : undefined}
                         />
                         <Tooltip
                           shared={false}
                           content={usePercentageChart ? (
                             <PublicationsJurnalPercentTooltip levelConfig={levelConfig} />
                           ) : (
                             <ChartTooltip
                               hideZeroValues
                               valueFormatter={(value) => Number(value).toLocaleString()}
                             />
                           )}
                         />
                         <Legend
                           wrapperStyle={{
                             paddingTop: isMobile ? 14 : 28,
                             fontSize: isMobile ? 10 : 12,
                             lineHeight: 1.4,
                           }}
                           iconSize={isMobile ? 8 : 10}
                           formatter={(value) => (
                             <span style={{ color: 'hsl(var(--muted-foreground) / 0.9)' }}>{value}</span>
                           )}
                         />

                         {levelConfig.map((level) => {
                           const dataKey = usePercentageChart ? `${level.mandiriKey}Pct` : level.mandiriKey;
                           return (
                             <Bar
                               key={`mandiri-${level.id}`}
                               activeBar={hoveredDataKey === dataKey ? PUBLICATION_ACTIVE_BAR_STYLE : false}
                               dataKey={dataKey}
                               name={getLegendName(level, 'Mandiri')}
                               stackId="mandiri"
                               fill={level.mandiriColor}
                             >
                               {!isMobile && usePercentageChart && <LabelList dataKey={dataKey} content={PublicationsPercentLabel} />}
                             </Bar>
                           );
                         })}
                         {levelConfig.map((level) => {
                           const dataKey = usePercentageChart ? `${level.kolaborasiKey}Pct` : level.kolaborasiKey;
                           return (
                             <Bar
                               key={`kolaborasi-${level.id}`}
                               activeBar={hoveredDataKey === dataKey ? PUBLICATION_ACTIVE_BAR_STYLE : false}
                               dataKey={dataKey}
                               name={getLegendName(level, 'Kolaborasi')}
                               stackId="kolaborasi"
                               fill={level.kolaborasiColor}
                             >
                               {!isMobile && usePercentageChart && <LabelList dataKey={dataKey} content={PublicationsPercentLabel} />}
                             </Bar>
                           );
                         })}

                         {!isMobile && usePercentageChart && <Customized component={<PublicationsTotalsLabels data={chartData} />} />}
                         {!isMobile && <Customized component={PublicationsCategoryLabels} />}
                       </BarChart>
                     </ResponsiveContainer>
                   </div>
                   </div>
                 </div>
               </div>
             )}
           </div>
         </Tabs>
       )}
    </DashboardCard>
  );
}
