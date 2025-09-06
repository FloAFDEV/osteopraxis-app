/**
 * 🔀 Routeur de stockage simple
 * 
 * Choisit entre Supabase et LocalHDS selon la nature des données
 * - Mode démo : Tout vers Supabase éphémère
 * - Mode connecté : HDS vers Local, autres vers Supabase
 */

// Types
export type StorageDestination = 'supabase' | 'local-hds';

export interface StorageDecision {
  destination: StorageDestination;
  reason: string;
}

/**
 * Détermine si on est en mode démo
 */
function isDemoMode(): boolean {
  return localStorage.getItem('isTemporaryDemo') === 'true' || 
         sessionStorage.getItem('isDemoMode') === 'true';
}

/**
 * Détermine si on est en mode connecté (pas démo)
 */
export function isConnectedMode(): boolean {
  return !isDemoMode();
}

/**
 * Routeur principal : décide où stocker selon l'entité et le mode
 */
export class StorageRouter {
  
  /**
   * Entités HDS sensibles qui doivent être en local en mode connecté
   */
  private static readonly HDS_ENTITIES = ['patients', 'appointments', 'invoices'];
  
  /**
   * Entités non-HDS qui restent toujours en Supabase
   */
  private static readonly CLOUD_ENTITIES = ['users', 'osteopaths', 'cabinets', 'quotes'];

  /**
   * Décide où stocker une entité
   */
  static route(entityName: string): StorageDecision {
    // Mode démo : TOUT vers Supabase éphémère
    if (isDemoMode()) {
      return {
        destination: 'supabase',
        reason: 'Mode démo - Stockage éphémère Supabase'
      };
    }

    // Mode connecté : Router selon la nature HDS
    if (this.HDS_ENTITIES.includes(entityName)) {
      return {
        destination: 'local-hds',
        reason: 'Données HDS sensibles - Stockage local obligatoire'
      };
    }

    if (this.CLOUD_ENTITIES.includes(entityName)) {
      return {
        destination: 'supabase',
        reason: 'Données non-HDS - Stockage Supabase'
      };
    }

    // Par défaut, les nouvelles entités vont vers Supabase
    return {
      destination: 'supabase',
      reason: 'Entité non classifiée - Stockage Supabase par défaut'
    };
  }

  /**
   * Vérifie si une entité doit être en local
   */
  static shouldUseLocal(entityName: string): boolean {
    const decision = this.route(entityName);
    return decision.destination === 'local-hds';
  }

  /**
   * Vérifie si une entité doit être en Supabase
   */
  static shouldUseSupabase(entityName: string): boolean {
    const decision = this.route(entityName);
    return decision.destination === 'supabase';
  }

  /**
   * Diagnostic du routage
   */
  static diagnose(): {
    mode: 'demo' | 'connected';
    routing: Record<string, StorageDecision>;
  } {
    const allEntities = [...this.HDS_ENTITIES, ...this.CLOUD_ENTITIES];
    const routing: Record<string, StorageDecision> = {};
    
    for (const entity of allEntities) {
      routing[entity] = this.route(entity);
    }

    return {
      mode: isDemoMode() ? 'demo' : 'connected',
      routing
    };
  }
}

/**
 * Utilitaires d'export
 */
export { StorageRouter as default };
export const routeStorage = StorageRouter.route.bind(StorageRouter);
export const shouldUseLocal = StorageRouter.shouldUseLocal.bind(StorageRouter);
export const shouldUseSupabase = StorageRouter.shouldUseSupabase.bind(StorageRouter);