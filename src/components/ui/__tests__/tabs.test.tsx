import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

describe('TabsList', () => {
  it('renders compact tabs without a scroll container', () => {
    const markup = renderToStaticMarkup(
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Semua</TabsTrigger>
          <TabsTrigger value="academic">Akademik</TabsTrigger>
          <TabsTrigger value="nonAcademic">Non Akademik</TabsTrigger>
        </TabsList>
      </Tabs>,
    );

    expect(markup).toContain('overflow-hidden');
    expect(markup).toContain('min-h-10');
    expect(markup).not.toContain('overflow-x-auto');
    expect(markup).not.toContain('scrollbar-thin');
    expect(markup).not.toContain('sm:h-10');
  });
});
