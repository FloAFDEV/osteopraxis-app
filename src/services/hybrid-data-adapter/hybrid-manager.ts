import { HybridDataAdapter } from './hybrid-adapter';
import { createCloudAdapters } from './cloud-adapters';
import { createLocalAdapters } from './local-adapters';
import { HybridConfig, DataLocation } from './types';

/**
 * Gestionnaire principal de l'architecture hybride
 * Point d'entrée unique pour toute l'application
 */
export class HybridDataManager {
  private adapter: HybridDataAdapter;
  private initialized = false;

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
    if (this.initialized) return;

    console.log('🔄 Initializing Hybrid Data Manager...');

    try {
      // Initialiser les adaptateurs cloud (Supabase)
      const cloudAdapters = createCloudAdapters();
      this.adapter.registerCloudAdapter('users', cloudAdapters.users);
      this.adapter.registerCloudAdapter('osteopaths', cloudAdapters.osteopaths);
      this.adapter.registerCloudAdapter('cabinets', cloudAdapters.cabinets);

      // Initialiser les adaptateurs locaux (SQLite)
      // Note: Dans l'étape 2, on initialisera vraiment SQLite
      const localAdapters = createLocalAdapters();
      this.adapter.registerLocalAdapter('patients', localAdapters.patients);
      this.adapter.registerLocalAdapter('appointments', localAdapters.appointments);
      this.adapter.registerLocalAdapter('invoices', localAdapters.invoices);

      this.initialized = true;
      console.log('✅ Hybrid Data Manager initialized successfully');

      // Afficher le statut du stockage
      const status = await this.adapter.getStorageStatus();
      console.log('📊 Storage status:', status);

    } catch (error) {
      console.error('❌ Failed to initialize Hybrid Data Manager:', error);
      throw error;
    }
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
        users: DataLocation.CLOUD,
        osteopaths: DataLocation.CLOUD,
        cabinets: DataLocation.CLOUD,
        patients: DataLocation.LOCAL,
        appointments: DataLocation.LOCAL,
        invoices: DataLocation.LOCAL,
        consultations: DataLocation.LOCAL,
        medicalDocuments: DataLocation.LOCAL,
        quotes: DataLocation.LOCAL,
        treatmentHistory: DataLocation.LOCAL,
        patientRelationships: DataLocation.LOCAL,
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