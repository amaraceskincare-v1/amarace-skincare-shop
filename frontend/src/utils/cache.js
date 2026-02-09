/**
 * Frontend Cache Utility
 * Provides a simple caching layer using localStorage/sessionStorage
 */

class Cache {
    constructor(storage = 'local') {
        this.storage = storage === 'session' ? sessionStorage : localStorage;
        this.prefix = 'app_cache_';
    }

    /**
     * Set a cache item with optional TTL (time to live in seconds)
     */
    set(key, value, ttl = null) {
        try {
            const cacheKey = this.prefix + key;
            const cacheData = {
                value,
                timestamp: Date.now(),
                ttl: ttl ? ttl * 1000 : null // Convert to milliseconds
            };
            this.storage.setItem(cacheKey, JSON.stringify(cacheData));
            return true;
        } catch (error) {
            console.error('Cache set error:', error);
            return false;
        }
    }

    /**
     * Get a cache item (returns null if expired or not found)
     */
    get(key) {
        try {
            const cacheKey = this.prefix + key;
            const cached = this.storage.getItem(cacheKey);

            if (!cached) return null;

            const cacheData = JSON.parse(cached);

            // Check if expired
            if (cacheData.ttl && (Date.now() - cacheData.timestamp) > cacheData.ttl) {
                this.delete(key);
                return null;
            }

            return cacheData.value;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    /**
     * Delete a cache item
     */
    delete(key) {
        try {
            const cacheKey = this.prefix + key;
            this.storage.removeItem(cacheKey);
            return true;
        } catch (error) {
            console.error('Cache delete error:', error);
            return false;
        }
    }

    /**
     * Clear all cache items with the prefix
     */
    clear() {
        try {
            const keys = Object.keys(this.storage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    this.storage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('Cache clear error:', error);
            return false;
        }
    }

    /**
     * Check if a cache item exists and is valid
     */
    has(key) {
        return this.get(key) !== null;
    }
}

// Create default instances
export const localCache = new Cache('local');
export const sessionCache = new Cache('session');

export default Cache;
