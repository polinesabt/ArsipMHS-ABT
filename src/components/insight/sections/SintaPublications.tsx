import { useMemo } from 'react';
import { ExternalLink } from 'lucide-react';
import { Cell, Pie, PieChart, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChartTooltip } from '@/components/insight/dashboard/ChartTooltip';
import { InsightDataEmpty } from '@/components/insight/InsightDataEmpty';
import { getSintaPublications } from '@/lib/sinta-publications';

const SINTA_LEVELS = [
  { level: 1, color: '#274690' },
  { level: 2, color: '#3182a0' },
  { level: 3, color: '#3aa889' },
  { level: 4, color: '#e0a54b' },
  { level: 5, color: '#d46e65' },
] as const;

export function SintaPublications({ year }: { year?: number }) {
  const rows = useMemo(() => getSintaPublications(year), [year]);
  const chartData = useMemo(() => SINTA_LEVELS.map(({ level, color }) => ({
    name: `SINTA ${level}`,
    value: rows.filter((item) => item.level === level).length,
    fill: color,
  })), [rows]);
  const visibleChartData = useMemo(() => chartData.filter((item) => item.value > 0), [chartData]);

  if (rows.length === 0) {
    return (
      <div className="flex min-h-[280px] items-center justify-center">
        <InsightDataEmpty />
      </div>
    );
  }

  return (
    <div className="space-y-6 py-1">
      <div className="grid items-center gap-4 md:grid-cols-[minmax(0,1fr)_minmax(210px,0.8fr)]">
        <div className="relative h-[260px] w-full" role="img" aria-label={`Diagram kategori publikasi SINTA, total ${rows.length} data. ${visibleChartData.map((item) => `${item.name}: ${item.value}`).join(', ')}`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={visibleChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={67} outerRadius={105} paddingAngle={2} stroke="hsl(var(--card))" strokeWidth={2}>
                {visibleChartData.map((item) => (
                  <Cell key={item.name} fill={item.fill} />
                ))}
              </Pie>
              <Tooltip content={<PieChartTooltip total={rows.length} />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
            <strong className="text-3xl font-semibold tabular-nums text-foreground">{rows.length}</strong>
            <span className="text-xs text-muted-foreground">publikasi</span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-5 md:grid-cols-1">
          {visibleChartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-4 rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-sm">
              <span className="flex items-center gap-2 text-foreground">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.fill }} />
                {item.name}
              </span>
              <span className="font-semibold tabular-nums text-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h4 className="text-sm font-semibold text-foreground">Daftar Publikasi SINTA</h4>
          <span className="text-xs text-muted-foreground">{rows.length} entri mahasiswa–publikasi{year ? ` · ${year}` : ''}</span>
        </div>
        <div className="max-h-[480px] overflow-auto rounded-lg border border-border/70">
          <table className="w-full min-w-[780px] border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10 bg-muted text-xs text-muted-foreground">
              <tr>
                <th scope="col" className="w-[180px] px-3 py-3 font-medium">Nama Mahasiswa</th>
                <th scope="col" className="min-w-[290px] px-3 py-3 font-medium">Judul Publikasi</th>
                <th scope="col" className="w-[95px] px-3 py-3 font-medium">Level Jurnal</th>
                <th scope="col" className="min-w-[180px] px-3 py-3 font-medium">Nama Dosen</th>
                <th scope="col" className="w-[70px] px-3 py-3 font-medium">Tahun</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((item, index) => (
                <tr key={`${item.studentName}-${item.title}-${index}`} className="align-top hover:bg-muted/30">
                  <td className="px-3 py-3 font-medium text-foreground">{item.studentName}</td>
                  <td className="px-3 py-3">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1.5 text-primary underline-offset-2 hover:underline focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                      <span>{item.title}</span>
                      <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    </a>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">SINTA {item.level}</td>
                  <td className="px-3 py-3">{item.lecturers}</td>
                  <td className="px-3 py-3 tabular-nums">{item.year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
