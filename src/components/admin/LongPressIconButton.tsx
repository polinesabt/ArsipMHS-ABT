import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { m, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

const LONG_PRESS_DELAY = 500;
const TOOLTIP_HIDE_DELAY = 1200;
const MOVE_TOLERANCE = 10;

interface LongPressIconButtonProps
  extends Omit<ComponentPropsWithoutRef<typeof m.button>, 'children'> {
  label: string;
  icon: React.ReactNode;
  visibleLabel?: string;
  onActivate?: () => void;
  active?: boolean;
  danger?: boolean;
  tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
}

export const LongPressIconButton = forwardRef<HTMLButtonElement, LongPressIconButtonProps>(
  (
    {
      label,
      icon,
      visibleLabel,
      onActivate,
      active = false,
      danger = false,
      tooltipSide = 'top',
      className,
      disabled,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onPointerLeave,
      onContextMenu,
      onClick,
      onFocus,
      onBlur,
      ...buttonProps
    },
    forwardedRef,
  ) => {
    const shouldReduceMotion = useReducedMotion();
    const tooltipId = useId();
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const suppressClickRef = useRef(false);
    const pointerOriginRef = useRef<{ x: number; y: number } | null>(null);

    const clearLongPressTimer = () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    };

    const clearHideTimer = () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };

    const scheduleTooltipClose = () => {
      clearHideTimer();
      hideTimerRef.current = setTimeout(() => setTooltipOpen(false), TOOLTIP_HIDE_DELAY);
    };

    useEffect(() => {
      return () => {
        clearLongPressTimer();
        clearHideTimer();
      };
    }, []);

    const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
      onPointerDown?.(event);
      if (event.defaultPrevented || disabled || event.button !== 0) return;

      clearLongPressTimer();
      clearHideTimer();
      suppressClickRef.current = false;
      pointerOriginRef.current = { x: event.clientX, y: event.clientY };
      longPressTimerRef.current = setTimeout(() => {
        suppressClickRef.current = true;
        setTooltipOpen(true);
        scheduleTooltipClose();
      }, LONG_PRESS_DELAY);
    };

    const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
      onPointerMove?.(event);
      const origin = pointerOriginRef.current;
      if (!origin) return;

      if (
        Math.abs(event.clientX - origin.x) > MOVE_TOLERANCE ||
        Math.abs(event.clientY - origin.y) > MOVE_TOLERANCE
      ) {
        clearLongPressTimer();
      }
    };

    const endPointerInteraction = () => {
      clearLongPressTimer();
      pointerOriginRef.current = null;
    };

    return (
      <TooltipPrimitive.Provider delayDuration={0} skipDelayDuration={0}>
        <TooltipPrimitive.Root open={tooltipOpen} onOpenChange={setTooltipOpen}>
          <TooltipPrimitive.Trigger asChild>
            <m.button
              ref={forwardedRef}
              type="button"
              aria-label={label}
              aria-describedby={tooltipOpen ? tooltipId : undefined}
              disabled={disabled}
              className={cn(
                'relative inline-flex min-h-11 min-w-11 select-none touch-manipulation items-center justify-center rounded-xl outline-none transition-colors',
                visibleLabel && 'flex-col gap-1 px-1 py-1.5',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                active && 'bg-primary/15 text-primary',
                !active && !danger && 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                danger && 'text-destructive hover:bg-destructive/10',
                disabled && 'pointer-events-none opacity-45',
                className,
              )}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={(event) => {
                onPointerUp?.(event);
                endPointerInteraction();
              }}
              onPointerCancel={(event) => {
                onPointerCancel?.(event);
                endPointerInteraction();
              }}
              onPointerLeave={(event) => {
                onPointerLeave?.(event);
                endPointerInteraction();
              }}
              onClick={(event) => {
                if (suppressClickRef.current) {
                  event.preventDefault();
                  event.stopPropagation();
                  suppressClickRef.current = false;
                  return;
                }
                onClick?.(event);
                if (event.defaultPrevented) return;
                onActivate?.();
              }}
              onContextMenu={(event) => {
                onContextMenu?.(event);
                event.preventDefault();
              }}
              onFocus={(event) => {
                onFocus?.(event);
                if (event.currentTarget.matches(':focus-visible')) {
                  clearHideTimer();
                  setTooltipOpen(true);
                }
              }}
              onBlur={(event) => {
                onBlur?.(event);
                clearHideTimer();
                setTooltipOpen(false);
              }}
              {...buttonProps}
            >
              {icon}
              {visibleLabel && (
                <span
                  aria-hidden="true"
                  className="line-clamp-2 max-w-full text-center text-[9px] font-medium leading-[10px]"
                >
                  {visibleLabel}
                </span>
              )}
            </m.button>
          </TooltipPrimitive.Trigger>
          <TooltipPrimitive.Portal>
            <TooltipPrimitive.Content
              id={tooltipId}
              side={tooltipSide}
              sideOffset={8}
              collisionPadding={8}
              className="z-[240] max-w-48 rounded-md border border-border bg-popover px-2.5 py-1.5 text-center text-xs font-medium leading-snug text-popover-foreground shadow-elevated motion-reduce:animate-none"
            >
              {label}
              <TooltipPrimitive.Arrow className="fill-popover" />
            </TooltipPrimitive.Content>
          </TooltipPrimitive.Portal>
        </TooltipPrimitive.Root>
      </TooltipPrimitive.Provider>
    );
  },
);

LongPressIconButton.displayName = 'LongPressIconButton';
