
import { supabase } from "@/integrations/supabase/client";
import { Patient, Appointment, Osteopath, Cabinet, User, AuthState } from "@/types";
import { 
  convertHasChildrenToBoolean, 
  adaptPatientFromSupabase, 
  adaptAppointmentStatusFromSupabase, 
  adaptAppointmentStatusForSupabase 
} from "@/utils/patient-form-helpers";

// Type générique pour caster les résultats des requêtes Supabase
type WithContraception<T> = T & { contraception: any };
type WithStatus<T> = T & { status: any };

// Fonction pour préparer les données du patient avant de les envoyer à Supabase
const preparePatientForApi = (patientData: Partial<Patient>) => {
  return {
    ...patientData,
    // Convertir hasChildren en string si présent
    hasChildren: patientData.hasChildren !== undefined 
      ? (typeof patientData.hasChildren === 'boolean' ? patientData.hasChildren.toString() : patientData.hasChildren)
      : undefined,
    // Adapter contraception si présent
    contraception: patientData.contraception ? 
      (patientData.contraception === "IMPLANT" ? "IMPLANTS" : patientData.contraception) : undefined
  };
};

// Service pour gérer les opérations Supabase
export const supabaseApi = {
  // Auth
  async register(email: string, password: string, firstName: string, lastName: string): Promise<AuthState> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName
        }
      }
    });
    
    if (error) throw new Error(error.message);
    
    if (!data.user) {
      throw new Error("Échec lors de la création du compte");
    }
    
    // Créer l'entrée User associée
    const { error: userError } = await supabase
      .from("User")
      .insert({
        id: data.user.id,
        first_name: firstName,
        last_name: lastName,
        email: email,
        role: "OSTEOPATH", // Par défaut, tous les nouveaux utilisateurs sont des ostéopathes
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (userError) {
      console.error("Erreur lors de la création du profil utilisateur:", userError);
    }
    
    // Si inscription réussie, connecter l'utilisateur
    return this.login(email, password);
  },
  
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
  
  async loginWithMagicLink(email: string): Promise<void> {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      }
    });
    
    if (error) throw new Error(error.message);
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
    const formattedData = preparePatientForApi(patientData);
    
    const { data, error } = await supabase
      .from("Patient")
      .insert({
        ...formattedData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as WithContraception<any>)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    
    return adaptPatientFromSupabase(data) as Patient;
  },

  async updatePatient(id: number, patient: Partial<Patient>): Promise<Patient | undefined> {
    // Adapter les données pour Supabase
    const patientToUpdate = preparePatientForApi(patient);
    
    const { data, error } = await supabase
      .from("Patient")
      .update({
        ...patientToUpdate,
        updatedAt: new Date().toISOString()
      } as WithContraception<any>)
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
    const adaptedStatus = adaptAppointmentStatusForSupabase(appointmentData.status);
    
    const { data, error } = await supabase
      .from("Appointment")
      .insert({
        ...appointmentData,
        status: adaptedStatus
      } as WithStatus<any>)
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
    const adaptedStatus = appointment.status ? adaptAppointmentStatusForSupabase(appointment.status) : undefined;
    
    const { data, error } = await supabase
      .from("Appointment")
      .update({
        ...appointment,
        status: adaptedStatus
      } as WithStatus<any>)
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
  },

  async promoteToAdmin(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from("User")
      .update({ role: "ADMIN" })
      .eq("id", userId);

    if (error) throw new Error(error.message);
    return true;
  }
};
