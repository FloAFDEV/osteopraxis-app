import { DataAdapter, DataLocation } from './types';
import { createEnhancedSQLiteAdapters } from '../sqlite/enhanced-sqlite-adapters';
import { getOPFSSQLiteService, checkOPFSSupport } from '../sqlite/opfs-sqlite-service';
import { getPersistentLocalStorage } from '../storage/persistent-local-storage';

/**
 * Stockage local VRAIMENT persistant avec IndexedDB
 * Utilisé quand SQLite/OPFS n'est pas disponible mais on veut de la vraie persistance
 */
class RealPersistentLocalStorage {
  private storage: any = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (!this.initialized) {
      this.storage = await getPersistentLocalStorage();
      this.initialized = true;
      console.log('✅ Stockage IndexedDB persistant initialisé');
    }
  }

  async getAll(entityName: string): Promise<any[]> {
    await this.initialize();
    return await this.storage.getAll(entityName);
  }

  async getById(entityName: string, id: string): Promise<any | null> {
    await this.initialize();
    return await this.storage.getById(entityName, id);
  }

  async create(entityName: string, data: any): Promise<any> {
    await this.initialize();
    return await this.storage.create(entityName, data);
  }

  async update(entityName: string, id: string, data: any): Promise<any> {
    await this.initialize();
    return await this.storage.update(entityName, id, data);
  }

  async delete(entityName: string, id: string): Promise<boolean> {
    await this.initialize();
    return await this.storage.delete(entityName, id);
  }

  async clear(entityName: string): Promise<void> {
    await this.initialize();
    return await this.storage.clear(entityName);
  }
}

// Instance globale du VRAI stockage persistant local
const realPersistentStorage = new RealPersistentLocalStorage();

/**
 * Adaptateurs locaux utilisant SQLite avec OPFS
 * Ces adaptateurs se connectent directement au service SQLite OPFS
 */

class LocalPatientAdapter implements DataAdapter<any> {
  private sqliteAdapter: any;
  private fallbackToMemory: boolean = false;

  constructor() {
    try {
      const adapters = createEnhancedSQLiteAdapters();
      this.sqliteAdapter = adapters.patients;
    } catch (error) {
      console.warn('SQLite adapters not available, using persistent local storage fallback for patients');
      this.fallbackToMemory = true;
    }
  }

  private async isDemoMode(): Promise<boolean> {
    const { isDemoSession } = await import('@/utils/demo-detection');
    return await isDemoSession();
  }

  private async clearDemoDataIfConnected(): Promise<void> {
    const isDemo = await this.isDemoMode();
    if (!isDemo) {
      // En mode connecté, nettoyer toutes les données démo persistantes
      console.log('🧹 Nettoyage données démo en mode connecté');
      try {
        await realPersistentStorage.clear('patients');
        await realPersistentStorage.clear('appointments');
        await realPersistentStorage.clear('invoices');
        await realPersistentStorage.clear('cabinets');
        sessionStorage.clear(); // Nettoyer aussi sessionStorage
      } catch (error) {
        console.warn('⚠️ Erreur nettoyage données démo:', error);
      }
    }
  }

  getLocation(): DataLocation {
    return DataLocation.LOCAL;
  }

  async isAvailable(): Promise<boolean> {
    if (this.fallbackToMemory) return true; // Mode localStorage toujours disponible
    
    try {
      if (!checkOPFSSupport()) return false;
      const service = await getOPFSSQLiteService();
      return service !== null;
    } catch (error) {
      console.warn('SQLite service not available:', error);
      this.fallbackToMemory = true;
      return true; // Fallback vers localStorage
    }
  }

