export interface RectGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function createFallbackBarRect(
  index: number,
  value: number,
  maxValue: number,
  width: number,
  height: number,
): RectGeometry {
  const plotLeft = Math.min(64, width * 0.16);
  const plotRight = Math.max(plotLeft + 80, width - 12);
  const plotTop = 18;
  const plotBottom = Math.max(plotTop + 80, height - 38);
  const plotHeight = plotBottom - plotTop;
  const bandWidth = (plotRight - plotLeft) / 3;
  const barWidth = Math.min(72, bandWidth * 0.58);
  const normalized = maxValue > 0 ? value / maxValue : 0;
  const barHeight = Math.max(2, normalized * plotHeight * 0.84);

  return {
    x: plotLeft + index * bandWidth + (bandWidth - barWidth) / 2,
    y: plotBottom - barHeight,
    width: barWidth,
    height: barHeight,
  };
}
