import { useMemo, useCallback, useRef, useEffect } from 'react';
import { debounce } from 'lodash';

/**
 * Hooks d'optimisation du rendu pour éviter les re-renders inutiles
 */

// Hook pour stabiliser les références d'objets
export const useStableCallback = <T extends (...args: any[]) => any>(callback: T, deps: any[]): T => {
  const callbackRef = useRef<T>(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, deps);

  return useCallback((...args: any[]) => {
    return callbackRef.current(...args);
  }, []) as T;
};

// Hook pour mémoriser les objets complexes
export const useStableObject = <T extends object>(obj: T): T => {
  return useMemo(() => obj, [JSON.stringify(obj)]);
};

// Hook pour debouncer les valeurs
export const useDebouncedValue = <T>(value: T, delay: number = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

// Hook pour debouncer les callbacks
export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T => {
  return useMemo(
    () => debounce(callback, delay, { leading: false, trailing: true }),
    [callback, delay]
  ) as T;
};

// Hook pour throttler les callbacks
export const useThrottledCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 100
): T => {
  const lastRun = useRef<number>(Date.now());
  
  return useCallback((...args: any[]) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]) as T;
};

// Hook pour optimiser les listes virtualisées
export const useVirtualization = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleRange = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );
    
    return {
      start: Math.max(0, visibleStart - overscan),
      end: Math.min(items.length - 1, visibleEnd + overscan),
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);
  
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1).map((item, index) => ({
      item,
      index: visibleRange.start + index,
    }));
  }, [items, visibleRange]);
  
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
  };
};

// Hook pour optimiser les recherches
export const useOptimizedSearch = <T>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[],
  options: {
    debounceMs?: number;
    maxResults?: number;
    caseSensitive?: boolean;
  } = {}
) => {
  const {
    debounceMs = 300,
    maxResults = 50,
    caseSensitive = false,
  } = options;
  
  const debouncedSearchTerm = useDebouncedValue(searchTerm, debounceMs);
  
  const filteredItems = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return items.slice(0, maxResults);
    }
    
    const searchLower = caseSensitive ? debouncedSearchTerm : debouncedSearchTerm.toLowerCase();
    
    return items
      .filter(item => {
        return searchFields.some(field => {
          const fieldValue = item[field];
          if (typeof fieldValue === 'string') {
            const value = caseSensitive ? fieldValue : fieldValue.toLowerCase();
            return value.includes(searchLower);
          }
          return false;
        });
      })
      .slice(0, maxResults);
  }, [items, debouncedSearchTerm, searchFields, maxResults, caseSensitive]);
  
  return {
    filteredItems,
    isSearching: searchTerm !== debouncedSearchTerm,
  };
};

// Hook pour la mémorisation intelligente des composants
export const useIntelligentMemo = <T>(
  factory: () => T,
  deps: any[],
  options: {
    deep?: boolean;
    maxAge?: number;
  } = {}
): T => {
  const { deep = false, maxAge = 5 * 60 * 1000 } = options; // 5 minutes par défaut
  const cacheRef = useRef<{ value: T; timestamp: number; deps: any[] } | null>(null);
  
  return useMemo(() => {
    const now = Date.now();
    const cache = cacheRef.current;
    
    // Vérifier si le cache est encore valide
    if (cache && (now - cache.timestamp) < maxAge) {
      // Comparer les dépendances
      const depsEqual = deep 
        ? JSON.stringify(cache.deps) === JSON.stringify(deps)
        : cache.deps.every((dep, index) => dep === deps[index]) && cache.deps.length === deps.length;
      
      if (depsEqual) {
        return cache.value;
      }
    }
    
    // Calculer la nouvelle valeur
    const value = factory();
    cacheRef.current = { value, timestamp: now, deps: [...deps] };
    
    return value;
  }, deps);
};

// Import useState manqué
import { useState } from 'react';