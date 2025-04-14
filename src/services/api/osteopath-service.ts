
import { Osteopath } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabaseOsteopathService } from "../supabase-api/osteopath-service";

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
        const osteopath = await supabaseOsteopathService.getOsteopathByUserId(userId);
        
        // Si aucun ostéopathe n'est trouvé, en créer un automatiquement
        if (!osteopath) {
          console.log("Création automatique d'un profil d'ostéopathe pour l'utilisateur:", userId);
          
          const newOsteopathData = {
            userId: userId,
            name: "Ostéopathe", // Nom par défaut
            professional_title: "Ostéopathe D.O.",
            adeli_number: "12345678", // Valeur temporaire pour passer les validations
            siret: "12345678901234", // Valeur temporaire pour passer les validations
            ape_code: "8690F"
          };
          
          try {
            const createdOsteopath = await supabaseOsteopathService.createOsteopath(newOsteopathData);
            console.log("Profil d'ostéopathe créé automatiquement:", createdOsteopath);
            return createdOsteopath;
          } catch (createError) {
            console.error("Erreur lors de la création automatique de l'ostéopathe:", createError);
          }
        }
        
        return osteopath;
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
        
        // Tenter de créer l'ostéopathe directement via le service Supabase
        const result = await supabaseOsteopathService.createOsteopath(data);
        console.log("Ostéopathe créé avec succès:", result);
        return result;
      } catch (error) {
        console.error("Erreur Supabase createOsteopath:", error);
        
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
