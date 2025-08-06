import { DataAdapter, DataLocation } from './types';
import { createEnhancedSQLiteAdapters } from '../sqlite/enhanced-sqlite-adapters';
import { getOPFSSQLiteService } from '../sqlite/opfs-sqlite-service';

/**
 * Adaptateurs locaux utilisant SQLite avec OPFS
 * Ces adaptateurs se connectent directement au service SQLite OPFS
 */

class LocalPatientAdapter implements DataAdapter<any> {
  private sqliteAdapter: any;

  constructor() {
    const adapters = createEnhancedSQLiteAdapters();
    this.sqliteAdapter = adapters.patients;
  }

  getLocation(): DataLocation {
    return DataLocation.LOCAL;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const service = await getOPFSSQLiteService();
      return service !== null;
    } catch (error) {
      console.warn('SQLite service not available:', error);
      return false;
    }
  }

  async getAll(): Promise<any[]> {
    try {
      return await this.sqliteAdapter.getAll();
    } catch (error) {
      console.error('Error getting all patients from local storage:', error);
      return [];
    }
  }

  async getById(id: number | string): Promise<any | null> {
    try {
      return await this.sqliteAdapter.getById(id);
    } catch (error) {
      console.error('Error getting patient by ID from local storage:', error);
      return null;
    }
  }

  async create(data: any): Promise<any> {
    try {
      return await this.sqliteAdapter.create(data);
    } catch (error) {
      console.error('Error creating patient in local storage:', error);
      throw error;
    }
  }

  async update(id: number | string, data: any): Promise<any> {
    try {
      return await this.sqliteAdapter.update(id, data);
    } catch (error) {
      console.error('Error updating patient in local storage:', error);
      throw error;
    }
  }

  async delete(id: number | string): Promise<boolean> {
    try {
      return await this.sqliteAdapter.delete(id);
    } catch (error) {
      console.error('Error deleting patient from local storage:', error);
      return false;
    }
  }
}

class LocalAppointmentAdapter implements DataAdapter<any> {
  private sqliteAdapter: any;

  constructor() {
    const adapters = createEnhancedSQLiteAdapters();
    this.sqliteAdapter = adapters.appointments;
  }

  getLocation(): DataLocation {
    return DataLocation.LOCAL;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const service = await getOPFSSQLiteService();
      return service !== null;
    } catch (error) {
      console.warn('SQLite service not available:', error);
      return false;
    }
  }

  async getAll(): Promise<any[]> {
    try {
      return await this.sqliteAdapter.getAll();
    } catch (error) {
      console.error('Error getting all appointments from local storage:', error);
      return [];
    }
  }

  async getById(id: number | string): Promise<any | null> {
    try {
      return await this.sqliteAdapter.getById(id);
    } catch (error) {
      console.error('Error getting appointment by ID from local storage:', error);
      return null;
    }
  }

  async create(data: any): Promise<any> {
    try {
      return await this.sqliteAdapter.create(data);
    } catch (error) {
      console.error('Error creating appointment in local storage:', error);
      throw error;
    }
  }

  async update(id: number | string, data: any): Promise<any> {
    try {
      return await this.sqliteAdapter.update(id, data);
    } catch (error) {
      console.error('Error updating appointment in local storage:', error);
      throw error;
    }
  }

  async delete(id: number | string): Promise<boolean> {
    try {
      return await this.sqliteAdapter.delete(id);
    } catch (error) {
      console.error('Error deleting appointment from local storage:', error);
      return false;
    }
  }
}

class LocalInvoiceAdapter implements DataAdapter<any> {
  private sqliteAdapter: any;

  constructor() {
    const adapters = createEnhancedSQLiteAdapters();
    this.sqliteAdapter = adapters.invoices;
  }

  getLocation(): DataLocation {
    return DataLocation.LOCAL;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const service = await getOPFSSQLiteService();
      return service !== null;
    } catch (error) {
      console.warn('SQLite service not available:', error);
      return false;
    }
  }

  async getAll(): Promise<any[]> {
    try {
      return await this.sqliteAdapter.getAll();
    } catch (error) {
      console.error('Error getting all invoices from local storage:', error);
      return [];
    }
  }

  async getById(id: number | string): Promise<any | null> {
    try {
      return await this.sqliteAdapter.getById(id);
    } catch (error) {
      console.error('Error getting invoice by ID from local storage:', error);
      return null;
    }
  }

  async create(data: any): Promise<any> {
    try {
      return await this.sqliteAdapter.create(data);
    } catch (error) {
      console.error('Error creating invoice in local storage:', error);
      throw error;
    }
  }

  async update(id: number | string, data: any): Promise<any> {
    try {
      return await this.sqliteAdapter.update(id, data);
    } catch (error) {
      console.error('Error updating invoice in local storage:', error);
      throw error;
    }
  }

  async delete(id: number | string): Promise<boolean> {
    try {
      return await this.sqliteAdapter.delete(id);
    } catch (error) {
      console.error('Error deleting invoice from local storage:', error);
      return false;
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
    
    // Vérifier le support OPFS
    const service = await getOPFSSQLiteService();
    if (!service) {
      throw new Error('OPFS SQLite service not available');
    }
    
    console.log('✅ SQLite local adapters initialized successfully');
    return createLocalAdapters();
  } catch (error) {
    console.error('❌ Failed to initialize SQLite local adapters:', error);
    throw error;
  }
}