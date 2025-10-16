/**
 * Adaptateurs SQLite concrets pour chaque entité
 * Implémentent l'interface DataAdapter pour le stockage local
 */

import { DataAdapter, DataLocation } from '../storage/types';
import { browserSQLite } from './browser-sqlite';

/**
 * Adaptateur SQLite générique
 */
class SQLiteAdapter<T> implements DataAdapter<T> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  getLocation(): DataLocation {
    return DataLocation.LOCAL;
  }

  async isAvailable(): Promise<boolean> {
    try {
      await browserSQLite.initialize();
      return true;
    } catch (error) {
      console.error(`SQLite not available for ${this.tableName}:`, error);
      return false;
    }
  }

  async getAll(): Promise<T[]> {
    await browserSQLite.initialize();
    const db = browserSQLite.getDB();
    
    const results = db.all(`
      SELECT * FROM ${this.tableName} 
      WHERE deleted_at IS NULL 
      ORDER BY updatedAt DESC
    `);
    
    return results.map(row => this.mapFromDB(row));
  }

  async getById(id: number | string): Promise<T | null> {
    await browserSQLite.initialize();
    const db = browserSQLite.getDB();
    
    const result = db.get(`
      SELECT * FROM ${this.tableName} 
      WHERE id = ? AND deleted_at IS NULL
    `, [id]);
    
    return result ? this.mapFromDB(result) : null;
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    await browserSQLite.initialize();
    const db = browserSQLite.getDB();
    
    const mappedData = this.mapToDB(data);
    const columns = Object.keys(mappedData);
    const placeholders = columns.map(() => '?').join(', ');
    const values = Object.values(mappedData);
    
    // Ajouter les timestamps
    columns.push('createdAt', 'updatedAt');
    values.push(new Date().toISOString(), new Date().toISOString());
    
    const sql = `
      INSERT INTO ${this.tableName} (${columns.join(', ')})
      VALUES (${placeholders}, ?, ?)
    `;
    
    db.run(sql, values);
    
    // Récupérer l'ID généré et retourner l'objet créé
    const lastId = db.get('SELECT last_insert_rowid() as id')?.id;
    const created = await this.getById(lastId);
    
    if (!created) {
      throw new Error(`Failed to create ${this.tableName} record`);
    }
    
    return created;
  }

  async update(id: number | string, data: Partial<T>): Promise<T> {
    await browserSQLite.initialize();
    const db = browserSQLite.getDB();
    
    const mappedData = this.mapToDB(data);
    const columns = Object.keys(mappedData);
    const values = Object.values(mappedData);
    
    // Ajouter le timestamp de mise à jour
    columns.push('updatedAt');
    values.push(new Date().toISOString());
    values.push(id); // Pour la clause WHERE
    
    const setClause = columns.map(col => `${col} = ?`).join(', ');
    
    const sql = `
      UPDATE ${this.tableName} 
      SET ${setClause}
      WHERE id = ? AND deleted_at IS NULL
    `;
    
    db.run(sql, values);
    
    const updated = await this.getById(id);
    if (!updated) {
      throw new Error(`Failed to update ${this.tableName} record with id ${id}`);
    }
    
    return updated;
  }

  async delete(id: number | string): Promise<boolean> {
    await browserSQLite.initialize();
    const db = browserSQLite.getDB();
    
    // Soft delete
    db.run(`
      UPDATE ${this.tableName} 
      SET deleted_at = ? 
      WHERE id = ? AND deleted_at IS NULL
    `, [new Date().toISOString(), id]);
    
    return true;
  }

  /**
   * Convertit les données de l'application vers le format DB
   */
  protected mapToDB(data: any): any {
    // Conversion générique - les sous-classes peuvent override
    const mapped = { ...data };
    
    // Convertir les booléens pour SQLite
    Object.keys(mapped).forEach(key => {
      if (typeof mapped[key] === 'boolean') {
        mapped[key] = mapped[key] ? 1 : 0;
      }
      // Convertir les dates en ISO string
      if (mapped[key] instanceof Date) {
        mapped[key] = mapped[key].toISOString();
      }
      // Exclure les champs auto-générés
      if (['id', 'createdAt', 'updatedAt'].includes(key)) {
        delete mapped[key];
      }
    });
    
    return mapped;
  }

  /**
   * Convertit les données de la DB vers le format application
   */
  protected mapFromDB(row: any): T {
    // Conversion générique - les sous-classes peuvent override
    const mapped = { ...row };
    
    // Convertir les entiers SQLite en booléens
    Object.keys(mapped).forEach(key => {
      if (this.isBooleanField(key) && typeof mapped[key] === 'number') {
        mapped[key] = mapped[key] === 1;
      }
      // Convertir les dates ISO string en Date si nécessaire
      if (this.isDateField(key) && typeof mapped[key] === 'string') {
        try {
          mapped[key] = new Date(mapped[key]);
        } catch {
          // Garder la string si la conversion échoue
        }
      }
    });
    
    return mapped as T;
  }

  /**
   * Détermine si un champ est un booléen (à override par les sous-classes)
   */
  protected isBooleanField(fieldName: string): boolean {
    return ['smoker', 'isSmoker', 'isExSmoker', 'hasChildren', 'hasVisionCorrection', 
            'isDeceased', 'isCancelled', 'tvaExoneration', 'notificationSent'].includes(fieldName);
  }

  /**
   * Détermine si un champ est une date (à override par les sous-classes)
   */
  protected isDateField(fieldName: string): boolean {
    return ['createdAt', 'updatedAt', 'birthDate', 'date', 'validUntil', 'deleted_at'].includes(fieldName);
  }
}

