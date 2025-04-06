
import { Patient } from "@/types";
import { supabase, typedData, logSupabaseResponse, WithContraception } from "./utils";
import { adaptPatientFromSupabase, preparePatientForApi } from "@/utils/patient-form-helpers";

export const supabasePatientService = {
  async getPatients(): Promise<Patient[]> {
    console.log("Récupération des patients depuis Supabase...");
    
    try {
      // Récupération de tous les patients sans filtrage
      const response = await supabase
        .from("Patient")
        .select("*")
        .order('lastName', { ascending: true });
        
      const { data, error } = response;
      
      if (error) {
        console.error("Erreur lors de la récupération des patients:", error);
        throw new Error(error.message);
      }
      
      console.log("Patients récupérés:", data);
      
      if (!data || data.length === 0) {
        console.warn("Aucun patient trouvé dans la base de données");
        return [];
      }
      
      // Convertir et adapter les champs pour être compatibles avec l'application
      const patients = data.map(patient => adaptPatientFromSupabase(patient) as Patient);
      console.log("Patients après adaptation:", patients);
      return patients;
    } catch (error) {
      console.error("Erreur lors de la récupération des patients:", error);
      throw error;
    }
  },

  async getPatientById(id: number): Promise<Patient | undefined> {
    try {
      const { data, error } = await supabase
        .from("Patient")
        .select("*")
        .eq("id", id)
        .maybeSingle();
        
      if (error) {
        console.error("Erreur lors de la récupération du patient:", error);
        if (error.code === "PGRST116") {
          return undefined;
        }
        throw new Error(error.message);
      }
      
      if (!data) {
        return undefined;
      }
      
      return adaptPatientFromSupabase(data) as Patient;
    } catch (error) {
      console.error("Erreur lors de la récupération du patient:", error);
      throw error;
    }
  },

  async createPatient(patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    try {
      // Adapter le format pour Supabase
      const now = new Date().toISOString();
      const formattedData = preparePatientForApi({
        ...patientData,
        createdAt: now,
        updatedAt: now
      });
      
      console.log("Création du patient avec les données:", formattedData);
      
      const { data, error } = await supabase
        .from("Patient")
        .insert(formattedData)
        .select()
        .single();
        
      if (error) {
        console.error("Erreur Supabase createPatient:", error);
        throw new Error(error.message);
      }
      
      if (!data) {
        throw new Error("Aucune donnée retournée lors de la création du patient");
      }
      
      return adaptPatientFromSupabase(data) as Patient;
    } catch (error: any) {
      console.error("Erreur lors de la création du patient:", error);
      throw error;
    }
  },

  async updatePatient(id: number, patient: Partial<Patient>): Promise<Patient | undefined> {
    try {
      // Adapter les données pour Supabase
      const patientToUpdate = preparePatientForApi({
        ...patient,
        updatedAt: new Date().toISOString()
      });
      
      const { data, error } = await supabase
        .from("Patient")
        .update(patientToUpdate)
        .eq("id", id)
        .select()
        .single();
        
      if (error) {
        console.error("Erreur lors de la mise à jour du patient:", error);
        throw new Error(error.message);
      }
      
      return adaptPatientFromSupabase(data) as Patient;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du patient:", error);
      throw error;
    }
  }
};
