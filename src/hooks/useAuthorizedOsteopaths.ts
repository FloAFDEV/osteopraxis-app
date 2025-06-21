
import { useState, useEffect } from "react";
import { osteopathReplacementService, AuthorizedOsteopath } from "@/services/supabase-api/osteopath-replacement-service";

export function useAuthorizedOsteopaths() {
  const [osteopaths, setOsteopaths] = useState<AuthorizedOsteopath[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAuthorizedOsteopaths = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await osteopathReplacementService.getAuthorizedOsteopaths();
        setOsteopaths(data);
      } catch (err) {
        console.error("Erreur lors du chargement des ostéopathes autorisés:", err);
        setError("Erreur lors du chargement des ostéopathes autorisés");
        setOsteopaths([]);
      } finally {
        setLoading(false);
      }
    };

    loadAuthorizedOsteopaths();
  }, []);

  const reload = () => {
    loadAuthorizedOsteopaths();
  };

  return { osteopaths, loading, error, reload };
}
