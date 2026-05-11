import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  getSatisfactionTemplate,
  createSatisfactionTemplate,
  updateSatisfactionTemplate,
} from '@/repositories/satisfaction-form.repository';
import type {
  SatisfactionFormDefinition,
  SatisfactionSection,
  SatisfactionSectionOpen,
  SatisfactionSectionMultipleChoice,
  SatisfactionSectionScale,
  SatisfactionSectionFileUpload,
  SatisfactionScaleQuestion,
} from '@/types/satisfaction-form.types';
import { ArrowDown, ArrowUp, Eye, Loader2, Plus, Save, Trash2, Upload } from 'lucide-react';

function genId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

const SECTION_TYPES = [
  { value: 'open', label: 'Pertanyaan terbuka' },
  { value: 'multiple_choice', label: 'Pilihan ganda' },
  { value: 'scale', label: 'Kuesioner skala' },
  { value: 'file_upload', label: 'Unggah lampiran' },
] as const;

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

function createEmptySection(type: 'open' | 'multiple_choice' | 'scale' | 'file_upload'): SatisfactionSection {
  const base = { id: genId('sec'), title: '', required: false, type };
  switch (type) {
    case 'open':
      return { ...base, type: 'open', placeholder: '' };
    case 'multiple_choice':
      return { ...base, type: 'multiple_choice', options: ['', ''], allowMultiple: false, allowOther: false };
    case 'scale':
      return {
        ...base,
        type: 'scale',
        scaleMin: 1,
        scaleMax: 5,
        questions: [{ id: genId('q'), title: '' }],
      };
    case 'file_upload':
      return { ...base, type: 'file_upload' };
    default:
      return { ...base, type: 'open', placeholder: '' };
  }
}

/** Untuk tipe skala: satu pertanyaan saja, judul = judul section. */
function normalizeScaleSections(sections: SatisfactionSection[]): SatisfactionSection[] {
  return sections.map((sec) => {
    if (sec.type !== 'scale') return sec;
    const scale = sec as SatisfactionSectionScale;
    const raw = scale as unknown as { question?: string; questions?: unknown };
    const existing = Array.isArray(scale.questions) ? scale.questions : [];
    const first = existing[0];
    const title =
      sec.title ||
      (typeof first === 'object' && first !== null && 'title' in first ? String(first.title) : null) ||
      (raw.question != null && typeof raw.question === 'string' ? raw.question : null) ||
      '';
    const questions: SatisfactionScaleQuestion[] = [
      { id: typeof first?.id === 'string' ? first.id : genId('q'), title },
    ];
    return { ...scale, title, questions };
  });
}

