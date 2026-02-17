/**
 * AdminNavbar Component
 * Simplified header for admin pages without navigation links
 */

import { Link } from 'react-router-dom';
import { Moon, Sun, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAlumni } from '@/contexts/AlumniContext';

export function AdminNavbar() {
  const { darkMode, toggleDarkMode, logoutAdmin, loggedInAdmin } = useAlumni();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Logo Politeknik Negeri Semarang"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-lg text-foreground block leading-tight">Admin Panel</span>
              <span className="text-[10px] text-muted-foreground leading-none">ARSIP MAHASISWA ABT</span>
            </div>
          </Link>

          {/* Admin Info & Actions */}
          <div className="flex items-center gap-3">
            {loggedInAdmin && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10">
                <span className="text-sm font-medium text-primary">{loggedInAdmin.nama}</span>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="rounded-xl"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={logoutAdmin}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
