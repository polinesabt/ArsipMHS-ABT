import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useInsightDashboard } from '@/contexts/InsightDashboardContext';

interface DashboardCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  interpretation?: string;
  className?: string;
  headerAction?: ReactNode;
}

export function DashboardCard({
  title,
  description,
  children,
  interpretation,
  className,
  headerAction,
}: DashboardCardProps) {
  const { presentationMode } = useInsightDashboard();

  return (
    <div
      className={cn(
        'dashboard-card animate-fade-in',
        presentationMode && 'p-8',
        className
      )}
    >
      <div className="dashboard-card-header">
        <div>
          <h3 className={cn('dashboard-card-title', presentationMode && 'text-xl')}>
            {title}
          </h3>
          {description && (
            <p className="dashboard-card-description">{description}</p>
          )}
        </div>
        {headerAction}
      </div>

      <div className="min-h-[280px]">{children}</div>

      {interpretation && (
        <div className={cn('interpretation-text', presentationMode && 'text-base p-5')}>
          <strong className="text-foreground">Interpretasi:</strong> {interpretation}
        </div>
      )}
    </div>
  );
}