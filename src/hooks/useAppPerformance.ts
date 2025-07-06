import { useEffect, useState, useCallback } from 'react';

/**
 * Hook pour monitorer les performances de l'application
 * - Temps de rendu
 * - Memory usage
 * - Network timing
 * - Core Web Vitals
 */
export const useAppPerformance = () => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    fps: 0,
    isLowEndDevice: false
  });

  // Détection d'appareil low-end
  const detectLowEndDevice = useCallback(() => {
    if (!navigator.hardwareConcurrency) return false;
    
    const cores = navigator.hardwareConcurrency;
    const memory = (navigator as any).deviceMemory || 4;
    const connection = (navigator as any).connection;
    
    return cores <= 2 || memory <= 2 || connection?.effectiveType === '2g';
  }, []);

  // Mesure du temps de rendu
  const measureRenderTime = useCallback(() => {
    const start = performance.now();
    
    requestAnimationFrame(() => {
      const end = performance.now();
      setMetrics(prev => ({
        ...prev,
        renderTime: end - start
      }));
    });
  }, []);

  // Mesure de l'utilisation mémoire
  const measureMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memory.usedJSHeapSize / memory.jsHeapSizeLimit
      }));
    }
  }, []);

  // Mesure des FPS
  const measureFPS = useCallback(() => {
    let frames = 0;
    let lastTime = performance.now();
    
    const countFrames = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        setMetrics(prev => ({
          ...prev,
          fps: Math.round((frames * 1000) / (currentTime - lastTime))
        }));
        
        frames = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(countFrames);
    };
    
    requestAnimationFrame(countFrames);
  }, []);

  // Optimisations automatiques basées sur les performances
  const applyOptimizations = useCallback(() => {
    const { renderTime, memoryUsage, fps, isLowEndDevice } = metrics;
    
    const optimizations = {
      reduceAnimations: renderTime > 16 || fps < 30 || isLowEndDevice,
      simplifyUI: memoryUsage > 0.8 || isLowEndDevice,
      enableVirtualization: isLowEndDevice,
      reducePolling: isLowEndDevice,
      compressImages: isLowEndDevice
    };

    // Application automatique des optimisations
    if (optimizations.reduceAnimations) {
      document.documentElement.style.setProperty('--animation-duration', '0.1s');
    }

    if (optimizations.simplifyUI) {
      document.documentElement.classList.add('simplified-ui');
    }

    return optimizations;
  }, [metrics]);

  // Initialisation
  useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      isLowEndDevice: detectLowEndDevice()
    }));

    // Mesures périodiques
    const interval = setInterval(() => {
      measureRenderTime();
      measureMemoryUsage();
    }, 5000);

    // Mesure FPS continue
    measureFPS();

    return () => clearInterval(interval);
  }, [detectLowEndDevice, measureRenderTime, measureMemoryUsage, measureFPS]);

  // Application des optimisations quand les métriques changent
  useEffect(() => {
    const optimizations = applyOptimizations();
    
    // Log des recommandations
    if (process.env.NODE_ENV === 'development') {
      // Performance logs désactivés en production
    }
  }, [metrics, applyOptimizations]);

  return {
    metrics,
    optimizations: applyOptimizations(),
    refresh: () => {
      measureRenderTime();
      measureMemoryUsage();
    }
  };
};

export default useAppPerformance;