export default function AdminKustomFormBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = id !== undefined && id !== 'new';

  const [title, setTitle] = useState('');
  const [sections, setSections] = useState<SatisfactionSection[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [draggingUploadSectionId, setDraggingUploadSectionId] = useState<string | null>(null);
  const [uploadPreviewNames, setUploadPreviewNames] = useState<Record<string, string>>({});

  const loadTemplate = useCallback(async () => {
    if (!id || id === 'new') return;
    setLoading(true);
    try {
      const res = await getSatisfactionTemplate(id);
      if (res.success && res.data) {
        setTitle(res.data.title);
        const rawSections = res.data.definition?.sections ?? [];
        setSections(normalizeScaleSections(rawSections as SatisfactionSection[]));
        setIsDefault(res.data.is_default ?? false);
      } else {
        toast({ title: 'Gagal memuat template', description: res.error, variant: 'destructive' });
        navigate('/admin/kustom-form-kepuasan');
      }
    } catch (e) {
      toast({
        title: 'Gagal memuat template',
        description: e instanceof Error ? e.message : 'Kesalahan',
        variant: 'destructive',
      });
      navigate('/admin/kustom-form-kepuasan');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, toast]);

  useEffect(() => {
    void loadTemplate();
  }, [loadTemplate]);

  const addSection = (type: 'open' | 'multiple_choice' | 'scale' | 'file_upload') => {
    setSections((prev) => [...prev, createEmptySection(type)]);
  };

  const updateSection = (index: number, patch: Partial<SatisfactionSection>) => {
    setSections((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch } as SatisfactionSection;
      return next;
    });
  };

  const removeSection = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const moveSection = (index: number, dir: 'up' | 'down') => {
    setSections((prev) => {
      const next = [...prev];
      const j = dir === 'up' ? index - 1 : index + 1;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  };

  const setUploadPreviewFile = (sectionId: string, files: FileList | null) => {
    const file = files?.[0];
    setUploadPreviewNames((prev) => {
      if (!file) {
        if (!(sectionId in prev)) return prev;
        const next = { ...prev };
        delete next[sectionId];
        return next;
      }
      return { ...prev, [sectionId]: file.name };
    });
  };

  const handleSave = async () => {
    const t = title.trim();
    if (!t) {
      toast({ title: 'Judul formulir wajib diisi', variant: 'destructive' });
      return;
    }
    if (isEdit && isDefault) {
      toast({ title: 'Template utama tidak dapat diedit', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const definition: SatisfactionFormDefinition = { sections };
      if (isEdit) {
        const res = await updateSatisfactionTemplate({ id: id!, title: t, definition });
        if (res.success) {
          toast({ title: 'Formulir disimpan' });
          void loadTemplate();
        } else {
          toast({ title: 'Gagal menyimpan', description: res.error, variant: 'destructive' });
        }
      } else {
        const res = await createSatisfactionTemplate({ title: t, definition });
        if (res.success && res.data) {
          toast({ title: 'Formulir dibuat' });
          navigate(`/admin/kustom-form-kepuasan/edit/${res.data.id}`);
        } else {
          toast({ title: 'Gagal membuat formulir', description: res.error, variant: 'destructive' });
        }
      }
    } catch (e) {
      toast({
        title: 'Gagal menyimpan',
        description: e instanceof Error ? e.message : 'Kesalahan',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">
            {isEdit ? 'Edit Formulir Kepuasan' : 'Buat Formulir Kepuasan'}
          </h2>
          <Input
            placeholder="Judul formulir (wajib)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="max-w-xs"
          />
          {isDefault && (
            <p className="text-sm text-muted-foreground">Template utama — hanya dapat dilihat, tidak dapat disimpan.</p>
          )}
        </div>
        <div className="flex flex-shrink-0 flex-wrap items-center justify-end gap-2 sm:ml-auto">
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => {
              if (id && id !== 'new') {
                navigate(`/admin/kustom-form-kepuasan/preview/${id}`);
              } else {
                navigate('/admin/kustom-form-kepuasan/preview', {
                  state: { title, definition: { sections } },
                });
              }
            }}
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button onClick={handleSave} disabled={saving || isDefault} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Simpan Formulir
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/kustom-form-kepuasan')}>
            Batal
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {sections.length === 0 && (
          <Card
            className="border-2 border-dashed border-muted-foreground/30 bg-muted/20 cursor-pointer transition-colors hover:border-primary/40 hover:bg-muted/30"
            onClick={() => addSection('open')}
          >
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Plus className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Klik untuk menambah section pertanyaan</p>
            </CardContent>
          </Card>
        )}

        {sections.map((section, index) => {
          const openSection = section.type === 'open' ? (section as SatisfactionSectionOpen) : null;
          const multipleChoiceSection =
            section.type === 'multiple_choice' ? (section as SatisfactionSectionMultipleChoice) : null;
          const scaleSection = section.type === 'scale' ? (section as SatisfactionSectionScale) : null;
          const scaleColumns = scaleSection ? buildScaleColumns(scaleSection.scaleMin, scaleSection.scaleMax) : [];
          const previewScaleQuestions =
            scaleSection && scaleSection.questions.length > 0
              ? scaleSection.questions
              : [{ id: `${section.id}-preview`, title: section.title || 'Aspek Penilaian' }];
          const previewOptions = multipleChoiceSection
            ? multipleChoiceSection.options.map((opt) => opt.trim()).filter((opt) => opt.length > 0)
            : [];

          return (
          <Card key={section.id} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-start gap-2">
                <div className="flex flex-col gap-1 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => moveSection(index, 'up')}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => moveSection(index, 'down')}
                    disabled={index === sections.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Tipe</Label>
                    <Select
                      value={section.type}
                      onValueChange={(value) => {
                        const newSec = createEmptySection(value as SatisfactionSection['type']);
                        newSec.id = section.id;
                        newSec.title = section.title;
                        newSec.required = section.required;
                        if (newSec.type === 'scale') {
                          const scale = newSec as SatisfactionSectionScale;
                          scale.questions = [{ id: scale.questions[0].id, title: section.title || '' }];
                        }
                        setSections((prev) => {
                          const n = [...prev];
                          n[index] = newSec;
                          return n;
                        });
                      }}
                      disabled={isDefault}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SECTION_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`req-${section.id}`}
                        checked={section.required}
                        onCheckedChange={(c) => updateSection(index, { required: !!c })}
                        disabled={isDefault}
                      />
                      <Label htmlFor={`req-${section.id}`} className="text-xs">Wajib</Label>
                    </div>
                    {!isDefault && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeSection(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Input
                    placeholder="Contoh: Seberapa puas Anda dengan layanan?"
                    value={section.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      if (section.type === 'scale') {
                        const scale = section as SatisfactionSectionScale;
                        const q = scale.questions?.[0];
                        updateSection(index, {
                          title: newTitle,
                          questions: [{ id: q?.id ?? genId('q'), title: newTitle }],
                        } as Partial<SatisfactionSectionScale>);
                      } else {
                        updateSection(index, { title: newTitle });
                      }
                    }}
                    disabled={isDefault}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {openSection && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Contoh jawaban (placeholder untuk responden)</Label>
                    <Input
                      placeholder="Contoh jawaban..."
                      value={openSection.placeholder ?? ''}
                      onChange={(e) =>
                        updateSection(index, { placeholder: e.target.value } as Partial<SatisfactionSectionOpen>)
                      }
                      disabled={isDefault}
                    />
                  </div>
                  <div className="space-y-2 rounded-md border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Preview tampilan mahasiswa</p>
                    <Label className="text-sm">
                      {section.title || 'Judul pertanyaan terbuka'}
                      {section.required && <span className="ml-1 text-destructive">*</span>}
                    </Label>
                    <Input placeholder={openSection.placeholder || 'Tulis jawaban Anda'} disabled />
                  </div>
                </div>
              )}
              {multipleChoiceSection && (
                <div className="space-y-2">
                  <Label className="text-xs">Opsi jawaban</Label>
                  {multipleChoiceSection.options?.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        value={opt}
                        placeholder={`Opsi ${i + 1}`}
                        onChange={(e) => {
                          const opts = [...multipleChoiceSection.options];
                          opts[i] = e.target.value;
                          updateSection(index, { options: opts });
                        }}
                        disabled={isDefault}
                      />
                      {!isDefault && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const opts = multipleChoiceSection.options.filter(
                              (_, j) => j !== i
                            );
                            updateSection(index, { options: opts.length ? opts : [''] });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {!isDefault && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const opts = [...multipleChoiceSection.options, ''];
                        updateSection(index, { options: opts });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Tambah opsi
                    </Button>
                  )}
                  <div className="flex gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`multi-${section.id}`}
                        checked={multipleChoiceSection.allowMultiple ?? false}
                        onCheckedChange={(c) =>
                          updateSection(index, { allowMultiple: !!c } as Partial<SatisfactionSectionMultipleChoice>)
                        }
                        disabled={isDefault}
                      />
                      <Label htmlFor={`multi-${section.id}`} className="text-xs">Boleh pilih lebih dari satu</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`other-${section.id}`}
                        checked={multipleChoiceSection.allowOther ?? false}
                        onCheckedChange={(c) =>
                          updateSection(index, { allowOther: !!c } as Partial<SatisfactionSectionMultipleChoice>)
                        }
                        disabled={isDefault}
                      />
                      <Label htmlFor={`other-${section.id}`} className="text-xs">Tambah opsi &quot;Lainnya&quot;</Label>
                    </div>
                  </div>
                  <div className="space-y-2 rounded-md border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Preview tampilan mahasiswa</p>
                    <Label className="text-sm">
                      {section.title || 'Judul pertanyaan pilihan ganda'}
                      {section.required && <span className="ml-1 text-destructive">*</span>}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {multipleChoiceSection.allowMultiple
                        ? 'Responden dapat memilih lebih dari satu opsi.'
                        : 'Responden memilih satu opsi jawaban.'}
                    </p>
                    <div className="space-y-2">
                      {(previewOptions.length > 0 ? previewOptions : ['Opsi jawaban']).map((opt, i) => (
                        <label key={`${section.id}-preview-${i}`} className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
                          <input type={multipleChoiceSection.allowMultiple ? 'checkbox' : 'radio'} disabled />
                          <span className="text-sm">{opt}</span>
                        </label>
                      ))}
                      {multipleChoiceSection.allowOther && (
                        <label className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
                          <input type={multipleChoiceSection.allowMultiple ? 'checkbox' : 'radio'} disabled />
                          <span className="text-sm">Lainnya</span>
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {scaleSection && (
                <div className="space-y-3">
                  <div className="flex gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Skala min</Label>
                      <Input
                        type="number"
                        value={scaleSection.scaleMin ?? 1}
                        onChange={(e) =>
                          updateSection(index, {
                            scaleMin: parseInt(e.target.value, 10) || 1,
                          } as Partial<SatisfactionSectionScale>)
                        }
                        disabled={isDefault}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Skala max</Label>
                      <Input
                        type="number"
                        value={scaleSection.scaleMax ?? 5}
                        onChange={(e) =>
                          updateSection(index, {
                            scaleMax: parseInt(e.target.value, 10) || 5,
                          } as Partial<SatisfactionSectionScale>)
                        }
                        disabled={isDefault}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 rounded-md border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Preview tampilan mahasiswa</p>
                    <Label className="text-sm">
                      {section.title || 'Judul kuesioner skala'}
                      {section.required && <span className="ml-1 text-destructive">*</span>}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Setiap aspek wajib memilih satu nilai.
                    </p>
                    <div className="overflow-x-auto rounded-md border bg-background">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-14">No</TableHead>
                            <TableHead>Aspek Penilaian</TableHead>
                            {scaleColumns.map((column) => (
                              <TableHead key={`${section.id}-head-${column.value}`} className="min-w-[110px] text-center">
                                {column.label}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {previewScaleQuestions.map((q, qIndex) => (
                            <TableRow key={q.id}>
                              <TableCell>{qIndex + 1}</TableCell>
                              <TableCell>{q.title || section.title || 'Aspek Penilaian'}</TableCell>
                              {scaleColumns.map((column) => (
                                <TableCell key={`${q.id}-${column.value}`} className="text-center">
                                  <input type="radio" name={`${section.id}-${q.id}`} disabled />
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}
              {section.type === 'file_upload' && (
                <div className="space-y-2 rounded-md border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Preview tampilan mahasiswa</p>
                  <Label className="text-sm">
                    {section.title || 'Unggah lampiran'}
                    {section.required && <span className="ml-1 text-destructive">*</span>}
                  </Label>
                  <div
                    className={[
                      'relative rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200',
                      draggingUploadSectionId === section.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-background hover:border-primary/50 hover:bg-muted/40',
                    ].join(' ')}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDraggingUploadSectionId(section.id);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setDraggingUploadSectionId((prev) => (prev === section.id ? null : prev));
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDraggingUploadSectionId(null);
                      setUploadPreviewFile(section.id, e.dataTransfer.files);
                    }}
                  >
                    <input
                      id={`file-upload-preview-${section.id}`}
                      type="file"
                      className="hidden"
                      onChange={(e) => setUploadPreviewFile(section.id, e.target.files)}
                    />
                    <label
                      htmlFor={`file-upload-preview-${section.id}`}
                      className="flex cursor-pointer flex-col items-center gap-2"
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Upload className="h-5 w-5" />
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {draggingUploadSectionId === section.id
                          ? 'Lepas file di sini'
                          : 'Drag & drop file atau klik untuk memilih'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Format umum: PDF, DOC, DOCX, JPG, PNG
                      </span>
                      {uploadPreviewNames[section.id] && (
                        <span className="rounded-md border border-border bg-muted px-2 py-1 text-xs text-foreground">
                          {uploadPreviewNames[section.id]}
                        </span>
                      )}
                    </label>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          );
        })}

        {sections.length > 0 && !isDefault && (
          <Card
            className="border-2 border-dashed border-muted-foreground/30 bg-muted/20 cursor-pointer transition-colors hover:border-primary/40 hover:bg-muted/30"
            onClick={() => addSection('open')}
          >
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Plus className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Tambah section</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
