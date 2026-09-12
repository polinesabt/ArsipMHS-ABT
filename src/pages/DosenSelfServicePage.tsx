import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Award, BookOpen, Clock3, FlaskConical, HeartHandshake, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { deleteOwnDosenEwmp, getOwnDosenData, saveOwnDosenSection, type DosenSelfData, type DosenSelfSection } from '@/services/dosen.service';
import type { KontribusiDosenItem, MatkulItem, MatkulPSLainItem } from '@/data/mockKontribusiDosenData';
import type { KontribusiPenelitianDosenItem, PenelitianItem } from '@/data/mockPenelitianDosenData';
import type { KontribusiPengabdianDosenItem, PKMItem } from '@/data/mockPengabdianDosenData';
import { calculateAvgSks, calculatePendidikanTotal, calculateTotalSks, type WaktuMengajarItem } from '@/data/mockWaktuMengajarData';
import { JENIS_PUBLIKASI_GROUPS, SUMBER_PENDANAAN_OPTIONS, type DosenLuaranItem, type JenisPublikasi, type LuaranItem, type SumberPendanaan } from '@/data/mockLuaranPenelitianPkmData';
import { DirectSaveNotice, PortalPageHeader, UnsavedChangesNotice } from '@/components/staff/PortalPageHeader';

type PageSection = Exclude<DosenSelfSection, 'waktu_mengajar'> | 'waktu_mengajar';

const SECTION_META = {
  pengajaran: { title: 'Pengajaran', description: 'Mata kuliah, bahan ajar, bimbingan mahasiswa, dan rekognisi pengajaran.', icon: BookOpen },
  penelitian: { title: 'Penelitian', description: 'Riwayat penelitian, mitra, skema, dan rekognisi kepakaran.', icon: FlaskConical },
  pengabdian: { title: 'Pengabdian', description: 'Kegiatan pengabdian kepada masyarakat dan rekognisi.', icon: HeartHandshake },
  waktu_mengajar: { title: 'EWMP', description: 'Beban kerja dosen per tahun akademik.', icon: Clock3 },
  luaran: { title: 'Luaran', description: 'Luaran penelitian dan PKM yang telah dipublikasikan.', icon: Award },
} satisfies Record<PageSection, { title: string; description: string; icon: typeof BookOpen }>;

