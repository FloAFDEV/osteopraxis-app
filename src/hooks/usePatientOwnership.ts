
import { useState, useEffect } from "react";
import { osteopathCabinetService } from "@/services/supabase-api/osteopath-cabinet-service";
import { api } from "@/services/api";

export interface PatientOwnershipInfo {
  isOwnPatient: boolean;
  isCabinetPatient: boolean;
  loading: boolean;
}

export function usePatientOwnership(patientId: number): PatientOwnershipInfo {
  const [ownershipInfo, setOwnershipInfo] = useState<PatientOwnershipInfo>({
    isOwnPatient: false,
    isCabinetPatient: false,
    loading: true
  });

  useEffect(() => {
    const checkOwnership = async () => {
      try {
        // Récupérer l'ostéopathe actuel
        const currentOsteopath = await api.getCurrentOsteopath();
        if (!currentOsteopath || !currentOsteopath.id) {
          setOwnershipInfo({
            isOwnPatient: false,
            isCabinetPatient: false,
            loading: false
          });
          return;
        }

        // Vérifier si c'est un patient direct
        const isDirectlyOwned = await osteopathCabinetService.isPatientOwnedDirectly(
          patientId, 
          currentOsteopath.id
        );

        setOwnershipInfo({
          isOwnPatient: isDirectlyOwned,
          isCabinetPatient: !isDirectlyOwned, // Si pas directement possédé mais accessible, c'est via le cabinet
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

    if (patientId) {
      checkOwnership();
    }
  }, [patientId]);

  return ownershipInfo;
}
