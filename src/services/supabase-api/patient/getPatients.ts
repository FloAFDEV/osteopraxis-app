
import { supabase } from "@/integrations/supabase/client";
import { Patient } from "@/types";

export async function getPatients(): Promise<Patient[]> {
  console.log("=== DÉBUT getPatients ===");
  
  try {
    // Vérifier l'authentification
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Erreur de session:", sessionError);
      throw new Error("Erreur d'authentification");
    }

    if (!session) {
      console.error("Aucune session active");
      throw new Error("Utilisateur non authentifié");
    }

    console.log("Session active pour:", session.user.email);

    // Récupérer tous les patients (les politiques RLS se chargeront du filtrage)
    const { data: patients, error } = await supabase
      .from("Patient")
      .select("*")
      .order("lastName", { ascending: true });

    if (error) {
      console.error("Erreur lors de la récupération des patients:", error);
      throw error;
    }

    console.log(`${patients?.length || 0} patients récupérés`);
    return patients || [];
    
  } catch (error) {
    console.error("Erreur dans getPatients:", error);
    throw error;
  }
}
