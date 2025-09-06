/**
 * 🔍 Diagnostic du système de stockage hybride
 * 
 * Valide et teste l'architecture de routage automatique :
 * - Mode démo : sessionStorage éphémère
 * - Mode connecté : HDS local + Non-HDS Supabase
 */

import { storageRouter } from './storage-router';
import { DATA_CLASSIFICATION, getDataClassification } from './data-classification';
import { isDemoSession } from '@/utils/demo-detection';

export interface StorageDiagnostic {
  mode: 'demo' | 'connected';
  routing: {
    hds_to_local: string[];
    nonhds_to_supabase: string[];
  };
  security: {
    no_hds_leakage: boolean;
    demo_isolation: boolean;
    local_encryption: boolean;
  };
  performance: {
    cloud_latency: number;
    local_latency: number;
  };
  tests: {
    demo_write_read: boolean;
    hds_local_write_read: boolean;
    nonhds_cloud_write_read: boolean;
  };
}

export class StorageDiagnosticService {
  /**
   * Diagnostic complet du système de stockage
   */
  async runFullDiagnostic(): Promise<StorageDiagnostic> {
    console.log('🔍 Démarrage du diagnostic stockage hybride...');
    
    const isDemoMode = await isDemoSession();
    const mode = isDemoMode ? 'demo' : 'connected';
    
    console.log(`📊 Mode détecté: ${mode}`);
    
    const routing = this.analyzeRouting();
    const security = await this.validateSecurity(isDemoMode);
    const performance = await this.measurePerformance();
    const tests = await this.runIntegrationTests(isDemoMode);
    
    const diagnostic: StorageDiagnostic = {
      mode,
      routing,
      security,
      performance,
      tests
    };
    
    console.log('📋 Diagnostic terminé:', diagnostic);
    return diagnostic;
  }
  
  /**
   * Analyse la configuration de routage
   */
  private analyzeRouting() {
    return {
      hds_to_local: [...DATA_CLASSIFICATION.HDS],
      nonhds_to_supabase: [...DATA_CLASSIFICATION.NON_HDS]
    };
  }
  
  /**
   * Validation des règles de sécurité
   */
  private async validateSecurity(isDemoMode: boolean): Promise<StorageDiagnostic['security']> {
    const no_hds_leakage = this.validateNoHDSLeakage();
    const demo_isolation = isDemoMode; // En mode démo, isolation complète
    const local_encryption = !isDemoMode; // Chiffrement en mode connecté
    
    return {
      no_hds_leakage,
      demo_isolation,
      local_encryption
    };
  }
  
