import { useState, useEffect } from "react";
import { PatientRelationship } from "@/types/patient-relationship";
import { api } from "@/services/api";

export function usePatientRelationships(patientId: number | undefined) {
  const [relationships, setRelationships] = useState<PatientRelationship[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) {
      setRelationships([]);
      return;
    }

    const loadRelationships = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getAllPatientRelationships(patientId);
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
  }, [patientId]);

  return { relationships, loading, error };
}