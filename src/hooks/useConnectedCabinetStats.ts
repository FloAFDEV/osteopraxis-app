/**
 * 🏢 Hook pour statistiques des cabinets en mode connecté UNIQUEMENT
 * 
 * Récupère les cabinets depuis Supabase avec multi-tenant RLS
 * Complètement séparé du mode démo
 */

import { useState, useEffect, useCallback } from 'react';
import { Cabinet } from '@/types';
import { isDemoSession } from '@/utils/demo-detection';
import { useAuth } from '@/contexts/AuthContext';

interface CabinetStats {
  totalCabinets: number;
  ownedCabinets: number;
  associatedCabinets: number;
  cabinets: Cabinet[];
  loading: boolean;
  error: string | null;
}

export const useConnectedCabinetStats = (): CabinetStats => {
  const { user } = useAuth();
  const [stats, setStats] = useState<CabinetStats>({
    totalCabinets: 0,
    ownedCabinets: 0,
    associatedCabinets: 0,
    cabinets: [],
    loading: true,
    error: null
  });

  const loadCabinetStats = useCallback(async () => {
    try {
      // Vérification de sécurité : JAMAIS en mode démo
      const isDemoMode = await isDemoSession();
      if (isDemoMode) {
        console.log('🎭 Mode démo détecté - Hook cabinet connecté ignoré');
        setStats(prev => ({ ...prev, loading: false }));
        return;
      }

      if (!user?.osteopathId) {
        console.log('👤 Pas d\'ostéopathe connecté');
        setStats(prev => ({ ...prev, loading: false }));
        return;
      }

      console.log('🔍 Chargement des cabinets pour ostéopathe connecté:', user.osteopathId);

      // Utiliser le service cabinet qui gère déjà la logique multi-tenant
      const { cabinetService } = await import('@/services/api/cabinet-service');
      const cabinets = await cabinetService.getCabinetsByOsteopathId(user.osteopathId);

      // Calculer les statistiques
      const ownedCabinets = cabinets.filter(cabinet => cabinet.osteopathId === user.osteopathId);
      const associatedCabinets = cabinets.filter(cabinet => cabinet.osteopathId !== user.osteopathId);

      const newStats: CabinetStats = {
        totalCabinets: cabinets.length,
        ownedCabinets: ownedCabinets.length,
        associatedCabinets: associatedCabinets.length,
        cabinets: cabinets,
        loading: false,
        error: null
      };

      console.log('📊 Statistiques cabinets connectés:', newStats);
      setStats(newStats);

    } catch (error) {
      console.error('❌ Erreur chargement cabinets connectés:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }));
    }
  }, [user?.osteopathId]);

  useEffect(() => {
    loadCabinetStats();
  }, [loadCabinetStats]);

  return stats;
};