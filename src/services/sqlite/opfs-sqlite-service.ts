/**
 * Service SQLite avec OPFS (Origin Private File System)
 * Implémentation complète du stockage local sécurisé
 */

import type { Database } from 'sql.js';
import { SQLiteFallbackService } from './sqlite-fallback';

interface SQLiteOPFSConfig {
  dbName: string;
  version: number;
  enableEncryption: boolean;
  encryptionKey?: string;
}

export class OPFSSQLiteService {
  private db: Database | null = null;
  private fallbackService: SQLiteFallbackService | null = null;
  private useFallback: boolean = false;
  private opfsRoot: FileSystemDirectoryHandle | null = null;
  private config: SQLiteOPFSConfig;
  private initialized = false;

  constructor(config: SQLiteOPFSConfig) {
    this.config = config;
  }

  /**
   * Initialise SQLite avec OPFS
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log('🔄 Initializing SQLite with OPFS...');

      // Vérifier le support OPFS
      if (!('storage' in navigator) || !('getDirectory' in navigator.storage)) {
        throw new Error('OPFS not supported in this browser');
      }

      // Obtenir l'accès au système de fichiers privé
      this.opfsRoot = await navigator.storage.getDirectory();
      
      // Charger ou créer la base de données
      await this.loadOrCreateDatabase();
      
      // Créer les tables nécessaires
      await this.createTables();
      
      this.initialized = true;
      console.log('✅ SQLite with OPFS initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize SQLite with OPFS:', error);
      throw error;
    }
  }

  /**
   * Initialise SQL.js avec fallback CDN
   */
  private async initSqlJsWithFallback(initSqlJs: any): Promise<any> {
    // Première tentative: utiliser la version locale 
    try {
      console.log('🔄 Tentative de chargement SQL.js avec WASM local');
      const sqlite = await initSqlJs({
        locateFile: (file: string) => {
          if (file.endsWith('.wasm')) {
            return '/sql-wasm.wasm';
          }
          return file;
        }
      });
      console.log('✅ SQL.js chargé avec succès avec WASM local');
      return sqlite;
    } catch (error) {
      console.warn('❌ Échec du chargement WASM local:', error);
    }

    // Deuxième tentative: charger sans WASM (mode memory-only)
    try {
      console.log('🔄 Tentative de chargement SQL.js en mode mémoire uniquement');
      const sqlite = await initSqlJs();
      console.log('✅ SQL.js chargé avec succès en mode mémoire');
      return sqlite;
    } catch (error) {
      console.warn('❌ Échec du chargement en mode mémoire:', error);
    }

    // Troisième tentative: CDN fallbacks
    const cdnUrls = [
      'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.wasm',
      'https://unpkg.com/sql.js@1.10.2/dist/sql-wasm.wasm'
    ];

    for (const wasmUrl of cdnUrls) {
      try {
        console.log(`🔄 Tentative de chargement SQL.js depuis CDN: ${wasmUrl}`);
        const sqlite = await initSqlJs({
          locateFile: (file: string) => {
            if (file.endsWith('.wasm')) {
              return wasmUrl;
            }
            return file;
          }
        });
        console.log(`✅ SQL.js chargé avec succès depuis CDN: ${wasmUrl}`);
        return sqlite;
      } catch (error) {
        console.warn(`❌ Échec du chargement depuis CDN ${wasmUrl}:`, error);
      }
    }
    
    throw new Error('❌ ERREUR CRITIQUE: Impossible de charger SQL.js depuis aucune source. Stockage local indisponible.');
  }

  /**
   * Charge ou crée la base de données
   */
  private async loadOrCreateDatabase(): Promise<void> {
    try {
      // Première tentative: utiliser SQL.js normal
      await this.tryLoadSQLiteDatabase();
    } catch (sqliteError) {
      console.warn('❌ SQLite normal échoué, basculement vers le service de fallback:', sqliteError);
      
      // Activer le mode fallback
      this.useFallback = true;
      this.fallbackService = new SQLiteFallbackService();
      
      console.log('🔄 Service de fallback activé - stockage mémoire simple');
    }
  }

