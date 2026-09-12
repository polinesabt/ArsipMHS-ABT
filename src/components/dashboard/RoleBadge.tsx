/**
 * RoleBadge Component
 * Prominent role indicator for student dashboard
 * 
 * DESIGN RULES:
 * - Always visible, non-dismissible
 * - Clear color semantics
 * - Positioned near student name
 */

import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROLE_CONFIG } from '@/lib/role-utils';
import type { StudentStatus } from '@/types/student.types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface RoleBadgeProps {
  role: StudentStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function RoleBadge({ 
  role, 
  showIcon = true,
  size = 'md',
  className 
}: RoleBadgeProps) {
  const config = ROLE_CONFIG[role];
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-4 py-1.5 text-base gap-2',
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span 
            className={cn(
              'inline-flex items-center rounded-full font-medium',
              'border cursor-help transition-all duration-200',
              'hover:shadow-soft',
              config.bgColor,
              config.color,
              config.borderColor,
              sizeClasses[size],
              className
            )}
          >
            {showIcon && <User className={cn(iconSizes[size])} />}
            <span className={cn('rounded-full shrink-0', config.dotColor, size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2')} />
            <span>{config.label}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
