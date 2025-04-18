
import { Cabinet } from "@/types";
import { supabase, getCurrentProfileId } from "./utils";

export const supabaseCabinetService = {
  async getCabinets(): Promise<Cabinet[]> {
    const { data, error } = await supabase
      .from('Cabinet')
      .select('*')
      .order('name');
      
    if (error) throw new Error(error.message);
    
    return data as Cabinet[];
  },

  async getCabinetById(id: number): Promise<Cabinet | null> {
    const { data, error } = await supabase
      .from('Cabinet')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') return null; // Pas trouvé
      throw new Error(error.message);
    }
    
    return data as Cabinet;
  },
  
  async getCabinetsByProfessionalProfileId(professionalProfileId: number): Promise<Cabinet[]> {
    console.log(`Récupération des cabinets pour le profil ID ${professionalProfileId}`);
    const { data, error } = await supabase
      .from('Cabinet')
      .select('*')
      .eq('professionalProfileId', professionalProfileId)
      .order('name');
      
    if (error) {
      console.error("Erreur lors de la récupération des cabinets par professionalProfileId:", error);
      throw new Error(error.message);
    }
    
    console.log(`${data?.length || 0} cabinets trouvés pour le profil ID ${professionalProfileId}`);
    return data as Cabinet[] || [];
  },
  
  async getCabinetsByUserId(userId: string): Promise<Cabinet[]> {
    // Récupérer d'abord l'ID du profil professionnel de l'utilisateur
    const profileId = await getCurrentProfileId();
    if (!profileId) {
      console.log("Pas de profil professionnel associé à cet utilisateur");
      return [];
    }
    
    // Récupérer les cabinets associés à ce profil
    return this.getCabinetsByProfessionalProfileId(profileId);
  },
  
  async createCabinet(data: Omit<Cabinet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Cabinet> {
    const now = new Date().toISOString();
    
    const { data: newCabinet, error } = await supabase
      .from('Cabinet')
      .insert({
        ...data,
        createdAt: now,
        updatedAt: now
      })
      .select()
      .single();
      
    if (error) {
      console.error("Erreur lors de la création du cabinet:", error);
      throw new Error(error.message);
    }
    
    return newCabinet as Cabinet;
  },
  
  async updateCabinet(id: number, data: Partial<Omit<Cabinet, 'id' | 'createdAt'>>): Promise<Cabinet | null> {
    const { data: updatedCabinet, error } = await supabase
      .from('Cabinet')
      .update({
        ...data,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error("Erreur lors de la mise à jour du cabinet:", error);
      throw new Error(error.message);
    }
    
    return updatedCabinet as Cabinet;
  },
  
  async deleteCabinet(id: number): Promise<void> {
    const { error } = await supabase
      .from('Cabinet')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error("Erreur lors de la suppression du cabinet:", error);
      throw new Error(error.message);
    }
  },
  
  // Pour compatibilité avec le code existant
  getCabinetsByOsteopathId: function(osteopathId: number) {
    return this.getCabinetsByProfessionalProfileId(osteopathId);
  }
};
