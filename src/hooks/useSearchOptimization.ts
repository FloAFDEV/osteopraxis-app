import { useMemo, useState, useCallback } from 'react';
import Fuse from 'fuse.js';

/**
 * Hook pour optimiser les recherches avec Fuse.js
 * - Recherche floue performante
 * - Cache des résultats
 * - Debouncing automatique
 */
export const useSearchOptimization = <T>(
  data: T[],
  searchKeys: string[],
  options: {
    threshold?: number;
    debounceMs?: number;
    maxResults?: number;
  } = {}
) => {
  const {
    threshold = 0.3,
    debounceMs = 300,
    maxResults = 50
  } = options;

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Configuration Fuse.js optimisée
  const fuseOptions = useMemo(() => ({
    keys: searchKeys,
    threshold,
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2,
    shouldSort: true,
    getFn: (obj: any, path: string) => {
      const value = path.split('.').reduce((o, key) => o?.[key], obj);
      return value?.toString() || '';
    }
  }), [searchKeys, threshold]);

  // Instance Fuse.js mémorisée
  const fuse = useMemo(() => {
    if (!data?.length) return null;
    return new Fuse(data, fuseOptions);
  }, [data, fuseOptions]);

  // Debouncing de la query
  useMemo(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchQuery, debounceMs]);

  // Résultats de recherche optimisés
  const searchResults = useMemo(() => {
    if (!fuse || !debouncedQuery.trim()) {
      return data;
    }

    const results = fuse.search(debouncedQuery, { limit: maxResults });
    return results.map(result => ({
      item: result.item,
      score: result.score,
      matches: result.matches
    }));
  }, [fuse, debouncedQuery, data, maxResults]);

  // Méthodes utilitaires
  const updateSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
  }, []);

  const highlightMatches = useCallback((text: string, matches: any[]) => {
    if (!matches?.length) return text;
    
    // Simple highlighting - peut être amélioré
    let highlightedText = text;
    matches.forEach(match => {
      const { value, indices } = match;
      indices.forEach(([start, end]: [number, number]) => {
        const matchedText = value.substring(start, end + 1);
        highlightedText = highlightedText.replace(
          matchedText,
          `<mark>${matchedText}</mark>`
        );
      });
    });
    
    return highlightedText;
  }, []);

  return {
    searchQuery,
    debouncedQuery,
    searchResults: searchResults.map(r => r.item) || data,
    searchResultsWithMeta: searchResults,
    updateSearch,
    clearSearch,
    highlightMatches,
    isSearching: searchQuery !== debouncedQuery,
    hasResults: searchResults.length > 0,
    isEmpty: !data?.length
  };
};

export default useSearchOptimization;