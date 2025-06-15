
import { useEffect, useState } from "react";
import { Cabinet } from "@/types";
import { api } from "@/services/api";

/**
 * Récupère les cabinets selon un ostéopathe.
 */
export function useCabinetsByOsteopath(osteopathId?: number) {
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!osteopathId) {
      setCabinets([]);
      return;
    }
    setLoading(true);
    api.getCabinetsByOsteopathId(osteopathId)
      .then((cabs) => setCabinets(cabs ?? []))
      .finally(() => setLoading(false));
  }, [osteopathId]);

  return { cabinets, loading };
}
