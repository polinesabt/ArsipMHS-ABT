import { Link } from 'react-router-dom';
import { LogOut, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAlumni } from '@/contexts/AlumniContext';

interface NavbarProps {
  onLogout?: () => void;
}

export function Navbar({ onLogout }: NavbarProps) {
  const { darkMode, toggleDarkMode } = useAlumni();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/80 bg-card/95 shadow-xs backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-2 px-3 sm:px-4">
          {/* Logo */}
          <Link to="/" className="group flex min-w-0 items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg p-0.5">
              <img
                src={`${import.meta.env.BASE_URL}logo.png`}
                alt="Logo Politeknik Negeri Semarang"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <span className="block max-w-[8.5rem] truncate text-[11px] font-bold leading-tight text-foreground min-[360px]:max-w-[10.5rem] min-[420px]:max-w-[13rem] sm:max-w-none sm:text-base">Arsip Mahasiswa Prodi ABT</span>
              <span className="hidden truncate text-[10px] leading-none text-muted-foreground min-[360px]:block sm:text-[11px]">Politeknik Negeri Semarang</span>
            </div>
          </Link>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground active:translate-y-px"
              aria-label={darkMode ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
              title={darkMode ? "Mode terang" : "Mode gelap"}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            {onLogout && (
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="h-9 w-9 rounded-lg px-0 active:translate-y-px sm:w-auto sm:px-3"
                aria-label="Keluar dari akun mahasiswa"
                title="Keluar"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Keluar</span>
              </Button>
            )}
          </div>
      </div>
    </header>
  );
}
