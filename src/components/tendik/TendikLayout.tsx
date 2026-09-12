import { useNavigate } from 'react-router-dom';
import { StaffPortalShell } from '@/components/staff/StaffPortalShell';
import { useAlumni } from '@/contexts/AlumniContext';

export function TendikLayout() {
  const navigate = useNavigate();
  const { loggedInTendik, logoutTendik, darkMode, toggleDarkMode } = useAlumni();

  return (
    <StaffPortalShell
      portalLabel="Portal Tenaga Kependidikan"
      personName={loggedInTendik?.nama}
      identityLabel="NIP/NITK"
      identityValue={loggedInTendik?.nip}
      roleDescription={`${loggedInTendik?.jabatan || 'Tenaga Kependidikan'} di Program Studi Administrasi Bisnis Terapan`}
      navItems={[]}
      darkMode={darkMode}
      onToggleTheme={toggleDarkMode}
      onLogout={() => {
        logoutTendik();
        navigate('/validasi', { replace: true });
      }}
    />
  );
}

export default TendikLayout;
