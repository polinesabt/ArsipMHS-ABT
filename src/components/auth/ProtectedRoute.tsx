/**
 * ProtectedRoute Component
 * Restricts access to routes based on user role
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAlumni } from '@/contexts/AlumniContext';
import type { UserRole } from '@/types/student.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: UserRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { loggedInStudent, loggedInAdmin, loggedInDeveloper, loggedInDosen, loggedInTendik, loggedInDemo, sessionHydrated } = useAlumni();
  const location = useLocation();
  const hasToken = Boolean(localStorage.getItem('authToken'));

  if (!sessionHydrated) {
    return <div className="min-h-screen bg-background" aria-label="Memulihkan sesi" />;
  }

  // Check authentication based on required role
  if (requiredRole === 'demo') {
    if (!loggedInDemo || !hasToken) {
      return <Navigate to="/validasi" state={{ from: location, role: 'demo' }} replace />;
    }
  } else if (requiredRole === 'dosen') {
    if (!loggedInDosen || !hasToken) {
      return <Navigate to="/validasi" state={{ from: location, role: 'dosen' }} replace />;
    }
  } else if (requiredRole === 'tendik') {
    if (!loggedInTendik || !hasToken) {
      return <Navigate to="/validasi" state={{ from: location, role: 'tendik' }} replace />;
    }
  } else if (requiredRole === 'developer') {
    // Demo user has full access to developer area
    if ((!loggedInDeveloper && !loggedInDemo) || !hasToken) {
      return <Navigate to="/validasi" state={{ from: location, role: 'developer' }} replace />;
    }
  } else if (requiredRole === 'admin') {
    // Demo user has full access to admin area
    if ((!loggedInAdmin && !loggedInDemo) || !hasToken) {
      // Redirect to login with return URL
      return <Navigate to="/validasi" state={{ from: location, role: 'admin' }} replace />;
    }
  } else if (requiredRole === 'student') {
    if (!loggedInStudent || !hasToken) {
      // Redirect to login with return URL
      return <Navigate to="/validasi" state={{ from: location, role: 'student' }} replace />;
    }
  }

  return <>{children}</>;
}
