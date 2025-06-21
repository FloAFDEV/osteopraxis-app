
import { useState, useEffect } from "react";
import { osteopathReplacementService, OsteopathReplacement } from "@/services/supabase-api/osteopath-replacement-service";

export function useOsteopathReplacements() {
  const [replacements, setReplacements] = useState<OsteopathReplacement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReplacements();
  }, []);

  const loadReplacements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await osteopathReplacementService.getMyReplacements();
      setReplacements(data);
    } catch (err) {
      console.error("Erreur lors du chargement des remplacements:", err);
      setError("Erreur lors du chargement des remplacements");
    } finally {
      setLoading(false);
    }
  };

  const createReplacement = async (replacement: Omit<OsteopathReplacement, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await osteopathReplacementService.createReplacement(replacement);
      await loadReplacements();
    } catch (err) {
      console.error("Erreur lors de la création du remplacement:", err);
      throw err;
    }
  };

  const updateReplacement = async (id: number, updates: Partial<OsteopathReplacement>) => {
    try {
      await osteopathReplacementService.updateReplacement(id, updates);
      await loadReplacements();
    } catch (err) {
      console.error("Erreur lors de la mise à jour du remplacement:", err);
      throw err;
    }
  };

  const deleteReplacement = async (id: number) => {
    try {
      await osteopathReplacementService.deleteReplacement(id);
      await loadReplacements();
    } catch (err) {
      console.error("Erreur lors de la suppression du remplacement:", err);
      throw err;
    }
  };

  const toggleReplacement = async (id: number, isActive: boolean) => {
    try {
      if (isActive) {
        await osteopathReplacementService.activateReplacement(id);
      } else {
        await osteopathReplacementService.deactivateReplacement(id);
      }
      await loadReplacements();
    } catch (err) {
      console.error("Erreur lors de la modification du statut:", err);
      throw err;
    }
  };

  return {
    replacements,
    loading,
    error,
    createReplacement,
    updateReplacement,
    deleteReplacement,
    toggleReplacement,
    reload: loadReplacements
  };
}
