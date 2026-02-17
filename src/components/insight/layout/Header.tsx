import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useInsightDashboard } from '@/contexts/InsightDashboardContext';
import { INSIGHT_YEARS, type Year } from '@/types/insight';
import { X, Calendar, Presentation } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  topOffset?: number;
}

export function Header({ topOffset = 0 }: HeaderProps) {
  const { selectedYear, setSelectedYear, presentationMode, setPresentationMode, sidebarCollapsed } = useInsightDashboard();

  return (
    <header
      className={cn(
        'sticky z-40 bg-background/95 backdrop-blur border-b border-border transition-all duration-300',
        !presentationMode && (sidebarCollapsed ? 'ml-16' : 'ml-64')
      )}
      style={topOffset ? { top: topOffset } : undefined}
    >
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          {presentationMode && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">ABT</span>
              </div>
              <div>
                <h1 className="font-semibold text-foreground">Arsip Mahasiswa ABT</h1>
                <p className="text-xs text-muted-foreground">Dasbor arsip dan hasil survei</p>
              </div>
            </div>
          )}
          {!presentationMode && (
            <h2 className="text-lg font-semibold text-foreground">
              Arsip Mahasiswa ABT
            </h2>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Year Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(value === 'all' ? 'all' : parseInt(value) as Year)}
            >
              <SelectTrigger className="w-32 h-9">
                <SelectValue placeholder="Pilih Tahun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tahun</SelectItem>
                {INSIGHT_YEARS.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Presentation Mode Toggle */}
          {presentationMode ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPresentationMode(false)}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Keluar Presentasi
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPresentationMode(true)}
              className="gap-2"
            >
              <Presentation className="w-4 h-4" />
              Presentasi
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}