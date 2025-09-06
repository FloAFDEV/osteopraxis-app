/**
 * Service de fallback pour SQLite quand sql.js n'est pas disponible
 * Utilise une base mémoire simple comme alternative avec persistance localStorage
 */

export class SQLiteFallbackService {
  private data: Map<string, any[]> = new Map();
  private autoIncrement: Map<string, number> = new Map();

  constructor() {
    this.initializeTables();
  }

  private initializeTables(): void {
    this.data.set('patients', []);
    this.data.set('appointments', []);
    this.data.set('invoices', []);
    this.data.set('metadata', []);
    
    this.autoIncrement.set('patients', 1);
    this.autoIncrement.set('appointments', 1);
    this.autoIncrement.set('invoices', 1);
    
    console.log('📋 SQLite fallback tables initialized');
  }

  query<T = any>(sql: string, params: any[] = []): T[] {
    console.log('🔍 Fallback query:', sql, params);
    
    // Parsing simple pour les requêtes SELECT basiques
    if (sql.toLowerCase().includes('select')) {
      if (sql.includes('patients')) {
        return this.data.get('patients') || [];
      } else if (sql.includes('appointments')) {
        return this.data.get('appointments') || [];
      } else if (sql.includes('invoices')) {
        return this.data.get('invoices') || [];
      }
    }
    
    return [];
  }

  async run(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
    console.log('✏️ Fallback run:', sql, params);
    
    // Parsing simple pour les INSERT
    if (sql.toLowerCase().includes('insert') && sql.toLowerCase().includes('patients')) {
      const patients = this.data.get('patients') || [];
      const newId = this.autoIncrement.get('patients') || 1;
      
      // Créer un objet patient simple avec les données de base
      const newPatient = {
        id: newId,
        firstName: params[0] || 'Nouveau',
        lastName: params[1] || 'Patient',
        email: params[2] || `patient-${newId}@temp.local`,
        phone: params[3] || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      patients.push(newPatient);
      this.data.set('patients', patients);
      this.autoIncrement.set('patients', newId + 1);
      
      // Sauvegarder automatiquement
      this.saveToLocalStorage();
      
      return { lastID: newId, changes: 1 };
    }
    
    return { lastID: 0, changes: 0 };
  }

  beginTransaction(): void {
    console.log('📦 Fallback: Begin transaction (no-op)');
  }

  async commit(): Promise<void> {
    console.log('✅ Fallback: Commit transaction (no-op)');
    this.saveToLocalStorage();
  }

  rollback(): void {
    console.log('↩️ Fallback: Rollback transaction (no-op)');
  }

  close(): void {
    console.log('🔒 Fallback: Close database (no-op)');
    this.saveToLocalStorage();
  }

  export(): Uint8Array {
    // Sérialiser les données en JSON puis en Uint8Array
    const jsonData = JSON.stringify(Object.fromEntries(this.data));
    return new TextEncoder().encode(jsonData);
  }

  getStats(): { size: number; tables: string[]; version: string } {
    const jsonData = JSON.stringify(Object.fromEntries(this.data));
    return {
      size: new TextEncoder().encode(jsonData).length,
      tables: Array.from(this.data.keys()),
      version: 'fallback-1.0'
    };
  }

  /**
   * Exporte les données pour la persistance
   */
  exportForStorage(): any {
    return {
      data: Object.fromEntries(this.data),
      autoIncrement: Object.fromEntries(this.autoIncrement)
    };
  }

  /**
   * Importe les données depuis la persistance
   */
  importData(savedData: any): void {
    if (savedData.data) {
      this.data = new Map(Object.entries(savedData.data));
    }
    if (savedData.autoIncrement) {
      this.autoIncrement = new Map(Object.entries(savedData.autoIncrement));
    }
    console.log('📂 Données importées depuis la sauvegarde');
  }

  /**
   * Sauvegarde automatique en localStorage
   */
  private saveToLocalStorage(): void {
    try {
      const data = this.exportForStorage();
      localStorage.setItem('sqlite-fallback-data', JSON.stringify(data));
      console.log('💾 Données sauvegardées automatiquement en localStorage');
    } catch (error) {
      console.warn('⚠️ Impossible de sauvegarder en localStorage:', error);
    }
  }
}