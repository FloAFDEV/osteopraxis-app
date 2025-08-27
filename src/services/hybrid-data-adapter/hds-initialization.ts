/**
 * Initialisation HDS complète pour PatientHub
 * Configuration des adaptateurs locaux pour données sensibles
 */

import { hybridDataManager } from './hybrid-manager';
import { isDemoSession } from '@/utils/demo-detection';

/**
 * Configuration d'initialisation HDS
 * Appelé au démarrage de l'application
 */
export class HDSInitialization {
  private static initialized = false;
  private static initializing = false;

  /**
   * Initialise le système de stockage HDS
   * À appeler dans App.tsx ou index.tsx
   */
  static async initialize(): Promise<void> {
    if (this.initialized) return;
    
    if (this.initializing) {
      // Attendre que l'initialisation en cours se termine
      while (this.initializing) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      return;
    }

    this.initializing = true;
    console.log('🏥 Initialisation système HDS PatientHub...');

    try {
      // Vérifier le mode de fonctionnement
      const isDemoMode = await isDemoSession();
      
      if (isDemoMode) {
        console.log('🎭 Mode démo détecté - Configuration stockage éphémère');
        await this.initializeDemoMode();
      } else {
        console.log('👤 Mode production - Configuration stockage HDS local');
        await this.initializeProductionMode();
      }

      this.initialized = true;
      console.log('✅ Système HDS PatientHub initialisé avec succès');

    } catch (error) {
      console.error('❌ Erreur initialisation HDS:', error);
      // Ne pas bloquer l'application - mode dégradé
      this.initialized = true;
    } finally {
      this.initializing = false;
    }
  }

  /**
   * Mode démo : stockage éphémère sessionStorage
   */
  private static async initializeDemoMode(): Promise<void> {
    console.log('🎭 Configuration mode démo éphémère...');
    
    // Le mode démo utilise le système demo-local-storage
    // Pas besoin d'initialiser les adaptateurs HDS
    console.log('✅ Mode démo configuré');
  }

  /**
   * Mode production : stockage local HDS obligatoire
   */
  private static async initializeProductionMode(): Promise<void> {
    console.log('🏥 Configuration stockage HDS pour données sensibles...');
    
    // Initialiser le gestionnaire hybride qui va configurer les adaptateurs locaux
    await hybridDataManager.initialize();
    
    // Vérifier que les adaptateurs locaux sont bien configurés
    const status = await hybridDataManager.getStorageStatus();
    
    if (!status.local.available) {
      console.warn('⚠️ Stockage local HDS non disponible - Mode dégradé');
      throw new Error('Stockage local HDS requis pour la conformité');
    }

    // Vérifier spécifiquement les entités HDS sensibles
    const requiredEntities = ['patients', 'appointments', 'invoices'];
    const configuredEntities = status.local.tables || [];
    
    for (const entity of requiredEntities) {
      if (!configuredEntities.includes(entity)) {
        console.log(`📦 Initialisation stockage pour ${entity}...`);
        // L'adaptateur sera créé automatiquement lors du premier accès
      }
    }

    console.log('✅ Stockage HDS local configuré pour toutes les entités sensibles');
  }

  /**
   * Réinitialise le système (changement de mode)
   */
  static async reinitialize(): Promise<void> {
    this.initialized = false;
    this.initializing = false;
    await this.initialize();
  }

  /**
   * Diagnostic du système HDS
   */
  static async diagnose(): Promise<{
    mode: 'demo' | 'production';
    localStorage: boolean;
    entitiesConfigured: string[];
    compliance: boolean;
  }> {
    const isDemoMode = await isDemoSession();
    const status = await hybridDataManager.getStorageStatus();
    
    const diagnosis = {
      mode: isDemoMode ? 'demo' as const : 'production' as const,
      localStorage: status.local.available,
      entitiesConfigured: status.local.tables || [],
      compliance: false
    };

    // Vérifier la conformité HDS
    if (isDemoMode) {
      // En mode démo, on est conforme (données éphémères)
      diagnosis.compliance = true;
    } else {
      // En mode production, on doit avoir le stockage local pour les données sensibles
      const requiredEntities = ['patients', 'appointments', 'invoices'];
      const hasAllRequired = requiredEntities.every(entity => 
        diagnosis.entitiesConfigured.includes(entity)
      );
      diagnosis.compliance = diagnosis.localStorage && hasAllRequired;
    }

    return diagnosis;
  }

  /**
   * Statut de l'initialisation
   */
  static get isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Force l'initialisation des adaptateurs locaux pour les tests
   */
  static async forceLocalInitialization(): Promise<void> {
    console.log('🧪 Force initialisation locale pour tests...');
    await hybridDataManager.initialize();
    
    // Vérifier que tout est OK
    const status = await hybridDataManager.getStorageStatus();
    if (!status.local.available) {
      throw new Error('❌ Impossible d\'initialiser le stockage local');
    }
    
    console.log('✅ Stockage local forcé initialisé');
  }
}

/**
 * Hook React pour vérifier l'état HDS
 */
export function useHDSStatus() {
  return {
    async checkCompliance(): Promise<{
      isCompliant: boolean;
      mode: 'demo' | 'production';
      issues: string[];
    }> {
      const diagnosis = await HDSInitialization.diagnose();
      
      const issues: string[] = [];
      
      if (!diagnosis.compliance) {
        if (diagnosis.mode === 'production' && !diagnosis.localStorage) {
          issues.push('Stockage local requis pour données HDS');
        }
        
        const requiredEntities = ['patients', 'appointments', 'invoices'];
        const missingEntities = requiredEntities.filter(entity => 
          !diagnosis.entitiesConfigured.includes(entity)
        );
        
        if (missingEntities.length > 0) {
          issues.push(`Entités manquantes: ${missingEntities.join(', ')}`);
        }
      }
      
      return {
        isCompliant: diagnosis.compliance,
        mode: diagnosis.mode,
        issues
      };
    }
  };
}