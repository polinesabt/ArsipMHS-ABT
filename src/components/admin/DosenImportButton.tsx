import { useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, Loader2, Upload, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useDosen } from '@/contexts/DosenContext';
import { downloadDosenImportTemplate, previewDosenImportFile, uploadDosenImport, type DosenImportModule, type DosenImportSummary } from '@/services/dosen.service';

interface DosenImportButtonProps {
  module: DosenImportModule;
  title: string;
}

export function DosenImportButton({ module, title }: DosenImportButtonProps) {
  const { refreshFromDatabase, isDbConnected } = useDosen();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{ headers: string[]; rows: string[][]; total: number } | null>(null);
  const [summary, setSummary] = useState<DosenImportSummary | null>(null);
  const [error, setError] = useState('');
  const [reading, setReading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const reset = () => {
    setFile(null); setPreview(null); setSummary(null); setError(''); setReading(false); setUploading(false); setDragging(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const selectFile = async (selected: File) => {
    reset();
    if (!selected.name.toLowerCase().endsWith('.xlsx')) { setError('Hanya file .xlsx yang didukung.'); return; }
    if (selected.size > 10 * 1024 * 1024) { setError('Ukuran file maksimal 10 MB.'); return; }
    setFile(selected); setReading(true);
    try {
      setPreview(await previewDosenImportFile(selected, module));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'File gagal dibaca.');
    } finally { setReading(false); }
  };

  const download = async () => {
    setDownloading(true); setError('');
    try { await downloadDosenImportTemplate(module); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Template gagal diunduh.'); }
    finally { setDownloading(false); }
  };

  const upload = async () => {
    if (!file) return;
    setUploading(true); setError('');
    try {
      const response = await uploadDosenImport(module, file);
      if (!response.success || !response.data) { setError(response.error || 'Impor gagal diproses.'); return; }
      await refreshFromDatabase();
      setSummary(response.data);
      toast({ title: 'Impor selesai', description: `${response.data.inserted} berhasil, ${response.data.skipped} dilewati, ${response.data.failed} gagal.` });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impor gagal diproses.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => { reset(); setOpen(true); }} className="h-9 rounded-xl" title={isDbConnected === false ? 'Koneksi database gagal; data mungkin berasal dari cache.' : 'Database tersambung'}>
        <FileSpreadsheet className="mr-2 h-4 w-4" />Import Excel
      </Button>
      <Dialog open={open} onOpenChange={(value) => { if (!uploading) { setOpen(value); if (!value) reset(); } }}>
          <DialogContent className="max-w-3xl max-h-[90dvh] overflow-y-auto rounded-2xl">
            <DialogHeader><DialogTitle>Import Excel {title}</DialogTitle><DialogDescription>Gunakan template resmi agar struktur header, dropdown, dan identitas dosen tervalidasi.</DialogDescription></DialogHeader>
          <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
            <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="text-xs font-semibold">Langkah 1 · Unduh template</p><p className="mt-1 text-xs text-muted-foreground">Template berisi metadata versi dan format khusus modul ini.</p></div>
              <Button variant="outline" size="sm" onClick={() => void download()} disabled={downloading}>{downloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}Unduh Template</Button>
            </div>

            <div><p className="mb-2 text-xs font-semibold">Langkah 2 · Unggah dan periksa data</p><input ref={inputRef} type="file" accept=".xlsx" className="hidden" onChange={(event) => { const selected = event.target.files?.[0]; if (selected) void selectFile(selected); }} />
              <button type="button" onClick={() => inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); const selected = event.dataTransfer.files?.[0]; if (selected) void selectFile(selected); }} className={`flex min-h-32 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center transition-colors ${dragging ? 'border-primary bg-primary/10' : 'border-border bg-background hover:border-primary/50'}`}>
                {reading ? <Loader2 className="mb-2 h-7 w-7 animate-spin text-primary" /> : <Upload className="mb-2 h-7 w-7 text-primary" />}<span className="text-sm font-semibold">{file?.name || 'Klik atau tarik file .xlsx ke sini'}</span><span className="mt-1 text-xs text-muted-foreground">Maksimal 10 MB</span>
              </button>
            </div>

            {error && <div className="flex gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
            {preview && !summary && <div className="space-y-2"><div className="flex items-center justify-between"><p className="text-xs font-semibold">Pratinjau 10 baris pertama</p><span className="text-xs text-muted-foreground">{preview.total} baris data terdeteksi</span></div><div className="overflow-x-auto rounded-xl border border-border"><table className="min-w-full text-xs"><thead className="bg-muted"><tr>{preview.headers.map((header, index) => <th key={`${header}-${index}`} className="whitespace-nowrap px-3 py-2 text-left font-semibold">{header}</th>)}</tr></thead><tbody>{preview.rows.map((row, rowIndex) => <tr key={rowIndex} className="border-t border-border/60">{row.map((cell, cellIndex) => <td key={cellIndex} className="max-w-56 truncate whitespace-nowrap px-3 py-2" title={cell}>{cell || '—'}</td>)}</tr>)}</tbody></table></div></div>}
            {summary && <div className="space-y-3"><p className="text-xs font-semibold">Langkah 3 · Hasil impor</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><Metric label="Berhasil" value={summary.inserted} tone="success" /><Metric label="Dilewati" value={summary.skipped} tone="neutral" /><Metric label="Gagal" value={summary.failed} tone="danger" /><Metric label="Dosen terdampak" value={summary.affected_dosen} tone="primary" /></div>{summary.details.length > 0 && <div className="max-h-48 overflow-y-auto rounded-xl border border-border"><ul className="divide-y divide-border/60">{summary.details.map((detail) => <li key={`${detail.row}-${detail.status}`} className="flex gap-2 p-3 text-xs">{detail.status === 'inserted' ? <CheckCircle2 className="h-4 w-4 shrink-0 text-success" /> : detail.status === 'error' ? <XCircle className="h-4 w-4 shrink-0 text-destructive" /> : <AlertCircle className="h-4 w-4 shrink-0 text-warning" />}<span><strong>Baris {detail.row}</strong>{detail.identity ? ` · ${detail.identity}` : ''}: {detail.message}</span></li>)}</ul></div>}</div>}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)} disabled={uploading}>{summary ? 'Tutup' : 'Batal'}</Button>{preview && !summary && <Button onClick={() => void upload()} disabled={uploading || preview.total === 0}>{uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}{uploading ? 'Mengimpor...' : 'Konfirmasi Import'}</Button>}</DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone: 'success' | 'neutral' | 'danger' | 'primary' }) {
  const classes = tone === 'success' ? 'border-success/25 bg-success/10 text-success' : tone === 'danger' ? 'border-destructive/25 bg-destructive/10 text-destructive' : tone === 'primary' ? 'border-primary/25 bg-primary/10 text-primary' : 'border-border bg-muted/50 text-foreground';
  return <div className={`rounded-xl border p-3 ${classes}`}><p className="text-xl font-bold">{value}</p><p className="text-[11px] font-medium">{label}</p></div>;
}
