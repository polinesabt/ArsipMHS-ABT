import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { InsightDashboardEmbedded } from '@/components/insight/InsightDashboardEmbedded';

describe('InsightDashboardEmbedded', () => {
  it('renders all dashboard sections without a render exception', () => {
    const markup = renderToStaticMarkup(<InsightDashboardEmbedded section="all" />);

    expect(markup).toContain('Selamat datang di Dashboard Admin.');
    expect(markup).toContain('Diseminasi Ilmiah Mahasiswa');
    expect(markup).toContain('Luaran Riset &amp; Pengabdian');
  });
});
