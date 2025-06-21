import { supabase } from "@/integrations/supabase/client";

export interface OsteopathReplacement {
  id: number;
  osteopath_id: number;
  replacement_osteopath_id: number;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthorizedOsteopath {
  id: number;
  name: string;
  professional_title?: string;
  rpps_number?: string;
  siret?: string;
  access_type: 'self' | 'replacement' | 'cabinet_colleague';
}

export const osteopathReplacementService = {
  // Récupérer les ostéopathes autorisés pour l'utilisateur actuel
  async getAuthorizedOsteopaths(): Promise<AuthorizedOsteopath[]> {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error("Non authentifié");
    }

    const { data, error } = await supabase.rpc('get_authorized_osteopaths', {
      current_osteopath_auth_id: sessionData.session.user.id
    });

    if (error) throw error;
    
    // Assurer que les types correspondent exactement
    return (data || []).map((item: any): AuthorizedOsteopath => ({
      id: item.id,
      name: item.name,
      professional_title: item.professional_title,
      rpps_number: item.rpps_number,
      siret: item.siret,
      access_type: item.access_type as 'self' | 'replacement' | 'cabinet_colleague'
    }));
  },

  // Récupérer les remplacements pour l'ostéopathe actuel
  async getMyReplacements(): Promise<OsteopathReplacement[]> {
    const { data, error } = await supabase
      .from("osteopath_replacement")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Créer un nouveau remplacement
  async createReplacement(replacement: Omit<OsteopathReplacement, 'id' | 'created_at' | 'updated_at'>): Promise<OsteopathReplacement> {
    const { data, error } = await supabase
      .from("osteopath_replacement")
      .insert(replacement)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour un remplacement
  async updateReplacement(id: number, updates: Partial<OsteopathReplacement>): Promise<OsteopathReplacement> {
    const { data, error } = await supabase
      .from("osteopath_replacement")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Supprimer un remplacement
  async deleteReplacement(id: number): Promise<void> {
    const { error } = await supabase
      .from("osteopath_replacement")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  // Désactiver un remplacement
  async deactivateReplacement(id: number): Promise<OsteopathReplacement> {
    return this.updateReplacement(id, { is_active: false });
  },

  // Réactiver un remplacement
  async activateReplacement(id: number): Promise<OsteopathReplacement> {
    return this.updateReplacement(id, { is_active: true });
  }
};
