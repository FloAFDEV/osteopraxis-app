/**
 * Types pour l'architecture HDS - Stockage sécurisé des données de santé
 */

export enum DataSensitivity {
  SENSITIVE = 'sensitive',    // Données de santé (stockage local obligatoire)
  NON_SENSITIVE = 'non_sensitive'  // Données non sensibles (Supabase autorisé)
}

export interface HDSDataClassification {
  // Données sensibles - TOUJOURS en local (SQLite)
  patients: DataSensitivity.SENSITIVE;
  appointments: DataSensitivity.SENSITIVE;
  consultations: DataSensitivity.SENSITIVE;
  invoices: DataSensitivity.SENSITIVE;
  medicalDocuments: DataSensitivity.SENSITIVE;
  quotes: DataSensitivity.SENSITIVE;
  treatmentHistory: DataSensitivity.SENSITIVE;
  patientRelationships: DataSensitivity.SENSITIVE;
  
  // Données non sensibles - Supabase autorisé
  users: DataSensitivity.NON_SENSITIVE;
  osteopaths: DataSensitivity.NON_SENSITIVE;
  cabinets: DataSensitivity.NON_SENSITIVE;
  auth: DataSensitivity.NON_SENSITIVE;
}

/**
 * Interface pour les adaptateurs de données locales
 */
export interface LocalDataAdapter<T> {
  getAll(): Promise<T[]>;
  getById(id: number | string): Promise<T | null>;
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: number | string, data: Partial<T>): Promise<T>;
  delete(id: number | string): Promise<boolean>;
  isAvailable(): Promise<boolean>;
}

/**
 * Interface pour les adaptateurs de données cloud
 */
export interface CloudDataAdapter<T> {
  getAll(): Promise<T[]>;
  getById(id: number | string): Promise<T | null>;
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: number | string, data: Partial<T>): Promise<T>;
  delete(id: number | string): Promise<boolean>;
}

/**
 * Configuration HDS
 */
export interface HDSConfig {
  // Validation stricte - empêche l'envoi de données sensibles vers le cloud
  strictValidation: boolean;
  
  // Chiffrement local obligatoire
  encryption: {
    enabled: boolean;
    algorithm: 'AES-256-GCM';
    keyDerivation: 'PBKDF2';
  };
  
  // Gestion des sauvegardes USB
  usbBackup: {
    autoPrompt: boolean;
    compressionLevel: number;
    encryptionRequired: boolean;
  };
}

/**
 * Erreur de violation HDS
 */
export class HDSViolationError extends Error {
  constructor(
    message: string,
    public dataType: string,
    public attemptedOperation: string
  ) {
    super(`[HDS VIOLATION] ${message}`);
    this.name = 'HDSViolationError';
  }
}

/**
 * Statut du stockage local HDS
 */
export interface HDSLocalStatus {
  available: boolean;
  encrypted: boolean;
  size: number;
  lastBackup?: Date;
  patientCount: number;
  appointmentCount: number;
  invoiceCount: number;
}