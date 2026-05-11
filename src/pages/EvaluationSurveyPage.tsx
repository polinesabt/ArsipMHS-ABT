import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Download, FileUp, Loader2, Send, ShieldCheck, Upload } from 'lucide-react';
import {
  getSurveyByToken,
  submitSurvey,
  submitCustomSurvey,
  uploadSurveyAttachment,
} from '@/repositories/evaluation.repository';
import { downloadLegacyFormPdf, downloadCustomFormPdf } from '@/lib/survey-form-pdf';
import type {
  EvaluationAspect,
  SurveyDataResponse,
  SurveyFormPayload,
  SurveyRatingScore,
} from '@/types/evaluation.types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

type FormState = {
  company_name: string;
  company_address: string;
  employee_name: string;
  graduation_year: string;
  study_program: string;
  current_work_division: string;
  major_job_match: 'ya' | 'tidak' | '';
  ratings: Record<string, string>;
};

type CustomAnswerValue = string | string[] | Record<string, string>;

type CustomSection = {
  id: string;
  title?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  options?: string[];
  allowMultiple?: boolean;
  scaleMin?: number;
  scaleMax?: number;
  questions?: Array<{ id: string; title?: string }>;
  questionSource?: 'template' | 'evaluation_aspects' | string;
  prefillFrom?: 'student.nama' | 'student.tahun_lulus' | 'student.prodi' | string;
  inputType?: 'text' | 'number' | string;
};

const ratingOptions: Array<{ value: SurveyRatingScore; label: string }> = [
  { value: 5, label: 'Sangat Baik' },
  { value: 4, label: 'Baik' },
  { value: 3, label: 'Cukup Baik' },
  { value: 2, label: 'Kurang Baik' },
  { value: 1, label: 'Tidak Baik' },
];

const scoreToLabel: Record<number, string> = {
  5: 'Sangat Baik',
  4: 'Baik',
  3: 'Cukup Baik',
  2: 'Kurang Baik',
  1: 'Tidak Baik',
};

function buildInitialForm(data: SurveyDataResponse): FormState {
  return {
    company_name: String(data.response?.company_name || ''),
    company_address: String(data.response?.company_address || ''),
    employee_name: String(data.response?.employee_name || data.student.nama || ''),
    graduation_year: String(data.response?.graduation_year || data.student.tahun_lulus || ''),
    study_program: String(data.response?.study_program || data.student.prodi || ''),
    current_work_division: String(data.response?.current_work_division || ''),
    major_job_match:
      data.response?.major_job_match === 'ya' || data.response?.major_job_match === 'tidak'
        ? (data.response.major_job_match as 'ya' | 'tidak')
        : '',
    ratings: Object.entries(data.ratings || {}).reduce<Record<string, string>>((acc, [key, value]) => {
      acc[key] = String(value);
      return acc;
    }, {}),
  };
}

function getScaleBounds(section: CustomSection): { min: number; max: number } {
  const rawMin = Number(section.scaleMin ?? 1);
  const rawMax = Number(section.scaleMax ?? 5);
  return {
    min: Math.min(rawMin, rawMax),
    max: Math.max(rawMin, rawMax),
  };
}

function buildScaleColumns(min: number, max: number): Array<{ value: number; label: string }> {
  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const orderedValues = min === 1 && max === 5 ? [...values].reverse() : values;
  return orderedValues.map((value) => ({
    value,
    label: scoreToLabel[value] ?? `Skor ${value}`,
  }));
}

function resolveScaleQuestions(
  section: CustomSection,
  activeAspects: EvaluationAspect[]
): Array<{ id: string; title: string }> {
  if (section.questionSource === 'evaluation_aspects') {
    return activeAspects.map((aspect) => ({ id: aspect.id, title: aspect.name }));
  }

  return (section.questions ?? [])
    .map((question) => ({
      id: String(question.id ?? '').trim(),
      title: String(question.title ?? '').trim(),
    }))
    .filter((question) => question.id !== '');
}

