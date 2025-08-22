/**
 * Service de gestion des sessions compartimentées avec nettoyage automatique
 */

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DemoSessionConfig {
  userId: string;
  sessionId: string;
  dataTypes: string[];
  expiresInMinutes?: number;
}

class CompartmentedSessionManager {
  private static instance: CompartmentedSessionManager;
  private activeSessions: Map<string, string> = new Map(); // sessionId -> compartmentId
  private cleanupInterval?: NodeJS.Timeout;

  static getInstance(): CompartmentedSessionManager {
    if (!CompartmentedSessionManager.instance) {
      CompartmentedSessionManager.instance = new CompartmentedSessionManager();
    }
    return CompartmentedSessionManager.instance;
  }

  /**
   * Crée une nouvelle session de démonstration compartimentée
   */
  async createDemoSession(config: DemoSessionConfig): Promise<string> {
    try {
      console.log('🗂️ Création session compartimentée:', config);
      
      // Créer la session en base de données
      const { data: sessionData, error } = await supabase
        .from('demo_sessions')
        .insert({
          session_id: config.sessionId,
          user_id: config.userId,
          data_types: config.dataTypes,
          expires_at: new Date(Date.now() + (config.expiresInMinutes || 30) * 60 * 1000).toISOString(),
          is_demo: true
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur création session DB:', error);
        throw error;
      }

      // Créer le compartiment local simplifié
      const compartmentId = `compartment_${config.sessionId}`;

      // Associer session et compartiment
      this.activeSessions.set(config.sessionId, compartmentId);

      // Marquer les données avec la session
      this.markDataWithSession(config.sessionId, config.dataTypes);

      console.log(`✅ Session compartimentée créée: ${config.sessionId} -> ${compartmentId}`);
      return sessionData.id;

    } catch (error) {
      console.error('❌ Erreur création session compartimentée:', error);
      throw error;
    }
  }

  /**
   * Stocke des données dans le compartiment de la session
   */
  storeSessionData(sessionId: string, entityType: string, data: any[]): void {
    const compartmentId = this.activeSessions.get(sessionId);
    if (!compartmentId) {
      console.warn(`⚠️ Session non trouvée: ${sessionId}`);
      return;
    }

    // Marquer les données avec un timestamp de session et les stocker dans localStorage
    const sessionData = data.map(item => ({
      ...item,
      sessionId: sessionId,
      compartmentId: compartmentId,
      sessionTimestamp: Date.now()
    }));

    // Stocker simplement dans localStorage pour cette implémentation
    localStorage.setItem(`${compartmentId}_${entityType}`, JSON.stringify(sessionData));
    console.log(`📦 Données stockées pour session ${sessionId}: ${entityType} (${data.length} éléments)`);
  }

  /**
   * Récupère les données d'une session
   */
  getSessionData(sessionId: string, entityType: string): any[] {
    const compartmentId = this.activeSessions.get(sessionId);
    if (!compartmentId) {
      console.warn(`⚠️ Session non trouvée: ${sessionId}`);
      return [];
    }

    const data = localStorage.getItem(`${compartmentId}_${entityType}`);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Nettoie une session spécifique
   */
  async cleanupSession(sessionId: string): Promise<void> {
    try {
      console.log(`🧹 Nettoyage session: ${sessionId}`);
      
      const compartmentId = this.activeSessions.get(sessionId);
      if (compartmentId) {
        // Nettoyer les données localStorage de ce compartiment
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith(compartmentId)) {
            localStorage.removeItem(key);
          }
        });
        this.activeSessions.delete(sessionId);
      }

      // Marquer la session comme nettoyée en base
      const { error } = await supabase
        .from('demo_sessions')
        .update({ cleaned_up_at: new Date().toISOString() })
        .eq('session_id', sessionId);

      if (error) {
        console.error('❌ Erreur mise à jour session DB:', error);
      }

      console.log(`✅ Session ${sessionId} nettoyée`);

    } catch (error) {
      console.error(`❌ Erreur nettoyage session ${sessionId}:`, error);
    }
  }

  /**
   * Démarre le nettoyage automatique périodique
   */
  startAutomaticCleanup(): void {
    if (this.cleanupInterval) {
      return; // Déjà démarré
    }

    console.log('🔄 Démarrage du nettoyage automatique des sessions...');
    
    // Nettoyer toutes les 10 minutes
    this.cleanupInterval = setInterval(async () => {
      await this.performPeriodicCleanup();
    }, 10 * 60 * 1000);

    // Nettoyer aussi au démarrage
    setTimeout(() => this.performPeriodicCleanup(), 1000);
  }

  /**
   * Effectue un nettoyage périodique
   */
  private async performPeriodicCleanup(): Promise<void> {
    try {
      console.log('🧹 Nettoyage périodique des sessions...');

      // Appeler l'edge function de nettoyage
      const { data, error } = await supabase.functions.invoke('demo-cleanup');
      
      if (error) {
        console.error('❌ Erreur edge function cleanup:', error);
      } else {
        console.log('✅ Nettoyage edge function terminé:', data);
      }

      // Nettoyer les sessions locales orphelines (simplifié)
      const expiredSessions = Array.from(this.activeSessions.entries()).filter(([sessionId]) => {
        const compartmentId = this.activeSessions.get(sessionId);
        if (!compartmentId) return true;
        
        // Vérifier si des données existent encore pour ce compartiment
        const keys = Object.keys(localStorage);
        return !keys.some(key => key.startsWith(compartmentId));
      });

      for (const [sessionId] of expiredSessions) {
        this.activeSessions.delete(sessionId);
        console.log(`🗑️ Session locale orpheline supprimée: ${sessionId}`);
      }

    } catch (error) {
      console.error('❌ Erreur nettoyage périodique:', error);
    }
  }

  /**
   * Marque les données avec l'ID de session pour le traçage
   */
  private markDataWithSession(sessionId: string, dataTypes: string[]): void {
    const sessionMarker = {
      sessionId,
      createdAt: Date.now(),
      dataTypes
    };

    // Stocker le marqueur de session dans localStorage pour traçabilité
    localStorage.setItem(`demo-session-${sessionId}`, JSON.stringify(sessionMarker));
  }

  /**
   * Obtient les statistiques des sessions actives
   */
  getSessionStats(): {
    activeSessions: number;
    totalCompartments: number;
    dataItemsTotal: number;
  } {
    // Calculer approximativement le nombre d'éléments
    let totalDataItems = 0;
    this.activeSessions.forEach((compartmentId) => {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(compartmentId)) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '[]');
            totalDataItems += Array.isArray(data) ? data.length : 1;
          } catch {
            totalDataItems += 1;
          }
        }
      });
    });
    
    return {
      activeSessions: this.activeSessions.size,
      totalCompartments: this.activeSessions.size,
      dataItemsTotal: totalDataItems
    };
  }

  /**
   * Arrête le nettoyage automatique
   */
  stopAutomaticCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
      console.log('⏹️ Nettoyage automatique arrêté');
    }
  }
}

// Export de l'instance singleton
export const compartmentedSessionManager = CompartmentedSessionManager.getInstance();