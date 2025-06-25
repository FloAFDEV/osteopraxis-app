
import { supabase } from "@/integrations/supabase/client";

export interface CabinetInvitation {
  id: string;
  cabinet_id: number;
  inviter_osteopath_id: number;
  invitation_code: string;
  email?: string;
  expires_at: string;
  used_at?: string;
  used_by_osteopath_id?: number;
  created_at: string;
  notes?: string;
}

export interface CreateInvitationData {
  cabinet_id: number;
  email?: string;
  notes?: string;
}

export const cabinetInvitationService = {
  async createInvitation(data: CreateInvitationData): Promise<CabinetInvitation> {
    try {
      const inviterId = await this.getCurrentOsteopathId();
      
      // Ne pas spécifier invitation_code - laissons la DB le générer via DEFAULT
      const { data: invitation, error } = await supabase
        .from("cabinet_invitations")
        .insert({
          cabinet_id: data.cabinet_id,
          inviter_osteopath_id: inviterId,
          // invitation_code sera généré automatiquement par la fonction DB
          email: data.email,
          notes: data.notes,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 jours
        })
        .select()
        .single();

      if (error) throw error;
      return invitation;
    } catch (error) {
      console.error("Erreur lors de la création de l'invitation:", error);
      throw error;
    }
  },

  async getCabinetInvitations(cabinetId: number): Promise<CabinetInvitation[]> {
    try {
      const { data, error } = await supabase
        .from("cabinet_invitations")
        .select("*")
        .eq("cabinet_id", cabinetId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erreur lors de la récupération des invitations:", error);
      throw error;
    }
  },

  async useInvitation(invitationCode: string): Promise<{success: boolean, error?: string, cabinet_id?: number}> {
    try {
      const osteopathId = await this.getCurrentOsteopathId();
      
      // Vérifier si l'invitation existe et est valide
      const { data: invitation, error: fetchError } = await supabase
        .from("cabinet_invitations")
        .select("*")
        .eq("invitation_code", invitationCode)
        .is("used_at", null)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (fetchError || !invitation) {
        return { success: false, error: "Code d'invitation invalide ou expiré" };
      }

      // Marquer l'invitation comme utilisée
      const { error: updateError } = await supabase
        .from("cabinet_invitations")
        .update({
          used_at: new Date().toISOString(),
          used_by_osteopath_id: osteopathId
        })
        .eq("id", invitation.id);

      if (updateError) {
        return { success: false, error: "Erreur lors de l'utilisation de l'invitation" };
      }

      // Associer l'ostéopathe au cabinet
      const { error: associationError } = await supabase
        .from("osteopath_cabinet")
        .insert({
          osteopath_id: osteopathId,
          cabinet_id: invitation.cabinet_id
        });

      if (associationError) {
        return { success: false, error: "Erreur lors de l'association au cabinet" };
      }

      return { success: true, cabinet_id: invitation.cabinet_id };
    } catch (error) {
      console.error("Erreur lors de l'utilisation de l'invitation:", error);
      return { success: false, error: "Erreur inattendue" };
    }
  },

  async validateInvitationCode(code: string): Promise<{valid: boolean, cabinet_name?: string}> {
    try {
      const { data: invitation, error } = await supabase
        .from("cabinet_invitations")
        .select(`
          *,
          Cabinet:cabinet_id (
            name
          )
        `)
        .eq("invitation_code", code)
        .is("used_at", null)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (error || !invitation) {
        return { valid: false };
      }

      return { 
        valid: true, 
        cabinet_name: invitation.Cabinet?.name 
      };
    } catch (error) {
      console.error("Erreur lors de la validation:", error);
      return { valid: false };
    }
  },

  async revokeInvitation(invitationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("cabinet_invitations")
        .update({
          expires_at: new Date().toISOString() // Expirer immédiatement
        })
        .eq("id", invitationId);

      if (error) throw error;
    } catch (error) {
      console.error("Erreur lors de la révocation:", error);
      throw error;
    }
  },

  async getCurrentOsteopathId(): Promise<number> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Non authentifié");

    const { data, error } = await supabase
      .from("Osteopath")
      .select("id")
      .eq("authId", session.user.id)
      .single();

    if (error) throw error;
    return data.id;
  }
};
