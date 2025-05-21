
import { Cabinet } from "@/types";
import { supabase, SUPABASE_API_URL, SUPABASE_API_KEY } from "../utils";
import { corsHeaders } from "@/services/corsHeaders";
import { getCurrentOsteopathId } from "../utils/getCurrentOsteopath";
import { CabinetUpdateInput } from "./types";
import { getCabinetById } from "./getCabinetById";

export async function updateCabinet(id: number, cabinet: CabinetUpdateInput): Promise<Cabinet> {
  try {
    // Vérifier que l'utilisateur est autorisé à modifier ce cabinet
    const currentOsteopathId = await getCurrentOsteopathId();
    
    if (!currentOsteopathId) {
      throw new Error("Non autorisé: vous devez être connecté en tant qu'ostéopathe");
    }
    
    // Vérifier que le cabinet appartient bien à l'ostéopathe connecté
    const existingCabinet = await getCabinetById(id);
    
    if (!existingCabinet) {
      throw new Error("Cabinet non trouvé ou accès non autorisé");
    }
    
    if (existingCabinet.osteopathId !== currentOsteopathId) {
      console.error(`TENTATIVE DE VIOLATION DE SÉCURITÉ: L'ostéopathe ${currentOsteopathId} tente de modifier le cabinet ${id} appartenant à l'ostéopathe ${existingCabinet.osteopathId}`);
      throw new Error("Accès non autorisé: ce cabinet n'est pas associé à votre compte");
    }
    
    // SÉCURITÉ: Empêcher la modification de l'osteopathId
    if (cabinet.osteopathId && cabinet.osteopathId !== currentOsteopathId) {
      console.error(`TENTATIVE DE VIOLATION DE SÉCURITÉ: Tentative de modification de l'osteopathId du cabinet ${id} de ${currentOsteopathId} à ${cabinet.osteopathId}`);
      // Ignorer la tentative de modification de l'osteopathId
      delete cabinet.osteopathId;
    }
    
    console.log(`Mise à jour du cabinet ${id} pour l'ostéopathe ${currentOsteopathId}:`, cabinet);

    // 1. Récupérer le token d'authentification utilisateur
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      throw new Error("Utilisateur non authentifié");
    }
    const token = session.access_token;

    // 2. Utiliser REST pour contourner les problèmes CORS
    if (!SUPABASE_API_URL || !SUPABASE_API_KEY) {
      throw new Error("Configuration Supabase manquante (URL ou clé API)");
    }

    const URL_ENDPOINT = `${SUPABASE_API_URL}/rest/v1/Cabinet?id=eq.${id}`;

    // 3. Préparer le payload avec l'ID inclus
    const updatePayload = {
      id: id, // Important: inclure l'ID dans le corps pour les requêtes PATCH/PUT
      ...cabinet,
      updatedAt: new Date().toISOString(),
    };

    // 4. Nettoyer les valeurs undefined
    Object.keys(updatePayload).forEach(
      (k) => updatePayload[k] === undefined && delete updatePayload[k]
    );

    console.log("Payload de mise à jour:", updatePayload);

    // 5. Utiliser PUT au lieu de PATCH
    const res = await fetch(URL_ENDPOINT, {
      method: "PUT",
      headers: {
        apikey: SUPABASE_API_KEY,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
        ...corsHeaders
      },
      body: JSON.stringify(updatePayload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Erreur HTTP ${res.status}:`, errorText);
      throw new Error(`Erreur lors de la mise à jour du cabinet: ${res.status}`);
    }

    // Traiter la réponse
    const data = await res.json();
    console.log("Réponse de mise à jour:", data);

    if (Array.isArray(data) && data.length > 0) return data[0];
    if (data && typeof data === "object") return data as Cabinet;
    throw new Error("Aucune donnée retournée lors de la mise à jour du cabinet");
  } catch (error) {
    console.error("[SUPABASE ERROR]", error);
    throw error;
  }
}
