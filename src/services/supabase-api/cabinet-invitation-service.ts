
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
  // TEMPORAIREMENT DÉSACTIVÉ - En attente de la mise à jour des types Supabase
  async createInvitation(data: CreateInvitationData): Promise<CabinetInvitation> {
    throw new Error("Service temporairement indisponible - table cabinet_invitations non créée");
  },

  async getCabinetInvitations(cabinetId: number): Promise<CabinetInvitation[]> {
    throw new Error("Service temporairement indisponible - table cabinet_invitations non créée");
  },

  async useInvitation(invitationCode: string): Promise<{success: boolean, error?: string, cabinet_id?: number}> {
    throw new Error("Service temporairement indisponible - table cabinet_invitations non créée");
  },

  async validateInvitationCode(code: string): Promise<{valid: boolean, cabinet_name?: string}> {
    throw new Error("Service temporairement indisponible - table cabinet_invitations non créée");
  },

  async revokeInvitation(invitationId: string): Promise<void> {
    throw new Error("Service temporairement indisponible - table cabinet_invitations non créée");
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
  },

  async generateInvitationCode(): Promise<string> {
    // Génération locale temporaire
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }
};
