  import { 
  Trophy, BookOpen, Shield, Briefcase, Rocket, Star, Mic2, FileText,
  FolderOpen, Sprout, Users2, Award, Package, FlaskConical
} from 'lucide-react';
import type { MouseEvent, WheelEvent } from 'react';
import { cn } from '@/lib/utils';
import { AchievementCategory } from '@/types/achievement.types';

// Extended category type to include 'all' and 'unggulan'
export type CategoryFilter = AchievementCategory | 'all' | 'unggulan';

interface CategorySidebarProps {
  activeCategory: CategoryFilter;
  stats: Record<AchievementCategory, number>;
  unggulanCount: number;
  onCategoryChange: (category: CategoryFilter) => void;
  buildCategoryHref: (category: CategoryFilter) => string;
}

// Category configuration with proper icons (strict order per spec)
const CATEGORY_CONFIG: Record<CategoryFilter, { 
  icon: React.ElementType; 
  color: string; 
  bgColor: string;
  label: string;
  shortLabel: string;
}> = {
  all: {
    icon: Star,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    label: 'Semua Prestasi',
    shortLabel: 'Semua',
  },
  unggulan: {
    icon: Award,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    label: 'Prestasi Unggulan',
    shortLabel: 'Unggulan',
  },
  lomba: { 
    icon: Trophy, 
    color: 'text-warning', 
    bgColor: 'bg-warning/10',
    label: 'Lomba',
    shortLabel: 'Lomba',
  },
  seminar: { 
    icon: FileText, 
    color: 'text-purple-500', 
    bgColor: 'bg-purple-500/10',
    label: 'Publikasi di Seminar',
    shortLabel: 'Publikasi di Seminar',
  },
  pagelaran: {
    icon: Mic2,
    color: 'text-fuchsia-500',
    bgColor: 'bg-fuchsia-500/10',
    label: 'Pagelaran / Presentasi',
    shortLabel: 'Pagelaran',
  },
  publikasi: { 
    icon: BookOpen, 
    color: 'text-primary', 
    bgColor: 'bg-primary/10',
    label: 'Karya Ilmiah & Publikasi',
    shortLabel: 'Publikasi',
  },
  haki: { 
    icon: Shield, 
    color: 'text-success', 
    bgColor: 'bg-success/10',
    label: 'Kekayaan Intelektual',
    shortLabel: 'HAKI',
  },
  luaran_penelitian: {
    icon: FlaskConical,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    label: 'Luaran Penelitian',
    shortLabel: 'Luaran',
  },
  magang: { 
    icon: Briefcase, 
    color: 'text-info', 
    bgColor: 'bg-info/10',
    label: 'Pengalaman Magang',
    shortLabel: 'Magang',
  },
  portofolio: { 
    icon: FolderOpen, 
    color: 'text-orange-500', 
    bgColor: 'bg-orange-500/10',
    label: 'Portofolio Praktikum Kelas',
    shortLabel: 'Portofolio',
  },
  produk_mahasiswa: {
    icon: Package,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    label: 'Produk Mahasiswa',
    shortLabel: 'Produk',
  },
  wirausaha: { 
    icon: Rocket, 
    color: 'text-destructive', 
    bgColor: 'bg-destructive/10',
    label: 'Pengalaman Wirausaha',
    shortLabel: 'Wirausaha',
  },
  pengembangan: { 
    icon: Sprout, 
    color: 'text-emerald-500', 
    bgColor: 'bg-emerald-500/10',
    label: 'Program Pengembangan Diri',
    shortLabel: 'Pengembangan',
  },
  organisasi: { 
    icon: Users2, 
    color: 'text-sky-500', 
    bgColor: 'bg-sky-500/10',
    label: 'Organisasi & Kepemimpinan',
    shortLabel: 'Organisasi',
  },
};

// Categories in STRICT display order per spec
const categories: CategoryFilter[] = [
  'all', 
  'unggulan',
  'publikasi',
  'portofolio',
  'lomba', 
  'haki', 
  'luaran_penelitian',
  'magang', 
  'produk_mahasiswa',
  'wirausaha', 
  'pengembangan', 
  'organisasi',
  'seminar',
  'pagelaran',
];

