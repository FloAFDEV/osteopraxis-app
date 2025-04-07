
import { Patient } from "@/types";
import { supabase, addAuthHeaders } from "./utils";
import { adaptPatientFromSupabase, preparePatientForApi } from "@/utils/patient-form-helpers";
import { SIMULATE_AUTH } from "../api/config";

export const supabasePatientService = {
  async getPatients(): Promise<Patient[]> {
    console.log("Récupération des patients depuis Supabase...");
    
    try {
      // Utiliser la fonction addAuthHeaders pour ajouter les en-têtes
      const query = addAuthHeaders(
        supabase
          .from("Patient")
          .select("*")
          .order('lastName', { ascending: true })
      );
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Erreur lors de la récupération des patients:", error);
        throw new Error(error.message);
      }
      
      console.log(`Patients récupérés: ${data?.length || 0}`);
      
      if (!data || data.length === 0) {
        console.warn("Aucun patient trouvé dans la base de données");
        return [];
      }
      
      // Convertir et adapter les champs pour être compatibles avec l'application
      const patients = data.map(patient => {
        const adaptedPatient = adaptPatientFromSupabase(patient);
        return adaptedPatient as Patient;
      });
      return patients;
    } catch (error) {
      console.error("Erreur lors de la récupération des patients:", error);
      throw error;
    }
  },

  async getPatientById(id: number): Promise<Patient | undefined> {
    try {
      const query = addAuthHeaders(
        supabase
          .from("Patient")
          .select("*")
          .eq("id", id)
          .maybeSingle()
      );
      
      const { data, error } = await query;
        
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
      
      const adaptedPatient = adaptPatientFromSupabase(data);
      return adaptedPatient as Patient;
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
      
      console.log("Création d'un nouveau patient...");
      
      const query = addAuthHeaders(
        supabase
          .from("Patient")
          .insert(formattedData)
          .select()
          .single()
      );
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Erreur Supabase createPatient:", error);
        throw new Error(error.message);
      }
      
      if (!data) {
        throw new Error("Aucune donnée retournée lors de la création du patient");
      }
      
      console.log("Patient créé avec succès");
      const adaptedPatient = adaptPatientFromSupabase(data);
      return adaptedPatient as Patient;
    } catch (error: any) {
      console.error("Erreur lors de la création du patient:", error);
      throw error;
    }
  },

  async updatePatient(id: number, patientData: Partial<Patient>): Promise<Patient | undefined> {
    try {
      // D'abord récupérer les données existantes du patient
      const existingPatientQuery = addAuthHeaders(
        supabase
          .from("Patient")
          .select("*")
          .eq("id", id)
          .maybeSingle()
      );
      
      const existingPatientResponse = await existingPatientQuery;
        
      if (existingPatientResponse.error) {
        console.error("Erreur lors de la récupération du patient existant:", existingPatientResponse.error);
        throw new Error(existingPatientResponse.error.message);
      }
      
      if (!existingPatientResponse.data) {
        console.error("Aucun patient trouvé avec l'id:", id);
        return undefined;
      }
      
      const existingPatient = existingPatientResponse.data;
      
      // Fusionner les nouvelles données avec les données existantes
      const updatedPatientBase = {
        firstName: patientData.firstName || existingPatient.firstName,
        lastName: patientData.lastName || existingPatient.lastName,
        email: patientData.email || existingPatient.email,
        phone: patientData.phone || existingPatient.phone,
        address: patientData.address || existingPatient.address,
        gender: patientData.gender || existingPatient.gender,
        maritalStatus: patientData.maritalStatus || existingPatient.maritalStatus,
        occupation: patientData.occupation || existingPatient.occupation,
        hasChildren: patientData.hasChildren !== undefined 
          ? patientData.hasChildren 
          : existingPatient.hasChildren,
        childrenAges: patientData.childrenAges || existingPatient.childrenAges,
        physicalActivity: patientData.physicalActivity || existingPatient.physicalActivity,
        isSmoker: patientData.isSmoker !== undefined 
          ? patientData.isSmoker 
          : existingPatient.isSmoker,
        handedness: patientData.handedness || existingPatient.handedness,
        contraception: patientData.contraception || existingPatient.contraception,
        currentTreatment: patientData.currentTreatment || existingPatient.currentTreatment,
        generalPractitioner: patientData.generalPractitioner || existingPatient.generalPractitioner,
        surgicalHistory: patientData.surgicalHistory || existingPatient.surgicalHistory,
        digestiveProblems: patientData.digestiveProblems || existingPatient.digestiveProblems,
        digestiveDoctorName: patientData.digestiveDoctorName || existingPatient.digestiveDoctorName,
        birthDate: patientData.birthDate
          ? new Date(patientData.birthDate).toISOString()
          : existingPatient.birthDate,
        avatarUrl: patientData.avatarUrl || existingPatient.avatarUrl,
        traumaHistory: patientData.traumaHistory || existingPatient.traumaHistory,
        rheumatologicalHistory: patientData.rheumatologicalHistory || existingPatient.rheumatologicalHistory,
        hasVisionCorrection: patientData.hasVisionCorrection !== undefined
          ? patientData.hasVisionCorrection
          : existingPatient.hasVisionCorrection,
        ophtalmologistName: patientData.ophtalmologistName || existingPatient.ophtalmologistName,
        entProblems: patientData.entProblems || existingPatient.entProblems,
        entDoctorName: patientData.entDoctorName || existingPatient.entDoctorName,
        hdlm: patientData.hdlm || existingPatient.hdlm,
        updatedAt: new Date().toISOString()
      };
      
      // Adapter les données pour Supabase
      const patientToUpdate = preparePatientForApi(updatedPatientBase);
      console.log("Mise à jour du patient avec ID:", id);
      
      // Effectuer la mise à jour
      const updateQuery = addAuthHeaders(
        supabase
          .from("Patient")
          .update(patientToUpdate)
          .eq("id", id)
          .select()
          .single()
      );
      
      const { data, error } = await updateQuery;
        
      if (error) {
        console.error("Erreur lors de la mise à jour du patient:", error);
        throw new Error(error.message);
      }
      
      console.log("Patient mis à jour avec succès");
      const adaptedPatient = adaptPatientFromSupabase(data);
      return adaptedPatient as Patient;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du patient:", error);
      throw error;
    }
  }
};
