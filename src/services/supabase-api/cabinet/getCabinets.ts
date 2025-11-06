
import { Cabinet } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export async function getCabinets(): Promise<Cabinet[]> {
  console.log('🔍 [getCabinets] === DÉBUT ===');
  try {
    console.log('🔍 [getCabinets] Début récupération cabinets multi-tenant...');
    
    // Récupérer l'utilisateur connecté
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Utilisateur non authentifié:', authError);
      throw new Error('Utilisateur non authentifié');
    }
    
    console.log('👤 Utilisateur connecté:', { id: user.id, email: user.email });
    
    // Récupérer l'ostéopathe correspondant
    const { data: osteopathData, error: osteoError } = await supabase
      .from('Osteopath')
      .select('id')
      .eq('authId', user.id)
      .single();
    
    if (osteoError) {
      console.error('❌ Ostéopathe non trouvé:', osteoError);
      throw new Error('Profil ostéopathe non trouvé');
    }
    
    const osteopathId = osteopathData.id;
    console.log('🩺 Ostéopathe ID:', osteopathId);
    
    // Récupérer d'abord les associations cabinet-ostéopathe
    const { data: associations, error: assocError } = await supabase
      .from('osteopath_cabinet')
      .select('cabinet_id')
      .eq('osteopath_id', osteopathId);
    
    if (assocError) {
      console.warn('⚠️ Erreur récupération associations:', assocError);
    }
    
    const associatedCabinetIds = associations?.map(a => a.cabinet_id) || [];
    console.log('🔗 Cabinets associés:', associatedCabinetIds);
    
    // Construire la requête pour récupérer les cabinets (propriétaire OU associé)
    let query = supabase
      .from('Cabinet')
      .select('*');
    
    if (associatedCabinetIds.length > 0) {
      // Cabinets dont il est propriétaire OU auxquels il est associé
      query = query.or(`osteopathId.eq.${osteopathId},id.in.(${associatedCabinetIds.join(',')})`);
    } else {
      // Seulement les cabinets dont il est propriétaire
      query = query.eq('osteopathId', osteopathId);
    }
    
    const { data: cabinets, error } = await query.order('name');

    if (error) {
      console.error('❌ [getCabinets] Erreur Supabase:', error);
      throw error;
    }

    // Transformer les données Supabase vers le type Cabinet
    const formattedCabinets: Cabinet[] = (cabinets || []).map(cabinet => ({
      id: cabinet.id,
      name: cabinet.name,
      address: cabinet.address || '',
      city: cabinet.city || '',
      postalCode: cabinet.postalCode || '',
      country: cabinet.country || 'France',
      phone: cabinet.phone || '',
      email: cabinet.email || '',
      siret: cabinet.siret || '',
      iban: cabinet.iban || null,
      bic: cabinet.bic || null,
      osteopathId: cabinet.osteopathId,
      createdAt: cabinet.createdAt,
      updatedAt: cabinet.updatedAt
    }));

    console.log(`✅ [getCabinets] Succès multi-tenant: ${formattedCabinets.length} cabinet(s) récupéré(s) pour ostéopathe ${osteopathId}`);
    return formattedCabinets;
  } catch (error) {
    console.error("❌ [getCabinets] Erreur finale:", error);
    
    // Pour les erreurs d'authentification, retourner un tableau vide
    if (error instanceof Error && (
      error.message.includes('non authentifié') || 
      error.message.includes('not authenticated') ||
      error.message.includes('JWT')
    )) {
      console.log('🔒 Problème d\'authentification - Retour tableau vide');
      return [];
    }
    
    throw error; // Propager les autres erreurs
  }
}
