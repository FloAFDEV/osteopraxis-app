import { DataAdapter, DataLocation } from './types';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Types spécifiques pour les tables Supabase
type Tables = Database['public']['Tables'];
type UserRow = Tables['User']['Row'];
type OsteopathRow = Tables['Osteopath']['Row'];
type CabinetRow = Tables['Cabinet']['Row'];
type PatientRow = Tables['Patient']['Row'];
type AppointmentRow = Tables['Appointment']['Row'];
type InvoiceRow = Tables['Invoice']['Row'];

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
    try {
      // CORRECTION: S'assurer que la session est valide avant la requête
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn(`No valid session for ${this.tableName} getAll request`);
        throw new Error('Session expirée');
      }

      // SÉCURITÉ DÉMO: Filtrer les données selon le type d'utilisateur
      const isDemoUser = session.user?.email === 'demo@patienthub.com' || 
                        session.user?.email?.startsWith('demo-') ||
                        session.user?.user_metadata?.is_demo === true;

      // Pour les utilisateurs démo, ne montrer que les données démo
      if (isDemoUser) {
        console.log(`🎭 Mode démo: Filtrage des données ${this.tableName} pour ne montrer que les données démo`);
        // @ts-ignore - Contournement pour éviter les erreurs TypeScript
        const result = await supabase
          .from(this.tableName as any)
          .select('*')
          .eq('is_demo_data', true);
        
        if (result.error) {
          console.error(`Error in ${this.tableName} getAll (demo filter):`, result.error);
          throw result.error;
        }
        return (result.data as unknown as T[]) || [];
      }

      // Utilisateur normal - toutes les données (selon RLS)
      const normalResult = await supabase
        .from(this.tableName)
        .select('*');
      
      if (normalResult.error) {
        console.error(`Error in ${this.tableName} getAll:`, normalResult.error);
        throw normalResult.error;
      }
      return (normalResult.data as unknown as T[]) || [];
    } catch (error) {
      console.error(`Failed to getAll from ${this.tableName}:`, error);
      throw error;
    }
  }

  async getById(id: number | string): Promise<T | null> {
    try {
      // SÉCURITÉ DÉMO: Filtrer les données selon le type d'utilisateur
      const { data: { session } } = await supabase.auth.getSession();
      const isDemoUser = session?.user?.email === 'demo@patienthub.com' || 
                        session?.user?.email?.startsWith('demo-') ||
                        session?.user?.user_metadata?.is_demo === true;

      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id);

      // Pour les utilisateurs démo, ne montrer que les données démo
      if (isDemoUser) {
        // @ts-ignore - Contournement pour éviter les erreurs TypeScript
        query = query.eq('is_demo_data', true);
      }

      const { data, error } = await query.single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return (data as unknown as T) || null;
    } catch (error) {
      console.error(`Failed to getById from ${this.tableName}:`, error);
      throw error;
    }
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    try {
      // CORRECTION: S'assurer que la session est valide avant la requête
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn(`No valid session for ${this.tableName} create request`);
        throw new Error('Session expirée');
      }

      // SÉCURITÉ DÉMO: Marquer automatiquement les données comme démo si nécessaire
      const isDemoUser = session.user?.email === 'demo@patienthub.com' || 
                        session.user?.email?.startsWith('demo-') ||
                        session.user?.user_metadata?.is_demo === true;

      let createData = data as any;
      if (isDemoUser) {
        console.log(`🎭 Mode démo: Marquage automatique des données ${this.tableName} comme démo`);
        createData = {
          ...data,
          is_demo_data: true,
          demo_expires_at: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        };
      }

      const { data: result, error } = await supabase
        .from(this.tableName)
        .insert([createData])
        .select()
        .single();
      
      if (error) {
        console.error(`Error in ${this.tableName} create:`, error);
        throw error;
      }
      return result as unknown as T;
    } catch (error) {
      console.error(`Failed to create in ${this.tableName}:`, error);
      throw error;
    }
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

export class PatientCloudAdapter extends SupabaseAdapter<PatientRow> {
  constructor() {
    super('Patient');
  }
}

export class AppointmentCloudAdapter extends SupabaseAdapter<AppointmentRow> {
  constructor() {
    super('Appointment');
  }
}

export class InvoiceCloudAdapter extends SupabaseAdapter<InvoiceRow> {
  constructor() {
    super('Invoice');
  }
}

// Adaptateurs génériques pour les entités sans table spécifique
export class GenericCloudAdapter<T> implements DataAdapter<T> {
  getLocation(): DataLocation {
    return DataLocation.CLOUD;
  }

  async isAvailable(): Promise<boolean> {
    return true; // Toujours disponible pour les entités génériques
  }

  async getAll(): Promise<T[]> {
    return []; // Retourner un tableau vide pour les entités non implémentées
  }

  async getById(id: number | string): Promise<T | null> {
    return null;
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    throw new Error('Create not implemented for generic adapter');
  }

  async update(id: number | string, data: Partial<T>): Promise<T> {
    throw new Error('Update not implemented for generic adapter');
  }

  async delete(id: number | string): Promise<boolean> {
    return false;
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
    patients: new PatientCloudAdapter(),
    appointments: new AppointmentCloudAdapter(),
    invoices: new InvoiceCloudAdapter(),
    quotes: new GenericCloudAdapter(),
    consultations: new GenericCloudAdapter(),
    medicalDocuments: new GenericCloudAdapter(),
    treatmentHistory: new GenericCloudAdapter(),
    patientRelationships: new GenericCloudAdapter(),
  };
}