function clientId(prefix: string): string {
  return `${prefix}-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;
}

function currentAcademicYear(): string {
  const year = new Date().getFullYear();
  return `${year}/${year + 1}`;
}

function validCalendarYear(value: string): boolean {
  return /^(19|20)\d{2}$/.test(value.trim());
}

function validAcademicYear(value: string): boolean {
  const normalized = value.trim();
  if (!/^(19|20)\d{2}\/(19|20)\d{2}$/.test(normalized)) return false;
  return Number(normalized.slice(5)) === Number(normalized.slice(0, 4)) + 1;
}

function validateSection(section: Exclude<PageSection, 'waktu_mengajar'>, data: DosenSelfData): string {
  if (section === 'pengajaran') {
    const courses = [...data.pengajaran.matkulABT, ...data.pengajaran.matkulPSLain];
    if (courses.some((item) => !item.nama.trim())) return 'Nama setiap mata kuliah wajib diisi.';
    if (courses.some((item) => !Number.isInteger(Number(item.sks)) || Number(item.sks) < 1 || Number(item.sks) > 6)) return 'SKS mata kuliah harus berupa bilangan bulat antara 1 dan 6.';
    if (data.pengajaran.matkulPSLain.some((item) => !item.prodi.trim())) return 'Program studi wajib diisi untuk mata kuliah PS lain.';
  }
  if (section === 'penelitian' && data.penelitian.penelitian.some((item) => !item.judul.trim() || !validCalendarYear(item.tahun || ''))) {
    return 'Judul dan tahun 4 digit wajib diisi untuk setiap penelitian.';
  }
  if (section === 'pengabdian' && data.pengabdian.pkm.some((item) => !item.namaKegiatan.trim() || !validCalendarYear(item.tahun || ''))) {
    return 'Nama kegiatan dan tahun 4 digit wajib diisi untuk setiap pengabdian.';
  }
  if (section === 'luaran' && data.luaran.luaran.some((item) => !item.judul.trim() || !validCalendarYear(item.tahun))) {
    return 'Judul dan tahun 4 digit wajib diisi untuk setiap luaran.';
  }
  return '';
}

export default function DosenSelfServicePage({ section }: { section: PageSection }) {
  const { toast } = useToast();
  const [saved, setSaved] = useState<DosenSelfData | null>(null);
  const [draft, setDraft] = useState<DosenSelfData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    getOwnDosenData().then((response) => {
      if (!active) return;
      if (response.success && response.data) {
        setSaved(response.data);
        setDraft(response.data);
      } else setError(response.error || 'Data dosen gagal dimuat.');
      setIsLoading(false);
    });
    return () => { active = false; };
  }, [section]);

  const dirty = useMemo(() => {
    if (!saved || !draft || section === 'waktu_mengajar') return false;
    return JSON.stringify(saved[section]) !== JSON.stringify(draft[section]);
  }, [draft, saved, section]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const applyResponse = (next: DosenSelfData) => {
    setSaved(next);
    setDraft(next);
    window.dispatchEvent(new Event('dosen:refresh'));
  };

  const saveSection = async () => {
    if (!draft || section === 'waktu_mengajar') return;
    const validationError = validateSection(section, draft);
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsSaving(true); setError('');
    const response = await saveOwnDosenSection(section, draft[section]);
    setIsSaving(false);
    if (!response.success || !response.data) { setError(response.error || 'Data gagal disimpan.'); return; }
    applyResponse(response.data);
    toast({ title: `${SECTION_META[section].title} tersimpan`, description: 'Perubahan langsung tersinkron ke dashboard admin.' });
  };

  if (isLoading) return <div className="space-y-5"><Skeleton className="h-28 rounded-2xl" /><Skeleton className="h-[480px] rounded-2xl" /></div>;
  if (!draft) return <ErrorBox message={error || 'Data dosen tidak tersedia.'} />;

  const meta = SECTION_META[section];
  const Icon = meta.icon;
  return (
    <div className="pb-6">
      <PortalPageHeader
        title={meta.title}
        description={meta.description}
        icon={Icon}
        action={section !== 'waktu_mengajar' ? <><Button variant="outline" className="rounded-lg active:translate-y-px" disabled={!dirty || isSaving} onClick={() => { setDraft(saved); setError(''); }}>Batalkan</Button><Button className="rounded-lg active:translate-y-px" disabled={!dirty || isSaving} onClick={() => void saveSection()}>{isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Simpan</Button></> : undefined}
      >
        <DirectSaveNotice>Identitas dosen ditentukan dari akun aktif. Anda hanya dapat melihat dan mengubah portofolio milik sendiri.</DirectSaveNotice>
        {dirty && <UnsavedChangesNotice />}
      </PortalPageHeader>
      {error && <ErrorBox message={error} />}
      <div className={error ? 'mt-5' : ''}>
        {section === 'pengajaran' && <TeachingEditor value={draft.pengajaran} onChange={(value) => setDraft({ ...draft, pengajaran: value })} disabled={isSaving} />}
        {section === 'penelitian' && <ResearchEditor value={draft.penelitian} onChange={(value) => setDraft({ ...draft, penelitian: value })} disabled={isSaving} />}
        {section === 'pengabdian' && <ServiceEditor value={draft.pengabdian} onChange={(value) => setDraft({ ...draft, pengabdian: value })} disabled={isSaving} />}
        {section === 'luaran' && <OutputEditor value={draft.luaran} onChange={(value) => setDraft({ ...draft, luaran: value })} disabled={isSaving} />}
        {section === 'waktu_mengajar' && <EwmpEditor records={draft.waktuMengajar} identity={{ nidn: draft.profile.nidn, nama: draft.profile.nama }} onApplied={applyResponse} />}
      </div>
    </div>
  );
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <section className="min-w-0 overflow-hidden rounded-2xl border border-border/75 bg-card shadow-soft"><div className="flex min-h-14 items-center justify-between gap-3 border-b border-border/70 bg-muted/25 px-4 py-3.5 sm:px-5"><h2 className="min-w-0 text-sm font-bold">{title}</h2>{action && <div className="shrink-0">{action}</div>}</div><div className="p-4 sm:p-5">{children}</div></section>;
}

function ErrorBox({ message }: { message: string }) {
  return <div role="alert" className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{message}</div>;
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">{children}</div>;
}

function StringList({ values, onChange, placeholder, disabled }: { values: string[]; onChange: (values: string[]) => void; placeholder: string; disabled?: boolean }) {
  return <div className="space-y-2">{values.map((value, index) => { const inputId = `daftar-${placeholder.replace(/\s+/g, '-').toLowerCase()}-${index}`; return <div key={index} className="flex gap-2"><Label htmlFor={inputId} className="sr-only">{placeholder} {index + 1}</Label><Input id={inputId} value={value} disabled={disabled} placeholder={placeholder} onChange={(event) => onChange(values.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} /><Button type="button" size="icon" variant="ghost" disabled={disabled} onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Hapus ${placeholder.toLowerCase()} ${index + 1}`}><Trash2 className="h-4 w-4" /></Button></div>; })}{values.length === 0 && <Empty>Belum ada data.</Empty>}<Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => onChange([...values, ''])}><Plus className="mr-2 h-4 w-4" />Tambah</Button></div>;
}

