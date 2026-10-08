import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import type { SatisfactionRespondent } from '@/types/evaluation.types';

const PAGE_SIZE = 10;

export function SatisfactionRespondents({ rows }: { rows: SatisfactionRespondent[] | null }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('id-ID');
    return (rows ?? []).filter((row) => [
      row.nama, row.nim, row.tahun_lulus ?? '', row.evaluation_title ?? '',
      row.source === 'import' ? 'Data historis' : 'Formulir evaluasi',
    ].join(' ').toLocaleLowerCase('id-ID').includes(query));
  }, [rows, search]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const offset = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(offset, offset + PAGE_SIZE);

  return (
    <section className="dashboard-card min-w-0" aria-labelledby="satisfaction-respondents-title">
      <div className="dashboard-card-header flex-wrap gap-4">
        <div>
          <h3 id="satisfaction-respondents-title" className="dashboard-card-title">Mahasiswa pada data penilaian</h3>
          <p className="dashboard-card-description">Mahasiswa yang penilaiannya tercakup dalam grafik Kepuasan Pengguna.</p>
        </div>
        {rows !== null && (
          <span className="shrink-0 rounded-md bg-muted px-3 py-1.5 text-xs font-medium tabular-nums">
            {rows.length} data mahasiswa
          </span>
        )}
      </div>

      {rows === null ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Daftar mahasiswa belum dapat dimuat. Silakan muat ulang halaman.</p>
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Belum ada mahasiswa dengan penilaian kepuasan pengguna.</p>
      ) : (
        <div className="space-y-4">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              aria-label="Cari mahasiswa berdasarkan nama, NIM, tahun lulus, atau sumber data"
              placeholder="Cari nama, NIM, atau tahun lulus…"
              className="pl-9"
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1); }}
            />
          </div>

          <div className="overflow-hidden rounded-lg border border-border/70">
            <Table>
              <TableCaption className="sr-only">Daftar mahasiswa yang memiliki penilaian dalam grafik Kepuasan Pengguna</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col" className="w-12">No.</TableHead>
                  <TableHead scope="col">Mahasiswa</TableHead>
                  <TableHead scope="col">NIM</TableHead>
                  <TableHead scope="col">Tahun lulus</TableHead>
                  <TableHead scope="col">Sumber data</TableHead>
                  <TableHead scope="col" className="text-right">Penilaian</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((row, index) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-muted-foreground tabular-nums">{offset + index + 1}</TableCell>
                    <TableCell className="min-w-[180px] font-medium">{row.nama}</TableCell>
                    <TableCell className="whitespace-nowrap tabular-nums">{row.nim || '—'}</TableCell>
                    <TableCell className="tabular-nums">{row.tahun_lulus ?? '—'}</TableCell>
                    <TableCell className="min-w-[150px]">
                      <span className="text-xs font-medium">{row.source === 'import' ? 'Data historis' : 'Formulir evaluasi'}</span>
                      {row.evaluation_title && <p className="mt-1 text-xs text-muted-foreground">{row.evaluation_title}</p>}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right tabular-nums">{row.rating_count} indikator</TableCell>
                  </TableRow>
                ))}
                {visible.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      <p>Tidak ada mahasiswa yang cocok dengan pencarian.</p>
                      <Button variant="link" onClick={() => { setSearch(''); setPage(1); }}>Hapus pencarian</Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground tabular-nums" aria-live="polite">
              {filtered.length > 0 ? `${offset + 1}–${Math.min(offset + PAGE_SIZE, filtered.length)} dari ${filtered.length} data` : '0 data'}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" aria-label="Halaman mahasiswa sebelumnya" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-1 text-xs text-muted-foreground tabular-nums">{currentPage} / {pageCount}</span>
              <Button variant="outline" size="icon" aria-label="Halaman mahasiswa berikutnya" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">Satu mahasiswa dapat muncul lebih dari sekali jika memiliki penilaian pada sumber atau periode evaluasi yang berbeda.</p>
        </div>
      )}
    </section>
  );
}
