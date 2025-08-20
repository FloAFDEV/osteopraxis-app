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
    if (this.fallbackToMemory) {
      console.warn('⚠️ Mode stockage persistant: utilisation IndexedDB pour les patients');
      return await realPersistentStorage.getAll('patients');
    }
    
    try {
      return await this.sqliteAdapter.getAll();
    } catch (error) {
      console.error('Error getting all patients from local storage, falling back to IndexedDB:', error);
      this.fallbackToMemory = true;
      return await realPersistentStorage.getAll('patients');
    }
  }

  async getById(id: number | string): Promise<any | null> {
    if (this.fallbackToMemory) {
      return await realPersistentStorage.getById('patients', String(id));
    }
    
    try {
      return await this.sqliteAdapter.getById(id);
    } catch (error) {
      console.error('Error getting patient by ID from local storage, falling back to IndexedDB:', error);
      this.fallbackToMemory = true;
      return await realPersistentStorage.getById('patients', String(id));
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
 * Initialise tous les adaptateurs locaux avec SQLite + OPFS
 */
export async function initializeLocalAdapters() {
  try {
    console.log('🔄 Initializing SQLite local adapters with OPFS...');
    
    // Vérifier le support OPFS d'abord
    if (!checkOPFSSupport().supported) {
      console.warn('⚠️ OPFS not supported by browser - using localStorage fallback mode for HDS data');
      return createLocalAdapters(); // Retourne les adaptateurs avec mode localStorage
    }
    
    // Tenter d'initialiser le service SQLite
    const service = await getOPFSSQLiteService();
    if (!service) {
      console.warn('⚠️ SQLite service not available - using localStorage fallback mode for HDS data');
      return createLocalAdapters(); // Retourne les adaptateurs avec mode localStorage
    }
    
    console.log('✅ SQLite local adapters initialized successfully');
    return createLocalAdapters();
  } catch (error) {
    console.warn('⚠️ Failed to initialize SQLite local adapters - using localStorage fallback mode for HDS data:', error);
    return createLocalAdapters(); // Retourne les adaptateurs avec mode localStorage même en cas d'erreur
  }
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