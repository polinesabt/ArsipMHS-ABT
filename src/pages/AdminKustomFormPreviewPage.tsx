import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getSatisfactionTemplate } from '@/repositories/satisfaction-form.repository';
import type {
  SatisfactionFormDefinition,
  SatisfactionSection,
  SatisfactionSectionOpen,
  SatisfactionSectionMultipleChoice,
  SatisfactionSectionScale,
} from '@/types/satisfaction-form.types';
import { ArrowLeft, Eye } from 'lucide-react';

type PreviewState = {
  title?: string;
  definition?: SatisfactionFormDefinition;
  returnTo?: string;
  returnLabel?: string;
};

const SCALE_LABELS: Record<number, string> = {
  5: 'Sangat Baik',
  4: 'Baik',
  3: 'Cukup Baik',
  2: 'Kurang Baik',
  1: 'Tidak Baik',
};

function buildScaleColumns(minValue?: number, maxValue?: number): Array<{ value: number; label: string }> {
  const rawMin = Number.isFinite(minValue) ? Number(minValue) : 1;
  const rawMax = Number.isFinite(maxValue) ? Number(maxValue) : 5;
  const min = Math.min(rawMin, rawMax);
  const max = Math.max(rawMin, rawMax);
  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const orderedValues = min === 1 && max === 5 ? [...values].reverse() : values;
  return orderedValues.map((value) => ({
    value,
    label: SCALE_LABELS[value] ?? `Skor ${value}`,
  }));
}

export default function AdminKustomFormPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const previewState = (location.state as PreviewState | null) ?? null;
  const backTarget = previewState?.returnTo?.trim();
  const backLabel = previewState?.returnLabel?.trim() || 'Kembali ke editor';

  const [loading, setLoading] = useState(Boolean(id));
  const [title, setTitle] = useState('');
  const [sections, setSections] = useState<SatisfactionSection[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | string[] | Record<string, string>>>({});

  useEffect(() => {
    if (id) {
      setLoading(true);
      getSatisfactionTemplate(id)
        .then((res) => {
          if (res.success && res.data) {
            setTitle(res.data.title);
            setSections(res.data.definition?.sections ?? []);
          } else {
            navigate('/admin/kustom-form-kepuasan');
          }
        })
        .catch(() => navigate('/admin/kustom-form-kepuasan'))
        .finally(() => setLoading(false));
    } else {
      const state = previewState;
      if (state?.definition?.sections?.length) {
        setTitle(state.title ?? '');
        setSections(state.definition.sections);
      } else {
        navigate('/admin/kustom-form-kepuasan');
      }
    }
  }, [id, navigate, previewState]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <p className="text-muted-foreground">Memuat preview…</p>
      </div>
    );
  }

  if (sections.length === 0) {
    return null;
  }

  const goBack = () => {
    if (backTarget) {
      navigate(backTarget);
      return;
    }
    if (id) navigate(`/admin/kustom-form-kepuasan/edit/${id}`);
    else navigate('/admin/kustom-form-kepuasan');
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Eye className="h-8 w-8 shrink-0 text-amber-600 dark:text-amber-500" />
              <div>
                <CardTitle className="text-lg">Preview — Tampilan di sisi mahasiswa</CardTitle>
                <CardDescription>
                  Halaman ini meniru tampilan saat mahasiswa mengisi survey kepuasan. Data yang diisi tidak dikirim.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="space-y-1">
              <CardTitle className="text-lg font-normal text-muted-foreground">
                {title.trim() || '(Judul formulir)'}
              </CardTitle>
            </div>
          </CardHeader>
        </Card>

        {sections.map((sec) => {
          const secId = sec.id;
          const value = answers[secId];
          return (
            <Card key={secId}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {sec.title || '(Judul section)'}
                  {sec.required && <span className="text-destructive ml-1">*</span>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sec.type === 'open' && (
                  <Input
                    placeholder={(sec as SatisfactionSectionOpen).placeholder ?? ''}
                    value={typeof value === 'string' ? value : ''}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [secId]: e.target.value }))}
                  />
                )}
                {sec.type === 'multiple_choice' && (
                  <div className="space-y-2">
                    {((sec as SatisfactionSectionMultipleChoice).options ?? []).map((opt, i) => {
                      const multi = (sec as SatisfactionSectionMultipleChoice).allowMultiple;
                      const selected = multi
                        ? (Array.isArray(value) ? value : [])
                        : (typeof value === 'string' ? value : '');
                      const checked = multi
                        ? (selected as string[]).includes(opt)
                        : selected === opt;
                      return (
                        <label key={i} className="flex items-center gap-2">
                          <input
                            type={multi ? 'checkbox' : 'radio'}
                            name={secId}
                            checked={checked}
                            onChange={() => {
                              if (multi) {
                                const arr = Array.isArray(value) ? value : [];
                                const next = arr.includes(opt)
                                  ? arr.filter((x) => x !== opt)
                                  : [...arr, opt];
                                setAnswers((prev) => ({ ...prev, [secId]: next }));
                              } else {
                                setAnswers((prev) => ({ ...prev, [secId]: opt }));
                              }
                            }}
                          />
                          {opt}
                        </label>
                      );
                    })}
                  </div>
                )}
                {sec.type === 'scale' && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Setiap aspek wajib memilih satu nilai.
                    </p>
                    {(() => {
                      const scaleSection = sec as SatisfactionSectionScale;
                      const questions = scaleSection.questions ?? [];
                      const columns = buildScaleColumns(scaleSection.scaleMin, scaleSection.scaleMax);
                      const scaleObj =
                        typeof value === 'object' && value && !Array.isArray(value)
                          ? (value as Record<string, string>)
                          : {};

                      if (questions.length === 0) {
                        return (
                          <p className="text-sm text-muted-foreground">
                            Belum ada aspek penilaian untuk bagian skala ini.
                          </p>
                        );
                      }

                      return (
                        <div className="overflow-x-auto rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-14">No</TableHead>
                                <TableHead>Aspek Penilaian</TableHead>
                                {columns.map((column) => (
                                  <TableHead
                                    key={`${secId}-head-${column.value}`}
                                    className="min-w-[110px] text-center"
                                  >
                                    {column.label}
                                  </TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {questions.map((q, qIndex) => (
                                <TableRow key={q.id}>
                                  <TableCell>{qIndex + 1}</TableCell>
                                  <TableCell>{q.title || `Aspek ${qIndex + 1}`}</TableCell>
                                  {columns.map((column) => (
                                    <TableCell
                                      key={`${q.id}-${column.value}`}
                                      className="text-center"
                                    >
                                      <input
                                        type="radio"
                                        name={`${secId}-${q.id}`}
                                        checked={scaleObj[q.id] === String(column.value)}
                                        onChange={() =>
                                          setAnswers((prev) => {
                                            const prevObj =
                                              typeof prev[secId] === 'object' &&
                                              prev[secId] &&
                                              !Array.isArray(prev[secId])
                                                ? (prev[secId] as Record<string, string>)
                                                : {};
                                            return {
                                              ...prev,
                                              [secId]: { ...prevObj, [q.id]: String(column.value) },
                                            };
                                          })
                                        }
                                      />
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      );
                    })()}
                  </div>
                )}
                {sec.type === 'file_upload' && (
                  <Input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      setAnswers((prev) => ({
                        ...prev,
                        [secId]: file ? file.name : '',
                      }));
                    }}
                  />
                )}
              </CardContent>
            </Card>
          );
        })}

        <div className="flex flex-wrap items-center gap-3 pt-4">
          <Button variant="outline" onClick={goBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
