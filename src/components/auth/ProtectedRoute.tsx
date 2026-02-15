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
  const { loggedInStudent, loggedInAdmin } = useAlumni();
  const location = useLocation();
  const hasToken = Boolean(localStorage.getItem('authToken'));

  // Check authentication based on required role
  if (requiredRole === 'admin') {
    if (!loggedInAdmin || !hasToken) {
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
