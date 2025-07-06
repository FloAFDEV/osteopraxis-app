import { QueryClient } from '@tanstack/react-query';

interface CacheEntry {
  data: any;
  timestamp: number;
  priority: 'high' | 'medium' | 'low';
  accessCount: number;
  lastAccess: number;
}

interface SmartCacheConfig {
  maxSize: number;
  ttl: number;
  cleanupInterval: number;
}

export class SmartCacheService {
  private cache = new Map<string, CacheEntry>();
  private config: SmartCacheConfig;
  private cleanupTimer?: NodeJS.Timeout;
  private queryClient?: QueryClient;

  constructor(config: Partial<SmartCacheConfig> = {}) {
    this.config = {
      maxSize: 100,
      ttl: 5 * 60 * 1000, // 5 minutes
      cleanupInterval: 60 * 1000, // 1 minute
      ...config
    };

    this.startCleanupTimer();
  }

  setQueryClient(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  set(key: string, data: any, priority: 'high' | 'medium' | 'low' = 'medium'): void {
    // Nettoyage si la cache est pleine
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastUsed();
    }

    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      priority,
      accessCount: 1,
      lastAccess: now
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    
    // Vérifier si l'entrée a expiré
    if (now - entry.timestamp > this.config.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Mettre à jour les statistiques d'accès
    entry.accessCount++;
    entry.lastAccess = now;

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > this.config.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Optimistic update avec rollback
  async optimisticUpdate<T>(
    key: string,
    updatedData: T,
    updateFn: () => Promise<T>,
    rollbackFn?: () => void
  ): Promise<T> {
    const originalData = this.get(key);
    
    // Mettre à jour de manière optimiste
    this.set(key, updatedData, 'high');

    try {
      const result = await updateFn();
      this.set(key, result, 'high');
      return result;
    } catch (error) {
      // Rollback en cas d'erreur
      if (originalData) {
        this.set(key, originalData, 'high');
      } else {
        this.delete(key);
      }
      
      if (rollbackFn) {
        rollbackFn();
      }
      
      throw error;
    }
  }

  // Préchargement intelligent
  async preload(keys: string[], loaderFn: (key: string) => Promise<any>): Promise<void> {
    const promises = keys
      .filter(key => !this.has(key))
      .map(async key => {
        try {
          const data = await loaderFn(key);
          this.set(key, data, 'low');
        } catch (error) {
          console.warn(`Failed to preload cache key: ${key}`, error);
        }
      });

    await Promise.allSettled(promises);
  }

  // Invalidation intelligente
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.delete(key));

    // Invalidate React Query cache as well
    if (this.queryClient) {
      this.queryClient.invalidateQueries({
        queryKey: [pattern],
        type: 'all'
      });
    }
  }

  // Statistiques de la cache
  getStats(): {
    size: number;
    hitRate: number;
    memoryUsage: number;
    mostAccessed: string[];
  } {
    const entries = Array.from(this.cache.entries());
    const totalAccess = entries.reduce((sum, [, entry]) => sum + entry.accessCount, 0);
    const memoryUsage = JSON.stringify(Array.from(this.cache.entries())).length;
    
    const mostAccessed = entries
      .sort((a, b) => b[1].accessCount - a[1].accessCount)
      .slice(0, 5)
      .map(([key]) => key);

    return {
      size: this.cache.size,
      hitRate: totalAccess > 0 ? (entries.length / totalAccess) * 100 : 0,
      memoryUsage,
      mostAccessed
    };
  }

  private evictLeastUsed(): void {
    const entries = Array.from(this.cache.entries());
    
    // Trier par priorité et fréquence d'accès
    entries.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityWeight[a[1].priority];
      const bPriority = priorityWeight[b[1].priority];
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      return a[1].accessCount - b[1].accessCount;
    });

    // Supprimer les 25% les moins utilisés
    const toRemove = Math.ceil(entries.length * 0.25);
    entries.slice(0, toRemove).forEach(([key]) => {
      this.cache.delete(key);
    });
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.config.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.delete(key));
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }
}

// Instance globale
export const smartCache = new SmartCacheService({
  maxSize: 150,
  ttl: 5 * 60 * 1000, // 5 minutes
  cleanupInterval: 2 * 60 * 1000, // 2 minutes
});

// Utilitaires pour les clés de cache
export const CacheKeys = {
  patients: (osteopathId: number) => `patients:${osteopathId}`,
  patient: (id: number) => `patient:${id}`,
  appointments: (osteopathId: number) => `appointments:${osteopathId}`,
  appointment: (id: number) => `appointment:${id}`,
  invoices: (osteopathId: number) => `invoices:${osteopathId}`,
  invoice: (id: number) => `invoice:${id}`,
  consultationTemplates: (osteopathId: number) => `templates:${osteopathId}`,
  recurringAppointments: (osteopathId: number) => `recurring:${osteopathId}`,
  analytics: (osteopathId: number) => `analytics:${osteopathId}`,
  dashboard: (osteopathId: number) => `dashboard:${osteopathId}`,
};