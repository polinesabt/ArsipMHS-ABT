import { useEffect, useRef, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AchievementFormModal } from '@/components/shared/AchievementFormModal';
import { getStudentsListFromAPI, type Student } from '@/repositories/api-student.repository';
import type { AchievementImportScope } from '@/constants/achievement-import.constants';
import type { AchievementCategory } from '@/types/achievement.types';

interface AchievementManualDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scope: AchievementImportScope;
  onCompleted?: () => void;
}

const SEARCH_DEBOUNCE_MS = 250;
const SEARCH_LIMIT = 15;

const SCOPE_MANUAL_META: Record<
  AchievementImportScope,
  {
    title: string;
    description: string;
    formSectionLabel: string;
    emptyHint: string;
    lockedCategory?: AchievementCategory;
    allowedCategories?: AchievementCategory[];
    publicationMode?: 'default' | 'jurnalOnly';
  }
> = {
  all: {
    title: 'Unggah Prestasi',
    description: 'Pilih mahasiswa terlebih dahulu, lalu isi form unggah prestasi secara manual.',
    formSectionLabel: 'Form Prestasi Manual',
    emptyHint: 'Pilih mahasiswa terlebih dahulu untuk membuka form unggah prestasi manual.',
  },
  academic: {
    title: 'Unggah Prestasi',
    description: 'Pilih mahasiswa terlebih dahulu, lalu isi form unggah prestasi secara manual.',
    formSectionLabel: 'Form Prestasi Manual',
    emptyHint: 'Pilih mahasiswa terlebih dahulu untuk membuka form unggah prestasi manual.',
  },
  nonAcademic: {
    title: 'Unggah Prestasi',
    description: 'Pilih mahasiswa terlebih dahulu, lalu isi form unggah prestasi secara manual.',
    formSectionLabel: 'Form Prestasi Manual',
    emptyHint: 'Pilih mahasiswa terlebih dahulu untuk membuka form unggah prestasi manual.',
  },
  productOnly: {
    title: 'Unggah Produk Mahasiswa',
    description: 'Pilih mahasiswa terlebih dahulu, lalu isi form unggah data produk mahasiswa secara manual.',
    formSectionLabel: 'Form Produk Mahasiswa',
    emptyHint: 'Pilih mahasiswa terlebih dahulu untuk membuka form unggah produk mahasiswa.',
    lockedCategory: 'produk_mahasiswa',
  },
  researchOutputs: {
    title: 'Tambahkan Luaran Penelitian',
    description: 'Pilih mahasiswa terlebih dahulu, lalu isi form luaran penelitian secara manual.',
    formSectionLabel: 'Form Luaran Penelitian',
    emptyHint: 'Pilih mahasiswa terlebih dahulu untuk membuka form luaran penelitian.',
    lockedCategory: 'luaran_penelitian',
    allowedCategories: ['luaran_penelitian'],
  },
  researchOutputsHki: {
    title: 'Tambahkan Luaran Penelitian',
    description: 'Pilih mahasiswa terlebih dahulu, lalu isi form luaran penelitian secara manual.',
    formSectionLabel: 'Form Luaran Penelitian',
    emptyHint: 'Pilih mahasiswa terlebih dahulu untuk membuka form luaran penelitian.',
    lockedCategory: 'luaran_penelitian',
    allowedCategories: ['luaran_penelitian'],
  },
  researchOutputsTechnology: {
    title: 'Tambahkan Luaran Penelitian',
    description: 'Pilih mahasiswa terlebih dahulu, lalu isi form luaran penelitian secara manual.',
    formSectionLabel: 'Form Luaran Penelitian',
    emptyHint: 'Pilih mahasiswa terlebih dahulu untuk membuka form luaran penelitian.',
    lockedCategory: 'luaran_penelitian',
    allowedCategories: ['luaran_penelitian'],
  },
  researchOutputsBooks: {
    title: 'Tambahkan Luaran Penelitian',
    description: 'Pilih mahasiswa terlebih dahulu, lalu isi form luaran penelitian secara manual.',
    formSectionLabel: 'Form Luaran Penelitian',
    emptyHint: 'Pilih mahasiswa terlebih dahulu untuk membuka form luaran penelitian.',
    lockedCategory: 'luaran_penelitian',
    allowedCategories: ['luaran_penelitian'],
  },
  publicationsJurnal: {
    title: 'Unggah Jurnal',
    description: 'Pilih mahasiswa terlebih dahulu, lalu isi form input jurnal secara manual.',
    formSectionLabel: 'Form Jurnal',
    emptyHint: 'Pilih mahasiswa terlebih dahulu untuk membuka form unggah jurnal.',
    lockedCategory: 'publikasi',
    allowedCategories: ['publikasi'],
    publicationMode: 'jurnalOnly',
  },
  publicationsSeminar: {
    title: 'Unggah Publikasi Seminar',
    description: 'Pilih mahasiswa terlebih dahulu, lalu isi form publikasi seminar secara manual.',
    formSectionLabel: 'Form Publikasi Seminar',
    emptyHint: 'Pilih mahasiswa terlebih dahulu untuk membuka form unggah publikasi seminar.',
    lockedCategory: 'seminar',
    allowedCategories: ['seminar'],
    publicationMode: 'default',
  },
  publicationsPagelaran: {
    title: 'Unggah Pagelaran/Presentasi',
    description: 'Pilih mahasiswa terlebih dahulu, lalu isi form pagelaran/presentasi secara manual.',
    formSectionLabel: 'Form Pagelaran / Presentasi',
    emptyHint: 'Pilih mahasiswa terlebih dahulu untuk membuka form unggah pagelaran/presentasi.',
    lockedCategory: 'pagelaran',
    allowedCategories: ['pagelaran'],
    publicationMode: 'default',
  },
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function renderHighlightedText(text: string, keyword: string): React.ReactNode {
  const needle = keyword.trim();
  if (!needle) return text;

  const escaped = escapeRegExp(needle);
  const regex = new RegExp(`(${escaped})`, 'ig');
  const chunks = text.split(regex);
  const normalizedNeedle = needle.toLowerCase();

  return chunks.map((chunk, index) => (
    chunk.toLowerCase() === normalizedNeedle ? (
      <mark key={`${chunk}-${index}`} className="rounded-sm bg-primary/15 px-0.5 text-foreground">
        {chunk}
      </mark>
    ) : (
      <span key={`${chunk}-${index}`}>{chunk}</span>
    )
  ));
}

export function AchievementManualDialog({ open, onOpenChange, scope, onCompleted }: AchievementManualDialogProps) {
  const scopeMeta = SCOPE_MANUAL_META[scope];

  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [results, setResults] = useState<Student[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!open) {
      setSearchKeyword('');
      setDebouncedKeyword('');
      setSelectedStudent(null);
      setResults([]);
      setIsSearching(false);
      setSearchError(null);
      requestIdRef.current += 1;
      return;
    }
    const timer = window.setTimeout(() => {
      setDebouncedKeyword(searchKeyword.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [open, searchKeyword]);

  useEffect(() => {
    if (!open || selectedStudent) return;
    if (debouncedKeyword.length < 1) {
      setResults([]);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsSearching(true);
    setSearchError(null);

    void getStudentsListFromAPI({
      search: debouncedKeyword,
      limit: SEARCH_LIMIT,
      offset: 0,
    })
      .then((response) => {
        if (requestId !== requestIdRef.current) return;
        if (!response.success) {
          setResults([]);
          setSearchError(response.error ?? 'Gagal memuat daftar mahasiswa.');
          return;
        }
        setResults(response.data ?? []);
      })
      .catch(() => {
        if (requestId !== requestIdRef.current) return;
        setResults([]);
        setSearchError('Gagal memuat daftar mahasiswa.');
      })
      .finally(() => {
        if (requestId === requestIdRef.current) {
          setIsSearching(false);
        }
      });
  }, [debouncedKeyword, open, selectedStudent]);

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setSearchKeyword(student.nama);
    setDebouncedKeyword(student.nama);
    setSearchError(null);
    setResults([]);
  };

  const handleResetStudent = () => {
    setSelectedStudent(null);
    setSearchKeyword('');
    setDebouncedKeyword('');
    setSearchError(null);
    setResults([]);
    requestIdRef.current += 1;
  };

  const showResultTable = !selectedStudent && debouncedKeyword.length > 0 && !isSearching && !searchError;
  const highlightKeyword = debouncedKeyword.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-foreground">{scopeMeta.title}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {scopeMeta.description}
          </p>
        </DialogHeader>

        <div className="space-y-5">
          <section className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Pilih Mahasiswa</p>

            <div className="space-y-2">
              <Label htmlFor="manual-achievement-student-name">Nama Mahasiswa</Label>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[260px] flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="manual-achievement-student-name"
                    placeholder="Cari nama atau NIM mahasiswa..."
                    value={searchKeyword}
                    readOnly={Boolean(selectedStudent)}
                    onChange={(event) => setSearchKeyword(event.target.value)}
                    className="pl-9"
                  />
                </div>
                {selectedStudent && (
                  <Button type="button" variant="outline" onClick={handleResetStudent}>
                    Ganti Mahasiswa
                  </Button>
                )}
              </div>
            </div>

            {selectedStudent && (
              <div className="space-y-2">
                <Label htmlFor="manual-achievement-student-nim">NIM</Label>
                <Input id="manual-achievement-student-nim" value={selectedStudent.nim} readOnly />
              </div>
            )}

            {!selectedStudent && (
              <div className="rounded-lg border">
                {debouncedKeyword.length < 1 ? (
                  <p className="px-3 py-4 text-sm text-muted-foreground">
                    Ketik kata kunci nama atau NIM untuk mencari mahasiswa.
                  </p>
                ) : isSearching ? (
                  <div className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memuat hasil pencarian...
                  </div>
                ) : searchError ? (
                  <p className="px-3 py-4 text-sm text-destructive">{searchError}</p>
                ) : showResultTable && results.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-muted-foreground">Mahasiswa tidak ditemukan.</p>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 z-10 bg-muted/40">
                        <tr className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          <th className="px-3 py-2 text-left">Nama</th>
                          <th className="px-3 py-2 text-left">NIM</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((student) => (
                          <tr
                            key={student.id}
                            role="button"
                            tabIndex={0}
                            className="cursor-pointer border-t first:border-t-0 hover:bg-muted/30 focus-visible:bg-muted/40 focus-visible:outline-none"
                            onClick={() => handleSelectStudent(student)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                handleSelectStudent(student);
                              }
                            }}
                          >
                            <td className="px-3 py-2">{renderHighlightedText(student.nama, highlightKeyword)}</td>
                            <td className="px-3 py-2 font-mono">{renderHighlightedText(student.nim, highlightKeyword)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            {showResultTable && results.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Menampilkan {results.length} hasil untuk "{debouncedKeyword}".
              </p>
            )}
          </section>

          {selectedStudent ? (
            <section className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{scopeMeta.formSectionLabel}</p>
              <AchievementFormModal
                masterId={selectedStudent.id}
                category={scopeMeta.lockedCategory}
                allowedCategories={scopeMeta.allowedCategories}
                onClose={() => onOpenChange(false)}
                onSuccess={() => {
                  onOpenChange(false);
                  onCompleted?.();
                }}
                useApi
                renderMode="embedded"
                categoryScope={scope}
                publicationMode={scopeMeta.publicationMode ?? 'default'}
              />
            </section>
          ) : (
            <p className="text-sm text-muted-foreground">
              {scopeMeta.emptyHint}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
