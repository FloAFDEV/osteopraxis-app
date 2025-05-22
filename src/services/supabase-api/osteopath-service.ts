
import { Osteopath } from "@/types";
import { supabase, typedData, SUPABASE_API_URL, SUPABASE_API_KEY, removeNullProperties } from "./utils";

export const supabaseOsteopathService = {
  async getOsteopaths(): Promise<Osteopath[]> {
    const { data, error } = await supabase
      .from("Osteopath")
      .select("*");
      
    if (error) throw new Error(error.message);
    
    return (data || []) as Osteopath[];
  },

  async getOsteopathById(id: number): Promise<Osteopath | undefined> {
    const { data, error } = await supabase
      .from("Osteopath")
      .select("*")
      .eq("id", id)
      .single();
      
    if (error) {
      if (error.code === "PGRST116") {
        console.log("Osteopath not found with ID:", id);
        return undefined;
      }
      throw new Error(error.message);
    }
    
    return data as Osteopath;
  },
  
  async getOsteopathByUserId(userId: string): Promise<Osteopath | undefined> {
    console.log("Looking for osteopath with userId:", userId);
    
    if (!userId) {
      console.log("Invalid userId provided to getOsteopathByUserId");
      throw new Error("Invalid userId provided");
    }
    
    try {
      // Check session state before executing the query
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("Session state:", sessionData.session ? "Authenticated" : "Not authenticated");
      
      if (!sessionData.session) {
        console.log("User not authenticated, cannot retrieve osteopath");
        throw new Error("User not authenticated");
      }
      
      console.log("Session user ID:", sessionData.session.user.id);
      console.log("Parameter user ID:", userId);
      console.log("Executing query with userId:", userId);
      
      // Exact match with userId
      const { data, error } = await supabase
        .from("Osteopath")
        .select("*")
        .eq("userId", userId)
        .maybeSingle();
        
      if (error) {
        console.error("Error when searching for osteopath:", error);
        throw new Error(error.message);
      }
      
      console.log("Current session:", sessionData.session ? "Authenticated" : "Not authenticated");
      
      if (!data) {
        console.log("No osteopath found with userId:", userId);
        
        // Display existing osteopaths for debugging
        const { data: allOsteos, error: allOsteosError } = await supabase
          .from("Osteopath")
          .select("id, userId")
          .limit(5);
          
        if (!allOsteosError && allOsteos) {
          console.log("Here are the first 5 osteopaths in the database:", allOsteos);
        }
        
        return undefined;
      }
      
      console.log("Osteopath found:", data);
      return data as Osteopath;
    } catch (error) {
      console.error("Exception while searching for osteopath:", error);
      throw error;
    }
  },
  
  async updateOsteopath(id: number, osteoData: Partial<Omit<Osteopath, 'id' | 'createdAt'>>): Promise<Osteopath | undefined> {
    try {
      // 1. Récupérer l'ostéopathe actuel pour préserver ses données existantes
      const currentOsteopath = await this.getOsteopathById(id);
      
      if (!currentOsteopath) {
        throw new Error("Ostéopathe non trouvé");
      }
      
      // S'assurer que les champs obligatoires sont préservés
      const userId = currentOsteopath.userId;
      const name = currentOsteopath.name;
      
      if (!userId) {
        throw new Error("L'ostéopathe n'a pas d'userId valide");
      }
      
      // 2. Récupérer le token d'authentification utilisateur
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("Utilisateur non authentifié");
      }
      const token = session.access_token;

      // 3. Utiliser REST pour contourner les problèmes CORS
      if (!SUPABASE_API_URL || !SUPABASE_API_KEY) {
        throw new Error("Configuration Supabase manquante (URL ou clé API)");
      }

      const URL_ENDPOINT = `${SUPABASE_API_URL}/rest/v1/Osteopath?id=eq.${id}`;
      
      // 4. Préparer le payload en combinant les données existantes et les nouvelles
      const updatePayload = {
        ...removeNullProperties(osteoData), // Ne conserver que les valeurs non nulles
        name: osteoData.name || currentOsteopath.name, // Préserver le nom s'il n'est pas fourni
        userId: userId, // S'assurer que l'userId est toujours présent
        updatedAt: new Date().toISOString(),
      };

      console.log("Payload de mise à jour de l'ostéopathe:", updatePayload);

      // On utilise PUT au lieu de PATCH car certaines configurations CORS peuvent bloquer PATCH
      // Cela fonctionnera comme un PATCH car nous définissons Prefer: return=representation
      const res = await fetch(URL_ENDPOINT, {
        method: "PUT",
        headers: {
          apikey: SUPABASE_API_KEY,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: "return=representation"
          // Ne pas inclure corsHeaders ici
        },
        body: JSON.stringify(updatePayload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Erreur HTTP ${res.status}:`, errorText);
        throw new Error(`Erreur lors de la mise à jour de l'ostéopathe: ${res.status}`);
      }

      // Traiter la réponse
      const data = await res.json();
      console.log("Réponse de mise à jour de l'ostéopathe:", data);
      
      if (Array.isArray(data) && data.length > 0) return data[0];
      if (data && typeof data === "object") return data as Osteopath;
      
      throw new Error("Aucune donnée retournée lors de la mise à jour de l'ostéopathe");
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'ostéopathe:", error);
      throw error;
    }
  },
  
  async createOsteopath(data: Omit<Osteopath, 'id' | 'createdAt' | 'updatedAt'>): Promise<Osteopath> {
  const now = new Date().toISOString();

  try {
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
      throw new Error("Utilisateur non authentifié");
    }

    const userId = data.userId || sessionData.session.user.id;

    // 🔍 Vérifier si un ostéopathe existe déjà pour cet utilisateur
    const existing = await this.getOsteopathByUserId(userId);
    if (existing) {
      console.warn("Un ostéopathe existe déjà pour cet userId :", userId);
      return existing;
    }

    const { data: newOsteopath, error } = await supabase
      .from("Osteopath")
      .insert({
        ...data,
        userId,
        createdAt: now,
        updatedAt: now
      })
      .select()
      .single();

    if (error) {
      console.error("Erreur lors de l'insertion de l'ostéopathe:", error);
      throw error;
    }

    return newOsteopath as Osteopath;
  } catch (error) {
    console.error("Erreur lors de la création de l'ostéopathe:", error);
    throw error;
  }
}
,
  
  async hasRequiredFields(osteopathId: number): Promise<boolean> {
    try {
      const osteopath = await this.getOsteopathById(osteopathId);
      
      if (!osteopath) return false;
      
      // Vérifier si les champs obligatoires pour les factures sont présents
      return (
        !!osteopath.adeli_number && 
        !!osteopath.siret && 
        !!osteopath.name && 
        !!osteopath.professional_title
      );
    } catch (error) {
      console.error("Erreur lors de la vérification des champs obligatoires:", error);
      return false;
    }
  }
};
