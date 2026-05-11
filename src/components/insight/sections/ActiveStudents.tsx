import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, Legend, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DashboardCard } from '@/components/insight/dashboard/DashboardCard';
import { InsightDataEmpty } from '@/components/insight/InsightDataEmpty';
import { useInsightDashboard } from '@/contexts/InsightDashboardContext';
import {
  getInsightStats,
  getActiveStudentsSemesterStats,
  upsertActiveStudentsSemesterStat,
  deleteActiveStudentsSemesterStat,
  type ActiveStudentsData,
  type ActiveStudentsSemesterRow,
  type InsightStatsResponse,
} from '@/repositories/insight.repository';
import { getInsightErrorMessage } from '@/lib/insight-errors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useActiveStudentsInput } from '@/contexts/ActiveStudentsInputContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckSquare, Loader2, Trash2 } from 'lucide-react';
import type { TooltipProps } from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';

const TOOLTIP_FALLBACK_COLOR = 'hsl(var(--muted-foreground))';

type ActiveStudentsBarKey = 'genap_aktif' | 'genap_pd_dikti' | 'ganjil_aktif' | 'ganjil_pd_dikti';
type ActiveStudentsChartRow = {
  year: string;
  genap_aktif: number;
  genap_pd_dikti: number;
  ganjil_aktif: number;
  ganjil_pd_dikti: number;
};

const BAR_META: Record<
  ActiveStudentsBarKey,
  { name: string; color: string }
> = {
  genap_aktif: { name: 'Aktif Genap', color: 'hsl(var(--chart-active-genap))' },
  genap_pd_dikti: { name: 'PD-Dikti Genap', color: 'hsl(var(--chart-pd-dikti))' },
  ganjil_aktif: { name: 'Aktif Ganjil', color: 'hsl(var(--chart-active-ganjil))' },
  ganjil_pd_dikti: { name: 'PD-Dikti Ganjil', color: 'hsl(var(--chart-pd-dikti-ganjil))' },
};

type HoveredBar = {
  dataKey: ActiveStudentsBarKey;
  yearLabel: string;
};

/** Tooltip hanya tampil saat hover ke segmen bar; isi mengikuti segmen yang di-hover (tahun + nama + nilai). */
function ActiveStudentsDatasetTooltip(
  props: TooltipProps<number, string> & {
    hoveredBar: HoveredBar | null;
    chartData: ActiveStudentsChartRow[];
  }
) {
  const { hoveredBar, chartData } = props;

  if (!hoveredBar) return null;

  const row = chartData.find((r) => String(r.year) === hoveredBar.yearLabel);
  const value = row ? row[hoveredBar.dataKey] : undefined;
  const meta = BAR_META[hoveredBar.dataKey];

  if (meta == null) return null;

  const formattedValue = typeof value === 'number' ? value.toLocaleString() : String(value ?? '-');

  return (
    <div className="chart-tooltip">
      <p className="font-medium text-foreground mb-2">{hoveredBar.yearLabel}</p>
      <div className="flex items-center gap-2 text-sm">
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: meta.color || TOOLTIP_FALLBACK_COLOR }}
        />
        <span className="text-muted-foreground">{meta.name}:</span>
        <span className="font-medium text-foreground">{formattedValue}</span>
      </div>
    </div>
  );
}

const SEMESTER_OPTIONS: Array<'genap' | 'ganjil'> = ['genap', 'ganjil'];
const YEAR_MIN = 2018;
const YEAR_MAX = 2030;
const YEARS = Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, i) => YEAR_MIN + i);

type ActiveStudentsLabelProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number;
  payload?: Partial<Record<ActiveStudentsBarKey, unknown>>;
};

/** Label di dalam bar. Pakai payload[dataKey] agar di stacked bar segment atas tidak ikut nilai kumulatif; fallback ke value. */
function renderBarLabelByKey(dataKey: ActiveStudentsBarKey) {
  return (props: ActiveStudentsLabelProps) => {
    const { x, y, width, height, value: valueProp, payload } = props;
    const value = (typeof payload?.[dataKey] === 'number' ? payload?.[dataKey] : valueProp) as number | undefined;
    if (value == null || typeof value !== 'number' || value <= 0) return null;
    if (typeof x !== 'number' || typeof y !== 'number' || typeof width !== 'number' || typeof height !== 'number') return null;
    if (width <= 0 || height <= 0) return null;

    return (
      <text
        x={x + width / 2}
        y={y + height / 2}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={11}
        fontWeight={600}
      >
        {value.toLocaleString()}
      </text>
    );
  };
}

