/**
 * 🔐 Interfaces communes pour le stockage HDS sécurisé
 * Support FSA (File System Access) et IndexedDB chiffré
 */

export interface SecureStorageBackend {
  configure(config: SecureStorageConfig): Promise<void>;
  save<T extends { id: string | number }>(storeName: string, record: T): Promise<T>;
  getAll<T>(storeName: string): Promise<T[]>;
  getById<T>(storeName: string, id: string | number): Promise<T | null>;
  delete(storeName: string, id: string | number): Promise<void>;
  exportBackup(): Promise<Blob>;
  importBackup(file: File, password: string): Promise<void>;
  
  // Méthodes internes
  isAvailable(): Promise<boolean>;
  getStorageInfo(): Promise<StorageInfo>;
}

export interface StorageInfo {
  type: 'FSA' | 'IndexedDB';
  available: boolean;
  configured: boolean;
  unlocked: boolean;
  entitiesCount: Record<string, number>;
  totalSize: number;
}

export interface SecureStorageConfig {
  password: string;
  entities: string[];
  directoryHandle?: FileSystemDirectoryHandle; // FSA uniquement
}

export interface BackupMetadata {
  version: number;
  timestamp: string;
  type: 'FSA' | 'IndexedDB';
  entities: string[];
  salt: string;
  iv: string;
  ciphertext: string;
  tagLength: number;
}

export type SecureStorageType = 'FSA' | 'IndexedDB';