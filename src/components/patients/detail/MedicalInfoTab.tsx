
import React from "react";
import PatientForm from "@/components/patient-form";
import { Patient } from "@/types";

interface PatientFormValues {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  // Add other form fields as needed
}

interface MedicalInfoTabProps {
  patient: Patient;
  onPatientUpdated: (updatedData: PatientFormValues) => Promise<void>;
  isLoading: boolean;
}

export function MedicalInfoTab({ patient, onPatientUpdated, isLoading }: MedicalInfoTabProps) {
  const handlePatientUpdate = async () => {
    // Refresh patient data after update
    await onPatientUpdated({});
  };

  return (
    <div className="space-y-6">
      <PatientForm 
        patient={patient} 
        onSuccess={handlePatientUpdate}
      />
    </div>
  );
}
