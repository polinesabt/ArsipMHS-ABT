import { Database } from 'lucide-react';

interface InsightDataEmptyProps {
  title?: string;
  description?: string;
}

export function InsightDataEmpty({
  title = 'Belum ada data untuk ditampilkan',
  description = 'Data akan muncul otomatis setelah ada input dari modul terkait atau filter yang dipilih disesuaikan.',
}: InsightDataEmptyProps) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-12 text-center text-muted-foreground">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-background/80 ring-1 ring-border/70">
        <Database className="h-7 w-7 opacity-60" />
      </div>
      <p className="text-base font-semibold text-foreground">{title}</p>
      <p className="mt-2 max-w-md text-sm leading-relaxed">{description}</p>
    </div>
  );
}