function TeachingEditor({ value, onChange, disabled }: { value: KontribusiDosenItem; onChange: (value: KontribusiDosenItem) => void; disabled?: boolean }) {
  const updateCourse = <T extends MatkulItem | MatkulPSLainItem>(items: T[], id: string, patch: Partial<T>): T[] => items.map((item) => item.id === id ? { ...item, ...patch } : item);
  const setBimbingan = (group: 'psABT' | 'psLain', key: 'ps' | 'ps1' | 'ps2', amount: string) => onChange({ ...value, bimbingan: { ...value.bimbingan, [group]: { ...value.bimbingan[group], [key]: Math.max(0, Number.parseInt(amount, 10) || 0) } } });
  return <div className="grid gap-5 xl:grid-cols-2">
    <Panel title="Mata Kuliah PS ABT" action={<Button size="sm" variant="outline" disabled={disabled} onClick={() => onChange({ ...value, matkulABT: [...value.matkulABT, { id: clientId('abt'), kode: '', nama: '', sks: 3 }] })}><Plus className="mr-2 h-4 w-4" />Mata kuliah</Button>}>
      <div className="space-y-3">{value.matkulABT.map((course) => <CourseRow key={course.id} course={course} disabled={disabled} onChange={(patch) => onChange({ ...value, matkulABT: updateCourse(value.matkulABT, course.id, patch) })} onDelete={() => onChange({ ...value, matkulABT: value.matkulABT.filter((item) => item.id !== course.id) })} />)}{value.matkulABT.length === 0 && <Empty>Belum ada mata kuliah PS ABT.</Empty>}</div>
    </Panel>
    <Panel title="Mata Kuliah PS Lain" action={<Button size="sm" variant="outline" disabled={disabled} onClick={() => onChange({ ...value, matkulPSLain: [...value.matkulPSLain, { id: clientId('lain'), kode: '', nama: '', prodi: '', sks: 3 }] })}><Plus className="mr-2 h-4 w-4" />Mata kuliah</Button>}>
      <div className="space-y-3">{value.matkulPSLain.map((course) => <CourseRow key={course.id} course={course} other disabled={disabled} onChange={(patch) => onChange({ ...value, matkulPSLain: updateCourse(value.matkulPSLain, course.id, patch) })} onDelete={() => onChange({ ...value, matkulPSLain: value.matkulPSLain.filter((item) => item.id !== course.id) })} />)}{value.matkulPSLain.length === 0 && <Empty>Belum ada mata kuliah program studi lain.</Empty>}</div>
    </Panel>
    <Panel title="Bahan Ajar"><StringList values={value.bahanAjar} disabled={disabled} placeholder="Judul buku, modul, atau diktat" onChange={(bahanAjar) => onChange({ ...value, bahanAjar })} /></Panel>
    <Panel title="Rekognisi Pengajaran"><StringList values={value.rekognisi} disabled={disabled} placeholder="Rekognisi atau pengakuan keahlian" onChange={(rekognisi) => onChange({ ...value, rekognisi })} /></Panel>
    <div className="xl:col-span-2"><Panel title="Bimbingan Mahasiswa"><div className="grid gap-4 md:grid-cols-2">{(['psABT','psLain'] as const).map((group) => <div key={group} className="rounded-xl border border-border/60 bg-muted/20 p-4"><h3 className="mb-3 text-xs font-bold">{group === 'psABT' ? 'PS ABT' : 'PS Lain'}</h3><div className="grid grid-cols-3 gap-3">{(['ps','ps1','ps2'] as const).map((key) => <div key={key} className="space-y-1.5"><Label className="text-xs uppercase">{key.replace('ps','PS-').replace(/-$/,'')}</Label><Input type="number" min={0} disabled={disabled} value={value.bimbingan[group][key]} onChange={(event) => setBimbingan(group,key,event.target.value)} /></div>)}</div></div>)}</div></Panel></div>
  </div>;
}

