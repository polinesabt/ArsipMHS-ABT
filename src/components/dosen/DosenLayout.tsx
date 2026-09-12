import { Award, BookOpen, Clock3, FlaskConical, HeartHandshake, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StaffPortalShell, type StaffPortalNavItem } from '@/components/staff/StaffPortalShell';
import { useAlumni } from '@/contexts/AlumniContext';

const NAV_ITEMS: StaffPortalNavItem[] = [
  { to: '/dosen/profil', label: 'Profil', description: 'Identitas dan kualifikasi', icon: UserRound, group: 'Portofolio' },
  { to: '/dosen/pengajaran', label: 'Pengajaran', description: 'Mata kuliah dan bimbingan', icon: BookOpen, group: 'Tridharma' },
  { to: '/dosen/penelitian', label: 'Penelitian', description: 'Riset dan rekognisi', icon: FlaskConical, group: 'Tridharma' },
  { to: '/dosen/pengabdian', label: 'Pengabdian', description: 'Kegiatan dan mitra PKM', icon: HeartHandshake, group: 'Tridharma' },
  { to: '/dosen/waktu-mengajar', label: 'EWMP', description: 'Beban kerja per periode', icon: Clock3, group: 'Kinerja' },
  { to: '/dosen/luaran', label: 'Luaran', description: 'Publikasi penelitian dan PKM', icon: Award, group: 'Kinerja' },
];

export function DosenLayout() {
  const navigate = useNavigate();
  const { loggedInDosen, logoutDosen, darkMode, toggleDarkMode } = useAlumni();

  return (
    <StaffPortalShell
      portalLabel="Portal Dosen"
      personName={loggedInDosen?.nama}
      identityLabel="NIDN/NIDK"
      identityValue={loggedInDosen?.nidn}
      roleDescription={`${loggedInDosen?.jabatan || 'Dosen'} di ${loggedInDosen?.institusi || 'Program Studi Administrasi Bisnis Terapan'}`}
      navItems={NAV_ITEMS}
      darkMode={darkMode}
      onToggleTheme={toggleDarkMode}
      onLogout={() => {
        logoutDosen();
        navigate('/validasi', { replace: true });
      }}
    />
  );
}

export default DosenLayout;
