
import React from "react";
import { Patient } from "@/types";
import { PatientFormValues } from "@/components/patient-form/types";
import { MedicalAccordion } from "./MedicalAccordion";
import { GroupedMedicalSections } from "./GroupedMedicalSections";
import { ClinicalSections } from "./ClinicalSections";
import { SpecializedSphereSections } from "./SpecializedSphereSections";

export interface MedicalInfoTabProps {
  patient: Patient;
  onPatientUpdated: (updatedData: PatientFormValues) => Promise<void>;
  selectedCabinetId?: number | null;
  isLoading?: boolean;
}

export const MedicalInfoTab: React.FC<MedicalInfoTabProps> = ({
  patient,
  onPatientUpdated,
  selectedCabinetId,
  isLoading = false
}) => {
  return (
    <div className="space-y-6">
      {/* Antécédents médicaux groupés */}
      <GroupedMedicalSections 
        patient={patient}
        onPatientUpdated={onPatientUpdated}
        isLoading={isLoading}
      />

      {/* Sections cliniques */}
      <ClinicalSections 
        patient={patient}
        onPatientUpdated={onPatientUpdated}
        isLoading={isLoading}
      />

      {/* Sphères spécialisées */}
      <SpecializedSphereSections 
        patient={patient}
        onPatientUpdated={onPatientUpdated}
        isLoading={isLoading}
      />

      {/* Accordion médical détaillé */}
      <MedicalAccordion 
        patient={patient}
        onPatientUpdated={onPatientUpdated}
        selectedCabinetId={selectedCabinetId}
        isLoading={isLoading}
      />
    </div>
  );
};
