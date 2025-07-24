import { DataAdapter, DataLocation } from './types';

/**
 * Interface pour SQLite dans le navigateur
 * (À implémenter avec sql.js + OPFS dans l'étape 2)
 */
interface LocalSQLiteDB {
  exec(sql: string, params?: any[]): Promise<any[]>;
  run(sql: string, params?: any[]): Promise<{ lastID: number; changes: number }>;
  get(sql: string, params?: any[]): Promise<any>;
  all(sql: string, params?: any[]): Promise<any[]>;
  close(): Promise<void>;
}

/**
 * Adaptateur local générique pour SQLite
 */
abstract class SQLiteAdapter<T> implements DataAdapter<T> {
  protected tableName: string;
  protected db: LocalSQLiteDB | null = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  getLocation(): DataLocation {
    return DataLocation.LOCAL;
  }

  async isAvailable(): Promise<boolean> {
    // Pour l'instant, on simule la disponibilité
    // Dans l'étape 2, on vérifiera l'accès à OPFS et sql.js
    return typeof window !== 'undefined' && 'navigator' in window;
  }

  protected async getDB(): Promise<LocalSQLiteDB> {
    if (!this.db) {
      // Pour l'instant, on utilise une mock DB
      // Dans l'étape 2, on initialisera sql.js + OPFS
      throw new Error('SQLite not initialized yet - will be implemented in step 2');
    }
    return this.db;
  }

  async getAll(): Promise<T[]> {
    const db = await this.getDB();
    const result = await db.all(`SELECT * FROM ${this.tableName} WHERE deleted_at IS NULL`);
    return result;
  }

  async getById(id: number | string): Promise<T | null> {
    const db = await this.getDB();
    const result = await db.get(
      `SELECT * FROM ${this.tableName} WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
    return result || null;
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const db = await this.getDB();
    const now = new Date().toISOString();
    
    // Construire la requête d'insertion dynamiquement
    const keys = Object.keys(data as any);
    const placeholders = keys.map(() => '?').join(', ');
    const values = Object.values(data as any);
    
    const sql = `
      INSERT INTO ${this.tableName} (${keys.join(', ')}, createdAt, updatedAt)
      VALUES (${placeholders}, ?, ?)
    `;
    
    const result = await db.run(sql, [...values, now, now]);
    
    // Récupérer l'enregistrement créé
    return await this.getById(result.lastID) as T;
  }

  async update(id: number | string, data: Partial<T>): Promise<T> {
    const db = await this.getDB();
    const now = new Date().toISOString();
    
    // Construire la requête de mise à jour dynamiquement
    const keys = Object.keys(data as any);
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    const values = Object.values(data as any);
    
    const sql = `
      UPDATE ${this.tableName}
      SET ${setClause}, updatedAt = ?
      WHERE id = ? AND deleted_at IS NULL
    `;
    
    await db.run(sql, [...values, now, id]);
    
    // Récupérer l'enregistrement mis à jour
    return await this.getById(id) as T;
  }

  async delete(id: number | string): Promise<boolean> {
    const db = await this.getDB();
    const now = new Date().toISOString();
    
    // Soft delete
    const result = await db.run(
      `UPDATE ${this.tableName} SET deleted_at = ? WHERE id = ?`,
      [now, id]
    );
    
    return result.changes > 0;
  }

  /**
   * Méthodes utilitaires pour SQLite local
   */
  async createTable(schema: string): Promise<void> {
    const db = await this.getDB();
    await db.exec(schema);
  }

  async migrate(migrations: string[]): Promise<void> {
    const db = await this.getDB();
    for (const migration of migrations) {
      await db.exec(migration);
    }
  }
}

/**
 * Adaptateurs spécifiques pour les entités locales (données sensibles)
 */
export class PatientLocalAdapter extends SQLiteAdapter<any> {
  constructor() {
    super('patients');
  }

  async init(): Promise<void> {
    const schema = `
      CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        birthDate TEXT,
        gender TEXT,
        address TEXT,
        osteopathId INTEGER NOT NULL,
        cabinetId INTEGER,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        deleted_at TEXT,
        deleted_by TEXT
      )
    `;
    await this.createTable(schema);
  }
}

export class AppointmentLocalAdapter extends SQLiteAdapter<any> {
  constructor() {
    super('appointments');
  }

  async init(): Promise<void> {
    const schema = `
      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patientId INTEGER NOT NULL,
        osteopathId INTEGER NOT NULL,
        cabinetId INTEGER,
        date TEXT NOT NULL,
        reason TEXT NOT NULL,
        notes TEXT,
        status TEXT NOT NULL DEFAULT 'SCHEDULED',
        notificationSent INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        deleted_at TEXT,
        deleted_by TEXT,
        FOREIGN KEY (patientId) REFERENCES patients(id)
      )
    `;
    await this.createTable(schema);
  }
}

export class InvoiceLocalAdapter extends SQLiteAdapter<any> {
  constructor() {
    super('invoices');
  }

  async init(): Promise<void> {
    const schema = `
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
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        deleted_at TEXT,
        deleted_by TEXT,
        FOREIGN KEY (patientId) REFERENCES patients(id),
        FOREIGN KEY (appointmentId) REFERENCES appointments(id)
      )
    `;
    await this.createTable(schema);
  }
}

/**
 * Factory pour créer les adaptateurs locaux
 */
export function createLocalAdapters() {
  return {
    patients: new PatientLocalAdapter(),
    appointments: new AppointmentLocalAdapter(),
    invoices: new InvoiceLocalAdapter(),
    // À ajouter : consultations, medicalDocuments, quotes, treatmentHistory, patientRelationships
  };
}

/**
 * Initialise tous les adaptateurs locaux avec leurs schémas
 */
export async function initializeLocalAdapters() {
  const adapters = createLocalAdapters();
  
  // Initialiser les tables SQLite
  await Promise.all([
    adapters.patients.init(),
    adapters.appointments.init(),
    adapters.invoices.init(),
  ]);
  
  console.log('✅ Local SQLite adapters initialized');
  return adapters;
}