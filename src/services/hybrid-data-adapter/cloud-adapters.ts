import { DataAdapter, DataLocation } from './types';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Types spécifiques pour les tables Supabase
type Tables = Database['public']['Tables'];
type UserRow = Tables['User']['Row'];
type OsteopathRow = Tables['Osteopath']['Row'];
type CabinetRow = Tables['Cabinet']['Row'];

/**
 * Adaptateur cloud générique pour Supabase
 */
abstract class SupabaseAdapter<T> implements DataAdapter<T> {
  protected tableName: keyof Tables;

  constructor(tableName: keyof Tables) {
    this.tableName = tableName;
  }

  getLocation(): DataLocation {
    return DataLocation.CLOUD;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const { error } = await supabase.from(this.tableName).select('*').limit(1);
      return !error;
    } catch {
      return false;
    }
  }

  async getAll(): Promise<T[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*');
    
    if (error) throw error;
    return (data as unknown as T[]) || [];
  }

  async getById(id: number | string): Promise<T | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return (data as unknown as T) || null;
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert([data as any])
      .select()
      .single();
    
    if (error) throw error;
    return result as unknown as T;
  }

  async update(id: number | string, data: Partial<T>): Promise<T> {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .update(data as any)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return result as unknown as T;
  }

  async delete(id: number | string): Promise<boolean> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
}

/**
 * Adaptateurs spécifiques pour les entités cloud
 */
export class UserCloudAdapter extends SupabaseAdapter<UserRow> {
  constructor() {
    super('User');
  }
}

export class OsteopathCloudAdapter extends SupabaseAdapter<OsteopathRow> {
  constructor() {
    super('Osteopath');
  }
}

export class CabinetCloudAdapter extends SupabaseAdapter<CabinetRow> {
  constructor() {
    super('Cabinet');
  }
}

/**
 * Factory pour créer les adaptateurs cloud
 */
export function createCloudAdapters() {
  return {
    users: new UserCloudAdapter(),
    osteopaths: new OsteopathCloudAdapter(),
    cabinets: new CabinetCloudAdapter(),
  };
}