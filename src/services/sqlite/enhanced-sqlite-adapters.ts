/**
 * Adaptateurs SQLite améliorés utilisant OPFS
 * Implémentation complète pour le stockage local sécurisé
 */

import { DataAdapter, DataLocation } from '../storage/types';
import { getOPFSSQLiteService } from './opfs-sqlite-service';

export class EnhancedSQLiteAdapter<T extends { id?: number; createdAt?: string; updatedAt?: string }> 
  implements DataAdapter<T> {
  
  constructor(private tableName: string) {}

  getLocation(): DataLocation {
    return DataLocation.LOCAL;
  }

  async isAvailable(): Promise<boolean> {
    try {
      await getOPFSSQLiteService();
      return true;
    } catch (error) {
      console.error('SQLite not available:', error);
      return false;
    }
  }

  async getAll(): Promise<T[]> {
    const db = await getOPFSSQLiteService();
    return db.query<T>(`SELECT * FROM ${this.tableName} ORDER BY createdAt DESC`);
  }

  async getById(id: number | string): Promise<T | null> {
    const db = await getOPFSSQLiteService();
    const results = db.query<T>(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
    return results[0] || null;
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const db = await getOPFSSQLiteService();
    
    // Préparer les colonnes et valeurs
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map(() => '?').join(', ');
    
    const sql = `
      INSERT INTO ${this.tableName} (${columns.join(', ')}, createdAt, updatedAt) 
      VALUES (${placeholders}, datetime('now'), datetime('now'))
    `;
    
    const result = await db.run(sql, values);
    
    // Récupérer l'enregistrement créé
    return await this.getById(result.lastID) as T;
  }

  async update(id: number | string, data: Partial<T>): Promise<T> {
    const db = await getOPFSSQLiteService();
    
    // Filtrer les champs système
    const { id: _, createdAt, updatedAt, ...updateData } = data as any;
    
    if (Object.keys(updateData).length === 0) {
      return await this.getById(id) as T;
    }
    
    const columns = Object.keys(updateData);
    const values = Object.values(updateData);
    const setClause = columns.map(col => `${col} = ?`).join(', ');
    
    const sql = `
      UPDATE ${this.tableName} 
      SET ${setClause}, updatedAt = datetime('now') 
      WHERE id = ?
    `;
    
    await db.run(sql, [...values, id]);
    
    // Récupérer l'enregistrement mis à jour
    return await this.getById(id) as T;
  }

  async delete(id: number | string): Promise<boolean> {
    const db = await getOPFSSQLiteService();
    
    const result = await db.run(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
    
    return result.changes > 0;
  }

  async init(): Promise<void> {
    // L'initialisation est gérée par le service OPFS
    await getOPFSSQLiteService();
  }

  async count(): Promise<number> {
    const db = await getOPFSSQLiteService();
    const result = db.query<{ count: number }>(`SELECT COUNT(*) as count FROM ${this.tableName}`);
    return result[0]?.count || 0;
  }

  async search(query: string, fields: string[]): Promise<T[]> {
    const db = await getOPFSSQLiteService();
    
    const conditions = fields.map(field => `${field} LIKE ?`).join(' OR ');
    const searchParams = fields.map(() => `%${query}%`);
    
    return db.query<T>(
      `SELECT * FROM ${this.tableName} WHERE ${conditions} ORDER BY createdAt DESC`,
      searchParams
    );
  }

  async getByField(field: string, value: any): Promise<T[]> {
    const db = await getOPFSSQLiteService();
    return db.query<T>(`SELECT * FROM ${this.tableName} WHERE ${field} = ?`, [value]);
  }
}

// Adaptateurs spécialisés pour chaque entité

export class PatientSQLiteAdapter extends EnhancedSQLiteAdapter<any> {
  constructor() {
    super('patients');
  }

  async findByEmail(email: string): Promise<any | null> {
    const results = await this.getByField('email', email);
    return results[0] || null;
  }

  async searchByName(query: string): Promise<any[]> {
    return this.search(query, ['firstName', 'lastName', 'email']);
  }

  async getPatientsByAge(minAge: number, maxAge: number): Promise<any[]> {
    const db = await getOPFSSQLiteService();
    
    return db.query<any>(`
      SELECT * FROM patients 
      WHERE date('now') - birthDate BETWEEN ? AND ?
      ORDER BY lastName, firstName
    `, [minAge, maxAge]);
  }
}

export class AppointmentSQLiteAdapter extends EnhancedSQLiteAdapter<any> {
  constructor() {
    super('appointments');
  }

  // Override create pour transformer start -> date
  async create(data: any): Promise<any> {
    // Transformer les données pour correspondre au schéma SQLite
    const transformedData = { ...data };
    
    // Mapper start vers date si start existe
    if (transformedData.start && !transformedData.date) {
      transformedData.date = transformedData.start;
    }
    
    // Supprimer start et end car ils ne sont pas dans le schéma SQLite
    delete transformedData.start;
    delete transformedData.end;
    
    return super.create(transformedData);
  }

  // Override update pour transformer start -> date
  async update(id: number | string, data: any): Promise<any> {
    // Transformer les données pour correspondre au schéma SQLite
    const transformedData = { ...data };
    
    // Mapper start vers date si start existe
    if (transformedData.start && !transformedData.date) {
      transformedData.date = transformedData.start;
    }
    
    // Supprimer start et end car ils ne sont pas dans le schéma SQLite
    delete transformedData.start;
    delete transformedData.end;
    
    return super.update(id, transformedData);
  }

  async getByPatient(patientId: number): Promise<any[]> {
    return this.getByField('patientId', patientId);
  }

  async getByOsteopath(osteopathId: number): Promise<any[]> {
    return this.getByField('osteopathId', osteopathId);
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<any[]> {
    const db = await getOPFSSQLiteService();
    
    return db.query<any>(`
      SELECT * FROM appointments 
      WHERE date(date) BETWEEN date(?) AND date(?)
      ORDER BY date ASC
    `, [startDate.toISOString(), endDate.toISOString()]);
  }

  async getUpcoming(osteopathId?: number): Promise<any[]> {
    const db = await getOPFSSQLiteService();
    
    const sql = osteopathId
      ? `SELECT * FROM appointments WHERE date > datetime('now') AND osteopathId = ? ORDER BY date ASC`
      : `SELECT * FROM appointments WHERE date > datetime('now') ORDER BY date ASC`;
    
    const params = osteopathId ? [osteopathId] : [];
    
    return db.query<any>(sql, params);
  }

  async checkConflicts(osteopathId: number, date: Date, duration: number = 60, excludeId?: number): Promise<any[]> {
    const db = await getOPFSSQLiteService();
    
    const startTime = date.toISOString();
    const endTime = new Date(date.getTime() + duration * 60000).toISOString();
    
    let sql = `
      SELECT * FROM appointments 
      WHERE osteopathId = ? 
      AND status != 'cancelled'
      AND (
        (datetime(date) <= datetime(?) AND datetime(date, '+' || duration || ' minutes') > datetime(?))
        OR
        (datetime(date) < datetime(?) AND datetime(date, '+' || duration || ' minutes') >= datetime(?))
        OR
        (datetime(date) >= datetime(?) AND datetime(date) < datetime(?))
      )
    `;
    
    let params = [osteopathId, startTime, startTime, endTime, endTime, startTime, endTime];
    
    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }
    
    return db.query<any>(sql, params);
  }
}

export class InvoiceSQLiteAdapter extends EnhancedSQLiteAdapter<any> {
  constructor() {
    super('invoices');
  }

  async getByPatient(patientId: number): Promise<any[]> {
    return this.getByField('patientId', patientId);
  }

  async getByOsteopath(osteopathId: number): Promise<any[]> {
    return this.getByField('osteopathId', osteopathId);
  }

  async getByStatus(status: string): Promise<any[]> {
    return this.getByField('status', status);
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<any[]> {
    const db = await getOPFSSQLiteService();
    
    return db.query<any>(`
      SELECT * FROM invoices 
      WHERE date(date) BETWEEN date(?) AND date(?)
      ORDER BY date DESC
    `, [startDate.toISOString(), endDate.toISOString()]);
  }

  async getTotalRevenue(osteopathId?: number, year?: number): Promise<number> {
    const db = await getOPFSSQLiteService();
    
    let sql = 'SELECT SUM(amount) as total FROM invoices WHERE status = "paid"';
    const params: any[] = [];
    
    if (osteopathId) {
      sql += ' AND osteopathId = ?';
      params.push(osteopathId);
    }
    
    if (year) {
      sql += ' AND strftime("%Y", date) = ?';
      params.push(year.toString());
    }
    
    const result = db.query<{ total: number }>(sql, params);
    return result[0]?.total || 0;
  }

  async getMonthlyRevenue(osteopathId?: number, year?: number): Promise<{ month: string; total: number }[]> {
    const db = await getOPFSSQLiteService();
    
    let sql = `
      SELECT 
        strftime('%Y-%m', date) as month,
        SUM(amount) as total
      FROM invoices 
      WHERE status = 'paid'
    `;
    
    const params: any[] = [];
    
    if (osteopathId) {
      sql += ' AND osteopathId = ?';
      params.push(osteopathId);
    }
    
    if (year) {
      sql += ' AND strftime("%Y", date) = ?';
      params.push(year.toString());
    }
    
    sql += ' GROUP BY strftime("%Y-%m", date) ORDER BY month';
    
    return db.query<{ month: string; total: number }>(sql, params);
  }
}

/**
 * Factory pour créer les adaptateurs SQLite améliorés
 */
export function createEnhancedSQLiteAdapters() {
  return {
    patients: new PatientSQLiteAdapter(),
    appointments: new AppointmentSQLiteAdapter(),
    invoices: new InvoiceSQLiteAdapter()
  };
}