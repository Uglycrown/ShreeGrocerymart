// Ultra-fast in-memory cache for Vercel Edge
// This cache persists across requests in the same serverless instance

interface CacheEntry<T> {
    data: T
    timestamp: number
    ttl: number
}

class ServerCache {
    private cache: Map<string, CacheEntry<any>> = new Map()

    get<T>(key: string): T | null {
        const entry = this.cache.get(key)
        if (!entry) return null

        // Check if expired
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key)
            return null
        }

        return entry.data as T
    }

    set<T>(key: string, data: T, ttlMs: number = 60000): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl: ttlMs,
        })
    }

    invalidate(key: string): void {
        this.cache.delete(key)
    }

    invalidatePattern(pattern: string): void {
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key)
            }
        }
    }

    clear(): void {
        this.cache.clear()
    }
}

// Singleton instance
export const serverCache = new ServerCache()

// Cache keys
export const CACHE_KEYS = {
    CATEGORIES: 'categories:all',
    PRODUCTS_ALL: 'products:all',
    PRODUCTS_FEATURED: 'products:featured',
    BANNERS: 'banners:all',
} as const

// TTL values (in milliseconds)
export const CACHE_TTL = {
    CATEGORIES: 5 * 60 * 1000,    // 5 minutes
    PRODUCTS: 2 * 60 * 1000,       // 2 minutes
    BANNERS: 10 * 60 * 1000,       // 10 minutes
} as const
