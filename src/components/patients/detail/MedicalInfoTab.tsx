
import React from 'react';
import PatientForm from "@/components/patient-form";
import { Patient } from "@/types";

interface MedicalInfoTabProps {
  patient: Patient;
  onSave: (data: Partial<Patient>) => Promise<void>;
  isLoading?: boolean;
}

export const MedicalInfoTab = ({ patient, onSave, isLoading }: MedicalInfoTabProps) => {
  return (
    <div className="space-y-6">
      <PatientForm
        patient={patient}
        onSubmit={onSave}
        onCancel={() => {}}
        isLoading={isLoading}
      />
    </div>
  );
};
