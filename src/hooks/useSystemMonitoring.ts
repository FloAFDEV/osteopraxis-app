import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SecurityMetric {
  metric_name: string;
  status: string;
  details: string;
  critical: boolean;
}

interface SystemMetric {
  id: string;
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  recorded_at: string;
  metadata: any;
}

export function useSystemMonitoring() {
  const [securityHealth, setSecurityHealth] = useState<SecurityMetric[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkSecurityHealth = async () => {
    try {
      const { data, error } = await supabase.rpc('security_health_check');
      
      if (error) {
        console.error('Erreur lors de la vérification de sécurité:', error);
        setError(error.message);
        return;
      }

      setSecurityHealth(data || []);
    } catch (err) {
      console.error('Erreur lors de la vérification de sécurité:', err);
      setError('Erreur lors de la vérification de sécurité');
    }
  };

  const getSystemMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('system_metrics')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(100);
      
      if (error) {
        console.error('Erreur lors de la récupération des métriques:', error);
        setError(error.message);
        return;
      }

      setSystemMetrics(data || []);
    } catch (err) {
      console.error('Erreur lors de la récupération des métriques:', err);
      setError('Erreur lors de la récupération des métriques');
    }
  };

  const optimizeSystem = async () => {
    try {
      const { data, error } = await supabase.rpc('auto_optimize_system');
      
      if (error) {
        console.error('Erreur lors de l\'optimisation:', error);
        return { success: false, error: error.message };
      }

      return { success: true, optimizations: data };
    } catch (err) {
      console.error('Erreur lors de l\'optimisation:', err);
      return { success: false, error: 'Erreur lors de l\'optimisation' };
    }
  };

  const recordMetric = async (name: string, value: number, unit = '', metadata = {}) => {
    try {
      const { error } = await supabase.rpc('record_metric', {
        p_name: name,
        p_value: value,
        p_unit: unit,
        p_metadata: metadata
      });
      
      if (error) {
        console.error('Erreur lors de l\'enregistrement de la métrique:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement de la métrique:', err);
      return false;
    }
  };

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    
    await Promise.all([
      checkSecurityHealth(),
      getSystemMetrics()
    ]);
    
    setLoading(false);
  };

  useEffect(() => {
    refreshData();

    // Actualiser les données toutes les 30 secondes
    const interval = setInterval(refreshData, 30000);

    return () => clearInterval(interval);
  }, []);

  // Calculer les statistiques des métriques
  const getMetricStats = (metricName: string) => {
    const metrics = systemMetrics.filter(m => m.metric_name === metricName);
    if (metrics.length === 0) return null;

    const values = metrics.map(m => m.metric_value);
    const current = values[0];
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    return { current, average, max, min, count: values.length };
  };

  // Détecter les problèmes critiques
  const hasCriticalIssues = securityHealth.some(metric => metric.critical);
  const hasWarnings = securityHealth.some(metric => metric.status === 'WARNING');

  return {
    securityHealth,
    systemMetrics,
    loading,
    error,
    checkSecurityHealth,
    getSystemMetrics,
    optimizeSystem,
    recordMetric,
    refreshData,
    getMetricStats,
    hasCriticalIssues,
    hasWarnings
  };
}