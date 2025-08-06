import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
}

class SmartCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private readonly ttl: number;
  private readonly maxSize: number;

  constructor(options: CacheOptions = {}) {
    this.ttl = options.ttl || 5 * 60 * 1000; // 5 minutes par défaut
    this.maxSize = options.maxSize || 100;
  }

  set(key: string, data: T): void {
    const now = Date.now();
    
    // Nettoyer le cache si il est plein
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + this.ttl
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    
    // Vérifier si l'entrée a expiré
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Supprimer les entrées expirées
    entries.forEach(([key, entry]) => {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    });

    // Si toujours trop d'entrées, supprimer les plus anciennes
    if (this.cache.size >= this.maxSize) {
      const sortedEntries = entries
        .filter(([key]) => this.cache.has(key))
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);
      
      const toDelete = Math.floor(this.maxSize * 0.2); // Supprimer 20% des entrées
      for (let i = 0; i < toDelete && i < sortedEntries.length; i++) {
        this.cache.delete(sortedEntries[i][0]);
      }
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0 // TODO: Implémenter le suivi des hits/misses
    };
  }
}

// Cache global pour les données partagées
const globalCache = new SmartCache<any>({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 200
});

export function useOptimizedCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions & { enabled?: boolean } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const { enabled = true, ...cacheOptions } = options;

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled) return;

    // Annuler la requête précédente si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Vérifier le cache d'abord (sauf si forceRefresh)
    if (!forceRefresh) {
      const cachedData = globalCache.get(key);
      if (cachedData !== null) {
        setData(cachedData);
        setError(null);
        return cachedData;
      }
    }

    setLoading(true);
    setError(null);
    
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const result = await fetcher();
      
      // Vérifier si la requête n'a pas été annulée
      if (!abortController.signal.aborted) {
        globalCache.set(key, result);
        setData(result);
        setError(null);
        return result;
      }
    } catch (err) {
      if (!abortController.signal.aborted) {
        const error = err instanceof Error ? err : new Error('An error occurred');
        setError(error);
        setData(null);
        throw error;
      }
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
      abortControllerRef.current = null;
    }
  }, [key, fetcher, enabled]);

  const invalidate = useCallback(() => {
    globalCache.invalidate(key);
  }, [key]);

  const invalidatePattern = useCallback((pattern: string) => {
    globalCache.invalidatePattern(pattern);
  }, []);

  useEffect(() => {
    fetchData();
    
    // Nettoyer lors du démontage
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
    invalidate,
    invalidatePattern,
    isFromCache: !loading && data !== null && globalCache.has(key)
  };
}

// Hook pour précharger des données
export function usePrefetch() {
  const prefetch = useCallback(async <T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ) => {
    // Ne précharger que si pas déjà en cache
    if (!globalCache.has(key)) {
      try {
        const data = await fetcher();
        globalCache.set(key, data);
      } catch (error) {
        console.warn(`Prefetch failed for key: ${key}`, error);
      }
    }
  }, []);

  return { prefetch };
}

export { globalCache };