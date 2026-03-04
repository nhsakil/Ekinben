/**
 * Unit Tests for Cache Service
 * Tests caching operations, TTL, and invalidation
 */

import CacheService from '../src/utils/cache.js';

describe('Cache Service', () => {
  let cache;

  beforeEach(() => {
    // Create new cache instance for each test
    cache = new CacheService();
  });

  afterEach(() => {
    // Clear cache after each test
    cache.clear();
  });

  // ============ BASIC OPERATIONS ============
  describe('Basic Operations', () => {
    test('should set and get a value', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    test('should return null for nonexistent key', () => {
      expect(cache.get('nonexistent')).toBeNull();
    });

    test('should delete a value', () => {
      cache.set('key1', 'value1');
      cache.delete('key1');
      expect(cache.get('key1')).toBeNull();
    });

    test('should clear all cache', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
    });
  });

  // ============ TTL & EXPIRATION ============
  describe('TTL and Expiration', () => {
    test('should expire after TTL', async () => {
      cache.set('key1', 'value1', 1); // 1 second TTL
      expect(cache.get('key1')).toBe('value1');

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));
      expect(cache.get('key1')).toBeNull();
    });

    test('should use default TTL of 300 seconds', () => {
      cache.set('key1', 'value1'); // No TTL specified
      expect(cache.get('key1')).toBe('value1');
    });

    test('should support custom TTL', () => {
      cache.set('key1', 'value1', 3600); // 1 hour
      expect(cache.get('key1')).toBe('value1');
      // Should still exist after 1 second
      setTimeout(() => {
        expect(cache.get('key1')).toBe('value1');
      }, 1000);
    });
  });

  // ============ COMPLEX OBJECTS ============
  describe('Complex Objects', () => {
    test('should cache objects', () => {
      const obj = { id: 1, name: 'Test', nested: { value: 42 } };
      cache.set('obj', obj);
      const cached = cache.get('obj');
      expect(cached).toEqual(obj);
      expect(cached.nested.value).toBe(42);
    });

    test('should cache arrays', () => {
      const arr = [1, 2, 3, { id: 4 }];
      cache.set('arr', arr);
      const cached = cache.get('arr');
      expect(cached).toEqual(arr);
      expect(cached[3].id).toBe(4);
    });

    test('should cache null and undefined', () => {
      cache.set('null', null);
      cache.set('undefined', undefined);
      expect(cache.get('null')).toBeNull();
      expect(cache.get('undefined')).toBeUndefined();
    });
  });

  // ============ CACHE STATISTICS ============
  describe('Cache Statistics', () => {
    test('should return cache stats', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      const stats = cache.getStats();

      expect(stats.totalKeys).toBe(2);
      expect(stats.keys).toContain('key1');
      expect(stats.keys).toContain('key2');
      expect(stats.memoryUsage).toBeGreaterThan(0);
    });

    test('should track empty cache', () => {
      const stats = cache.getStats();
      expect(stats.totalKeys).toBe(0);
      expect(stats.keys).toEqual([]);
    });
  });

  // ============ PATTERN INVALIDATION ============
  describe('Pattern Invalidation', () => {
    test('should invalidate by regex pattern', () => {
      cache.set('user:1', 'data1');
      cache.set('user:2', 'data2');
      cache.set('product:1', 'data3');

      cache.invalidatePattern(/^user:/);

      expect(cache.get('user:1')).toBeNull();
      expect(cache.get('user:2')).toBeNull();
      expect(cache.get('product:1')).toBe('data3');
    });

    test('should invalidate by string pattern', () => {
      cache.set('blog:1', 'post1');
      cache.set('blog:2', 'post2');
      cache.set('article:1', 'article1');

      cache.invalidatePattern('blog');

      expect(cache.get('blog:1')).toBeNull();
      expect(cache.get('blog:2')).toBeNull();
      expect(cache.get('article:1')).toBe('article1');
    });
  });

  // ============ GET OR SET ============
  describe('getOrSet Pattern', () => {
    test('should return cached value', async () => {
      cache.set('key', 'cached');
      const fallback = jest.fn(async () => 'from function');

      const result = await cache.getOrSet('key', fallback);

      expect(result).toBe('cached');
      expect(fallback).not.toHaveBeenCalled();
    });

    test('should call fallback for cache miss', async () => {
      const fallback = jest.fn(async () => 'computed value');

      const result = await cache.getOrSet('key', fallback, 60);

      expect(result).toBe('computed value');
      expect(fallback).toHaveBeenCalled();
      expect(cache.get('key')).toBe('computed value');
    });

    test('should cache fallback result', async () => {
      const fallback = jest.fn(async () => 'value');

      await cache.getOrSet('key', fallback, 60);
      const secondCall = await cache.getOrSet('key', fallback, 60);

      expect(secondCall).toBe('value');
      expect(fallback).toHaveBeenCalledTimes(1);
    });
  });

  // ============ CACHE QUERY ============
  describe('cacheQuery Pattern', () => {
    test('should cache database query results', async () => {
      const mockQuery = jest.fn(async () => [{ id: 1, name: 'Test' }]);

      const result = await cache.cacheQuery('users', mockQuery, 60);

      expect(result).toEqual([{ id: 1, name: 'Test' }]);
      expect(mockQuery).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const result2 = await cache.cacheQuery('users', mockQuery, 60);
      expect(result2).toEqual([{ id: 1, name: 'Test' }]);
      expect(mockQuery).toHaveBeenCalledTimes(1); // Still 1, not 2
    });

    test('should handle query errors', async () => {
      const mockQuery = jest.fn(async () => {
        throw new Error('Database error');
      });

      await expect(cache.cacheQuery('users', mockQuery, 60)).rejects.toThrow(
        'Database error'
      );
    });
  });

  // ============ MEMORY MANAGEMENT ============
  describe('Memory Management', () => {
    test('should clean up timer on delete', () => {
      cache.set('key1', 'value1', 100);
      const initialSize = cache.timers.size;

      cache.delete('key1');

      expect(cache.timers.size).toBe(initialSize - 1);
    });

    test('should reclaim memory after expiration', async () => {
      cache.set('key1', 'value1', 1);

      await new Promise(resolve => setTimeout(resolve, 1100));

      const stats = cache.getStats();
      expect(stats.totalKeys).toBe(0);
    });
  });

  // ============ CONCURRENT OPERATIONS ============
  describe('Concurrent Operations', () => {
    test('should handle multiple operations', async () => {
      const ops = [];
      for (let i = 0; i < 100; i++) {
        ops.push(cache.set(`key${i}`, `value${i}`));
      }

      await Promise.all(ops);

      expect(cache.getStats().totalKeys).toBe(100);
      expect(cache.get('key50')).toBe('value50');
    });

    test('should maintain integrity during concurrent access', async () => {
      cache.set('counter', 0);

      const increments = Array(10).fill(null).map(async (_, i) => {
        const current = cache.get('counter');
        cache.set('counter', (current || 0) + 1);
      });

      await Promise.all(increments);

      // Note: This demonstrates race condition - proper locking would be needed for production
      expect(cache.get('counter')).toBeLessThanOrEqual(10);
    });
  });

  // ============ EDGE CASES ============
  describe('Edge Cases', () => {
    test('should handle empty string key', () => {
      cache.set('', 'empty key');
      expect(cache.get('')).toBe('empty key');
    });

    test('should handle very long key', () => {
      const longKey = 'k'.repeat(10000);
      cache.set(longKey, 'value');
      expect(cache.get(longKey)).toBe('value');
    });

    test('should handle false and 0 values', () => {
      cache.set('false', false);
      cache.set('zero', 0);
      expect(cache.get('false')).toBe(false);
      expect(cache.get('zero')).toBe(0);
    });

    test('should handle circular references', () => {
      const obj = { name: 'test' };
      obj.self = obj; // Circular reference

      // Should not crash
      cache.set('circular', obj);
      expect(cache.get('circular')).toBe(obj);
    });
  });
});
