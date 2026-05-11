import { TooltipProps } from 'recharts';

interface CustomTooltipProps extends TooltipProps<number, string> {
  valueFormatter?: (value: number) => string;
  labelFormatter?: (label: string) => string;
  hideZeroValues?: boolean;
}

export function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter = (v) => v.toLocaleString(),
  labelFormatter = (l) => l,
  hideZeroValues = false,
}: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const filteredPayload = hideZeroValues
    ? payload.filter((entry) => Math.abs(Number(entry.value ?? 0)) > 0)
    : payload;
  if (!filteredPayload.length) return null;

  return (
    <div className="chart-tooltip">
      <p className="font-medium text-foreground mb-2">{labelFormatter(label)}</p>
      <div className="space-y-1">
        {filteredPayload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium text-foreground">
              {valueFormatter(entry.value as number)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface PieTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { fill: string };
  }>;
  total?: number;
}

export function PieChartTooltip({ active, payload, total }: PieTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const { name, value, payload: item } = payload[0];
  const percentage = total ? ((value / total) * 100).toFixed(1) : 0;

  return (
    <div className="chart-tooltip">
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: item.fill }}
        />
        <span className="font-medium text-foreground">{name}</span>
      </div>
      <div className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{value.toLocaleString()}</span>
        {total && <span> ({percentage}%)</span>}
      </div>
    </div>
  );
}
