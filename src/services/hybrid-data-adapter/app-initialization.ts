/**
 * Code d'initialisation complet pour PatientHub
 * À intégrer dans App.tsx ou index.tsx
 */

import { HDSInitialization } from './hds-initialization';
import { hybridDataManager } from './hybrid-manager';

/**
 * Initialisation complète de l'application PatientHub
 * Configure automatiquement le stockage HDS selon le mode (démo/production)
 */
export class PatientHubInitialization {
  private static initialized = false;
  
  /**
   * Initialise tous les systèmes PatientHub
   * PRÊT À L'EMPLOI - Appelez ceci dans App.tsx
   */
  static async initializeApp(): Promise<void> {
    if (this.initialized) return;

    console.log('🚀 Initialisation PatientHub...');
    
    try {
      // 1. Initialiser le système de stockage HDS
      await HDSInitialization.initialize();
      
      // 2. Diagnostic initial
      const diagnosis = await HDSInitialization.diagnose();
      console.log('📊 Diagnostic initial:', diagnosis);
      
      // 3. Afficher un résumé dans la console
      this.logInitializationSummary(diagnosis);
      
      this.initialized = true;
      console.log('✅ PatientHub initialisé avec succès');
      
    } catch (error) {
      console.error('❌ Erreur initialisation PatientHub:', error);
      // Ne pas bloquer l'application
      this.initialized = true;
    }
  }

  /**
   * Affiche un résumé de l'initialisation
   */
  private static logInitializationSummary(diagnosis: any): void {
    console.group('📋 Résumé configuration PatientHub');
    
    console.log(`🏥 Mode: ${diagnosis.mode.toUpperCase()}`);
    console.log(`🛡️ Conformité HDS: ${diagnosis.compliance ? '✅ OUI' : '❌ NON'}`);
    console.log(`💾 Stockage local: ${diagnosis.localStorage ? '✅ Actif' : '❌ Inactif'}`);
    
    if (diagnosis.mode === 'demo') {
      console.log('🎭 Données éphémères dans sessionStorage (suppression auto 30min)');
    } else {
      console.log(`📦 Entités configurées: ${diagnosis.entitiesConfigured.join(', ')}`);
      
      const requiredEntities = ['patients', 'appointments', 'invoices'];
      const missingEntities = requiredEntities.filter(entity => 
        !diagnosis.entitiesConfigured.includes(entity)
      );
      
      if (missingEntities.length > 0) {
        console.warn(`⚠️ Entités manquantes: ${missingEntities.join(', ')}`);
      }
    }
    
    console.groupEnd();
  }

  /**
   * Vérifie si l'application est prête
   */
  static get isReady(): boolean {
    return this.initialized;
  }

  /**
   * Force la réinitialisation (changement de mode demo/production)
   */
  static async reinitialize(): Promise<void> {
    this.initialized = false;
    await this.initializeApp();
  }
}

/**
 * Hook React pour l'initialisation
 * À utiliser dans App.tsx
 */
export function usePatientHubInitialization() {
  const [isReady, setIsReady] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const initialize = async () => {
      try {
        await PatientHubInitialization.initializeApp();
        setIsReady(true);
      } catch (err) {
        console.error('Erreur initialisation:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        setIsReady(true); // Ne pas bloquer l'app
      }
    };

    initialize();
  }, []);

  return { isReady, error };
}

// Pour l'import React
import React from 'react';