  async getAll(): Promise<any[]> {
    // Nettoyer les données démo si en mode connecté
    await this.clearDemoDataIfConnected();

    if (this.fallbackToMemory) {
      // Fallback final vers IndexedDB persistant SEULEMENT en mode démo
      const isDemo = await this.isDemoMode();
      if (isDemo) {
        console.warn('⚠️ Mode stockage persistant démo: utilisation IndexedDB pour les patients');
        return await realPersistentStorage.getAll('patients');
      }
      
      // En mode connecté sans stockage natif configuré, retourner vide
      console.log('⚠️ Aucun stockage local configuré en mode connecté');
      return [];
    }
    
    try {
      return await this.sqliteAdapter.getAll();
    } catch (error) {
      console.error('Error getting all patients from local storage, falling back to IndexedDB:', error);
      this.fallbackToMemory = true;
      
      const isDemo = await this.isDemoMode();
      if (isDemo) {
        return await realPersistentStorage.getAll('patients');
      }
      return [];
    }
  }

  async getById(id: number | string): Promise<any | null> {
    // Nettoyer les données démo si en mode connecté
    await this.clearDemoDataIfConnected();

    if (this.fallbackToMemory) {
      // Fallback final vers IndexedDB persistant SEULEMENT en mode démo
      const isDemo = await this.isDemoMode();
      if (isDemo) {
        console.log(`🔍 Recherche patient ${id} dans IndexedDB persistant (mode démo)...`);
        const result = await realPersistentStorage.getById('patients', String(id));
        
        if (!result) {
          console.warn(`⚠️ Patient ${id} non trouvé dans IndexedDB`);
          // Lister tous les patients pour débugger
          const allPatients = await realPersistentStorage.getAll('patients');
          console.log(`📋 ${allPatients.length} patients disponibles en IndexedDB:`, allPatients.map(p => ({ id: p.id, name: `${p.firstName} ${p.lastName}` })));
        } else {
          console.log(`✅ Patient ${id} trouvé en IndexedDB:`, { id: result.id, name: `${result.firstName} ${result.lastName}` });
        }
        
        return result;
      }

      // En mode connecté sans stockage natif configuré
      console.log(`⚠️ Aucun stockage local configuré pour rechercher patient ${id} en mode connecté`);
      return null;
    }
    
    try {
      return await this.sqliteAdapter.getById(id);
    } catch (error) {
      console.error('Error getting patient by ID from local storage, falling back to IndexedDB:', error);
      this.fallbackToMemory = true;
      
      const isDemo = await this.isDemoMode();
      if (isDemo) {
        return await realPersistentStorage.getById('patients', String(id));
      }
      return null;
    }
  }

  async create(data: any): Promise<any> {
    if (this.fallbackToMemory) {
      return await realPersistentStorage.create('patients', data);
    }
    
    try {
      return await this.sqliteAdapter.create(data);
    } catch (error) {
      console.error('Error creating patient in local storage, falling back to IndexedDB:', error);
      this.fallbackToMemory = true;
      return await realPersistentStorage.create('patients', data);
    }
  }

  async update(id: number | string, data: any): Promise<any> {
    if (this.fallbackToMemory) {
      return await realPersistentStorage.update('patients', String(id), data);
    }
    
    try {
      return await this.sqliteAdapter.update(id, data);
    } catch (error) {
      console.error('Error updating patient in local storage, falling back to IndexedDB:', error);
      this.fallbackToMemory = true;
      return await realPersistentStorage.update('patients', String(id), data);
    }
  }

  async delete(id: number | string): Promise<boolean> {
    if (this.fallbackToMemory) {
      return await realPersistentStorage.delete('patients', String(id));
    }
    
    try {
      return await this.sqliteAdapter.delete(id);
    } catch (error) {
      console.error('Error deleting patient from local storage, falling back to IndexedDB:', error);
      this.fallbackToMemory = true;
      return await realPersistentStorage.delete('patients', String(id));
    }
  }
}

class LocalAppointmentAdapter implements DataAdapter<any> {
  private sqliteAdapter: any;
  private fallbackToMemory: boolean = false;

  constructor() {
    try {
      const adapters = createEnhancedSQLiteAdapters();
      this.sqliteAdapter = adapters.appointments;
    } catch (error) {
      console.warn('SQLite adapters not available, using persistent local storage fallback for appointments');
      this.fallbackToMemory = true;
    }
  }

  getLocation(): DataLocation {
    return DataLocation.LOCAL;
  }

