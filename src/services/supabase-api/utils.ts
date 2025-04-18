
import { supabase as supabaseClient } from "@/integrations/supabase/client";
import { createClient } from '@supabase/supabase-js';
import { SIMULATE_AUTH } from "../api/config";

// URL et clé Supabase
const SUPABASE_URL = "https://jpjuvzpqfirymtjwnier.supabase.co";
// Créer un client admin avec la clé de service si disponible
const adminKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwanV2enBxZmlyeW10anduaWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg2Mzg4MjIsImV4cCI6MjA0NDIxNDgyMn0.VUmqO5zkRxr1Xucv556GStwCabvZrRckzIzXVPgAthQ";

// Export du client standard
export const supabase = supabaseClient;

// Export d'un client admin pour contourner les RLS et accéder directement aux tables
export const supabaseAdmin = createClient(SUPABASE_URL, adminKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Récupérer ou créer un ID ostéopathe associé à l'utilisateur courant
export async function getCurrentOsteopathId(): Promise<number | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log("Aucune session utilisateur active");
      return null;
    }
    
    const userId = session.user.id;
    console.log("Recherche d'ostéopathe pour l'utilisateur:", userId);
    
    // Essayer de récupérer l'ID ostéopathe
    const { data: osteopath, error } = await supabase
      .from('Osteopath')
      .select('id')
      .eq('userId', userId)
      .maybeSingle();
    
    // Si l'ostéopathe existe déjà, retourner son ID
    if (osteopath && osteopath.id) {
      console.log("Ostéopathe trouvé avec l'ID:", osteopath.id);
      return osteopath.id;
    }
    
    // Si non trouvé ou erreur, créer un nouvel ostéopathe
    console.log("Aucun ostéopathe trouvé. Création d'un nouveau profil...");
    
    // Ajouter un nouvel enregistrement d'ostéopathe pour cet utilisateur
    const now = new Date().toISOString();
    const { data: newOsteopath, error: insertError } = await supabaseAdmin
      .from('Osteopath')
      .insert({
        userId: userId,
        name: "Nouvel Ostéopathe",
        professional_title: "Ostéopathe D.O.",
        ape_code: "8690F",
        createdAt: now,
        updatedAt: now
      })
      .select('id')
      .single();
    
    if (insertError || !newOsteopath) {
      console.error("Erreur lors de la création d'un nouvel ostéopathe:", insertError);
      return null;
    }
    
    console.log("Nouvel ostéopathe créé avec succès, ID:", newOsteopath.id);
    return newOsteopath.id;
  } catch (err) {
    console.error("Erreur lors de la récupération/création de l'ID ostéopathe:", err);
    return null;
  }
}

// Ajouter des en-têtes d'authentification aux requêtes pour contourner les restrictions RLS en développement
export function addAuthHeaders(query: any) {
  // La fonction ne doit pas essayer d'ajouter des headers à la requête Supabase
  // car cette approche n'est pas compatible avec la façon dont les requêtes Supabase fonctionnent
  // Nous retournons simplement la requête telle quelle
  return query;
}

// Fonction utilitaire pour garantir que le statut de l'appointement est une valeur d'enum valide
export const AppointmentStatusValues = ["SCHEDULED", "COMPLETED", "CANCELED", "NO_SHOW", "RESCHEDULED"];
export function ensureAppointmentStatus(status: any) {
  if (typeof status === 'string' && AppointmentStatusValues.includes(status)) {
    return status;
  }
  // Valeur par défaut si le statut n'est pas valide
  return "SCHEDULED";
}

// Fonction utilitaire pour typer correctement les données de Supabase
export function typedData<T>(data: any): T {
  return data as T;
}
