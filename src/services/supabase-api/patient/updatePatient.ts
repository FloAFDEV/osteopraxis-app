
import { Patient, Contraception, Gender } from "@/types";
import { supabase, SUPABASE_API_URL, SUPABASE_API_KEY } from "../utils";
import { adaptPatientFromSupabase } from "../patient-adapter";
import { corsHeaders } from "@/services/corsHeaders";
import { toast } from "@/components/ui/use-toast";

// Type pour la mise à jour de patient
type UpdatePatientPayload = Omit<Patient, "createdAt" | "updatedAt">;

export async function updatePatient(patient: UpdatePatientPayload): Promise<Patient> {
  try {
    // 1. Récupérer le token d'authentification utilisateur
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      throw new Error("Utilisateur non authentifié");
    }
    const token = session.access_token;

    // Correction pour certaines valeurs d'énumération
    let contraceptionValue = patient.contraception;
    if (contraceptionValue && contraceptionValue.toString() === "IMPLANT") {
      contraceptionValue = "IMPLANTS" as Contraception;
    }
    let genderValue = patient.gender;
    if (genderValue && genderValue.toString() === "Autre") {
      genderValue = "Homme" as Gender;
    }

    // Récupérer d'abord le patient existant pour vérification
    const { data: existingPatient } = await supabase
      .from("Patient")
      .select("osteopathId")
      .eq("id", patient.id)
      .single();
      
    // Vérifier l'accès de l'utilisateur actuel
    const { data: userOsteopath } = await supabase
      .from("User")
      .select("osteopathId")
      .eq("id", session.user.id)
      .single();
      
    // S'assurer que l'utilisateur actuel est associé à l'ostéopathe du patient
    if (existingPatient && userOsteopath && existingPatient.osteopathId !== userOsteopath.osteopathId) {
      throw new Error("Vous n'êtes pas autorisé à modifier ce patient");
    }

    // Construction de l'objet à mettre à jour (sans timestamps)
    const updatable = {
      ...patient,
      contraception: contraceptionValue,
      gender: genderValue,
      birthDate: patient.birthDate ? new Date(patient.birthDate).toISOString() : null,
      osteopathId: patient.osteopathId || existingPatient?.osteopathId,
      // S'assurer que les champs de tabagisme sont correctement formatés
      isExSmoker: patient.isExSmoker || false,
      isSmoker: patient.isSmoker || false,
      smokingAmount: patient.smokingAmount || null,
      smokingSince: patient.smokingSince || null,
      quitSmokingDate: patient.quitSmokingDate || null
    };
    
    // 2. Utiliser REST pour contourner les problèmes CORS
    if (!SUPABASE_API_URL || !SUPABASE_API_KEY) {
      throw new Error("Configuration Supabase manquante (URL ou clé API)");
    }

    const URL_ENDPOINT = `${SUPABASE_API_URL}/rest/v1/Patient?id=eq.${patient.id}`;

    // Supprimer les champs undefined/null pour ne pas les envoyer dans la requête
    Object.keys(updatable).forEach(
      (k) => (updatable as any)[k] === undefined && delete (updatable as any)[k]
    );

    console.log("Payload de mise à jour du patient:", updatable);

    // Utiliser PUT au lieu de PATCH pour la compatibilité CORS
    const res = await fetch(URL_ENDPOINT, {
      method: "PUT",
      headers: {
        apikey: SUPABASE_API_KEY,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
        ...corsHeaders
      },
      body: JSON.stringify(updatable),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Erreur HTTP ${res.status}:`, errorText);
      throw new Error(`Erreur lors de la mise à jour du patient: ${res.status}`);
    }

    // Traiter la réponse
    const data = await res.json();
    console.log("Réponse de mise à jour du patient:", data);

    if (Array.isArray(data) && data.length > 0) return adaptPatientFromSupabase(data[0]);
    if (data && typeof data === "object") return adaptPatientFromSupabase(data);
    
    throw new Error("Aucune donnée retournée lors de la mise à jour du patient");
  } catch (error) {
    console.error("[SUPABASE ERROR]", error);
    throw error;
  }
}
