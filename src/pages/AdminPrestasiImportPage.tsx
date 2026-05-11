import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  AchievementImportCategory,
  AchievementImportLog,
  AchievementImportSummary,
  downloadAchievementImportTemplateViaAPI,
  importAchievementsFromExcelViaAPI,
  listAchievementImportLogsViaAPI,
} from '@/repositories/api-student.repository';

interface CategoryMeta {
  label: string;
  group: 'academic' | 'non_academic';
}

const CATEGORY_META: Record<AchievementImportCategory, CategoryMeta> = {
  publikasi: { label: 'Karya Ilmiah & Publikasi', group: 'academic' },
  jurnal: { label: 'Jurnal', group: 'academic' },
  portofolio: { label: 'Portofolio Praktikum Kelas', group: 'academic' },
  lomba: { label: 'Lomba', group: 'non_academic' },
  kekayaan_intelektual: { label: 'Kekayaan Intelektual', group: 'non_academic' },
  magang: { label: 'Pengalaman Magang', group: 'non_academic' },
  produk_mahasiswa: { label: 'Produk Mahasiswa', group: 'non_academic' },
  wirausaha: { label: 'Pengalaman Wirausaha', group: 'non_academic' },
  pengembangan_diri: { label: 'Program Pengembangan Diri', group: 'non_academic' },
  organisasi: { label: 'Organisasi & Kepemimpinan', group: 'non_academic' },
  seminar: { label: 'Publikasi di Seminar', group: 'non_academic' },
  pagelaran: { label: 'Pagelaran / Presentasi', group: 'non_academic' },
};

const ACADEMIC_CATEGORIES: AchievementImportCategory[] = ['publikasi', 'portofolio'];
const NON_ACADEMIC_CATEGORIES: AchievementImportCategory[] = [
  'lomba',
  'kekayaan_intelektual',
  'magang',
  'produk_mahasiswa',
  'wirausaha',
  'pengembangan_diri',
  'organisasi',
  'seminar',
];

