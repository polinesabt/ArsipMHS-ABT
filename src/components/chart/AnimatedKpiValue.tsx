import { useCallback, useLayoutEffect, useRef } from 'react';
import { animate, useReducedMotion } from 'framer-motion';

interface AnimatedKpiValueProps {
  value: number | string;
  enabled?: boolean;
  format?: (value: number) => string;
}

export function AnimatedKpiValue({ value, enabled = true, format }: AnimatedKpiValueProps) {
  const textRef = useRef<HTMLSpanElement>(null);
  const currentRef = useRef<number | null>(null);
  const reduced = Boolean(useReducedMotion());
  const match = typeof value === 'string' ? /^(-?\d+(?:\.\d+)?)(%?)$/.exec(value.trim()) : null;
  const numeric = typeof value === 'number' ? value : match ? Number(match[1]) : null;
  const suffix = match?.[2] ?? '';
  const decimals = match?.[1].split('.')[1]?.length ?? (typeof value === 'number' ? (String(value).split('.')[1]?.length ?? 0) : 0);
  const render = useCallback((number: number) => format
    ? format(number)
    : typeof value === 'number'
      ? number.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
      : `${number.toFixed(decimals)}${suffix}`, [format, value, decimals, suffix]);
  const finalText = numeric === null ? String(value) : render(numeric);

  useLayoutEffect(() => {
    if (!textRef.current) return;
    if (numeric === null) {
      textRef.current.textContent = String(value);
      return;
    }

    const from = currentRef.current ?? 0;
    if (!enabled) {
      textRef.current.textContent = render(numeric);
      currentRef.current = numeric;
      return;
    }
    if (reduced || from === numeric) {
      textRef.current.textContent = render(numeric);
      currentRef.current = numeric;
      return;
    }

    textRef.current.textContent = render(from);

    const controls = animate(from, numeric, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (current) => {
        currentRef.current = current;
        if (textRef.current) textRef.current.textContent = render(current);
      },
    });
    return () => controls.stop();
  }, [numeric, enabled, reduced, value, render]);

  return <span className="tabular-nums"><span className="sr-only">{finalText}</span><span ref={textRef} aria-hidden="true" /></span>;
}
