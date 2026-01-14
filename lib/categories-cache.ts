// Shared cache for categories
export const categoriesCache = {
  data: null as any[] | null,
  timestamp: 0,
}

export const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function invalidateCategoriesCache() {
  categoriesCache.data = null
  categoriesCache.timestamp = 0
}