function loadChartAndStats(
  yearParam: number | undefined,
  setData: (d: ActiveStudentsData | null) => void,
  setMeta: (m: InsightStatsResponse['meta'] | null) => void,
  setError: (e: string | null) => void,
  setLoading: (l: boolean) => void,
  setStatsRows: (r: ActiveStudentsSemesterRow[]) => void
) {
  setLoading(true);
  setError(null);
  Promise.all([
    getInsightStats('active_students', yearParam),
    getActiveStudentsSemesterStats(yearParam ?? undefined),
  ])
    .then(([res, statsRes]) => {
      const typed = res as InsightStatsResponse<ActiveStudentsData>;
      if (typed.success && typed.data) {
        setData(typed.data);
        setMeta(typed.meta ?? null);
      } else setError(getInsightErrorMessage(res.error));
      if (statsRes.success && statsRes.data) setStatsRows(statsRes.data);
    })
    .catch(() => setError('Gagal memuat data'))
    .finally(() => setLoading(false));
}

export function ActiveStudents() {
  const { selectedYear } = useInsightDashboard();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [data, setData] = useState<ActiveStudentsData | null>(null);
  const [meta, setMeta] = useState<InsightStatsResponse['meta']>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsRows, setStatsRows] = useState<ActiveStudentsSemesterRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [formTahun, setFormTahun] = useState<number>(new Date().getFullYear());
  const [formSemester, setFormSemester] = useState<'genap' | 'ganjil'>('ganjil');
  const [formPdDikti, setFormPdDikti] = useState<string>('');
  const [formAktif, setFormAktif] = useState<string>('');
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showChecklist, setShowChecklist] = useState(false);
  const [hoveredBar, setHoveredBar] = useState<HoveredBar | null>(null);
  const { open: inputDialogOpen, setOpen: setInputDialogOpen } = useActiveStudentsInput() ?? { open: false, setOpen: () => {} };

  const rowId = (row: ActiveStudentsSemesterRow) => `${row.tahun}-${row.semester}`;
  const allSelected = statsRows.length > 0 && selectedIds.length === statsRows.length;
  const someSelected = selectedIds.length > 0;
  const toggleAll = (checked: boolean) => setSelectedIds(checked ? statsRows.map(rowId) : []);
  const toggleOne = (key: string, checked: boolean) =>
    setSelectedIds((prev) => (checked ? [...prev, key] : prev.filter((id) => id !== key)));
  const yearParam = selectedYear === 'all' ? undefined : (selectedYear as number);

  const handleEditRow = (row: ActiveStudentsSemesterRow) => {
    setFormTahun(row.tahun);
    setFormSemester(row.semester);
    setFormAktif(row.aktif != null ? String(row.aktif) : '');
    setFormPdDikti(String(row.pd_dikti));
  };

  const handleDeleteRow = (row: ActiveStudentsSemesterRow) => {
    if (!window.confirm(`Hapus data ${row.tahun} semester ${row.semester}?`)) return;
    const key = `${row.tahun}-${row.semester}`;
    setDeletingKey(key);
    deleteActiveStudentsSemesterStat(row.tahun, row.semester)
      .then((res) => {
        if (res.success) {
          toast({ title: 'Data dihapus' });
          refresh();
        } else toast({ title: 'Gagal menghapus', description: res.error, variant: 'destructive' });
      })
      .finally(() => setDeletingKey(null));
  };

  const refresh = useCallback(() => {
    loadChartAndStats(yearParam, setData, setMeta, setError, setLoading, setStatsRows);
  }, [yearParam]);

  useEffect(() => {
    let cancelled = false;
    const setDataSafe = (d: ActiveStudentsData | null) => { if (!cancelled) setData(d); };
    const setMetaSafe = (m: InsightStatsResponse['meta'] | null) => { if (!cancelled) setMeta(m); };
    const setErrorSafe = (e: string | null) => { if (!cancelled) setError(e); };
    const setLoadingSafe = (l: boolean) => { if (!cancelled) setLoading(l); };
    const setStatsRowsSafe = (r: ActiveStudentsSemesterRow[]) => { if (!cancelled) setStatsRows(r); };
    loadChartAndStats(yearParam, setDataSafe, setMetaSafe, setErrorSafe, setLoadingSafe, setStatsRowsSafe);
    return () => { cancelled = true; };
  }, [yearParam]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const pdDikti = parseInt(formPdDikti, 10);
    const aktif = formAktif.trim() === '' ? null : parseInt(formAktif, 10);
    if (aktif !== null && (Number.isNaN(aktif) || aktif < 0)) {
      toast({ title: 'Mahasiswa aktif harus angka >= 0 atau kosongkan', variant: 'destructive' });
      return;
    }
    if (Number.isNaN(pdDikti) || pdDikti < 0) {
      toast({ title: 'Terdaftar PD-Dikti harus angka >= 0', variant: 'destructive' });
      return;
    }
    setSaving(true);
    upsertActiveStudentsSemesterStat({
      tahun: formTahun,
      semester: formSemester,
      pd_dikti: pdDikti,
      aktif: aktif ?? undefined,
    })
      .then((res) => {
        if (res.success) {
          toast({ title: 'Data tersimpan', description: `${formTahun} semester ${formSemester}: Mahasiswa aktif ${aktif ?? '-'}, Terdaftar PD-Dikti ${pdDikti}.` });
          setFormPdDikti('');
          setFormAktif('');
          refresh();
        } else toast({ title: 'Gagal menyimpan', description: res.error, variant: 'destructive' });
      })
      .finally(() => setSaving(false));
  };

  const byYear = data?.by_year ?? [];
  const hasData = byYear.length > 0;
  const chartData = byYear.map((r) => ({
    year: String(r.year),
    genap_aktif: r.genap_aktif,
    genap_pd_dikti: r.genap_pd_dikti,
    ganjil_aktif: r.ganjil_aktif,
    ganjil_pd_dikti: r.ganjil_pd_dikti,
  }));
  const mobileChartMinWidth = isMobile ? `${Math.max(560, chartData.length * 110)}px` : undefined;
  const interpretation = 'Bar kiri = Genap, bar kanan = Ganjil. Segmen bawah = mahasiswa aktif, segmen atas = terdaftar PD-Dikti.';

  const handleBarMouseEnter = useCallback(
    (dataKey: ActiveStudentsBarKey) => (_: unknown, index: number) => {
      const yearLabel = String(chartData[index]?.year ?? '-');
      setHoveredBar((prev) => {
        if (prev && prev.dataKey === dataKey && prev.yearLabel === yearLabel) return prev;
        return { dataKey, yearLabel };
      });
    },
    [chartData]
  );

  const handleBarMouseLeave = useCallback(() => {
    setHoveredBar((prev) => (prev ? null : prev));
  }, []);

  const buildBarShape = useCallback(
    (dataKey: ActiveStudentsBarKey) => (props: Record<string, unknown>) => {
      const shapeProps = props as { fill?: string; payload?: { year?: unknown } };
      const yearLabel = String(shapeProps.payload?.year ?? '-');
      const isHovered = hoveredBar?.dataKey === dataKey && hoveredBar.yearLabel === yearLabel;

      return (
        <Rectangle
          {...props}
          fill={typeof shapeProps.fill === 'string' && shapeProps.fill ? shapeProps.fill : TOOLTIP_FALLBACK_COLOR}
          fillOpacity={1}
          stroke={isHovered ? 'hsl(var(--foreground) / 0.9)' : 'none'}
          strokeWidth={isHovered ? 2 : 0}
          strokeLinejoin="round"
        />
      );
    },
    [hoveredBar]
  );

  return (
    <DashboardCard
      title="Mahasiswa Aktif"
      description="Perbandingan mahasiswa aktif dan terdaftar PD-Dikti per semester (Genap kiri, Ganjil kanan). Data dapat diperbarui lewat tombol input."
      interpretation={interpretation}
      chartMeta={meta ?? undefined}
    >
      {loading ? (
        <div className="flex min-h-[240px] items-center justify-center text-muted-foreground sm:min-h-[320px]">Memuat data...</div>
      ) : error ? (
        <div className="flex min-h-[240px] flex-col items-center justify-center px-4 py-16 text-center text-muted-foreground sm:min-h-[320px]">
          <p className="font-medium text-destructive">{error}</p>
        </div>
      ) : !hasData ? (
        <div className="flex min-h-[240px] items-center justify-center sm:min-h-[320px]">
          <InsightDataEmpty />
        </div>
      ) : (
        <div className={isMobile ? 'w-full overflow-x-auto pb-1' : 'w-full'}>
          <div className="h-[240px] w-full sm:h-[340px]" style={{ minWidth: mobileChartMinWidth }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={isMobile ? { top: 12, right: 8, left: -6, bottom: 4 } : { top: 16, right: 16, left: 8, bottom: 10 }}
                barCategoryGap={isMobile ? 20 : 28}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="year"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: isMobile ? 10 : 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickMargin={isMobile ? 4 : 6}
                />
                <YAxis
                  hide
                  allowDecimals={false}
                />
                <Tooltip
                  shared={false}
                  trigger="hover"
                  content={(tooltipProps) => (
                    <ActiveStudentsDatasetTooltip
                      {...tooltipProps}
                      hoveredBar={hoveredBar}
                      chartData={chartData}
                    />
                  )}
                />
                <Legend wrapperStyle={{ paddingTop: isMobile ? 10 : 14, fontSize: isMobile ? 10 : 12, lineHeight: 1.4 }} iconSize={isMobile ? 8 : 10} />
                <Bar
                  activeBar={false}
                  shape={buildBarShape('genap_aktif')}
                  dataKey="genap_aktif"
                  name={isMobile ? 'Aktif Gnp' : 'Aktif Genap'}
                  stackId="genap"
                  fill="hsl(var(--chart-active-genap))"
                  radius={[0, 0, 0, 0]}
                  onMouseEnter={handleBarMouseEnter('genap_aktif')}
                  onMouseLeave={handleBarMouseLeave}
                >
                  {!isMobile && <LabelList dataKey="genap_aktif" content={renderBarLabelByKey('genap_aktif')} />}
                </Bar>
                <Bar
                  activeBar={false}
                  shape={buildBarShape('genap_pd_dikti')}
                  dataKey="genap_pd_dikti"
                  name={isMobile ? 'PD Gnp' : 'PD-Dikti Genap'}
                  stackId="genap"
                  fill="hsl(var(--chart-pd-dikti))"
                  radius={[4, 4, 0, 0]}
                  onMouseEnter={handleBarMouseEnter('genap_pd_dikti')}
                  onMouseLeave={handleBarMouseLeave}
                >
                  {!isMobile && <LabelList dataKey="genap_pd_dikti" content={renderBarLabelByKey('genap_pd_dikti')} />}
                </Bar>
                <Bar
                  activeBar={false}
                  shape={buildBarShape('ganjil_aktif')}
                  dataKey="ganjil_aktif"
                  name={isMobile ? 'Aktif Gjl' : 'Aktif Ganjil'}
                  stackId="ganjil"
                  fill="hsl(var(--chart-active-ganjil))"
                  radius={[0, 0, 0, 0]}
                  onMouseEnter={handleBarMouseEnter('ganjil_aktif')}
                  onMouseLeave={handleBarMouseLeave}
                >
                  {!isMobile && <LabelList dataKey="ganjil_aktif" content={renderBarLabelByKey('ganjil_aktif')} />}
                </Bar>
                <Bar
                  activeBar={false}
                  shape={buildBarShape('ganjil_pd_dikti')}
                  dataKey="ganjil_pd_dikti"
                  name={isMobile ? 'PD Gjl' : 'PD-Dikti Ganjil'}
                  stackId="ganjil"
                  fill="hsl(var(--chart-pd-dikti-ganjil))"
                  radius={[4, 4, 0, 0]}
                  onMouseEnter={handleBarMouseEnter('ganjil_pd_dikti')}
                  onMouseLeave={handleBarMouseLeave}
                >
                  {!isMobile && <LabelList dataKey="ganjil_pd_dikti" content={renderBarLabelByKey('ganjil_pd_dikti')} />}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <Dialog open={inputDialogOpen} onOpenChange={setInputDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Input manual per semester</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Isi tahun dan semester, lalu jumlah mahasiswa aktif (semester ini) dan jumlah terdaftar PD-Dikti (semester ini). Grafik akan menyesuaikan.
          </p>
          <p className="text-xs text-muted-foreground">
            Contoh: Tahun 2020 Semester Ganjil - Mahasiswa aktif 200, Terdaftar PD-Dikti 200. Tahun 2020 Semester Genap - Mahasiswa aktif 199, Terdaftar PD-Dikti 200. Di grafik: segmen bawah = mahasiswa aktif, segmen atas = terdaftar PD-Dikti; sumbu Y menyesuaikan sehingga panjang masing-masing terlihat.
          </p>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[100px_100px_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
            <div className="space-y-1.5">
              <Label className="text-xs">Tahun</Label>
              <Select value={String(formTahun)} onValueChange={(v) => setFormTahun(parseInt(v, 10))}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Semester</Label>
              <Select value={formSemester} onValueChange={(v) => setFormSemester(v as 'genap' | 'ganjil')}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEMESTER_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s === 'genap' ? 'Genap' : 'Ganjil'}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Mahasiswa aktif (semester ini)</Label>
              <Input
                type="number"
                min={0}
                className="h-9 w-full"
                placeholder="0"
                value={formAktif}
                onChange={(e) => setFormAktif(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Terdaftar PD-Dikti (semester ini)</Label>
              <Input
                type="number"
                min={0}
                className="h-9 w-full"
                placeholder="0"
                value={formPdDikti}
                onChange={(e) => setFormPdDikti(e.target.value)}
              />
            </div>
            <Button type="submit" size="sm" disabled={saving} className="w-full sm:w-auto">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Simpan
            </Button>
          </form>
          {statsRows.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant={showChecklist ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setShowChecklist((v) => !v);
                    if (showChecklist) setSelectedIds([]);
                  }}
                >
                  <CheckSquare className="h-3.5 w-3.5 mr-1" />
                  Checklist
                </Button>
                {showChecklist && selectedIds.length > 0 && (
                  <>
                    <span className="text-xs text-muted-foreground">{selectedIds.length} dipilih</span>
                    <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={deletingKey !== null}
                    onClick={async () => {
                      if (!window.confirm(`Hapus ${selectedIds.length} data terpilih?`)) return;
                      const toDelete = selectedIds.map((key) => statsRows.find((r) => rowId(r) === key)).filter(Boolean) as ActiveStudentsSemesterRow[];
                      for (const row of toDelete) {
                        const key = rowId(row);
                        setDeletingKey(key);
                        const res = await deleteActiveStudentsSemesterStat(row.tahun, row.semester);
                        if (res.success) {
                          toast({ title: 'Data dihapus' });
                        } else {
                          toast({ title: 'Gagal menghapus', description: res.error, variant: 'destructive' });
                        }
                        setDeletingKey(null);
                      }
                      setSelectedIds([]);
                      refresh();
                    }}
                  >
                    {deletingKey ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Trash2 className="h-3.5 w-3.5 mr-1" />}
                    Hapus
                  </Button>
                  </>
                )}
              </div>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    {showChecklist && (
                      <th className="w-10 py-1.5 pl-1">
                        <Checkbox
                          checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                          onCheckedChange={(c) => toggleAll(c === true)}
                          aria-label="Pilih semua"
                        />
                      </th>
                    )}
                    <th className="text-left py-1.5 font-medium">Tahun</th>
                    <th className="text-left py-1.5 font-medium">Semester</th>
                    <th className="text-right py-1.5 font-medium">Aktif</th>
                    <th className="text-right py-1.5 font-medium">Terdaftar PD-Dikti</th>
                  </tr>
                </thead>
                <tbody>
                  {statsRows.map((row, i) => {
                    const rowKey = rowId(row);
                    return (
                      <tr key={`${row.tahun}-${row.semester}-${i}`} className="border-b border-border/50">
                        {showChecklist && (
                          <td className="py-1 pl-1">
                            <Checkbox
                              checked={selectedIds.includes(rowKey)}
                              onCheckedChange={(c) => toggleOne(rowKey, c === true)}
                              aria-label={`Pilih ${row.tahun} ${row.semester}`}
                            />
                          </td>
                        )}
                        <td className="py-1">{row.tahun}</td>
                        <td className="py-1 capitalize">{row.semester}</td>
                        <td className="py-1 text-right">{row.aktif ?? '-'}</td>
                        <td className="py-1 text-right">{row.pd_dikti}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardCard>
  );
}
