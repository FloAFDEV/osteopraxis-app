
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
  // Créer une nouvelle invitation
  async createInvitation(data: CreateInvitationData): Promise<CabinetInvitation> {
    const { data: invitation, error } = await supabase
      .from("cabinet_invitations")
      .insert({
        cabinet_id: data.cabinet_id,
        inviter_osteopath_id: await this.getCurrentOsteopathId(),
        invitation_code: await this.generateInvitationCode(),
        email: data.email,
        notes: data.notes
      })
      .select()
      .single();

    if (error) throw error;
    return invitation;
  },

  // Récupérer les invitations d'un cabinet
  async getCabinetInvitations(cabinetId: number): Promise<CabinetInvitation[]> {
    const { data, error } = await supabase
      .from("cabinet_invitations")
      .select("*")
      .eq("cabinet_id", cabinetId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Valider et utiliser une invitation
  async useInvitation(invitationCode: string): Promise<{success: boolean, error?: string, cabinet_id?: number}> {
    const osteopathId = await this.getCurrentOsteopathId();
    
    const { data, error } = await supabase.rpc('use_cabinet_invitation', {
      p_invitation_code: invitationCode,
      p_osteopath_id: osteopathId
    });

    if (error) throw error;
    return data;
  },

  // Vérifier si un code d'invitation est valide
  async validateInvitationCode(code: string): Promise<{valid: boolean, cabinet_name?: string}> {
    const { data, error } = await supabase
      .from("cabinet_invitations")
      .select(`
        id,
        cabinet_id,
        expires_at,
        used_at,
        Cabinet:cabinet_id (name)
      `)
      .eq("invitation_code", code)
      .maybeSingle();

    if (error) throw error;
    
    if (!data) {
      return { valid: false };
    }

    if (data.used_at || new Date(data.expires_at) < new Date()) {
      return { valid: false };
    }

    return { 
      valid: true, 
      cabinet_name: (data.Cabinet as any)?.name 
    };
  },

  // Révoquer une invitation
  async revokeInvitation(invitationId: string): Promise<void> {
    const { error } = await supabase
      .from("cabinet_invitations")
      .update({ expires_at: new Date().toISOString() })
      .eq("id", invitationId);

    if (error) throw error;
  },

  // Utilitaires privés
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
    const { data, error } = await supabase.rpc('generate_invitation_code');
    if (error) throw error;
    return data;
  }
};
