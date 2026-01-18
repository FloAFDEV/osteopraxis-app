/**
 * Service SQLite avec OPFS (Origin Private File System)
 * Implémentation complète du stockage local sécurisé
 */

import type { Database } from 'sql.js';

interface SQLiteOPFSConfig {
  dbName: string;
  version: number;
  enableEncryption: boolean;
  encryptionKey?: string;
}

export class OPFSSQLiteService {
  private db: Database | null = null;
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

    console.log('🔄 Initializing SQLite with OPFS...');

    // Diagnostic simplifié du navigateur
    const hasStorage = 'storage' in navigator;
    const hasGetDirectory = hasStorage && 'getDirectory' in navigator.storage;
    const isSecure = window.isSecureContext;
    
    console.log('🔍 Support navigateur:', { hasStorage, hasGetDirectory, isSecure });

    // Essayer OPFS - Retourner un avertissement si impossible, pas une erreur critique
    if (!hasStorage || !hasGetDirectory || !isSecure) {
      console.warn('⚠️ OPFS non disponible: Stockage local sécurisé désactivé');
      console.warn('📋 Configuration requise: Contexte sécurisé (HTTPS) + API File System Access');
      throw new Error('OPFS non disponible dans cet environnement');
    }

    try {
      console.log('🔐 Accès OPFS sécurisé...');
      this.opfsRoot = await navigator.storage.getDirectory();
      await this.loadOrCreateDatabase();
      await this.createTables();
      this.initialized = true;
      console.log('✅ SQLite with OPFS initialized successfully');
    } catch (error) {
      console.error('❌ Échec initialisation OPFS:', error);
      throw new Error(`Stockage local non disponible: ${error}`);
    }
  }


  /**
   * Charge ou crée la base de données
   */
  private async loadOrCreateDatabase(): Promise<void> {
    const dbFileName = `${this.config.dbName}.sqlite`;
    
    // Essayer de charger la base existante
    try {
      const fileHandle = await this.opfsRoot!.getFileHandle(dbFileName);
      const file = await fileHandle.getFile();
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Charger sql.js de manière simple
      const sqlite = await this.loadSqlJsModule();
      this.db = new sqlite.Database(uint8Array);
      console.log('📂 Existing database loaded from OPFS');
      
    } catch (error) {
      // Base de données n'existe pas, en créer une nouvelle
      const sqlite = await this.loadSqlJsModule();
      this.db = new sqlite.Database();
      console.log('🆕 New database created');
    }
  }


  /**
   * Charge le module SQL.js de manière simple et robuste
   */
  private async loadSqlJsModule(): Promise<any> {
    try {
      // Essayer d'abord le chargement simple
      const sqlJsModule = await import('sql.js');
      const initSqlJs = sqlJsModule.default || sqlJsModule;
      const sqlite = await (typeof initSqlJs === 'function' ? initSqlJs : initSqlJs.default)();
      console.log('✅ SQL.js chargé en mode simple');
      return sqlite;
    } catch (error) {
      console.error('❌ Impossible de charger SQL.js:', error);
      throw new Error('SQL.js non disponible');
    }
  }

  /**
   * Crée les tables nécessaires
   */
  private async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error('Base de données non initialisée');
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
    if (!this.db || !this.opfsRoot) {
      throw new Error('Base de données OPFS non initialisée');
    }

    try {
      const dbFileName = `${this.config.dbName}.sqlite`;
      const data = this.db.export();
      
      // Créer ou obtenir le fichier
      const fileHandle = await this.opfsRoot.getFileHandle(dbFileName, { create: true });
      const writable = await fileHandle.createWritable();
      
      // Écrire les données
      await writable.write(data.slice(0));
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
    if (!this.db) {
      throw new Error('Base de données OPFS non initialisée');
    }
    
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
    if (!this.db) {
      throw new Error('Base de données OPFS non initialisée');
    }
    
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
    if (!this.db) {
      throw new Error('Base de données OPFS non initialisée');
    }
    this.db.run('BEGIN TRANSACTION');
  }

  /**
   * Valide une transaction
   */
  async commit(): Promise<void> {
    if (!this.db) {
      throw new Error('Base de données OPFS non initialisée');
    }
    this.db.run('COMMIT');
    await this.save();
  }

  /**
   * Annule une transaction
   */
  rollback(): void {
    if (!this.db) {
      throw new Error('Base de données OPFS non initialisée');
    }
    this.db.run('ROLLBACK');
  }

  /**
   * Exporte la base de données
   */
  export(): Uint8Array {
    if (!this.db) {
      throw new Error('Base de données OPFS non initialisée');
    }
    return this.db.export();
  }

  /**
   * Force une réinitialisation complète du service OPFS
   */
  async forceReinitialize(): Promise<void> {
    console.log('🔄 Force réinitialisation OPFS...');
    
    // Fermer la base existante
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    
    // Réinitialiser les états
    this.initialized = false;
    this.opfsRoot = null;
    
    // Relancer l'initialisation
    await this.initialize();
  }

  /**
   * Obtient les statistiques de la base
   */
  getStats(): {
    size: number;
    tables: string[];
    version: string;
  } {
    if (!this.db) {
      throw new Error('Base de données OPFS non initialisée');
    }

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
      dbName: 'osteopraxis',
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
  
  // Informations navigateur
  details.push(`🌐 Navigateur: ${navigator.userAgent.split(' ').pop()}`);
  details.push(`🔒 Contexte sécurisé: ${window.isSecureContext ? 'Oui' : 'Non'}`);
  details.push(`📍 Origine: ${window.location.origin}`);

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