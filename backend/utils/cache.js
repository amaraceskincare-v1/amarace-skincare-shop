/**
 * Backend Cache Utility
 * Provides a simple in-memory caching layer with TTL support
 */

class Cache {
    constructor() {
        this.cache = new Map();
        this.timers = new Map();
    }

    /**
     * Set a cache item with optional TTL (time to live in seconds)
     */
    set(key, value, ttl = null) {
        try {
            // Clear existing timer if any
            if (this.timers.has(key)) {
                clearTimeout(this.timers.get(key));
                this.timers.delete(key);
            }

            // Set the cache value
            this.cache.set(key, {
                value,
                timestamp: Date.now(),
                ttl: ttl ? ttl * 1000 : null
            });

            // Set up auto-expiration if TTL is provided
            if (ttl) {
                const timer = setTimeout(() => {
                    this.delete(key);
                }, ttl * 1000);
                this.timers.set(key, timer);
            }

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
            const cached = this.cache.get(key);

            if (!cached) return null;

            // Check if expired
            if (cached.ttl && (Date.now() - cached.timestamp) > cached.ttl) {
                this.delete(key);
                return null;
            }

            return cached.value;
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
            // Clear timer if exists
            if (this.timers.has(key)) {
                clearTimeout(this.timers.get(key));
                this.timers.delete(key);
            }

            this.cache.delete(key);
            return true;
        } catch (error) {
            console.error('Cache delete error:', error);
            return false;
        }
    }

    /**
     * Clear all cache items
     */
    clear() {
        try {
            // Clear all timers
            this.timers.forEach(timer => clearTimeout(timer));
            this.timers.clear();

            // Clear cache
            this.cache.clear();
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

    /**
     * Get the number of cached items
     */
    size() {
        return this.cache.size;
    }

    /**
     * Get all cache keys
     */
    keys() {
        return Array.from(this.cache.keys());
    }
}

// Create and export a default instance
const cache = new Cache();

module.exports = cache;
module.exports.Cache = Cache;