function isEmptyCustomAnswer(value: CustomAnswerValue | undefined): boolean {
  if (value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return Object.keys(value).length === 0;
}

function normalizeScaleAnswerValue(
  value: unknown,
  min: number,
  max: number
): string | null {
  const text = String(value ?? '').trim();
  if (text === '') return null;
  const score = Number(text);
  if (!Number.isFinite(score) || score < min || score > max) return null;
  return String(score);
}

function sanitizeCustomAnswers(
  answers: Record<string, CustomAnswerValue>,
  sections: CustomSection[],
  activeAspects: EvaluationAspect[]
): Record<string, CustomAnswerValue> {
  const next: Record<string, CustomAnswerValue> = {};

  for (const section of sections) {
    const sectionId = String(section.id ?? '').trim();
    if (!sectionId) continue;

    const value = answers[sectionId];
    if (value === undefined) continue;

    const sectionType = String(section.type ?? 'open');

    if (sectionType === 'open') {
      if (typeof value === 'string') next[sectionId] = value;
      continue;
    }

    if (sectionType === 'multiple_choice') {
      const options = section.options ?? [];
      const allowOther = Boolean(section.allowOther);
      const allowMultiple = Boolean(section.allowMultiple);

      if (allowMultiple) {
        if (!Array.isArray(value)) continue;
        const filtered = value.filter(
          (item): item is string =>
            typeof item === 'string' && (allowOther || options.includes(item))
        );
        if (filtered.length > 0) next[sectionId] = filtered;
        continue;
      }

      if (
        typeof value === 'string' &&
        (allowOther || options.includes(value))
      ) {
        next[sectionId] = value;
      }
      continue;
    }

    if (sectionType === 'scale') {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) continue;
      const source = value as Record<string, unknown>;
      const questions = resolveScaleQuestions(section, activeAspects);
      const { min, max } = getScaleBounds(section);
      const normalized: Record<string, string> = {};
      for (const question of questions) {
        const n = normalizeScaleAnswerValue(source[question.id], min, max);
        if (n !== null) normalized[question.id] = n;
      }
      if (Object.keys(normalized).length > 0) next[sectionId] = normalized;
      continue;
    }

    if (sectionType === 'file_upload') {
      if (typeof value === 'string') next[sectionId] = value;
    }
  }

  return next;
}

function areCustomAnswersEqual(
  left: Record<string, CustomAnswerValue>,
  right: Record<string, CustomAnswerValue>
): boolean {
  const leftKeys = Object.keys(left).sort();
  const rightKeys = Object.keys(right).sort();
  if (leftKeys.length !== rightKeys.length) return false;
  for (let i = 0; i < leftKeys.length; i++) {
    if (leftKeys[i] !== rightKeys[i]) return false;
    if (JSON.stringify(left[leftKeys[i]]) !== JSON.stringify(right[rightKeys[i]])) return false;
  }
  return true;
}