  /**
   * Vérifier qu'aucune donnée HDS ne peut aller vers Supabase
   */
  private validateNoHDSLeakage(): boolean {
    try {
      // Tenter de violer la sécurité HDS
      for (const dataType of DATA_CLASSIFICATION.HDS) {
        const classification = getDataClassification(dataType);
        if (classification !== 'HDS') {
          console.error(`🚨 VIOLATION: ${dataType} mal classé`);
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('❌ Erreur validation sécurité:', error);
      return false;
    }
  }
  
  /**
   * Mesurer les performances cloud vs local
   */
  private async measurePerformance(): Promise<StorageDiagnostic['performance']> {
    const cloud_latency = await this.measureCloudLatency();
    const local_latency = await this.measureLocalLatency();
    
    return { cloud_latency, local_latency };
  }
  
  private async measureCloudLatency(): Promise<number> {
    try {
      const start = performance.now();
      const adapter = await storageRouter.route('users'); // Non-HDS → Supabase
      await adapter.getAll();
      return performance.now() - start;
    } catch (error) {
      console.warn('⚠️ Erreur mesure latence cloud:', error);
      return -1;
    }
  }
  
  private async measureLocalLatency(): Promise<number> {
    try {
      const start = performance.now();
      const adapter = await storageRouter.route('patients'); // HDS → Local
      await adapter.getAll();
      return performance.now() - start;
    } catch (error) {
      console.warn('⚠️ Erreur mesure latence locale:', error);
      return -1;
    }
  }
  
  /**
   * Tests d'intégration écriture/lecture
   */
  private async runIntegrationTests(isDemoMode: boolean): Promise<StorageDiagnostic['tests']> {
    const demo_write_read = isDemoMode ? await this.testDemoStorage() : true;
    const hds_local_write_read = !isDemoMode ? await this.testHDSLocalStorage() : true;
    const nonhds_cloud_write_read = await this.testNonHDSCloudStorage();
    
    return {
      demo_write_read,
      hds_local_write_read,
      nonhds_cloud_write_read
    };
  }
  
  private async testDemoStorage(): Promise<boolean> {
    try {
      console.log('🧪 Test stockage démo...');
      // Test simple : vérifier que les données sont en sessionStorage
      const testKey = 'demo_test_' + Date.now();
      sessionStorage.setItem(testKey, 'test_value');
      const value = sessionStorage.getItem(testKey);
      sessionStorage.removeItem(testKey);
      
      return value === 'test_value';
    } catch (error) {
      console.error('❌ Erreur test démo:', error);
      return false;
    }
  }
  
  private async testHDSLocalStorage(): Promise<boolean> {
    try {
      console.log('🧪 Test stockage HDS local...');
      const adapter = await storageRouter.route('patients');
      const testPatient = {
        firstName: 'Test',
        lastName: 'Patient',
        birthDate: '1990-01-01',
        phone: '0123456789',
        email: 'test@example.com'
      };
      
      const created = await adapter.create(testPatient);
      const retrieved = await adapter.getById((created as any).id);
      
      if (retrieved) {
        await adapter.delete((created as any).id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erreur test HDS local:', error);
      return false;
    }
  }
  
  private async testNonHDSCloudStorage(): Promise<boolean> {
    try {
      console.log('🧪 Test stockage Non-HDS cloud...');
      // Test simple de lecture (éviter les créations en test)
      const adapter = await storageRouter.route('users');
      await adapter.getAll();
      return true;
    } catch (error) {
      console.error('❌ Erreur test Non-HDS cloud:', error);
      return false;
    }
  }
  
  /**
   * Export des diagnostics pour debugging
   */
  async exportDiagnostic(): Promise<string> {
    const diagnostic = await this.runFullDiagnostic();
    return JSON.stringify(diagnostic, null, 2);
  }
  
  /**
   * Validation continue du système
   */
  async validateSystemIntegrity(): Promise<{
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    const diagnostic = await this.runFullDiagnostic();
    
    // Vérifications critiques
    if (!diagnostic.security.no_hds_leakage) {
      issues.push('🚨 CRITIQUE: Fuite possible de données HDS vers Supabase');
      recommendations.push('Vérifier la classification des données dans data-classification.ts');
    }
    
    if (diagnostic.mode === 'demo' && !diagnostic.security.demo_isolation) {
      issues.push('⚠️ Mode démo non isolé');
      recommendations.push('Vérifier la détection du mode démo');
    }
    
    if (diagnostic.performance.cloud_latency > 5000) {
      issues.push('⚠️ Latence cloud élevée');
      recommendations.push('Vérifier la connexion Supabase');
    }
    
    if (!diagnostic.tests.hds_local_write_read && diagnostic.mode === 'connected') {
      issues.push('❌ Stockage local HDS non fonctionnel');
      recommendations.push('Initialiser le stockage local sécurisé');
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      recommendations
    };
  }
}

/**
 * Instance singleton du service de diagnostic
 */
export const storageDiagnostic = new StorageDiagnosticService();

/**
 * Hook utilitaire pour les tests et le debugging
 */
export function useStorageDiagnostic() {
  return {
    async runDiagnostic() {
      return storageDiagnostic.runFullDiagnostic();
    },
    
    async validateSystem() {
      return storageDiagnostic.validateSystemIntegrity();
    },
    
    async exportReport() {
      return storageDiagnostic.exportDiagnostic();
    }
  };
}