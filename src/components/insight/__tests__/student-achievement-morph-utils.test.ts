import { describe, expect, it } from 'vitest';
import { createFallbackBarRect } from '@/components/insight/sections/student-achievement-morph-utils';

describe('student achievement morph geometry', () => {
  it('keeps all three fallback bars inside the fixed chart stage', () => {
    const rects = [12, 24, 36].map((value, index) => createFallbackBarRect(index, value, 36, 620, 320));

    expect(rects).toHaveLength(3);
    expect(rects.every((rect) => rect.x >= 0 && rect.y >= 0)).toBe(true);
    expect(rects.every((rect) => rect.x + rect.width <= 620 && rect.y + rect.height <= 320)).toBe(true);
    expect(rects[0].x).toBeLessThan(rects[1].x);
    expect(rects[1].x).toBeLessThan(rects[2].x);
  });

  it('gives zero values a visible two-pixel destination at the baseline', () => {
    const rect = createFallbackBarRect(1, 0, 0, 360, 300);

    expect(rect.height).toBe(2);
    expect(rect.y + rect.height).toBe(262);
  });

  it('scales fallback heights proportionally on mobile', () => {
    const half = createFallbackBarRect(0, 5, 10, 320, 300);
    const full = createFallbackBarRect(1, 10, 10, 320, 300);

    expect(full.height).toBeCloseTo(half.height * 2);
  });
});