  async isAvailable(): Promise<boolean> {
    if (this.fallbackToMemory) return true;
    
    try {
      if (!checkOPFSSupport()) return false;
      const service = await getOPFSSQLiteService();
      return service !== null;
    } catch (error) {
      console.warn('SQLite service not available:', error);
      this.fallbackToMemory = true;
      return true;
    }
  }

  async getAll(): Promise<any[]> {
    if (this.fallbackToMemory) {
      console.warn('⚠️ Mode stockage persistant: utilisation IndexedDB pour les rendez-vous');
      return await realPersistentStorage.getAll('appointments');
    }
    
    try {
      return await this.sqliteAdapter.getAll();
    } catch (error) {
      console.error('Error getting all appointments from local storage, falling back to IndexedDB:', error);
      this.fallbackToMemory = true;
      return await realPersistentStorage.getAll('appointments');
    }
  }

  async getById(id: number | string): Promise<any | null> {
    if (this.fallbackToMemory) {
      return await realPersistentStorage.getById('appointments', String(id));
    }
    
    try {
      return await this.sqliteAdapter.getById(id);
    } catch (error) {
      console.error('Error getting appointment by ID from local storage, falling back to IndexedDB:', error);
      this.fallbackToMemory = true;
      return await realPersistentStorage.getById('appointments', String(id));
    }
  }

  async create(data: any): Promise<any> {
    if (this.fallbackToMemory) {
      return await realPersistentStorage.create('appointments', data);
    }
    
    try {
      return await this.sqliteAdapter.create(data);
    } catch (error) {
      console.error('Error creating appointment in local storage, falling back to IndexedDB:', error);
      this.fallbackToMemory = true;
      return await realPersistentStorage.create('appointments', data);
    }
  }

  async update(id: number | string, data: any): Promise<any> {
    if (this.fallbackToMemory) {
      return await realPersistentStorage.update('appointments', String(id), data);
    }
    
    try {
      return await this.sqliteAdapter.update(id, data);
    } catch (error) {
      console.error('Error updating appointment in local storage, falling back to IndexedDB:', error);
      this.fallbackToMemory = true;
      return await realPersistentStorage.update('appointments', String(id), data);
    }
  }

  async delete(id: number | string): Promise<boolean> {
    if (this.fallbackToMemory) {
      return await realPersistentStorage.delete('appointments', String(id));
    }
    
    try {
      return await this.sqliteAdapter.delete(id);
    } catch (error) {
      console.error('Error deleting appointment from local storage, falling back to IndexedDB:', error);
      this.fallbackToMemory = true;
      return await realPersistentStorage.delete('appointments', String(id));
    }
  }
}

class LocalInvoiceAdapter implements DataAdapter<any> {
  private sqliteAdapter: any;
  private fallbackToMemory: boolean = false;

  constructor() {
    try {
      const adapters = createEnhancedSQLiteAdapters();
      this.sqliteAdapter = adapters.invoices;
    } catch (error) {
      console.warn('SQLite adapters not available, using persistent local storage fallback for invoices');
      this.fallbackToMemory = true;
    }
  }

  getLocation(): DataLocation {
    return DataLocation.LOCAL;
  }

  async isAvailable(): Promise<boolean> {
    if (this.fallbackToMemory) return true;
    
    try {
      if (!checkOPFSSupport()) return false;
      const service = await getOPFSSQLiteService();
      return service !== null;
    } catch (error) {
      console.warn('SQLite service not available:', error);
      this.fallbackToMemory = true;
      return true;
    }
  }

  async getAll(): Promise<any[]> {
    if (this.fallbackToMemory) {
      console.warn('⚠️ Mode stockage persistant: utilisation IndexedDB pour les factures');
      return await realPersistentStorage.getAll('invoices');
    }
    
    try {
      return await this.sqliteAdapter.getAll();
    } catch (error) {
      console.error('Error getting all invoices from local storage, falling back to IndexedDB:', error);
      this.fallbackToMemory = true;
      return await realPersistentStorage.getAll('invoices');
    }
  }

