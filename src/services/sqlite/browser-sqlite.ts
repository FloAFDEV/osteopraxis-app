/**
 * Service SQLite pour navigateur Web
 * Utilise OPFS (Origin Private File System) + sql.js
 */

import type { Database, SqlJsStatic } from 'sql.js';

interface BrowserSQLiteDB {
  exec(sql: string): void;
  run(sql: string, params?: any[]): void;
  get(sql: string, params?: any[]): any;
  all(sql: string, params?: any[]): any[];
  close(): void;
  export(): Uint8Array;
}

/**
 * Gestionnaire SQLite pour le navigateur
 */
export class BrowserSQLiteManager {
  private db: Database | null = null;
  private sqljs: any = null;
  private dbPath = 'osteopath-data.db';
  private initialized = false;

  /**
   * Initialise sql.js et charge la base de données
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log('🔄 Initializing SQLite in browser...');

      // Initialiser sql.js avec les fichiers WASM
      const initSqlJs = (await import('sql.js')).default;
      this.sqljs = await initSqlJs({
        locateFile: (file: string) => {
          // Utiliser le fichier WASM local
          if (file.endsWith('.wasm')) {
            return '/sql-wasm.wasm';
          }
          return file;
        }
      });

      // Tenter de charger une base existante depuis OPFS
      const existingData = await this.loadFromOPFS();
      
      if (existingData) {
        console.log('📂 Loading existing SQLite database from OPFS');
        this.db = new this.sqljs.Database(existingData);
      } else {
        console.log('🆕 Creating new SQLite database');
        this.db = new this.sqljs.Database();
        
        // Créer les tables de base si c'est une nouvelle DB
        await this.createBaseTables();
      }

      this.initialized = true;
      console.log('✅ SQLite initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize SQLite:', error);
      throw new Error(`SQLite initialization failed: ${error}`);
    }
  }

  /**
   * Charge la base de données depuis OPFS
   */
  private async loadFromOPFS(): Promise<Uint8Array | null> {
    try {
      if (!('opfs' in navigator.storage)) {
        console.warn('⚠️ OPFS not supported, using memory-only SQLite');
        return null;
      }

      const opfsRoot = await navigator.storage.getDirectory();
      const fileHandle = await opfsRoot.getFileHandle(this.dbPath);
      const file = await fileHandle.getFile();
      const arrayBuffer = await file.arrayBuffer();
      
      return new Uint8Array(arrayBuffer);
    } catch (error) {
      // Fichier n'existe pas encore, c'est normal pour une première utilisation
      console.log('📁 No existing database found in OPFS');
      return null;
    }
  }

