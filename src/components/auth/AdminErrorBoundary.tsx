/**
 * Error Boundary for admin dashboard content.
 * Prevents blank screen when a child component throws; shows fallback and option to re-login.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[AdminErrorBoundary]', error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  handleRelogin = (): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('sipal-admin-session');
    window.location.href = '/validasi';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
          <div className="max-w-md space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-4">
                <AlertTriangle className="h-10 w-10 text-destructive" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Terjadi kesalahan saat menampilkan dashboard
            </h2>
            <p className="text-sm text-muted-foreground">
              Coba muat ulang halaman atau keluar lalu masuk kembali. Jika masalah berlanjut, periksa konsol browser (F12).
            </p>
            <div className="flex flex-wrap gap-3 justify-center pt-4">
              <Button variant="outline" onClick={this.handleRetry}>
                Coba lagi
              </Button>
              <Button onClick={this.handleRelogin}>
                Keluar &amp; masuk lagi
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
