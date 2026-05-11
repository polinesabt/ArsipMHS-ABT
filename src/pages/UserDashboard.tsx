import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAlumni } from '@/contexts/AlumniContext';
import { Award, Bell, LogOut, MailCheck, CheckCircle2, KeyRound, User, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  StudentIdentityHeader, 
  SummaryCard, 
  AchievementTimeline,
  AlumniStatusCard,
  CareerHistoryCard,
} from '@/components/dashboard';
import { getAchievementsFromAPI } from '@/repositories/api-student.repository';
import { mapApiAchievementToUi } from '@/lib/achievement-api-mapper';
import { Achievement, AchievementCategory } from '@/types/achievement.types';
import { hasCareerAccess, canEditAchievements } from '@/lib/role-utils';
import { toast } from '@/hooks/use-toast';
import { useEmailLoginActivation } from '@/hooks/use-email-login-activation';
import type { StudentStatus } from '@/types/student.types';
import type { StudentNotification } from '@/types/evaluation.types';
import {
  getStudentNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/repositories/notification.repository';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { selectedAlumni, loggedInStudent, logout, getAlumniDataByMasterId, mergeLoggedInStudent, resetStudentPassword } = useAlumni();
  const { requestVerification, isRequesting, verifyWithOtp, isVerifying } = useEmailLoginActivation();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState<Record<AchievementCategory, number>>({
    lomba: 0, seminar: 0, pagelaran: 0, publikasi: 0, haki: 0, luaran_penelitian: 0, magang: 0, portofolio: 0, produk_mahasiswa: 0, wirausaha: 0, pengembangan: 0, organisasi: 0
  });
  const [activationEmail, setActivationEmail] = useState('');
  const [activationInfo, setActivationInfo] = useState('');
  const [activationError, setActivationError] = useState('');
  const [activationDebugUrl, setActivationDebugUrl] = useState('');
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordModalError, setPasswordModalError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  /** True hanya sesaat setelah verifikasi berhasil; setelah refresh/login tampil panel info biasa */
  const [showCongratsMessage, setShowCongratsMessage] = useState(false);
  /** Panel Pengaturan Login Email: tampil saat tombol Akun diklik, sembunyikan dengan klik lagi */
  const [showAccountPanel, setShowAccountPanel] = useState(false);
  /** Sedang animasi buka (expand halus) */
  const [accountPanelOpen, setAccountPanelOpen] = useState(false);
  /** Sedang animasi tutup (terhisap ke tombol Akun) sebelum panel di-unmount */
  const [accountPanelClosing, setAccountPanelClosing] = useState(false);
  const accountPanelCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Panel "Login Email Opsional": animasi hisap setelah 4 detik */
  const [onboardingPanelClosing, setOnboardingPanelClosing] = useState(false);
  const onboardingPanelCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onboardingPanelIntroTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Tombol Akun disembunyikan selama intro; muncul 1s setelah panel terhisap */
  const [accountButtonRevealedAfterIntro, setAccountButtonRevealedAfterIntro] = useState(true);
  /** Baru saja muncul dari intro: tampil hijau + efek partikel keluar dari air */
  const [accountButtonJustRevealed, setAccountButtonJustRevealed] = useState(false);
  const accountButtonRevealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accountButtonJustRevealedEndRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const computeStats = (items: Achievement[]) => ({
    lomba: items.filter(a => a.category === 'lomba').length,
    seminar: items.filter(a => a.category === 'seminar').length,
    pagelaran: items.filter(a => a.category === 'pagelaran').length,
    publikasi: items.filter(a => a.category === 'publikasi').length,
    haki: items.filter(a => a.category === 'haki').length,
    luaran_penelitian: items.filter(a => a.category === 'luaran_penelitian').length,
    magang: items.filter(a => a.category === 'magang').length,
    portofolio: items.filter(a => a.category === 'portofolio').length,
    produk_mahasiswa: items.filter(a => a.category === 'produk_mahasiswa').length,
    wirausaha: items.filter(a => a.category === 'wirausaha').length,
    pengembangan: items.filter(a => a.category === 'pengembangan').length,
    organisasi: items.filter(a => a.category === 'organisasi').length,
  });

  useEffect(() => {
    if (!loggedInStudent && !selectedAlumni) {
      navigate('/validasi');
      return;
    }

    if (!selectedAlumni) return;

    getAchievementsFromAPI(selectedAlumni.id, { includeAttachments: true }).then((response) => {
      if (!response.success || !response.data) {
        setAchievements([]);
        setStats({
          lomba: 0, seminar: 0, pagelaran: 0, publikasi: 0, haki: 0, luaran_penelitian: 0, magang: 0, portofolio: 0, produk_mahasiswa: 0, wirausaha: 0, pengembangan: 0, organisasi: 0
        });
        return;
      }
      const list = Array.isArray(response.data) ? response.data : [];
      const mapped = list.map(mapApiAchievementToUi);
      setAchievements(mapped);
      setStats(computeStats(mapped));
    });
  }, [loggedInStudent, selectedAlumni, navigate]);

  const loadNotifications = async () => {
    const response = await getStudentNotifications();
    if (!response.success || !response.data) {
      return;
    }
    setNotifications(Array.isArray(response.data.items) ? response.data.items : []);
    setUnreadCount(typeof response.data.unread === 'number' ? response.data.unread : 0);
  };

  useEffect(() => {
    if (!loggedInStudent) return;

    void loadNotifications();
    const interval = window.setInterval(() => {
      void loadNotifications();
    }, 30000);

    return () => window.clearInterval(interval);
  }, [loggedInStudent]);

  useEffect(() => {
    if (!loggedInStudent) return;
    setActivationEmail(loggedInStudent.email || loggedInStudent.loginEmail || '');
  }, [loggedInStudent]);

  useEffect(() => {
    if (!loggedInStudent) return;
    const storageKey = `email-login-onboarding-dismissed:${loggedInStudent.id}`;
    setOnboardingDismissed(localStorage.getItem(storageKey) === '1');
  }, [loggedInStudent]);

  useEffect(() => {
    if (loggedInStudent?.pendingLoginEmail && !loggedInStudent?.isEmailLoginEnabled) {
      setShowOtpInput(true);
    }
  }, [loggedInStudent?.pendingLoginEmail, loggedInStudent?.isEmailLoginEnabled]);

  // 4 detik setelah tampilan "baru saja verifikasi", morph ke tampilan biasa
  useEffect(() => {
    if (!showCongratsMessage) return;
    const t = setTimeout(() => setShowCongratsMessage(false), 4000);
    return () => clearTimeout(t);
  }, [showCongratsMessage]);

  const ACCOUNT_PANEL_CLOSE_DURATION_MS = 450;
  const ACCOUNT_PANEL_OPEN_DURATION_MS = 520;

  useEffect(() => {
    if (!showAccountPanel) {
      setAccountPanelOpen(false);
      return;
    }
    if (accountPanelClosing) return;
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => setAccountPanelOpen(true));
    });
    return () => cancelAnimationFrame(t);
  }, [showAccountPanel, accountPanelClosing]);

  const closeAccountPanel = (onDone?: () => void) => {
    if (accountPanelCloseTimeoutRef.current) return;
    setAccountPanelClosing(true);
    accountPanelCloseTimeoutRef.current = setTimeout(() => {
      accountPanelCloseTimeoutRef.current = null;
      setShowAccountPanel(false);
      setAccountPanelClosing(false);
      onDone?.();
    }, ACCOUNT_PANEL_CLOSE_DURATION_MS);
  };

  const ONBOARDING_CLOSE_DURATION_MS = 500;
  const ACCOUNT_BUTTON_REVEAL_DELAY_MS = 500;
  // Panel "Login Email Opsional": setelah 4 detik tutup dengan animasi terhisap; tombol Akun disembunyikan sampai 1s setelah animasi selesai
  useEffect(() => {
    if (!loggedInStudent?.id) return;
    const showOnboarding =
      Boolean(loggedInStudent?.isFirstLogin && !loggedInStudent?.isEmailLoginEnabled && !onboardingDismissed);
    if (!showOnboarding) return;

    setAccountButtonRevealedAfterIntro(false);

    const studentId = loggedInStudent.id;
    const timeoutId = window.setTimeout(() => {
      onboardingPanelIntroTimeoutRef.current = null;
      setOnboardingPanelClosing(true);
      onboardingPanelCloseTimeoutRef.current = window.setTimeout(() => {
        onboardingPanelCloseTimeoutRef.current = null;
        localStorage.setItem(`email-login-onboarding-dismissed:${studentId}`, '1');
        setOnboardingDismissed(true);
        setOnboardingPanelClosing(false);
        accountButtonRevealTimeoutRef.current = window.setTimeout(() => {
          accountButtonRevealTimeoutRef.current = null;
          setAccountButtonRevealedAfterIntro(true);
          setAccountButtonJustRevealed(true);
          accountButtonJustRevealedEndRef.current = window.setTimeout(() => {
            accountButtonJustRevealedEndRef.current = null;
            setAccountButtonJustRevealed(false);
          }, 2500);
        }, ACCOUNT_BUTTON_REVEAL_DELAY_MS);
      }, ONBOARDING_CLOSE_DURATION_MS);
    }, 4000);
    onboardingPanelIntroTimeoutRef.current = timeoutId;

    return () => {
      if (onboardingPanelIntroTimeoutRef.current) {
        clearTimeout(onboardingPanelIntroTimeoutRef.current);
        onboardingPanelIntroTimeoutRef.current = null;
      }
      if (onboardingPanelCloseTimeoutRef.current) {
        clearTimeout(onboardingPanelCloseTimeoutRef.current);
        onboardingPanelCloseTimeoutRef.current = null;
      }
      // Jangan clear accountButtonReveal* di sini: saat onboardingDismissed berubah effect re-run
      // dan cleanup akan membatalkan timeout 1s yang baru dijadwalkan, sehingga tombol tidak pernah muncul.
    };
  }, [loggedInStudent?.id, loggedInStudent?.isFirstLogin, loggedInStudent?.isEmailLoginEnabled, onboardingDismissed]);

  // Cleanup timeouts saat unmount
  useEffect(() => {
    return () => {
      if (onboardingPanelIntroTimeoutRef.current) {
        clearTimeout(onboardingPanelIntroTimeoutRef.current);
        onboardingPanelIntroTimeoutRef.current = null;
      }
      if (onboardingPanelCloseTimeoutRef.current) {
        clearTimeout(onboardingPanelCloseTimeoutRef.current);
        onboardingPanelCloseTimeoutRef.current = null;
      }
      if (accountButtonRevealTimeoutRef.current) {
        clearTimeout(accountButtonRevealTimeoutRef.current);
        accountButtonRevealTimeoutRef.current = null;
      }
      if (accountButtonJustRevealedEndRef.current) {
        clearTimeout(accountButtonJustRevealedEndRef.current);
        accountButtonJustRevealedEndRef.current = null;
      }
      if (accountPanelCloseTimeoutRef.current) {
        clearTimeout(accountPanelCloseTimeoutRef.current);
        accountPanelCloseTimeoutRef.current = null;
      }
    };
  }, []);

  if (!loggedInStudent && !selectedAlumni) return null;

  // Use selectedAlumni for display (legacy compatibility)
  const displayData = selectedAlumni;
  if (!displayData) return null;

  // Determine student role - PRIMARY IDENTITY
  const studentStatus: StudentStatus = (displayData as any).status || 'alumni';
  const showCareerHistory = hasCareerAccess(studentStatus);
  const achievementsEditable = canEditAchievements(studentStatus);

  // Get career history data
  const alumniHistory = getAlumniDataByMasterId(displayData.id);
  const totalAchievements = Object.values(stats).reduce((a, b) => a + b, 0);
  const totalResearchOutputs = stats.luaran_penelitian ?? 0;

  // Get latest achievement for summary card
  const getLatestAchievement = () => {
    if (achievements.length === 0) return null;
    
    const sorted = [...achievements].sort((a, b) => {
      const yearA = getAchievementYear(a);
      const yearB = getAchievementYear(b);
      return yearB - yearA;
    });
    
    return {
      title: getAchievementTitle(sorted[0]),
      year: getAchievementYear(sorted[0]),
    };
  };

  const latestAchievement = getLatestAchievement();

  const handleLogout = () => {
    logout();
    navigate('/validasi');
  };

  const handleOpenNotification = async (notification: StudentNotification) => {
    if (!notification.is_read) {
      await markNotificationRead(notification.id);
      await loadNotifications();
    }
    navigate(notification.link_path);
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    await loadNotifications();
  };

  const currentLoginEmail = loggedInStudent?.loginEmail || '-';
  const emailLoginEnabled = Boolean(loggedInStudent?.isEmailLoginEnabled);
  const pendingLoginEmail = loggedInStudent?.pendingLoginEmail || '';
  /** Email terdaftar pada akun (dari form karir / satu per akun), untuk prefill dan validasi */
  const accountEmail = (loggedInStudent?.email || loggedInStudent?.loginEmail || '').trim().toLowerCase();
  const activationEmailMismatch = accountEmail && (activationEmail.trim() === '' || activationEmail.trim().toLowerCase() !== accountEmail);
  const showFirstLoginOnboarding = Boolean(
    loggedInStudent?.isFirstLogin &&
    !emailLoginEnabled &&
    !onboardingDismissed
  );

  const handleDismissOnboarding = () => {
    if (!loggedInStudent) return;
    if (onboardingPanelIntroTimeoutRef.current) {
      clearTimeout(onboardingPanelIntroTimeoutRef.current);
      onboardingPanelIntroTimeoutRef.current = null;
    }
    if (onboardingPanelCloseTimeoutRef.current) {
      clearTimeout(onboardingPanelCloseTimeoutRef.current);
      onboardingPanelCloseTimeoutRef.current = null;
    }
    if (accountButtonRevealTimeoutRef.current) {
      clearTimeout(accountButtonRevealTimeoutRef.current);
      accountButtonRevealTimeoutRef.current = null;
    }
    if (accountButtonJustRevealedEndRef.current) {
      clearTimeout(accountButtonJustRevealedEndRef.current);
      accountButtonJustRevealedEndRef.current = null;
    }
    const storageKey = `email-login-onboarding-dismissed:${loggedInStudent.id}`;
    localStorage.setItem(storageKey, '1');
    setOnboardingDismissed(true);
    // Tombol Akun muncul 0,5 detik kemudian dengan animasi pop + partikel (sama seperti setelah hisap)
    accountButtonRevealTimeoutRef.current = window.setTimeout(() => {
      accountButtonRevealTimeoutRef.current = null;
      setAccountButtonRevealedAfterIntro(true);
      setAccountButtonJustRevealed(true);
      accountButtonJustRevealedEndRef.current = window.setTimeout(() => {
        accountButtonJustRevealedEndRef.current = null;
        setAccountButtonJustRevealed(false);
      }, 2500);
    }, ACCOUNT_BUTTON_REVEAL_DELAY_MS);
  };

  const handleRequestVerification = async () => {
    setActivationInfo('');
    setActivationError('');
    setActivationDebugUrl('');

    const chosenEmail = activationEmail.trim();
    if (!chosenEmail) {
      setActivationError('Isi email aktif terlebih dahulu.');
      return;
    }

    const response = await requestVerification({
      email: chosenEmail,
      source: 'dashboard',
    });

    if (!response.success) {
      const message = response.error || 'Gagal mengirim link verifikasi email.';
      setActivationError(message);
      toast({
        title: 'Aktivasi email gagal',
        description: message,
        variant: 'destructive',
      });
      return;
    }

    const message = response.message || 'Link verifikasi dan kode OTP dikirim. Cek inbox email Anda.';
    setActivationInfo(message);
    setActivationDebugUrl(response.data?.debug_verification_url || '');
    setShowOtpInput(true);
    setOtpError('');
    setOtpValue('');

    toast({
      title: 'Verifikasi terkirim',
      description: 'Email berisi link dan kode OTP. Gunakan link atau masukkan kode OTP di bawah.',
    });
  };

  const handleSubmitOtp = async () => {
    setOtpError('');
    const code = otpValue.replace(/\D/g, '');
    if (code.length !== 6) {
      setOtpError('Kode OTP harus 6 digit.');
      return;
    }
    const response = await verifyWithOtp(code);
    if (!response.success) {
      setOtpError(response.error || 'Kode OTP tidak valid atau sudah kedaluwarsa.');
      toast({
        title: 'Verifikasi OTP gagal',
        description: response.error,
        variant: 'destructive',
      });
      return;
    }
    const data = response.data;
    if (data) {
      mergeLoggedInStudent({
        loginEmail: data.login_email,
        isEmailLoginEnabled: data.is_email_login_enabled,
        emailVerifiedAt: data.email_verified_at ? new Date(data.email_verified_at) : undefined,
        pendingLoginEmail: undefined,
      });
    }
    setOtpValue('');
    setShowOtpInput(false);
    setActivationError('');
    setActivationInfo('');
    setIsChangingEmail(false);
    setShowCongratsMessage(true);
    toast({
      title: 'Email login aktif',
      description: 'Anda sekarang bisa login dengan email yang diverifikasi.',
    });
  };

  const handleUbahEmailClick = () => {
    setIsChangingEmail(true);
    setActivationInfo('');
    setActivationError('');
    setActivationDebugUrl('');
    setShowOtpInput(false);
    setOtpValue('');
    setOtpError('');
  };

  const handleGantiPasswordSubmit = async () => {
    setPasswordModalError('');
    if (newPassword.length < 6) {
      setPasswordModalError('Password minimal 6 karakter');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordModalError('Konfirmasi password tidak cocok');
      return;
    }
    if (!loggedInStudent?.id) return;
    setIsChangingPassword(true);
    const result = await resetStudentPassword(loggedInStudent.id, newPassword);
    setIsChangingPassword(false);
    if (result.success) {
      setShowPasswordModal(false);
      setNewPassword('');
      setConfirmPassword('');
      toast({ title: 'Password berhasil diperbarui', description: 'Gunakan password baru saat login berikutnya.' });
    } else {
      setPasswordModalError(result.error || 'Gagal memperbarui password');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-5xl mx-auto">
            {/* Page Title with Logout */}
            <div className="mb-8 animate-fade-up flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="min-w-0 flex-1">
                <StudentIdentityHeader
                  nama={displayData.nama}
                  nim={displayData.nim}
                  prodi={displayData.prodi}
                  jurusan={displayData.jurusan}
                  tahunLulus={displayData.tahunLulus}
                  studentStatus={studentStatus}
                  careerHistory={alumniHistory}
                />
              </div>
              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                {accountButtonRevealedAfterIntro && (
                  <div className="relative">
                    {accountButtonJustRevealed && (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
                        {[
                          { tx: '8px', ty: '-12px' },
                          { tx: '-10px', ty: '-8px' },
                          { tx: '12px', ty: '4px' },
                          { tx: '-8px', ty: '10px' },
                          { tx: '6px', ty: '-6px' },
                          { tx: '-12px', ty: '6px' },
                        ].map(({ tx, ty }, i) => (
                          <span
                            key={i}
                            className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-green-400/80"
                            style={{
                              '--tx': tx,
                              '--ty': ty,
                              animation: 'account-particle-out 0.9s ease-out forwards',
                              animationDelay: `${i * 55}ms`,
                            } as React.CSSProperties}
                          />
                        ))}
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (showAccountPanel && !accountPanelClosing) closeAccountPanel();
                        else if (!showAccountPanel) setShowAccountPanel(true);
                      }}
                      className={
                        accountButtonJustRevealed
                          ? 'gap-1.5 border-green-500/50 bg-green-500/15 text-green-700 dark:text-green-300 shadow-[0_0_12px_rgba(34,197,94,0.25)] animate-[account-button-pop_0.5s_ease-out_forwards] transition-colors duration-300'
                          : showAccountPanel
                            ? 'gap-1.5 border-destructive/50 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive transition-colors duration-300'
                            : 'gap-1.5 transition-colors duration-300'
                      }
                    >
                      {showAccountPanel ? (
                        <>
                          <X className="w-4 h-4" />
                          Akun
                        </>
                      ) : (
                        <>
                          <User className="w-4 h-4" />
                          Akun
                        </>
                      )}
                    </Button>
                  </div>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="relative">
                      <Bell className="w-4 h-4" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] leading-5">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="px-2 py-1.5 flex items-center justify-between gap-2">
                      <DropdownMenuLabel className="p-0">Notifikasi Evaluasi</DropdownMenuLabel>
                      <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
                        Tandai semua
                      </Button>
                    </div>
                    <DropdownMenuSeparator />
                    {(notifications ?? []).length === 0 ? (
                      <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                        Tidak ada notifikasi.
                      </div>
                    ) : (
                      <div className="max-h-[13rem] overflow-y-auto overflow-x-hidden">
                        {(notifications ?? []).map((notification) => (
                          <DropdownMenuItem
                            key={notification.id}
                            className="cursor-pointer"
                            onSelect={(event) => {
                              event.preventDefault();
                              void handleOpenNotification(notification);
                            }}
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-medium">{notification.title}</span>
                              <span className="text-xs text-muted-foreground">
                                {notification.message}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {notification.is_read ? 'Sudah dibaca' : 'Belum dibaca'}
                              </span>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" onClick={handleLogout} className="gap-2 self-start sm:self-auto">
                  <LogOut className="w-4 h-4" />
                  Keluar
                </Button>
              </div>
            </div>

            {(showFirstLoginOnboarding || onboardingPanelClosing) && (
              <div
                className={`overflow-hidden origin-top ${onboardingPanelClosing ? 'relative z-[100]' : ''}`}
                style={{
                  maxHeight: onboardingPanelClosing ? 0 : 400,
                  opacity: onboardingPanelClosing ? 0 : 1,
                  transform: onboardingPanelClosing ? 'scaleY(0) translateY(-100px)' : 'scaleY(1) translateY(0)',
                  transition: 'max-height 500ms cubic-bezier(0.4, 0, 0.5, 1), opacity 400ms ease-out, transform 500ms cubic-bezier(0.4, 0, 0.5, 1)',
                }}
              >
                <div className="mt-6 p-5 rounded-2xl border border-primary/30 bg-primary/5 animate-fade-up">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-primary mb-1">Login Email Opsional</p>
                      <h2 className="text-lg font-semibold text-foreground">
                        Aktifkan email sebagai metode login tambahan
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Anda tetap bisa login dengan NIM kapan pun. Aktivasi ini hanya menambah opsi login.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        variant="outline"
                        onClick={handleDismissOnboarding}
                      >
                        Nanti saja
                      </Button>
                      <Button onClick={handleRequestVerification} disabled={isRequesting}>
                        {isRequesting ? 'Mengirim...' : 'Aktifkan sekarang'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showAccountPanel && (
            <div
              className="overflow-hidden origin-top"
              style={{
                maxHeight: accountPanelClosing ? 0 : (accountPanelOpen ? 600 : 0),
                opacity: accountPanelClosing ? 0 : (accountPanelOpen ? 1 : 0),
                transform: accountPanelClosing ? 'scaleY(0.6) translateY(-12px)' : 'scaleY(1) translateY(0)',
                transition: accountPanelClosing
                  ? 'max-height 450ms cubic-bezier(0.32,0.72,0,1), opacity 400ms ease-out, transform 450ms cubic-bezier(0.32,0.72,0,1)'
                  : `max-height ${ACCOUNT_PANEL_OPEN_DURATION_MS}ms cubic-bezier(0.22,1,0.36,1), opacity ${ACCOUNT_PANEL_OPEN_DURATION_MS}ms ease-out, transform ${ACCOUNT_PANEL_OPEN_DURATION_MS}ms cubic-bezier(0.22,1,0.36,1)`,
              }}
            >
              <div className="mt-6 p-5 rounded-2xl border border-border bg-card">
                <div className="flex items-center gap-2 mb-3">
                  <MailCheck className="w-5 h-5 text-primary" />
                  <h2 className="text-base font-semibold text-foreground">Pengaturan Login Email</h2>
                </div>

              {emailLoginEnabled && !isChangingEmail ? (
                /* Panel informasi akun: congrats (baru verifikasi) lalu setelah 8s morph ke tampilan biasa */
                <div className="space-y-4">
                  <div
                    className={`rounded-xl border p-4 min-h-[5.5rem] transition-[background-color,border-color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      showCongratsMessage
                        ? 'border-green-500/30 bg-green-500/10'
                        : 'border-border bg-muted/30'
                    }`}
                  >
                    {showCongratsMessage ? (
                      <div className="flex items-start gap-3 animate-in fade-in duration-300">
                        <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-800 dark:text-green-200">
                            Horeee! Email ini sudah berhasil diverifikasi ✅ dan bisa dipakai untuk login.
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Email: <span className="font-medium text-foreground">{currentLoginEmail}</span>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div
                        key="email-info-normal"
                        className="animate-in fade-in slide-in-from-bottom-2 duration-500"
                      >
                        <p className="text-sm text-muted-foreground">Email login</p>
                        <p className="font-medium text-foreground mt-0.5">{currentLoginEmail}</p>
                        <p className="text-xs text-muted-foreground mt-1">Email ini terverifikasi dan dapat dipakai untuk login.</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentLoginEmail && currentLoginEmail !== '-' && (
                      <Button variant="outline" size="sm" onClick={handleUbahEmailClick}>
                        Ubah Email Verifikasi
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => { setShowPasswordModal(true); setPasswordModalError(''); setNewPassword(''); setConfirmPassword(''); }}>
                      <KeyRound className="w-4 h-4 mr-2" />
                      Ganti Password
                    </Button>
                  </div>
                </div>
              ) : (
                /* Form: status + kolom email (dan OTP setelah kirim verifikasi) — 2-column flex */
                <>
                  <div className="flex flex-col gap-3 md:flex-row md:gap-6">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-muted-foreground">Status saat ini</p>
                      <p className="font-medium text-foreground">
                        {emailLoginEnabled ? `Aktif (${currentLoginEmail})` : 'Belum aktif'}
                      </p>
                      {!emailLoginEnabled && pendingLoginEmail && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Menunggu verifikasi: {pendingLoginEmail}
                        </p>
                      )}
                    </div>
                    <div className="flex min-w-0 w-full flex-col gap-2 md:max-w-[360px]">
                      <div className="min-h-[4rem]">
                        {activationEmailMismatch && (
                          <p className="text-sm text-destructive">
                            Anda wajib memakai email yang sama pada akun. Lanjutkan jika Anda ingin mengganti data email pada akun Anda.
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                        <Input
                          type="email"
                          value={activationEmail}
                          onChange={(event) => setActivationEmail(event.target.value)}
                          placeholder="email@example.com"
                          className="w-full flex-1 sm:min-w-[200px]"
                        />
                        <Button onClick={handleRequestVerification} disabled={isRequesting}>
                          {isRequesting ? 'Mengirim...' : 'Kirim Verifikasi'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  {(showOtpInput || (pendingLoginEmail && !emailLoginEnabled)) && (
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 mt-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Kode OTP dari email</p>
                        <p className="text-xs text-muted-foreground">
                          Masukkan kode 6 digit yang dikirim ke email Anda.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="000000"
                          value={otpValue}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                            setOtpValue(v);
                            setOtpError('');
                          }}
                          className="w-full font-mono text-center sm:w-28"
                          disabled={isVerifying}
                        />
                        <Button
                          onClick={handleSubmitOtp}
                          disabled={isVerifying || otpValue.length !== 6}
                        >
                          {isVerifying ? 'Memverifikasi...' : 'Verifikasi'}
                        </Button>
                      </div>
                    </div>
                  )}
                  {activationInfo && (
                    <p className="text-sm text-success mt-3">{activationInfo}</p>
                  )}
                  {activationError && (
                    <p className="text-sm text-destructive mt-3">{activationError}</p>
                  )}
                  {otpError && (
                    <p className="text-sm text-destructive mt-1">{otpError}</p>
                  )}
                  {activationDebugUrl && (
                    <p className="text-xs text-muted-foreground mt-2 break-all">
                      Link verifikasi (dev): {activationDebugUrl}
                    </p>
                  )}
                  {isChangingEmail && (
                    <Button variant="ghost" size="sm" className="mt-2" onClick={() => setIsChangingEmail(false)}>
                      Batal
                    </Button>
                  )}
                  <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-border">
                    <Button variant="outline" size="sm" onClick={() => { setShowPasswordModal(true); setPasswordModalError(''); setNewPassword(''); setConfirmPassword(''); }}>
                      <KeyRound className="w-4 h-4 mr-2" />
                      Ganti Password
                    </Button>
                  </div>
                </>
              )}
              </div>
            </div>
            )}

            {/* Modal Ganti Password */}
            <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Ganti Password</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                  <div className="grid gap-2">
                    <Label htmlFor="new-password">Password baru</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Minimal 6 karakter"
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setPasswordModalError(''); }}
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirm-password">Konfirmasi password baru</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Ulangi password baru"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setPasswordModalError(''); }}
                      autoComplete="new-password"
                    />
                  </div>
                  {passwordModalError && (
                    <p className="text-sm text-destructive">{passwordModalError}</p>
                  )}
                </div>
                <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row">
                  <Button variant="outline" onClick={() => setShowPasswordModal(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleGantiPasswordSubmit} disabled={isChangingPassword || !newPassword || !confirmPassword}>
                    {isChangingPassword ? 'Menyimpan...' : 'Simpan Password'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              {/* Card 1 - Prestasi Mahasiswa (kiri) */}
              <SummaryCard
                title="Prestasi Mahasiswa"
                icon={<Award className="w-6 h-6 text-success" />}
                iconBgClass="bg-success/10"
                primaryLabel="Total Prestasi"
                primaryValue={totalAchievements.toString()}
                secondaryLabel="Luaran Penelitian"
                secondaryValue={totalResearchOutputs.toString()}
                contextText={`Menampilkan ${Math.min(achievements.length, 5)} dari ${totalAchievements} prestasi (termasuk luaran penelitian)`}
                highlight={latestAchievement ? {
                  label: 'Prestasi terbaru',
                  value: `${latestAchievement.title} (${latestAchievement.year})`
                } : undefined}
                ctaLabel={achievementsEditable ? "Tambah Prestasi" : "Lihat Prestasi"}
                ctaVariant="secondary"
                onCtaClick={() => navigate('/prestasi')}
              />

              {/* Card 2 - Status Alumni Saat Ini (kanan, Role-Aware) */}
              <AlumniStatusCard
                studentStatus={studentStatus}
                careerHistory={alumniHistory}
                onUpdateStatus={() => navigate('/form')}
              />
            </div>

            {/* History Section - 2 Cards Grid (Fixed Layout) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              {/* Card 3 - Riwayat Prestasi (kiri) */}
              <AchievementTimeline
                achievements={[...achievements].sort((a, b) => getAchievementYear(b) - getAchievementYear(a))}
                maxItems={5}
                contextText={`Menampilkan ${Math.min(achievements.length, 5)} dari ${totalAchievements} prestasi terbaru`}
                onViewAll={() => navigate('/prestasi')}
                onAddNew={achievementsEditable ? () => navigate('/prestasi') : undefined}
              />

              {/* Card 4 - Riwayat Karir (kanan, Role-Aware) */}
              <CareerHistoryCard
                studentStatus={studentStatus}
                careerHistory={alumniHistory}
                onViewAll={() => navigate('/riwayat-karir')}
                onAddNew={showCareerHistory ? () => navigate('/form') : undefined}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Helper functions
function getAchievementTitle(achievement: Achievement): string {
  switch (achievement.category) {
    case 'lomba': return (achievement as any).namaLomba;
    case 'seminar': return (achievement as any).judulPublikasi || (achievement as any).namaSeminar;
    case 'pagelaran': return (achievement as any).judulPublikasi || (achievement as any).namaKegiatan;
    case 'publikasi': return (achievement as any).judul;
    case 'haki': return (achievement as any).judul;
    case 'luaran_penelitian': return (achievement as any).judul;
    case 'magang': return `${(achievement as any).posisi} - ${(achievement as any).namaPerusahaan}`;
    case 'portofolio': return (achievement as any).judulProyek;
    case 'produk_mahasiswa': return (achievement as any).namaProduk;
    case 'wirausaha': return (achievement as any).namaUsaha;
    case 'pengembangan': return (achievement as any).namaProgram;
    case 'organisasi': return `${(achievement as any).jabatan} - ${(achievement as any).namaOrganisasi}`;
  }
}

function getAchievementYear(achievement: Achievement): number {
  switch (achievement.category) {
    case 'lomba': return (achievement as any).tahun;
    case 'seminar': return (achievement as any).tahun;
    case 'pagelaran': return (achievement as any).tahun;
    case 'publikasi': return (achievement as any).tahun;
    case 'haki': return (achievement as any).tahunPengajuan;
    case 'luaran_penelitian': return (achievement as any).tahun;
    case 'magang': return new Date((achievement as any).tanggalMulai).getFullYear();
    case 'portofolio': return (achievement as any).tahun;
    case 'produk_mahasiswa': return new Date((achievement as any).tanggalAdopsi).getFullYear();
    case 'wirausaha': return (achievement as any).tahunMulai;
    case 'pengembangan': return new Date((achievement as any).tanggalMulai).getFullYear();
    case 'organisasi': return new Date((achievement as any).periodeMulai).getFullYear();
  }
}