  private async tryLoadSQLiteDatabase(): Promise<void> {
    const dbFileName = `${this.config.dbName}.sqlite`;
    
    // Essayer de charger la base existante
    try {
      const fileHandle = await this.opfsRoot!.getFileHandle(dbFileName);
      const file = await fileHandle.getFile();
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Charger sql.js dynamiquement avec fallback CDN
      let initSqlJs;
      try {
        const sqlJsModule = await import('sql.js');
        initSqlJs = sqlJsModule.default || sqlJsModule;
      } catch (importError) {
        console.warn('❌ Import sql.js échoué:', importError);
        throw new Error('sql.js module non disponible');
      }
      
      const sqlite = await this.initSqlJsWithFallback(initSqlJs);
      this.db = new sqlite.Database(uint8Array);
      console.log('📂 Existing database loaded from OPFS');
      
    } catch (error) {
      // Base de données n'existe pas, en créer une nouvelle
      let initSqlJs;
      try {
        const sqlJsModule = await import('sql.js');
        initSqlJs = sqlJsModule.default || sqlJsModule;
      } catch (importError) {
        console.warn('❌ Import sql.js échoué:', importError);
        throw new Error('sql.js module non disponible');
      }
      
      const sqlite = await this.initSqlJsWithFallback(initSqlJs);
      this.db = new sqlite.Database();
      console.log('🆕 New database created');
    }
  }

  /**
   * Crée les tables nécessaires
   */
  private async createTables(): Promise<void> {
    if (this.useFallback || !this.db) {
      console.log('📋 Utilisation du service de fallback - tables déjà créées');
      return;
    }

    const tables = [
      // Table patients
      `CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT UNIQUE,
        phone TEXT,
        birthDate DATE,
        address TEXT,
        medicalHistory TEXT,
        allergies TEXT,
        medications TEXT,
        emergencyContact TEXT,
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Table appointments
      `CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patientId INTEGER REFERENCES patients(id),
        osteopathId INTEGER NOT NULL,
        cabinetId INTEGER,
        date DATETIME NOT NULL,
        duration INTEGER DEFAULT 60,
        status TEXT DEFAULT 'scheduled',
        notes TEXT,
        diagnosis TEXT,
        treatment TEXT,
        nextAppointment DATE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Table invoices
      `CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patientId INTEGER REFERENCES patients(id),
        appointmentId INTEGER REFERENCES appointments(id),
        osteopathId INTEGER NOT NULL,
        cabinetId INTEGER,
        amount DECIMAL(10,2) NOT NULL,
        date DATE NOT NULL,
        status TEXT DEFAULT 'pending',
        paymentMethod TEXT,
        paymentDate DATE,
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Table de métadonnées
      `CREATE TABLE IF NOT EXISTS metadata (
        key TEXT PRIMARY KEY,
        value TEXT,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const tableSQL of tables) {
      this.db.run(tableSQL);
    }

    // Ajouter la version de la base
    this.db.run(
      'INSERT OR REPLACE INTO metadata (key, value) VALUES (?, ?)',
      ['version', this.config.version.toString()]
    );

    console.log('📋 Tables created successfully');
  }

  /**
   * Sauvegarde la base de données dans OPFS
   */
  async save(): Promise<void> {
    if (!this.db || !this.opfsRoot) throw new Error('Database not initialized');

    try {
      const dbFileName = `${this.config.dbName}.sqlite`;
      const data = this.db.export();
      
      // Créer ou obtenir le fichier
      const fileHandle = await this.opfsRoot.getFileHandle(dbFileName, { create: true });
      const writable = await fileHandle.createWritable();
      
      // Écrire les données
      await writable.write(data);
      await writable.close();
      
      console.log('💾 Database saved to OPFS');
    } catch (error) {
      console.error('Failed to save database:', error);
      throw error;
    }
  }

  /**
   * Exécute une requête SELECT
   */
  query<T = any>(sql: string, params: any[] = []): T[] {
    if (this.useFallback && this.fallbackService) {
      return this.fallbackService.query<T>(sql, params);
    }
    
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare(sql);
    const result: T[] = [];
    
    while (stmt.step()) {
      result.push(stmt.getAsObject() as T);
    }
    
    stmt.free();
    return result;
  }

  /**
   * Exécute une requête INSERT/UPDATE/DELETE
   */
  async run(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
    if (this.useFallback && this.fallbackService) {
      return await this.fallbackService.run(sql, params);
    }
    
    if (!this.db) throw new Error('Database not initialized');
    
    this.db.run(sql, params);
    
    // Sauvegarder automatiquement après chaque modification
    await this.save();
    
    // Obtenir le dernier ID inséré et le nombre de changements
    const lastID = this.query<{ last_insert_rowid: number }>('SELECT last_insert_rowid() as last_insert_rowid')[0]?.last_insert_rowid || 0;
    const changes = this.query<{ changes: number }>('SELECT changes() as changes')[0]?.changes || 0;
    
    return {
      lastID,
      changes
    };
  }

  /**
   * Démarre une transaction
   */
  beginTransaction(): void {
    if (this.useFallback && this.fallbackService) {
      this.fallbackService.beginTransaction();
      return;
    }
    if (!this.db) throw new Error('Database not initialized');
    this.db.run('BEGIN TRANSACTION');
  }

  /**
   * Valide une transaction
   */
  async commit(): Promise<void> {
    if (this.useFallback && this.fallbackService) {
      await this.fallbackService.commit();
      return;
    }
    if (!this.db) throw new Error('Database not initialized');
    this.db.run('COMMIT');
    await this.save();
  }

  /**
   * Annule une transaction
   */
  rollback(): void {
    if (this.useFallback && this.fallbackService) {
      this.fallbackService.rollback();
      return;
    }
    if (!this.db) throw new Error('Database not initialized');
    this.db.run('ROLLBACK');
  }

  /**
   * Exporte la base de données
   */
  export(): Uint8Array {
    if (this.useFallback && this.fallbackService) {
      return this.fallbackService.export();
    }
    if (!this.db) throw new Error('Database not initialized');
    return this.db.export();
  }

  /**
   * Ferme la base de données
   */
  close(): void {
    if (this.useFallback && this.fallbackService) {
      this.fallbackService.close();
      return;
    }
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    this.initialized = false;
  }

  /**
   * Obtient les statistiques de la base
   */
  getStats(): {
    size: number;
    tables: string[];
    version: string;
  } {
    if (this.useFallback && this.fallbackService) {
      return this.fallbackService.getStats();
    }
    
    if (!this.db) throw new Error('Database not initialized');

    const tables = this.query<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    ).map(row => row.name);

    const versionResult = this.query<{ value: string }>(
      "SELECT value FROM metadata WHERE key = 'version'"
    );

    const data = this.db.export();

    return {
      size: data.length,
      tables,
      version: versionResult[0]?.value || '1'
    };
  }
}

