/**
 * 📊 useUsageMetrics - Métriques d'utilisation professionnelles
 * 
 * Analyse de l'adoption des fonctionnalités pour les ostéopathes:
 * - Tracking des tentatives d'accès aux features
 * - Identification des besoins métier non couverts
 * - Données pour optimiser le choix de plan
 */

import { useState, useEffect } from 'react';

export interface UsageMetric {
  feature: string;
  featureName: string;
  attemptCount: number;
  lastAttempt: string;
  category: 'appointments' | 'invoices' | 'schedule' | 'team' | 'analytics';
}

interface UsageStats {
  totalAttempts: number;
  featuresAttempted: Record<string, { count: number; lastAttempt: string }>;
  firstAttemptDate: string | null;
}

const FEATURE_METADATA = {
  appointments: { 
    name: 'Gestion des rendez-vous',
    category: 'appointments' as const
  },
  invoices: { 
    name: 'Facturation',
    category: 'invoices' as const
  },
  schedule: { 
    name: 'Planning hebdomadaire',
    category: 'schedule' as const
  },
  team: { 
    name: 'Gestion d\'équipe',
    category: 'team' as const
  },
  analytics: { 
    name: 'Analytics avancées',
    category: 'analytics' as const
  }
};

const STORAGE_KEY = 'usage-metrics';

export function useUsageMetrics() {
  const [stats, setStats] = useState<UsageStats>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Erreur lors du chargement des métriques:', e);
      }
    }
    return {
      totalAttempts: 0,
      featuresAttempted: {},
      firstAttemptDate: null,
    };
  });

  const trackFeatureAttempt = (feature: string) => {
    setStats(prev => {
      const now = new Date().toISOString();
      const newStats = { ...prev };
      newStats.totalAttempts += 1;
      
      if (!newStats.firstAttemptDate) {
        newStats.firstAttemptDate = now;
      }
      
      if (!newStats.featuresAttempted[feature]) {
        newStats.featuresAttempted[feature] = { count: 0, lastAttempt: now };
      }
      
      newStats.featuresAttempted[feature].count += 1;
      newStats.featuresAttempted[feature].lastAttempt = now;

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
      return newStats;
    });
  };

  const getMetrics = (): UsageMetric[] => {
    return Object.entries(stats.featuresAttempted).map(([feature, data]) => {
      const metadata = FEATURE_METADATA[feature as keyof typeof FEATURE_METADATA];
      return {
        feature,
        featureName: metadata?.name || feature,
        attemptCount: data.count,
        lastAttempt: data.lastAttempt,
        category: metadata?.category || 'appointments'
      };
    }).sort((a, b) => b.attemptCount - a.attemptCount);
  };

  const getMostRequestedFeature = (): UsageMetric | null => {
    const metrics = getMetrics();
    return metrics.length > 0 ? metrics[0] : null;
  };

  const getUniqueFeatureCount = (): number => {
    return Object.keys(stats.featuresAttempted).length;
  };

  const resetMetrics = () => {
    const resetStats: UsageStats = {
      totalAttempts: 0,
      featuresAttempted: {},
      firstAttemptDate: null,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resetStats));
    setStats(resetStats);
  };

  return {
    stats,
    trackFeatureAttempt,
    getMetrics,
    getMostRequestedFeature,
    getUniqueFeatureCount,
    resetMetrics,
  };
}
