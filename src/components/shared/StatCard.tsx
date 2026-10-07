import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedKpiValue } from '@/components/chart/AnimatedKpiValue';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'destructive' | 'info';
  className?: string;
  animate?: boolean;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'primary',
  className,
  animate = true,
}: StatCardProps) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    destructive: 'bg-destructive/10 text-destructive',
    info: 'bg-info/10 text-info',
  };

  return (
    <div
      className={cn(
        "stat-card group cursor-default",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-xs text-muted-foreground sm:text-sm">{title}</p>
          <p className="text-2xl font-bold text-foreground tabular-nums sm:text-3xl">
            <AnimatedKpiValue value={value} enabled={animate} />
          </p>
          {trend && (
            <div className="mt-2 flex flex-wrap items-center gap-1">
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-success" : "text-destructive"
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">vs bulan lalu</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 sm:h-12 sm:w-12",
            colorClasses[color]
          )}
        >
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
      </div>
    </div>
  );
}
