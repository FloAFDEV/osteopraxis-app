import { useCallback, useEffect, useRef, useState } from 'react';

// Hook pour débouncer les recherches
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook pour l'intersection observer (lazy loading)
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      if (entry.isIntersecting && !hasIntersected) {
        setHasIntersected(true);
      }
    }, options);

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, options, hasIntersected]);

  return { isIntersecting, hasIntersected };
}

// Hook pour la virtualisation de listes
export function useVirtualization<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useCallback(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const { startIndex, endIndex } = visibleRange();

  const visibleItems = items.slice(startIndex, endIndex + 1).map((item, index) => ({
    item,
    index: startIndex + index,
    offsetTop: (startIndex + index) * itemHeight
  }));

  const totalHeight = items.length * itemHeight;

  return {
    visibleItems,
    totalHeight,
    scrollTop,
    setScrollTop,
    startIndex,
    endIndex
  };
}

// Hook pour throttler les événements
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(((...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      return callback(...args);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        lastCall.current = Date.now();
        callback(...args);
      }, delay - (now - lastCall.current));
    }
  }) as T, [callback, delay]);
}

// Hook pour mesurer les performances
export function usePerformanceMetrics(label: string) {
  const startTime = useRef<number>(0);
  const [metrics, setMetrics] = useState<{
    duration: number;
    memoryUsage?: number;
  } | null>(null);

  const start = useCallback(() => {
    startTime.current = performance.now();
  }, []);

  const end = useCallback(() => {
    const duration = performance.now() - startTime.current;
    const memoryUsage = (performance as any).memory?.usedJSHeapSize;
    
    setMetrics({ duration, memoryUsage });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Performance [${label}]:`, {
        duration: `${duration.toFixed(2)}ms`,
        memory: memoryUsage ? `${(memoryUsage / 1024 / 1024).toFixed(2)}MB` : 'N/A'
      });
    }
  }, [label]);

  return { start, end, metrics };
}

// Hook pour la pagination optimisée
export function useOptimizedPagination<T>(
  items: T[],
  pageSize: number = 20
) {
  const [currentPage, setCurrentPage] = useState(1);
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set([1]));

  const totalPages = Math.ceil(items.length / pageSize);

  const paginatedItems = useCallback(() => {
    const allLoadedItems: T[] = [];
    const sortedPages = Array.from(loadedPages).sort((a, b) => a - b);
    
    sortedPages.forEach(page => {
      const startIndex = (page - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, items.length);
      allLoadedItems.push(...items.slice(startIndex, endIndex));
    });
    
    return allLoadedItems;
  }, [items, pageSize, loadedPages]);

  const loadPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && !loadedPages.has(page)) {
      setLoadedPages(prev => new Set([...prev, page]));
    }
  }, [totalPages, loadedPages]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      loadPage(page);
    }
  }, [totalPages, loadPage]);

  const loadNextPages = useCallback((count: number = 2) => {
    for (let i = 1; i <= count; i++) {
      const nextPage = currentPage + i;
      if (nextPage <= totalPages) {
        loadPage(nextPage);
      }
    }
  }, [currentPage, totalPages, loadPage]);

  return {
    currentPage,
    totalPages,
    paginatedItems: paginatedItems(),
    goToPage,
    loadNextPages,
    loadedPages: Array.from(loadedPages),
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1
  };
}

// Hook pour la gestion d'état optimisée avec batch updates
export function useBatchedState<T>(initialState: T) {
  const [state, setState] = useState<T>(initialState);
  const batchRef = useRef<Partial<T>>({});
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const batchedSetState = useCallback((updates: Partial<T> | ((prev: T) => Partial<T>)) => {
    const updateObject = typeof updates === 'function' ? updates(state) : updates;
    
    Object.assign(batchRef.current, updateObject);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, ...batchRef.current }));
      batchRef.current = {};
    }, 0);
  }, [state]);

  const flushUpdates = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setState(prev => ({ ...prev, ...batchRef.current }));
    batchRef.current = {};
  }, []);

  return [state, batchedSetState, flushUpdates] as const;
}