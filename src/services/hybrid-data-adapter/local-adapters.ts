import { DataAdapter, DataLocation } from './types';
import { createEnhancedSQLiteAdapters } from '../sqlite/enhanced-sqlite-adapters';
import { getOPFSSQLiteService, checkOPFSSupport } from '../sqlite/opfs-sqlite-service';

/**
 * Stockage temporaire en mémoire pour les données HDS
 * Utilisé en mode "récupération" quand SQLite/OPFS n'est pas disponible
 */
class MemoryStorage {
  private data: Map<string, Map<string, any>> = new Map();
  
  private getEntityStore(entityName: string): Map<string, any> {
    if (!this.data.has(entityName)) {
      this.data.set(entityName, new Map());
    }
    return this.data.get(entityName)!;
  }
  
  getAll(entityName: string): any[] {
    const store = this.getEntityStore(entityName);
    return Array.from(store.values());
  }
  
  getById(entityName: string, id: string): any | null {
    const store = this.getEntityStore(entityName);
    return store.get(id) || null;
  }
  
  create(entityName: string, data: any): any {
    const store = this.getEntityStore(entityName);
    const id = data.id || Math.random().toString(36).substr(2, 9);
    const item = { 
      ...data, 
      id, 
      createdAt: new Date(),
      updatedAt: new Date()
    };
    store.set(id, item);
    return item;
  }
  
  update(entityName: string, id: string, data: any): any {
    const store = this.getEntityStore(entityName);
    const existing = store.get(id);
    if (!existing) throw new Error(`${entityName} with id ${id} not found`);
    
    const updated = { 
      ...existing, 
      ...data, 
      id, 
      updatedAt: new Date()
    };
    store.set(id, updated);
    return updated;
  }
  
  delete(entityName: string, id: string): boolean {
    const store = this.getEntityStore(entityName);
    return store.delete(id);
  }
  
  clear(): void {
    this.data.clear();
  }
}