/**
 * Adaptateur pour les patients
 */
export class PatientSQLiteAdapter extends SQLiteAdapter<any> {
  constructor() {
    super('patients');
  }

  protected isBooleanField(fieldName: string): boolean {
    return super.isBooleanField(fieldName) || 
           ['smoker', 'hasVisionCorrection', 'isDeceased', 'isSmoker', 'isExSmoker'].includes(fieldName);
  }

  protected isDateField(fieldName: string): boolean {
    return super.isDateField(fieldName) || ['birthDate'].includes(fieldName);
  }

  // Méthodes spécifiques aux patients
  async getByOsteopathId(osteopathId: number): Promise<any[]> {
    await browserSQLite.initialize();
    const db = browserSQLite.getDB();
    
    const results = db.all(`
      SELECT * FROM ${this.tableName} 
      WHERE osteopathId = ? AND deleted_at IS NULL 
      ORDER BY lastName, firstName
    `, [osteopathId]);
    
    return results.map(row => this.mapFromDB(row));
  }

  async getByCabinetId(cabinetId: number): Promise<any[]> {
    await browserSQLite.initialize();
    const db = browserSQLite.getDB();
    
    const results = db.all(`
      SELECT * FROM ${this.tableName} 
      WHERE cabinetId = ? AND deleted_at IS NULL 
      ORDER BY lastName, firstName
    `, [cabinetId]);
    
    return results.map(row => this.mapFromDB(row));
  }
}

/**
 * Adaptateur pour les rendez-vous
 */
export class AppointmentSQLiteAdapter extends SQLiteAdapter<any> {
  constructor() {
    super('appointments');
  }

  protected isBooleanField(fieldName: string): boolean {
    return super.isBooleanField(fieldName) || ['notificationSent'].includes(fieldName);
  }

  // Override mapToDB pour transformer start -> date
  protected mapToDB(data: any): any {
    const mapped = { ...data };
    
    // Mapper start vers date si start existe et date n'existe pas
    if (mapped.start && !mapped.date) {
      mapped.date = mapped.start;
    }
    
    // Supprimer start et end car ils ne sont pas dans le schéma SQLite
    delete mapped.start;
    delete mapped.end;
    
    // Appeler la méthode parent pour les autres transformations
    return super.mapToDB(mapped);
  }

  // Méthodes spécifiques aux rendez-vous
  async getByPatientId(patientId: number): Promise<any[]> {
    await browserSQLite.initialize();
    const db = browserSQLite.getDB();
    
    const results = db.all(`
      SELECT * FROM ${this.tableName} 
      WHERE patientId = ? AND deleted_at IS NULL 
      ORDER BY date DESC
    `, [patientId]);
    
    return results.map(row => this.mapFromDB(row));
  }

