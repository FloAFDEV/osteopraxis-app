
import { Patient } from "@/types";
import { supabase } from "./utils";

export const supabasePatientService = {
  async getAuthSession() {
    return await supabase.auth.getSession();
  },

  async getPatients(): Promise<Patient[]> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Vous devez vous connecter pour accéder à vos patients");
      }

      const { data: userProfile } = await supabase
        .from('User')
        .select('professionalProfileId')
        .eq('id', session.session?.user.id)
        .single();

      if (!userProfile?.professionalProfileId) {
        throw new Error("Vous devez compléter votre profil professionnel avant de consulter vos patients");
      }

      const { data, error } = await supabase
        .from('Patient')
        .select('*')
        .eq('professionalProfileId', userProfile.professionalProfileId);

      if (error) {
        throw error;
      }

      return data as Patient[];
    } catch (error) {
      console.error("Error fetching patients:", error);
      throw error;
    }
  },

  async getPatientById(id: number): Promise<Patient | null> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Vous devez vous connecter pour accéder à ce patient");
      }

      const { data: userProfile } = await supabase
        .from('User')
        .select('professionalProfileId')
        .eq('id', session.session?.user.id)
        .single();

      if (!userProfile?.professionalProfileId) {
        throw new Error("Vous devez compléter votre profil professionnel avant de consulter vos patients");
      }

      const { data, error } = await supabase
        .from('Patient')
        .select('*')
        .eq('id', id)
        .eq('professionalProfileId', userProfile.professionalProfileId)
        .single();

      if (error) {
        // If error is "No rows found", return null
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data as Patient;
    } catch (error) {
      console.error("Error fetching patient by ID:", error);
      throw error;
    }
  },

  async createPatient(patientData: Partial<Patient>): Promise<Patient> {
    try {
      // Get the professional profile ID from the user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Vous devez vous connecter pour créer un patient");
    
      const { data: userProfile } = await supabase
        .from('User')
        .select('professionalProfileId')
        .eq('id', session.user.id)
        .single();
      
      if (!userProfile?.professionalProfileId) {
        throw new Error("Vous devez compléter votre profil professionnel avant de créer un patient");
      }
    
      const now = new Date().toISOString();
    
      // Create patient with professionalProfileId
      const { data, error } = await supabase
        .from('Patient')
        .insert({
          ...patientData,
          professionalProfileId: userProfile.professionalProfileId,
          createdAt: now,
          updatedAt: now,
        })
        .select()
        .single();
    
      if (error) {
        throw error;
      }
    
      return data as Patient;
    } catch (error) {
      console.error("Error creating patient:", error);
      throw error;
    }
  },

  async updatePatient(patient: Patient): Promise<Patient> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Vous devez vous connecter pour modifier ce patient");
      }

      const { data: userProfile } = await supabase
        .from('User')
        .select('professionalProfileId')
        .eq('id', session.session?.user.id)
        .single();

      if (!userProfile?.professionalProfileId) {
        throw new Error("Vous devez compléter votre profil professionnel avant de modifier ce patient");
      }

      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('Patient')
        .update({ ...patient, updatedAt: now })
        .eq('id', patient.id)
        .eq('professionalProfileId', userProfile.professionalProfileId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Patient;
    } catch (error) {
      console.error("Error updating patient:", error);
      throw error;
    }
  },

  async deletePatient(id: number): Promise<{ data: any; error: any }> {
    try {
       const { data: session } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("Vous devez vous connecter pour supprimer ce patient");
        }

        const { data: userProfile } = await supabase
          .from('User')
          .select('professionalProfileId')
          .eq('id', session.session?.user.id)
          .single();

        if (!userProfile?.professionalProfileId) {
          throw new Error("Vous devez compléter votre profil professionnel avant de supprimer ce patient");
        }
        
      const { data, error } = await supabase
        .from('Patient')
        .delete()
        .eq('id', id)
        .eq('professionalProfileId', userProfile.professionalProfileId);

      return { data, error };
    } catch (error) {
      console.error("Error deleting patient:", error);
      return { data: null, error: error };
    }
  },
};
