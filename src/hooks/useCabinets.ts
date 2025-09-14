import { useQuery } from '@tanstack/react-query';
import { cabinetCache } from '@/services/cache/cabinet-cache';

/**
 * Hook simple pour récupérer les cabinets avec cache
 */
export function useCabinets() {
  const query = useQuery({
    queryKey: ['cabinets'],
    queryFn: () => cabinetCache.getCabinets(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  const invalidateAndRefetch = async () => {
    await cabinetCache.invalidateAndRefetch();
    query.refetch();
  };

  return {
    ...query,
    invalidateAndRefetch,
  };
}

export function useCabinetById(id: number) {
  return useQuery({
    queryKey: ['cabinet', id],
    queryFn: () => cabinetCache.getCabinetById(id),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
}