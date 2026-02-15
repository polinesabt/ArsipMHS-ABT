/**
 * Validasi Page - Unified Login for Admin and Students
 * 
 * Single login page that detects user role and redirects accordingly:
 * - Admin → /admin
 * - Student → /dashboard
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAlumni } from '@/contexts/AlumniContext';
import { LogIn, Eye, EyeOff, AlertCircle, Shield, CheckCircle2, HelpCircle, GraduationCap, UserCog, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

type LoginMode = 'student' | 'admin';

export default function ValidasiPage() {
  const navigate = useNavigate();
  const { loginWithCredentials, loginAsAdmin, loggedInStudent, loggedInAdmin } = useAlumni();
  
  const [mode, setMode] = useState<LoginMode>('student');
  const [identifier, setIdentifier] = useState(''); // NIM for student, username for admin
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState<'student' | 'admin'>('student');

  // If already logged in, redirect using useEffect
  useEffect(() => {
    const hasToken = Boolean(localStorage.getItem('authToken'));
    if (hasToken && loggedInAdmin) {
      navigate('/admin', { replace: true });
    } else if (hasToken && loggedInStudent) {
      navigate('/dashboard', { replace: true });
    }
  }, [loggedInAdmin, loggedInStudent, navigate]);

  const handleLogin = async () => {
    // Reset error
    setError('');
    
    // Validation
    if (!identifier.trim()) {
      setError(mode === 'student' ? 'NIM wajib diisi' : 'Username wajib diisi');
      return;
    }
    
    if (!password) {
      setError('Password wajib diisi');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (mode === 'admin') {
        const result = await loginAsAdmin(identifier.trim(), password);
        
        if (result.success) {
          setLoginSuccess(true);
          setRedirectTarget('admin');
          setTimeout(() => {
            navigate('/admin');
          }, 1000);
        } else {
          setError(result.error || 'Login gagal');
        }
      } else {
        const result = await loginWithCredentials(identifier.trim(), password);
        
        if (result.success) {
          setLoginSuccess(true);
          setRedirectTarget('student');
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
        } else {
          setError(result.error || 'Login gagal');
        }
      }
    } catch (err) {
      setError('Terjadi kesalahan sistem. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };

  const handleModeChange = (newMode: string) => {
    setMode(newMode as LoginMode);
    setIdentifier('');
    setPassword('');
    setError('');
  };

  const handleContactAdmin = () => {
    alert('Silakan hubungi admin melalui email: prodi-abt@polines.ac.id');
  };

  // Success state
  if (loginSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <div className="glass-card rounded-2xl p-8 text-center animate-scale-in">
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
        <div className="container mx-auto px-4">
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
            <div className="glass-card rounded-2xl p-6 md:p-8 animate-fade-up">
              {/* Role Tabs */}
              <Tabs value={mode} onValueChange={handleModeChange} className="mb-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="student" className="gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Mahasiswa
                  </TabsTrigger>
                  <TabsTrigger value="admin" className="gap-2">
                    <UserCog className="w-4 h-4" />
                    Admin
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <LogIn className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">
                    {mode === 'student' ? 'Login Mahasiswa' : 'Login Admin'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {mode === 'student' ? 'Gunakan NIM sebagai username' : 'Masukkan kredensial admin'}
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Identifier Input */}
                <div>
                  <Label htmlFor="identifier" className="text-foreground font-medium mb-2 block">
                    {mode === 'student' ? 'NIM (Username)' : 'Username'}
                  </Label>
                  <Input
                    id="identifier"
                    placeholder={mode === 'student' ? 'Masukkan NIM Anda (contoh: 4.51.23.0.17)' : 'Masukkan username admin'}
                    value={identifier}
                    onChange={(e) => {
                      if (mode === 'student') {
                        const raw = e.target.value;
                        const value = raw.replace(/[^0-9.]/g, '').slice(0, 20);
                        setIdentifier(value);
                      } else {
                        setIdentifier(e.target.value);
                      }
                      setError('');
                    }}
                    onKeyDown={handleKeyDown}
                    className="h-12 rounded-xl"
                    disabled={isLoading}
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

                {/* Help Section (only for students) */}
                {mode === 'student' && (
                  <div className="pt-4 border-t border-border">
                    <button
                      onClick={handleContactAdmin}
                      className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                    >
                      <HelpCircle className="w-4 h-4" />
                      Lupa password atau belum punya akun?
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Demo Info */}
            <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-sm text-center text-muted-foreground">
                {mode === 'student' ? (
                  <>
                    <span className="font-medium text-foreground">Demo Mahasiswa:</span> NIM <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">20210001</code> password <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">password123</code>
                  </>
                ) : (
                  <>
                    <span className="font-medium text-foreground">Demo Admin:</span> Username <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">admin</code> password <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">admin123</code>
                  </>
                )}
              </p>
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
