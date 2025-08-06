/**
 * Configuration du stockage hybride
 * Définit où chaque type de donnée doit être stocké
 */
export enum DataLocation {
  CLOUD = 'cloud',    // Supabase (auth, config, non-sensible)
  LOCAL = 'local',    // SQLite local (données sensibles)
}

export interface DataClassification {
  // Données cloud (Supabase) - Non sensibles
  users: DataLocation.CLOUD;
  osteopaths: DataLocation.CLOUD;
  cabinets: DataLocation.CLOUD;
  auth: DataLocation.CLOUD;
  
  // Données locales (SQLite) - Sensibles
  patients: DataLocation.LOCAL;
  appointments: DataLocation.LOCAL;
  consultations: DataLocation.LOCAL;
  invoices: DataLocation.LOCAL;
  medicalDocuments: DataLocation.LOCAL;
  quotes: DataLocation.LOCAL;
  treatmentHistory: DataLocation.LOCAL;
  patientRelationships: DataLocation.LOCAL;
}

/**
 * Interface unifiée pour les opérations CRUD
 */
export interface DataAdapter<T> {
  // Opérations de base
  getAll(): Promise<T[]>;
  getById(id: number | string): Promise<T | null>;
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: number | string, data: Partial<T>): Promise<T>;
  delete(id: number | string): Promise<boolean>;
  
  // Méta-informations
  getLocation(): DataLocation;
  isAvailable(): Promise<boolean>;
}

/**
 * Configuration de l'adaptateur hybride
 */
export interface HybridConfig {
  // Stratégie de fallback si le local n'est pas disponible
  fallbackToCloud: boolean;
  
  // Mode de synchronisation (pour futur usage)
  syncMode: 'none' | 'export' | 'local-share';
  
  // Chiffrement des données locales
  encryption: {
    enabled: boolean;
    keyDerivation: 'pbkdf2' | 'argon2';
  };
  
  // Gestion des sauvegardes
  backup: {
    autoBackup: boolean;
    backupInterval: number; // en minutes
    maxBackups: number;
  };
}

/**
 * Erreurs spécifiques au stockage hybride
 */
export class HybridStorageError extends Error {
  constructor(
    message: string,
    public location: DataLocation,
    public operation: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'HybridStorageError';
  }
}

/**
 * État du stockage local
 */
export interface LocalStorageStatus {
  available: boolean;
  encrypted: boolean;
  lastBackup?: Date;
  size: number; // en bytes
  tables: string[];
}