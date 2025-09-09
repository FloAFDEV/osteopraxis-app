import { supabase } from '@/integrations/supabase/client';

/**
 * Détermine si un utilisateur est un utilisateur démo
 */
export function isDemoUser(user: any): boolean {
  if (!user) return false;

  // Un utilisateur avec le rôle ADMIN n'est jamais en mode démo
  if (user.role === 'ADMIN' || user.user_metadata?.role === 'ADMIN') {
    return false;
  }

  // Vérifier les indicateurs de démo
  const email = user.email?.toLowerCase();
  const demoIndicators = [
    email?.includes('demo'),
    email?.includes('test'),
    user.id?.includes('demo'),
    user.user_metadata?.demo === true,
    user.user_metadata?.isDemoUser === true,
  ];

  return demoIndicators.some(indicator => indicator === true);
}

/**
 * 🔐 Détection intelligente du mode de session avec priorité à l'authentification réelle
 */
export const isDemoSession = async (): Promise<boolean> => {
  try {
    // 1️⃣ PRIORITÉ ABSOLUE: Vérifier d'abord l'authentification réelle
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: { session } } = await supabase.auth.getSession();
    
    // Si utilisateur vraiment connecté avec un compte réel, jamais en mode démo
    if (session?.user && !isDemoUser(session.user)) {
      console.log('🔐 Utilisateur réellement connecté détecté - Mode connecté forcé');
      
      // Nettoyer toute session démo locale existante pour éviter les conflits
      const { demoLocalStorage } = await import('@/services/demo-local-storage');
      if (demoLocalStorage.isSessionActive()) {
        console.log('🧹 Nettoyage session démo locale (utilisateur réel connecté)');
        demoLocalStorage.clearSession();
      }
      
      return false; // Mode connecté
    }
    
    // 2️⃣ Ensuite vérifier la session locale démo
    const { demoLocalStorage } = await import('@/services/demo-local-storage');
    const hasLocalDemoSession = demoLocalStorage.isSessionActive();
    
    if (hasLocalDemoSession) {
      console.log('🎭 Session démo locale active détectée');
      return true;
    }
    
    // 3️⃣ Vérifier si c'est un utilisateur démo dans Supabase
    if (session?.user && isDemoUser(session.user)) {
      console.log('🎭 Utilisateur démo Supabase détecté - Mode démo actif');
      
      // Créer une session démo locale si elle n'existe pas déjà
      if (!demoLocalStorage.isSessionActive()) {
        demoLocalStorage.createSession();
        demoLocalStorage.seedDemoData();
        console.log('🎭 Session démo locale créée');
      }
      
      return true;
    }
    
    // 4️⃣ Aucune session active - mode connecté par défaut
    console.log('📱 Aucune session démo - Mode connecté');
    return false;
    
  } catch (error) {
    console.error('Erreur lors de la détection de session démo:', error);
    return false; // En cas d'erreur, mode connecté par défaut
  }
};