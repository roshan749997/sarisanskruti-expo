/** In-memory cache for the app session — avoids refetch when revisiting screens */

const store: Record<string, unknown> = {};

export function getSessionCache<T>(key: string): T | null {
  const value = store[key];
  if (value === undefined || value === null) return null;
  return value as T;
}

export function setSessionCache(key: string, data: unknown): void {
  store[key] = data;
}

export function hasSessionCache(key: string): boolean {
  return store[key] !== undefined && store[key] !== null;
}

export function invalidateSessionCache(prefix: string): void {
  Object.keys(store).forEach((key) => {
    if (key === prefix || key.startsWith(`${prefix}:`)) {
      delete store[key];
    }
  });
}

export function clearSessionCache(): void {
  Object.keys(store).forEach((key) => delete store[key]);
}

export function productListCacheKey(category?: string, search?: string): string {
  if (search?.trim()) return `products:search:${search.trim().toLowerCase()}`;
  if (category?.trim()) return `products:category:${category.trim().toLowerCase()}`;
  return 'products:all';
}

export function peekProductList(category?: string, search?: string): any[] | null {
  const raw = getSessionCache<any>(productListCacheKey(category, search));
  if (!raw) return null;
  return Array.isArray(raw) ? raw : raw?.results || raw?.products || [];
}

export function peekProduct(id: string): any | null {
  return getSessionCache(`product:${id}`);
}

