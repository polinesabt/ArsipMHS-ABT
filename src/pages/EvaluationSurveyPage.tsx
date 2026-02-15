import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Send, ShieldCheck } from 'lucide-react';
import { getSurveyByToken, submitSurvey } from '@/repositories/evaluation.repository';
import type {
  SurveyDataResponse,
  SurveyFormPayload,
  SurveyRatingScore,
} from '@/types/evaluation.types';
import { useToast } from '@/hooks/use-toast';
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

export default function EvaluationSurveyPage() {
  const { token = '' } = useParams();
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

  const isSubmitted = surveyData?.status === 'submitted';
  const activeAspects = surveyData?.aspects || [];

  const totalRated = useMemo(() => {
    return activeAspects.filter((aspect) => form.ratings[aspect.id]).length;
  }, [activeAspects, form.ratings]);

  const loadSurvey = async () => {
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
  };

  useEffect(() => {
    void loadSurvey();
  }, [token]);

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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-2xl">{surveyData.evaluation.title}</CardTitle>
                <CardDescription>
                  Survey Kepuasan Pengguna Lulusan - hanya bisa diisi satu kali.
                </CardDescription>
              </div>
              {isSubmitted && (
                <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                  <ShieldCheck className="w-4 h-4" />
                  Sudah terkirim (read-only)
                </span>
              )}
            </div>
          </CardHeader>
        </Card>

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
        ) : (
          <div className="flex flex-wrap items-center gap-3">
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
      </div>
    </div>
  );
}
