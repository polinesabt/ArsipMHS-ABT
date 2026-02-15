import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-sidebar text-sidebar-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl">
                <img
                  src="/logo-polines.png"
                  alt="Logo Politeknik Negeri Semarang"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-bold text-xl text-sidebar-foreground block">Arsip Mahasiswa Prodi ABT</span>
                <span className="text-xs text-sidebar-foreground/60">Politeknik Negeri Semarang</span>
              </div>
            </div>
            <p className="text-sidebar-foreground/70 text-sm max-w-md mb-6 leading-relaxed">
              Sistem Informasi Lulusan â€” Arsip digital resmi Program Studi 
              Administrasi Bisnis Terapan (ABT). Menghubungkan kampus dengan lulusan 
              untuk membangun jejaring profesional yang lebih kuat.
            </p>
            <div className="flex flex-col gap-3 text-sm text-sidebar-foreground/70">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sidebar-accent flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>Jl. Prof. Sudarto, SH, Tembalang, Semarang 50275</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sidebar-accent flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <span>prodi-abt@polines.ac.id</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sidebar-accent flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <span>(024) 7473417 ext. 123</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sidebar-foreground mb-5">Tautan Cepat</h4>
            <div className="flex flex-col gap-3">
              <Link to="/" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-primary transition-colors">
                Beranda
              </Link>
              <Link to="/validasi" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-primary transition-colors">
                Input Data Alumni
              </Link>
              <Link to="/admin" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-primary transition-colors">
                Dashboard Admin
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-sidebar-foreground mb-5">Sumber Daya</h4>
            <div className="flex flex-col gap-3">
              <a 
                href="https://www.polines.ac.id" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-sidebar-foreground/70 hover:text-sidebar-primary transition-colors inline-flex items-center gap-1"
              >
                Website Polines
                <ExternalLink className="w-3 h-3" />
              </a>
              <a 
                href="https://abt.polines.ac.id" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-sidebar-foreground/70 hover:text-sidebar-primary transition-colors inline-flex items-center gap-1"
              >
                Prodi ABT
                <ExternalLink className="w-3 h-3" />
              </a>
              <a href="#" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-primary transition-colors">
                Panduan Penggunaan
              </a>
              <a href="#" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-primary transition-colors">
                Kebijakan Privasi
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-sidebar-border mt-12 pt-8 flex flex-col md:flex-row md:flex-wrap md:justify-between md:items-start gap-4">
          <p className="text-sm text-sidebar-foreground/50 max-w-full break-words">
            Â© {new Date().getFullYear()} Arsip Mahasiswa Prodi ABT â€” Politeknik Negeri Semarang. Hak cipta dilindungi.
          </p>
          <p className="text-sm text-sidebar-foreground/50 max-w-full break-words md:text-right">
            Program Studi Administrasi Bisnis Terapan (ABT)
          </p>
        </div>
      </div>
    </footer>
  );
}


