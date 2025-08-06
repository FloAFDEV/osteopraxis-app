
import { supabase } from "@/integrations/supabase/client";

export async function getCurrentOsteopath() {
  try {
    console.log('🔍 getCurrentOsteopath: Début de la récupération...');
    
    // Récupérer l'utilisateur authentifié
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ getCurrentOsteopath: Erreur d\'authentification:', authError);
      throw authError;
    }

    if (!user) {
      console.error('❌ getCurrentOsteopath: Aucun utilisateur authentifié');
      return null;
    }

    console.log('✅ getCurrentOsteopath: Utilisateur authentifié trouvé:', user.id);

    // Récupérer les informations de l'ostéopathe
    const { data: osteopathData, error: osteopathError } = await supabase
      .from("Osteopath")
      .select("*")
      .eq("authId", user.id)
      .maybeSingle();

    if (osteopathError) {
      console.error('❌ getCurrentOsteopath: Erreur lors de la récupération de l\'ostéopathe:', osteopathError);
      throw osteopathError;
    }

    if (!osteopathData) {
      console.error('❌ getCurrentOsteopath: Aucun ostéopathe trouvé pour l\'utilisateur:', user.id);
      
      // Essayer de créer automatiquement un profil ostéopathe
      const { data: userData, error: userError } = await supabase
        .from("User")
        .select("*")
        .eq("auth_id", user.id)
        .maybeSingle();

      if (userError || !userData) {
        console.error('❌ getCurrentOsteopath: Utilisateur non trouvé dans la table User');
        return null;
      }

      // Créer l'ostéopathe automatiquement
      const { data: newOsteopath, error: createError } = await supabase
        .from("Osteopath")
        .insert({
          name: userData.first_name && userData.last_name 
            ? `${userData.first_name} ${userData.last_name}` 
            : userData.email,
          authId: user.id,
          userId: user.id,
          professional_title: 'Ostéopathe D.O.',
          ape_code: '8690F',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ getCurrentOsteopath: Erreur lors de la création de l\'ostéopathe:', createError);
        throw createError;
      }

      console.log('✅ getCurrentOsteopath: Ostéopathe créé automatiquement:', newOsteopath.id);
      
      // Mettre à jour la table User avec l'osteopathId
      await supabase
        .from("User")
        .update({ osteopathId: newOsteopath.id })
        .eq("id", user.id);

      return newOsteopath;
    }

    console.log('✅ getCurrentOsteopath: Ostéopathe trouvé:', osteopathData.id);
    return osteopathData;
  } catch (error) {
    console.error('❌ getCurrentOsteopath: Erreur globale:', error);
    throw error;
  }
}

export async function getCurrentOsteopathId(): Promise<number | null> {
  try {
    const osteopath = await getCurrentOsteopath();
    return osteopath?.id || null;
  } catch (error) {
    console.error('❌ getCurrentOsteopathId: Erreur:', error);
    return null;
  }
}

// Fonctions de sécurité pour vérifier la propriété des données
export async function isPatientOwnedByCurrentOsteopath(patientId: number): Promise<boolean> {
  try {
    const osteopathId = await getCurrentOsteopathId();
    if (!osteopathId) return false;

    const { data, error } = await supabase
      .from("Patient")
      .select("osteopathId, cabinetId")
      .eq("id", patientId)
      .maybeSingle();

    if (error || !data) return false;

    // Vérifier si le patient appartient directement à l'ostéopathe
    if (data.osteopathId === osteopathId) return true;

    // Vérifier si le patient est dans un cabinet partagé
    if (data.cabinetId) {
      const { data: cabinetData, error: cabinetError } = await supabase
        .from("osteopath_cabinet")
        .select("cabinet_id")
        .eq("osteopath_id", osteopathId)
        .eq("cabinet_id", data.cabinetId)
        .maybeSingle();

      return !cabinetError && !!cabinetData;
    }

    return false;
  } catch (error) {
    console.error('Erreur lors de la vérification de propriété du patient:', error);
    return false;
  }
}

export async function isAppointmentOwnedByCurrentOsteopath(appointmentId: number): Promise<boolean> {
  try {
    const osteopathId = await getCurrentOsteopathId();
    if (!osteopathId) return false;

    const { data, error } = await supabase
      .from("Appointment")
      .select("osteopathId, patientId")
      .eq("id", appointmentId)
      .maybeSingle();

    if (error || !data) return false;

    // Vérifier si le rendez-vous appartient directement à l'ostéopathe
    if (data.osteopathId === osteopathId) return true;

    // Vérifier via le patient
    return await isPatientOwnedByCurrentOsteopath(data.patientId);
  } catch (error) {
    console.error('Erreur lors de la vérification de propriété du rendez-vous:', error);
    return false;
  }
}

export async function isInvoiceOwnedByCurrentOsteopath(invoiceId: number): Promise<boolean> {
  try {
    const osteopathId = await getCurrentOsteopathId();
    if (!osteopathId) return false;

    const { data, error } = await supabase
      .from("Invoice")
      .select("osteopathId, patientId")
      .eq("id", invoiceId)
      .maybeSingle();

    if (error || !data) return false;

    // Vérifier si la facture appartient directement à l'ostéopathe
    if (data.osteopathId === osteopathId) return true;

    // Vérifier via le patient
    return await isPatientOwnedByCurrentOsteopath(data.patientId);
  } catch (error) {
    console.error('Erreur lors de la vérification de propriété de la facture:', error);
    return false;
  }
}
