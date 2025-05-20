
// Import types
import { Cabinet } from "@/types";
import { supabase, typedData, SUPABASE_API_URL, SUPABASE_API_KEY } from "./utils";
import { corsHeaders } from "@/services/corsHeaders";
import { getCurrentOsteopathId } from "./utils/getCurrentOsteopath";

export const supabaseCabinetService = {
  async getCabinets(): Promise<Cabinet[]> {
    try {
      // Récupérer l'ID de l'ostéopathe connecté pour assurer le cloisonnement
      const osteopathId = await getCurrentOsteopathId();
      
      if (!osteopathId) {
        console.warn("Aucun ostéopathe connecté lors de la récupération des cabinets");
        return [];
      }
      
      console.log(`Récupération des cabinets pour l'ostéopathe ${osteopathId}`);
      
      const { data, error } = await supabase
        .from("Cabinet")
        .select("*")
        .eq("osteopathId", osteopathId); // Important: filtrer par ostéopathe connecté
        
      if (error) {
        console.error("Erreur lors de la récupération des cabinets:", error);
        throw new Error(error.message);
      }
      
      console.log(`${data?.length || 0} cabinet(s) trouvé(s) pour l'ostéopathe ${osteopathId}`);
      return (data || []) as Cabinet[];
    } catch (error) {
      console.error("Exception lors de la récupération des cabinets:", error);
      throw error;
    }
  },

  async getCabinetById(id: number): Promise<Cabinet | undefined> {
    try {
      // Récupérer l'ID de l'ostéopathe connecté
      const osteopathId = await getCurrentOsteopathId();
      
      if (!osteopathId) {
        console.warn("Tentative de récupération d'un cabinet sans être connecté");
        return undefined;
      }
      
      console.log(`Récupération du cabinet ${id} pour l'ostéopathe ${osteopathId}`);
      
      const { data, error } = await supabase
        .from("Cabinet")
        .select("*")
        .eq("id", id)
        .eq("osteopathId", osteopathId) // Important: filtrer par ostéopathe connecté
        .single();
        
      if (error) {
        if (error.code === "PGRST116") {
          // Vérifier si le cabinet existe mais appartient à un autre ostéopathe
          const { data: anyCabinet } = await supabase
            .from("Cabinet")
            .select("id")
            .eq("id", id)
            .maybeSingle();
            
          if (anyCabinet) {
            console.error(`TENTATIVE D'ACCÈS NON AUTORISÉ: L'ostéopathe ${osteopathId} a tenté d'accéder au cabinet ${id} qui ne lui appartient pas`);
          }
          
          console.log(`Cabinet ${id} non trouvé pour l'ostéopathe ${osteopathId}`);
          return undefined;
        }
        console.error(`Erreur lors de la récupération du cabinet ${id}:`, error);
        throw new Error(error.message);
      }
      
      return data as Cabinet;
    } catch (error) {
      console.error(`Exception lors de la récupération du cabinet ${id}:`, error);
      throw error;
    }
  },

  async getCabinetsByOsteopathId(osteopathId: number): Promise<Cabinet[]> {
    try {
      if (!osteopathId) {
        console.log("Invalid osteopathId provided to getCabinetsByOsteopathId");
        return [];
      }
      
      // Vérifier si l'ostéopathe demandé est bien celui connecté
      const currentOsteopathId = await getCurrentOsteopathId();
      
      if (currentOsteopathId !== osteopathId) {
        console.error(`TENTATIVE D'ACCÈS NON AUTORISÉ: L'ostéopathe ${currentOsteopathId} a tenté d'accéder aux cabinets de l'ostéopathe ${osteopathId}`);
        return [];
      }
      
      const { data, error } = await supabase
        .from("Cabinet")
        .select("*")
        .eq("osteopathId", osteopathId);
        
      if (error) throw new Error(error.message);
      
      return (data || []) as Cabinet[];
    } catch (error) {
      console.error("Exception lors de la récupération des cabinets par osteopathId:", error);
      throw error;
    }
  },
  
  async getCabinetsByUserId(userId: string): Promise<Cabinet[]> {
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
  },
  
  async createCabinet(cabinet: Omit<Cabinet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Cabinet> {
    try {
      // Récupérer l'ID de l'ostéopathe connecté
      const currentOsteopathId = await getCurrentOsteopathId();
      
      if (!currentOsteopathId) {
        console.error("Tentative de création d'un cabinet sans être connecté");
        throw new Error("Non autorisé: vous devez être connecté en tant qu'ostéopathe");
      }
      
      // SÉCURITÉ: Vérifier si le client tente de spécifier un osteopathId différent
      if (cabinet.osteopathId && cabinet.osteopathId !== currentOsteopathId) {
        console.error(`TENTATIVE DE VIOLATION DE SÉCURITÉ: Tentative de création avec osteopathId ${cabinet.osteopathId} différent de l'utilisateur connecté ${currentOsteopathId}`);
      }
      
      // S'assurer que le cabinet est associé à l'ostéopathe connecté
      // Écraser toute tentative de définir un autre osteopathId
      const cabinetWithOsteopath = {
        ...cabinet,
        osteopathId: currentOsteopathId, // Garantir que c'est l'osteopathId de l'utilisateur connecté
      };
      
      console.log(`Création d'un cabinet pour l'ostéopathe ${currentOsteopathId}`);
      
      // Ne jamais envoyer id/timestamps, Postgres gère
      const { id: _omit, createdAt: _createdAt, updatedAt: _updatedAt, ...insertable } = cabinetWithOsteopath as any;
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
      console.error("Erreur lors de la création du cabinet:", error);
      throw error;
    }
  },

  async updateCabinet(id: number, cabinet: Partial<Omit<Cabinet, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Cabinet> {
    try {
      // Vérifier que l'utilisateur est autorisé à modifier ce cabinet
      const currentOsteopathId = await getCurrentOsteopathId();
      
      if (!currentOsteopathId) {
        throw new Error("Non autorisé: vous devez être connecté en tant qu'ostéopathe");
      }
      
      // Vérifier que le cabinet appartient bien à l'ostéopathe connecté
      const existingCabinet = await this.getCabinetById(id);
      
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
    try {
      // Vérifier que l'utilisateur est autorisé à modifier ce cabinet
      const currentOsteopathId = await getCurrentOsteopathId();
      
      if (!currentOsteopathId) {
        throw new Error("Non autorisé: vous devez être connecté en tant qu'ostéopathe");
      }
      
      // Vérifier que le cabinet appartient bien à l'ostéopathe connecté
      const existingCabinet = await this.getCabinetById(cabinetId);
      
      if (!existingCabinet) {
        throw new Error("Cabinet non trouvé ou accès non autorisé");
      }
      
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from("Cabinet")
        .update({ 
          updatedAt: now 
        })
        .eq("id", cabinetId)
        .eq("osteopathId", currentOsteopathId); // Filtrer par ostéopathe connecté
        
      if (error) throw new Error(error.message);
    } catch (error) {
      console.error("Erreur lors de la mise à jour des timestamps:", error);
      throw error;
    }
  },

  async deleteCabinet(id: number): Promise<void> {
    try {
      // Vérifier que l'utilisateur est autorisé à supprimer ce cabinet
      const currentOsteopathId = await getCurrentOsteopathId();
      
      if (!currentOsteopathId) {
        throw new Error("Non autorisé: vous devez être connecté en tant qu'ostéopathe");
      }
      
      // Vérifier que le cabinet appartient bien à l'ostéopathe connecté
      const existingCabinet = await this.getCabinetById(id);
      
      if (!existingCabinet) {
        throw new Error("Cabinet non trouvé ou accès non autorisé");
      }
      
      if (existingCabinet.osteopathId !== currentOsteopathId) {
        console.error(`TENTATIVE DE VIOLATION DE SÉCURITÉ: L'ostéopathe ${currentOsteopathId} tente de supprimer le cabinet ${id} appartenant à l'ostéopathe ${existingCabinet.osteopathId}`);
        throw new Error("Accès non autorisé: ce cabinet n'est pas associé à votre compte");
      }
      
      console.log(`Suppression du cabinet ${id} pour l'ostéopathe ${currentOsteopathId}`);
      
      const { error } = await supabase
        .from("Cabinet")
        .delete()
        .eq("id", id)
        .eq("osteopathId", currentOsteopathId); // Filtrer par ostéopathe connecté
        
      if (error) throw new Error(error.message);
    } catch (error) {
      console.error("Erreur lors de la suppression du cabinet:", error);
      throw error;
    }
  }
};
