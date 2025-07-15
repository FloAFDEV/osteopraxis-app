import { supabase } from "@/integrations/supabase/client";

/**
 * Service API spécialement conçu pour les administrateurs
 * N'utilise pas les fonctions nécessitant un profil ostéopathe
 */
class AdminApiService {
  
  // Récupération directe des cabinets via la fonction admin
  async getCabinets() {
    try {
      const { data, error } = await supabase.rpc('admin_get_cabinets_with_stats');
      
      if (error) {
        console.error('Erreur admin getCabinets:', error);
        throw new Error(`Erreur lors de la récupération des cabinets: ${error.message}`);
      }
      
      return { data: data || [] };
    } catch (error) {
      console.error('Exception admin getCabinets:', error);
      throw error;
    }
  }
  
  // Récupération des patients via la fonction admin
  async getPatients(searchTerm?: string, osteopathFilter?: number, cabinetFilter?: number) {
    try {
      const { data, error } = await supabase.rpc('admin_search_patients', {
        search_term: searchTerm || null,
        osteopath_filter: osteopathFilter || null,
        cabinet_filter: cabinetFilter || null,
        limit_count: 100
      });
      
      if (error) {
        console.error('Erreur admin getPatients:', error);
        throw new Error(`Erreur lors de la récupération des patients: ${error.message}`);
      }
      
      return { data: data || [] };
    } catch (error) {
      console.error('Exception admin getPatients:', error);
      throw error;
    }
  }
  
  // Récupération des ostéopathes
  async getOsteopaths() {
    try {
      const { data, error } = await supabase
        .from('Osteopath')
        .select('id, name')
        .order('name');
      
      if (error) {
        console.error('Erreur admin getOsteopaths:', error);
        throw new Error(`Erreur lors de la récupération des ostéopathes: ${error.message}`);
      }
      
      return { data: data || [] };
    } catch (error) {
      console.error('Exception admin getOsteopaths:', error);
      throw error;
    }
  }
  
  // Récupération des rendez-vous directement via Supabase (incluant supprimés pour admin)
  async getAppointments(includeDeleted: boolean = true) {
    try {
      let query = supabase
        .from('Appointment')
        .select(`
          *,
          Patient!inner(firstName, lastName, email, phone),
          Osteopath!inner(name)
        `);
      
      // Les admins peuvent voir les données supprimées
      if (!includeDeleted) {
        query = query.is('deleted_at', null);
      }
      
      const { data, error } = await query
        .order('date', { ascending: false })
        .limit(100);
      
      if (error) {
        console.error('Erreur admin getAppointments:', error);
        throw new Error(`Erreur lors de la récupération des rendez-vous: ${error.message}`);
      }
      
      return { data: data || [] };
    } catch (error) {
      console.error('Exception admin getAppointments:', error);
      throw error;
    }
  }
  
  // Récupération des factures directement via Supabase (incluant supprimés pour admin)
  async getInvoices(includeDeleted: boolean = true) {
    try {
      let query = supabase
        .from('Invoice')
        .select(`
          *,
          Patient!inner(firstName, lastName, email),
          Osteopath!inner(name)
        `);
      
      // Les admins peuvent voir les données supprimées
      if (!includeDeleted) {
        query = query.is('deleted_at', null);
      }
      
      const { data, error } = await query
        .order('date', { ascending: false })
        .limit(100);
      
      if (error) {
        console.error('Erreur admin getInvoices:', error);
        throw new Error(`Erreur lors de la récupération des factures: ${error.message}`);
      }
      
      return { data: data || [] };
    } catch (error) {
      console.error('Exception admin getInvoices:', error);
      throw error;
    }
  }
  
  // Restauration de données supprimées
  async restoreRecord(tableName: string, recordId: string) {
    try {
      const { data, error } = await supabase.rpc('restore_record', {
        p_table_name: tableName,
        p_record_id: recordId
      });
      
      if (error) {
        console.error('Erreur admin restoreRecord:', error);
        throw new Error(`Erreur lors de la restauration: ${error.message}`);
      }
      
      return { success: data };
    } catch (error) {
      console.error('Exception admin restoreRecord:', error);
      throw error;
    }
  }
  
  // Suppression définitive (soft delete)
  async softDeleteRecord(tableName: string, recordId: string) {
    try {
      const { data, error } = await supabase.rpc('soft_delete_record', {
        p_table_name: tableName,
        p_record_id: recordId
      });
      
      if (error) {
        console.error('Erreur admin softDeleteRecord:', error);
        throw new Error(`Erreur lors de la suppression: ${error.message}`);
      }
      
      return { success: data };
    } catch (error) {
      console.error('Exception admin softDeleteRecord:', error);
      throw error;
    }
  }
  
  // Statistiques système
  async getSystemStats() {
    try {
      const { data, error } = await supabase.rpc('admin_get_system_stats');
      
      if (error) {
        console.error('Erreur admin getSystemStats:', error);
        throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
      }
      
      return data[0] || {
        total_users: 0,
        active_users: 0,
        total_osteopaths: 0,
        total_cabinets: 0,
        total_patients: 0,
        active_patients: 0,
        total_appointments: 0,
        appointments_this_month: 0,
        total_invoices: 0,
        paid_invoices: 0,
        system_revenue: 0,
        avg_appointments_per_osteopath: 0,
        database_size: 'N/A'
      };
    } catch (error) {
      console.error('Exception admin getSystemStats:', error);
      throw error;
    }
  }
}

export const adminApiService = new AdminApiService();