import { useState, useEffect, useCallback } from 'react';
import { systemCleaner, CleanupTask, SystemCleanupOptions } from '@/services/optimization/system-cleaner';
import { useAppPerformance } from './useAppPerformance';

interface SystemOptimizationState {
  isOptimizing: boolean;
  lastOptimization?: Date;
  tasks: CleanupTask[];
  autoOptimizationEnabled: boolean;
}

export function useSystemOptimization() {
  const { metrics, optimizations } = useAppPerformance();
  const [state, setState] = useState<SystemOptimizationState>({
    isOptimizing: false,
    tasks: [],
    autoOptimizationEnabled: true
  });

  useEffect(() => {
    // Load initial tasks
    setState(prev => ({
      ...prev,
      tasks: systemCleaner.getTasks()
    }));

    // Start automatic cleanup if enabled
    if (state.autoOptimizationEnabled) {
      systemCleaner.scheduleAutomaticCleanup();
    }
  }, []);

  const runOptimization = useCallback(async (options: SystemCleanupOptions = {}) => {
    setState(prev => ({ ...prev, isOptimizing: true }));

    try {
      await systemCleaner.runCleanup(options);
      setState(prev => ({
        ...prev,
        lastOptimization: new Date(),
        tasks: systemCleaner.getTasks()
      }));
    } catch (error) {
      console.error('System optimization failed:', error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, isOptimizing: false }));
    }
  }, []);

  const runTask = useCallback(async (taskId: string) => {
    setState(prev => ({ ...prev, isOptimizing: true }));

    try {
      await systemCleaner.runTask(taskId);
      setState(prev => ({
        ...prev,
        tasks: systemCleaner.getTasks()
      }));
    } catch (error) {
      console.error(`Task ${taskId} failed:`, error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, isOptimizing: false }));
    }
  }, []);

  const getRecommendations = useCallback(() => {
    const recommendations: string[] = [];

    if (metrics.memoryUsage > 0.8) {
      recommendations.push('Clear browser cache to free memory');
    }

    if (metrics.renderTime > 16) {
      recommendations.push('Enable performance optimizations');
    }

    if (metrics.fps < 30) {
      recommendations.push('Reduce animations and visual effects');
    }

    if (optimizations.enableVirtualization) {
      recommendations.push('Enable list virtualization for large datasets');
    }

    return recommendations;
  }, [metrics, optimizations]);

  const getSystemHealth = useCallback(() => {
    const health = {
      overall: 'good' as 'good' | 'warning' | 'critical',
      issues: [] as string[]
    };

    if (metrics.memoryUsage > 0.9) {
      health.overall = 'critical';
      health.issues.push('Critical memory usage');
    } else if (metrics.memoryUsage > 0.7) {
      health.overall = 'warning';
      health.issues.push('High memory usage');
    }

    if (metrics.fps < 20) {
      health.overall = 'critical';
      health.issues.push('Poor frame rate performance');
    } else if (metrics.fps < 45) {
      health.overall = 'warning';
      health.issues.push('Reduced frame rate');
    }

    if (metrics.renderTime > 32) {
      health.overall = 'critical';
      health.issues.push('Slow rendering performance');
    } else if (metrics.renderTime > 16) {
      health.overall = 'warning';
      health.issues.push('Slower than optimal rendering');
    }

    return health;
  }, [metrics]);

  const enableAutoOptimization = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, autoOptimizationEnabled: enabled }));
    
    if (enabled) {
      systemCleaner.scheduleAutomaticCleanup();
    }
  }, []);

  return {
    ...state,
    metrics,
    optimizations,
    runOptimization,
    runTask,
    getRecommendations,
    getSystemHealth,
    enableAutoOptimization
  };
}