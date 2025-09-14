
import { Cabinet } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export async function getCabinets(): Promise<Cabinet[]> {
  console.log('🔍 [getCabinets] === DÉBUT ===');
  try {
    console.log('🔍 [getCabinets] Début récupération cabinets via client Supabase...');
    
    const { data: cabinets, error } = await supabase
      .from('Cabinet')
      .select('*')
      .order('name');

    if (error) {
      console.error('❌ [getCabinets] Erreur Supabase:', error);
      throw error;
    }

    // Transformer les données Supabase vers le type Cabinet
    const formattedCabinets: Cabinet[] = (cabinets || []).map(cabinet => ({
      id: cabinet.id,
      name: cabinet.name,
      address: cabinet.address || '',
      city: '', // TODO: ajouter city dans la table si nécessaire
      postalCode: '', // TODO: ajouter postalCode dans la table si nécessaire
      country: 'France',
      phone: cabinet.phone || '',
      email: cabinet.email || '',
      siret: '', // TODO: ajouter siret dans la table si nécessaire
      iban: null, // TODO: ajouter iban dans la table si nécessaire
      bic: null, // TODO: ajouter bic dans la table si nécessaire
      osteopathId: cabinet.osteopathId,
      createdAt: cabinet.createdAt,
      updatedAt: cabinet.updatedAt
    }));

    console.log(`✅ [getCabinets] Succès: ${formattedCabinets.length} cabinet(s) récupéré(s)`);
    return formattedCabinets;
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
