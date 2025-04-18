
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { SIMULATE_AUTH } from '../api/config';

// Importer le client depuis le fichier généré
import { supabase as supabaseClient } from '@/integrations/supabase/client';

// Exporter le client avec des options d'authentification renforcées
export const supabase = supabaseClient;

// Type utilitaire pour les données typées
export const typedData = <T>(data: any): T => data as T;

// Fonction utilitaire pour ajouter des en-têtes d'authentification simulés
export const addAuthHeaders = <T extends { setHeader: (name: string, value: string) => T }>(query: T): T => {
  if (SIMULATE_AUTH) {
    console.log("Mode développement: ajout d'en-têtes d'authentification simulés");
    return query.setHeader('X-Development-Mode', 'true');
  }
  return query;
};

// Fonction helper pour vérifier l'état d'authentification avant les opérations
export const checkAuth = async () => {
  console.log("Vérification de l'état d'authentification...");
  
  // Essayer plusieurs fois en cas d'erreur réseau
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    try {
      const { data, error } = await supabase.auth.getSession();
      console.log("Résultat getSession:", data ? "Données reçues" : "Aucune donnée", error ? `Erreur: ${error.message}` : "Pas d'erreur");
      
      if (error) {
        console.error(`Erreur d'authentification (tentative ${attempts + 1}/${maxAttempts}):`, error);
        
        if (attempts < maxAttempts - 1) {
          attempts++;
          // Attendre avant de réessayer
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        
        throw new Error(`Erreur d'authentification: ${error.message}`);
      }
      
      if (!data.session) {
        console.log("Aucune session active trouvée, vérification du token local");
        // Avant d'échouer, essayons de récupérer le token du localStorage
        try {
          const storedAuthState = localStorage.getItem("authState");
          if (storedAuthState) {
            console.log("État d'authentification trouvé dans le localStorage");
            const parsedState = JSON.parse(storedAuthState);
            if (parsedState.token) {
              console.log("Token local disponible. Tentative de réutilisation.");
              
              // Tenter de définir manuellement le token d'accès dans la session Supabase
              const setSessionResult = await supabase.auth.setSession({
                access_token: parsedState.token,
                refresh_token: ""
              });
              console.log("Résultat setSession:", setSessionResult.error ? `Erreur: ${setSessionResult.error.message}` : "Succès");
              
              // Vérifier à nouveau la session
              const { data: refreshedData, error: refreshError } = await supabase.auth.getSession();
              console.log("Après tentative avec token local:", refreshedData?.session ? "Session active" : "Pas de session", refreshError ? `Erreur: ${refreshError.message}` : "Pas d'erreur");
              
              if (!refreshError && refreshedData.session) {
                console.log("Réutilisation du token local réussie, session active:", refreshedData.session.user.id);
                return refreshedData.session;
              } else {
                console.log("Échec de la réutilisation du token local");
              }
            } else {
              console.log("Pas de token dans l'état d'authentification stocké");
            }
          } else {
            console.log("Aucun état d'authentification trouvé dans localStorage");
          }
        } catch (localAuthError) {
          console.error("Erreur lors de la récupération du token local:", localAuthError);
        }
        
        if (SIMULATE_AUTH) {
          console.log("Mode développement: simulation d'une session active");
          return {
            user: { id: 'dev-user-id', email: 'dev@example.com' },
            expires_at: Date.now() + 3600,
          } as any;
        }
        
        console.error("Aucune session active trouvée et impossible de récupérer un token valide");
        throw new Error('Non authentifié');
      }
      
      console.log("Authentification vérifiée, ID utilisateur:", data.session.user.id);
      return data.session;
    } catch (error) {
      if (attempts < maxAttempts - 1) {
        attempts++;
        console.error(`Erreur lors de la vérification d'authentification (tentative ${attempts}/${maxAttempts}):`, error);
        // Attendre avant de réessayer
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        throw error;
      }
    }
  }
  
  // Si on arrive ici, c'est qu'on a épuisé toutes les tentatives
  throw new Error('Impossible de vérifier l\'authentification après plusieurs tentatives');
};

// Récupérer un type enum à partir d'une valeur string
export function getEnumValue<T extends string>(value: string, allowedValues: readonly T[]): T {
  if (allowedValues.includes(value as T)) {
    return value as T;
  }
  throw new Error(`Valeur enum invalide: ${value}. Les valeurs autorisées sont: ${allowedValues.join(', ')}`);
}

// AppointmentStatus enum helper pour mapper entre nos types et ceux de Supabase
// Note: CANCELLED dans notre code doit être CANCELED pour Supabase
export const AppointmentStatusValues = ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'] as const;
export type AppointmentStatusType = typeof AppointmentStatusValues[number];

// Map pour convertir entre notre format et celui de Supabase
export const appointmentStatusMap: Record<string, string> = {
  'CANCELLED': 'CANCELED',  // Mapping pour conversion
  'CANCELED': 'CANCELLED'   // Pour conversion inverse
};

// Contraception enum helper
export const ContraceptionValues = [
  'NONE', 'PILLS', 'PATCH', 'RING', 'IUD', 'IMPLANT', 
  'CONDOM', 'DIAPHRAGM', 'INJECTION', 'NATURAL_METHODS', 'STERILIZATION'
] as const;
export type ContraceptionType = typeof ContraceptionValues[number];

// Fonctions de sécurité pour s'assurer que les valeurs correspondent aux enum de Supabase
export function ensureAppointmentStatus(status: string): string {
  console.log("Validation du statut:", status);
  // Correction spéciale pour CANCELLED -> CANCELED
  if (status === 'CANCELLED') {
    console.log("Correction de CANCELLED à CANCELED pour Supabase");
    return 'CANCELED';
  }
  return status;
}

export function ensureContraception(contraception: string): ContraceptionType {
  // Correction spéciale pour IMPLANTS -> IMPLANT
  if (contraception === 'IMPLANTS') {
    return 'IMPLANT';
  }
  return getEnumValue(contraception, ContraceptionValues);
}
