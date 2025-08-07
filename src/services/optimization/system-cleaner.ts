/**
 * System cleanup and optimization service
 * Handles automatic cleanup tasks and performance optimizations
 */

export interface CleanupTask {
  id: string;
  name: string;
  description: string;
  category: 'cache' | 'logs' | 'storage' | 'performance';
  priority: 'low' | 'medium' | 'high';
  autoRun: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

export interface SystemCleanupOptions {
  clearLogs?: boolean;
  clearCache?: boolean;
  compressData?: boolean;
  removeOldData?: boolean;
  maxLogAge?: number; // days
  maxCacheAge?: number; // hours
}

class SystemCleaner {
  private tasks: CleanupTask[] = [
    {
      id: 'cache-cleanup',
      name: 'Cache Cleanup',
      description: 'Clear expired cache entries',
      category: 'cache',
      priority: 'medium',
      autoRun: true
    },
    {
      id: 'log-rotation',
      name: 'Log Rotation',
      description: 'Archive and compress old logs',
      category: 'logs',
      priority: 'low',
      autoRun: true
    },
    {
      id: 'storage-optimization',
      name: 'Storage Optimization',
      description: 'Optimize browser storage usage',
      category: 'storage',
      priority: 'high',
      autoRun: true
    },
    {
      id: 'performance-tuning',
      name: 'Performance Tuning',
      description: 'Apply performance optimizations',
      category: 'performance',
      priority: 'high',
      autoRun: false
    }
  ];

  async runCleanup(options: SystemCleanupOptions = {}): Promise<void> {
    const results: string[] = [];

    if (options.clearCache !== false) {
      await this.clearExpiredCache(options.maxCacheAge || 24);
      results.push('Cache cleared');
    }

    if (options.clearLogs !== false) {
      await this.rotateLogs(options.maxLogAge || 7);
      results.push('Logs rotated');
    }

    if (options.compressData) {
      await this.compressStorageData();
      results.push('Data compressed');
    }

    if (options.removeOldData) {
      await this.removeOldData();
      results.push('Old data removed');
    }

    console.log('System cleanup completed:', results);
  }

  private async clearExpiredCache(maxHours: number): Promise<void> {
    try {
      // Clear browser cache if possible
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        const expiredCaches = cacheNames.filter(name => 
          this.isCacheExpired(name, maxHours)
        );
        
        await Promise.all(
          expiredCaches.map(name => caches.delete(name))
        );
      }

      // Clear localStorage expired entries
      this.clearExpiredLocalStorage();
    } catch (error) {
      console.warn('Cache cleanup failed:', error);
    }
  }

  private async rotateLogs(maxDays: number): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxDays);

      // Clear old console logs if we have a custom logging system
      if (typeof window !== 'undefined' && (window as any).appLogs) {
        const logs = (window as any).appLogs;
        (window as any).appLogs = logs.filter((log: any) => 
          new Date(log.timestamp) > cutoffDate
        );
      }
    } catch (error) {
      console.warn('Log rotation failed:', error);
    }
  }

  private async compressStorageData(): Promise<void> {
    try {
      // Compress localStorage data if possible
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && this.shouldCompress(key)) {
          const value = localStorage.getItem(key);
          if (value && value.length > 1000) {
            // Simple compression simulation (in real app, use actual compression)
            const compressed = JSON.stringify({ 
              compressed: true, 
              data: value.substring(0, 500) + '...' 
            });
            localStorage.setItem(key, compressed);
          }
        }
      }
    } catch (error) {
      console.warn('Data compression failed:', error);
    }
  }

  private async removeOldData(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - 6);

      // Remove old temporary data
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('temp_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            if (data.timestamp && new Date(data.timestamp) < cutoffDate) {
              localStorage.removeItem(key);
            }
          } catch {
            // Remove invalid data
            localStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.warn('Old data removal failed:', error);
    }
  }

  private isCacheExpired(cacheName: string, maxHours: number): boolean {
    try {
      const match = cacheName.match(/timestamp-(\d+)/);
      if (match) {
        const timestamp = parseInt(match[1]);
        const age = (Date.now() - timestamp) / (1000 * 60 * 60);
        return age > maxHours;
      }
    } catch {
      return true; // If we can't parse, consider it expired
    }
    return false;
  }

  private clearExpiredLocalStorage(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours

    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (data.expiry && data.expiry < cutoffTime) {
            localStorage.removeItem(key);
          }
        } catch {
          // Remove invalid cache entries
          localStorage.removeItem(key);
        }
      }
    }
  }

  private shouldCompress(key: string): boolean {
    const compressibleKeys = ['patients_cache', 'appointments_cache', 'settings_backup'];
    return compressibleKeys.some(pattern => key.includes(pattern));
  }

  getTasks(): CleanupTask[] {
    return [...this.tasks];
  }

  async runTask(taskId: string): Promise<void> {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    switch (taskId) {
      case 'cache-cleanup':
        await this.clearExpiredCache(24);
        break;
      case 'log-rotation':
        await this.rotateLogs(7);
        break;
      case 'storage-optimization':
        await this.compressStorageData();
        break;
      case 'performance-tuning':
        await this.applyPerformanceOptimizations();
        break;
      default:
        throw new Error(`Unknown task: ${taskId}`);
    }

    // Update task timing
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex >= 0) {
      this.tasks[taskIndex].lastRun = new Date();
    }
  }

  private async applyPerformanceOptimizations(): Promise<void> {
    // Optimize images loading
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
      if ('loading' in img) {
        img.setAttribute('loading', 'lazy');
      }
    });

    // Optimize animations for low-end devices
    const isLowEnd = navigator.hardwareConcurrency <= 2;
    if (isLowEnd) {
      document.documentElement.style.setProperty('--animation-duration', '0.1s');
      document.documentElement.classList.add('reduced-motion');
    }
  }

  scheduleAutomaticCleanup(): void {
    // Run automatic cleanup every 6 hours
    setInterval(() => {
      this.runCleanup({
        clearCache: true,
        clearLogs: true,
        maxCacheAge: 24,
        maxLogAge: 7
      });
    }, 6 * 60 * 60 * 1000);
  }
}

export const systemCleaner = new SystemCleaner();