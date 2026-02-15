import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAlumni } from '@/contexts/AlumniContext';
import { Award, Bell, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
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
import type { StudentStatus } from '@/types/student.types';
import type { StudentNotification } from '@/types/evaluation.types';
import {
  getStudentNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/repositories/notification.repository';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { selectedAlumni, loggedInStudent, logout, getAlumniDataByMasterId } = useAlumni();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState<Record<AchievementCategory, number>>({
    lomba: 0, seminar: 0, publikasi: 0, haki: 0, magang: 0, portofolio: 0, wirausaha: 0, pengembangan: 0, organisasi: 0
  });

  const computeStats = (items: Achievement[]) => ({
    lomba: items.filter(a => a.category === 'lomba').length,
    seminar: items.filter(a => a.category === 'seminar').length,
    publikasi: items.filter(a => a.category === 'publikasi').length,
    haki: items.filter(a => a.category === 'haki').length,
    magang: items.filter(a => a.category === 'magang').length,
    portofolio: items.filter(a => a.category === 'portofolio').length,
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

    getAchievementsFromAPI(selectedAlumni.id).then((response) => {
      if (!response.success || !response.data) {
        setAchievements([]);
        setStats({
          lomba: 0, seminar: 0, publikasi: 0, haki: 0, magang: 0, portofolio: 0, wirausaha: 0, pengembangan: 0, organisasi: 0
        });
        return;
      }
      const mapped = response.data.map(mapApiAchievementToUi);
      setAchievements(mapped);
      setStats(computeStats(mapped));
    });
  }, [loggedInStudent, selectedAlumni, navigate]);

  const loadNotifications = async () => {
    const response = await getStudentNotifications();
    if (!response.success || !response.data) {
      return;
    }
    setNotifications(response.data.items);
    setUnreadCount(response.data.unread);
  };

  useEffect(() => {
    if (!loggedInStudent) return;

    void loadNotifications();
    const interval = window.setInterval(() => {
      void loadNotifications();
    }, 30000);

    return () => window.clearInterval(interval);
  }, [loggedInStudent]);

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Page Title with Logout */}
            <div className="mb-8 animate-fade-up flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                  Dashboard Mahasiswa / Alumni
                </h1>
                <p className="text-muted-foreground">
                  Ringkasan akademik dan perjalanan karirmu
                </p>
              </div>
              <div className="flex items-center gap-2">
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
                    {notifications.length === 0 ? (
                      <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                        Tidak ada notifikasi.
                      </div>
                    ) : (
                      notifications.slice(0, 8).map((notification) => (
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
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" onClick={handleLogout} className="gap-2 self-start sm:self-auto">
                  <LogOut className="w-4 h-4" />
                  Keluar
                </Button>
              </div>
            </div>

            {/* Student Identity Header with Role Badge */}
            <StudentIdentityHeader
              nama={displayData.nama}
              nim={displayData.nim}
              prodi={displayData.prodi}
              jurusan={displayData.jurusan}
              tahunLulus={displayData.tahunLulus}
              studentStatus={studentStatus}
              careerHistory={alumniHistory}
            />

            {/* Summary Cards - 2 Cards Grid (Fixed Layout) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              {/* Card 1 - Status Alumni Saat Ini (Role-Aware) */}
              <AlumniStatusCard
                studentStatus={studentStatus}
                careerHistory={alumniHistory}
                onUpdateStatus={() => navigate('/form')}
              />

              {/* Card 2 - Prestasi Non-Akademik */}
              <SummaryCard
                title="Prestasi Non-Akademik"
                icon={<Award className="w-6 h-6 text-success" />}
                iconBgClass="bg-success/10"
                primaryLabel="Total Prestasi"
                primaryValue={totalAchievements.toString()}
                contextText={`Menampilkan ${Math.min(achievements.length, 5)} dari ${totalAchievements} prestasi`}
                highlight={latestAchievement ? {
                  label: 'Prestasi terbaru',
                  value: `${latestAchievement.title} (${latestAchievement.year})`
                } : undefined}
                ctaLabel={achievementsEditable ? "Tambah Prestasi" : "Lihat Prestasi"}
                ctaVariant="secondary"
                onCtaClick={() => navigate('/prestasi')}
              />
            </div>

            {/* History Section - 2 Cards Grid (Fixed Layout) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              {/* Card 3 - Riwayat Karir (Role-Aware) */}
              <CareerHistoryCard
                studentStatus={studentStatus}
                careerHistory={alumniHistory}
                onViewAll={() => navigate('/riwayat-karir')}
                onAddNew={showCareerHistory ? () => navigate('/form') : undefined}
              />

              {/* Card 4 - Riwayat Prestasi */}
              <AchievementTimeline
                achievements={[...achievements].sort((a, b) => getAchievementYear(b) - getAchievementYear(a))}
                maxItems={5}
                contextText={`Menampilkan ${Math.min(achievements.length, 5)} dari ${totalAchievements} prestasi terbaru`}
                onViewAll={() => navigate('/prestasi')}
                onAddNew={achievementsEditable ? () => navigate('/prestasi') : undefined}
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
    case 'seminar': return (achievement as any).namaSeminar;
    case 'publikasi': return (achievement as any).judul;
    case 'haki': return (achievement as any).judul;
    case 'magang': return `${(achievement as any).posisi} - ${(achievement as any).namaPerusahaan}`;
    case 'portofolio': return (achievement as any).judulProyek;
    case 'wirausaha': return (achievement as any).namaUsaha;
    case 'pengembangan': return (achievement as any).namaProgram;
    case 'organisasi': return `${(achievement as any).jabatan} - ${(achievement as any).namaOrganisasi}`;
  }
}

function getAchievementYear(achievement: Achievement): number {
  switch (achievement.category) {
    case 'lomba': return (achievement as any).tahun;
    case 'seminar': return (achievement as any).tahun;
    case 'publikasi': return (achievement as any).tahun;
    case 'haki': return (achievement as any).tahunPengajuan;
    case 'magang': return new Date((achievement as any).tanggalMulai).getFullYear();
    case 'portofolio': return (achievement as any).tahun;
    case 'wirausaha': return (achievement as any).tahunMulai;
    case 'pengembangan': return new Date((achievement as any).tanggalMulai).getFullYear();
    case 'organisasi': return new Date((achievement as any).periodeMulai).getFullYear();
  }
}
