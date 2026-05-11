import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInsightDashboard } from '@/contexts/InsightDashboardContext';
import { useActiveStudentsInput } from '@/contexts/ActiveStudentsInputContext';
import { INSIGHT_YEARS, type Year } from '@/types/insight';
import { Calendar, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { DashboardSectionId } from '@/components/insight/InsightDashboardEmbedded';

interface HeaderProps {
  topOffset?: number;
  section?: DashboardSectionId | null;
}

const SHOW_ACTIVE_STUDENTS_INPUT = (s: DashboardSectionId | null | undefined) =>
  s === 'active-students';

export function Header({ topOffset = 0, section }: HeaderProps) {
  const { selectedYear, setSelectedYear, presentationMode, sidebarCollapsed } = useInsightDashboard();
  const activeStudentsInput = useActiveStudentsInput();

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
          {SHOW_ACTIVE_STUDENTS_INPUT(section) && activeStudentsInput && (
            <Button type="button" variant="outline" size="sm" onClick={() => activeStudentsInput.setOpen(true)}>
              <Pencil className="h-4 w-4 mr-1.5" />
              Input data manual
            </Button>
          )}
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
        </div>
      </div>
    </header>
  );
}