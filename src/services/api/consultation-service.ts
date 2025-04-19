
import { Consultation } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const consultationService = {
  async getConsultations(): Promise<Consultation[]> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        throw new Error("Vous devez vous connecter pour accéder aux consultations");
      }

      const { data: userProfile } = await supabase
        .from('User')
        .select('professionalProfileId')
        .eq('id', session.session.user.id)
        .single();

      if (!userProfile?.professionalProfileId) {
        throw new Error("Vous devez compléter votre profil professionnel avant de consulter vos consultations");
      }

      const { data, error } = await supabase
        .from('Consultation')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw new Error(error.message);
      return data as Consultation[];
    } catch (error) {
      console.error("Error fetching consultations:", error);
      throw error;
    }
  },

  async getConsultationById(id: number): Promise<Consultation | null> {
    try {
      const { data, error } = await supabase
        .from('Consultation')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data as Consultation;
    } catch (error) {
      console.error("Error fetching consultation by ID:", error);
      return null;
    }
  },

  async getConsultationsByPatientId(patientId: number): Promise<Consultation[]> {
    try {
      const { data, error } = await supabase
        .from('Consultation')
        .select('*')
        .eq('patientId', patientId)
        .order('date', { ascending: false });

      if (error) throw new Error(error.message);
      return data as Consultation[];
    } catch (error) {
      console.error("Error fetching consultations by patient ID:", error);
      return [];
    }
  },

  async createConsultation(consultation: Omit<Consultation, 'id'>): Promise<Consultation> {
    try {
      const { data, error } = await supabase
        .from('Consultation')
        .insert(consultation)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Consultation;
    } catch (error) {
      console.error("Error creating consultation:", error);
      throw error;
    }
  },

  async updateConsultation(id: number, consultation: Partial<Consultation>): Promise<Consultation> {
    try {
      const { data, error } = await supabase
        .from('Consultation')
        .update(consultation)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Consultation;
    } catch (error) {
      console.error("Error updating consultation:", error);
      throw error;
    }
  },

  async deleteConsultation(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('Consultation')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);
      return true;
    } catch (error) {
      console.error("Error deleting consultation:", error);
      return false;
    }
  }
};
