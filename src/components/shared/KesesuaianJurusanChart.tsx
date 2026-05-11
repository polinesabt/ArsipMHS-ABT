import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

export interface KesesuaianJurusanEntry {
  key: string;
  label: string;
  value: number;
}

type KesesuaianJurusanChartRow = KesesuaianJurusanEntry & {
  displayLabel: string;
  percent: number;
};

interface KesesuaianJurusanChartProps {
  data: KesesuaianJurusanEntry[];
  /** Tinggi container (default 360) */
  height?: number;
  /** Donut: set innerRadius (mis. 56) dan outerRadius (mis. 96); kalau tidak set = pie penuh outerRadius 120 */
  innerRadius?: number;
  outerRadius?: number;
  /** Untuk donut: cy % (default 50; Admin pakai 46) */
  cyPercent?: number;
  /** Custom class untuk wrapper div */
  className?: string;
}

function toDisplayLabel(key: string, label: string): string {
  if (key === 'ya') return 'Sesuai';
  if (key === 'tidak') return 'Tidak sesuai';
  return label;
}

function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

function KesesuaianJurusanTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload as KesesuaianJurusanChartRow | undefined;
  if (!row) return null;

  return (
    <div className="rounded-md border bg-background p-3 shadow-md min-w-[140px]">
      <p className="text-sm font-semibold">{row.displayLabel}</p>
      <p className="text-xs text-muted-foreground mt-1">{formatPercent(row.percent)}</p>
    </div>
  );
}

export function KesesuaianJurusanChart({
  data,
  height = 360,
  innerRadius,
  outerRadius = innerRadius != null ? 96 : 120,
  cyPercent = innerRadius != null ? 46 : 50,
  className,
}: KesesuaianJurusanChartProps) {
  const total = data.reduce((sum, row) => sum + (row.value ?? 0), 0);
  const chartData: KesesuaianJurusanChartRow[] = data.map((row) => ({
    ...row,
    displayLabel: toDisplayLabel(row.key, row.label),
    percent: total > 0 ? ((row.value ?? 0) / total) * 100 : 0,
  }));
  const showLabels = chartData.length <= 2;

  return (
    <div className={className} style={{ width: '100%', minHeight: 280, height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="percent"
            nameKey="displayLabel"
            cx="50%"
            cy={`${cyPercent}%`}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            label={
              showLabels
                ? ({ payload, value }: any) =>
                    `${payload?.displayLabel ?? payload?.label ?? '-'}: ${formatPercent(Number(value) || 0)}`
                : undefined
            }
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.key}
                fill={entry.key === 'ya' ? '#16a34a' : '#ef4444'}
              />
            ))}
          </Pie>
          <Tooltip content={<KesesuaianJurusanTooltip />} />
          <Legend
            formatter={(value: string, entry: any) => entry?.payload?.displayLabel ?? value}
            align="center"
            verticalAlign={innerRadius != null ? 'bottom' : 'middle'}
            wrapperStyle={{ paddingTop: 8 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
