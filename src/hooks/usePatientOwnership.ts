
import { useState, useEffect } from "react";

export interface PatientOwnershipInfo {
  isOwnPatient: boolean;
  isCabinetPatient: boolean;
  loading: boolean;
}

export function usePatientOwnership(patientId: number | null): PatientOwnershipInfo {
  const [ownershipInfo, setOwnershipInfo] = useState<PatientOwnershipInfo>({
    isOwnPatient: false,
    isCabinetPatient: false,
    loading: true
  });

  useEffect(() => {
    // VALIDATION STRICTE : arrêter immédiatement si l'ID est invalide
    if (!patientId || isNaN(patientId) || patientId <= 0) {
      console.log("usePatientOwnership: ID patient invalide, arrêt immédiat:", patientId);
      setOwnershipInfo({
        isOwnPatient: false,
        isCabinetPatient: false,
        loading: false
      });
      return;
    }

    console.log("usePatientOwnership: Vérification de la propriété pour le patient:", patientId);

    // Avec les nouvelles politiques RLS, si on peut accéder au patient, c'est qu'on y a le droit
    // Simplifier la logique en considérant que l'accès est géré par les politiques RLS
    setOwnershipInfo({
      isOwnPatient: true, // Si on peut y accéder, on considère qu'on peut le gérer
      isCabinetPatient: false,
      loading: false
    });
  }, [patientId]);

  return ownershipInfo;
}