  /**
   * Sauvegarde la base de données dans OPFS
   */
  private async saveToOPFS(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      if (!('opfs' in navigator.storage)) {
        console.warn('⚠️ OPFS not supported, cannot persist data');
        return;
      }

      const data = this.db.export();
      const opfsRoot = await navigator.storage.getDirectory();
      const fileHandle = await opfsRoot.getFileHandle(this.dbPath, { create: true });
      const writable = await fileHandle.createWritable();
      
      await writable.write(data.slice(0));
      await writable.close();
      
      console.log('💾 Database saved to OPFS');
    } catch (error) {
      console.error('❌ Failed to save database to OPFS:', error);
      throw error;
    }
  }

  /**
   * Crée les tables de base pour les données sensibles
   */
  private async createBaseTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const createTables = `
      -- Table des patients (données sensibles)
      CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        birthDate TEXT,
        address TEXT,
        osteopathId INTEGER NOT NULL,
        cabinetId INTEGER,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
        -- Tous les autres champs du schéma Patient
        gender TEXT,
        maritalStatus TEXT,
        occupation TEXT,
        medicalHistory TEXT,
        currentTreatment TEXT,
        allergies TEXT,
        notes TEXT,
        deleted_at TEXT,
        -- Champs spécialisés
        weight REAL,
        height REAL,
        bmi REAL,
        smoker BOOLEAN DEFAULT 0,
        physicalActivity TEXT,
        -- Données pédiatriques
        birthDetails TEXT,
        developmentMilestones TEXT,
        feeding TEXT,
        behavior TEXT
      );

      -- Table des rendez-vous
      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patientId INTEGER NOT NULL,
        osteopathId INTEGER NOT NULL,
        cabinetId INTEGER,
        date TEXT NOT NULL,
        reason TEXT NOT NULL,
        notes TEXT,
        status TEXT NOT NULL DEFAULT 'SCHEDULED',
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
        deleted_at TEXT,
        FOREIGN KEY (patientId) REFERENCES patients(id)
      );

      -- Table des factures
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patientId INTEGER NOT NULL,
        appointmentId INTEGER,
        osteopathId INTEGER NOT NULL,
        cabinetId INTEGER,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        paymentStatus TEXT NOT NULL DEFAULT 'PENDING',
        paymentMethod TEXT,
        notes TEXT,
        tvaExoneration BOOLEAN DEFAULT 1,
        tvaMotif TEXT DEFAULT 'TVA non applicable - Article 261-4-1° du CGI',
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
        deleted_at TEXT,
        FOREIGN KEY (patientId) REFERENCES patients(id),
        FOREIGN KEY (appointmentId) REFERENCES appointments(id)
      );

      -- Table des consultations
      CREATE TABLE IF NOT EXISTS consultations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patientId INTEGER NOT NULL,
        osteopathId INTEGER,
        date TEXT NOT NULL,
        notes TEXT NOT NULL,
        isCancelled BOOLEAN DEFAULT 0,
        cancellationReason TEXT,
        FOREIGN KEY (patientId) REFERENCES patients(id)
      );

      -- Table des documents médicaux
      CREATE TABLE IF NOT EXISTS medical_documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patientId INTEGER NOT NULL,
        description TEXT NOT NULL,
        url TEXT NOT NULL,
        FOREIGN KEY (patientId) REFERENCES patients(id)
      );

      -- Table des devis
      CREATE TABLE IF NOT EXISTS quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patientId INTEGER NOT NULL,
        osteopathId INTEGER NOT NULL,
        cabinetId INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        amount REAL NOT NULL DEFAULT 0,
        validUntil TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'DRAFT',
        notes TEXT,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (patientId) REFERENCES patients(id)
      );

      -- Table de l'historique des traitements
      CREATE TABLE IF NOT EXISTS treatment_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        consultationId INTEGER NOT NULL,
        date TEXT NOT NULL DEFAULT (datetime('now')),
        description TEXT NOT NULL,
        FOREIGN KEY (consultationId) REFERENCES consultations(id)
      );

      -- Index pour améliorer les performances
      CREATE INDEX IF NOT EXISTS idx_patients_osteopath ON patients(osteopathId);
      CREATE INDEX IF NOT EXISTS idx_patients_cabinet ON patients(cabinetId);
      CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patientId);
      CREATE INDEX IF NOT EXISTS idx_appointments_osteopath ON appointments(osteopathId);
      CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
      CREATE INDEX IF NOT EXISTS idx_invoices_patient ON invoices(patientId);
      CREATE INDEX IF NOT EXISTS idx_invoices_osteopath ON invoices(osteopathId);
    `;

    this.db.exec(createTables);
    await this.saveToOPFS();
    console.log('📋 Base tables created successfully');
  }

  /**
   * Interface unifiée pour les opérations SQL
   */
  getDB(): BrowserSQLiteDB {
    if (!this.db) throw new Error('Database not initialized. Call initialize() first.');

    return {
      exec: (sql: string) => {
        this.db!.exec(sql);
        this.saveToOPFS(); // Auto-save après chaque modification
      },

      run: (sql: string, params?: any[]) => {
        this.db!.run(sql, params);
        this.saveToOPFS(); // Auto-save après chaque modification
      },

      get: (sql: string, params?: any[]) => {
        const stmt = this.db!.prepare(sql);
        if (params) stmt.bind(params);
        
        if (stmt.step()) {
          const result = stmt.getAsObject();
          stmt.free();
          return result;
        }
        stmt.free();
        return null;
      },

      all: (sql: string, params?: any[]) => {
        const stmt = this.db!.prepare(sql);
        if (params) stmt.bind(params);
        
        const results: any[] = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      },

      close: () => {
        if (this.db) {
          this.db.close();
          this.db = null;
          this.initialized = false;
        }
      },

      export: () => {
        if (!this.db) throw new Error('Database not initialized');
        return this.db.export();
      }
    };
  }

  /**
   * Exporte la base de données pour sauvegarde
   */
  async exportDatabase(): Promise<Uint8Array> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.export();
  }

  /**
   * Importe une base de données depuis une sauvegarde
   */
  async importDatabase(data: Uint8Array): Promise<void> {
    if (!this.sqljs) {
      const initSqlJs = (await import('sql.js')).default;
      this.sqljs = await initSqlJs({
        locateFile: (file: string) => {
          if (file.endsWith('.wasm')) {
            return '/sql-wasm.wasm';
          }
          return file;
        }
      });
    }
    
    if (this.db) {
      this.db.close();
    }
    
    this.db = new this.sqljs.Database(data);
    await this.saveToOPFS();
    console.log('📥 Database imported successfully');
  }

  /**
   * Vérifie si SQLite est disponible dans le navigateur
   */
  static isSupported(): boolean {
    return typeof WebAssembly !== 'undefined' && 
           typeof Worker !== 'undefined';
  }

  /**
   * Vérifie si OPFS est disponible pour la persistance
   */
  static hasOPFSSupport(): boolean {
    return 'opfs' in navigator.storage;
  }

  /**
   * Obtient des informations sur le stockage
   */
  async getStorageInfo(): Promise<{
    opfsSupported: boolean;
    sqliteSupported: boolean;
    databaseSize?: number;
    tablesCount?: number;
  }> {
    const info = {
      opfsSupported: BrowserSQLiteManager.hasOPFSSupport(),
      sqliteSupported: BrowserSQLiteManager.isSupported(),
      databaseSize: undefined as number | undefined,
      tablesCount: undefined as number | undefined
    };

    if (this.db) {
      try {
        const sizeResult = this.getDB().get("SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()");
        info.databaseSize = sizeResult?.size || 0;

        const tablesResult = this.getDB().all("SELECT name FROM sqlite_master WHERE type='table'");
        info.tablesCount = tablesResult?.length || 0;
      } catch (error) {
        console.warn('Could not get database size info:', error);
      }
    }

    return info;
  }
}

// Instance singleton
export const browserSQLite = new BrowserSQLiteManager();