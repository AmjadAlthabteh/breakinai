/**
 * Smart cache manager with TTL, LRU eviction, and invalidation strategies
 */

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  ttl: number;
}

export interface CacheStats {
  size: number;
  maxSize: number;
  hits: number;
  misses: number;
  hitRate: number;
  evictions: number;
  invalidations: number;
}

export class CacheManager<T> {
  private cache: Map<string, CacheEntry<T>>;
  private defaultTTL: number;
  private maxSize: number;
  private stats: {
    hits: number;
    misses: number;
    evictions: number;
    invalidations: number;
  };

  constructor(options: { defaultTTL?: number; maxSize?: number } = {}) {
    this.cache = new Map();
    this.defaultTTL = options.defaultTTL || 60 * 60 * 1000; // 1 hour default
    this.maxSize = options.maxSize || 100;
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      invalidations: 0
    };
  }

  /**
   * Get value from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.invalidations++;
      return null;
    }

    // Update access info
    entry.accessCount++;
    entry.lastAccessed = now;
    this.stats.hits++;

    return entry.value;
  }

  /**
   * Set value in cache with optional custom TTL
   */
  set(key: string, value: T, ttl?: number): void {
    const now = Date.now();

    // Evict if at max size
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, {
      value,
      timestamp: now,
      accessCount: 1,
      lastAccessed: now,
      ttl: ttl || this.defaultTTL
    });
  }

  /**
   * Delete a specific cache entry
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.invalidations++;
    }
    return deleted;
  }

  /**
   * Invalidate cache entries matching a pattern
   */
  invalidatePattern(pattern: RegExp): number {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    this.stats.invalidations += count;
    return count;
  }

  /**
   * Invalidate all expired entries
   */
  cleanupExpired(): number {
    const now = Date.now();
    let count = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        count++;
      }
    }

    this.stats.invalidations += count;
    return count;
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
      this.stats.evictions++;
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.stats.invalidations += size;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      evictions: this.stats.evictions,
      invalidations: this.stats.invalidations
    };
  }

  /**
   * Check if cache has a key
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check expiration
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }
}

/**
 * Create a hash key from an object
 */
export function createCacheKey(obj: any): string {
  return JSON.stringify(obj, Object.keys(obj).sort());
}
