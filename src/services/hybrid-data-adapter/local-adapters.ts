import { DataAdapter, DataLocation } from './types';
import { createEnhancedSQLiteAdapters } from '../sqlite/enhanced-sqlite-adapters';
import { getOPFSSQLiteService, checkOPFSSupport } from '../sqlite/opfs-sqlite-service';

/**
 * Stockage persistant avec localStorage pour les données HDS
 * Utilisé en mode "récupération" quand SQLite/OPFS n'est pas disponible
 */
class PersistentLocalStorage {
  private data: Map<string, Map<string, any>> = new Map();
  private readonly STORAGE_KEY = 'hds-local-storage';
  
  constructor() {
    this.loadFromLocalStorage();
  }
  
  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsedData = JSON.parse(stored);
        for (const [entityName, entityData] of Object.entries(parsedData)) {
          this.data.set(entityName, new Map(Object.entries(entityData as any)));
        }
        console.log('📂 Données HDS restaurées depuis localStorage');
      }
    } catch (error) {
      console.warn('⚠️ Erreur lors du chargement des données localStorage:', error);
    }
  }
  
  private saveToLocalStorage(): void {
    try {
      const dataToSave: any = {};
      for (const [entityName, entityMap] of this.data.entries()) {
        dataToSave[entityName] = Object.fromEntries(entityMap);
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataToSave));
      console.log('💾 Données HDS sauvegardées en localStorage');
    } catch (error) {
      console.warn('⚠️ Erreur lors de la sauvegarde localStorage:', error);
    }
  }
  
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
    // Générer un ID numérique pour maintenir la compatibilité avec les types Patient
    const existingIds = Array.from(store.keys()).map(id => parseInt(id)).filter(id => !isNaN(id));
    const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    const id = data.id || nextId;
    const item = { 
      ...data, 
      id, 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.set(String(id), item);
    this.saveToLocalStorage(); // Sauvegarder automatiquement
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
      updatedAt: new Date().toISOString()
    };
    store.set(id, updated);
    this.saveToLocalStorage(); // Sauvegarder automatiquement
    return updated;
  }
  
  delete(entityName: string, id: string): boolean {
    const store = this.getEntityStore(entityName);
    const result = store.delete(id);
    if (result) {
      this.saveToLocalStorage(); // Sauvegarder automatiquement
    }
    return result;
  }
  
  clear() {
    this.data.clear();
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('🧹 Stockage local HDS effacé');
  }
}

