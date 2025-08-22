/**
 * Service de gestion des sessions compartimentées avec nettoyage automatique
 */

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { dataCompartmentManager } from './data-compartment-manager';

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

      // Créer le compartiment local
      const compartmentId = dataCompartmentManager.createCompartment({
        sessionId: config.sessionId,
        userId: config.userId,
        timestamp: Date.now(),
        autoCleanup: true,
        cleanupInterval: config.expiresInMinutes || 30
      });

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

    // Marquer les données avec un timestamp de session
    const sessionData = data.map(item => ({
      ...item,
      sessionId: sessionId,
      compartmentId: compartmentId,
      sessionTimestamp: Date.now()
    }));

    dataCompartmentManager.storeData(compartmentId, entityType, sessionData);
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

    return dataCompartmentManager.getData(compartmentId, entityType);
  }

  /**
   * Nettoie une session spécifique
   */
  async cleanupSession(sessionId: string): Promise<void> {
    try {
      console.log(`🧹 Nettoyage session: ${sessionId}`);
      
      const compartmentId = this.activeSessions.get(sessionId);
      if (compartmentId) {
        // Nettoyer le compartiment local
        dataCompartmentManager.cleanupCompartment(compartmentId);
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

      // Nettoyer les compartiments expirés
      dataCompartmentManager.cleanupExpiredCompartments();

      // Appeler l'edge function de nettoyage
      const { data, error } = await supabase.functions.invoke('demo-cleanup');
      
      if (error) {
        console.error('❌ Erreur edge function cleanup:', error);
      } else {
        console.log('✅ Nettoyage edge function terminé:', data);
      }

      // Nettoyer les sessions locales orphelines
      const expiredSessions = Array.from(this.activeSessions.entries()).filter(([sessionId]) => {
        return !dataCompartmentManager.getData(this.activeSessions.get(sessionId)!, 'sessions').length;
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
    const compartmentStats = dataCompartmentManager.getStats();
    
    return {
      activeSessions: this.activeSessions.size,
      totalCompartments: compartmentStats.totalCompartments,
      dataItemsTotal: compartmentStats.totalDataItems
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