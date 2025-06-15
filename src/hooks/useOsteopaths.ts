
import { useEffect, useState } from "react";
import { Osteopath } from "@/types";
import { api } from "@/services/api";

/**
 * Récupère la liste des ostéopathes.
 */
export function useOsteopaths() {
  const [osteopaths, setOsteopaths] = useState<Osteopath[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.getOsteopaths?.().then((data: Osteopath[]) => {
      if (isMounted) setOsteopaths(data || []);
    }).finally(() => setLoading(false));
    return () => { isMounted = false; };
  }, []);

  return { osteopaths, loading };
}
