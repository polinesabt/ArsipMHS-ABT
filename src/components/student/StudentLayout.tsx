import { Outlet, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StudentBottomNav } from '@/components/student/StudentBottomNav';
import { useAlumni } from '@/contexts/AlumniContext';

export function StudentLayout() {
  const navigate = useNavigate();
  const { logout } = useAlumni();

  const handleLogout = () => {
    logout();
    navigate('/validasi', { replace: true });
  };

  return (
    <div className="flex min-h-[100dvh] min-w-0 flex-col overflow-x-clip bg-background">
      <Navbar onLogout={handleLogout} />
      <main id="main-content" className="min-w-0 flex-1 pb-28 pt-20 sm:pt-24 md:pb-20">
        <Outlet />
      </main>
      <Footer />
      <StudentBottomNav />
    </div>
  );
}

export default StudentLayout;
