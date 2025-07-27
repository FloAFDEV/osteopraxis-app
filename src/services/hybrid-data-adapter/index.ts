/**
 * Point d'entrée de l'architecture hybride SaaS + local
 * 
 * Cette architecture permet de :
 * - Stocker les données non-sensibles sur Supabase (auth, config)
 * - Stocker les données sensibles localement (patients, médical)
 * - Maintenir une interface unifiée pour l'application
 * - Respecter les contraintes HDS en France
 */

export { HybridDataManager, hybridDataManager, useHybridDataDiagnostic } from './hybrid-manager';
export { HybridDataAdapter } from './hybrid-adapter';
export { createCloudAdapters } from './cloud-adapters';
export { createLocalAdapters, initializeLocalAdapters } from './local-adapters';
export type { 
  DataAdapter, 
  HybridConfig, 
  LocalStorageStatus,
  DataClassification 
} from './types';

export { 
  DataLocation,
  HybridStorageError
} from './types';

// Export des nouveaux services hybrides (à implémenter)
// export { hybridPatientService } from '../hybrid-patient-service';
// export { hybridAppointmentService } from '../hybrid-appointment-service';

/**
 * Utilitaire pour migration progressive
 * Permet de basculer graduellement l'existant vers l'architecture hybride
 */
export async function enableHybridMode() {
  const { hybridDataManager } = await import('./hybrid-manager');
  await hybridDataManager.initialize();
  
  console.log('🔄 Mode hybride activé - Données sensibles stockées localement');
  console.log('📋 Classification des données :');
  console.log('  Cloud (Supabase) : Authentification, Utilisateurs, Ostéopathes, Cabinets');
  console.log('  Local (SQLite)   : Patients, Rendez-vous, Factures, Données médicales');
  
  return hybridDataManager;
}