function CourseRow({ course, other, onChange, onDelete, disabled }: { course: MatkulItem | MatkulPSLainItem; other?: boolean; onChange: (patch: Partial<MatkulPSLainItem>) => void; onDelete: () => void; disabled?: boolean }) {
  const prodi = 'prodi' in course ? course.prodi : '';
  return (
    <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-3.5 sm:p-4">
      <div className="flex items-center justify-between sm:hidden">
        <span className="text-xs font-semibold text-muted-foreground">Mata Kuliah</span>
        <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-destructive" disabled={disabled} onClick={onDelete} aria-label={`Hapus mata kuliah ${course.nama || 'baru'}`}><Trash2 className="h-4 w-4" /></Button>
      </div>
      <div className="grid items-end gap-3 sm:grid-cols-[110px_minmax(0,1fr)_90px_auto]">
        <div className="space-y-1.5"><Label htmlFor={`kode-${course.id}`} className="text-[11px]">Kode</Label><Input id={`kode-${course.id}`} value={course.kode || ''} disabled={disabled} placeholder="Kode" onChange={(event) => onChange({ kode: event.target.value })} /></div>
        <div className="space-y-1.5"><Label htmlFor={`nama-${course.id}`} className="text-[11px]">Nama mata kuliah</Label><Input id={`nama-${course.id}`} value={course.nama} disabled={disabled} placeholder="Nama mata kuliah" onChange={(event) => onChange({ nama: event.target.value })} /></div>
        <div className="space-y-1.5"><Label htmlFor={`sks-${course.id}`} className="text-[11px]">SKS</Label><Input id={`sks-${course.id}`} type="number" min={1} max={6} value={course.sks || 3} disabled={disabled} onChange={(event) => onChange({ sks: Number.parseInt(event.target.value, 10) || 0 })} /></div>
        <Button type="button" size="icon" variant="ghost" className="hidden sm:inline-flex" disabled={disabled} onClick={onDelete} aria-label={`Hapus mata kuliah ${course.nama || 'baru'}`}><Trash2 className="h-4 w-4" /></Button>
      </div>
      {other && <div className="space-y-1.5"><Label htmlFor={`prodi-${course.id}`} className="text-[11px]">Program studi</Label><Input id={`prodi-${course.id}`} value={prodi} disabled={disabled} placeholder="Nama program studi" onChange={(event) => onChange({ prodi: event.target.value })} /></div>}
    </div>
  );
}

