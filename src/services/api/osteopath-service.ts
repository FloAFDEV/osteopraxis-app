
import { Osteopath } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabaseOsteopathService } from "../supabase-api/osteopath-service";
import { supabase } from '@/integrations/supabase/client';

// Données simulées pour les ostéopathes
const osteopaths: Osteopath[] = [
  {
    id: 1,
    userId: "d79c31bc-b1fa-42a2-bbd8-379f03f0d8e9",
    createdAt: "2024-12-20 22:29:30",
    name: "Franck BLANCHET",
    updatedAt: "2024-12-20 22:29:45",
    professional_title: "Ostéopathe D.O.",
    adeli_number: null,
    siret: null,
    ape_code: "8690F"
  }
];

export const osteopathService = {
  async getOsteopaths(): Promise<Osteopath[]> {
    if (USE_SUPABASE) {
      try {
        return await supabaseOsteopathService.getOsteopaths();
      } catch (error) {
        console.error("Erreur Supabase getOsteopaths:", error);
      }
    }
    
    // Fallback: code simulé existant
    await delay(200);
    return [...osteopaths];
  },

  async getOsteopathById(id: number): Promise<Osteopath | undefined> {
    if (USE_SUPABASE) {
      try {
        return await supabaseOsteopathService.getOsteopathById(id);
      } catch (error) {
        console.error("Erreur Supabase getOsteopathById:", error);
      }
    }
    
    // Fallback: code simulé existant
    await delay(200);
    return osteopaths.find(osteopath => osteopath.id === id);
  },
  
  async getOsteopathByUserId(userId: string): Promise<Osteopath | undefined> {
    console.log(`Recherche d'ostéopathe par userId: ${userId}`);
    
    if (USE_SUPABASE) {
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
        
        // Première tentative via l'API directe
        const result = await supabaseOsteopathService.getOsteopathByUserId(userId);
        if (result) return result;
        
        console.log("Aucun résultat via l'API directe, tentative via la fonction edge");
        
        // En cas d'absence de résultat, essayer via la fonction edge
        try {
          if (!sessionData || !sessionData.session) {
            console.error("Pas de session pour appeler la fonction edge");
            return undefined;
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
            return undefined;
          }
          
          const result = await response.json();
          console.log("Résultat de la fonction edge:", result);
          
          if (result && result.osteopath) {
            return result.osteopath;
          }
        } catch (edgeError) {
          console.error("Erreur lors de l'appel à la fonction edge:", edgeError);
        }
      } catch (error) {
        console.error("Erreur Supabase getOsteopathByUserId:", error);
      }
    }
    
    // Fallback: code simulé existant
    await delay(200);
    return osteopaths.find(osteopath => osteopath.userId === userId);
  },
  
  async updateOsteopath(id: number, data: Partial<Omit<Osteopath, 'id' | 'createdAt'>>): Promise<Osteopath | undefined> {
    if (USE_SUPABASE) {
      try {
        return await supabaseOsteopathService.updateOsteopath(id, data);
      } catch (error) {
        console.error("Erreur Supabase updateOsteopath:", error);
        throw error;
      }
    }
    
    // Fallback: code simulé existant
    await delay(200);
    const index = osteopaths.findIndex(o => o.id === id);
    if (index !== -1) {
      osteopaths[index] = { 
        ...osteopaths[index], 
        ...data,
        updatedAt: new Date().toISOString() 
      };
      return osteopaths[index];
    }
    return undefined;
  },
  
  async createOsteopath(data: Omit<Osteopath, 'id' | 'createdAt' | 'updatedAt'>): Promise<Osteopath> {
    console.log("Création d'un ostéopathe avec les données:", data);
    
    if (USE_SUPABASE) {
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
        
        // Fallback au code simulé en cas d'erreur
        console.log("Utilisation du mode simulation pour créer l'ostéopathe");
        const newOsteopath = {
          ...data,
          id: osteopaths.length + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as Osteopath;
        
        osteopaths.push(newOsteopath);
        return newOsteopath;
      }
    }
    
    // Fallback: code simulé existant
    await delay(200);
    const newOsteopath = {
      ...data,
      id: osteopaths.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Osteopath;
    
    osteopaths.push(newOsteopath);
    return newOsteopath;
  }
};
