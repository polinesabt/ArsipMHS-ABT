import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-sidebar text-sidebar-foreground border-t border-sidebar-border/80">
      <div className="container mx-auto px-4 py-10 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-background/10 p-1">
                <img
                  src={`${import.meta.env.BASE_URL}logo.png`}
                  alt="Logo Politeknik Negeri Semarang"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-bold text-lg text-sidebar-foreground block leading-tight">Arsip Mahasiswa Prodi ABT</span>
                <span className="text-xs text-sidebar-foreground/70">Politeknik Negeri Semarang</span>
              </div>
            </div>
            <p className="text-sidebar-foreground/75 text-sm max-w-md mb-6 leading-relaxed">
              Sistem Informasi Lulusan - Arsip digital resmi Program Studi 
              Administrasi Bisnis Terapan (ABT). Menghubungkan kampus dengan mahasiswa 
              dan alumni untuk membangun jejaring profesional yang lebih kuat.
            </p>
            <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-sidebar-foreground/75">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-sidebar-accent flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span>Jl. Prof. Sudarto, SH, Tembalang, Semarang 50275</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-sidebar-accent flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <a href="mailto:prodi-abt@polines.ac.id" className="hover:text-sidebar-primary transition-colors">
                  prodi-abt@polines.ac.id
                </a>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-sidebar-accent flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <span>(024) 7473417 ext. 123</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm text-sidebar-foreground mb-4 uppercase tracking-wider text-sidebar-foreground/90">Tautan Cepat</h4>
            <div className="flex flex-col gap-2.5">
              <Link to="/" className="text-xs sm:text-sm text-sidebar-foreground/75 hover:text-sidebar-primary transition-colors">
                Beranda
              </Link>
              <Link to="/validasi" className="text-xs sm:text-sm text-sidebar-foreground/75 hover:text-sidebar-primary transition-colors">
                Input Data Alumni & Mahasiswa
              </Link>
              <Link to="/admin" className="text-xs sm:text-sm text-sidebar-foreground/75 hover:text-sidebar-primary transition-colors">
                Dashboard Admin & Pengelola
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-sm text-sidebar-foreground mb-4 uppercase tracking-wider text-sidebar-foreground/90">Sumber Daya</h4>
            <div className="flex flex-col gap-2.5">
              <a 
                href="https://www.polines.ac.id" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs sm:text-sm text-sidebar-foreground/75 hover:text-sidebar-primary transition-colors inline-flex items-center gap-1.5"
              >
                Website Polines
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
              <a 
                href="https://abt.polines.ac.id" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs sm:text-sm text-sidebar-foreground/75 hover:text-sidebar-primary transition-colors inline-flex items-center gap-1.5"
              >
                Website Prodi ABT
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
              <Link to="/evaluasi" className="text-xs sm:text-sm text-sidebar-foreground/75 hover:text-sidebar-primary transition-colors">
                Survei Kepuasan Pengguna
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-sidebar-border/60 mt-10 pt-6 flex flex-col md:flex-row md:justify-between items-center gap-3 text-xs text-sidebar-foreground/60">
          <p className="text-center md:text-left">
            © {new Date().getFullYear()} Arsip Mahasiswa Prodi ABT - Politeknik Negeri Semarang. Hak cipta dilindungi.
          </p>
          <p className="text-center md:text-right">
            Program Studi Administrasi Bisnis Terapan
          </p>
        </div>
      </div>
    </footer>
  );
}