function ResearchEditor({ value, onChange, disabled }: { value: KontribusiPenelitianDosenItem; onChange: (value: KontribusiPenelitianDosenItem) => void; disabled?: boolean }) {
  const update = (id: string, patch: Partial<PenelitianItem>) => onChange({ ...value, penelitian: value.penelitian.map((item) => item.id === id ? { ...item, ...patch } : item) });
  return <div className="space-y-5"><Panel title="Daftar Penelitian" action={<Button size="sm" variant="outline" disabled={disabled} onClick={() => onChange({ ...value, penelitian: [...value.penelitian, { id: clientId('riset'), judul: '', kerjasamaInstansi: '', tahun: String(new Date().getFullYear()), skema: '' }] })}><Plus className="mr-2 h-4 w-4" />Penelitian</Button>}><div className="space-y-3">{value.penelitian.map((item) => <ActivityRow key={item.id} rowId={item.id} title={item.judul} partner={item.kerjasamaInstansi} year={item.tahun || ''} scheme={item.skema || ''} disabled={disabled} titlePlaceholder="Judul penelitian" onChange={(field, fieldValue) => update(item.id, { [field === 'title' ? 'judul' : field === 'partner' ? 'kerjasamaInstansi' : field]: fieldValue })} onDelete={() => onChange({ ...value, penelitian: value.penelitian.filter((entry) => entry.id !== item.id) })} />)}{value.penelitian.length === 0 && <Empty>Belum ada penelitian.</Empty>}</div></Panel><Panel title="Rekognisi dan Kepakaran"><StringList values={value.rekognisi} disabled={disabled} placeholder="Nama rekognisi atau penghargaan" onChange={(rekognisi) => onChange({ ...value, rekognisi })} /></Panel></div>;
}

function ServiceEditor({ value, onChange, disabled }: { value: KontribusiPengabdianDosenItem; onChange: (value: KontribusiPengabdianDosenItem) => void; disabled?: boolean }) {
  const update = (id: string, patch: Partial<PKMItem>) => onChange({ ...value, pkm: value.pkm.map((item) => item.id === id ? { ...item, ...patch } : item) });
  return <div className="space-y-5"><Panel title="Daftar Kegiatan PKM" action={<Button size="sm" variant="outline" disabled={disabled} onClick={() => onChange({ ...value, pkm: [...value.pkm, { id: clientId('pkm'), namaKegiatan: '', kerjasamaInstansi: '', tahun: String(new Date().getFullYear()), skema: '' }] })}><Plus className="mr-2 h-4 w-4" />Kegiatan</Button>}><div className="space-y-3">{value.pkm.map((item) => <ActivityRow key={item.id} rowId={item.id} title={item.namaKegiatan} partner={item.kerjasamaInstansi} year={item.tahun || ''} scheme={item.skema || ''} disabled={disabled} titlePlaceholder="Nama kegiatan PKM" onChange={(field, fieldValue) => update(item.id, { [field === 'title' ? 'namaKegiatan' : field === 'partner' ? 'kerjasamaInstansi' : field]: fieldValue })} onDelete={() => onChange({ ...value, pkm: value.pkm.filter((entry) => entry.id !== item.id) })} />)}{value.pkm.length === 0 && <Empty>Belum ada kegiatan PKM.</Empty>}</div></Panel><Panel title="Rekognisi dan Kepakaran"><StringList values={value.rekognisi} disabled={disabled} placeholder="Nama rekognisi atau penghargaan" onChange={(rekognisi) => onChange({ ...value, rekognisi })} /></Panel></div>;
}

