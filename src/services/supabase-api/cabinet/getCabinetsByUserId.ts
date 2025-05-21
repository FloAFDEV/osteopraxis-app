
import { Cabinet } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export async function getCabinetsByUserId(userId: string): Promise<Cabinet[]> {
  try {
    console.log("Searching for cabinets for userId:", userId);
    
    if (!userId) {
      console.log("Invalid userId provided to getCabinetsByUserId");
      return [];
    }
    
    // Vérifier que l'utilisateur demandé est bien celui connecté
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session || sessionData.session.user.id !== userId) {
      console.error(`TENTATIVE D'ACCÈS NON AUTORISÉ: Tentative d'accès aux cabinets de l'utilisateur ${userId} par un autre utilisateur`);
      return [];
    }
    
    // First get the osteopath ID for this user
    const { data: osteopathData, error: osteopathError } = await supabase
      .from("Osteopath")
      .select("id")
      .eq("userId", userId)
      .maybeSingle();
      
    if (osteopathError) {
      console.error("Error finding osteopath:", osteopathError);
      throw new Error(osteopathError.message);
    }
    
    if (!osteopathData) {
      console.log("No osteopath found for userId:", userId);
      return [];
    }
    
    console.log("Osteopath found with ID:", osteopathData.id);
    
    // Now get cabinets with this osteopath ID
    const { data: cabinets, error: cabinetsError } = await supabase
      .from("Cabinet")
      .select("*")
      .eq("osteopathId", osteopathData.id);
      
    if (cabinetsError) throw new Error(cabinetsError.message);
    
    console.log(`${cabinets?.length || 0} cabinet(s) found for osteopath`);
    return (cabinets || []) as Cabinet[];
  } catch (error) {
    console.error("Exception while searching for cabinets:", error);
    throw error;
  }
}
