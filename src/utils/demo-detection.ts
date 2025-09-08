import { supabase } from '@/integrations/supabase/client';

/**
 * Utilitaire centralisé pour détecter si l'utilisateur est en mode démo
 * Évite les incohérences entre les différents composants
 */
export const isDemoUser = (user: any): boolean => {
  if (!user) return false;
  
  return user.email === 'demo@patienthub.com' || 
         user.email?.startsWith('demo-') ||
         user.id === '999' || // ID factice pour démo
         user.osteopathId === 999 ||
         user.user_metadata?.is_demo === true ||
         user.user_metadata?.is_demo_user === true;
};

/**
 * Détection STRICTE du mode démo - Sécurité renforcée
 * Empêche tout croisement entre démo et données réelles
 */
export const isDemoSession = async (): Promise<boolean> => {
  try {
    // 1️⃣ PRIORITÉ ABSOLUE: Vérifier la session locale démo
    const { demoLocalStorage } = await import('@/services/demo-local-storage');
    const hasLocalDemoSession = demoLocalStorage.isSessionActive();
    
    if (hasLocalDemoSession) {
      console.log('🎭 Session démo locale active détectée');
      return true;
    }
    
    // 2️⃣ Vérifier la session Supabase seulement si pas de session locale
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user && isDemoUser(session.user)) {
      console.log('🎭 Utilisateur démo Supabase détecté, création session locale EXCLUSIVE');
      
      // Créer une session locale ET déconnecter de Supabase pour éviter le croisement
      demoLocalStorage.createSession();
      demoLocalStorage.seedDemoData();
      
      // Déconnexion silencieuse de Supabase pour éviter la contamination
      try {
        await supabase.auth.signOut({ scope: 'local' });
        console.log('🔒 Déconnexion Supabase silencieuse pour mode démo pur');
      } catch (error) {
        console.warn('⚠️ Erreur déconnexion Supabase:', error);
      }
      
      return true;
    }
    
    // 3️⃣ Mode connecté réel
    return false;
  } catch (error) {
    console.error('❌ Erreur détection mode démo:', error);
    // En cas d'erreur, considérer comme NON-démo par sécurité
    return false;
  }
};