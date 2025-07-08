import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdminUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: "ADMIN" | "OSTEOPATH";
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  osteopathId: number | null;
  last_login?: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string;
  old_values: any;
  new_values: any;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalOsteopaths: number;
  totalCabinets: number;
  totalPatients: number;
  totalAppointments: number;
  deletedRecords: number;
}

class AdminService {
  // Gestion des utilisateurs
  async getAllUsers(): Promise<AdminUser[]> {
    const { data, error } = await supabase
      .from("User")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async toggleUserActive(userId: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from("User")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", userId);
    
    if (error) throw error;
    
    // Log l'action
    await this.logAction("UPDATE_USER_STATUS", "User", userId, 
      null, { is_active: isActive });
    
    toast.success(`Utilisateur ${isActive ? "activé" : "désactivé"} avec succès`);
  }

  async updateUserRole(userId: string, newRole: "ADMIN" | "OSTEOPATH"): Promise<void> {
    const { error } = await supabase
      .from("User")
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq("id", userId);
    
    if (error) throw error;
    
    await this.logAction("UPDATE_USER_ROLE", "User", userId, 
      null, { role: newRole });
    
    toast.success("Rôle utilisateur mis à jour avec succès");
  }

  async softDeleteUser(userId: string): Promise<void> {
    const { error } = await supabase.rpc("soft_delete_record", {
      p_table_name: "User",
      p_record_id: userId
    });
    
    if (error) throw error;
    toast.success("Utilisateur supprimé (récupérable)");
  }

  async restoreUser(userId: string): Promise<void> {
    const { error } = await supabase.rpc("restore_record", {
      p_table_name: "User",
      p_record_id: userId
    });
    
    if (error) throw error;
    toast.success("Utilisateur restauré avec succès");
  }

  // Gestion des logs d'audit
  async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return (data || []).map(log => ({
      ...log,
      ip_address: log.ip_address?.toString(),
      user_agent: log.user_agent?.toString()
    }));
  }

  async logAction(
    action: string, 
    tableName: string, 
    recordId: string, 
    oldValues?: any, 
    newValues?: any
  ): Promise<void> {
    const { error } = await supabase.rpc("log_audit_action", {
      p_action: action,
      p_table_name: tableName,
      p_record_id: recordId,
      p_old_values: oldValues,
      p_new_values: newValues
    });
    
    if (error) {
      console.error("Erreur lors du logging d'audit:", error);
    }
  }

  // Statistiques globales
  async getAdminStats(): Promise<AdminStats> {
    const [usersResult, osteopathsResult, cabinetsResult, patientsResult, appointmentsResult] = 
      await Promise.all([
        supabase.from("User").select("id, is_active, deleted_at"),
        supabase.from("Osteopath").select("id"),
        supabase.from("Cabinet").select("id"),
        supabase.from("Patient").select("id, deleted_at"),
        supabase.from("Appointment").select("id, deleted_at")
      ]);

    const users = usersResult.data || [];
    const osteopaths = osteopathsResult.data || [];
    const cabinets = cabinetsResult.data || [];
    const patients = patientsResult.data || [];
    const appointments = appointmentsResult.data || [];

    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.is_active && !u.deleted_at).length,
      totalOsteopaths: osteopaths.length,
      totalCabinets: cabinets.length,
      totalPatients: patients.filter(p => !p.deleted_at).length,
      totalAppointments: appointments.filter(a => !a.deleted_at).length,
      deletedRecords: [
        ...users.filter(u => u.deleted_at),
        ...patients.filter(p => p.deleted_at),
        ...appointments.filter(a => a.deleted_at)
      ].length
    };
  }

  // Recherche globale
  async globalSearch(query: string): Promise<{
    users: AdminUser[];
    patients: any[];
    appointments: any[];
  }> {
    const searchTerm = `%${query}%`;
    
    const [usersResult, patientsResult, appointmentsResult] = await Promise.all([
      supabase
        .from("User")
        .select("*")
        .or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},email.ilike.${searchTerm}`)
        .limit(10),
      supabase
        .from("Patient")
        .select("*")
        .or(`firstName.ilike.${searchTerm},lastName.ilike.${searchTerm},email.ilike.${searchTerm}`)
        .is("deleted_at", null)
        .limit(10),
      supabase
        .from("Appointment")
        .select("*, Patient!inner(firstName, lastName)")
        .or(`reason.ilike.${searchTerm},notes.ilike.${searchTerm}`)
        .is("deleted_at", null)
        .limit(10)
    ]);

    return {
      users: usersResult.data || [],
      patients: patientsResult.data || [],
      appointments: appointmentsResult.data || []
    };
  }

  // Détection de doublons
  async findDuplicatePatients(): Promise<any[]> {
    const { data, error } = await supabase
      .from("Patient")
      .select("firstName, lastName, email, birthDate, id")
      .is("deleted_at", null);
    
    if (error) throw error;
    
    const duplicates: any[] = [];
    const seen = new Map();
    
    data?.forEach(patient => {
      const key = `${patient.firstName}_${patient.lastName}_${patient.birthDate}`;
      if (seen.has(key)) {
        duplicates.push({
          group: key,
          patients: [seen.get(key), patient]
        });
      } else {
        seen.set(key, patient);
      }
    });
    
    return duplicates;
  }

  // Patients orphelins (sans ostéopathe)
  async findOrphanPatients(): Promise<any[]> {
    const { data, error } = await supabase
      .from("Patient")
      .select("*")
      .is("osteopathId", null)
      .is("deleted_at", null);
    
    if (error) throw error;
    return data || [];
  }
}

export const adminService = new AdminService();