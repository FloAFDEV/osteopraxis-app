import { delay, USE_SUPABASE } from "./config";

export const demoCurrentOsteopathService = {
  async getCurrentOsteopathId(): Promise<number | null> {
    // Vérifier d'abord le mode démo éphémère local
    const { isDemoSession } = await import('@/utils/demo-detection');
    const isDemoMode = await isDemoSession();
    
    if (isDemoMode) {
      console.log('🎭 Mode démo: Retour osteopathId factice');
      // Mode démo éphémère: retourner un ID factice
      await delay(50);
      return 999; // ID factice pour le mode démo
    }

    // Mode connecté: utiliser Supabase
    if (USE_SUPABASE) {
      const { getCurrentOsteopathId } = await import("../supabase-api/utils/getCurrentOsteopath");
      return await getCurrentOsteopathId();
    }

    return null;
  },

  async isPatientOwnedByCurrentOsteopath(patientId: number): Promise<boolean> {
    // Vérifier d'abord le mode démo éphémère local
    const { isDemoSession } = await import('@/utils/demo-detection');
    const isDemoMode = await isDemoSession();
    
    if (isDemoMode) {
      console.log('🎭 Mode démo: Autorisation automatique pour patient');
      // Mode démo éphémère: autoriser tout
      await delay(50);
      return true;
    }

    // Mode connecté: utiliser Supabase
    if (USE_SUPABASE) {
      const { isPatientOwnedByCurrentOsteopath } = await import("../supabase-api/utils/getCurrentOsteopath");
      return await isPatientOwnedByCurrentOsteopath(patientId);
    }

    return false;
  },
};