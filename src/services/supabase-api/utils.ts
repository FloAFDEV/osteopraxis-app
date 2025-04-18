
import { createClient } from '@supabase/supabase-js';
import { AppointmentStatus } from '@/types';

// URL et clé API de Supabase
const SUPABASE_URL = 'https://jpjuvzpqfirymtjwnier.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwanV2enBxZmlyeW10anduaWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg2Mzg4MjIsImV4cCI6MjA0NDIxNDgyMn0.VUmqO5zkRxr1Xucv556GStwCabvZrRckzIzXVPgAthQ';

// Création du client Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Client Supabase avec accès administrateur pour les opérations spéciales
// NOTE: cette clé devrait être gérée de manière sécurisée, idéalement via des variables d'environnement
export const supabaseAdmin = createClient(
  SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || SUPABASE_KEY
);

// Fonction d'aide pour typer correctement les données
export function typedData<T>(data: any): T {
  return data as T;
}

// Fonction utilitaire pour récupérer l'ID du profil professionnel de l'utilisateur actuellement connecté
export async function getCurrentProfileId(): Promise<number | null> {
  try {
    // Vérifier l'authentification
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      console.log("Pas de session utilisateur active");
      return null;
    }
    
    const userId = sessionData.session.user.id;
    
    // Récupérer l'utilisateur depuis la table User
    const { data: userData, error: userError } = await supabase
      .from("User")
      .select("professionalProfileId")
      .eq("id", userId)
      .single();
      
    if (userError || !userData?.professionalProfileId) {
      console.log("Pas de professionalProfileId trouvé pour l'utilisateur", userId);
      
      // Essayer de trouver directement le profil associé
      const { data: profileData } = await supabase
        .from("ProfessionalProfile")
        .select("id")
        .eq("userId", userId)
        .maybeSingle();
        
      if (profileData?.id) {
        console.log("Profil trouvé directement:", profileData.id);
        return profileData.id;
      }
      
      return null;
    }
    
    return userData.professionalProfileId;
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    return null;
  }
}

// Pour compatibilité avec le code existant
export const getCurrentOsteopathId = getCurrentProfileId;

// Ajouter cette fonction pour gérer l'authentification dans les requêtes
export function addAuthHeaders<T extends any>(query: T): T {
  return query;
}

// Liste des valeurs valides pour AppointmentStatus
export const AppointmentStatusValues = ['PLANNED', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] as const;

// Fonction pour s'assurer que le statut est valide
export function ensureAppointmentStatus(status: any): AppointmentStatus {
  if (typeof status === 'string' && AppointmentStatusValues.includes(status as AppointmentStatus)) {
    return status as AppointmentStatus;
  }
  return 'PLANNED'; // Valeur par défaut
}
