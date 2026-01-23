
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isDemoSession } from "@/utils/demo-detection";
import { DemoStorage } from "@/services/demo-storage";

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

      // Vérifier si on est en mode démo
      const isDemo = await isDemoSession();

      if (isDemo) {
        // Mode démo : charger depuis localStorage
        const demoCabinetId = localStorage.getItem('demo_cabinet_id');
        console.log('🔍 [useAuthorizedOsteopaths] Mode démo, cabinetId:', demoCabinetId);

        if (demoCabinetId) {
          const demoOsteopath = DemoStorage.get<any>(demoCabinetId, 'osteopath');
          console.log('👤 [useAuthorizedOsteopaths] Ostéopathe démo chargé:', demoOsteopath);

          if (demoOsteopath) {
            const transformedData: AuthorizedOsteopath[] = [{
              id: demoOsteopath.id || demoOsteopath.userId,
              name: demoOsteopath.name,
              professional_title: demoOsteopath.professional_title || '',
              rpps_number: demoOsteopath.rpps_number || '',
              siret: demoOsteopath.siret || '',
              access_type: 'self' as const
            }];
            setOsteopaths(transformedData);
            return;
          }
        }

        console.warn('⚠️ [useAuthorizedOsteopaths] Aucune donnée démo trouvée');
        setOsteopaths([]);
        return;
      }

      // Mode connecté : utiliser Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setOsteopaths([]);
        return;
      }

      const { data, error } = await supabase.rpc('get_authorized_osteopaths', {
        current_osteopath_auth_id: user.id
      });

      if (error) {
        console.error("Erreur lors de la récupération des ostéopathes autorisés:", error);
        throw error;
      }

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