function isModifiedEvent(event: MouseEvent<HTMLAnchorElement>) {
  return event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;
}

function redirectSidebarWheelToPage(event: WheelEvent<HTMLElement>) {
  if (event.ctrlKey) return;

  const scrollingElement = document.scrollingElement;
  if (!scrollingElement) return;

  event.preventDefault();

  const deltaScale =
    event.deltaMode === 1
      ? 16
      : event.deltaMode === 2
        ? window.innerHeight
        : 1;

  scrollingElement.scrollBy({
    top: event.deltaY * deltaScale,
    left: event.deltaX * deltaScale,
    behavior: 'auto',
  });
}

export function CategorySidebar({
  activeCategory,
  stats,
  unggulanCount,
  onCategoryChange,
  buildCategoryHref,
}: CategorySidebarProps) {
  const totalCount = Object.values(stats).reduce((a, b) => a + b, 0);

  const getCount = (key: CategoryFilter): number => {
    if (key === 'all') return totalCount;
    if (key === 'unggulan') return unggulanCount;
    return stats[key] || 0;
  };

  return (
    <>
      {/* Desktop Sidebar - Sticky */}
      <aside className="hidden lg:block w-60 xl:w-64 flex-shrink-0" onWheel={redirectSidebarWheelToPage}>
        <div className="sticky top-28 space-y-1.5">
          {/* Sidebar Header */}
          <div className="px-3 py-2 mb-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Kategori Prestasi
            </h3>
          </div>

          {/* Category Navigation */}
          <nav className="space-y-1">
            {categories.map((key) => {
              const config = CATEGORY_CONFIG[key];
              const Icon = config.icon;
              const isActive = activeCategory === key;
              const count = getCount(key);

              return (
                <a
                  key={key}
                  href={buildCategoryHref(key)}
                  onClick={(event) => {
                    if (isModifiedEvent(event)) return;
                    event.preventDefault();
                    onCategoryChange(key);
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left group',
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-soft' 
                      : 'hover:bg-muted/80 text-foreground'
                  )}
                >
                  {/* Icon Container */}
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0',
                    isActive 
                      ? 'bg-primary-foreground/20' 
                      : config.bgColor
                  )}>
                    <Icon className={cn(
                      'w-4 h-4 transition-colors',
                      isActive ? 'text-primary-foreground' : config.color
                    )} />
                  </div>

                  {/* Label - never truncated */}
                  <div className="flex-1 min-w-0">
                    <span className={cn(
                      'text-sm font-medium block leading-tight',
                      isActive ? 'text-primary-foreground' : 'text-foreground'
                    )}>
                      {config.label}
                    </span>
                  </div>

                  {/* Count Badge */}
                  <span className={cn(
                    'text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 min-w-[24px] text-center',
                    isActive 
                      ? 'bg-primary-foreground/20 text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  )}>
                    {count}
                  </span>
                </a>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile Horizontal Tabs */}
      <div className="lg:hidden mb-5 -mx-4 px-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 pb-2 min-w-max">
          {categories.map((key) => {
            const config = CATEGORY_CONFIG[key];
            const Icon = config.icon;
            const isActive = activeCategory === key;
            const count = getCount(key);

            return (
              <a
                key={key}
                href={buildCategoryHref(key)}
                onClick={(event) => {
                  if (isModifiedEvent(event)) return;
                  event.preventDefault();
                  onCategoryChange(key);
                }}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2.5 rounded-full transition-all duration-200 whitespace-nowrap',
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-soft' 
                    : 'bg-card border border-border/50 hover:bg-muted text-foreground'
                )}
              >
                <Icon className={cn(
                  'w-4 h-4',
                  isActive ? 'text-primary-foreground' : config.color
                )} />
                <span className="text-sm font-medium">
                  {config.shortLabel}
                </span>
                <span className={cn(
                  'text-xs font-semibold px-1.5 py-0.5 rounded-full',
                  isActive 
                    ? 'bg-primary-foreground/20 text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                )}>
                  {count}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </>
  );
}
