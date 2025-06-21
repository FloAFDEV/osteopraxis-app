
import { Osteopath } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabaseOsteopathService } from "../supabase-api/osteopath-service";
import { supabase } from '@/integrations/supabase/client';

export const osteopathService = {
  async getOsteopaths(): Promise<Osteopath[]> {
    try {
      return await supabaseOsteopathService.getOsteopaths();
    } catch (error) {
      console.error("Erreur Supabase getOsteopaths:", error);
      throw error; // Propagation de l'erreur au lieu de fallback
    }
  },

  async getOsteopathById(id: number): Promise<Osteopath | undefined> {
    try {
      return await supabaseOsteopathService.getOsteopathById(id);
    } catch (error) {
      console.error("Erreur Supabase getOsteopathById:", error);
      throw error; // Propagation de l'erreur au lieu de fallback
    }
  },
  
  async getOsteopathByUserId(userId: string): Promise<Osteopath | undefined> {
    console.log(`Recherche d'ostéopathe par userId: ${userId}`);
    
    try {
      // Ajout d'un délai court pour s'assurer que l'authentification est établie
      await delay(300);
      
      // Debug log de la session actuelle
      const { data: sessionData, error } = await supabase.auth.getSession();
      if (sessionData && sessionData.session) {
        console.log("Utilisateur authentifié:", sessionData.session.user.id);
        console.log("Token d'accès présent:", !!sessionData.session.access_token);
      } else {
        console.log("Pas de session active:", error || "Aucune erreur");
      }
      
      // Utiliser directement l'API Supabase avec authId
      const result = await supabaseOsteopathService.getOsteopathByUserId(userId);
      if (result) return result;
      
      console.log("Aucun résultat via l'API directe, tentative via la fonction edge");
      
      // En cas d'absence de résultat, essayer via la fonction edge
      try {
        if (!sessionData || !sessionData.session) {
          console.error("Pas de session pour appeler la fonction edge");
          throw new Error("Pas de session active");
        }
        
        console.log("Tentative via la fonction edge completer-profil");
        const response = await fetch("https://jpjuvzpqfirymtjwnier.supabase.co/functions/v1/completer-profil", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionData.session.access_token}`
          },
          body: JSON.stringify({
            osteopathData: {
              name: "À compléter",
              professional_title: "Ostéopathe D.O.",
              ape_code: "8690F"
            }
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Erreur de la fonction edge:", errorText);
          throw new Error(`Erreur de la fonction edge: ${errorText}`);
        }
        
        const result = await response.json();
        console.log("Résultat de la fonction edge:", result);
        
        if (result && result.osteopath) {
          return result.osteopath;
        }
        throw new Error("Résultat invalide de la fonction edge");
      } catch (edgeError) {
        console.error("Erreur lors de l'appel à la fonction edge:", edgeError);
        throw edgeError;
      }
    } catch (error) {
      console.error("Erreur Supabase getOsteopathByUserId:", error);
      throw error;
    }
  },
  
  async updateOsteopath(id: number, data: Partial<Omit<Osteopath, 'id' | 'createdAt'>>): Promise<Osteopath | undefined> {
    try {
      console.log(`Mise à jour de l'ostéopathe avec ID: ${id}`, data);
      
      // S'assurer que nous ne transmettons pas un undefined pour authId qui écraserait la valeur en base  
      if ('authId' in data && data.authId === undefined) {
        delete (data as any).authId; // Supprimer la propriété si elle est undefined pour éviter d'écraser la valeur en base
      }
      
      return await supabaseOsteopathService.updateOsteopath(id, data);
    } catch (error) {
      console.error("Erreur Supabase updateOsteopath:", error);
      throw error;
    }
  },
  
  async createOsteopath(data: Omit<Osteopath, 'id' | 'createdAt' | 'updatedAt'>): Promise<Osteopath> {
    console.log("Création d'un ostéopathe avec les données:", data);
    
    try {
      // Ajout d'un délai court pour garantir que l'auth est bien établie
      await delay(300);
      
      // Vérifier l'état de la session
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("Session avant création:", sessionData.session ? "Authentifié" : "Non authentifié");
      
      // Premier essai: utilisation directe du service Supabase
      try {
        console.log("Tentative de création via API Supabase");
        const result = await supabaseOsteopathService.createOsteopath(data);
        console.log("Création réussie via API Supabase:", result);
        return result;
      } catch (error) {
        console.error("Erreur lors de la création via API Supabase:", error);
        
        // En cas d'échec, essayer via la fonction edge
        if (sessionData && sessionData.session) {
          console.log("Tentative via la fonction edge completer-profil");
          
          try {
            const response = await fetch("https://jpjuvzpqfirymtjwnier.supabase.co/functions/v1/completer-profil", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${sessionData.session.access_token}`
              },
              body: JSON.stringify({
                osteopathData: data
              })
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error("Erreur de la fonction edge:", errorText);
              throw new Error(`Erreur de la fonction edge: ${errorText}`);
            }
            
            const result = await response.json();
            console.log("Résultat de la fonction edge:", result);
            
            if (result && result.osteopath) {
              return result.osteopath;
            } else {
              throw new Error("Réponse de la fonction edge invalide");
            }
          } catch (edgeError) {
            console.error("Erreur lors de l'appel à la fonction edge:", edgeError);
            throw edgeError;
          }
        } else {
          console.error("Pas de session pour appeler la fonction edge");
          throw new Error("Utilisateur non authentifié");
        }
      }
    } catch (error) {
      console.error("Erreur globale createOsteopath:", error);
      throw error; // Propagation de l'erreur sans fallback
    }
  }
};
