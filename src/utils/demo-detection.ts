import { supabase } from '@/integrations/supabase/client';

/**
 * Détermine si un utilisateur est un utilisateur démo
 */
export function isDemoUser(user: any): boolean {
  if (!user) return false;

  // Un utilisateur avec le rôle ADMIN n'est jamais en mode démo
  if (user.role === 'ADMIN' || user.user_metadata?.role === 'ADMIN') {
    console.log('🔍 isDemoUser - ADMIN détecté, pas démo');
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

  const result = demoIndicators.some(indicator => indicator === true);
  console.log('🔍 isDemoUser - Résultat:', result, {
    email,
    userId: user.id,
    metadata: user.user_metadata
  });

  return result;
}

// ⚡ Cache pour éviter les appels répétitifs et les boucles infinies
let demoSessionCache: { result: boolean; timestamp: number } | null = null;
const CACHE_DURATION = 60000; // 1 minute de cache pour éviter les appels répétés

/**
 * 🔐 Détection intelligente du mode de session avec priorité à l'authentification réelle
 * ⚡ OPTIMISÉ : Cache le résultat pour éviter les boucles infinies
 */
export const isDemoSession = async (): Promise<boolean> => {
  // Vérifier le cache d'abord pour éviter les appels répétitifs
  const now = Date.now();
  if (demoSessionCache && (now - demoSessionCache.timestamp) < CACHE_DURATION) {
    return demoSessionCache.result;
  }

  // ⏱️ TIMEOUT de sécurité : 300ms max pour éviter le blocage
  const timeoutPromise = new Promise<boolean>((resolve) => {
    setTimeout(() => {
      console.warn('⏱️ Timeout détection mode démo (300ms) - Fallback mode connecté');
      resolve(false);
    }, 300);
  });

  const detectionPromise = (async () => {
    try {
    // 1️⃣ PRIORITÉ ABSOLUE: Vérifier d'abord l'authentification réelle
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: { session } } = await supabase.auth.getSession();
    
    console.log('🔍 DEBUG isDemoSession - Session:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
      isDemoUser: session?.user ? isDemoUser(session.user) : null
    });
    
    // Si utilisateur vraiment connecté avec un compte réel, jamais en mode démo
    if (session?.user && !isDemoUser(session.user)) {
      // Log seulement si le cache était différent
      if (!demoSessionCache || demoSessionCache.result !== false) {
        console.log('✅ Utilisateur réellement connecté détecté - Mode connecté forcé');
      }
      
      // Nettoyer toute session démo locale existante pour éviter les conflits
      const { demoLocalStorage } = await import('@/services/demo-local-storage');
      if (demoLocalStorage.isSessionActive()) {
        console.log('🧹 Nettoyage session démo locale (utilisateur réel connecté)');
        demoLocalStorage.clearSession();
      }
      
      const result = false;
      demoSessionCache = { result, timestamp: now };
      return result;
    }
    
    // 2️⃣ Ensuite vérifier la session locale démo
    const { demoLocalStorage } = await import('@/services/demo-local-storage');
    const hasLocalDemoSession = demoLocalStorage.isSessionActive();
    
    if (hasLocalDemoSession) {
      // Log seulement si le cache était différent pour éviter le spam
      if (!demoSessionCache || demoSessionCache.result !== true) {
        console.log('🎭 Session démo locale active détectée - Isolation des données activée');
      }
      const result = true;
      demoSessionCache = { result, timestamp: now };
      return result;
    }
    
    // 3️⃣ Vérifier si c'est un utilisateur démo dans Supabase
    if (session?.user && isDemoUser(session.user)) {
      // Log seulement si ce n'est pas déjà en cache
      if (!demoSessionCache || demoSessionCache.result !== true) {
        console.log('🎭 Utilisateur démo Supabase détecté - Mode démo actif');
      }
      
      // Créer une session démo locale si elle n'existe pas déjà
      if (!demoLocalStorage.isSessionActive()) {
        demoLocalStorage.createSession();
        demoLocalStorage.seedDemoData();
        console.log('🎭 Session démo locale créée');
      }
      
      const result = true;
      demoSessionCache = { result, timestamp: now };
      return result;
    }
    
    // 4️⃣ Aucune session active - mode connecté par défaut
    if (!demoSessionCache || demoSessionCache.result !== false) {
      console.log('📱 Aucune session démo - Mode connecté');
    }
    const result = false;
    demoSessionCache = { result, timestamp: now };
    return result;
    
    } catch (error) {
      console.error('Erreur lors de la détection de session démo:', error);
      return false;
    }
  })();

  // Prendre le premier qui répond (détection ou timeout)
  const result = await Promise.race([detectionPromise, timeoutPromise]);
  demoSessionCache = { result, timestamp: now };
  return result;
};

/**
 * Force le vidage du cache - utile pour les tests ou changements d'état
 */
export const clearDemoSessionCache = (): void => {
  demoSessionCache = null;
};