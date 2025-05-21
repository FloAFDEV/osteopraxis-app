
import { supabase } from "@/integrations/supabase/client";

// Simplify return type to avoid excessive type instantiation
export async function getCurrentOsteopathId(): Promise<number | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log("Aucun utilisateur connecté dans getCurrentOsteopathId");
      return null;
    }
    
    // Récupérer l'utilisateur complet à partir de la table User
    const { data: userData, error: userError } = await supabase
      .from("User")
      .select("osteopathId")
      .eq("id", user.id)
      .single();
    
    if (userError || !userData) {
      console.error("Erreur lors de la récupération des données utilisateur:", userError);
      return null;
    }
    
    if (!userData.osteopathId) {
      console.log("L'utilisateur connecté n'a pas d'osteopathId associé");
      return null;
    }
    
    console.log("[SECURITY] OsteopathId trouvé dans User:", userData.osteopathId, "pour", user.email);
    return userData.osteopathId;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'ID d'ostéopathe:", error);
    return null;
  }
}

// Simplify return type to avoid excessive type instantiation
export async function getCurrentOsteopath(): Promise<{ id: number } | null> {
  try {
    const osteopathId = await getCurrentOsteopathId();
    
    if (!osteopathId) {
      return null;
    }
    
    // Récupérer les données complètes de l'ostéopathe
    const { data: osteopathData, error: osteopathError } = await supabase
      .from("Osteopath")
      .select("id, name, userId, siret, adeli_number, ape_code")
      .eq("id", osteopathId)
      .single();
    
    if (osteopathError || !osteopathData) {
      console.error("Erreur lors de la récupération des données d'ostéopathe:", osteopathError);
      return null;
    }
    
    return { id: osteopathData.id };
  } catch (error) {
    console.error("Erreur lors de la récupération de l'ostéopathe:", error);
    return null;
  }
}
