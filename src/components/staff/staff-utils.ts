export function staffInitials(name?: string): string {
  if (!name) return 'AB';
  return name
    .replace(/^(Dr\.|Prof\.|Ir\.|Dra\.|Drs\.)\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'AB';
}
