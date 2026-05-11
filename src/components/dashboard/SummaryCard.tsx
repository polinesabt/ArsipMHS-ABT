import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  icon: ReactNode;
  iconBgClass?: string;
  primaryLabel?: string;
  primaryValue?: string;
  secondaryLabel?: string;
  secondaryValue?: string;
  highlight?: {
    label: string;
    value: string;
  };
  /** Contextual text like "Menampilkan X dari Y" */
  contextText?: string;
  ctaLabel: string;
  ctaVariant?: 'default' | 'secondary' | 'outline';
  onCtaClick: () => void;
  className?: string;
}

export function SummaryCard({
  title,
  icon,
  iconBgClass = 'bg-primary/10',
  primaryLabel,
  primaryValue,
  secondaryLabel,
  secondaryValue,
  highlight,
  contextText,
  ctaLabel,
  ctaVariant = 'default',
  onCtaClick,
  className,
}: SummaryCardProps) {
  return (
    <div 
      className={cn(
        'glass-card group flex flex-col rounded-2xl p-5 transition-all duration-300 hover:shadow-elevated sm:p-6',
        className
      )}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className={cn('flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12', iconBgClass)}>
          {icon}
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform flex-shrink-0" />
      </div>

      {/* Title */}
      <h3 className="font-semibold text-foreground mb-4 break-words">{title}</h3>

      {/* Content - auto-expand */}
      <div className="mb-5 flex-1 space-y-3">
        {primaryLabel && primaryValue && (
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm text-muted-foreground flex-shrink-0">{primaryLabel}</span>
            <span className="font-semibold text-foreground text-right break-words">{primaryValue}</span>
          </div>
        )}

        {secondaryLabel && secondaryValue && (
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm text-muted-foreground flex-shrink-0">{secondaryLabel}</span>
            <span className="text-sm text-foreground text-right break-words">{secondaryValue}</span>
          </div>
        )}

        {highlight && (
          <div className="p-3 rounded-xl bg-muted/50">
            <p className="text-xs text-muted-foreground mb-0.5">{highlight.label}</p>
            <p className="font-medium text-foreground text-sm break-words">{highlight.value}</p>
          </div>
        )}

        {contextText && (
          <p className="text-xs text-muted-foreground italic pt-1">{contextText}</p>
        )}
      </div>

      {/* CTA */}
      <Button 
        variant={ctaVariant} 
        className="w-full flex-shrink-0" 
        onClick={onCtaClick}
      >
        {ctaLabel}
      </Button>
    </div>
  );
}
