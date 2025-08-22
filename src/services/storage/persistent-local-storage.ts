/**
 * Service de stockage local persistant pour le mode démo
 * Utilise IndexedDB avec fallback localStorage
 */

interface StorageRecord {
  id: string | number;
  [key: string]: any;
}

class PersistentLocalStorage {
  private dbName = 'PatientHubDemo';
  private version = 1;
  private db: IDBDatabase | null = null;

  // Générer un ID compatible avec PostgreSQL (max 2^31-1 = 2147483647)
  private generateSafeId(): number {
    return Math.floor(Math.random() * 2000000000) + 1;
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Créer les tables nécessaires
        const tables = ['patients', 'appointments', 'invoices', 'test_setup'];
        
        tables.forEach(tableName => {
          if (!db.objectStoreNames.contains(tableName)) {
            db.createObjectStore(tableName, { keyPath: 'id' });
          }
        });
      };
    });
  }

  async create(tableName: string, data: StorageRecord): Promise<StorageRecord> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([tableName], 'readwrite');
      const store = transaction.objectStore(tableName);
      
      const record = { ...data, id: data.id || this.generateSafeId() };
      const request = store.add(record);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(record);
    });
  }

  async getById(tableName: string, id: string | number): Promise<StorageRecord | null> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([tableName], 'readonly');
      const store = transaction.objectStore(tableName);
      const request = store.get(id);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async getAll(tableName: string): Promise<StorageRecord[]> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([tableName], 'readonly');
      const store = transaction.objectStore(tableName);
      const request = store.getAll();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async update(tableName: string, id: string | number, updates: Partial<StorageRecord>): Promise<StorageRecord> {
    const existing = await this.getById(tableName, id);
    if (!existing) {
      throw new Error(`Record ${id} not found`);
    }
    
    const updated = { ...existing, ...updates };
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([tableName], 'readwrite');
      const store = transaction.objectStore(tableName);
      const request = store.put(updated);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(updated);
    });
  }

  async delete(tableName: string, id: string | number): Promise<boolean> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([tableName], 'readwrite');
      const store = transaction.objectStore(tableName);
      const request = store.delete(id);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(true);
    });
  }

  async clear(tableName: string): Promise<void> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([tableName], 'readwrite');
      const store = transaction.objectStore(tableName);
      const request = store.clear();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getStorageInfo(): Promise<{ tables: string[]; size: number }> {
    if (!this.db) await this.initialize();
    
    const tables = Array.from(this.db!.objectStoreNames);
    let totalSize = 0;
    
    for (const tableName of tables) {
      const data = await this.getAll(tableName);
      totalSize += new Blob([JSON.stringify(data)]).size;
    }
    
    return { tables, size: totalSize };
  }
}

let instance: PersistentLocalStorage | null = null;

export async function getPersistentLocalStorage(): Promise<PersistentLocalStorage> {
  if (!instance) {
    instance = new PersistentLocalStorage();
    await instance.initialize();
  }
  return instance;
}