export default function EvaluationSurveyPage() {
  const [searchParams] = useSearchParams();
  const tokenFromQuery = searchParams.get('token') ?? '';
  const tokenFromParams = useParams().token ?? '';
  const token = tokenFromQuery || tokenFromParams || '';
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [surveyData, setSurveyData] = useState<SurveyDataResponse | null>(null);
  const [form, setForm] = useState<FormState>({
    company_name: '',
    company_address: '',
    employee_name: '',
    graduation_year: '',
    study_program: '',
    current_work_division: '',
    major_job_match: '',
    ratings: {},
  });
  const [customAnswers, setCustomAnswers] = useState<Record<string, CustomAnswerValue>>({});
  const [legacyAttachmentPath, setLegacyAttachmentPath] = useState<string | null>(null);
  const [customFormAttachmentPath, setCustomFormAttachmentPath] = useState<string | null>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [isDraggingAttachment, setIsDraggingAttachment] = useState(false);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const isSubmitted = surveyData?.status === 'submitted';
  const activeAspects = useMemo(() => surveyData?.aspects ?? [], [surveyData?.aspects]);
  const activeTemplate = surveyData?.active_template ?? null;
  const customSections = useMemo(
    () => ((activeTemplate?.definition?.sections ?? []) as CustomSection[]),
    [activeTemplate?.definition?.sections]
  );
  const useCustomForm = customSections.length > 0;
  const activeTemplateVersion = useMemo(() => {
    const idPart = surveyData?.active_template_id ?? activeTemplate?.id ?? '';
    const updatedPart = surveyData?.active_template_updated_at ?? '';
    return `${idPart}|${updatedPart}`;
  }, [activeTemplate?.id, surveyData?.active_template_id, surveyData?.active_template_updated_at]);

  const totalRated = useMemo(() => {
    return activeAspects.filter((aspect) => form.ratings[aspect.id]).length;
  }, [activeAspects, form.ratings]);

  const loadSurvey = useCallback(async () => {
    if (!token) {
      setError('Token survey tidak ditemukan');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getSurveyByToken(token);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Gagal memuat data survey');
      }

      setSurveyData(response.data);
      setForm(buildInitialForm(response.data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadSurvey();
  }, [loadSurvey]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      if (surveyData?.status === 'submitted') return;
      void loadSurvey();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [loadSurvey, surveyData?.status]);

  useEffect(() => {
    if (!surveyData?.student?.nama) return;
    const previousTitle = document.title;
    const name = surveyData.student.nama.trim() || 'Anda';
    document.title = `Survey Kepuasan Pengguna — ${name}`;
    return () => {
      document.title = previousTitle;
    };
  }, [surveyData?.student?.nama]);

  useEffect(() => {
    if (!useCustomForm || !surveyData?.student) return;

    setCustomAnswers((prev) => {
      let changed = false;
      const next: Record<string, CustomAnswerValue> = { ...prev };

      for (const section of customSections) {
        if (section.type !== 'open') continue;
        const sectionId = String(section.id ?? '').trim();
        if (!sectionId) continue;

        const current = next[sectionId];
        if (typeof current === 'string' && current.trim() !== '') continue;
        if (current !== undefined && typeof current !== 'string') continue;

        let prefillValue = '';
        if (section.prefillFrom === 'student.nama') {
          prefillValue = String(surveyData.student.nama ?? '').trim();
        } else if (section.prefillFrom === 'student.tahun_lulus') {
          prefillValue =
            surveyData.student.tahun_lulus != null ? String(surveyData.student.tahun_lulus) : '';
        } else if (section.prefillFrom === 'student.prodi') {
          prefillValue = String(surveyData.student.prodi ?? '').trim();
        }

        if (prefillValue !== '') {
          next[sectionId] = prefillValue;
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [customSections, surveyData?.student, useCustomForm]);

  useEffect(() => {
    if (!useCustomForm) return;
    setCustomAnswers((prev) => {
      const sanitized = sanitizeCustomAnswers(prev, customSections, activeAspects);
      return areCustomAnswersEqual(prev, sanitized) ? prev : sanitized;
    });
  }, [activeAspects, activeTemplateVersion, customSections, useCustomForm]);

  const handleSubmit = async () => {
    if (!surveyData) return;

    if (
      !form.company_name.trim() ||
      !form.company_address.trim() ||
      !form.employee_name.trim() ||
      !form.graduation_year.trim() ||
      !form.study_program.trim() ||
      !form.current_work_division.trim() ||
      !form.major_job_match
    ) {
      toast({
        title: 'Form belum lengkap',
        description: 'Lengkapi semua field identitas dan kesesuaian jurusan.',
        variant: 'destructive',
      });
      return;
    }

    if (totalRated !== activeAspects.length) {
      toast({
        title: 'Penilaian belum lengkap',
        description: 'Setiap aspek penilaian wajib dipilih satu nilai.',
        variant: 'destructive',
      });
      return;
    }

    const ratingsPayload = activeAspects.reduce<Record<string, SurveyRatingScore>>((acc, aspect) => {
      acc[aspect.id] = Number(form.ratings[aspect.id]) as SurveyRatingScore;
      return acc;
    }, {});

    const payload: SurveyFormPayload = {
      token,
      company_name: form.company_name.trim(),
      company_address: form.company_address.trim(),
      employee_name: form.employee_name.trim(),
      graduation_year: Number(form.graduation_year),
      study_program: form.study_program.trim(),
      current_work_division: form.current_work_division.trim(),
      major_job_match: form.major_job_match,
      ratings: ratingsPayload,
      ...(legacyAttachmentPath ? { attachment_path: legacyAttachmentPath } : {}),
    };

    setIsSubmitting(true);
    try {
      const response = await submitSurvey(payload);
      if (!response.success) {
        throw new Error(response.error || 'Gagal mengirim survey');
      }

      toast({
        title: 'Survey berhasil dikirim',
        description: 'Data tersimpan dan tidak dapat diubah lagi.',
      });

      await loadSurvey();
    } catch (err) {
      toast({
        title: 'Gagal mengirim survey',
        description: err instanceof Error ? err.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAttachmentFile = useCallback(
    async (file: File) => {
      if (!token) return;
      if (!['application/pdf', 'image/png'].includes(file.type)) {
        toast({
          title: 'Tipe file tidak diizinkan',
          description: 'Gunakan PDF atau PNG.',
          variant: 'destructive',
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File terlalu besar',
          description: 'Maksimal 5MB.',
          variant: 'destructive',
        });
        return;
      }
      setUploadingAttachment(true);
      try {
        const res = await uploadSurveyAttachment(token, file);
        if (res.success && res.data?.path) {
          if (useCustomForm) {
            setCustomFormAttachmentPath(res.data.path);
          } else {
            setLegacyAttachmentPath(res.data.path);
          }
          toast({ title: 'Lampiran berhasil diunggah' });
        } else {
          toast({
            title: 'Gagal mengunggah lampiran',
            description: res.error,
            variant: 'destructive',
          });
        }
      } finally {
        setUploadingAttachment(false);
      }
    },
    [token, useCustomForm, toast]
  );

  const handleSubmitCustom = async () => {
    if (!surveyData || customSections.length === 0) return;

    for (const section of customSections) {
      const sectionId = String(section.id ?? '').trim();
      if (!sectionId) continue;

      const sectionTitle = section.title || sectionId;
      const isRequired = Boolean(section.required);
      const sectionType = String(section.type ?? 'open');
      const value = customAnswers[sectionId];

      if (sectionType !== 'scale') {
        if (isRequired && isEmptyCustomAnswer(value)) {
          toast({
            title: 'Form belum lengkap',
            description: `Pertanyaan wajib: ${sectionTitle}`,
            variant: 'destructive',
          });
          return;
        }
        continue;
      }

      const questions = resolveScaleQuestions(section, activeAspects);
      const scaleValue =
        typeof value === 'object' && value !== null && !Array.isArray(value)
          ? (value as Record<string, string>)
          : {};
      const { min, max } = getScaleBounds(section);

      if (isRequired && questions.length === 0) {
        toast({
          title: 'Konfigurasi pertanyaan tidak valid',
          description: `Bagian skala "${sectionTitle}" belum memiliki aspek penilaian.`,
          variant: 'destructive',
        });
        return;
      }

      for (const question of questions) {
        const answerRaw = scaleValue[question.id];
        if (answerRaw === undefined || answerRaw === '') {
          if (isRequired) {
            toast({
              title: 'Form belum lengkap',
              description: `Pertanyaan wajib: ${sectionTitle} - ${question.title}`,
              variant: 'destructive',
            });
            return;
          }
          continue;
        }

        const score = Number(answerRaw);
        if (!Number.isFinite(score) || score < min || score > max) {
          toast({
            title: 'Nilai skala tidak valid',
            description: `Rentang nilai ${sectionTitle} harus antara ${min} sampai ${max}.`,
            variant: 'destructive',
          });
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      const response = await submitCustomSurvey({
        token,
        answers: customAnswers,
        attachment_path: customFormAttachmentPath ?? undefined,
      });
      if (!response.success) throw new Error(response.error || 'Gagal mengirim survey');
      toast({ title: 'Survey berhasil dikirim', description: 'Data tersimpan dan tidak dapat diubah lagi.' });
      await loadSurvey();
    } catch (err) {
      toast({
        title: 'Gagal mengirim survey',
        description: err instanceof Error ? err.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          Memuat survey evaluasi...
        </div>
      </div>
    );
  }

  if (error || !surveyData) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Akses Survey Gagal</CardTitle>
              <CardDescription>{error || 'Data survey tidak ditemukan.'}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/dashboard')}>Kembali ke Dashboard</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {isSubmitted && (
          <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-8 w-8 shrink-0 text-green-600 dark:text-green-500" />
                <div>
                  <CardTitle className="text-lg">Evaluasi telah diselesaikan sebelumnya</CardTitle>
                  <CardDescription>
                    Survey untuk periode ini sudah pernah Anda kirim. Data di bawah hanya untuk referensi dan tidak dapat diubah.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-2xl font-semibold uppercase tracking-wide text-foreground">
                  {surveyData.student?.nama?.trim() || 'Anda'}
                </p>
                <CardTitle className="text-lg font-normal text-muted-foreground">
                  {surveyData.evaluation.title}
                </CardTitle>
              </div>
              {!isSubmitted && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={downloadingPdf}
                  onClick={async () => {
                    setDownloadingPdf(true);
                    try {
                      if (useCustomForm) {
                        downloadCustomFormPdf(
                          surveyData,
                          customSections,
                          customAnswers,
                          activeAspects
                        );
                      } else {
                        downloadLegacyFormPdf(surveyData, form);
                      }
                    } finally {
                      setDownloadingPdf(false);
                    }
                  }}
                >
                  {downloadingPdf ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Download Form (PDF)
                </Button>
              )}
              {isSubmitted && (
                <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <ShieldCheck className="w-4 h-4" />
                  Sudah terkirim (read-only)
                </span>
              )}
            </div>
          </CardHeader>
        </Card>

        {useCustomForm ? (
          <>
            {customSections.map((section) => {
              const secId = String(section.id ?? '');
              const title = String(section.title ?? '');
              const required = Boolean(section.required);
              const type = String(section.type ?? 'open');
              const value = customAnswers[secId];
              return (
                <Card key={secId}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {title}
                      {required && <span className="text-destructive ml-1">*</span>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {type === 'open' && (
                      <Input
                        type={section.inputType === 'number' ? 'number' : 'text'}
                        placeholder={String(section.placeholder ?? '')}
                        value={typeof value === 'string' ? value : ''}
                        disabled={isSubmitted}
                        onChange={(e) =>
                          setCustomAnswers((prev) => ({ ...prev, [secId]: e.target.value }))
                        }
                      />
                    )}
                    {type === 'multiple_choice' && (
                      <div className="space-y-2">
                        {(section.options ?? []).map((opt, i) => {
                          const isMulti = Boolean(section.allowMultiple);
                          const selected = isMulti
                            ? (Array.isArray(value) ? value : [])
                            : (typeof value === 'string' ? value : '');
                          const checked = isMulti
                            ? (selected as string[]).includes(opt)
                            : selected === opt;
                          return (
                            <label key={i} className="flex items-center gap-2">
                              <input
                                type={isMulti ? 'checkbox' : 'radio'}
                                name={secId}
                                checked={checked}
                                disabled={isSubmitted}
                                onChange={() => {
                                  if (isMulti) {
                                    const arr = Array.isArray(value) ? value : [];
                                    const next = arr.includes(opt)
                                      ? arr.filter((x) => x !== opt)
                                      : [...arr, opt];
                                    setCustomAnswers((prev) => ({ ...prev, [secId]: next }));
                                  } else {
                                    setCustomAnswers((prev) => ({ ...prev, [secId]: opt }));
                                  }
                                }}
                              />
                              {opt}
                            </label>
                          );
                        })}
                      </div>
                    )}
                    {type === 'scale' && (
                      <div className="space-y-3">
                        <p className="text-xs text-muted-foreground">
                          Setiap aspek wajib memilih satu nilai.
                        </p>
                        {(() => {
                          const questions = resolveScaleQuestions(section, activeAspects);
                          const { min, max } = getScaleBounds(section);
                          const columns = buildScaleColumns(min, max);
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
                                            disabled={isSubmitted}
                                            onChange={() =>
                                              setCustomAnswers((prev) => {
                                                const prevObj =
                                                  typeof prev[secId] === 'object' &&
                                                  prev[secId] &&
                                                  !Array.isArray(prev[secId])
                                                    ? (prev[secId] as Record<string, string>)
                                                    : {};
                                                return {
                                                  ...prev,
                                                  [secId]: {
                                                    ...prevObj,
                                                    [q.id]: String(column.value),
                                                  },
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
                    {type === 'file_upload' && (
                      <div className="space-y-2">
                        <Input
                          type="file"
                          accept=".pdf,.png,application/pdf,image/png"
                          disabled={isSubmitted || uploadingAttachment}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file || !token) return;
                            const allowed = ['application/pdf', 'image/png'];
                            if (!allowed.includes(file.type)) {
                              toast({
                                title: 'Tipe file tidak diizinkan',
                                description: 'Gunakan PDF atau PNG.',
                                variant: 'destructive',
                              });
                              return;
                            }
                            if (file.size > 5 * 1024 * 1024) {
                              toast({
                                title: 'File terlalu besar',
                                description: 'Maksimal 5MB.',
                                variant: 'destructive',
                              });
                              return;
                            }
                            setUploadingAttachment(true);
                            try {
                              const res = await uploadSurveyAttachment(token, file);
                              if (res.success && res.data?.path) {
                                setCustomAnswers((prev) => ({ ...prev, [secId]: res.data!.path }));
                                toast({ title: 'Lampiran berhasil diunggah' });
                              } else {
                                toast({
                                  title: 'Gagal mengunggah lampiran',
                                  description: res.error,
                                  variant: 'destructive',
                                });
                              }
                            } finally {
                              setUploadingAttachment(false);
                              e.target.value = '';
                            }
                          }}
                        />
                        {typeof value === 'string' && value.trim() !== '' && (
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <FileUp className="h-4 w-4" />
                            Lampiran: {value.split('/').pop()}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            <Card id="unggah-lampiran-custom" className="mt-4 border-2 border-dashed border-muted-foreground/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Unggah Lampiran Form Bertanda Tangan
                </CardTitle>
                <CardDescription>
                  {isSubmitted
                    ? 'Survey sudah dikirim. Lampiran tidak dapat diubah.'
                    : 'Seret file PDF/PNG ke kotak di bawah atau klik untuk memilih. Maks. 5MB.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  ref={attachmentInputRef}
                  type="file"
                  accept=".pdf,.png,application/pdf,image/png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleAttachmentFile(file);
                    e.target.value = '';
                  }}
                />
                <div
                  role="button"
                  tabIndex={0}
                  onDragOver={(e) => {
                    if (isSubmitted) return;
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDraggingAttachment(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDraggingAttachment(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDraggingAttachment(false);
                    if (isSubmitted) return;
                    const file = e.dataTransfer.files?.[0];
                    if (file) void handleAttachmentFile(file);
                  }}
                  onClick={() => !isSubmitted && attachmentInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (!isSubmitted) attachmentInputRef.current?.click();
                    }
                  }}
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 transition-colors min-h-[160px]',
                    isSubmitted
                      ? 'cursor-not-allowed opacity-60 bg-muted/30'
                      : 'cursor-pointer hover:border-primary/50 hover:bg-muted/50',
                    isDraggingAttachment && !isSubmitted && 'border-primary bg-primary/10',
                    !isDraggingAttachment && !isSubmitted && 'border-muted-foreground/25',
                    customFormAttachmentPath && 'border-green-500/50 bg-green-500/5'
                  )}
                  aria-label="Unggah lampiran PDF atau PNG"
                >
                  {uploadingAttachment ? (
                    <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                  ) : (
                    <Upload className="h-10 w-10 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium text-center text-muted-foreground">
                    {customFormAttachmentPath
                      ? 'Lampiran terunggah: ' + customFormAttachmentPath.split('/').pop()
                      : isSubmitted
                        ? 'Lampiran terkunci setelah survey dikirim'
                        : isDraggingAttachment
                          ? 'Lepaskan file di sini'
                          : 'Seret file ke sini atau klik untuk memilih'}
                  </span>
                </div>
              </CardContent>
            </Card>
            {!isSubmitted && (
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <Button onClick={handleSubmitCustom} disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Kirim Survey Evaluasi
                </Button>
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                  Kembali ke Dashboard
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bagian 1 - Identitas Karyawan yang Dinilai</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama Perusahaan</Label>
              <Input
                value={form.company_name}
                disabled={isSubmitted}
                onChange={(event) => setForm((prev) => ({ ...prev, company_name: event.target.value }))}
              />
            </div>
            <div className="space-y-2 md:row-span-2">
              <Label>Alamat Perusahaan</Label>
              <Textarea
                value={form.company_address}
                disabled={isSubmitted}
                onChange={(event) => setForm((prev) => ({ ...prev, company_address: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Nama Karyawan yang Dinilai</Label>
              <Input
                value={form.employee_name}
                disabled={isSubmitted}
                onChange={(event) => setForm((prev) => ({ ...prev, employee_name: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Tahun Lulus</Label>
              <Input
                type="number"
                value={form.graduation_year}
                disabled={isSubmitted}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, graduation_year: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Program Studi</Label>
              <Input
                value={form.study_program}
                disabled={isSubmitted}
                onChange={(event) => setForm((prev) => ({ ...prev, study_program: event.target.value }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Bagian / Bidang Kerja Saat Ini</Label>
              <Input
                value={form.current_work_division}
                disabled={isSubmitted}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, current_work_division: event.target.value }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bagian 2 - Kesesuaian Jurusan dengan Pekerjaan</CardTitle>
            <CardDescription>
              Apakah jurusan/program studi yang ditempuh sesuai dengan pekerjaan karyawan saat ini?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={form.major_job_match}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, major_job_match: value as 'ya' | 'tidak' }))
              }
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              <label className="flex items-center gap-3 rounded-md border p-3">
                <RadioGroupItem value="ya" disabled={isSubmitted} />
                Ya
              </label>
              <label className="flex items-center gap-3 rounded-md border p-3">
                <RadioGroupItem value="tidak" disabled={isSubmitted} />
                Tidak
              </label>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bagian 3 - Tabel Penilaian Kompetensi</CardTitle>
            <CardDescription>
              Setiap aspek wajib memilih satu nilai. Progress: {totalRated}/{activeAspects.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-14">No</TableHead>
                    <TableHead>Aspek Penilaian</TableHead>
                    {ratingOptions.map((opt) => (
                      <TableHead key={opt.value} className="text-center min-w-[110px]">
                        {opt.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeAspects.map((aspect, index) => (
                    <TableRow key={aspect.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{aspect.name}</TableCell>
                      {ratingOptions.map((opt) => {
                        const checked = form.ratings[aspect.id] === String(opt.value);
                        return (
                          <TableCell key={`${aspect.id}-${opt.value}`} className="text-center">
                            <input
                              type="radio"
                              name={`aspect-${aspect.id}`}
                              checked={checked}
                              disabled={isSubmitted}
                              onChange={() =>
                                setForm((prev) => ({
                                  ...prev,
                                  ratings: {
                                    ...prev.ratings,
                                    [aspect.id]: String(opt.value),
                                  },
                                }))
                              }
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {isSubmitted ? (
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Jawaban Tersimpan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {activeAspects.map((aspect, index) => (
                <div key={aspect.id} className="grid grid-cols-[40px_1fr_180px] gap-3 rounded-md border p-2">
                  <span>{index + 1}</span>
                  <span>{aspect.name}</span>
                  <span className="font-medium">
                    {scoreToLabel[Number(form.ratings[aspect.id])] || '-'}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}

        <Card id="unggah-lampiran-legacy" className="mt-4 border-2 border-dashed border-muted-foreground/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Unggah Lampiran Form Bertanda Tangan
            </CardTitle>
            <CardDescription>
              {isSubmitted
                ? 'Survey sudah dikirim. Lampiran tidak dapat diubah.'
                : 'Seret file PDF/PNG ke kotak di bawah atau klik untuk memilih. Maks. 5MB.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              ref={attachmentInputRef}
              type="file"
              accept=".pdf,.png,application/pdf,image/png"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleAttachmentFile(file);
                e.target.value = '';
              }}
            />
            <div
              role="button"
              tabIndex={0}
              onDragOver={(e) => {
                if (isSubmitted) return;
                e.preventDefault();
                e.stopPropagation();
                setIsDraggingAttachment(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDraggingAttachment(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDraggingAttachment(false);
                if (isSubmitted) return;
                const file = e.dataTransfer.files?.[0];
                if (file) void handleAttachmentFile(file);
              }}
              onClick={() => !isSubmitted && attachmentInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (!isSubmitted) attachmentInputRef.current?.click();
                }
              }}
              className={cn(
                'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 transition-colors min-h-[160px]',
                isSubmitted
                  ? 'cursor-not-allowed opacity-60 bg-muted/30'
                  : 'cursor-pointer hover:border-primary/50 hover:bg-muted/50',
                isDraggingAttachment && !isSubmitted && 'border-primary bg-primary/10',
                !isDraggingAttachment && !isSubmitted && 'border-muted-foreground/25',
                legacyAttachmentPath && 'border-green-500/50 bg-green-500/5'
              )}
              aria-label="Unggah lampiran PDF atau PNG"
            >
              {uploadingAttachment ? (
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
              ) : (
                <Upload className="h-10 w-10 text-muted-foreground" />
              )}
              <span className="text-sm font-medium text-center text-muted-foreground">
                {legacyAttachmentPath
                  ? 'Lampiran terunggah: ' + legacyAttachmentPath.split('/').pop()
                  : isSubmitted
                    ? 'Lampiran terkunci setelah survey dikirim'
                    : isDraggingAttachment
                      ? 'Lepaskan file di sini'
                      : 'Seret file ke sini atau klik untuk memilih'}
              </span>
            </div>
          </CardContent>
        </Card>

        {!isSubmitted && (
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Kirim Survey Evaluasi
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Kembali ke Dashboard
            </Button>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}
