
import { Osteopath } from "@/types";
import { supabase } from '@/integrations/supabase/client';

/**
 * Service d'accès direct à Supabase pour gérer les ostéopathes
 * Utilisé comme fallback en cas d'échec des fonctions edge
 */
export const directOsteopathService = {
  async createOsteopath(data: Partial<Osteopath>): Promise<Osteopath> {
    // S'assurer que nous avons une session
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error("Utilisateur non authentifié");
    }

    const now = new Date().toISOString();
    
    // Construire les données à insérer
    const insertData = {
      ...data,
      userId: data.userId || sessionData.session.user.id,
      createdAt: now,
      updatedAt: now
    };
    
    // Insertion avec client standard (sans privilèges élevés)
    const { data: newOsteopath, error } = await supabase
      .from("Osteopath")
      .insert(insertData)
      .select()
      .single();
      
    if (error) {
      console.error("Erreur lors de la création directe de l'ostéopathe:", error);
      throw new Error(`Échec de la création: ${error.message}`);
    }
    
    return newOsteopath as Osteopath;
  },
  
  async updateUser(userId: string, osteopathId: number): Promise<void> {
    // Mise à jour de la référence de l'ostéopathe dans le profil utilisateur
    const { error } = await supabase
      .from("User")
      .update({ osteopathId })
      .eq("id", userId);
      
    if (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
      throw new Error(`Échec de la mise à jour du profil: ${error.message}`);
    }
  }
};
