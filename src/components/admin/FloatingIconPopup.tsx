import type { ReactNode } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { AnimatePresence, m, useReducedMotion, type Variants } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LongPressIconButton } from '@/components/admin/LongPressIconButton';

const BACKDROP_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const PANEL_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 420, damping: 34, mass: 0.72 },
  },
  exit: {
    opacity: 0,
    y: 5,
    scale: 0.985,
    transition: { duration: 0.12 },
  },
};

const REDUCED_PANEL_VARIANTS: Variants = {
  hidden: { opacity: 1, y: 0, scale: 1 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 1, y: 0, scale: 1 },
};

export interface FloatingIconPopupItem {
  id: string;
  label: string;
  displayLabel?: string;
  icon: LucideIcon;
  active?: boolean;
  danger?: boolean;
  onSelect: () => void;
}

interface FloatingPopoverSurfaceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  ariaLabel: string;
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  fullWidth?: boolean;
  className?: string;
  contentRole?: 'menu' | 'dialog';
}

export function FloatingPopoverSurface({
  open,
  onOpenChange,
  trigger,
  ariaLabel,
  children,
  side = 'top',
  align = 'center',
  sideOffset = 12,
  fullWidth = false,
  className,
  contentRole = 'menu',
}: FloatingPopoverSurfaceProps) {
  const shouldReduceMotion = useReducedMotion();
  const panelVariants = shouldReduceMotion ? REDUCED_PANEL_VARIANTS : PANEL_VARIANTS;

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange} modal={false}>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal forceMount>
        <AnimatePresence>
          {open && (
            <m.button
              key="floating-popover-backdrop"
              type="button"
              aria-label={`Tutup ${ariaLabel}`}
              className="fixed inset-0 z-[180] cursor-default bg-background/10 backdrop-blur-[2px]"
              variants={BACKDROP_VARIANTS}
              initial={shouldReduceMotion ? false : 'hidden'}
              animate="visible"
              exit="hidden"
              transition={{ duration: shouldReduceMotion ? 0 : 0.14 }}
              onClick={() => onOpenChange(false)}
            />
          )}
          {open && (
            <PopoverPrimitive.Content
              key="floating-popover-content"
              forceMount
              asChild
              side={side}
              align={align}
              sideOffset={sideOffset}
              collisionPadding={12}
              avoidCollisions
            >
              <m.div
                key="floating-popover-panel"
                role={contentRole}
                aria-label={ariaLabel}
                variants={panelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={cn(
                  'z-[220] max-h-[45dvh] overflow-y-auto overscroll-contain rounded-2xl border border-border/80 bg-popover/95 p-3 text-popover-foreground shadow-elevated outline-none backdrop-blur-xl',
                  fullWidth ? 'w-[calc(100vw-24px)]' : 'w-auto max-w-[calc(100vw-24px)]',
                  className,
                )}
              >
                {children}
              </m.div>
            </PopoverPrimitive.Content>
          )}
        </AnimatePresence>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

interface FloatingIconPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  items: FloatingIconPopupItem[];
  columns: 3 | 4;
  ariaLabel: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  fullWidth?: boolean;
  className?: string;
  compact?: boolean;
}

export function FloatingIconPopup({
  open,
  onOpenChange,
  trigger,
  items,
  columns,
  ariaLabel,
  side,
  align,
  sideOffset,
  fullWidth = false,
  className,
  compact = false,
}: FloatingIconPopupProps) {
  return (
    <FloatingPopoverSurface
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
      ariaLabel={ariaLabel}
      side={side}
      align={align}
      sideOffset={sideOffset}
      fullWidth={fullWidth}
      className={className}
    >
      <div
        className={cn(
          'grid',
          compact ? 'gap-1.5' : 'gap-2',
          columns === 4 ? 'grid-cols-4' : 'grid-cols-3',
        )}
      >
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <LongPressIconButton
              key={item.id}
              label={item.label}
              visibleLabel={item.displayLabel}
              icon={<Icon className="h-5 w-5" aria-hidden="true" />}
              active={item.active}
              danger={item.danger}
              role="menuitem"
              aria-current={item.active ? 'page' : undefined}
              className={cn(
                'min-h-12 w-full rounded-lg border border-border/50 bg-muted/70 hover:border-primary/35 hover:bg-primary/10 hover:text-primary',
                compact ? 'h-[3.75rem]' : 'aspect-square',
              )}
              onActivate={() => {
                onOpenChange(false);
                item.onSelect();
              }}
            />
          );
        })}
      </div>
    </FloatingPopoverSurface>
  );
}