export default function AdminPrestasiImportPage() {
  const { toast } = useToast();
  const [activeGroup, setActiveGroup] = useState<'academic' | 'non_academic'>('academic');
  const [activeCategory, setActiveCategory] = useState<AchievementImportCategory>('publikasi');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [summary, setSummary] = useState<AchievementImportSummary | null>(null);
  const [logs, setLogs] = useState<AchievementImportLog[]>([]);

  const categories = useMemo(
    () => (activeGroup === 'academic' ? ACADEMIC_CATEGORIES : NON_ACADEMIC_CATEGORIES),
    [activeGroup]
  );

  useEffect(() => {
    if (!categories.includes(activeCategory)) {
      setActiveCategory(categories[0]);
    }
  }, [activeCategory, categories]);

  const loadLogs = useCallback(async () => {
    setIsLoadingLogs(true);
    try {
      const res = await listAchievementImportLogsViaAPI({ limit: 10, offset: 0 });
      if (!res.success || !res.data) {
        toast({
          title: 'Gagal memuat riwayat import',
          description: res.error ?? 'Unknown error',
          variant: 'destructive',
        });
        return;
      }
      setLogs(res.data.logs ?? []);
    } finally {
      setIsLoadingLogs(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    try {
      const res = await downloadAchievementImportTemplateViaAPI(activeCategory);
      if (!res.success) {
        toast({
          title: 'Gagal download template',
          description: res.error ?? 'Unknown error',
          variant: 'destructive',
        });
        return;
      }
      toast({ title: 'Template berhasil diunduh' });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: 'File belum dipilih',
        description: 'Silakan pilih file .xlsx untuk import.',
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true);
    try {
      const res = await importAchievementsFromExcelViaAPI(activeCategory, selectedFile);
      if (!res.success || !res.data) {
        toast({
          title: 'Import gagal',
          description: res.error ?? 'Unknown error',
          variant: 'destructive',
        });
        return;
      }

      setSummary(res.data);
      setSelectedFile(null);
      toast({
        title: 'Import selesai',
        description: `Berhasil insert ${res.data.success_rows} baris. Duplikat ${res.data.duplicate_rows}.`,
      });
      await loadLogs();
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <main className="pb-10">
      <div className="container mx-auto px-4 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">Import Excel Prestasi</h1>
          <p className="text-sm text-muted-foreground">
            Upload data prestasi berdasarkan kategori dengan validasi server-side dan integritas SSOT mahasiswa.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pilih Kategori Import</CardTitle>
            <CardDescription>
              Akademik memakai aksen biru formal, Non-Akademik memakai aksen hijau-teal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={activeGroup} onValueChange={(value) => setActiveGroup(value as 'academic' | 'non_academic')}>
              <TabsList className="grid grid-cols-2 w-full max-w-lg">
                <TabsTrigger
                  value="academic"
                  className="data-[state=active]:bg-[hsl(var(--chart-academic)/0.18)] data-[state=active]:text-[hsl(var(--chart-academic-dark))]"
                >
                  Akademik
                </TabsTrigger>
                <TabsTrigger
                  value="non_academic"
                  className="data-[state=active]:bg-[hsl(var(--success)/0.2)] data-[state=active]:text-[hsl(var(--success))]"
                >
                  Non-Akademik
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-wrap gap-2">
              {categories.map((key) => {
                const isActive = key === activeCategory;
                const isAcademic = CATEGORY_META[key].group === 'academic';
                return (
                  <Button
                    key={key}
                    type="button"
                    variant={isActive ? 'default' : 'outline'}
                    className={isActive
                      ? isAcademic
                        ? 'bg-[hsl(var(--chart-academic))] hover:bg-[hsl(var(--chart-academic-dark))]'
                        : 'bg-[hsl(var(--success))] hover:bg-[hsl(var(--success)/0.85)]'
                      : ''}
                    onClick={() => setActiveCategory(key)}
                  >
                    {CATEGORY_META[key].label}
                  </Button>
                );
              })}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>File Excel (.xlsx)</Label>
                <Input
                  type="file"
                  accept=".xlsx"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setSelectedFile(file);
                  }}
                />
                {selectedFile && (
                  <p className="text-xs text-muted-foreground">
                    File terpilih: <span className="font-medium">{selectedFile.name}</span>
                  </p>
                )}
              </div>
              <div className="flex items-end gap-2">
                <Button type="button" variant="outline" onClick={handleDownloadTemplate} disabled={isDownloading || isImporting}>
                  {isDownloading ? 'Mengunduh...' : 'Download Template'}
                </Button>
                <Button type="button" onClick={handleImport} disabled={!selectedFile || isImporting || isDownloading}>
                  {isImporting ? 'Mengimpor...' : 'Import'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {summary && (
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Hasil Import</CardTitle>
              <CardDescription>Kategori: {CATEGORY_META[summary.kategori]?.label ?? summary.kategori}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm">
              <div>Total baris file: <span className="font-semibold">{summary.total_rows}</span></div>
              <div>Baris valid: <span className="font-semibold">{summary.valid_rows}</span></div>
              <div>Baris kosong: <span className="font-semibold">{summary.empty_rows}</span></div>
              <div>Baris error: <span className="font-semibold">{summary.error_rows}</span></div>
              <div>Baris duplikat: <span className="font-semibold">{summary.duplicate_rows}</span></div>
              <div>Baris sukses insert: <span className="font-semibold">{summary.success_rows}</span></div>
              <div>Mahasiswa terdampak: <span className="font-semibold">{summary.affected_students}</span></div>
              <div>Import Log ID: <span className="font-mono text-xs">{summary.import_log_id}</span></div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Riwayat Import Terbaru</CardTitle>
            <CardDescription>Menampilkan maksimal 10 proses import terakhir.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingLogs ? (
              <p className="text-sm text-muted-foreground">Memuat riwayat...</p>
            ) : logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada riwayat import.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="py-2 pr-3">Waktu</th>
                      <th className="py-2 pr-3">Kategori</th>
                      <th className="py-2 pr-3">Total</th>
                      <th className="py-2 pr-3">Sukses</th>
                      <th className="py-2 pr-3">Error</th>
                      <th className="py-2 pr-3">Duplikat</th>
                      <th className="py-2 pr-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b">
                        <td className="py-2 pr-3">{new Date(log.created_at).toLocaleString('id-ID')}</td>
                        <td className="py-2 pr-3">{CATEGORY_META[log.kategori]?.label ?? log.kategori}</td>
                        <td className="py-2 pr-3">{log.total_rows}</td>
                        <td className="py-2 pr-3">{log.success_rows}</td>
                        <td className="py-2 pr-3">{log.failed_rows}</td>
                        <td className="py-2 pr-3">{log.duplicate_rows}</td>
                        <td className="py-2 pr-3">{log.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