function ActivityRow({ rowId, title, partner, year, scheme, titlePlaceholder, onChange, onDelete, disabled }: { rowId: string; title: string; partner: string; year: string; scheme: string; titlePlaceholder: string; onChange: (field: 'title'|'partner'|'tahun'|'skema', value: string) => void; onDelete: () => void; disabled?: boolean }) {
  return (
    <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4">
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1 space-y-1.5"><Label htmlFor={`${rowId}-title`} className="text-[11px]">{titlePlaceholder}</Label><Input id={`${rowId}-title`} value={title} disabled={disabled} placeholder={titlePlaceholder} onChange={(event) => onChange('title', event.target.value)} /></div>
        <Button type="button" size="icon" variant="ghost" disabled={disabled} onClick={onDelete} aria-label={`Hapus ${titlePlaceholder.toLowerCase()}`}><Trash2 className="h-4 w-4" /></Button>
      </div>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_120px_220px]">
        <div className="space-y-1.5"><Label htmlFor={`${rowId}-partner`} className="text-[11px]">Instansi atau organisasi mitra</Label><Input id={`${rowId}-partner`} value={partner} disabled={disabled} placeholder="Nama mitra" onChange={(event) => onChange('partner', event.target.value)} /></div>
        <div className="space-y-1.5"><Label htmlFor={`${rowId}-year`} className="text-[11px]">Tahun</Label><Input id={`${rowId}-year`} value={year} disabled={disabled} inputMode="numeric" placeholder="2026" onChange={(event) => onChange('tahun', event.target.value)} /></div>
        <div className="space-y-1.5"><Label htmlFor={`${rowId}-scheme`} className="text-[11px]">Skema</Label><Input id={`${rowId}-scheme`} value={scheme} disabled={disabled} placeholder="Nama skema" onChange={(event) => onChange('skema', event.target.value)} /></div>
      </div>
    </div>
  );
}

function OutputEditor({ value, onChange, disabled }: { value: DosenLuaranItem; onChange: (value: DosenLuaranItem) => void; disabled?: boolean }) {
  const update = (id: string, patch: Partial<LuaranItem>) => onChange({ ...value, luaran: value.luaran.map((item) => item.id === id ? { ...item, ...patch } : item) });
  const publicationOptions = JENIS_PUBLIKASI_GROUPS.flatMap((group) => group.options);
  return <Panel title="Daftar Luaran" action={<Button size="sm" variant="outline" disabled={disabled} onClick={() => onChange({ ...value, luaran: [...value.luaran, { id: clientId('luaran'), kategori: 'Penelitian', judul: '', tahun: String(new Date().getFullYear()), sumberPendanaan: 'Perguruan Tinggi / Mandiri', jenisPublikasi: 'Jurnal Nasional Tidak Terakreditasi' }] })}><Plus className="mr-2 h-4 w-4" />Luaran</Button>}><div className="space-y-3">{value.luaran.map((item) => <div key={item.id} className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4"><div className="flex items-end gap-2"><div className="min-w-0 flex-1 space-y-1.5"><Label htmlFor={`judul-${item.id}`} className="text-[11px]">Judul luaran atau publikasi</Label><Input id={`judul-${item.id}`} value={item.judul} disabled={disabled} placeholder="Judul luaran atau publikasi" onChange={(event) => update(item.id, { judul: event.target.value })} /></div><Button type="button" size="icon" variant="ghost" disabled={disabled} onClick={() => onChange({ ...value, luaran: value.luaran.filter((entry) => entry.id !== item.id) })} aria-label={`Hapus luaran ${item.judul || 'baru'}`}><Trash2 className="h-4 w-4" /></Button></div><div className="grid gap-3 md:grid-cols-3"><div className="space-y-1.5"><Label htmlFor={`kategori-${item.id}`} className="text-[11px]">Kategori</Label><select id={`kategori-${item.id}`} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50" disabled={disabled} value={item.kategori} onChange={(event) => update(item.id, { kategori: event.target.value as LuaranItem['kategori'] })}><option value="Penelitian">Penelitian</option><option value="PKM">PKM</option></select></div><div className="space-y-1.5"><Label htmlFor={`tahun-${item.id}`} className="text-[11px]">Tahun</Label><Input id={`tahun-${item.id}`} value={item.tahun} disabled={disabled} inputMode="numeric" placeholder="2026" onChange={(event) => update(item.id, { tahun: event.target.value })} /></div><div className="space-y-1.5"><Label htmlFor={`pendanaan-${item.id}`} className="text-[11px]">Sumber pendanaan</Label><select id={`pendanaan-${item.id}`} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50" disabled={disabled} value={item.sumberPendanaan} onChange={(event) => update(item.id, { sumberPendanaan: event.target.value as SumberPendanaan })}>{SUMBER_PENDANAAN_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select></div></div><div className="space-y-1.5"><Label htmlFor={`publikasi-${item.id}`} className="text-[11px]">Jenis publikasi</Label><select id={`publikasi-${item.id}`} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50" disabled={disabled} value={item.jenisPublikasi} onChange={(event) => update(item.id, { jenisPublikasi: event.target.value as JenisPublikasi })}>{publicationOptions.map((option) => <option key={option}>{option}</option>)}</select></div></div>)}{value.luaran.length === 0 && <Empty>Belum ada luaran penelitian atau PKM.</Empty>}</div></Panel>;
}

