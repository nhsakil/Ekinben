/**
 * In-Memory Caching Service (FREE - No external dependencies)
 * Lightweight, fast caching for frequently accessed data
 * Perfect for single-instance deployments
 */

import { createLogger } from './logger.js';

const logger = createLogger('cache-service');

/**
 * Simple in-memory cache with TTL (Time To Live) support
 */
class CacheService {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  /**
   * Set a value in cache with optional TTL
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttlSeconds - Time to live in seconds (default: 300 = 5 minutes)
   */
  set(key, value, ttlSeconds = 300) {
    // Remove existing timer if any
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Store value
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttlSeconds
    });

    // Set expiration timer
    const timer = setTimeout(() => {
      this.delete(key);
      logger.debug(`Cache expired: ${key}`);
    }, ttlSeconds * 1000);

    this.timers.set(key, timer);

    logger.debug(`Cache set: ${key}`, { ttl: ttlSeconds });
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {*} - Cached value or null
   */
  get(key) {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // Check if expired
    const age = (Date.now() - item.timestamp) / 1000;
    if (age > item.ttl) {
      this.delete(key);
      return null;
    }

    logger.debug(`Cache hit: ${key}`);
    return item.value;
  }

  /**
   * Delete a value from cache
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.delete(key);

    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }

    logger.debug(`Cache deleted: ${key}`);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.forEach((_, key) => {
      if (this.timers.has(key)) {
        clearTimeout(this.timers.get(key));
      }
    });

    this.cache.clear();
    this.timers.clear();

    logger.info('Cache cleared');
  }

  /**
   * Get cache statistics
   * @returns {object} - Cache stats
   */
  getStats() {
    const stats = {
      totalKeys: this.cache.size,
      keys: Array.from(this.cache.keys()),
      memoryUsage: JSON.stringify(Array.from(this.cache.values())).length
    };

    return stats;
  }

  /**
   * Get or set value with fallback function
   * @param {string} key - Cache key
   * @param {Function} fallback - Function to call if not in cache
   * @param {number} ttl - TTL in seconds
   * @returns {Promise} - Cached or computed value
   */
  async getOrSet(key, fallback, ttl = 300) {
    const cached = this.get(key);

    if (cached) {
      return cached;
    }

    logger.debug(`Cache miss, computing: ${key}`);
    const value = await fallback();

    this.set(key, value, ttl);

    return value;
  }

  /**
   * Cache-aside pattern for database queries
   * @param {string} key - Cache key
   * @param {Function} queryFn - Async function that fetches data
   * @param {number} ttl - TTL in seconds
   * @returns {Promise} - Data from cache or database
   */
  async cacheQuery(key, queryFn, ttl = 300) {
    try {
      return await this.getOrSet(key, queryFn, ttl);
    } catch (error) {
      logger.error('Cache query error', error, { key });
      throw error;
    }
  }

  /**
   * Invalidate all keys matching a pattern
   * @param {string|RegExp} pattern - Pattern to match
   */
  invalidatePattern(pattern) {
    const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
    let count = 0;

    this.cache.forEach((_, key) => {
      if (regex.test(key)) {
        this.delete(key);
        count++;
      }
    });

    logger.info(`Invalidated ${count} cache keys matching pattern: ${pattern}`);
  }
}

// Create singleton instance
const cacheService = new CacheService();

/**
 * Express middleware for response caching
 * Usage: app.get('/api/products', responseCache('products', 300), controllerFunction);
 */
export const responseCache = (keyPrefix, ttlSeconds = 300) => {
  return (req, res, next) => {
    // Generate cache key from endpoint + query params
    const queryString = JSON.stringify(req.query);
    const cacheKey = `${keyPrefix}:${req.path}:${queryString}`;

    // Check cache
    const cached = cacheService.get(cacheKey);
    if (cached) {
      res.set('X-Cache', 'HIT');
      res.set('X-Cache-Key', cacheKey);
      return res.json(cached);
    }

    // Intercept res.json to cache the response
    const originalJson = res.json;
    res.json = function (data) {
      // Only cache successful responses
      if (res.statusCode === 200 && data && data.success !== false) {
        cacheService.set(cacheKey, data, ttlSeconds);
      }

      res.set('X-Cache', 'MISS');
      res.set('X-Cache-Key', cacheKey);

      originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Middleware to attach cache service to request
 */
export const cacheMiddleware = (req, res, next) => {
  req.cache = cacheService;
  next();
};

export default cacheService;
export { CacheService };
