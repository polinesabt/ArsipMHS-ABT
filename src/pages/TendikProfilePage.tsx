import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, BriefcaseBusiness, GraduationCap, IdCard, Loader2, Plus, Save, Trash2, UserRound, X, Pencil, Award } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAlumni } from '@/contexts/AlumniContext';
import { getOwnTendikProfile, updateOwnTendikProfile } from '@/services/tendik.service';
import type { TendikProfile } from '@/types/student.types';
import { DirectSaveNotice, PortalFormSection, PortalPageHeader, UnsavedChangesNotice } from '@/components/staff/PortalPageHeader';
import { StaffProfileSummary } from '@/components/staff/StaffProfileSummary';

export default function TendikProfilePage() {
  const location = useLocation();
  const { loggedInTendik, mergeLoggedInTendik } = useAlumni();
  const { toast } = useToast();
  const [saved, setSaved] = useState<TendikProfile | null>(loggedInTendik);
  const [draft, setDraft] = useState<TendikProfile | null>(loggedInTendik);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getOwnTendikProfile().then((response) => {
      if (!active) return;
      if (response.success && response.data) {
        setSaved(response.data);
        setDraft(response.data);
        mergeLoggedInTendik(response.data);
      } else {
        setError(response.error || 'Profil tendik gagal dimuat.');
      }
      setIsLoading(false);
    });
    return () => { active = false; };
  }, [mergeLoggedInTendik]);

  const dirty = useMemo(() => JSON.stringify(saved) !== JSON.stringify(draft), [saved, draft]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  useEffect(() => {
    if (isLoading) return;
    const sectionId = location.hash.replace(/^#/, '') || 'profil';
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isLoading, location.hash]);

  const setField = <K extends keyof TendikProfile>(key: K, value: TendikProfile[K]) => {
    setDraft((current) => current ? { ...current, [key]: value } : current);
    setError('');
  };

  const save = async () => {
    if (!draft) return;
    if (!draft.nama.trim() || !draft.nip.trim() || !draft.jabatan.trim()) {
      setError('Nama, NIP/NITK, dan jabatan wajib diisi.');
      return;
    }
    if (saved && draft.nip !== saved.nip && !window.confirm('Username login akan mengikuti NIP/NITK baru. Password tetap sama. Lanjutkan?')) return;
    setIsSaving(true);
    setError('');
    const response = await updateOwnTendikProfile(draft);
    setIsSaving(false);
    if (!response.success || !response.data) {
      setError(response.error || 'Profil gagal disimpan.');
      return;
    }
    setSaved(response.data.profile);
    setDraft(response.data.profile);
    mergeLoggedInTendik(response.data.profile);
    setIsEditing(false);
    toast({
      title: 'Profil tendik tersimpan',
      description: response.data.nipChanged ? 'Username diperbarui dan password tetap sama.' : 'Perubahan langsung tersinkron ke pengelola program studi.',
    });
  };

  if (isLoading) {
    return <div className="space-y-5"><Skeleton className="h-28 rounded-2xl" /><Skeleton className="h-[520px] rounded-2xl" /></div>;
  }
  if (!draft) {
    return <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">{error || 'Profil tidak tersedia.'}</div>;
  }

  const disabled = !isEditing || isSaving;

  return (
    <div className="pb-6">
      <PortalPageHeader
        title="Profil Tenaga Kependidikan"
        description="Kelola data kepegawaian, riwayat pendidikan, dan sertifikat kompetensi Anda."
        icon={UserRound}
        action={!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="rounded-lg active:translate-y-px"><Pencil className="mr-2 h-4 w-4" />Edit Profil</Button>
        ) : (
          <>
            <Button variant="outline" className="rounded-lg active:translate-y-px" disabled={isSaving} onClick={() => { setDraft(saved); setError(''); setIsEditing(false); }}><X className="mr-2 h-4 w-4" />Batal</Button>
            <Button className="rounded-lg active:translate-y-px" disabled={!dirty || isSaving} onClick={() => void save()}>{isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Simpan</Button>
          </>
        )}
      >
        {!isEditing && <DirectSaveNotice>Profil ini hanya dapat dilihat dan diubah oleh akun Anda serta pengelola program studi.</DirectSaveNotice>}
        {isEditing && dirty && <UnsavedChangesNotice />}
      </PortalPageHeader>

      <StaffProfileSummary
        name={draft.nama}
        identityLabel="NIP/NITK"
        identityValue={draft.nip}
        roleLabel={`${draft.jabatan}, Tendik ${draft.status}`}
        contextLabel="Program Studi Administrasi Bisnis Terapan"
        detailTitle="Kualifikasi dan Kompetensi"
        detailDescription="Ringkasan pendidikan dan sertifikat yang tercatat pada profil Anda."
        facts={[
          { label: 'Pangkat / Golongan', value: draft.golongan },
          { label: 'Pendidikan Tertinggi', value: getHighestEducation(draft) },
          { label: 'Sertifikat Kompetensi', value: `${draft.sertifikatKompetensi.filter(Boolean).length} sertifikat` },
          { label: 'Status Kepegawaian', value: draft.status },
        ]}
      />

      {error && <div role="alert" className="mb-5 flex gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}

      <section className="overflow-hidden rounded-2xl border border-border/75 bg-card shadow-soft">
        <PortalFormSection id="profil" title="Data pribadi dan kepegawaian" description="Informasi utama yang digunakan untuk mengidentifikasi akun dan penempatan Anda.">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Nama lengkap" icon={UserRound}><Input value={draft.nama} disabled={disabled} onChange={(event) => setField('nama', event.target.value)} /></Field>
            <Field label="NIP/NITK" icon={IdCard}><Input className="font-mono" value={draft.nip} disabled={disabled} onChange={(event) => setField('nip', event.target.value)} /></Field>
            <Field label="Status tendik" icon={BriefcaseBusiness}>
              <select className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50" value={draft.status} disabled={disabled} onChange={(event) => setField('status', event.target.value as TendikProfile['status'])}>
                <option value="Tetap">Tetap</option>
                <option value="Tidak Tetap">Tidak Tetap</option>
              </select>
            </Field>
            <Field label="Jabatan" icon={BriefcaseBusiness}><Input value={draft.jabatan} disabled={disabled} onChange={(event) => setField('jabatan', event.target.value)} /></Field>
            <Field label="Pangkat / golongan ruang" icon={Award}><Input value={draft.golongan || ''} disabled={disabled} onChange={(event) => setField('golongan', event.target.value)} /></Field>
          </div>
        </PortalFormSection>

        <PortalFormSection id="kualifikasi" title="Riwayat pendidikan" description="Tuliskan program studi dan institusi pada jenjang pendidikan yang pernah ditempuh.">
          <div className="grid gap-4 md:grid-cols-2">
            {(['D3', 'S1', 'S2', 'S3'] as const).map((level) => {
              const key = `pendidikan${level}` as const;
              return <Field key={level} label={`Pendidikan ${level}`} icon={GraduationCap}><Input value={draft[key] || ''} disabled={disabled} placeholder={`Program pendidikan ${level} atau -`} onChange={(event) => setField(key, event.target.value)} /></Field>;
            })}
          </div>
        </PortalFormSection>

        <PortalFormSection id="kompetensi" title="Sertifikat kompetensi" description="Tambahkan sertifikat profesi atau kompetensi yang masih relevan dengan tugas Anda.">
          <div className="space-y-3">
            {draft.sertifikatKompetensi.map((certificate, index) => (
              <div key={index} className="flex gap-2 rounded-xl border border-border/70 bg-background/60 p-3">
                <Input value={certificate} disabled={disabled} placeholder="Nama sertifikat kompetensi" onChange={(event) => setField('sertifikatKompetensi', draft.sertifikatKompetensi.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} />
                {isEditing && <Button type="button" variant="ghost" size="icon" disabled={isSaving} onClick={() => setField('sertifikatKompetensi', draft.sertifikatKompetensi.filter((_, itemIndex) => itemIndex !== index))} aria-label="Hapus sertifikat"><Trash2 className="h-4 w-4" /></Button>}
              </div>
            ))}
            {draft.sertifikatKompetensi.length === 0 && <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">Belum ada sertifikat kompetensi.</div>}
            {isEditing && <Button type="button" size="sm" variant="outline" disabled={isSaving} onClick={() => setField('sertifikatKompetensi', [...draft.sertifikatKompetensi, ''])}><Plus className="mr-2 h-4 w-4" />Tambah Sertifikat</Button>}
          </div>
        </PortalFormSection>
      </section>
    </div>
  );
}

function getHighestEducation(profile: TendikProfile): string {
  const levels = [
    ['S3', profile.pendidikanS3],
    ['S2', profile.pendidikanS2],
    ['S1', profile.pendidikanS1],
    ['D3', profile.pendidikanD3],
  ] as const;
  const highest = levels.find(([, value]) => value?.trim());
  return highest ? `${highest[0]}: ${highest[1]}` : '-';
}

function Field({ label, icon: Icon, children }: { label: string; icon: typeof UserRound; children: React.ReactNode }) {
  return <div className="space-y-2"><Label className="flex items-center gap-2 text-xs font-semibold"><Icon className="h-4 w-4 text-primary" />{label}</Label>{children}</div>;
}
