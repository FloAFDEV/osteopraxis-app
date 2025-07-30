/**
 * Service de monitoring et métriques pour le partage USB sécurisé
 */

export interface USBOperationMetrics {
  operationType: 'export' | 'import';
  timestamp: Date;
  duration: number;
  fileSize?: number;
  dataTypes: {
    patients: number;
    appointments: number;
    invoices: number;
  };
  success: boolean;
  errors?: string[];
  performance: {
    encryptionTime?: number;
    decryptionTime?: number;
    validationTime?: number;
    compressionRatio?: number;
  };
}

export interface USBUsageStats {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  totalDataExported: {
    patients: number;
    appointments: number;
    invoices: number;
  };
  totalDataImported: {
    patients: number;
    appointments: number;
    invoices: number;
  };
  averageFileSize: number;
  averageDuration: number;
  lastOperation?: USBOperationMetrics;
}

export class USBMonitoringService {
  private metrics: USBOperationMetrics[] = [];
  private readonly maxMetrics = 100; // Limite de métriques stockées

  /**
   * Enregistre une opération USB
   */
  recordOperation(metrics: USBOperationMetrics): void {
    this.metrics.push(metrics);
    
    // Maintenir la limite
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Sauvegarder en localStorage pour persistance
    this.saveToStorage();
    
    console.log(`📊 USB Operation recorded: ${metrics.operationType} - ${metrics.success ? 'SUCCESS' : 'FAILED'} (${metrics.duration}ms)`);
  }

  /**
   * Démarre le monitoring d'une opération
   */
  startOperation(type: 'export' | 'import'): USBOperationTimer {
    return new USBOperationTimer(type, this);
  }

  /**
   * Obtient les statistiques d'usage
   */
  getUsageStats(): USBUsageStats {
    const stats: USBUsageStats = {
      totalOperations: this.metrics.length,
      successfulOperations: this.metrics.filter(m => m.success).length,
      failedOperations: this.metrics.filter(m => !m.success).length,
      totalDataExported: {
        patients: 0,
        appointments: 0,
        invoices: 0
      },
      totalDataImported: {
        patients: 0,
        appointments: 0,
        invoices: 0
      },
      averageFileSize: 0,
      averageDuration: 0,
      lastOperation: this.metrics[this.metrics.length - 1]
    };

    // Calculer les totaux
    this.metrics.forEach(metric => {
      if (metric.operationType === 'export') {
        stats.totalDataExported.patients += metric.dataTypes.patients;
        stats.totalDataExported.appointments += metric.dataTypes.appointments;
        stats.totalDataExported.invoices += metric.dataTypes.invoices;
      } else {
        stats.totalDataImported.patients += metric.dataTypes.patients;
        stats.totalDataImported.appointments += metric.dataTypes.appointments;
        stats.totalDataImported.invoices += metric.dataTypes.invoices;
      }
    });

    // Calculer les moyennes
    if (this.metrics.length > 0) {
      const totalFileSize = this.metrics.reduce((sum, m) => sum + (m.fileSize || 0), 0);
      const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);
      
      stats.averageFileSize = totalFileSize / this.metrics.length;
      stats.averageDuration = totalDuration / this.metrics.length;
    }

