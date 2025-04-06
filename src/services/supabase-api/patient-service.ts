import { Patient } from "@/types";
import { supabase, WithContraception } from "./utils";
import { adaptPatientFromSupabase, preparePatientForApi } from "@/utils/patient-form-helpers";

export const supabasePatientService = {
  async getPatients(): Promise<Patient[]> {
    console.log("Récupération des patients depuis Supabase...");
    
    try {
      // Modification pour s'assurer que tous les patients sont récupérés sans filtrage
      const { data, error } = await supabase
        .from("Patient")
        .select("*");
        
      if (error) {
        console.error("Erreur lors de la récupération des patients:", error);
        throw new Error(error.message);
      }
      
      console.log("Patients récupérés:", data);
      
      // Convertir et adapter les champs pour être compatibles avec l'application
      return data.map(patient => adaptPatientFromSupabase(patient) as Patient);
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
        .maybeSingle(); // Utilisation de maybeSingle au lieu de single pour éviter des erreurs
        
      if (error) {
        console.error("Erreur lors de la récupération du patient:", error);
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
      .insert(formattedData as WithContraception<any>)
      .select()
      .single();
      
    if (error) {
      console.error("Erreur lors de la création du patient:", error);
      throw new Error(error.message);
    }
    
    return adaptPatientFromSupabase(data) as Patient;
  },

  async updatePatient(id: number, patient: Partial<Patient>): Promise<Patient | undefined> {
    // Adapter les données pour Supabase
    const patientToUpdate = preparePatientForApi({
      ...patient,
      updatedAt: new Date().toISOString()
    });
    
    const { data, error } = await supabase
      .from("Patient")
      .update(patientToUpdate as WithContraception<any>)
      .eq("id", id)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    
    return adaptPatientFromSupabase(data) as Patient;
  }
};
