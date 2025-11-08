/**
 * 🎮 useGamification - Hook de gestion des badges et progression
 * 
 * Trackage des actions utilisateur et déblocage de badges:
 * - Explorateur: 3 tentatives sur features bloquées
 * - Curieux: 3 fonctionnalités différentes testées
 * - Persévérant: 10 tentatives totales
 * - Déterminé: 20 tentatives totales
 */

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

interface GamificationStats {
  totalAttempts: number;
  featuresAttempted: string[];
  badges: Record<string, { unlocked: boolean; unlockedAt?: string }>;
}

const BADGE_DEFINITIONS: Omit<Badge, 'unlocked' | 'unlockedAt' | 'progress'>[] = [
  {
    id: 'explorer',
    name: 'Explorateur',
    description: '3 tentatives sur des fonctionnalités bloquées',
    icon: '🔍',
    maxProgress: 3,
  },
  {
    id: 'curious',
    name: 'Curieux',
    description: 'Testé 3 fonctionnalités différentes',
    icon: '🤔',
    maxProgress: 3,
  },
  {
    id: 'persistent',
    name: 'Persévérant',
    description: '10 tentatives d\'accès',
    icon: '💪',
    maxProgress: 10,
  },
  {
    id: 'determined',
    name: 'Déterminé',
    description: '20 tentatives d\'accès',
    icon: '🎯',
    maxProgress: 20,
  },
];

const STORAGE_KEY = 'gamification-stats';

export function useGamification() {
  const [stats, setStats] = useState<GamificationStats>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing gamification stats:', e);
      }
    }
    return {
      totalAttempts: 0,
      featuresAttempted: [],
      badges: {},
    };
  });

  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    // Calculer les badges avec progression
    const calculatedBadges: Badge[] = BADGE_DEFINITIONS.map(def => {
      let progress = 0;
      
      if (def.id === 'explorer') {
        progress = Math.min(stats.totalAttempts, def.maxProgress);
      } else if (def.id === 'curious') {
        progress = Math.min(stats.featuresAttempted.length, def.maxProgress);
      } else if (def.id === 'persistent') {
        progress = Math.min(stats.totalAttempts, def.maxProgress);
      } else if (def.id === 'determined') {
        progress = Math.min(stats.totalAttempts, def.maxProgress);
      }

      const isUnlocked = progress >= def.maxProgress;
      const savedBadge = stats.badges[def.id];

      return {
        ...def,
        progress,
        unlocked: isUnlocked,
        unlockedAt: savedBadge?.unlockedAt,
      };
    });

    setBadges(calculatedBadges);
  }, [stats]);

  const trackFeatureAttempt = (feature: string) => {
    setStats(prev => {
      const newStats = { ...prev };
      newStats.totalAttempts += 1;
      
      if (!newStats.featuresAttempted.includes(feature)) {
        newStats.featuresAttempted = [...newStats.featuresAttempted, feature];
      }

      // Vérifier les nouveaux badges débloqués
      const newlyUnlocked: Badge[] = [];
      
      BADGE_DEFINITIONS.forEach(def => {
        const wasUnlocked = prev.badges[def.id]?.unlocked;
        let shouldUnlock = false;

        if (def.id === 'explorer' && newStats.totalAttempts >= 3 && !wasUnlocked) {
          shouldUnlock = true;
        } else if (def.id === 'curious' && newStats.featuresAttempted.length >= 3 && !wasUnlocked) {
          shouldUnlock = true;
        } else if (def.id === 'persistent' && newStats.totalAttempts >= 10 && !wasUnlocked) {
          shouldUnlock = true;
        } else if (def.id === 'determined' && newStats.totalAttempts >= 20 && !wasUnlocked) {
          shouldUnlock = true;
        }

        if (shouldUnlock) {
          const unlockedAt = new Date().toISOString();
          newStats.badges[def.id] = { unlocked: true, unlockedAt };
          
          // Afficher notification
          toast.success(`🎉 Badge débloqué : ${def.name}`, {
            description: def.description,
            duration: 6000,
          });

          newlyUnlocked.push({
            ...def,
            unlocked: true,
            unlockedAt,
            progress: def.maxProgress,
          });
        }
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
      return newStats;
    });
  };

  const getUnlockedCount = () => {
    return badges.filter(b => b.unlocked).length;
  };

  const getProgress = () => {
    const total = badges.length;
    const unlocked = getUnlockedCount();
    return { unlocked, total, percentage: (unlocked / total) * 100 };
  };

  const resetProgress = () => {
    const resetStats: GamificationStats = {
      totalAttempts: 0,
      featuresAttempted: [],
      badges: {},
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resetStats));
    setStats(resetStats);
    toast.info('Progression des badges réinitialisée');
  };

  return {
    badges,
    stats,
    trackFeatureAttempt,
    getUnlockedCount,
    getProgress,
    resetProgress,
  };
}