// Instance globale du stockage mémoire temporaire
const memoryStorage = new MemoryStorage();

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
      console.warn('SQLite adapters not available, using memory fallback for patients');
      this.fallbackToMemory = true;
    }
  }

  getLocation(): DataLocation {
    return DataLocation.LOCAL;
  }

  async isAvailable(): Promise<boolean> {
    if (this.fallbackToMemory) return true; // Mode mémoire toujours disponible
    
    try {
      if (!checkOPFSSupport()) return false;
      const service = await getOPFSSQLiteService();
      return service !== null;
    } catch (error) {
      console.warn('SQLite service not available:', error);
      this.fallbackToMemory = true;
      return true; // Fallback vers la mémoire
    }
  }

  async getAll(): Promise<any[]> {
    if (this.fallbackToMemory) {
      console.warn('⚠️ Mode récupération: utilisation du stockage mémoire temporaire pour les patients');
      return memoryStorage.getAll('patients');
    }
    
    try {
      return await this.sqliteAdapter.getAll();
    } catch (error) {
      console.error('Error getting all patients from local storage, falling back to memory:', error);
      this.fallbackToMemory = true;
      return memoryStorage.getAll('patients');
    }
  }

  async getById(id: number | string): Promise<any | null> {
    if (this.fallbackToMemory) {
      return memoryStorage.getById('patients', String(id));
    }
    
    try {
      return await this.sqliteAdapter.getById(id);
    } catch (error) {
      console.error('Error getting patient by ID from local storage, falling back to memory:', error);
      this.fallbackToMemory = true;
      return memoryStorage.getById('patients', String(id));
    }
  }

  async create(data: any): Promise<any> {
    if (this.fallbackToMemory) {
      return memoryStorage.create('patients', data);
    }
    
    try {
      return await this.sqliteAdapter.create(data);
    } catch (error) {
      console.error('Error creating patient in local storage, falling back to memory:', error);
      this.fallbackToMemory = true;
      return memoryStorage.create('patients', data);
    }
  }

  async update(id: number | string, data: any): Promise<any> {
    if (this.fallbackToMemory) {
      return memoryStorage.update('patients', String(id), data);
    }
    
    try {
      return await this.sqliteAdapter.update(id, data);
    } catch (error) {
      console.error('Error updating patient in local storage, falling back to memory:', error);
      this.fallbackToMemory = true;
      return memoryStorage.update('patients', String(id), data);
    }
  }

  async delete(id: number | string): Promise<boolean> {
    if (this.fallbackToMemory) {
      return memoryStorage.delete('patients', String(id));
    }
    
    try {
      return await this.sqliteAdapter.delete(id);
    } catch (error) {
      console.error('Error deleting patient from local storage, falling back to memory:', error);
      this.fallbackToMemory = true;
      return memoryStorage.delete('patients', String(id));
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
      console.warn('SQLite adapters not available, using memory fallback for appointments');
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
      console.warn('⚠️ Mode récupération: utilisation du stockage mémoire temporaire pour les rendez-vous');
      return memoryStorage.getAll('appointments');
    }
    
    try {
      return await this.sqliteAdapter.getAll();
    } catch (error) {
      console.error('Error getting all appointments from local storage, falling back to memory:', error);
      this.fallbackToMemory = true;
      return memoryStorage.getAll('appointments');
    }
  }

  async getById(id: number | string): Promise<any | null> {
    if (this.fallbackToMemory) {
      return memoryStorage.getById('appointments', String(id));
    }
    
    try {
      return await this.sqliteAdapter.getById(id);
    } catch (error) {
      console.error('Error getting appointment by ID from local storage, falling back to memory:', error);
      this.fallbackToMemory = true;
      return memoryStorage.getById('appointments', String(id));
    }
  }

  async create(data: any): Promise<any> {
    if (this.fallbackToMemory) {
      return memoryStorage.create('appointments', data);
    }
    
    try {
      return await this.sqliteAdapter.create(data);
    } catch (error) {
      console.error('Error creating appointment in local storage, falling back to memory:', error);
      this.fallbackToMemory = true;
      return memoryStorage.create('appointments', data);
    }
  }

  async update(id: number | string, data: any): Promise<any> {
    if (this.fallbackToMemory) {
      return memoryStorage.update('appointments', String(id), data);
    }
    
    try {
      return await this.sqliteAdapter.update(id, data);
    } catch (error) {
      console.error('Error updating appointment in local storage, falling back to memory:', error);
      this.fallbackToMemory = true;
      return memoryStorage.update('appointments', String(id), data);
    }
  }

  async delete(id: number | string): Promise<boolean> {
    if (this.fallbackToMemory) {
      return memoryStorage.delete('appointments', String(id));
    }
    
    try {
      return await this.sqliteAdapter.delete(id);
    } catch (error) {
      console.error('Error deleting appointment from local storage, falling back to memory:', error);
      this.fallbackToMemory = true;
      return memoryStorage.delete('appointments', String(id));
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
      console.warn('SQLite adapters not available, using memory fallback for invoices');
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
      console.warn('⚠️ Mode récupération: utilisation du stockage mémoire temporaire pour les factures');
      return memoryStorage.getAll('invoices');
    }
    
    try {
      return await this.sqliteAdapter.getAll();
    } catch (error) {
      console.error('Error getting all invoices from local storage, falling back to memory:', error);
      this.fallbackToMemory = true;
      return memoryStorage.getAll('invoices');
    }
  }

  async getById(id: number | string): Promise<any | null> {
    if (this.fallbackToMemory) {
      return memoryStorage.getById('invoices', String(id));
    }
    
    try {
      return await this.sqliteAdapter.getById(id);
    } catch (error) {
      console.error('Error getting invoice by ID from local storage, falling back to memory:', error);
      this.fallbackToMemory = true;
      return memoryStorage.getById('invoices', String(id));
    }
  }

  async create(data: any): Promise<any> {
    if (this.fallbackToMemory) {
      return memoryStorage.create('invoices', data);
    }
    
    try {
      return await this.sqliteAdapter.create(data);
    } catch (error) {
      console.error('Error creating invoice in local storage, falling back to memory:', error);
      this.fallbackToMemory = true;
      return memoryStorage.create('invoices', data);
    }
  }

  async update(id: number | string, data: any): Promise<any> {
    if (this.fallbackToMemory) {
      return memoryStorage.update('invoices', String(id), data);
    }
    
    try {
      return await this.sqliteAdapter.update(id, data);
    } catch (error) {
      console.error('Error updating invoice in local storage, falling back to memory:', error);
      this.fallbackToMemory = true;
      return memoryStorage.update('invoices', String(id), data);
    }
  }

  async delete(id: number | string): Promise<boolean> {
    if (this.fallbackToMemory) {
      return memoryStorage.delete('invoices', String(id));
    }
    
    try {
      return await this.sqliteAdapter.delete(id);
    } catch (error) {
      console.error('Error deleting invoice from local storage, falling back to memory:', error);
      this.fallbackToMemory = true;
      return memoryStorage.delete('invoices', String(id));
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
    if (!checkOPFSSupport()) {
      console.warn('⚠️ OPFS not supported by browser - using memory fallback mode for HDS data');
      return createLocalAdapters(); // Retourne les adaptateurs avec mode mémoire
    }
    
    // Tenter d'initialiser le service SQLite
    const service = await getOPFSSQLiteService();
    if (!service) {
      console.warn('⚠️ SQLite service not available - using memory fallback mode for HDS data');
      return createLocalAdapters(); // Retourne les adaptateurs avec mode mémoire
    }
    
    console.log('✅ SQLite local adapters initialized successfully');
    return createLocalAdapters();
  } catch (error) {
    console.warn('⚠️ Failed to initialize SQLite local adapters - using memory fallback mode for HDS data:', error);
    return createLocalAdapters(); // Retourne les adaptateurs avec mode mémoire même en cas d'erreur
  }
}

/**
 * Efface toutes les données temporaires en mémoire
 * Utile pour les tests ou le nettoyage
 */
export function clearMemoryStorage() {
  memoryStorage.clear();
  console.log('🧹 Memory storage cleared');
}

/**
 * Vérifie si l'application utilise le mode mémoire temporaire
 */
export function isUsingMemoryFallback(): boolean {
  const adapters = createLocalAdapters();
  return (adapters.patients as any).fallbackToMemory || false;
}