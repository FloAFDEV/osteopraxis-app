
import { useEffect, useState } from "react";
import { Cabinet } from "@/types";
import { api } from "@/services/api";

/**
 * Hook personnalisé pour récupérer les cabinets selon un ostéopathe sélectionné.
 */
export function useCabinetsByOsteopath(osteopathId?: number) {
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!osteopathId) {
      setCabinets([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);

    api.getCabinetsByOsteopathId(osteopathId)
      .then((cabs) => setCabinets(cabs ?? []))
      .catch(() => setError("Erreur lors du chargement des cabinets"))
      .finally(() => setLoading(false));
  }, [osteopathId]);

  return { cabinets, loading, error };
}