// Instance singleton
let opfsSQLiteService: OPFSSQLiteService | null = null;
let initPromise: Promise<void> | null = null;

/**
 * Obtient l'instance SQLite OPFS
 */
export async function getOPFSSQLiteService(): Promise<OPFSSQLiteService> {
  if (!opfsSQLiteService) {
    opfsSQLiteService = new OPFSSQLiteService({
      dbName: 'patienthub',
      version: 1,
      enableEncryption: false // TODO: Implémenter le chiffrement
    });
    
    // Démarrer et mémoriser l'initialisation pour éviter les courses
    initPromise = opfsSQLiteService.initialize();
    await initPromise;
  } else if (initPromise) {
    // Attendre toute initialisation en cours
    await initPromise;
  } else {
    // S'assurer que le service est bien initialisé (idempotent)
    await opfsSQLiteService.initialize();
  }
  
  return opfsSQLiteService;
}

/**
 * Vérifie le support OPFS du navigateur avec diagnostic détaillé
 */
export function checkOPFSSupport(): { supported: boolean; details: string[] } {
  const details: string[] = [];
  let supported = true;

  if (!('storage' in navigator)) {
    details.push('❌ navigator.storage non disponible');
    supported = false;
  } else {
    details.push('✅ navigator.storage disponible');
  }

  if (!('getDirectory' in navigator.storage)) {
    details.push('❌ navigator.storage.getDirectory non disponible');
    supported = false;
  } else {
    details.push('✅ navigator.storage.getDirectory disponible');
  }

  if (typeof FileSystemFileHandle === 'undefined' || !('createWritable' in FileSystemFileHandle.prototype)) {
    details.push('❌ FileSystemFileHandle.createWritable non disponible');
    supported = false;
  } else {
    details.push('✅ FileSystemFileHandle.createWritable disponible');
  }

  // Vérifications supplémentaires
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    details.push('⚠️ OPFS nécessite HTTPS ou localhost');
    supported = false;
  } else {
    details.push('✅ Contexte sécurisé (HTTPS/localhost)');
  }

  return { supported, details };
}

/**
 * Version simple pour rétrocompatibilité
 */
export function isOPFSSupported(): boolean {
  return checkOPFSSupport().supported;
}