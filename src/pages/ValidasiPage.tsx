/**
 * Halaman login tunggal untuk seluruh role aplikasi.
 * Sistem mengenali role dari akun dan mengarahkan pengguna ke portal yang sesuai.
 */

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAlumni } from '@/contexts/AlumniContext';
import { useEmailLoginActivation } from '@/hooks/use-email-login-activation';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  HelpCircle,
  Loader2,
  LogIn,
  Shield,
} from 'lucide-react';

type RedirectTarget = 'student' | 'admin' | 'developer' | 'dosen' | 'tendik' | 'demo';

function getRedirectLabel(target: RedirectTarget): string {
  if (target === 'demo') return 'Mode Demo — Pilih Dashboard';
  if (target === 'admin') return 'Dashboard Admin';
  if (target === 'developer') return 'Dashboard Developer';
  if (target === 'dosen') return 'Portal Dosen';
  if (target === 'tendik') return 'Portal Tendik';
  return 'Dashboard Mahasiswa';
}

export default function ValidasiPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    login,
    loggedInStudent,
    loggedInAdmin,
    loggedInDeveloper,
    loggedInDosen,
    loggedInTendik,
    loggedInDemo,
  } = useAlumni();
  const { verifyToken, isVerifying } = useEmailLoginActivation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState<RedirectTarget>('student');

  useEffect(() => {
    const hasToken = Boolean(localStorage.getItem('authToken'));
    if (hasToken && loggedInDemo) {
      navigate('/admin/select-dashboard', { replace: true });
    } else if (hasToken && loggedInTendik) {
      navigate('/tendik/profil', { replace: true });
    } else if (hasToken && loggedInDosen) {
      navigate('/dosen/profil', { replace: true });
    } else if (hasToken && loggedInDeveloper) {
      navigate('/developer/dashboard', { replace: true });
    } else if (hasToken && loggedInAdmin) {
      navigate('/admin/select-dashboard', { replace: true });
    } else if (hasToken && loggedInStudent) {
      navigate('/student/dashboard', { replace: true });
    }
  }, [loggedInAdmin, loggedInDeveloper, loggedInDosen, loggedInTendik, loggedInStudent, loggedInDemo, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('email_verify_token');
    if (!token) return;

    let cancelled = false;
    const runVerification = async () => {
      setVerificationMessage('');
      setVerificationError('');
      const response = await verifyToken(token);
      if (cancelled) return;

      if (response.success) {
        setVerificationMessage(response.message || 'Email berhasil diverifikasi. Anda dapat login dengan email.');
        params.delete('email_verify_token');
        const newSearch = params.toString();
        navigate(
          { pathname: location.pathname, search: newSearch ? `?${newSearch}` : '' },
          { replace: true }
        );
      } else {
        setVerificationError(response.error || 'Verifikasi email gagal. Silakan minta link baru dari dashboard.');
      }
    };

    void runVerification();
    return () => {
      cancelled = true;
    };
  }, [location.pathname, location.search, navigate, verifyToken]);

  const handleLogin = async () => {
    setError('');
    if (!identifier.trim()) {
      setError('Username, NIM, NIDN/NIDK, NIP, atau email wajib diisi');
      return;
    }
    if (!password) {
      setError('Password wajib diisi');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(identifier.trim(), password);
      if (result.success && result.role) {
        setLoginSuccess(true);
        setRedirectTarget(result.role);
        setTimeout(() => {
          if (result.role === 'demo') {
            navigate('/admin/select-dashboard');
          } else if (result.role === 'tendik') {
            navigate('/tendik/profil');
          } else if (result.role === 'dosen') {
            navigate('/dosen/profil');
          } else if (result.role === 'developer') {
            navigate('/developer/dashboard');
          } else if (result.role === 'admin') {
            navigate('/admin/select-dashboard');
          } else {
            navigate('/student/dashboard');
          }
        }, 1000);
      } else {
        setError(result.error || 'Identitas akun atau password salah');
      }
    } catch {
      setError('Terjadi kesalahan sistem. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !isLoading) void handleLogin();
  };

  const [showContactHelp, setShowContactHelp] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  const handleContactAdmin = () => {
    setShowContactHelp((prev) => !prev);
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('prodi-abt@polines.ac.id');
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  if (loginSuccess) {
    return (
      <div className="flex min-h-[100dvh] flex-col bg-background">
        <main className="flex flex-1 items-center justify-center px-3 py-10 sm:px-4 sm:py-16 lg:py-20">
          <div className="w-full max-w-md">
            <div className="glass-card rounded-2xl p-6 text-center animate-scale-in sm:p-8">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-foreground">Login Berhasil!</h1>
              <p className="mb-4 text-muted-foreground">
                Mengarahkan ke {getRedirectLabel(redirectTarget)}...
              </p>
              <div className="mx-auto h-1 w-32 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-full bg-primary animate-shimmer" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <main className="flex flex-1 items-center justify-center px-3 py-10 sm:px-4 sm:py-16 lg:py-20">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">
              Masuk ke ARSIP AKADEMIK ABT
            </h1>
            <p className="mx-auto max-w-sm text-muted-foreground">
              Sistem Arsip Digital Program Studi Administrasi Bisnis Terapan Polines
            </p>
          </div>

          <div className="glass-card rounded-2xl p-5 animate-fade-up sm:p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <LogIn className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Masuk</h2>
                <p className="text-sm text-muted-foreground">
                  Gunakan identitas akun dan password Anda
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {isVerifying && (
                <div className="rounded-xl border border-primary/20 bg-primary/10 p-3 text-sm text-primary">
                  Memverifikasi email login...
                </div>
              )}
              {verificationMessage && (
                <div className="rounded-xl border border-success/20 bg-success/10 p-3 text-sm text-success">
                  {verificationMessage}
                </div>
              )}
              {verificationError && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                  {verificationError}
                </div>
              )}

              <div>
                <Label htmlFor="identifier" className="mb-2 block font-medium text-foreground">
                  Username / NIM / NIDN / NIP / Email
                </Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="Masukkan identitas akun"
                  value={identifier}
                  onChange={(event) => {
                    setIdentifier(event.target.value);
                    setError('');
                  }}
                  onKeyDown={handleKeyDown}
                  className="h-12 rounded-xl"
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>

              <div>
                <Label htmlFor="password" className="mb-2 block font-medium text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError('');
                    }}
                    onKeyDown={handleKeyDown}
                    className="h-12 rounded-xl pr-12"
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    disabled={isLoading}
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 animate-fade-up" role="alert">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                  <p className="text-sm font-medium text-destructive">{error}</p>
                </div>
              )}

              <Button
                onClick={() => void handleLogin()}
                disabled={isLoading || !identifier.trim() || !password}
                className="h-12 w-full active:translate-y-px"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Masuk
                  </>
                )}
              </Button>

              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="h-12 w-full active:translate-y-px"
                size="lg"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Kembali ke Beranda
              </Button>

              <div className="border-t border-border pt-4">
                <button
                  type="button"
                  onClick={handleContactAdmin}
                  className="flex w-full items-center justify-center gap-2 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <HelpCircle className="h-4 w-4" />
                  Lupa password atau belum punya akun?
                </button>

                {showContactHelp && (
                  <div className="mt-3 rounded-xl border border-border/80 bg-muted/50 p-4 text-xs text-muted-foreground animate-fade-up">
                    <p className="font-semibold text-foreground mb-1">Bantuan Akun & Akses</p>
                    <p className="leading-relaxed mb-3">
                      Silakan hubungi administrator Program Studi ABT Politeknik Negeri Semarang:
                    </p>
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-background border border-border">
                      <span className="font-mono text-foreground select-all truncate text-[11px] sm:text-xs">
                        prodi-abt@polines.ac.id
                      </span>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleCopyEmail}
                        className="h-7 px-2.5 text-[11px] shrink-0 font-medium"
                      >
                        {emailCopied ? 'Tersalin!' : 'Salin'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
