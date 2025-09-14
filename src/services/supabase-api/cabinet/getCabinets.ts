
import { Cabinet } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export async function getCabinets(): Promise<Cabinet[]> {
  try {
    console.log('🔍 [getCabinets] Début récupération cabinets...');
    
    // Récupérer le token d'authentification
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.warn("❌ [getCabinets] Aucune session active");
      
      // Fallback avec cabinet par défaut en cas d'absence de session
      const defaultCabinet: Cabinet = {
        id: 999998,
        name: 'Cabinet Par Défaut',
        address: 'Veuillez vous connecter pour accéder à vos cabinets',
        city: '',
        postalCode: '',
        country: 'France',
        phone: '',
        email: '',
        siret: '',
        iban: null,
        bic: null,
        osteopathId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log('🆘 [getCabinets] Fallback: cabinet par défaut sans session:', defaultCabinet);
      return [defaultCabinet];
    }

    console.log('✅ [getCabinets] Session active trouvée');

    // Appeler la fonction Edge sécurisée
    const response = await fetch(`https://jpjuvzpqfirymtjwnier.supabase.co/functions/v1/cabinet`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    console.log(`📡 [getCabinets] Réponse Edge Function: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erreur de parsing JSON' }));
      const errorMessage = errorData.error || `Erreur HTTP ${response.status}`;
      console.error('❌ [getCabinets] Erreur Edge Function:', errorMessage);
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    const cabinets = responseData.data || [];
    
    console.log(`✅ [getCabinets] Succès: ${cabinets.length} cabinet(s) récupéré(s)`);
    return cabinets;
  } catch (error) {
    console.error("❌ [getCabinets] Erreur finale:", error);
    
    // Fallback robuste avec cabinet d'urgence 
    const emergencyCabinet: Cabinet = {
      id: 999997,
      name: 'Cabinet d\'Urgence',
      address: 'Erreur de chargement - Veuillez réessayer',
      city: '',
      postalCode: '',
      country: 'France',
      phone: '',
      email: '',
      siret: '',
      iban: null,
      bic: null,
      osteopathId: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('🚨 [getCabinets] Fallback final: cabinet d\'urgence:', emergencyCabinet);
    return [emergencyCabinet];
  }
}
