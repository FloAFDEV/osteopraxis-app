
import { supabase } from "@/integrations/supabase/client";

export interface OsteopathCabinetAssociation {
  id: number;
  osteopath_id: number;
  cabinet_id: number;
  created_at: string;
}

export const osteopathCabinetService = {
  // Récupérer les cabinets d'un ostéopathe
  async getOsteopathCabinets(osteopathId: number): Promise<number[]> {
    const { data, error } = await supabase
      .from("osteopath_cabinet")
      .select("cabinet_id")
      .eq("osteopath_id", osteopathId);

    if (error) throw error;
    return data.map(row => row.cabinet_id);
  },

  // Associer un ostéopathe à un cabinet
  async associateOsteopathToCabinet(osteopathId: number, cabinetId: number): Promise<void> {
    const { error } = await supabase
      .from("osteopath_cabinet")
      .insert({
        osteopath_id: osteopathId,
        cabinet_id: cabinetId
      });

    if (error) throw error;
  },

  // Dissocier un ostéopathe d'un cabinet
  async dissociateOsteopathFromCabinet(osteopathId: number, cabinetId: number): Promise<void> {
    const { error } = await supabase
      .from("osteopath_cabinet")
      .delete()
      .eq("osteopath_id", osteopathId)
      .eq("cabinet_id", cabinetId);

    if (error) throw error;
  },

  // Vérifier si un patient appartient directement à un ostéopathe
  async isPatientOwnedDirectly(patientId: number, osteopathId: number): Promise<boolean> {
    const { data, error } = await supabase
      .from("Patient")
      .select("osteopathId")
      .eq("id", patientId)
      .single();

    if (error) return false;
    return data.osteopathId === osteopathId;
  }
};
