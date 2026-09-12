import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Award, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  {
    to: '/student/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    to: '/student/prestasi',
    label: 'Prestasi',
    icon: Award,
  },
  {
    to: '/student/riwayat-karir',
    label: 'Karir',
    icon: Briefcase,
  },
];

export function StudentBottomNav() {
  return (
    <nav 
      className="fixed inset-x-0 bottom-0 z-40 block border-t border-border/80 bg-card/95 px-4 pb-[max(0.625rem,env(safe-area-inset-bottom,0.625rem))] pt-1.5 shadow-lg backdrop-blur-xl md:hidden"
      aria-label="Navigasi Menu Mahasiswa"
    >
      <div className="mx-auto grid max-w-md grid-cols-3 items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex min-h-12 w-full touch-manipulation flex-col items-center justify-center rounded-xl px-2 py-1 outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isActive
                    ? 'text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground active:scale-95'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={cn(
                      'relative flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200 mb-0.5',
                      isActive && 'bg-primary/15 text-primary'
                    )}
                  >
                    <Icon className={cn('w-5 h-5 transition-transform duration-200', isActive && 'scale-110')} />
                    {isActive && (
                      <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <span className="text-[11px] leading-tight tracking-tight">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export default StudentBottomNav;