// Instance globale du stockage persistant local
const persistentLocalStorage = new PersistentLocalStorage();

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
      console.warn('⚠️ Mode récupération: utilisation du stockage localStorage persistant pour les patients');
      return persistentLocalStorage.getAll('patients');
    }
    
    try {
      return await this.sqliteAdapter.getAll();
    } catch (error) {
      console.error('Error getting all patients from local storage, falling back to localStorage:', error);
      this.fallbackToMemory = true;
      return persistentLocalStorage.getAll('patients');
    }
  }

  async getById(id: number | string): Promise<any | null> {
    if (this.fallbackToMemory) {
      return persistentLocalStorage.getById('patients', String(id));
    }
    
    try {
      return await this.sqliteAdapter.getById(id);
    } catch (error) {
      console.error('Error getting patient by ID from local storage, falling back to localStorage:', error);
      this.fallbackToMemory = true;
      return persistentLocalStorage.getById('patients', String(id));
    }
  }

  async create(data: any): Promise<any> {
    if (this.fallbackToMemory) {
      return persistentLocalStorage.create('patients', data);
    }
    
    try {
      return await this.sqliteAdapter.create(data);
    } catch (error) {
      console.error('Error creating patient in local storage, falling back to localStorage:', error);
      this.fallbackToMemory = true;
      return persistentLocalStorage.create('patients', data);
    }
  }

  async update(id: number | string, data: any): Promise<any> {
    if (this.fallbackToMemory) {
      return persistentLocalStorage.update('patients', String(id), data);
    }
    
    try {
      return await this.sqliteAdapter.update(id, data);
    } catch (error) {
      console.error('Error updating patient in local storage, falling back to localStorage:', error);
      this.fallbackToMemory = true;
      return persistentLocalStorage.update('patients', String(id), data);
    }
  }

  async delete(id: number | string): Promise<boolean> {
    if (this.fallbackToMemory) {
      return persistentLocalStorage.delete('patients', String(id));
    }
    
    try {
      return await this.sqliteAdapter.delete(id);
    } catch (error) {
      console.error('Error deleting patient from local storage, falling back to localStorage:', error);
      this.fallbackToMemory = true;
      return persistentLocalStorage.delete('patients', String(id));
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
      console.warn('⚠️ Mode récupération: utilisation du stockage localStorage persistant pour les rendez-vous');
      return persistentLocalStorage.getAll('appointments');
    }
    
    try {
      return await this.sqliteAdapter.getAll();
    } catch (error) {
      console.error('Error getting all appointments from local storage, falling back to localStorage:', error);
      this.fallbackToMemory = true;
      return persistentLocalStorage.getAll('appointments');
    }
  }

  async getById(id: number | string): Promise<any | null> {
    if (this.fallbackToMemory) {
      return persistentLocalStorage.getById('appointments', String(id));
    }
    
    try {
      return await this.sqliteAdapter.getById(id);
    } catch (error) {
      console.error('Error getting appointment by ID from local storage, falling back to localStorage:', error);
      this.fallbackToMemory = true;
      return persistentLocalStorage.getById('appointments', String(id));
    }
  }

  async create(data: any): Promise<any> {
    if (this.fallbackToMemory) {
      return persistentLocalStorage.create('appointments', data);
    }
    
    try {
      return await this.sqliteAdapter.create(data);
    } catch (error) {
      console.error('Error creating appointment in local storage, falling back to localStorage:', error);
      this.fallbackToMemory = true;
      return persistentLocalStorage.create('appointments', data);
    }
  }

  async update(id: number | string, data: any): Promise<any> {
    if (this.fallbackToMemory) {
      return persistentLocalStorage.update('appointments', String(id), data);
    }
    
    try {
      return await this.sqliteAdapter.update(id, data);
    } catch (error) {
      console.error('Error updating appointment in local storage, falling back to localStorage:', error);
      this.fallbackToMemory = true;
      return persistentLocalStorage.update('appointments', String(id), data);
    }
  }

  async delete(id: number | string): Promise<boolean> {
    if (this.fallbackToMemory) {
      return persistentLocalStorage.delete('appointments', String(id));
    }
    
    try {
      return await this.sqliteAdapter.delete(id);
    } catch (error) {
      console.error('Error deleting appointment from local storage, falling back to localStorage:', error);
      this.fallbackToMemory = true;
      return persistentLocalStorage.delete('appointments', String(id));
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
      console.warn('⚠️ Mode récupération: utilisation du stockage localStorage persistant pour les factures');
      return persistentLocalStorage.getAll('invoices');
    }
    
    try {
      return await this.sqliteAdapter.getAll();
    } catch (error) {
      console.error('Error getting all invoices from local storage, falling back to localStorage:', error);
      this.fallbackToMemory = true;
      return persistentLocalStorage.getAll('invoices');
    }
  }

  async getById(id: number | string): Promise<any | null> {
    if (this.fallbackToMemory) {
      return persistentLocalStorage.getById('invoices', String(id));
    }
    
    try {
      return await this.sqliteAdapter.getById(id);
    } catch (error) {
      console.error('Error getting invoice by ID from local storage, falling back to localStorage:', error);
      this.fallbackToMemory = true;
      return persistentLocalStorage.getById('invoices', String(id));
    }
  }

  async create(data: any): Promise<any> {
    if (this.fallbackToMemory) {
      return persistentLocalStorage.create('invoices', data);
    }
    
    try {
      return await this.sqliteAdapter.create(data);
    } catch (error) {
      console.error('Error creating invoice in local storage, falling back to localStorage:', error);
      this.fallbackToMemory = true;
      return persistentLocalStorage.create('invoices', data);
    }
  }

  async update(id: number | string, data: any): Promise<any> {
    if (this.fallbackToMemory) {
      return persistentLocalStorage.update('invoices', String(id), data);
    }
    
    try {
      return await this.sqliteAdapter.update(id, data);
    } catch (error) {
      console.error('Error updating invoice in local storage, falling back to localStorage:', error);
      this.fallbackToMemory = true;
      return persistentLocalStorage.update('invoices', String(id), data);
    }
  }

  async delete(id: number | string): Promise<boolean> {
    if (this.fallbackToMemory) {
      return persistentLocalStorage.delete('invoices', String(id));
    }
    
    try {
      return await this.sqliteAdapter.delete(id);
    } catch (error) {
      console.error('Error deleting invoice from local storage, falling back to localStorage:', error);
      this.fallbackToMemory = true;
      return persistentLocalStorage.delete('invoices', String(id));
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
export function clearMemoryStorage() {
  persistentLocalStorage.clear();
  console.log('🧹 Persistent local storage cleared');
}

/**
 * Vérifie si l'application utilise le mode localStorage persistant
 */
export function isUsingMemoryFallback(): boolean {
  const adapters = createLocalAdapters();
  return (adapters.patients as any).fallbackToMemory || false;
}