    return stats;
  }

  /**
   * Obtient les métriques récentes
   */
  getRecentMetrics(limit: number = 10): USBOperationMetrics[] {
    return this.metrics.slice(-limit).reverse();
  }

  /**
   * Obtient les métriques de performance
   */
  getPerformanceMetrics(): {
    averageEncryptionTime: number;
    averageDecryptionTime: number;
    averageCompressionRatio: number;
    operationsPerDay: number;
  } {
    const successfulOps = this.metrics.filter(m => m.success);
    
    const avgEncryptionTime = successfulOps.reduce((sum, m) => 
      sum + (m.performance.encryptionTime || 0), 0) / successfulOps.length || 0;
    
    const avgDecryptionTime = successfulOps.reduce((sum, m) => 
      sum + (m.performance.decryptionTime || 0), 0) / successfulOps.length || 0;
    
    const avgCompressionRatio = successfulOps.reduce((sum, m) => 
      sum + (m.performance.compressionRatio || 1), 0) / successfulOps.length || 1;

    // Calculer les opérations par jour (derniers 30 jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentOps = this.metrics.filter(m => m.timestamp >= thirtyDaysAgo);
    const operationsPerDay = recentOps.length / 30;

    return {
      averageEncryptionTime: avgEncryptionTime,
      averageDecryptionTime: avgDecryptionTime,
      averageCompressionRatio: avgCompressionRatio,
      operationsPerDay
    };
  }

  /**
   * Détecte les problèmes de performance
   */
  detectPerformanceIssues(): string[] {
    const issues: string[] = [];
    const stats = this.getUsageStats();
    const perfMetrics = this.getPerformanceMetrics();

    // Taux d'échec élevé
    if (stats.totalOperations > 5 && stats.failedOperations / stats.totalOperations > 0.2) {
      issues.push(`Taux d'échec élevé: ${Math.round((stats.failedOperations / stats.totalOperations) * 100)}%`);
    }

    // Temps de chiffrement lent
    if (perfMetrics.averageEncryptionTime > 5000) {
      issues.push(`Chiffrement lent: ${Math.round(perfMetrics.averageEncryptionTime)}ms en moyenne`);
    }

    // Fichiers volumineux
    if (stats.averageFileSize > 50 * 1024 * 1024) {
      issues.push(`Fichiers volumineux: ${Math.round(stats.averageFileSize / 1024 / 1024)}MB en moyenne`);
    }

    // Opérations fréquentes
    if (perfMetrics.operationsPerDay > 10) {
      issues.push(`Usage intensif: ${Math.round(perfMetrics.operationsPerDay)} opérations/jour`);
    }

    return issues;
  }

  /**
   * Nettoie les anciennes métriques
   */
  cleanup(): void {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    this.metrics = this.metrics.filter(m => m.timestamp >= thirtyDaysAgo);
    this.saveToStorage();
    
    console.log(`🧹 Cleaned up old USB metrics, ${this.metrics.length} metrics remaining`);
  }

  /**
   * Sauvegarde en localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem('usb-monitoring-metrics', JSON.stringify(this.metrics.map(m => ({
        ...m,
        timestamp: m.timestamp.toISOString()
      }))));
    } catch (error) {
      console.warn('Failed to save USB metrics to localStorage:', error);
    }
  }

  /**
   * Charge depuis localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('usb-monitoring-metrics');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.metrics = parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      }
    } catch (error) {
      console.warn('Failed to load USB metrics from localStorage:', error);
      this.metrics = [];
    }
  }

  constructor() {
    this.loadFromStorage();
    // Nettoyer automatiquement au démarrage
    this.cleanup();
  }
}

/**
 * Timer pour mesurer les opérations USB
 */
export class USBOperationTimer {
  private startTime: number;
  private operationType: 'export' | 'import';
  private monitoringService: USBMonitoringService;
  private encryptionStart?: number;
  private decryptionStart?: number;

  constructor(type: 'export' | 'import', service: USBMonitoringService) {
    this.operationType = type;
    this.monitoringService = service;
    this.startTime = performance.now();
  }

  /**
   * Marque le début du chiffrement
   */
  startEncryption(): void {
    this.encryptionStart = performance.now();
  }

  /**
   * Marque la fin du chiffrement
   */
  endEncryption(): number {
    if (!this.encryptionStart) return 0;
    return performance.now() - this.encryptionStart;
  }

  /**
   * Marque le début du déchiffrement
   */
  startDecryption(): void {
    this.decryptionStart = performance.now();
  }

  /**
   * Marque la fin du déchiffrement
   */
  endDecryption(): number {
    if (!this.decryptionStart) return 0;
    return performance.now() - this.decryptionStart;
  }

  /**
   * Termine l'opération et enregistre les métriques
   */
  finish(result: {
    success: boolean;
    fileSize?: number;
    dataTypes: { patients: number; appointments: number; invoices: number; };
    errors?: string[];
    encryptionTime?: number;
    decryptionTime?: number;
    compressionRatio?: number;
  }): void {
    const duration = performance.now() - this.startTime;

    const metrics: USBOperationMetrics = {
      operationType: this.operationType,
      timestamp: new Date(),
      duration,
      fileSize: result.fileSize,
      dataTypes: result.dataTypes,
      success: result.success,
      errors: result.errors,
      performance: {
        encryptionTime: result.encryptionTime,
        decryptionTime: result.decryptionTime,
        compressionRatio: result.compressionRatio,
        validationTime: 0 // TODO: implémenter si nécessaire
      }
    };

    this.monitoringService.recordOperation(metrics);
  }
}

export const usbMonitoringService = new USBMonitoringService();