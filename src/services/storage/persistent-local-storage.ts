/**
 * Stockage local VRAIMENT persistant utilisant IndexedDB
 * Les données survivent à la fermeture du navigateur et restent sur l'ordinateur
 */

interface StoredRecord {
  id: string;
  data: any;
  createdAt: string;
  updatedAt: string;
}

export class PersistentRealLocalStorage {
  private dbName = 'PatientHubLocalDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('❌ Erreur ouverture IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB ouvert avec succès');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Créer les stores pour chaque type de données HDS
        const tables = ['patients', 'appointments', 'invoices', 'consultations', 'medicalDocuments'];
        
        tables.forEach(tableName => {
          if (!db.objectStoreNames.contains(tableName)) {
            const store = db.createObjectStore(tableName, { keyPath: 'id', autoIncrement: true });
            store.createIndex('createdAt', 'createdAt', { unique: false });
            store.createIndex('updatedAt', 'updatedAt', { unique: false });
            console.log(`📋 Table IndexedDB créée: ${tableName}`);
          }
        });
      };
    });
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }
  }

  async getAll(tableName: string): Promise<any[]> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('IndexedDB non initialisé');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([tableName], 'readonly');
      const store = transaction.objectStore(tableName);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result.map(item => ({
          ...item.data,
          id: item.id,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        }));
        console.log(`📂 Chargé ${results.length} enregistrements depuis IndexedDB (${tableName})`);
        resolve(results);
      };

      request.onerror = () => {
        console.error(`❌ Erreur lecture IndexedDB (${tableName}):`, request.error);
        reject(request.error);
      };
    });
  }

  async getById(tableName: string, id: number | string): Promise<any | null> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('IndexedDB non initialisé');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([tableName], 'readonly');
      const store = transaction.objectStore(tableName);
      const request = store.get(Number(id));

      request.onsuccess = () => {
        if (request.result) {
          const result = {
            ...request.result.data,
            id: request.result.id,
            createdAt: request.result.createdAt,
            updatedAt: request.result.updatedAt
          };
          resolve(result);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error(`❌ Erreur lecture par ID IndexedDB (${tableName}):`, request.error);
        reject(request.error);
      };
    });
  }

  async create(tableName: string, data: any): Promise<any> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('IndexedDB non initialisé');

    const now = new Date().toISOString();
    const record: StoredRecord = {
      id: data.id ? String(data.id) : '', // Sera généré par autoIncrement
      data: { ...data },
      createdAt: now,
      updatedAt: now
    };

    // Supprimer les champs système des données
    delete record.data.id;
    delete record.data.createdAt;
    delete record.data.updatedAt;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([tableName], 'readwrite');
      const store = transaction.objectStore(tableName);
      const request = store.add(record);

      request.onsuccess = () => {
        const newId = request.result;
        const result = {
          ...record.data,
          id: newId,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt
        };
        console.log(`✅ Enregistrement créé dans IndexedDB (${tableName}) avec ID:`, newId);
        resolve(result);
      };

      request.onerror = () => {
        console.error(`❌ Erreur création IndexedDB (${tableName}):`, request.error);
        reject(request.error);
      };
    });
  }

  async update(tableName: string, id: number | string, data: any): Promise<any> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('IndexedDB non initialisé');

    // D'abord récupérer l'enregistrement existant
    const existing = await this.getById(tableName, id);
    if (!existing) {
      throw new Error(`Enregistrement ${id} non trouvé dans ${tableName}`);
    }

    const now = new Date().toISOString();
    const updatedRecord: StoredRecord = {
      id: String(id),
      data: { ...existing, ...data },
      createdAt: existing.createdAt,
      updatedAt: now
    };

    // Supprimer les champs système des données
    delete updatedRecord.data.id;
    delete updatedRecord.data.createdAt;
    delete updatedRecord.data.updatedAt;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([tableName], 'readwrite');
      const store = transaction.objectStore(tableName);
      const request = store.put({ ...updatedRecord, id: Number(id) });

      request.onsuccess = () => {
        const result = {
          ...updatedRecord.data,
          id: Number(id),
          createdAt: updatedRecord.createdAt,
          updatedAt: updatedRecord.updatedAt
        };
        console.log(`✅ Enregistrement mis à jour dans IndexedDB (${tableName}) ID:`, id);
        resolve(result);
      };

      request.onerror = () => {
        console.error(`❌ Erreur mise à jour IndexedDB (${tableName}):`, request.error);
        reject(request.error);
      };
    });
  }

  async delete(tableName: string, id: number | string): Promise<boolean> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('IndexedDB non initialisé');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([tableName], 'readwrite');
      const store = transaction.objectStore(tableName);
      const request = store.delete(Number(id));

      request.onsuccess = () => {
        console.log(`✅ Enregistrement supprimé de IndexedDB (${tableName}) ID:`, id);
        resolve(true);
      };

      request.onerror = () => {
        console.error(`❌ Erreur suppression IndexedDB (${tableName}):`, request.error);
        reject(request.error);
      };
    });
  }

  async clear(tableName: string): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('IndexedDB non initialisé');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([tableName], 'readwrite');
      const store = transaction.objectStore(tableName);
      const request = store.clear();

      request.onsuccess = () => {
        console.log(`🧹 Table IndexedDB vidée: ${tableName}`);
        resolve();
      };

      request.onerror = () => {
        console.error(`❌ Erreur vidage IndexedDB (${tableName}):`, request.error);
        reject(request.error);
      };
    });
  }

  async getStorageInfo(): Promise<{ size: number; tables: string[] }> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('IndexedDB non initialisé');

    const tables = Array.from(this.db.objectStoreNames);
    
    // Estimer la taille (approximative)
    let totalRecords = 0;
    for (const table of tables) {
      const records = await this.getAll(table);
      totalRecords += records.length;
    }

    return {
      size: totalRecords * 1024, // Estimation approximative
      tables
    };
  }

  async isAvailable(): Promise<boolean> {
    return 'indexedDB' in window && indexedDB !== null;
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('🔒 IndexedDB fermé');
    }
  }
}

// Instance singleton
let persistentStorage: PersistentRealLocalStorage | null = null;

export async function getPersistentLocalStorage(): Promise<PersistentRealLocalStorage> {
  if (!persistentStorage) {
    persistentStorage = new PersistentRealLocalStorage();
    await persistentStorage.getStorageInfo(); // Force l'initialisation
  }
  return persistentStorage;
}