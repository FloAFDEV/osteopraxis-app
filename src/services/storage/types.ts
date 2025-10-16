/**
 * Types pour les adapters de stockage
 */

export enum DataLocation {
  CLOUD = 'cloud',
  LOCAL = 'local',
  HYBRID = 'hybrid'
}

export interface DataAdapter<T> {
  getLocation(): DataLocation;
  isAvailable(): Promise<boolean>;
  getAll(): Promise<T[]>;
  getById(id: number | string): Promise<T | null>;
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: number | string, data: Partial<T>): Promise<T>;
  delete(id: number | string): Promise<boolean>;
}
