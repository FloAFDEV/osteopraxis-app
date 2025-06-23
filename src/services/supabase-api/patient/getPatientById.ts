
import { supabase } from "@/integrations/supabase/client";
import { Patient } from "@/types";

export async function getPatientById(id: number): Promise<Patient | null> {
  console.log("=== DÉBUT getPatientById ===", id);
  
  // Validation stricte de l'ID
  if (!id || isNaN(id) || id <= 0) {
    console.error("ID patient invalide:", id);
    return null;
  }

  try {
    // Vérifier l'authentification
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Erreur de session:", sessionError);
      return null;
    }

    if (!session) {
      console.error("Aucune session active");
      return null;
    }

    // Récupérer le patient (les politiques RLS vérifieront l'accès)
    const { data: patient, error } = await supabase
      .from("Patient")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Erreur lors de la récupération du patient:", error);
      return null;
    }

    if (!patient) {
      console.log("Patient non trouvé ou accès non autorisé pour l'ID:", id);
      return null;
    }

    console.log("Patient récupéré avec succès:", patient.firstName, patient.lastName);
    return patient;
    
  } catch (error) {
    console.error("Erreur dans getPatientById:", error);
    return null;
  }
}
