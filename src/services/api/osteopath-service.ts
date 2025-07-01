
import { Osteopath } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabaseOsteopathService } from "../supabase-api/osteopath-service";
import { supabase } from '@/integrations/supabase/client';
import { osteopathReplacementService } from "../supabase-api/osteopath-replacement-service";

export const osteopathService = {
  // Cette méthode retourne maintenant seulement les ostéopathes autorisés (sécurisé)
  async getOsteopaths(): Promise<Osteopath[]> {
    try {
      // Utiliser le service de remplacement pour obtenir les ostéopathes autorisés
      const authorizedOsteopaths = await osteopathReplacementService.getAuthorizedOsteopaths();
      
      // Convertir AuthorizedOsteopath en Osteopath pour maintenir la compatibilité
      return authorizedOsteopaths.map(authOsteo => ({
        id: authOsteo.id,
        name: authOsteo.name,
        professional_title: authOsteo.professional_title || 'Ostéopathe D.O.',
        rpps_number: authOsteo.rpps_number || '',
        siret: authOsteo.siret || '',
        ape_code: '8690F',
        userId: '', // Ces champs ne sont pas nécessaires pour l'affichage
        authId: '',
        createdAt: '',
        updatedAt: '',
        stampUrl: null
      }));
    } catch (error) {
      console.error("Erreur lors de la récupération des ostéopathes autorisés:", error);
      return []; // Retourner un tableau vide plutôt que de propager l'erreur
    }
  },

  async getOsteopathById(id: number): Promise<Osteopath | undefined> {
    try {
      return await supabaseOsteopathService.getOsteopathById(id);
    } catch (error) {
      console.error("Erreur Supabase getOsteopathById:", error);
      throw error;
    }
  },
  
  async getOsteopathByUserId(userId: string): Promise<Osteopath | undefined> {
    console.log(`Recherche d'ostéopathe par userId: ${userId}`);
    
    try {
      await delay(300);
      
      const { data: sessionData, error } = await supabase.auth.getSession();
      if (sessionData && sessionData.session) {
        console.log("Utilisateur authentifié:", sessionData.session.user.id);
        console.log("Token d'accès présent:", !!sessionData.session.access_token);
      } else {
        console.log("Pas de session active:", error || "Aucune erreur");
      }
      
      const result = await supabaseOsteopathService.getOsteopathByUserId(userId);
      if (result) return result;
      
      console.log("Aucun résultat via l'API directe, tentative via la fonction edge");
      
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
      
      if ('authId' in data && data.authId === undefined) {
        delete (data as any).authId;
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
      await delay(300);
      
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("Session avant création:", sessionData.session ? "Authentifié" : "Non authentifié");
      
      try {
        console.log("Tentative de création via API Supabase");
        const result = await supabaseOsteopathService.createOsteopath(data);
        console.log("Création réussie via API Supabase:", result);
        return result;
      } catch (error) {
        console.error("Erreur lors de la création via API Supabase:", error);
        
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
      throw error;
    }
  },

  async deleteOsteopath(id: number): Promise<boolean> {
    if (USE_SUPABASE) {
      try {
        await supabaseOsteopathService.deleteOsteopath?.(id);
        return true;
      } catch (error) {
        console.error("Erreur Supabase deleteOsteopath:", error);
        throw error;
      }
    }
    
    await delay(300);
    return true;
  }
};
