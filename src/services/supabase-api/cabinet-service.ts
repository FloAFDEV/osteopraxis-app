// Import types
import { Cabinet } from "@/types";
import { supabase, typedData, SUPABASE_API_URL, SUPABASE_API_KEY } from "./utils";
import { corsHeaders } from "@/services/corsHeaders";

export const supabaseCabinetService = {
  async getCabinets(): Promise<Cabinet[]> {
    try {
      // First get the current user's session
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("No authenticated session");
      }

      // Get the user's osteopathId
      const { data: userData, error: userError } = await supabase
        .from("User")
        .select("osteopathId")
        .eq("id", session.session.user.id)
        .single();

      if (userError) throw userError;

      // If no osteopathId is found, return empty array
      if (!userData || !userData.osteopathId) {
        return [];
      }

      // Now get cabinets only for this osteopath
      const { data, error } = await supabase
        .from("Cabinet")
        .select("*")
        .eq("osteopathId", userData.osteopathId);
        
      if (error) throw error;
      
      return (data || []) as Cabinet[];
    } catch (error) {
      console.error("Error getting cabinets:", error);
      throw error;
    }
  },

  async getCabinetById(id: number): Promise<Cabinet | undefined> {
    const { data, error } = await supabase
      .from("Cabinet")
      .select("*")
      .eq("id", id)
      .single();
      
    if (error) {
      if (error.code === "PGRST116") {
        return undefined;
      }
      throw new Error(error.message);
    }
    
    return data as Cabinet;
  },

  async getCabinetsByOsteopathId(osteopathId: number): Promise<Cabinet[]> {
    if (!osteopathId) {
      console.log("Invalid osteopathId provided to getCabinetsByOsteopathId");
      return [];
    }
    
    const { data, error } = await supabase
      .from("Cabinet")
      .select("*")
      .eq("osteopathId", osteopathId);
      
    if (error) throw new Error(error.message);
    
    return (data || []) as Cabinet[];
  },
  
  async getCabinetsByUserId(userId: string): Promise<Cabinet[]> {
    console.log("Searching for cabinets for userId:", userId);
    
    if (!userId) {
      console.log("Invalid userId provided to getCabinetsByUserId");
      return [];
    }
    
    try {
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
  },
  
  async createCabinet(cabinet: Omit<Cabinet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Cabinet> {
    try {
      // Get osteopathId from user if not provided
      if (!cabinet.osteopathId) {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
          throw new Error("No authenticated session");
        }

        // Get the user's osteopathId
        const { data: userData, error: userError } = await supabase
          .from("User")
          .select("osteopathId")
          .eq("id", session.session.user.id)
          .single();

        if (userError || !userData || !userData.osteopathId) {
          throw new Error("Unable to determine osteopathId");
        }

        cabinet = {
          ...cabinet,
          osteopathId: userData.osteopathId
        };
      }

      // Ne jamais envoyer id/timestamps, Postgres gère
      const { id: _omit, createdAt: _createdAt, updatedAt: _updatedAt, ...insertable } = cabinet as any;
      const { data, error } = await supabase
        .from("Cabinet")
        .insert(insertable)
        .single();

      if (error) {
        console.error("[SUPABASE ERROR]", error.code, error.message);
        throw error;
      }

      return data as Cabinet;
    } catch (error) {
      console.error("Error creating cabinet:", error);
      throw error;
    }
  },

  async updateCabinet(id: number, cabinet: Partial<Omit<Cabinet, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Cabinet> {
    try {
      console.log(`Mise à jour du cabinet ${id}:`, cabinet);

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
      
      // Éviter d'afficher le toast ici pour éviter les doubles toasts
      // Le composant qui appelle cette fonction affichera le toast

      if (Array.isArray(data) && data.length > 0) return data[0];
      if (data && typeof data === "object") return data as Cabinet;
      throw new Error("Aucune donnée retournée lors de la mise à jour du cabinet");
    } catch (error) {
      console.error("[SUPABASE ERROR]", error);
      throw error;
    }
  },

  async updateTimestamps(cabinetId: number): Promise<void> {
    const now = new Date().toISOString();
    
    const { error } = await supabase
      .from("Cabinet")
      .update({ 
        updatedAt: now 
      })
      .eq("id", cabinetId);
      
    if (error) throw new Error(error.message);
  },

  async deleteCabinet(id: number): Promise<void> {
    const { error } = await supabase
      .from("Cabinet")
      .delete()
      .eq("id", id);
      
    if (error) throw new Error(error.message);
  }
};
