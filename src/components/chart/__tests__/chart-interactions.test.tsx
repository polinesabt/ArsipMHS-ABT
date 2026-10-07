import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Cell, Pie, PieChart } from 'recharts';
import { ActiveBarWithGuide, ActivePieSector, BarHoverGuide, categoryColor, createPieCalloutLabel, formatPiePercent, layoutPieCallouts, piePercent } from '../chart-interactions';

describe('chart interactions', () => {
  it('formats pie percentages from the displayed total without changing values', () => {
    expect(piePercent(25, 200)).toBe(12.5);
    expect(formatPiePercent(piePercent(25, 200))).toBe('12,5%');
    expect(piePercent(0, 0)).toBe(0);
  });

  it('keeps a category color when rows are reordered', () => {
    const before = ['Jurnal', 'Prosiding', 'Artikel'].map(categoryColor);
    const after = ['Artikel', 'Jurnal', 'Prosiding'].map(categoryColor);
    expect(after).toEqual([before[2], before[0], before[1]]);
  });

  it('gives nonzero pie slices callouts with nonoverlapping labels on each side', () => {
    const positions = layoutPieCallouts([36, 20, 12, 8, 7, 6, 5, 4, 2, 0], 170, 90, 90, -270, 2);
    expect(positions).toHaveLength(9);
    expect(positions.some((position) => position.index === 9)).toBe(false);
    for (const side of [-1, 1]) {
      const ordered = positions.filter((position) => position.side === side).sort((a, b) => a.y - b.y);
      for (let index = 1; index < ordered.length; index++) {
        expect(ordered[index].y - ordered[index - 1].y).toBeGreaterThanOrEqual(38);
      }
    }
  });

  it('renders pie leader lines, percentages, and an enlarged active sector', () => {
    const data = [{ name: 'S2', value: 75 }, { name: 'S3', value: 25 }];
    const markup = renderToStaticMarkup(
      <PieChart width={420} height={300}>
        <Pie
          data={data}
          dataKey="value"
          cx="50%"
          cy="50%"
          outerRadius={75}
          startAngle={90}
          endAngle={-270}
          activeIndex={1}
          activeShape={ActivePieSector}
          labelLine={false}
          label={createPieCalloutLabel(data)}
          isAnimationActive={false}
        >
          <Cell fill="#299b7b" />
          <Cell fill="#31518f" />
        </Pie>
      </PieChart>,
    );
    expect(markup).toContain('chart-pie-callout');
    expect(markup).toContain('chart-active-sector');
    expect(markup).toContain('25%');
  });

  it('orients a dashed bar guide with the bar layout', () => {
    const horizontalBars = renderToStaticMarkup(<BarHoverGuide x={10} y={20} width={100} height={30} layout="vertical" />);
    const verticalBars = renderToStaticMarkup(<BarHoverGuide x={10} y={20} width={100} height={30} layout="horizontal" />);
    expect(horizontalBars).toContain('y1="35" y2="35"');
    expect(verticalBars).toContain('x1="60" x2="60"');
    expect(renderToStaticMarkup(<ActiveBarWithGuide x={10} y={20} width={50} height={30} fill="#123456" />)).toContain('chart-bar-guide');
  });
});
