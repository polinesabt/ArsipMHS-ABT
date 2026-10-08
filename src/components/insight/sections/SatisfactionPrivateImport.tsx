import { useState } from 'react';
import { FileArchive, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { importSatisfactionPrivateBundle, type SatisfactionImportResult } from '@/lib/satisfaction-private-import';

export function SatisfactionPrivateImport({ onImported }: { onImported: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SatisfactionImportResult | null>(null);

  const submit = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const imported = await importSatisfactionPrivateBundle(file, setProgress);
      setResult(imported);
      onImported();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Paket formulir gagal diimpor.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="dashboard-card min-w-0" aria-labelledby="satisfaction-private-import-title">
      <div className="dashboard-card-header">
        <div>
          <h3 id="satisfaction-private-import-title" className="dashboard-card-title">Impor formulir historis</h3>
          <p className="dashboard-card-description">Unggah satu paket ZIP berisi data spreadsheet dan bukti formulir. Setelah selesai, mahasiswa serta tombol unduh akan muncul pada daftar di atas.</p>
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <FileArchive className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="file"
            accept=".zip,application/zip"
            aria-label="Pilih paket ZIP formulir historis"
            className="h-auto min-h-10 pl-9 pt-2"
            disabled={busy}
            onChange={(event) => { setFile(event.target.files?.[0] ?? null); setResult(null); setError(null); setProgress(0); }}
          />
        </div>
        <Button type="button" className="gap-2" disabled={!file || busy} onClick={() => void submit()}>
          <Upload className="h-4 w-4" aria-hidden="true" />
          {busy ? `Mengunggah ${progress}%` : 'Unggah dan hubungkan formulir'}
        </Button>
      </div>
      {busy && <div role="progressbar" aria-label="Kemajuan unggah formulir" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-[width] duration-200" style={{ width: `${progress}%` }} /></div>}
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
      {result && <p role="status" className="mt-3 text-sm text-foreground">Berhasil: {result.students} mahasiswa dengan penilaian, {result.ratings} penilaian, dan {result.proofs} berkas bukti. Daftar diperbarui.</p>}
    </section>
  );
}
