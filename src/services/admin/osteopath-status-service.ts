/**
 * Service de gestion du statut des ostéopathes
 * Gère le cycle de vie : demo → active → blocked
 *
 * IMPORTANT: Seuls les ADMIN peuvent modifier les statuts
 */

import { supabase } from '@/integrations/supabase/client';
import { Osteopath, OsteopathStatus, OsteopathStatusHistory } from '@/types';

// ===========================================================================
// Types pour l'administration
// ===========================================================================

export interface OsteopathWithStatus extends Osteopath {
  daysInDemo?: number;
  canActivate: boolean;
}

export interface OsteopathStatusStats {
  status: OsteopathStatus;
  count: number;
  avg_days_in_demo: number | null;
}

export interface ActivateOsteopathParams {
  osteopathId: number;
  reason?: string;
}

export interface BlockOsteopathParams {
  osteopathId: number;
  reason: string;
}

// ===========================================================================
// Service Admin - Gestion des statuts
// ===========================================================================

class OsteopathStatusService {
  /**
   * Récupérer tous les ostéopathes avec leurs statuts (ADMIN uniquement)
   */
  async getAllOsteopathsWithStatus(): Promise<OsteopathWithStatus[]> {
    const { data, error } = await supabase
      .from('Osteopath')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur récupération ostéopathes:', error);
      throw new Error(`Impossible de récupérer les ostéopathes: ${error.message}`);
    }

    // Calculer les jours en démo pour chaque ostéopathe
    const osteopathsWithExtra: OsteopathWithStatus[] = (data || []).map(osteo => {
      const demoStarted = new Date(osteo.demo_started_at);
      const now = new Date();
      const daysInDemo = Math.floor((now.getTime() - demoStarted.getTime()) / (1000 * 60 * 60 * 24));

      return {
        ...osteo,
        daysInDemo,
        canActivate: osteo.status === 'demo',
      };
    });

    return osteopathsWithExtra;
  }

  /**
   * Récupérer un ostéopathe par ID avec son statut
   */
  async getOsteopathById(osteopathId: number): Promise<OsteopathWithStatus | null> {
    const { data, error } = await supabase
      .from('Osteopath')
      .select('*')
      .eq('id', osteopathId)
      .single();

    if (error) {
      console.error(`Erreur récupération ostéopathe ${osteopathId}:`, error);
      return null;
    }

    if (!data) return null;

    const demoStarted = new Date(data.demo_started_at);
    const now = new Date();
    const daysInDemo = Math.floor((now.getTime() - demoStarted.getTime()) / (1000 * 60 * 60 * 24));

    return {
      ...data,
      daysInDemo,
      canActivate: data.status === 'demo',
    };
  }

  /**
   * Récupérer les statistiques des statuts (ADMIN uniquement)
   */
  async getStatusStats(): Promise<OsteopathStatusStats[]> {
    const { data, error } = await supabase
      .rpc('osteopath_status_stats');

    if (error) {
      console.error('Erreur récupération stats statuts:', error);
      throw new Error(`Impossible de récupérer les statistiques: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Activer un ostéopathe (passage de demo à active)
   * ADMIN uniquement
   */
  async activateOsteopath(params: ActivateOsteopathParams): Promise<boolean> {
    const { osteopathId, reason } = params;

    // Appeler la fonction SQL qui gère l'activation
    const { data, error } = await supabase
      .rpc('activate_osteopath', {
        p_osteopath_id: osteopathId,
        p_reason: reason || null,
      });

    if (error) {
      console.error(`Erreur activation ostéopathe ${osteopathId}:`, error);
      throw new Error(`Impossible d'activer l'ostéopathe: ${error.message}`);
    }

    return data === true;
  }

  /**
   * Bloquer un ostéopathe
   * ADMIN uniquement
   */
  async blockOsteopath(params: BlockOsteopathParams): Promise<boolean> {
    const { osteopathId, reason } = params;

    // Appeler la fonction SQL qui gère le blocage
    const { data, error } = await supabase
      .rpc('block_osteopath', {
        p_osteopath_id: osteopathId,
        p_reason: reason,
      });

    if (error) {
      console.error(`Erreur blocage ostéopathe ${osteopathId}:`, error);
      throw new Error(`Impossible de bloquer l'ostéopathe: ${error.message}`);
    }

    return data === true;
  }

  /**
   * Débloquer un ostéopathe (passage de blocked à demo)
   * ADMIN uniquement
   */
  async unblockOsteopath(osteopathId: number): Promise<boolean> {
    const { data, error } = await supabase
      .from('Osteopath')
      .update({
        status: 'demo',
        blocked_at: null,
        blocked_reason: null,
      })
      .eq('id', osteopathId)
      .select()
      .single();

    if (error) {
      console.error(`Erreur déblocage ostéopathe ${osteopathId}:`, error);
      throw new Error(`Impossible de débloquer l'ostéopathe: ${error.message}`);
    }

    return !!data;
  }

  /**
   * Récupérer l'historique des changements de statut d'un ostéopathe
   * ADMIN uniquement
   */
  async getStatusHistory(osteopathId: number): Promise<OsteopathStatusHistory[]> {
    const { data, error } = await supabase
      .from('osteopath_status_history')
      .select('*')
      .eq('osteopath_id', osteopathId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Erreur récupération historique ostéopathe ${osteopathId}:`, error);
      throw new Error(`Impossible de récupérer l'historique: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Vérifier si un ostéopathe est en mode démo
   */
  async isInDemoMode(osteopathId: number): Promise<boolean> {
    const osteopath = await this.getOsteopathById(osteopathId);
    return osteopath?.status === 'demo';
  }

  /**
   * Vérifier si un ostéopathe est actif
   */
  async isActive(osteopathId: number): Promise<boolean> {
    const osteopath = await this.getOsteopathById(osteopathId);
    return osteopath?.status === 'active';
  }

  /**
   * Vérifier si un ostéopathe est bloqué
   */
  async isBlocked(osteopathId: number): Promise<boolean> {
    const osteopath = await this.getOsteopathById(osteopathId);
    return osteopath?.status === 'blocked';
  }
}

// ===========================================================================
// Hook React pour accéder au statut ostéopathe
// ===========================================================================

export const osteopathStatusService = new OsteopathStatusService();

/**
 * Hook pour récupérer le statut de l'ostéopathe connecté
 * Utilise le contexte Auth pour récupérer l'osteopathId
 */
export function useOsteopathStatus(osteopathId: number | null) {
  const [status, setStatus] = React.useState<OsteopathStatus>('demo');
  const [loading, setLoading] = React.useState(true);
  const [daysInDemo, setDaysInDemo] = React.useState<number>(0);

  React.useEffect(() => {
    if (!osteopathId) {
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      try {
        const osteopath = await osteopathStatusService.getOsteopathById(osteopathId);
        if (osteopath) {
          setStatus(osteopath.status);
          setDaysInDemo(osteopath.daysInDemo || 0);
        }
      } catch (error) {
        console.error('Erreur chargement statut ostéopathe:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [osteopathId]);

  return {
    status,
    loading,
    daysInDemo,
    isDemo: status === 'demo',
    isActive: status === 'active',
    isBlocked: status === 'blocked',
  };
}

// Note: Import React pour le hook
import React from 'react';