  async getByOsteopathId(osteopathId: number): Promise<any[]> {
    await browserSQLite.initialize();
    const db = browserSQLite.getDB();
    
    const results = db.all(`
      SELECT * FROM ${this.tableName} 
      WHERE osteopathId = ? AND deleted_at IS NULL 
      ORDER BY date DESC
    `, [osteopathId]);
    
    return results.map(row => this.mapFromDB(row));
  }

  async getByDateRange(startDate: string, endDate: string): Promise<any[]> {
    await browserSQLite.initialize();
    const db = browserSQLite.getDB();
    
    const results = db.all(`
      SELECT * FROM ${this.tableName} 
      WHERE date >= ? AND date <= ? AND deleted_at IS NULL 
      ORDER BY date ASC
    `, [startDate, endDate]);
    
    return results.map(row => this.mapFromDB(row));
  }
}

/**
 * Adaptateur pour les factures
 */
export class InvoiceSQLiteAdapter extends SQLiteAdapter<any> {
  constructor() {
    super('invoices');
  }

  protected isBooleanField(fieldName: string): boolean {
    return super.isBooleanField(fieldName) || ['tvaExoneration'].includes(fieldName);
  }

  // Méthodes spécifiques aux factures
  async getByPatientId(patientId: number): Promise<any[]> {
    await browserSQLite.initialize();
    const db = browserSQLite.getDB();
    
    const results = db.all(`
      SELECT * FROM ${this.tableName} 
      WHERE patientId = ? AND deleted_at IS NULL 
      ORDER BY date DESC
    `, [patientId]);
    
    return results.map(row => this.mapFromDB(row));
  }

  async getByOsteopathId(osteopathId: number): Promise<any[]> {
    await browserSQLite.initialize();
    const db = browserSQLite.getDB();
    
    const results = db.all(`
      SELECT * FROM ${this.tableName} 
      WHERE osteopathId = ? AND deleted_at IS NULL 
      ORDER BY date DESC
    `, [osteopathId]);
    
    return results.map(row => this.mapFromDB(row));
  }

  async getByPeriod(year: string, month?: string): Promise<any[]> {
    await browserSQLite.initialize();
    const db = browserSQLite.getDB();
    
    let sql = `
      SELECT * FROM ${this.tableName} 
      WHERE strftime('%Y', date) = ? AND deleted_at IS NULL
    `;
    const params = [year];
    
    if (month) {
      sql += ` AND strftime('%m', date) = ?`;
      params.push(month.padStart(2, '0'));
    }
    
    sql += ` ORDER BY date DESC`;
    
    const results = db.all(sql, params);
    return results.map(row => this.mapFromDB(row));
  }
}

/**
 * Adaptateurs spécialisés pour les entités restantes
 */
class ConsultationSQLiteAdapter extends SQLiteAdapter<any> {
  constructor() {
    super('consultations');
  }

  protected isBooleanField(fieldName: string): boolean {
    return super.isBooleanField(fieldName) || ['isCancelled'].includes(fieldName);
  }
}

class MedicalDocumentSQLiteAdapter extends SQLiteAdapter<any> {
  constructor() {
    super('medical_documents');
  }
}

class QuoteSQLiteAdapter extends SQLiteAdapter<any> {
  constructor() {
    super('quotes');
  }

  protected isDateField(fieldName: string): boolean {
    return super.isDateField(fieldName) || ['validUntil'].includes(fieldName);
  }
}

class TreatmentHistorySQLiteAdapter extends SQLiteAdapter<any> {
  constructor() {
    super('treatment_history');
  }
}

/**
 * Factory pour créer les adaptateurs SQLite
 */
export function createSQLiteAdapters() {
  return {
    patients: new PatientSQLiteAdapter(),
    appointments: new AppointmentSQLiteAdapter(),
    invoices: new InvoiceSQLiteAdapter(),
    consultations: new ConsultationSQLiteAdapter(),
    medicalDocuments: new MedicalDocumentSQLiteAdapter(),
    quotes: new QuoteSQLiteAdapter(),
    treatmentHistory: new TreatmentHistorySQLiteAdapter()
  };
}