import publications from '@/data/sinta-publications.json';

export function getSintaPublications(year?: number) {
  return publications.filter((item) => year === undefined || item.year === year);
}
