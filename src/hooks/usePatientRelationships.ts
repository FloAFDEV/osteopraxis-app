import { useState, useEffect } from "react";
import { PatientRelationship } from "@/types/patient-relationship";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

export function usePatientRelationships(patientId: number | string | undefined) {
  const { isDemoMode } = useAuth();
  const [relationships, setRelationships] = useState<PatientRelationship[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) {
      setRelationships([]);
      return;
    }

    // En mode démo, ne pas charger les relations (pas de données de démo pour les relations)
    if (isDemoMode) {
      setRelationships([]);
      setLoading(false);
      return;
    }

    const loadRelationships = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getAllPatientRelationships(patientId as number);
        setRelationships(data);
      } catch (err) {
        console.error("Erreur lors du chargement des relations:", err);
        setError("Impossible de charger les relations familiales");
        setRelationships([]);
      } finally {
        setLoading(false);
      }
    };

    loadRelationships();
  }, [patientId, isDemoMode]);

  return { relationships, loading, error };
}