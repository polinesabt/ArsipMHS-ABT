import { Link } from 'react-router-dom';
import { Moon, Sun, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAlumni } from '@/contexts/AlumniContext';

export function Navbar() {
  const { darkMode, toggleDarkMode } = useAlumni();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Logo Politeknik Negeri Semarang"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-base text-foreground block leading-tight">Arsip Mahasiswa Prodi ABT</span>
              <span className="text-[10px] text-muted-foreground leading-none">Polines • ABT</span>
            </div>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="rounded-xl"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button asChild variant="default" size="sm">
              <Link to="/validasi">
                <LogIn className="w-4 h-4 mr-2" />
                Masuk
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
