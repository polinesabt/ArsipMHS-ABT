import { Briefcase, Rocket, GraduationCap, Search, ChevronRight, MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CareerTimelineItem {
  id: string;
  year: number;
  status: 'bekerja' | 'wirausaha' | 'studi' | 'mencari';
  title: string;
  subtitle?: string;
  location?: string;
}

interface CareerTimelineProps {
  items: CareerTimelineItem[];
  maxItems?: number;
  contextText?: string;
  onViewAll?: () => void;
  onAddNew?: () => void;
  className?: string;
}

const STATUS_CONFIG = {
  bekerja: {
    icon: Briefcase,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
    nodeColor: 'bg-primary',
    label: 'Bekerja',
  },
  wirausaha: {
    icon: Rocket,
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
    nodeColor: 'bg-success',
    label: 'Wirausaha',
  },
  studi: {
    icon: GraduationCap,
    color: 'text-info',
    bgColor: 'bg-info/10',
    borderColor: 'border-info/30',
    nodeColor: 'bg-info',
    label: 'Studi Lanjut',
  },
  mencari: {
    icon: Search,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
    nodeColor: 'bg-warning',
    label: 'Mencari Kerja',
  },
};

export function CareerTimeline({ items, maxItems = 4, contextText, onViewAll, onAddNew, className }: CareerTimelineProps) {
  const displayItems = items.slice(0, maxItems);
  const hasMore = items.length > maxItems;

  if (items.length === 0) return null;

  return (
    <div className={cn('glass-card flex flex-col rounded-2xl p-5 sm:p-6', className)}>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground truncate">Riwayat Karir</h3>
            <p className="text-sm text-muted-foreground truncate">Riwayat karir Anda</p>
          </div>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground sm:flex-shrink-0">
          {items.length} entri
        </span>
      </div>

      {/* Timeline */}
      <div className="relative flex-1">
        {/* Timeline line */}
        <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-4">
          {displayItems.map((item, index) => {
            const config = STATUS_CONFIG[item.status];
            const Icon = config.icon;
            const isLast = index === displayItems.length - 1;

            return (
              <div 
                key={item.id} 
                className={cn(
                  'relative flex gap-4 pb-4',
                  !isLast && 'border-b border-transparent'
                )}
              >
                {/* Year & Node */}
                <div className="flex flex-col items-center w-10 flex-shrink-0">
                  <span className="text-xs font-semibold text-muted-foreground mb-2">{item.year}</span>
                  <div className={cn('w-3 h-3 rounded-full z-10', config.nodeColor)} />
                </div>

                {/* Content Card */}
                <div 
                  className={cn(
                    'flex-1 p-4 rounded-xl border transition-all duration-200 min-w-0',
                    'hover:shadow-soft hover:-translate-y-0.5 cursor-pointer',
                    config.bgColor, config.borderColor
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', config.bgColor)}>
                      <Icon className={cn('w-4 h-4', config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', config.bgColor, config.color)}>
                          {config.label}
                        </span>
                      </div>
                      <h4 className="font-semibold text-foreground break-words">{item.title}</h4>
                      {item.subtitle && (
                        <p className="text-sm text-muted-foreground break-words">{item.subtitle}</p>
                      )}
                      {item.location && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="break-words">{item.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Context Text */}
      {contextText && (
        <p className="text-xs text-muted-foreground italic mt-4">{contextText}</p>
      )}

      {/* Actions */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        {(hasMore || onViewAll) && (
          <Button variant="ghost" className="flex-1" onClick={onViewAll}>
            Lihat semua karir
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
        {onAddNew && (
          <Button variant="outline" className="flex-1" onClick={onAddNew}>
            <Plus className="w-4 h-4 mr-1" />
            Tambah Karir
          </Button>
        )}
      </div>
    </div>
  );
}
