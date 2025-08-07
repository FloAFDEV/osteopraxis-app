
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AuthorizedOsteopath {
  id: number;
  name: string;
  professional_title: string;
  rpps_number: string;
  siret: string;
  access_type: 'self' | 'replacement' | 'cabinet_colleague';
}

export function useAuthorizedOsteopaths() {
  const [osteopaths, setOsteopaths] = useState<AuthorizedOsteopath[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAuthorizedOsteopaths();
  }, []);

  const loadAuthorizedOsteopaths = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // No authenticated user
        setOsteopaths([]);
        return;
      }

      // ✅ Chargement ostéopathes autorisés

      // Utiliser la fonction de base de données pour récupérer les ostéopathes autorisés
      const { data, error } = await supabase.rpc('get_authorized_osteopaths', {
        current_osteopath_auth_id: user.id
      });

      if (error) {
        console.error("Erreur lors de la récupération des ostéopathes autorisés:", error);
        throw error;
      }

      // ✅ Ostéopathes autorisés chargés
      
      // Transformer les données pour s'assurer que le type access_type est correct
      const transformedData: AuthorizedOsteopath[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        professional_title: item.professional_title || '',
        rpps_number: item.rpps_number || '',
        siret: item.siret || '',
        access_type: item.access_type as 'self' | 'replacement' | 'cabinet_colleague'
      }));
      
      setOsteopaths(transformedData);
    } catch (err) {
      console.error("Erreur lors du chargement des ostéopathes autorisés:", err);
      setError("Erreur lors du chargement des ostéopathes autorisés");
    } finally {
      setLoading(false);
    }
  };

  return {
    osteopaths,
    loading,
    error,
    reload: loadAuthorizedOsteopaths
  };
}
