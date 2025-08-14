import { HybridDataAdapter } from './hybrid-adapter';
import { createCloudAdapters } from './cloud-adapters';
import { createLocalAdapters, initializeLocalAdapters } from './local-adapters';
import { HybridConfig, DataLocation, DataAdapter } from './types';
import { patientService as supabasePatientService } from '@/services/supabase-api/patient-service';
import { appointmentService } from '@/services/api/appointment-service';

/**
 * Gestionnaire principal de l'architecture hybride
 * Point d'entrée unique pour toute l'application
 */
export class HybridDataManager {
  private adapter: HybridDataAdapter;
  private initialized = false;
  private initializing = false;

  constructor(config?: Partial<HybridConfig>) {
    const defaultConfig: HybridConfig = {
      fallbackToCloud: true,
      syncMode: 'none',
      encryption: {
        enabled: true,
        keyDerivation: 'pbkdf2'
      },
      backup: {
        autoBackup: true,
        backupInterval: 60, // 1 heure
        maxBackups: 7
      },
      ...config
    };

    this.adapter = new HybridDataAdapter(defaultConfig);
  }

  /**
   * Initialise le gestionnaire hybride
   */
  async initialize(): Promise<void> {
    if (this.initialized || this.initializing) return;

    this.initializing = true;
    console.log('🔄 Initializing Hybrid Data Manager...');

    try {
      // Initialiser les adaptateurs cloud (Supabase) - pour les données non-sensibles et le mode démo
      const cloudAdapters = createCloudAdapters();
      this.adapter.registerCloudAdapter('users', cloudAdapters.users);
      this.adapter.registerCloudAdapter('osteopaths', cloudAdapters.osteopaths);
      this.adapter.registerCloudAdapter('cabinets', cloudAdapters.cabinets);

      // Vérifier l'état d'authentification pour déterminer la stratégie
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { session } } = await supabase.auth.getSession();
      const isAuthenticated = !!session?.user;

      if (isAuthenticated) {
        // UTILISATEUR CONNECTÉ: 
        // - Données non-sensibles HDS : Supabase (comme le mode démo)
        // - Données HDS sensibles : Stockage local
        console.log('👤 Utilisateur connecté - Configuration stockage hybride');
        
        // Données non-sensibles HDS -> Supabase
        this.adapter.registerCloudAdapter('users', cloudAdapters.users);
        this.adapter.registerCloudAdapter('osteopaths', cloudAdapters.osteopaths);
        this.adapter.registerCloudAdapter('cabinets', cloudAdapters.cabinets);
        this.adapter.registerCloudAdapter('quotes', cloudAdapters.quotes);
        this.adapter.registerCloudAdapter('consultations', cloudAdapters.consultations);
        this.adapter.registerCloudAdapter('medicalDocuments', cloudAdapters.medicalDocuments);
        this.adapter.registerCloudAdapter('treatmentHistory', cloudAdapters.treatmentHistory);
        this.adapter.registerCloudAdapter('patientRelationships', cloudAdapters.patientRelationships);
        
        // Données HDS sensibles -> Stockage local
        try {
          const localAdapters = await initializeLocalAdapters();
          this.adapter.registerLocalAdapter('patients', localAdapters.patients);
          this.adapter.registerLocalAdapter('appointments', localAdapters.appointments);
          this.adapter.registerLocalAdapter('invoices', localAdapters.invoices);
          console.log('✅ Configuration hybride activée : HDS sensible en local, reste en cloud');
        } catch (localError) {
          console.warn('⚠️ Échec du stockage local HDS - fallback vers Supabase:', localError);
          // Fallback complet vers Supabase si le stockage local échoue
          this.adapter.registerCloudAdapter('patients', cloudAdapters.patients);
          this.adapter.registerCloudAdapter('appointments', cloudAdapters.appointments);
          this.adapter.registerCloudAdapter('invoices', cloudAdapters.invoices);
        }
      } else {
        // MODE DÉMO (NON CONNECTÉ): Toutes les données en Supabase éphémère
        console.log('🎭 Mode démo - Données éphémères Supabase (suppression auto 30min)');
        this.adapter.registerCloudAdapter('patients', cloudAdapters.patients);
        this.adapter.registerCloudAdapter('appointments', cloudAdapters.appointments);
        this.adapter.registerCloudAdapter('invoices', cloudAdapters.invoices);
        this.adapter.registerCloudAdapter('quotes', cloudAdapters.quotes);
        this.adapter.registerCloudAdapter('consultations', cloudAdapters.consultations);
        this.adapter.registerCloudAdapter('medicalDocuments', cloudAdapters.medicalDocuments);
        this.adapter.registerCloudAdapter('treatmentHistory', cloudAdapters.treatmentHistory);
        this.adapter.registerCloudAdapter('patientRelationships', cloudAdapters.patientRelationships);
      }

      this.initialized = true;
      this.initializing = false;
      console.log('✅ Hybrid Data Manager initialized successfully');

      // Afficher le statut du stockage
      const status = await this.adapter.getStorageStatus();
      console.log('📊 Storage status:', status);

    } catch (error) {
      console.error('❌ Failed to initialize Hybrid Data Manager:', error);
      // Ne pas interrompre l'application - continuer en mode cloud-only
      this.initialized = true;
      this.initializing = false;
    }
  }

  /**
   * Réinitialise le gestionnaire pour un changement d'état d'authentification
   */
  async reinitialize(): Promise<void> {
    if (this.initializing) {
      console.log('⏳ Initialization already in progress, skipping reinitialize');
      return;
    }
    console.log('🔄 Reinitializing Hybrid Data Manager...');
    this.initialized = false;
    await this.initialize();
  }

  /**
   * Interface unifiée pour l'application
   */
  async get<T>(entity: string): Promise<T[]> {
    if (!this.initialized) await this.initialize();
    return this.adapter.getAll<T>(entity);
  }

  async getById<T>(entity: string, id: number | string): Promise<T | null> {
    if (!this.initialized) await this.initialize();
    return this.adapter.getById<T>(entity, id);
  }

  async create<T>(entity: string, data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    if (!this.initialized) await this.initialize();
    return this.adapter.create<T>(entity, data);
  }

  async update<T>(entity: string, id: number | string, data: Partial<T>): Promise<T> {
    if (!this.initialized) await this.initialize();
    return this.adapter.update<T>(entity, id, data);
  }

  async delete(entity: string, id: number | string): Promise<boolean> {
    if (!this.initialized) await this.initialize();
    return this.adapter.delete(entity, id);
  }

  /**
   * Utilitaires de gestion
   */
  async getStorageStatus() {
    if (!this.initialized) await this.initialize();
    return this.adapter.getStorageStatus();
  }

  async exportData(): Promise<string> {
    if (!this.initialized) await this.initialize();
    return this.adapter.manualBackup();
  }

  async importData(backupPath: string, password: string): Promise<boolean> {
    if (!this.initialized) await this.initialize();
    return this.adapter.restoreFromBackup(backupPath, password);
  }

  /**
   * Synchronisation Cloud -> Local
   * Migre les données cloud vers le stockage local
   */
  async syncCloudToLocal(entityName: string): Promise<{
    success: boolean;
    migrated: number;
    errors: string[];
  }> {
    if (!this.initialized) await this.initialize();

    const result = {
      success: false,
      migrated: 0,
      errors: [] as string[]
    };

    try {
      console.log(`🔄 Starting cloud -> local sync for ${entityName}...`);

      // Récupérer les données depuis le cloud
      // Pour l'instant, on utilise l'interface existante
      const cloudData = await this.adapter.getAll(entityName);
      console.log(`📥 Found ${cloudData.length} ${entityName} records in cloud`);

      // Migrer vers le local (simulation pour l'instant)
      for (const item of cloudData) {
        try {
          // Créer dans le local storage
          await this.adapter.create(entityName, item);
          result.migrated++;
        } catch (error) {
          const errorMsg = `Failed to migrate ${entityName}: ${error}`;
          result.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      result.success = result.errors.length === 0;
      console.log(`✅ Cloud -> Local sync completed: ${result.migrated} migrated, ${result.errors.length} errors`);

    } catch (error) {
      result.errors.push(`Sync failed: ${error}`);
      console.error('❌ Cloud -> Local sync failed:', error);
    }

    return result;
  }

  /**
   * Test de connectivité et de performance
   */
  async performanceTest(): Promise<{
    cloud: { available: boolean; latency: number };
    local: { available: boolean; latency: number };
  }> {
    const result = {
      cloud: { available: false, latency: 0 },
      local: { available: false, latency: 0 }
    };

    // Test cloud (users are stored in cloud)
    try {
      const start = performance.now();
      await this.adapter.getAll('users');
      result.cloud.latency = performance.now() - start;
      result.cloud.available = true;
    } catch (error) {
      console.warn('Cloud performance test failed:', error);
    }

    // Test local (patients are stored locally)
    try {
      const start = performance.now();
      await this.adapter.getAll('patients');
      result.local.latency = performance.now() - start;
      result.local.available = true;
    } catch (error) {
      console.warn('Local performance test failed:', error);
    }

    return result;
  }

  /**
   * Diagnostic et debugging
   */
  async diagnose(): Promise<{
    cloud: { available: boolean; entities: string[] };
    local: { available: boolean; entities: string[] };
    dataClassification: Record<string, DataLocation>;
  }> {
    const status = await this.getStorageStatus();
    
    return {
      cloud: {
        available: status.cloud,
        entities: ['users', 'osteopaths', 'cabinets']
      },
      local: {
        available: status.local.available,
        entities: status.local.tables
      },
      dataClassification: {
        // Toujours en cloud
        users: DataLocation.CLOUD,
        osteopaths: DataLocation.CLOUD,
        cabinets: DataLocation.CLOUD,
        quotes: DataLocation.CLOUD,
        consultations: DataLocation.CLOUD,
        medicalDocuments: DataLocation.CLOUD,
        treatmentHistory: DataLocation.CLOUD,
        patientRelationships: DataLocation.CLOUD,
        // HDS sensible en local (si connecté)
        patients: DataLocation.LOCAL,
        appointments: DataLocation.LOCAL,
        invoices: DataLocation.LOCAL,
      }
    };
  }
}

/**
 * Instance singleton pour l'application
 */
export const hybridDataManager = new HybridDataManager();

/**
 * Hook de développement pour tester l'architecture
 */
export function useHybridDataDiagnostic() {
  return {
    async runDiagnostic() {
      console.log('🔍 Running Hybrid Data Diagnostic...');
      const diagnostic = await hybridDataManager.diagnose();
      console.table(diagnostic.dataClassification);
      console.log('Cloud status:', diagnostic.cloud);
      console.log('Local status:', diagnostic.local);
      return diagnostic;
    }
  };
}