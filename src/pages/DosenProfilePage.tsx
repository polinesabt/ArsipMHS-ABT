import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Award, BriefcaseBusiness, Building2, GraduationCap, IdCard, Loader2, Mail, Pencil, Phone, Save, ShieldCheck, UserRound, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAlumni } from '@/contexts/AlumniContext';
import { getOwnDosenProfile, updateOwnDosenProfile } from '@/services/dosen.service';
import type { DosenProfile } from '@/types/student.types';
import { DirectSaveNotice, PortalFormSection, PortalPageHeader, UnsavedChangesNotice } from '@/components/staff/PortalPageHeader';
import { StaffProfileSummary } from '@/components/staff/StaffProfileSummary';

const QUALIFICATIONS = ['Magister (S2)','Doktor (S3)','Magister Terapan (S2 Terapan)','Doktor Terapan (S3 Terapan)','Spesialis (Sp-1)'];

export default function DosenProfilePage() {
  const { loggedInDosen, mergeLoggedInDosen } = useAlumni();
  const { toast } = useToast();
  const [profile, setProfile] = useState<DosenProfile | null>(loggedInDosen);
  const [draft, setDraft] = useState<DosenProfile | null>(loggedInDosen);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [confirmNidn, setConfirmNidn] = useState(false);

  useEffect(() => {
    let active = true;
    getOwnDosenProfile().then((response) => {
      if (!active) return;
      if (response.success && response.data) {
        setProfile(response.data);
        setDraft(response.data);
        mergeLoggedInDosen(response.data);
      } else {
        setError(response.error || 'Profil dosen gagal dimuat.');
      }
      setIsLoading(false);
    });
    return () => { active = false; };
  }, [mergeLoggedInDosen]);

  const dirty = useMemo(() => JSON.stringify(profile) !== JSON.stringify(draft), [profile, draft]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const setField = <K extends keyof DosenProfile>(key: K, value: DosenProfile[K]) => {
    setDraft((current) => current ? { ...current, [key]: value } : current);
    setError('');
  };

  const toggleQualification = (value: string) => {
    if (!draft) return;
    const exists = draft.pendidikanPascaSarjana.includes(value);
    setField('pendidikanPascaSarjana', exists ? draft.pendidikanPascaSarjana.filter((item) => item !== value) : [...draft.pendidikanPascaSarjana, value]);
  };

  const validate = (): boolean => {
    if (!draft?.nama.trim() || !draft.nidn.trim() || !draft.jabatan.trim() || !draft.institusi.trim()) {
      setError('Nama, NIDN/NIDK, jabatan, dan institusi wajib diisi.');
      return false;
    }
    return true;
  };

  const requestSave = () => {
    if (!validate() || !draft || !profile) return;
    if (draft.nidn !== profile.nidn) setConfirmNidn(true);
    else void saveProfile();
  };

  const saveProfile = async () => {
    if (!draft) return;
    setConfirmNidn(false);
    setIsSaving(true);
    setError('');
    const response = await updateOwnDosenProfile(draft);
    setIsSaving(false);
    if (!response.success || !response.data) {
      setError(response.error || 'Profil gagal disimpan.');
      return;
    }
    setProfile(response.data.profile);
    setDraft(response.data.profile);
    mergeLoggedInDosen(response.data.profile);
    setIsEditing(false);
    toast({ title: 'Profil tersimpan', description: response.data.nidnChanged ? 'NIDN/NIDK dan username akun diperbarui. Password Anda tetap sama.' : 'Perubahan profil langsung tersinkron ke dashboard admin.' });
  };

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-24 rounded-2xl" /><Skeleton className="h-[520px] rounded-2xl" /></div>;
  }

  if (!draft) {
    return <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive"><AlertCircle className="mb-3 h-6 w-6" />{error || 'Profil dosen tidak tersedia.'}</div>;
  }

  return (
    <div className="pb-6">
      <PortalPageHeader
        title="Profil Dosen"
        description="Kelola identitas, penempatan, kualifikasi, dan kompetensi yang digunakan pada seluruh modul dosen."
        icon={UserRound}
        action={!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="rounded-lg active:translate-y-px"><Pencil className="mr-2 h-4 w-4" />Edit Profil</Button>
        ) : (
          <>
            <Button variant="outline" onClick={() => { setDraft(profile); setIsEditing(false); setError(''); }} disabled={isSaving} className="rounded-lg active:translate-y-px"><X className="mr-2 h-4 w-4" />Batal</Button>
            <Button onClick={requestSave} disabled={isSaving || !dirty} className="rounded-lg active:translate-y-px">{isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Simpan</Button>
          </>
        )}
      >
        {!isEditing && <DirectSaveNotice />}
        {isEditing && dirty && <UnsavedChangesNotice />}
      </PortalPageHeader>

      <StaffProfileSummary
        name={draft.nama}
        identityLabel="NIDN/NIDK"
        identityValue={draft.nidn}
        roleLabel={`${draft.jabatan}, Dosen ${draft.statusDosen}`}
        contextLabel={draft.institusi}
        detailTitle="Kualifikasi dan Kompetensi"
        detailDescription="Ringkasan data akademik utama yang tercatat pada profil Anda."
        facts={[
          { label: 'Peran', value: draft.peran || 'Akademisi' },
          { label: 'Pendidikan Pascasarjana', value: draft.pendidikanPascaSarjana.join(', ') || '-' },
          { label: 'Bidang Keahlian', value: draft.bidangKeahlian },
          { label: 'Sertifikat Pendidik', value: draft.sertifikatPendidik },
        ]}
      />

      {error && <div role="alert" className="mb-5 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}

      <section className="overflow-hidden rounded-2xl border border-border/75 bg-card shadow-soft">
        <PortalFormSection title="Data pribadi dan kepegawaian" description="Informasi utama yang menjadi identitas Anda pada portal.">
          <div className="grid gap-5 md:grid-cols-2">
            <Field icon={UserRound} label="Nama lengkap dengan gelar"><Input value={draft.nama} onChange={(e) => setField('nama', e.target.value)} disabled={!isEditing || isSaving} /></Field>
            <Field icon={IdCard} label="NIDN/NIDK"><Input value={draft.nidn} onChange={(e) => setField('nidn', e.target.value)} disabled={!isEditing || isSaving} className="font-mono" /></Field>
            <Field icon={ShieldCheck} label="Status dosen"><Select value={draft.statusDosen} onValueChange={(value) => setField('statusDosen', value as DosenProfile['statusDosen'])} disabled={!isEditing || isSaving}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Tetap">Tetap</SelectItem><SelectItem value="Tidak Tetap">Tidak Tetap</SelectItem></SelectContent></Select></Field>
            <Field icon={Award} label="Jabatan fungsional"><Input value={draft.jabatan} onChange={(e) => setField('jabatan', e.target.value)} disabled={!isEditing || isSaving} /></Field>
            <Field icon={BriefcaseBusiness} label="Peran / afiliasi"><Select value={draft.peran || 'Akademisi'} onValueChange={(value) => setField('peran', value as DosenProfile['peran'])} disabled={!isEditing || isSaving}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Akademisi">Akademisi</SelectItem><SelectItem value="Praktisi">Praktisi</SelectItem></SelectContent></Select></Field>
          </div>
        </PortalFormSection>

        <PortalFormSection title="Penempatan dan kontak" description="Kontak ini membantu pengelola menghubungi Anda ketika ada data yang perlu dikonfirmasi.">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2"><Field icon={Building2} label="Institusi"><Input value={draft.institusi} onChange={(e) => setField('institusi', e.target.value)} disabled={!isEditing || isSaving} /></Field></div>
            <Field icon={Mail} label="Email resmi"><Input type="email" value={draft.email || ''} onChange={(e) => setField('email', e.target.value)} disabled={!isEditing || isSaving} /></Field>
            <Field icon={Phone} label="Nomor telepon / WhatsApp"><Input value={draft.telepon || ''} onChange={(e) => setField('telepon', e.target.value)} disabled={!isEditing || isSaving} /></Field>
          </div>
        </PortalFormSection>

        <PortalFormSection title="Kualifikasi dan kompetensi" description="Lengkapi pendidikan pascasarjana dan sertifikasi yang masih relevan.">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2 space-y-3"><Label className="flex items-center gap-2 text-xs font-semibold"><GraduationCap className="h-4 w-4 text-primary" />Kualifikasi Pascasarjana</Label><div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{QUALIFICATIONS.map((item) => <label key={item} className="flex items-center gap-2 rounded-xl border border-border/70 bg-background/60 p-3 text-xs transition-colors hover:border-primary/30"><Checkbox checked={draft.pendidikanPascaSarjana.includes(item)} onCheckedChange={() => toggleQualification(item)} disabled={!isEditing || isSaving} /><span>{item}</span></label>)}</div></div>
            <Field icon={GraduationCap} label="Bidang keahlian"><Input value={draft.bidangKeahlian} onChange={(e) => setField('bidangKeahlian', e.target.value)} disabled={!isEditing || isSaving} /></Field>
            <Field icon={Award} label="Sertifikat Pendidik (Serdos)"><Input value={draft.sertifikatPendidik} onChange={(e) => setField('sertifikatPendidik', e.target.value)} disabled={!isEditing || isSaving} /></Field>
            <div className="md:col-span-2"><Field icon={Award} label="Sertifikat Kompetensi"><Input value={draft.sertifikatKompetensi} onChange={(e) => setField('sertifikatKompetensi', e.target.value)} disabled={!isEditing || isSaving} /></Field></div>
          </div>
        </PortalFormSection>
      </section>

      <AlertDialog open={confirmNidn} onOpenChange={setConfirmNidn}>
        <AlertDialogContent className="rounded-2xl"><AlertDialogHeader><AlertDialogTitle>Ubah identitas login dosen?</AlertDialogTitle><AlertDialogDescription>NIDN/NIDK akan berubah dari <span className="font-mono font-semibold">{profile?.nidn}</span> menjadi <span className="font-mono font-semibold">{draft.nidn}</span>. Username ikut berubah, password tetap sama, dan sesi aktif diperbarui otomatis.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={isSaving}>Tidak, kembali</AlertDialogCancel><AlertDialogAction onClick={() => void saveProfile()} disabled={isSaving}>Ya, ubah identitas</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Field({ icon: Icon, label, children }: { icon: typeof UserRound; label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label className="flex items-center gap-2 text-xs font-semibold"><Icon className="h-4 w-4 text-primary" />{label}</Label>{children}</div>;
}
