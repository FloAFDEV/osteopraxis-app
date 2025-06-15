
import { useEffect, useState } from "react";
import { Osteopath } from "@/types";
import { api } from "@/services/api";

/**
 * Hook personnalisé pour récupérer la liste des ostéopathes.
 */
export function useOsteopaths() {
  const [osteopaths, setOsteopaths] = useState<Osteopath[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    api.getOsteopaths?.()
      .then((data: Osteopath[]) => {
        if (isMounted) setOsteopaths(data || []);
      })
      .catch((err) => {
        setError("Erreur lors du chargement des ostéopathes");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  return { osteopaths, loading, error };
}
