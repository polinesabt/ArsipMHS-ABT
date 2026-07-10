// Simple event emitter untuk trigger cache invalidation
type CacheInvalidationListener = () => void;

const listeners: Set<CacheInvalidationListener> = new Set();

export function onInsightCacheInvalidate(callback: CacheInvalidationListener): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function invalidateInsightCache(): void {
  listeners.forEach(callback => callback());
}