type EwmpDraft = WaktuMengajarItem & { originalTahunAkademik?: string };

function toEwmpDraft(value: WaktuMengajarItem): EwmpDraft {
  return { ...value, originalTahunAkademik: value.tahunAkademik };
}

function EwmpEditor({ records, identity, onApplied }: { records: WaktuMengajarItem[]; identity: { nidn: string; nama: string }; onApplied: (data: DosenSelfData) => void }) {
  const { toast } = useToast();
  const [items, setItems] = useState<EwmpDraft[]>(() => records.map(toEwmpDraft));
  const [openItems, setOpenItems] = useState<string[]>(() => records[0]?.tahunAkademik ? [records[0].tahunAkademik] : []);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setItems(records.map(toEwmpDraft));
    setOpenItems(records[0]?.tahunAkademik ? [records[0].tahunAkademik] : []);
  }, [records]);

  const dirty = useMemo(() => JSON.stringify(items.map(({ originalTahunAkademik: _original, ...item }) => item)) !== JSON.stringify(records), [items, records]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const update = (index: number, patch: Partial<WaktuMengajarItem>) => {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
    setError('');
  };

  const add = () => {
    if (items.some((item) => !item.originalTahunAkademik)) {
      setError('Selesaikan atau hapus data EWMP baru terlebih dahulu.');
      return;
    }
    const suggestedYear = items.some((item) => item.tahunAkademik === currentAcademicYear()) ? '' : currentAcademicYear();
    setError('');
    setItems([{ nidn: identity.nidn, nama: identity.nama, tahunAkademik: suggestedYear, sksPendidikanPS: 0, sksPendidikanPSLain: 0, sksPendidikanPTLain: 0, sksPenelitian: 0, sksPengabdian: 0, sksTugasTambahan: 0 }, ...items]);
    setOpenItems((current) => ['new', ...current.filter((value) => value !== 'new')]);
  };

  const save = async (item: EwmpDraft, index: number) => {
    if (!validAcademicYear(item.tahunAkademik)) {
      setError('Tahun akademik harus berformat YYYY/YYYY dan tahun kedua harus berurutan.');
      return;
    }
    const duplicate = items.some((entry, itemIndex) => itemIndex !== index && entry.tahunAkademik === item.tahunAkademik);
    if (duplicate) {
      setError('Tahun akademik tidak boleh duplikat.');
      return;
    }
    const key = item.tahunAkademik || String(index);
    setSavingKey(key);
    setError('');
    const { originalTahunAkademik: _original, ...payload } = item;
    const response = await saveOwnDosenSection('waktu_mengajar', payload);
    setSavingKey(null);
    if (!response.success || !response.data) {
      setError(response.error || 'EWMP gagal disimpan.');
      return;
    }
    setOpenItems([item.tahunAkademik]);
    onApplied(response.data);
    toast({ title: 'EWMP tersimpan', description: `Beban kerja ${item.tahunAkademik} berhasil diperbarui.` });
  };

  const remove = async (item: EwmpDraft, index: number) => {
    if (!item.originalTahunAkademik) {
      setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
      setOpenItems((current) => current.filter((value) => value !== 'new'));
      return;
    }
    if (!window.confirm(`Hapus EWMP ${item.originalTahunAkademik}?`)) return;
    const key = item.tahunAkademik || String(index);
    setSavingKey(key);
    setError('');
    const response = await deleteOwnDosenEwmp(item.originalTahunAkademik);
    setSavingKey(null);
    if (!response.success || !response.data) {
      setError(response.error || 'EWMP gagal dihapus.');
      return;
    }
    onApplied(response.data);
    toast({ title: 'EWMP dihapus' });
  };

  return (
    <div className="space-y-4">
      {error && <ErrorBox message={error} />}
      {dirty && <UnsavedChangesNotice />}
      <div className="flex justify-end">
        <Button disabled={savingKey !== null} onClick={add}>
          <Plus className="mr-2 h-4 w-4" />Tambah Tahun Akademik
        </Button>
      </div>

      {items.length > 0 ? (
        <Accordion type="multiple" value={openItems} onValueChange={setOpenItems} className="space-y-3">
          {items.map((item, index) => {
            const total = calculateTotalSks(item);
            const busy = savingKey !== null;
            const rowBusy = savingKey === (item.tahunAkademik || String(index));
            const itemValue = item.originalTahunAkademik || 'new';
            return (
              <AccordionItem key={`${itemValue}-${index}`} value={itemValue} className="overflow-hidden rounded-2xl border border-border/75 bg-card shadow-soft">
                <div className="flex items-center gap-2 px-5">
                  <AccordionTrigger className="min-w-0 py-4 text-left hover:no-underline">
                    <span className="min-w-0">
                      <span className="block text-sm font-bold">Tahun Akademik {item.tahunAkademik || 'Baru'}</span>
                      <span className="mt-1 block text-[11px] font-normal text-muted-foreground">
                        Total {total} SKS, rata-rata {calculateAvgSks(item)} SKS per semester
                      </span>
                    </span>
                  </AccordionTrigger>
                  <div className="flex shrink-0 gap-1.5">
                    <Button variant="ghost" size="icon" disabled={busy} onClick={() => void remove(item, index)} aria-label={`Hapus EWMP ${item.tahunAkademik || 'baru'}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" disabled={busy} onClick={() => void save(item, index)}>
                      {rowBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      <span className="hidden sm:inline">Simpan</span>
                    </Button>
                  </div>
                </div>
                <AccordionContent className="border-t border-border/70 px-5 pb-5 pt-5">
                  <div className="mb-5 max-w-xs space-y-2">
                    <Label htmlFor={`tahun-akademik-${index}`}>Tahun Akademik</Label>
                    <Input
                      id={`tahun-akademik-${index}`}
                      className="font-mono"
                      value={item.tahunAkademik || ''}
                      disabled={busy || Boolean(item.originalTahunAkademik)}
                      placeholder="2025/2026"
                      onChange={(event) => update(index, { tahunAkademik: event.target.value })}
                    />
                    {item.originalTahunAkademik && <p className="text-[11px] text-muted-foreground">Tahun menjadi identitas periode. Hapus lalu tambah periode jika tahunnya salah.</p>}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {([
                      ['sksPendidikanPS', 'Pendidikan PS ABT'],
                      ['sksPendidikanPSLain', 'Pendidikan PS lain'],
                      ['sksPendidikanPTLain', 'Pendidikan PT lain'],
                      ['sksPenelitian', 'Penelitian'],
                      ['sksPengabdian', 'Pengabdian / PKM'],
                      ['sksTugasTambahan', 'Tugas tambahan'],
                    ] as const).map(([field, label]) => (
                      <div key={field} className="space-y-2">
                        <Label htmlFor={`${field}-${index}`} className="text-xs">{label}</Label>
                        <Input
                          id={`${field}-${index}`}
                          type="number"
                          min={0}
                          step={0.5}
                          disabled={busy}
                          value={item[field]}
                          onChange={(event) => update(index, { [field]: Math.max(0, Number.parseFloat(event.target.value) || 0) })}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 grid gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:grid-cols-3">
                    <Metric label="Subtotal Pendidikan" value={`${calculatePendidikanTotal(item)} SKS`} />
                    <Metric label="Total Beban" value={`${total} SKS`} />
                    <Metric label="Rata-rata / Semester" value={`${calculateAvgSks(item)} SKS`} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      ) : (
        <Empty>Belum ada data EWMP. Tambahkan tahun akademik pertama.</Empty>
      )}
    </div>
  );
}

function Metric({label,value}:{label:string;value:string}){return <div><p className="text-[11px] text-muted-foreground">{label}</p><p className="mt-1 text-lg font-bold text-primary">{value}</p></div>;}