  async getById(id: number | string): Promise<any | null> {
    if (this.fallbackToMemory) {
      return await realPersistentStorage.getById('invoices', String(id));
    }
    
    try {
      return await this.sqliteAdapter.getById(id);
    } catch (error) {
      console.error('Error getting invoice by ID from local storage, falling back to IndexedDB:', error);
      this.fallbackToMemory = true;
      return await realPersistentStorage.getById('invoices', String(id));
    }
  }

  async create(data: any): Promise<any> {
    if (this.fallbackToMemory) {
      return await realPersistentStorage.create('invoices', data);
    }
    
    try {
      return await this.sqliteAdapter.create(data);
    } catch (error) {
      console.error('Error creating invoice in local storage, falling back to IndexedDB:', error);
      this.fallbackToMemory = true;
      return await realPersistentStorage.create('invoices', data);
    }
  }

  async update(id: number | string, data: any): Promise<any> {
    if (this.fallbackToMemory) {
      return await realPersistentStorage.update('invoices', String(id), data);
    }
    
    try {
      return await this.sqliteAdapter.update(id, data);
    } catch (error) {
      console.error('Error updating invoice in local storage, falling back to IndexedDB:', error);
      this.fallbackToMemory = true;
      return await realPersistentStorage.update('invoices', String(id), data);
    }
  }

  async delete(id: number | string): Promise<boolean> {
    if (this.fallbackToMemory) {
      return await realPersistentStorage.delete('invoices', String(id));
    }
    
    try {
      return await this.sqliteAdapter.delete(id);
    } catch (error) {
      console.error('Error deleting invoice from local storage, falling back to IndexedDB:', error);
      this.fallbackToMemory = true;
      return await realPersistentStorage.delete('invoices', String(id));
    }
  }
}

/**
 * Factory pour créer les adaptateurs locaux (SQLite + OPFS)
 */
export function createLocalAdapters() {
  return {
    patients: new LocalPatientAdapter(),
    appointments: new LocalAppointmentAdapter(),
    invoices: new LocalInvoiceAdapter(),
  };
}

/**
 * Initialise tous les adaptateurs locaux avec IndexedDB persistant
 * SIMPLIFIÉ: Utilise directement IndexedDB, pas de SQLite/OPFS
 */
export async function initializeLocalAdapters() {
  console.log('🔄 Initialisation adaptateurs locaux avec IndexedDB persistant...');
  
  // FORCER le mode IndexedDB persistant pour tous les adaptateurs
  const adapters = createLocalAdapters();
  
  // Forcer l'initialisation en mode IndexedDB persistant
  (adapters.patients as any).fallbackToMemory = true;
  (adapters.appointments as any).fallbackToMemory = true;
  (adapters.invoices as any).fallbackToMemory = true;
  
  // Initialiser le stockage persistant
  await realPersistentStorage.initialize();
  
  console.log('✅ Adaptateurs locaux IndexedDB persistant initialisés avec succès');
  return adapters;
}

/**
 * Efface toutes les données persistantes
 * Utile pour les tests ou le nettoyage
 */
export async function clearMemoryStorage() {
  await realPersistentStorage.clear('patients');
  await realPersistentStorage.clear('appointments');
  await realPersistentStorage.clear('invoices');
  console.log('🧹 Persistent IndexedDB storage cleared');
}

/**
 * Vérifie si l'application utilise le mode localStorage persistant
 */
export function isUsingMemoryFallback(): boolean {
  // Vérifier si on a des données dans le localStorage enhanced fallback
  const hasEnhancedFallback = localStorage.getItem('sqlite-fallback-enhanced');
  const hasBasicFallback = localStorage.getItem('sqlite-fallback-data');
  const hasHdsStorage = localStorage.getItem('hds-local-storage');
  
  console.log('🔍 Fallback check:', {
    hasEnhancedFallback: !!hasEnhancedFallback,
    hasBasicFallback: !!hasBasicFallback,
    hasHdsStorage: !!hasHdsStorage
  });
  
  // Si on a des données dans localStorage, on utilise le fallback
  return !!(hasEnhancedFallback || hasBasicFallback || hasHdsStorage);
}