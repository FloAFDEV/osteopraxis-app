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
 * Détection du mode démo via la session locale
 */
export const isDemoSession = async (): Promise<boolean> => {
  try {
    // Vérifier d'abord la session Supabase pour les anciennes sessions démo
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user && isDemoUser(session.user)) {
      return true;
    }
    
    // Vérifier la session locale éphémère
    const { demoLocalStorage } = await import('@/services/demo-local-storage');
    return demoLocalStorage.isSessionActive();
  } catch (error) {
    console.error('Error checking demo session:', error);
    return false;
  }
};