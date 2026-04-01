import { Injectable } from '@angular/core';

interface CacheEntry {
  data: any;
  expiresAt: number; // absolute timestamp in ms
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private store = new Map<string, CacheEntry>();

  /**
   * Retrieve a cached value by key.
   * Returns `null` if the key does not exist or has expired.
   * Expired keys are deleted from the store automatically.
   */
  get(key: string): any | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key); // evict expired entry
      return null;
    }
    return entry.data;
  }

  /**
   * Store a value in the cache with an explicit TTL.
   * @param key   Cache key
   * @param data  Value to cache
   * @param ttlSeconds  Time-to-live in seconds (default: 60)
   */
  set(key: string, data: any, ttlSeconds: number = 60): void {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Delete a single key from the cache.
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Delete all keys whose names START WITH the given prefix.
   * Useful for invalidating a group of related endpoints at once.
   * e.g. invalidateByPrefix('homeSessions_') clears all paginated home-session entries.
   */
  invalidateByPrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Clear the entire cache (all keys).
   */
  clear(): void {
    this.store.clear();
  }
}
