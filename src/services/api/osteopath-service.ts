/**
 * 👨‍⚕️ Service Ostéopathe - Utilise StorageRouter pour routage automatique
 * 
 * Données Ostéopathe = Non-HDS → Supabase cloud en mode connecté
 * Mode démo → demo-local-storage (sessionStorage éphémère)
 */

import { Osteopath } from "@/types";
import { storageRouter } from '@/services/storage/storage-router';
import { supabaseOsteopathService } from "../supabase-api/osteopath-service";
import { supabase } from '@/integrations/supabase/client';
import { osteopathReplacementService } from "../supabase-api/osteopath-replacement-service";
import { isDemoSession } from '@/utils/demo-detection';

export const osteopathService = {
  async getOsteopaths(): Promise<Osteopath[]> {
    // 🎭 Mode démo : retourner un ostéopathe fictif
    const demoMode = await isDemoSession();
    if (demoMode) {
      const demoCabinetId = localStorage.getItem('demo_cabinet_id');
      if (!demoCabinetId) return [];

      // Charger l'ostéopathe depuis DemoStorage
      const { DemoStorage } = await import('@/services/demo-storage');
      const demoOsteopath = DemoStorage.get<any>(demoCabinetId, 'osteopath');

      if (demoOsteopath) {
        return [{
          id: demoOsteopath.id || demoOsteopath.userId,
          name: demoOsteopath.name || 'Dr. Utilisateur Démo',
          professional_title: demoOsteopath.professional_title || 'Ostéopathe D.O.',
          rpps_number: demoOsteopath.rpps_number || '10001234567',
          siret: demoOsteopath.siret || '12345678900012',
          ape_code: demoOsteopath.ape_code || '8690F',
          userId: demoOsteopath.userId || '',
          authId: demoOsteopath.userId || '',
          plan: 'pro' as const,
          createdAt: demoOsteopath.createdAt || new Date().toISOString(),
          updatedAt: demoOsteopath.updatedAt || new Date().toISOString(),
          stampUrl: null
        }];
      }

      return [];
    }

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
        userId: '',
        authId: '',
        plan: 'full', // Par défaut pour la compatibilité
        createdAt: '',
        updatedAt: '',
        stampUrl: null
      }));
    } catch (error) {
      console.error("Erreur lors de la récupération des ostéopathes:", error);
      return [];
    }
  },

  async getOsteopathById(id: number | string): Promise<Osteopath | undefined> {
    // 🎭 Mode démo : retourner un ostéopathe fictif
    const demoMode = await isDemoSession();
    if (demoMode) {
      const demoCabinetId = localStorage.getItem('demo_cabinet_id');
      if (!demoCabinetId) return undefined;

      // Charger l'ostéopathe depuis DemoStorage
      const { DemoStorage } = await import('@/services/demo-storage');
      const demoOsteopath = DemoStorage.get<any>(demoCabinetId, 'osteopath');

      if (demoOsteopath) {
        return {
          id: demoOsteopath.id || demoOsteopath.userId,
          name: demoOsteopath.name || 'Dr. Utilisateur Démo',
          professional_title: demoOsteopath.professional_title || 'Ostéopathe D.O.',
          rpps_number: demoOsteopath.rpps_number || '10001234567',
          siret: demoOsteopath.siret || '12345678900012',
          ape_code: demoOsteopath.ape_code || '8690F',
          userId: demoOsteopath.userId || '',
          authId: demoOsteopath.userId || '',
          plan: 'pro' as const,
          createdAt: demoOsteopath.createdAt || new Date().toISOString(),
          updatedAt: demoOsteopath.updatedAt || new Date().toISOString(),
          stampUrl: null
        };
      }

      return undefined;
    }

    try {
      return await supabaseOsteopathService.getOsteopathById(id);
    } catch (error) {
      console.error("Erreur getOsteopathById:", error);
      throw error;
    }
  },
  
  async getOsteopathByUserId(userId: string): Promise<Osteopath | undefined> {
    try {
      const { data: sessionData, error } = await supabase.auth.getSession();
      if (sessionData && sessionData.session) {
        console.log("✅ Session active pour recherche ostéopathe");
      } else {
        console.log("❌ Pas de session active:", error || "Aucune erreur");
      }
      
      const result = await supabaseOsteopathService.getOsteopathByUserId(userId);
      if (result) return result;
      
      console.log("🔄 Tentative via fonction edge completer-profil");
      
      try {
        if (!sessionData || !sessionData.session) {
          throw new Error("Pas de session active");
        }
        
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
          throw new Error(`Erreur fonction edge: ${errorText}`);
        }
        
        const result = await response.json();
        console.log("✅ Résultat fonction edge:", result);
        
        if (result && result.osteopath) {
          return result.osteopath;
        }
        throw new Error("Résultat invalide de la fonction edge");
      } catch (edgeError) {
        console.error("❌ Erreur fonction edge:", edgeError);
        throw edgeError;
      }
    } catch (error) {
      console.error("❌ Erreur getOsteopathByUserId:", error);
      throw error;
    }
  },
  
  async updateOsteopath(id: number, data: Partial<Omit<Osteopath, 'id' | 'createdAt'>>): Promise<Osteopath | undefined> {
    try {
      console.log(`🔄 Mise à jour ostéopathe ID: ${id}`, data);
      
      if ('authId' in data && data.authId === undefined) {
        delete (data as any).authId;
      }
      
      return await supabaseOsteopathService.updateOsteopath(id, data);
    } catch (error) {
      console.error("❌ Erreur updateOsteopath:", error);
      throw error;
    }
  },
  
  async createOsteopath(data: Omit<Osteopath, 'id' | 'createdAt' | 'updatedAt'>): Promise<Osteopath> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      try {
        const result = await supabaseOsteopathService.createOsteopath(data);
        console.log("✅ Création réussie via API Supabase:", result);
        return result;
      } catch (error) {
        console.error("❌ Erreur création via API:", error);
        
        if (sessionData && sessionData.session) {
          console.log("🔄 Tentative via fonction edge");
          
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
            throw new Error(`Erreur fonction edge: ${errorText}`);
          }
          
          const result = await response.json();
          console.log("✅ Résultat fonction edge:", result);
          
          if (result && result.osteopath) {
            return result.osteopath;
          } else {
            throw new Error("Réponse fonction edge invalide");
          }
        } else {
          throw new Error("Utilisateur non authentifié");
        }
      }
    } catch (error) {
      console.error("❌ Erreur globale createOsteopath:", error);
      throw error;
    }
  },

  async deleteOsteopath(id: number): Promise<boolean> {
    try {
      return await supabaseOsteopathService.deleteOsteopath(id);
    } catch (error) {
      console.error("❌ Erreur deleteOsteopath:", error);
      throw error;
    }
  }
};