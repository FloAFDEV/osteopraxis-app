
import { supabase } from "@/integrations/supabase/client";
import { Patient, Appointment, Osteopath, Cabinet, User, AuthState } from "@/types";
import { 
  convertHasChildrenToBoolean, 
  adaptPatientFromSupabase, 
  adaptAppointmentStatusFromSupabase, 
  adaptAppointmentStatusForSupabase 
} from "@/utils/patient-form-helpers";

// Service pour gérer les opérations Supabase
export const supabaseApi = {
  // Auth
  async login(email: string, password: string): Promise<AuthState> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw new Error(error.message);
    
    if (!data.user) {
      throw new Error("Identifiants incorrects");
    }
    
    // Récupérer les informations supplémentaires de l'utilisateur depuis la table User
    const { data: userData, error: userError } = await supabase
      .from("User")
      .select("*")
      .eq("id", data.user.id)
      .single();
    
    if (userError) {
      console.error("Erreur lors de la récupération des données utilisateur:", userError);
    }
    
    const user: User = userData ? {
      id: data.user.id,
      email: data.user.email || "",
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.role,
      created_at: userData.created_at,
      updated_at: userData.updated_at,
      osteopathId: userData.osteopathId
    } : {
      id: data.user.id,
      email: data.user.email || "",
      first_name: null,
      last_name: null,
      role: "OSTEOPATH", // Valeur par défaut
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      osteopathId: null
    };
    
    const authState: AuthState = {
      user,
      isAuthenticated: true,
      token: data.session?.access_token || null
    };
    
    localStorage.setItem("authState", JSON.stringify(authState));
    
    return authState;
  },
  
  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Erreur lors de la déconnexion:", error);
    
    localStorage.removeItem("authState");
  },
  
  async checkAuth(): Promise<AuthState> {
    const { data } = await supabase.auth.getSession();
    
    if (!data.session) {
      return {
        user: null,
        isAuthenticated: false,
        token: null
      };
    }
    
    // Récupérer les informations supplémentaires de l'utilisateur depuis la table User
    const { data: userData, error: userError } = await supabase
      .from("User")
      .select("*")
      .eq("id", data.session.user.id)
      .single();
    
    if (userError) {
      console.error("Erreur lors de la récupération des données utilisateur:", userError);
    }
    
    const user: User = userData ? {
      id: data.session.user.id,
      email: data.session.user.email || "",
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.role,
      created_at: userData.created_at,
      updated_at: userData.updated_at,
      osteopathId: userData.osteopathId
    } : {
      id: data.session.user.id,
      email: data.session.user.email || "",
      first_name: null,
      last_name: null,
      role: "OSTEOPATH",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      osteopathId: null
    };
    
    return {
      user,
      isAuthenticated: true,
      token: data.session.access_token
    };
  },

  // Patients
  async getPatients(): Promise<Patient[]> {
    const { data, error } = await supabase
      .from("Patient")
      .select("*")
      .order("updatedAt", { ascending: false });
      
    if (error) throw new Error(error.message);
    
    // Convertir et adapter les champs pour être compatibles avec l'application
    return data.map(patient => adaptPatientFromSupabase(patient) as Patient);
  },

  async getPatientById(id: number): Promise<Patient | undefined> {
    const { data, error } = await supabase
      .from("Patient")
      .select("*")
      .eq("id", id)
      .single();
      
    if (error) {
      if (error.code === "PGRST116") { // Code pour "pas de résultat"
        return undefined;
      }
      throw new Error(error.message);
    }
    
    return adaptPatientFromSupabase(data) as Patient;
  },

  async createPatient(patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    // Adapter le format pour Supabase
    const adaptedPatient = {
      ...patientData,
      contraception: adaptAppointmentStatusForSupabase(patientData.contraception),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from("Patient")
      .insert(adaptedPatient)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    
    return adaptPatientFromSupabase(data) as Patient;
  },

  async updatePatient(id: number, patient: Partial<Patient>): Promise<Patient | undefined> {
    // Adapter les données pour Supabase
    const patientToUpdate = {
      ...patient,
      updatedAt: new Date().toISOString(),
      hasChildren: patient.hasChildren !== undefined 
        ? convertHasChildrenToBoolean(patient.hasChildren).toString() 
        : undefined,
      contraception: patient.contraception ? 
        adaptAppointmentStatusForSupabase(patient.contraception) : undefined
    };
    
    const { data, error } = await supabase
      .from("Patient")
      .update(patientToUpdate)
      .eq("id", id)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    
    return adaptPatientFromSupabase(data) as Patient;
  },

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from("Appointment")
      .select("*")
      .order("date", { ascending: true });
      
    if (error) throw new Error(error.message);
    
    // Adapter les statuts pour l'application
    return data.map(appointment => ({
      ...appointment,
      status: adaptAppointmentStatusFromSupabase(appointment.status)
    } as Appointment));
  },

  async getAppointmentById(id: number): Promise<Appointment | undefined> {
    const { data, error } = await supabase
      .from("Appointment")
      .select("*")
      .eq("id", id)
      .single();
      
    if (error) {
      if (error.code === "PGRST116") { // Code pour "pas de résultat"
        return undefined;
      }
      throw new Error(error.message);
    }
    
    return {
      ...data,
      status: adaptAppointmentStatusFromSupabase(data.status)
    } as Appointment;
  },

  async getAppointmentsByPatientId(patientId: number): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from("Appointment")
      .select("*")
      .eq("patientId", patientId)
      .order("date", { ascending: true });
      
    if (error) throw new Error(error.message);
    
    return data.map(appointment => ({
      ...appointment,
      status: adaptAppointmentStatusFromSupabase(appointment.status)
    } as Appointment));
  },

  async createAppointment(appointmentData: Omit<Appointment, 'id'>): Promise<Appointment> {
    // Adapter le format pour Supabase
    const adaptedAppointment = {
      ...appointmentData,
      status: adaptAppointmentStatusForSupabase(appointmentData.status)
    };
    
    const { data, error } = await supabase
      .from("Appointment")
      .insert(adaptedAppointment)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    
    return {
      ...data,
      status: adaptAppointmentStatusFromSupabase(data.status)
    } as Appointment;
  },

  async updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment | undefined> {
    // Adapter les données pour Supabase
    const appointmentToUpdate = {
      ...appointment,
      status: appointment.status ? 
        adaptAppointmentStatusForSupabase(appointment.status) : undefined
    };
    
    const { data, error } = await supabase
      .from("Appointment")
      .update(appointmentToUpdate)
      .eq("id", id)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    
    return {
      ...data,
      status: adaptAppointmentStatusFromSupabase(data.status)
    } as Appointment;
  },

  async deleteAppointment(id: number): Promise<boolean> {
    const { error } = await supabase
      .from("Appointment")
      .delete()
      .eq("id", id);
    
    if (error) throw new Error(error.message);
    
    return true;
  },
  
  // Cabinet
  async getCabinets(): Promise<Cabinet[]> {
    const { data, error } = await supabase
      .from("Cabinet")
      .select("*");
      
    if (error) throw new Error(error.message);
    
    return data;
  },

  async getCabinetById(id: number): Promise<Cabinet | undefined> {
    const { data, error } = await supabase
      .from("Cabinet")
      .select("*")
      .eq("id", id)
      .single();
      
    if (error) {
      if (error.code === "PGRST116") {
        return undefined;
      }
      throw new Error(error.message);
    }
    
    return data;
  },

  async updateCabinet(id: number, cabinetData: Partial<Cabinet>): Promise<Cabinet | undefined> {
    const { data, error } = await supabase
      .from("Cabinet")
      .update({
        ...cabinetData,
        updatedAt: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    
    return data;
  },
  
  // Osteopaths
  async getOsteopaths(): Promise<Osteopath[]> {
    const { data, error } = await supabase
      .from("Osteopath")
      .select("*");
      
    if (error) throw new Error(error.message);
    
    return data;
  },

  async getOsteopathById(id: number): Promise<Osteopath | undefined> {
    const { data, error } = await supabase
      .from("Osteopath")
      .select("*")
      .eq("id", id)
      .single();
      
    if (error) {
      if (error.code === "PGRST116") {
        return undefined;
      }
      throw new Error(error.message);
    }
    
    return data;
  }
};
