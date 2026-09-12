import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, FileQuestion } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md text-center p-8 rounded-2xl bg-card border border-border/80 shadow-card animate-fade-up">
        {/* Icon & 404 Badge */}
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5">
          <FileQuestion className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full inline-block mb-3">
          Error 404
        </span>

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 tracking-tight">
          Halaman Tidak Ditemukan
        </h1>

        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Tautan yang Anda tuju tidak tersedia atau alamat URL telah dipindahkan.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="default" size="default" className="w-full font-medium">
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Kembali ke Beranda
            </Link>
          </Button>
          <Button asChild variant="outline" size="default" className="w-full font-medium">
            <Link to="/validasi">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Halaman Login
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-muted-foreground">
        Arsip Mahasiswa Program Studi Administrasi Bisnis Terapan — Polines
      </div>
    </div>
  );
};

export default NotFound;
