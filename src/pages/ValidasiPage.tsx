/**
 * Validasi Page - Login satu form untuk Admin dan Mahasiswa
 *
 * Satu form: Username atau NIM (huruf/angka, case-insensitive) + Password.
 * Redirect: Admin → /admin, Mahasiswa → /dashboard.
 */

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAlumni } from '@/contexts/AlumniContext';
import { useEmailLoginActivation } from '@/hooks/use-email-login-activation';
import { LogIn, Eye, EyeOff, AlertCircle, Shield, CheckCircle2, HelpCircle, ArrowLeft } from 'lucide-react';

export default function ValidasiPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loggedInStudent, loggedInAdmin } = useAlumni();
  const { verifyToken, isVerifying } = useEmailLoginActivation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState<'student' | 'admin'>('student');

  useEffect(() => {
    const hasToken = Boolean(localStorage.getItem('authToken'));
    if (hasToken && loggedInAdmin) {
      navigate('/admin', { replace: true });
    } else if (hasToken && loggedInStudent) {
      navigate('/dashboard', { replace: true });
    }
  }, [loggedInAdmin, loggedInStudent, navigate]);

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
      setError('Username, NIM, atau email wajib diisi');
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
          navigate(result.role === 'admin' ? '/admin' : '/dashboard');
        }, 1000);
      } else {
        setError(result.error || 'Username/NIM/email atau password salah');
      }
    } catch {
      setError('Terjadi kesalahan sistem. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) handleLogin();
  };

  const handleContactAdmin = () => {
    alert('Silakan hubungi admin melalui email: prodi-abt@polines.ac.id');
  };

  // Success state
  if (loginSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="max-w-md mx-auto">
              <div className="glass-card rounded-2xl p-6 text-center animate-scale-in sm:p-8">
                <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-success" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Login Berhasil!
                </h2>
                <p className="text-muted-foreground mb-4">
                  Mengarahkan ke {redirectTarget === 'admin' ? 'Dashboard Admin' : 'Dashboard Anda'}...
                </p>
                <div className="w-32 h-1 bg-muted rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-primary animate-shimmer" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-3">
                Masuk ke ARSIP MAHASISWA ABT
              </h1>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Sistem Arsip Digital Data Mahasiswa & Alumni ABT Polines
              </p>
            </div>

            {/* Login Form */}
            <div className="glass-card rounded-2xl p-5 md:p-8 animate-fade-up sm:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <LogIn className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Masuk</h2>
                  <p className="text-sm text-muted-foreground">
                    Gunakan username, NIM, atau email login terverifikasi beserta password Anda
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {isVerifying && (
                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-sm text-primary">
                    Memverifikasi email login...
                  </div>
                )}
                {verificationMessage && (
                  <div className="p-3 rounded-xl bg-success/10 border border-success/20 text-sm text-success">
                    {verificationMessage}
                  </div>
                )}
                {verificationError && (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                    {verificationError}
                  </div>
                )}
                <div>
                  <Label htmlFor="identifier" className="text-foreground font-medium mb-2 block">
                    Username / NIM / Email
                  </Label>
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="Masukkan username, NIM, atau email"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      setError('');
                    }}
                    onKeyDown={handleKeyDown}
                    className="h-12 rounded-xl"
                    disabled={isLoading}
                    autoComplete="username"
                  />
                </div>

                {/* Password Input */}
                <div>
                  <Label htmlFor="password" className="text-foreground font-medium mb-2 block">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Masukkan password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      onKeyDown={handleKeyDown}
                      className="h-12 rounded-xl pr-12"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3 animate-fade-up">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-destructive">{error}</p>
                    </div>
                  </div>
                )}

                {/* Login Button */}
                <Button
                  onClick={handleLogin}
                  disabled={isLoading || !identifier.trim() || !password}
                  className="w-full h-12"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      Masuk
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="w-full h-12"
                  size="lg"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Kembali ke Home
                </Button>

                <div className="pt-4 border-t border-border">
                  <button
                    onClick={handleContactAdmin}
                    className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Lupa password atau belum punya akun?
                  </button>
                </div>
              </div>
            </div>

            {/* Back to Home */}
            <div className="mt-4 text-center">
              <Button variant="ghost" onClick={() => navigate('/')} className="text-muted-foreground">
                ← Kembali ke Beranda
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
