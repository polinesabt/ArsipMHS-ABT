import { 
  Trophy, 
  GraduationCap, 
  Clock, 
  Globe, 
  Users, 
  BookOpen, 
  UserCheck, 
  Lightbulb, 
  FlaskConical,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard
} from 'lucide-react';
import type { MouseEvent } from 'react';
import { useInsightDashboard } from '@/contexts/InsightDashboardContext';
import { cn } from '@/lib/utils';

const navItems = [
  { id: 'overview', label: 'Ringkasan', icon: LayoutDashboard },
  { id: 'achievements', label: 'Prestasi Mahasiswa', icon: Trophy },
  { id: 'graduation', label: 'Masa Studi', icon: GraduationCap },
  { id: 'waiting-time', label: 'Masa Tunggu', icon: Clock },
  { id: 'work-coverage', label: 'Cakupan Tempat Kerja', icon: Globe },
  { id: 'satisfaction', label: 'Kepuasan Pengguna', icon: Users },
  { id: 'publications', label: 'Diseminasi Ilmiah Mahasiswa', icon: BookOpen },
  { id: 'active-students', label: 'Mahasiswa Aktif', icon: UserCheck },
  { id: 'student-products', label: 'Produk Mahasiswa', icon: Lightbulb },
  { id: 'research-outputs', label: 'Luaran Riset', icon: FlaskConical },
];

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  buildSectionHref: (section: string) => string;
  topOffset?: number;
}

function isModifiedEvent(event: MouseEvent<HTMLAnchorElement>) {
  return event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;
}

export function Sidebar({ activeSection, onSectionChange, buildSectionHref, topOffset = 0 }: SidebarProps) {
  const { sidebarCollapsed, setSidebarCollapsed, presentationMode } = useInsightDashboard();

  if (presentationMode) return null;

  const offsetStyle = topOffset
    ? { top: topOffset, height: `calc(100vh - ${topOffset}px)` }
    : undefined;

  return (
    <aside
      className={cn(
        'fixed left-0 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 z-50 flex flex-col',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
      style={offsetStyle}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
      {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <span className="text-sidebar-primary-foreground font-bold text-sm">ABT</span>
            </div>
            <div>
              <h1 className="font-semibold text-sidebar-foreground text-sm">Arsip Mahasiswa ABT</h1>
              <p className="text-[10px] text-sidebar-foreground/60">Sistem Arsip Mahasiswa</p>
            </div>
          </div>
        )}
      {sidebarCollapsed && (
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center mx-auto">
            <span className="text-sidebar-primary-foreground font-bold text-sm">ABT</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                href={buildSectionHref(item.id)}
                onClick={(event) => {
                  if (isModifiedEvent(event)) return;
                  event.preventDefault();
                  onSectionChange(item.id);
                }}
                className={cn(
                  'nav-item w-full',
                  activeSection === item.id && 'nav-item-active',
                  sidebarCollapsed && 'justify-center px-2'
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer Actions */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="nav-item w-full justify-center"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>
    </aside>
  );
}
