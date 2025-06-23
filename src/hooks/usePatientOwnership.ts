
import { useState, useEffect } from "react";
import { osteopathCabinetService } from "@/services/supabase-api/osteopath-cabinet-service";
import { api } from "@/services/api";

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
    const checkOwnership = async () => {
      // VALIDATION STRICTE : arrêter immédiatement si l'ID est invalide
      if (!patientId || isNaN(patientId) || patientId <= 0 || patientId === null || patientId === undefined) {
        console.log("usePatientOwnership: ID patient invalide, arrêt immédiat:", patientId);
        setOwnershipInfo({
          isOwnPatient: false,
          isCabinetPatient: false,
          loading: false
        });
        return;
      }

      console.log("usePatientOwnership: Vérification de la propriété pour le patient:", patientId);

      try {
        const currentOsteopath = await api.getCurrentOsteopath();
        if (!currentOsteopath || !currentOsteopath.id) {
          setOwnershipInfo({
            isOwnPatient: false,
            isCabinetPatient: false,
            loading: false
          });
          return;
        }

        const isDirectlyOwned = await osteopathCabinetService.isPatientOwnedDirectly(
          patientId, 
          currentOsteopath.id
        );

        setOwnershipInfo({
          isOwnPatient: isDirectlyOwned,
          isCabinetPatient: !isDirectlyOwned,
          loading: false
        });
      } catch (error) {
        console.error("Erreur lors de la vérification de propriété du patient:", error);
        setOwnershipInfo({
          isOwnPatient: false,
          isCabinetPatient: false,
          loading: false
        });
      }
    };

    checkOwnership();
  }, [patientId]);

  return ownershipInfo;
}
